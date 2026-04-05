import { createHash } from 'node:crypto';

export const cacheVersion = '2026-04-industry-demo-db-v1';
export const defaultLocalProvince = process.env.INDUSTRY_LOCAL_PROVINCE ?? '湖北';
export const defaultLocalCity = process.env.INDUSTRY_LOCAL_CITY ?? '宜昌';

export const chainMeta = [
  {
    chainKey: 'wetchem',
    chainLabel: '湿电子化学品',
    chainSearchKey: '电子化学品 OR 半导体材料 OR 湿电子化学品',
  },
  {
    chainKey: 'newenergy',
    chainLabel: '新能源新材料',
    chainSearchKey: '新能源 OR 新材料 OR 电池 OR 储能',
  },
  {
    chainKey: 'pharma',
    chainLabel: '先进制剂与高端仿制药',
    chainSearchKey: '制药 OR 仿制药 OR 生物医药 OR 药物制剂',
  },
  {
    chainKey: 'yeast',
    chainLabel: '酵母发酵与功能成分制造',
    chainSearchKey: '酵母 OR 发酵 OR 生物工程 OR 功能食品',
  },
  {
    chainKey: 'ship',
    chainLabel: '内河绿色智能船舶制造',
    chainSearchKey: '船舶 OR 造船 OR 航运 OR 智能船舶',
  },
  {
    chainKey: 'ai',
    chainLabel: '人工智能',
    chainSearchKey: '人工智能',
  },
];

const provinceSuffixes = [
  '维吾尔自治区',
  '壮族自治区',
  '回族自治区',
  '特别行政区',
  '自治区',
  '省',
  '市',
];

const citySuffixes = ['自治州', '地区', '盟', '市'];

function stripSuffix(value, suffixes) {
  let text = String(value ?? '').trim();
  for (const suffix of suffixes) {
    if (text.endsWith(suffix)) {
      text = text.slice(0, -suffix.length);
      break;
    }
  }
  return text.trim();
}

export function normalizeProvinceName(value) {
  return stripSuffix(value, provinceSuffixes);
}

export function normalizeCityName(value) {
  return stripSuffix(value, citySuffixes);
}

export function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[()\[\]{}<>《》“”"'‘’、，。；：:,.!?！？\s\-_/\\|]/g, '')
    .trim();
}

export function buildScopeKey(province, city) {
  const normProvince = normalizeProvinceName(province);
  const normCity = normalizeCityName(city);

  if (normCity) {
    if (!normProvince) {
      return `city:|${normCity}`;
    }
    return `city:${normProvince}|${normCity}`;
  }

  if (normProvince) {
    return `province:${normProvince}`;
  }

  return 'national';
}

export function resolveScope(province, city) {
  const normProvince = normalizeProvinceName(province);
  const normCity = normalizeCityName(city);
  const scopeKey = buildScopeKey(normProvince, normCity);

  return {
    scopeKey,
    province: normProvince || undefined,
    city: normCity || undefined,
    isNational: scopeKey === 'national',
    isProvince: scopeKey.startsWith('province:'),
    isCity: scopeKey.startsWith('city:'),
  };
}

export function getNodeId(chainKey, nodeName) {
  return createHash('sha1').update(`${chainKey}:${nodeName}`, 'utf8').digest('hex').slice(0, 12);
}

export function getOrgUid(item) {
  const id = String(item.ID ?? item.ORGID ?? item.UID ?? '').trim();
  if (id) return id;

  const name = String(item.NAME ?? '').trim();
  const prov = normalizeProvinceName(item.PROV);
  const city = normalizeCityName(item.CITY);
  return `name:${name}|${prov}|${city}`;
}

export function getExpertUid(item) {
  const id = String(item.AUID ?? item.ID ?? item.UID ?? '').trim();
  if (id) return id;

  const name = String(item.CNAME ?? '').trim();
  const org = String(item.AORG ?? '').trim();
  return `name:${name}|${org}`;
}

export function splitQueryTerms(queryString) {
  return String(queryString ?? '')
    .split(/\s+OR\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseJsonText(value, fallback = []) {
  try {
    return JSON.parse(String(value ?? ''));
  } catch {
    return fallback;
  }
}
