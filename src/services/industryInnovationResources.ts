import {
  industryInnovationChainLabels,
  getIndustryInnovationListData,
  getIndustryInnovationOverviewData,
  type InnovationOverviewData,
  type InnovationBarDatum,
  type InnovationTrendSeries,
  type InnovationHeatmapDatum,
  type InnovationMetricCard,
} from '@/mock/industryInnovationResources'
import industryKeywordsJson from '@/data/industry-keywords.json'
import { getAreaStatistics, type AreaStatistics } from './screen'
import { getChainAggregate } from './industryChainAggregation'
import {
  searchChainTalents,
  getChainTalentProvinceDistribution,
  getChainTalentCityDistribution,
  getChainTalentYearTrend,
} from './chainTalent'
import { getIndustryChainAggregateFromSource, getIndustryChainCityDistributionFromSource } from './industrySource'

// ========== 省份名称 ↔ 区划代码 映射 ==========

const PROVINCE_ADCODE: Record<string, string> = {
  '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
  '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
  '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
  '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
  '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
  '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
  '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
  '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000',
  '台湾省': '710000', '香港特别行政区': '810000', '澳门特别行政区': '820000',
}

const SHORT_TO_FULL: Record<string, string> = {
  '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
  '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省',
  '黑龙江': '黑龙江省', '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省',
  '福建': '福建省', '江西': '江西省', '山东': '山东省', '河南': '河南省',
  '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省', '海南': '海南省',
  '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '陕西': '陕西省',
  '甘肃': '甘肃省', '青海': '青海省', '台湾': '台湾省',
  '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '西藏': '西藏自治区',
  '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区',
  '香港': '香港特别行政区', '澳门': '澳门特别行政区',
}

/** 省份全称 → 简称（region-aggregation 用） */
const FULL_TO_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(SHORT_TO_FULL).map(([k, v]) => [v, k])
)

function adcodeToPrefix(adcode: string): string {
  if (adcode.endsWith('0000')) return `${adcode.slice(0, 2)}*`
  if (adcode.endsWith('00')) return `${adcode.slice(0, 4)}*`
  return `${adcode}*`
}

// ========== 湖北省城市固定比例表（基于 resourceStatistics 实测数据） ==========

type MetricKey = 'talent' | 'org' | 'achievement' | 'patent' | 'standard' | 'literature' | 'project' | 'park' | 'incubator' | 'carrier'

/** 各指标对应 resourceStatistics 返回字段 */
const METRIC_API_FIELD: Record<MetricKey, string | string[]> = {
  talent: '创新人才',
  org: '创新机构',
  achievement: '科技成果',
  patent: '专利',
  standard: '技术标准',
  literature: '科技文献',
  project: '科研项目',
  park: '产业园区',
  incubator: '双创载体',
  carrier: '创新载体',
}

/** 柱状图指标卡 label → MetricKey 映射 */
const CARD_LABEL_TO_METRIC: Record<string, MetricKey> = {
  '创新人才': 'talent',
  '创新机构': 'org',
  '科技成果': 'achievement',
  '知识产权': 'patent',
  '技术标准': 'standard',
  '科技文献': 'literature',
  '科研项目': 'project',
  '产业园区': 'park',
  '孵化载体': 'incubator',
}

interface CityRatio { name: string; ratios: Record<MetricKey, number> }

const HUBEI_CITY_RATIOS: CityRatio[] = [
  { name: '武汉', ratios: { talent: 63.89, org: 44.03, achievement: 63.34, patent: 56.44, standard: 74.27, literature: 63.05, project: 88.34, park: 53.31, incubator: 57.95, carrier: 63.01 } },
  { name: '宜昌', ratios: { talent: 6.21, org: 6.73, achievement: 7.29, patent: 7.09, standard: 4.75, literature: 4.61, project: 1.92, park: 4.76, incubator: 6.29, carrier: 6.65 } },
  { name: '襄阳', ratios: { talent: 4.43, org: 6.84, achievement: 3.07, patent: 6.75, standard: 3.89, literature: 3.42, project: 1.04, park: 7.31, incubator: 5.96, carrier: 5.20 } },
  { name: '荆州', ratios: { talent: 4.47, org: 5.82, achievement: 5.06, patent: 4.61, standard: 7.14, literature: 4.90, project: 1.79, park: 4.43, incubator: 1.32, carrier: 1.16 } },
  { name: '十堰', ratios: { talent: 2.91, org: 5.72, achievement: 2.76, patent: 3.63, standard: 2.35, literature: 3.38, project: 1.35, park: 3.43, incubator: 2.98, carrier: 2.89 } },
  { name: '黄冈', ratios: { talent: 2.49, org: 4.85, achievement: 1.64, patent: 3.61, standard: 1.64, literature: 4.43, project: 0.85, park: 4.82, incubator: 1.66, carrier: 1.45 } },
  { name: '黄石', ratios: { talent: 2.47, org: 5.40, achievement: 3.19, patent: 3.58, standard: 3.20, literature: 2.46, project: 1.29, park: 2.95, incubator: 3.64, carrier: 2.89 } },
  { name: '孝感', ratios: { talent: 2.17, org: 5.31, achievement: 3.11, patent: 3.52, standard: 1.57, literature: 2.10, project: 0.78, park: 5.98, incubator: 1.99, carrier: 0.87 } },
  { name: '荆门', ratios: { talent: 2.04, org: 3.19, achievement: 2.16, patent: 3.07, standard: 1.38, literature: 1.86, project: 0.40, park: 3.00, incubator: 5.63, carrier: 5.20 } },
  { name: '咸宁', ratios: { talent: 1.42, org: 3.66, achievement: 1.25, patent: 2.35, standard: 1.37, literature: 1.71, project: 0.61, park: 3.44, incubator: 2.65, carrier: 2.31 } },
  { name: '恩施', ratios: { talent: 1.38, org: 2.39, achievement: 1.12, patent: 1.25, standard: 0.57, literature: 2.07, project: 0.97, park: 1.00, incubator: 1.32, carrier: 1.16 } },
  { name: '鄂州', ratios: { talent: 0.96, org: 1.68, achievement: 0.65, patent: 1.27, standard: 0.70, literature: 0.68, project: 0.09, park: 2.76, incubator: 2.65, carrier: 2.31 } },
  { name: '随州', ratios: { talent: 0.68, org: 1.52, achievement: 0.58, patent: 1.18, standard: 0.83, literature: 0.80, project: 0.10, park: 2.11, incubator: 0.66, carrier: 0.58 } },
]

/** 按比例分配省级总数到城市，返回排序后的 Top N */
function distributeByCityRatio(total: number, metric: MetricKey, topN = 10): InnovationBarDatum[] {
  return HUBEI_CITY_RATIOS
    .map(c => ({ name: c.name, value: Math.round(total * c.ratios[metric] / 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)
}

// ========== localStorage 持久缓存（30 分钟 TTL） ==========

const CACHE_PREFIX = 'innovation:stats:'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCached<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { expireAt: number; data: T }
    if (Date.now() > parsed.expireAt) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setCache(key: string, data: unknown) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      expireAt: Date.now() + CACHE_TTL_MS,
      data,
    }))
  } catch {
    // localStorage 满或不可用，忽略
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchStats(adcode: string, retries = 3): Promise<AreaStatistics> {
  const cacheKey = `area:${adcode}`
  const cached = getCached<AreaStatistics>(cacheKey)
  if (cached) return cached

  const prefix = adcodeToPrefix(adcode)
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const stats = await getAreaStatistics(prefix.replace('*', ''))
      setCache(cacheKey, stats)
      return stats
    } catch (err) {
      const is429 = err instanceof Error && err.message.includes('429')
      if (is429 && attempt < retries) {
        await delay(2000 * (attempt + 1))
        continue
      }
      throw err
    }
  }
  throw new Error('fetchStats: max retries exceeded')
}

function num(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0
  return typeof v === 'string' ? parseInt(v, 10) || 0 : v
}

function getStatValue(stats: AreaStatistics, metric: MetricKey): number {
  const field = METRIC_API_FIELD[metric]
  if (Array.isArray(field)) return field.reduce((sum, f) => sum + num(stats[f]), 0)
  return num(stats[field])
}

// ========== 指标卡数据转换 ==========

function statsToCards(stats: AreaStatistics, expertTotal?: number, orgTotal?: number): { left: InnovationMetricCard[]; right: InnovationMetricCard[] } {
  return {
    left: [
      { label: '创新人才', unit: '位', value: expertTotal ?? getStatValue(stats, 'talent') },
      { label: '创新机构', unit: '家', value: orgTotal ?? getStatValue(stats, 'org') },
      { label: '高校院所', unit: '个', value: num(stats['高等院校']) + num(stats['科研院所']) },
      { label: '孵化载体', unit: '个', value: getStatValue(stats, 'incubator') + getStatValue(stats, 'carrier') },
      { label: '科研项目', unit: '项', value: getStatValue(stats, 'project') },
    ],
    right: [
      { label: '科技成果', unit: '项', value: getStatValue(stats, 'achievement') },
      { label: '知识产权', unit: '件', value: getStatValue(stats, 'patent') },
      { label: '技术标准', unit: '项', value: getStatValue(stats, 'standard') },
      { label: '产业园区', unit: '个', value: getStatValue(stats, 'park') },
      { label: '科技文献', unit: '篇', value: getStatValue(stats, 'literature') },
    ],
  }
}

// ========== 趋势图数据 ==========

// 旧的 TG 单关键词接口已被 chain-talents 新接口替代，相关函数已移除

// ========== 热力图（保持 mock，无接口） ==========

const hotspotXLabels = ['人才引进', '平台共建', '技术转移', '投融资', '中试验证', '政策协同']
const hotspotYLabels = ['2021', '2022', '2023', '2024', '2025']

function buildHotspotValues(regionName: string): InnovationHeatmapDatum[] {
  let hash = 0
  for (let i = 0; i < regionName.length; i++) {
    hash = (hash << 5) - hash + regionName.charCodeAt(i)
    hash |= 0
  }
  return hotspotYLabels.flatMap((_year, yIndex) =>
    hotspotXLabels.map((_label, xIndex) => ({
      xIndex,
      yIndex,
      value: Math.abs(hash * (xIndex + 1) * (yIndex + 1)) % 80 + 15,
    })),
  )
}

// ========== nodeKeywords 工具 ==========

export type NodeKeywordMapping = { keywords: string[]; queryString: string }

const chainKeyToLabel: Record<string, string> = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
}

let industryKeywordsData: Record<string, Record<string, NodeKeywordMapping>> | null = null

async function loadIndustryKeywords(): Promise<Record<string, Record<string, NodeKeywordMapping>>> {
  if (industryKeywordsData) return industryKeywordsData
  industryKeywordsData = industryKeywordsJson as Record<string, Record<string, NodeKeywordMapping>>
  return industryKeywordsData
}

export function getNodeKeywordsForChain(chainKey: string, data: Record<string, Record<string, NodeKeywordMapping>>): Record<string, NodeKeywordMapping> | undefined {
  const label = chainKeyToLabel[chainKey]
  if (!label) return undefined
  return data[label]
}

// ========== 主函数：组装 Overview 数据 ==========

export async function getIndustryInnovationOverview(
  chainKey: string,
  regionName = '湖北省',
): Promise<InnovationOverviewData> {
  // 不缓存整体 overview（TG 数据不缓存）

  const provinceAdcode = PROVINCE_ADCODE[regionName]
  if (!provinceAdcode) {
    return getIndustryInnovationOverviewData(chainKey, regionName)
  }

  const ckey = industryInnovationChainLabels[chainKey] ?? chainKey

  // 加载 nodeKeywords
  const kwData = await loadIndustryKeywords()
  const nodeKeywords = getNodeKeywordsForChain(chainKey, kwData)

  // 省份简称（用于 region-aggregation 的 province 参数）
  const provinceShort = FULL_TO_SHORT[regionName] ?? regionName.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '')

  // 并行请求：省级统计 + 地图热力 + 趋势 + 机构总数 + 城市级人才分布（含人才总数）+ 城市级机构分布
  // 人才相关优先走 chain-talents 新接口（按产业链全子节点去重），失败时 fallback 到旧接口（单关键词）
  const [provinceStats, mapRaw, trendData, orgResult, cityTalentRaw, orgCityDist] = await Promise.all([
    fetchStats(provinceAdcode).catch(() => null),
    // 地图热力：chain-talents/province-distribution
    getChainTalentProvinceDistribution(ckey)
      .then((r) => r.items.map((i) => ({ name: i.name ?? '', value: i.value })))
      .catch(() => [] as { name: string; value: number }[]),
    // 趋势图：chain-talents/year-trend
    getChainTalentYearTrend(ckey, 2018).then((r) => ({
      years: r.years.map(String),
      series: [
        { key: 'g', label: '期刊论文', color: '#3B7CFF', values: r.papers },
        { key: 'h', label: '专利', color: '#42B883', values: r.patents },
        { key: 'b', label: '技术标准', color: '#F4B740', values: r.standards },
      ].filter((s) => s.values.some((v) => v > 0)),
    })).catch(() => ({ years: [] as string[], series: [] as InnovationTrendSeries[] })),
    (async () => {
      const cached = await getIndustryChainAggregateFromSource(chainKey, 'orgs').catch(() => null)
      if (cached) return cached
      if (!nodeKeywords) return null
      return getChainAggregate(chainKey, 'orgs', nodeKeywords).catch(() => null)
    })(),
    // 城市级人才分布 + 人才总数：chain-talents/city-distribution
    getChainTalentCityDistribution(ckey, provinceShort)
      .then((r) => ({
        total: r.total,
        items: r.items.map((i) => ({ name: i.city ?? i.name ?? '', value: i.value })),
      }))
      .catch(() => ({ total: 0, items: [] as InnovationBarDatum[] })),
    // 城市级机构分布（Demo-API 真实数据，失败时 null → fallback 到 HUBEI_CITY_RATIOS 硬编码比例）
    getIndustryChainCityDistributionFromSource(chainKey, provinceShort).catch(() => null),
  ])

  // 创新人才总数 = chain-talents 返回的去重 total
  const expertTotal = cityTalentRaw.total || undefined
  const orgTotal = orgResult?.total ?? undefined

  // 指标卡
  const cards = provinceStats
    ? statsToCards(provinceStats, expertTotal, orgTotal)
    : { left: [] as InnovationMetricCard[], right: [] as InnovationMetricCard[] }

  // 地图热力数据
  const mapValues: InnovationBarDatum[] = mapRaw.map(item => ({
    name: SHORT_TO_FULL[item.name] ?? `${item.name}省`,
    value: item.value,
  }))

  // 柱状图：人才用真实城市分布，机构用固定比例
  const talentBars = cityTalentRaw.items.length > 0
    ? cityTalentRaw.items
    : distributeByCityRatio(expertTotal ?? (provinceStats ? getStatValue(provinceStats, 'talent') : 0), 'talent')

  const orgTotalVal = orgTotal ?? (provinceStats ? getStatValue(provinceStats, 'org') : 0)
  // 优先用 Demo-API 真实城市分布；接口不可用或返回空时 fallback 到 HUBEI_CITY_RATIOS 比例
  const orgBars: InnovationBarDatum[] = (orgCityDist && orgCityDist.length > 0)
    ? orgCityDist.slice(0, 10).map((item) => ({ name: item.city, value: item.total }))
    : distributeByCityRatio(orgTotalVal, 'org')

  const result: InnovationOverviewData = {
    regionName,
    leftCards: cards.left,
    rightCards: cards.right,
    mapValues,
    charts: {
      talent: {
        title: '创新人才区域分布',
        subtitle: '点击图表进入列表视图',
        items: talentBars,
      },
      organization: {
        title: '创新机构区域分布',
        subtitle: '展示重点创新载体与服务机构分布',
        items: orgBars,
      },
      hotspot: {
        title: '技术热点分布热力图',
        subtitle: '按年度和主题观察资源活跃度',
        xLabels: hotspotXLabels,
        yLabels: hotspotYLabels,
        values: buildHotspotValues(regionName),
      },
      trend: {
        title: '创新趋势',
        subtitle: '科技成果、创新机构与政策协同变化',
        years: trendData.years,
        series: trendData.series,
      },
    },
  }

  return result
}

// ========== 列表接口：创新人才 + 创新机构用真实 API，其余保持 mock ==========

export interface InnovationRealListResult {
  items: Record<string, unknown>[]
  total: number
}

export async function getInnovationExpertList(
  chainKey: string,
  page = 1,
  pageSize = 6,
): Promise<InnovationRealListResult> {
  const ckey = industryInnovationChainLabels[chainKey] ?? chainKey

  // chain-talents/search — 后端按产业链全子节点去重
  const res = await searchChainTalents(ckey, undefined, undefined, page, pageSize)
  return { items: res.items, total: res.total }
}

export async function getInnovationOrgList(
  chainKey: string,
  page = 1,
  pageSize = 6,
): Promise<InnovationRealListResult> {
  const cacheKey = `org-list:${chainKey}:${page}:${pageSize}`
  const cached = getCached<InnovationRealListResult>(cacheKey)
  if (cached) return cached

  // 优先本地缓存小服务，fallback 远程接口（和产业图谱一致）
  const cachedSource = await getIndustryChainAggregateFromSource(chainKey, 'orgs', undefined, page, pageSize).catch(() => null)
  if (cachedSource) {
    const result = { total: cachedSource.total, items: cachedSource.items as Record<string, unknown>[] }
    setCache(cacheKey, result)
    return result
  }

  const kwData = await loadIndustryKeywords()
  const nodeKeywords = getNodeKeywordsForChain(chainKey, kwData)
  if (!nodeKeywords) return { items: [], total: 0 }

  const result = await getChainAggregate(chainKey, 'orgs', nodeKeywords)
  const start = (page - 1) * pageSize
  const paged = {
    total: result.total,
    items: result.items.slice(start, start + pageSize),
  }
  setCache(cacheKey, paged)
  return paged
}

// ========== 兼容：其余分类保持 mock ==========

export { CARD_LABEL_TO_METRIC, type MetricKey }

export async function getIndustryInnovationList(query: import('@/mock/industryInnovationResources').InnovationListQuery) {
  return getIndustryInnovationListData(query)
}
