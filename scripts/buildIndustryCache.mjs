import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'public', 'cache', 'industry');
const keywordsFile = path.join(rootDir, 'src', 'data', 'industry-keywords.json');
const authFile = path.join(rootDir, 'src', 'services', 'auth.ts');

const baseUrl = process.env.WF_API_BASE_URL ?? 'http://119.36.242.222:8902';
const pageSize = Number(process.env.INDUSTRY_CACHE_PAGE_SIZE ?? 100);
const requestIntervalMs = Number(process.env.INDUSTRY_CACHE_INTERVAL_MS ?? 180);
const maxRetries = Number(process.env.INDUSTRY_CACHE_MAX_RETRIES ?? 3);
const force = process.argv.includes('--force');
const chainArg = process.argv.find((arg) => arg.startsWith('--chain='))?.slice('--chain='.length);
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.slice('--limit='.length);
const nodeLimit = limitArg ? Number(limitArg) : 0;
const selectedChains = chainArg ? new Set(chainArg.split(',').map((item) => item.trim()).filter(Boolean)) : null;

const chainKeyToLabel = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
};

const chainKeyToSearchKey = {
  wetchem: '电子化学品 OR 半导体材料 OR 湿电子化学品',
  newenergy: '新能源 OR 新材料 OR 电池 OR 储能',
  pharma: '制药 OR 仿制药 OR 生物医药 OR 药物制剂',
  yeast: '酵母 OR 发酵 OR 生物工程 OR 功能食品',
  ship: '船舶 OR 造船 OR 航运 OR 智能船舶',
  ai: '人工智能',
};

const localCity = '宜昌';
const cacheVersion = '2026-04-industry-cache-v1';
let lastRequestAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(targetDir) {
  await mkdir(targetDir, { recursive: true });
}

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(targetPath) {
  const content = await readFile(targetPath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(targetPath, data) {
  await ensureDir(path.dirname(targetPath));
  await writeFile(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function log(message) {
  console.log(`[industry-cache] ${message}`);
}

function normalizeCityName(value) {
  return String(value ?? '').replace(/市/g, '').trim();
}

function isYichangOrg(item) {
  const city = normalizeCityName(item.CITY);
  return city === localCity || city.includes(localCity);
}

function getOrgUniqueKey(item) {
  const id = String(item.ID ?? item.ORGID ?? item.UID ?? '').trim();
  if (id) return `id:${id}`;

  const name = String(item.NAME ?? '').trim();
  const prov = String(item.PROV ?? '').trim();
  const city = String(item.CITY ?? '').trim();
  return `name:${name}|${prov}|${city}`;
}

function getExpertUniqueKey(item) {
  const id = String(item.AUID ?? item.ID ?? item.UID ?? '').trim();
  if (id) return `id:${id}`;

  const name = String(item.CNAME ?? '').trim();
  const org = String(item.AORG ?? '').trim();
  return `name:${name}|${org}`;
}

function dedupeItems(items, getKey) {
  const uniqueItems = new Map();

  for (const item of items) {
    const key = getKey(item);
    if (!key || uniqueItems.has(key)) continue;
    uniqueItems.set(key, item);
  }

  return Array.from(uniqueItems.values());
}

function getNodeStatus(orgCount) {
  if (orgCount === 0) return 'missing';
  if (orgCount <= 20) return 'weak';
  return 'strong';
}

function getNodeId(chainKey, nodeName) {
  return createHash('sha1').update(`${chainKey}:${nodeName}`, 'utf8').digest('hex').slice(0, 12);
}

function splitQueryTerms(queryString) {
  return queryString
    .split(/\s+OR\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function throttle() {
  const now = Date.now();
  const waitMs = Math.max(0, lastRequestAt + requestIntervalMs - now);
  if (waitMs > 0) {
    await sleep(waitMs);
  }
  lastRequestAt = Date.now();
}

async function fetchJson(url, options, label) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    await throttle();

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`${label} failed with HTTP ${response.status}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) break;
      const retryDelay = requestIntervalMs * attempt * 3;
      log(`${label} 第 ${attempt} 次失败，${retryDelay}ms 后重试`);
      await sleep(retryDelay);
    }
  }

  throw lastError;
}

async function loadIndustryKeywords() {
  return readJson(keywordsFile);
}

async function readApiCredentials() {
  const source = await readFile(authFile, 'utf8');
  const username = source.match(/const API_USERNAME = '([^']+)'/)?.[1];
  const secret = source.match(/const API_SECRET = '([^']+)'/)?.[1];

  if (!username || !secret) {
    throw new Error('无法从 auth.ts 中解析 API 凭证');
  }

  return { username, secret };
}

async function getAccessToken() {
  const { username, secret } = await readApiCredentials();
  const payload = JSON.stringify({ username, secret });
  const result = await fetchJson(
    `${baseUrl}/auth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    },
    'auth/token',
  );

  const token = result.accessToken ?? result.token;
  if (!token) {
    throw new Error('登录成功但未返回 token');
  }

  return token;
}

function buildOrgUrl(queryString, from, size) {
  const firstKeyword = queryString.split(/\s+OR\s+/)[0]?.trim() ?? queryString;
  return `${baseUrl}/api/wf/findOrgByModelsDecode-v1`
    + `?text=${encodeURIComponent(firstKeyword)}`
    + `&queryString=${encodeURIComponent(queryString)}`
    + `&from=${from}`
    + `&recommendOrgSize=${size}`
    + '&model=1';
}

function buildExpertUrl(queryString, from, size, city) {
  let url = `${baseUrl}/api/wf/findExpert-v2`
    + `?key=${encodeURIComponent(queryString)}`
    + `&from=${from}`
    + `&size=${size}`;

  if (city) {
    url += `&city=${encodeURIComponent(city)}`;
  }

  return url;
}

async function fetchOrgPage(token, queryString, from) {
  return fetchJson(
    buildOrgUrl(queryString, from, pageSize),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    `orgs:${queryString}:${from}`,
  );
}

async function fetchExpertPage(token, queryString, from, city) {
  const scopeLabel = city ? `${city}:experts` : 'experts';
  return fetchJson(
    buildExpertUrl(queryString, from, pageSize, city),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    `${scopeLabel}:${queryString}:${from}`,
  );
}

function extractOrgItems(result) {
  return Array.isArray(result?.data?.orgRecommend) ? result.data.orgRecommend : [];
}

function extractExpertItems(result) {
  return Array.isArray(result?.data?.expertsRecommend) ? result.data.expertsRecommend : [];
}

function extractTotal(result) {
  return Number(result?.data?.total ?? 0);
}

async function fetchAllPages(fetchPage, getItems, label) {
  const firstPage = await fetchPage(0);
  const total = extractTotal(firstPage);
  const items = [...getItems(firstPage)];

  log(`${label} 首屏 ${items.length}/${total}`);

  for (let from = items.length; from < total; from += pageSize) {
    const page = await fetchPage(from);
    const pageItems = getItems(page);
    items.push(...pageItems);
    log(`${label} 已拉取 ${Math.min(items.length, total)}/${total}`);
  }

  return {
    total,
    items: items.slice(0, total),
  };
}

const queryResultCache = new Map();

async function fetchNodeScopes(token, queryString) {
  if (queryResultCache.has(queryString)) {
    return queryResultCache.get(queryString);
  }

  const task = (async () => {
    const nationalOrgs = await fetchAllPages(
      (from) => fetchOrgPage(token, queryString, from),
      extractOrgItems,
      `全国企业 ${queryString}`,
    );

    const nationalExperts = await fetchAllPages(
      (from) => fetchExpertPage(token, queryString, from),
      extractExpertItems,
      `全国人才 ${queryString}`,
    );

    const yichangExperts = await fetchAllPages(
      (from) => fetchExpertPage(token, queryString, from, localCity),
      extractExpertItems,
      `宜昌人才 ${queryString}`,
    );

    const yichangOrgs = nationalOrgs.items.filter(isYichangOrg);

    return {
      national: {
        orgs: {
          total: nationalOrgs.total,
          items: nationalOrgs.items,
        },
        experts: {
          total: nationalExperts.total,
          items: nationalExperts.items,
        },
      },
      yichang: {
        orgs: {
          total: yichangOrgs.length,
          items: yichangOrgs,
        },
        experts: {
          total: yichangExperts.total,
          items: yichangExperts.items,
        },
      },
    };
  })();

  queryResultCache.set(queryString, task);
  return task;
}

async function ensureNodeFile(token, chainKey, chainLabel, nodeName, mapping, index) {
  const nodeId = getNodeId(chainKey, nodeName);
  const relativeFile = `chains/${chainKey}/nodes/${nodeId}.json`;
  const absoluteFile = path.join(outputDir, relativeFile);

  if (!force && await fileExists(absoluteFile)) {
    try {
      const existing = await readJson(absoluteFile);
      if (existing?.queryString === mapping.queryString) {
        log(`跳过已存在节点缓存 ${chainKey}/${nodeName}`);
        return {
          nodeId,
          nodeName,
          keywords: mapping.keywords,
          queryString: mapping.queryString,
          file: relativeFile,
          index,
        };
      }
    } catch {
      log(`已有节点缓存损坏，准备重建 ${chainKey}/${nodeName}`);
    }
  }

  log(`开始缓存节点 ${chainKey}/${nodeName}`);
  const scopes = await fetchNodeScopes(token, mapping.queryString);
  const payload = {
    version: cacheVersion,
    builtAt: new Date().toISOString(),
    chainKey,
    chainLabel,
    nodeId,
    nodeName,
    keywords: mapping.keywords,
    queryString: mapping.queryString,
    scopes,
  };

  await writeJson(absoluteFile, payload);
  return {
    nodeId,
    nodeName,
    keywords: mapping.keywords,
    queryString: mapping.queryString,
    file: relativeFile,
    index,
  };
}

async function buildChainArtifacts(chainKey, chainLabel, chainSearchKey, nodesMeta) {
  const nodeFiles = await Promise.all(
    nodesMeta.map((nodeMeta) => readJson(path.join(outputDir, nodeMeta.file))),
  );

  const nationalOrgs = dedupeItems(
    nodeFiles.flatMap((nodeFile) => nodeFile.scopes.national.orgs.items),
    getOrgUniqueKey,
  );
  const yichangOrgs = dedupeItems(
    nodeFiles.flatMap((nodeFile) => nodeFile.scopes.yichang.orgs.items),
    getOrgUniqueKey,
  );
  const nationalExperts = dedupeItems(
    nodeFiles.flatMap((nodeFile) => nodeFile.scopes.national.experts.items),
    getExpertUniqueKey,
  );
  const yichangExperts = dedupeItems(
    nodeFiles.flatMap((nodeFile) => nodeFile.scopes.yichang.experts.items),
    getExpertUniqueKey,
  );

  const nodeOrgCounts = Object.fromEntries(
    nodeFiles.map((nodeFile) => [nodeFile.nodeName, Number(nodeFile.scopes.yichang.orgs.total ?? 0)]),
  );

  const covered = Object.values(nodeOrgCounts).filter((count) => Number(count) > 0).length;
  const total = nodeFiles.length;
  const rate = total > 0 ? (covered / total) * 100 : 0;
  const chainOrgTotal = yichangOrgs.length;

  const coverage = {
    covered,
    total,
    rate,
    chainStatus: getNodeStatus(chainOrgTotal),
    chainOrgTotal,
    nodeOrgCounts,
  };

  const aggregate = {
    version: cacheVersion,
    builtAt: new Date().toISOString(),
    chainKey,
    chainLabel,
    chainSearchKey,
    scopes: {
      national: {
        orgs: { total: nationalOrgs.length, items: nationalOrgs },
        experts: { total: nationalExperts.length, items: nationalExperts },
      },
      yichang: {
        orgs: { total: yichangOrgs.length, items: yichangOrgs },
        experts: { total: yichangExperts.length, items: yichangExperts },
      },
    },
  };

  const summary = {
    version: cacheVersion,
    builtAt: new Date().toISOString(),
    chainKey,
    chainLabel,
    chainSearchKey,
    nodeCount: total,
    coverage,
    totals: {
      national: {
        orgs: nationalOrgs.length,
        experts: nationalExperts.length,
      },
      yichang: {
        orgs: yichangOrgs.length,
        experts: yichangExperts.length,
      },
    },
    previews: {
      national: {
        orgs: nationalOrgs.slice(0, 10),
        experts: nationalExperts.slice(0, 8),
      },
      yichang: {
        orgs: yichangOrgs.slice(0, 10),
        experts: yichangExperts.slice(0, 8),
      },
    },
  };

  const summaryRelativePath = `chains/${chainKey}/summary.json`;
  const aggregateRelativePath = `chains/${chainKey}/aggregate.json`;
  await writeJson(path.join(outputDir, summaryRelativePath), summary);
  await writeJson(path.join(outputDir, aggregateRelativePath), aggregate);

  return {
    summaryPath: summaryRelativePath,
    aggregatePath: aggregateRelativePath,
    nodeCount: total,
  };
}

async function main() {
  const keywordsByChainLabel = await loadIndustryKeywords();
  const token = await getAccessToken();
  const isPartialBuild = Boolean(selectedChains || nodeLimit > 0);

  await ensureDir(outputDir);
  const manifestChains = [];
  const searchNodes = [];

  for (const [chainKey, chainLabel] of Object.entries(chainKeyToLabel)) {
    if (selectedChains && !selectedChains.has(chainKey)) {
      continue;
    }

    const nodeMappings = keywordsByChainLabel[chainLabel];
    if (!nodeMappings) {
      log(`跳过 ${chainKey}，未找到节点映射`);
      continue;
    }

    const entries = Object.entries(nodeMappings);
    const targetEntries = nodeLimit > 0 ? entries.slice(0, nodeLimit) : entries;

    log(`开始处理产业链 ${chainKey}，节点数 ${targetEntries.length}`);

    const nodesMeta = [];
    let index = 0;
    for (const [nodeName, mapping] of targetEntries) {
      index += 1;
      const nodeMeta = await ensureNodeFile(token, chainKey, chainLabel, nodeName, mapping, index);
      nodesMeta.push(nodeMeta);
      searchNodes.push({
        chainKey,
        chainLabel,
        nodeId: nodeMeta.nodeId,
        nodeName,
        keywords: mapping.keywords,
        queryString: mapping.queryString,
        queryTerms: splitQueryTerms(mapping.queryString),
        file: nodeMeta.file,
      });
    }

    const artifacts = await buildChainArtifacts(
      chainKey,
      chainLabel,
      chainKeyToSearchKey[chainKey] ?? chainLabel,
      nodesMeta,
    );

    manifestChains.push({
      chainKey,
      chainLabel,
      nodeCount: artifacts.nodeCount,
      summaryPath: artifacts.summaryPath,
      aggregatePath: artifacts.aggregatePath,
      nodes: nodesMeta.map((nodeMeta) => ({
        nodeId: nodeMeta.nodeId,
        nodeName: nodeMeta.nodeName,
        keywords: nodeMeta.keywords,
        queryString: nodeMeta.queryString,
        file: nodeMeta.file,
      })),
    });
  }

  const manifest = {
    version: cacheVersion,
    builtAt: new Date().toISOString(),
    status: isPartialBuild ? 'partial' : 'ready',
    scope: ['national', 'yichang'],
    localCity,
    chains: manifestChains,
  };

  const searchIndex = {
    version: cacheVersion,
    builtAt: new Date().toISOString(),
    status: isPartialBuild ? 'partial' : 'ready',
    nodes: searchNodes,
  };

  await writeJson(path.join(outputDir, 'manifest.json'), manifest);
  await writeJson(path.join(outputDir, 'search-index.json'), searchIndex);
  log(`完成，共输出 ${manifestChains.length} 条产业链缓存`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
