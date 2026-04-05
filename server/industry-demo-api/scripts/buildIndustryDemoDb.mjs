import Database from 'better-sqlite3';
import { access, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { schemaSql } from '../schema.mjs';
import {
  buildScopeKey,
  cacheVersion,
  chainMeta,
  defaultLocalCity,
  defaultLocalProvince,
  getExpertUid,
  getNodeId,
  getOrgUid,
  normalizeCityName,
  normalizeProvinceName,
  normalizeSearchText,
} from '../shared.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const keywordsFile = path.join(rootDir, 'src', 'data', 'industry-keywords.json');
const authFile = path.join(rootDir, 'src', 'services', 'auth.ts');

const baseUrl = process.env.WF_API_BASE_URL ?? 'http://119.36.242.222:8902';
const pageSize = Number(process.env.INDUSTRY_DB_PAGE_SIZE ?? 100);
const requestIntervalMs = Number(process.env.INDUSTRY_DB_INTERVAL_MS ?? 180);
const maxRetries = Number(process.env.INDUSTRY_DB_MAX_RETRIES ?? 3);
const localProvince = normalizeProvinceName(process.env.INDUSTRY_LOCAL_PROVINCE ?? defaultLocalProvince);
const localCity = normalizeCityName(process.env.INDUSTRY_LOCAL_CITY ?? defaultLocalCity);
const localScopeKey = buildScopeKey(localProvince, localCity);

const outArg = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length);
const chainArg = process.argv.find((arg) => arg.startsWith('--chain='))?.slice('--chain='.length);
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.slice('--limit='.length);
const force = process.argv.includes('--force');
const outputPath = path.resolve(process.cwd(), outArg ?? 'industry-cache.db');
const selectedChains = chainArg ? new Set(chainArg.split(',').map((item) => item.trim()).filter(Boolean)) : null;
const nodeLimit = limitArg ? Number(limitArg) : 0;

let lastRequestAt = 0;
const queryResultCache = new Map();

function log(message) {
  console.log(`[industry-demo-db] ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle() {
  const now = Date.now();
  const waitMs = Math.max(0, lastRequestAt + requestIntervalMs - now);
  if (waitMs > 0) {
    await sleep(waitMs);
  }
  lastRequestAt = Date.now();
}

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
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
      if (attempt >= maxRetries) {
        break;
      }

      const retryDelay = requestIntervalMs * attempt * 3;
      log(`${label} failed on attempt ${attempt}, retrying in ${retryDelay}ms`);
      await sleep(retryDelay);
    }
  }

  throw lastError;
}

async function loadIndustryKeywords() {
  const content = await readFile(keywordsFile, 'utf8');
  return JSON.parse(content);
}

async function readApiCredentials() {
  const source = await readFile(authFile, 'utf8');
  const username = source.match(/const API_USERNAME = '([^']+)'/)?.[1];
  const secret = source.match(/const API_SECRET = '([^']+)'/)?.[1];

  if (!username || !secret) {
    throw new Error('Unable to parse API credentials from src/services/auth.ts');
  }

  return { username, secret };
}

async function getAccessToken() {
  const { username, secret } = await readApiCredentials();
  const result = await fetchJson(
    `${baseUrl}/auth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, secret }),
    },
    'auth/token',
  );

  const token = result.accessToken ?? result.token;
  if (!token) {
    throw new Error('Token not found in auth response');
  }

  return token;
}

function buildOrgUrl(queryString, from, size) {
  const firstKeyword = String(queryString).split(/\s+OR\s+/)[0]?.trim() ?? queryString;
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
  return fetchJson(
    buildExpertUrl(queryString, from, pageSize, city),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    `experts:${city || 'national'}:${queryString}:${from}`,
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

  log(`${label} loaded ${items.length}/${total}`);

  for (let from = items.length; from < total; from += pageSize) {
    const page = await fetchPage(from);
    const pageItems = getItems(page);
    items.push(...pageItems);
    log(`${label} loaded ${Math.min(items.length, total)}/${total}`);
  }

  return {
    total,
    items: items.slice(0, total),
  };
}

async function fetchNodeScopes(token, queryString) {
  if (queryResultCache.has(queryString)) {
    return queryResultCache.get(queryString);
  }

  const task = (async () => {
    const nationalOrgs = await fetchAllPages(
      (from) => fetchOrgPage(token, queryString, from),
      extractOrgItems,
      `orgs national ${queryString}`,
    );

    const nationalExperts = await fetchAllPages(
      (from) => fetchExpertPage(token, queryString, from),
      extractExpertItems,
      `experts national ${queryString}`,
    );

    const localExperts = await fetchAllPages(
      (from) => fetchExpertPage(token, queryString, from, localCity),
      extractExpertItems,
      `experts ${localCity} ${queryString}`,
    );

    return {
      nationalOrgs,
      nationalExperts,
      localExperts,
    };
  })();

  queryResultCache.set(queryString, task);
  return task;
}

function createStatements(db) {
  return {
    insertMeta: db.prepare(`
      INSERT INTO meta (key, value)
      VALUES (@key, @value)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `),
    insertChain: db.prepare(`
      INSERT INTO chains (chain_key, chain_label, chain_search_key)
      VALUES (@chain_key, @chain_label, @chain_search_key)
      ON CONFLICT(chain_key) DO UPDATE SET
        chain_label = excluded.chain_label,
        chain_search_key = excluded.chain_search_key
    `),
    insertNode: db.prepare(`
      INSERT INTO nodes (node_id, chain_key, node_name, norm_node_name, query_string)
      VALUES (@node_id, @chain_key, @node_name, @norm_node_name, @query_string)
      ON CONFLICT(node_id) DO UPDATE SET
        chain_key = excluded.chain_key,
        node_name = excluded.node_name,
        norm_node_name = excluded.norm_node_name,
        query_string = excluded.query_string
    `),
    insertKeyword: db.prepare(`
      INSERT OR REPLACE INTO node_keywords (node_id, keyword, norm_keyword)
      VALUES (@node_id, @keyword, @norm_keyword)
    `),
    insertOrg: db.prepare(`
      INSERT INTO org_entities (
        org_uid, id, orgid, name, prov, city, norm_prov, norm_city,
        industry_json, industry_text, tags_json, tags_text, raw_json
      )
      VALUES (
        @org_uid, @id, @orgid, @name, @prov, @city, @norm_prov, @norm_city,
        @industry_json, @industry_text, @tags_json, @tags_text, @raw_json
      )
      ON CONFLICT(org_uid) DO UPDATE SET
        id = excluded.id,
        orgid = excluded.orgid,
        name = excluded.name,
        prov = excluded.prov,
        city = excluded.city,
        norm_prov = excluded.norm_prov,
        norm_city = excluded.norm_city,
        industry_json = excluded.industry_json,
        industry_text = excluded.industry_text,
        tags_json = excluded.tags_json,
        tags_text = excluded.tags_text,
        raw_json = excluded.raw_json
    `),
    insertExpert: db.prepare(`
      INSERT INTO expert_entities (
        expert_uid, auid, id, cname, aorg, title_json, title_text,
        h, qikan, zhuanli, chengguo, chanxueyanhz, raw_json
      )
      VALUES (
        @expert_uid, @auid, @id, @cname, @aorg, @title_json, @title_text,
        @h, @qikan, @zhuanli, @chengguo, @chanxueyanhz, @raw_json
      )
      ON CONFLICT(expert_uid) DO UPDATE SET
        auid = excluded.auid,
        id = excluded.id,
        cname = excluded.cname,
        aorg = excluded.aorg,
        title_json = excluded.title_json,
        title_text = excluded.title_text,
        h = excluded.h,
        qikan = excluded.qikan,
        zhuanli = excluded.zhuanli,
        chengguo = excluded.chengguo,
        chanxueyanhz = excluded.chanxueyanhz,
        raw_json = excluded.raw_json
    `),
    insertNodeOrgHit: db.prepare(`
      INSERT OR IGNORE INTO node_org_hits (node_id, org_uid)
      VALUES (@node_id, @org_uid)
    `),
    insertNodeExpertHit: db.prepare(`
      INSERT OR IGNORE INTO node_expert_hits (
        node_id, expert_uid, scope_key, query_province, query_city, norm_query_province, norm_query_city
      )
      VALUES (
        @node_id, @expert_uid, @scope_key, @query_province, @query_city, @norm_query_province, @norm_query_city
      )
    `),
  };
}

function toOrgRecord(item) {
  const industries = Array.isArray(item.INDUSTRY) ? item.INDUSTRY : [];
  const tags = Array.isArray(item.TAGS) ? item.TAGS : [];
  return {
    org_uid: getOrgUid(item),
    id: item.ID ? String(item.ID) : null,
    orgid: item.ORGID ? String(item.ORGID) : null,
    name: String(item.NAME ?? ''),
    prov: item.PROV ? String(item.PROV) : null,
    city: item.CITY ? String(item.CITY) : null,
    norm_prov: normalizeProvinceName(item.PROV),
    norm_city: normalizeCityName(item.CITY),
    industry_json: JSON.stringify(industries),
    industry_text: industries.join(' '),
    tags_json: JSON.stringify(tags),
    tags_text: tags.join(' '),
    raw_json: JSON.stringify(item),
  };
}

function toExpertRecord(item) {
  const titles = Array.isArray(item.TITLE) ? item.TITLE : [];
  return {
    expert_uid: getExpertUid(item),
    auid: item.AUID ? String(item.AUID) : null,
    id: item.ID ? String(item.ID) : null,
    cname: String(item.CNAME ?? ''),
    aorg: item.AORG ? String(item.AORG) : null,
    title_json: JSON.stringify(titles),
    title_text: titles.join(' '),
    h: Number(item.H ?? 0),
    qikan: Number(item.QIKAN ?? 0),
    zhuanli: Number(item.ZHUANLI ?? 0),
    chengguo: Number(item.CHENGGUO ?? 0),
    chanxueyanhz: Number(item.CHANXUEYANHZ ?? 0),
    raw_json: JSON.stringify(item),
  };
}

async function main() {
  if (await fileExists(outputPath)) {
    if (!force) {
      throw new Error(`Output DB already exists: ${outputPath}. Pass --force to overwrite.`);
    }
    await rm(outputPath, { force: true });
  }

  await mkdir(path.dirname(outputPath), { recursive: true });

  const token = await getAccessToken();
  const keywordsByChainLabel = await loadIndustryKeywords();
  const db = new Database(outputPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('temp_store = MEMORY');
  db.exec(schemaSql);

  const statements = createStatements(db);

  const insertNodePayload = db.transaction((payload) => {
    statements.insertNode.run(payload.node);

    for (const keyword of payload.keywords) {
      statements.insertKeyword.run({
        node_id: payload.node.node_id,
        keyword,
        norm_keyword: normalizeSearchText(keyword),
      });
    }

    for (const org of payload.orgs) {
      const orgRecord = toOrgRecord(org);
      statements.insertOrg.run(orgRecord);
      statements.insertNodeOrgHit.run({
        node_id: payload.node.node_id,
        org_uid: orgRecord.org_uid,
      });
    }

    for (const expert of payload.nationalExperts) {
      const expertRecord = toExpertRecord(expert);
      statements.insertExpert.run(expertRecord);
      statements.insertNodeExpertHit.run({
        node_id: payload.node.node_id,
        expert_uid: expertRecord.expert_uid,
        scope_key: 'national',
        query_province: null,
        query_city: null,
        norm_query_province: null,
        norm_query_city: null,
      });
    }

    for (const expert of payload.localExperts) {
      const expertRecord = toExpertRecord(expert);
      statements.insertExpert.run(expertRecord);
      statements.insertNodeExpertHit.run({
        node_id: payload.node.node_id,
        expert_uid: expertRecord.expert_uid,
        scope_key: localScopeKey,
        query_province: localProvince,
        query_city: localCity,
        norm_query_province: localProvince,
        norm_query_city: localCity,
      });
    }
  });

  for (const chain of chainMeta) {
    if (selectedChains && !selectedChains.has(chain.chainKey)) {
      continue;
    }

    const nodeMappings = keywordsByChainLabel[chain.chainLabel];
    if (!nodeMappings) {
      log(`Skipping ${chain.chainKey}, node mapping not found`);
      continue;
    }

    statements.insertChain.run({
      chain_key: chain.chainKey,
      chain_label: chain.chainLabel,
      chain_search_key: chain.chainSearchKey,
    });

    const entries = Object.entries(nodeMappings);
    const targetEntries = nodeLimit > 0 ? entries.slice(0, nodeLimit) : entries;

    log(`Processing ${chain.chainKey}, nodes: ${targetEntries.length}`);

    for (const [nodeName, mapping] of targetEntries) {
      const node = {
        node_id: getNodeId(chain.chainKey, nodeName),
        chain_key: chain.chainKey,
        node_name: nodeName,
        norm_node_name: normalizeSearchText(nodeName),
        query_string: mapping.queryString,
      };

      log(`Fetching ${chain.chainKey}/${nodeName}`);
      const scopes = await fetchNodeScopes(token, mapping.queryString);

      insertNodePayload({
        node,
        keywords: Array.from(new Set([nodeName, ...mapping.keywords])),
        orgs: scopes.nationalOrgs.items,
        nationalExperts: scopes.nationalExperts.items,
        localExperts: scopes.localExperts.items,
      });
    }
  }

  const builtAt = new Date().toISOString();
  statements.insertMeta.run({ key: 'version', value: cacheVersion });
  statements.insertMeta.run({ key: 'built_at', value: builtAt });
  statements.insertMeta.run({ key: 'local_province', value: localProvince });
  statements.insertMeta.run({ key: 'local_city', value: localCity });
  statements.insertMeta.run({ key: 'local_scope_key', value: localScopeKey });
  db.pragma('optimize');
  db.close();

  log(`Done: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
