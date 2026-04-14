export type InnovationMetricKey = 'talent' | 'organization' | 'hotspot' | 'trend'

export type InnovationListCategoryKey =
  | 'innovators'
  | 'institutions'
  | 'services'
  | 'parks'
  | 'outcomes'
  | 'ip'
  | 'policies'
  | 'papers'

export interface InnovationMetricCard {
  label: string
  unit: string
  value: number
}

export interface InnovationBarDatum {
  name: string
  value: number
}

export interface InnovationHeatmapDatum {
  xIndex: number
  yIndex: number
  value: number
}

export interface InnovationTrendSeries {
  key: string
  label: string
  color: string
  values: number[]
}

export interface InnovationOverviewData {
  regionName: string
  leftCards: InnovationMetricCard[]
  rightCards: InnovationMetricCard[]
  mapValues: InnovationBarDatum[]
  charts: {
    talent: {
      title: string
      subtitle: string
      items: InnovationBarDatum[]
    }
    organization: {
      title: string
      subtitle: string
      items: InnovationBarDatum[]
    }
    hotspot: {
      title: string
      subtitle: string
      xLabels: string[]
      yLabels: string[]
      values: InnovationHeatmapDatum[]
    }
    trend: {
      title: string
      subtitle: string
      years: string[]
      series: InnovationTrendSeries[]
    }
  }
}

export interface InnovationListCategory {
  key: InnovationListCategoryKey
  label: string
  count: number
}

export interface InnovationListItem {
  id: string
  title: string
  organization: string
  region: string
  summary: string
  tags: string[]
  metrics: Array<{ label: string; value: string }>
  updatedAt: string
  score: number
}

export interface InnovationListResult {
  categories: InnovationListCategory[]
  items: InnovationListItem[]
  total: number
  page: number
  pageSize: number
}

export interface InnovationListQuery {
  chainKey: string
  regionName: string
  category: InnovationListCategoryKey
  metric: InnovationMetricKey
  keyword?: string
  sort?: 'match' | 'latest' | 'hot'
  page?: number
  pageSize?: number
}

export const industryInnovationChainLabels: Record<string, string> = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
}

export const innovationMetricToCategory: Record<InnovationMetricKey, InnovationListCategoryKey> = {
  talent: 'innovators',
  organization: 'institutions',
  hotspot: 'outcomes',
  trend: 'papers',
}

export const innovationMetricLabels: Record<InnovationMetricKey, string> = {
  talent: '创新人才区域分布',
  organization: '创新机构区域分布',
  hotspot: '技术热点分布热力图',
  trend: '创新趋势',
}

const provinceNames = [
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '内蒙古自治区',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '广西壮族自治区',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '西藏自治区',
  '陕西省',
  '甘肃省',
  '青海省',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '香港特别行政区',
  '澳门特别行政区',
  '台湾省',
]

const provinceScale: Record<string, number> = {
  北京市: 1.18,
  上海市: 1.16,
  江苏省: 1.14,
  浙江省: 1.12,
  广东省: 1.28,
  山东省: 1.1,
  河南省: 1.05,
  湖北省: 1,
  四川省: 0.96,
  重庆市: 0.88,
  陕西省: 0.91,
  湖南省: 0.93,
}

const chainScale: Record<string, number> = {
  wetchem: 0.92,
  newenergy: 1.06,
  pharma: 1.02,
  yeast: 0.86,
  ship: 0.82,
  ai: 1.12,
}

const hubeiBaseCards = {
  left: [
    { label: '创新人才', unit: '位', value: 1118633 },
    { label: '创新机构', unit: '家', value: 105843 },
    { label: '高校院所', unit: '个', value: 302 },
    { label: '孵化载体', unit: '个', value: 8073 },
    { label: '科研项目', unit: '项', value: 84116 },
  ],
  right: [
    { label: '科技成果', unit: '项', value: 63553 },
    { label: '知识产权', unit: '件', value: 1620077 },
    { label: '技术标准', unit: '项', value: 19756 },
    { label: '产业园区', unit: '个', value: 4870 },
    { label: '科技文献', unit: '篇', value: 2401038 },
  ],
}

const hubeiTalentBars = [
  { name: '武汉', value: 320 },
  { name: '宜昌', value: 280 },
  { name: '襄阳', value: 305 },
  { name: '黄石', value: 256 },
  { name: '荆州', value: 212 },
  { name: '十堰', value: 176 },
  { name: '荆门', value: 162 },
  { name: '鄂州', value: 148 },
]

const hubeiOrganizationBars = [
  { name: '武汉', value: 298 },
  { name: '宜昌', value: 214 },
  { name: '襄阳', value: 226 },
  { name: '黄冈', value: 205 },
  { name: '荆州', value: 174 },
  { name: '黄石', value: 152 },
  { name: '十堰', value: 139 },
  { name: '荆门', value: 128 },
]

const hotspotXLabels = ['人才引进', '平台共建', '技术转移', '投融资', '中试验证', '政策协同']
const hotspotYLabels = ['2021', '2022', '2023', '2024', '2025']

const trendYears = ['2021', '2022', '2023', '2024', '2025']

const listCategoryLabels: Record<InnovationListCategoryKey, string> = {
  innovators: '创新人才',
  institutions: '创新机构',
  services: '资源服务',
  parks: '产业园区',
  outcomes: '科技成果',
  ip: '知识产权',
  policies: '产业政策',
  papers: '科技文献',
}

const organizationSuffixByCategory: Record<InnovationListCategoryKey, string> = {
  innovators: '产业创新中心',
  institutions: '产业研究院',
  services: '成果转化服务平台',
  parks: '创新孵化园',
  outcomes: '技术转移中心',
  ip: '知识产权运营中心',
  policies: '科技创新局',
  papers: '联合实验室',
}

const titleTemplateByCategory: Record<InnovationListCategoryKey, string[]> = {
  innovators: ['首席科学家', '技术带头人', '成果转化顾问', '产业导师', '青年研究员'],
  institutions: ['创新研究院', '重点实验室', '工程技术中心', '联合创新平台', '中试验证基地'],
  services: ['成果转化服务包', '技术撮合专班', '中试共享平台', '创新券服务站', '技术经纪联盟'],
  parks: ['产业创新园', '科技孵化器', '科创走廊节点', '成果转化基地', '未来产业社区'],
  outcomes: ['关键技术成果', '应用验证成果', '示范转化项目', '核心技术方案', '联合攻关成果'],
  ip: ['发明专利组合', '核心专利池', '专利导航报告', '标准必要专利', '知识产权包'],
  policies: ['创新扶持政策包', '科技专项申报指南', '人才引育细则', '成果转化奖励政策', '园区支持政策'],
  papers: ['重点文献集', '前沿研究综述', '高被引论文库', '技术趋势观察', '场景研究报告'],
}

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function scaleValue(base: number, regionName: string, chainKey: string, factor = 1): number {
  const regionFactor = provinceScale[regionName] ?? (0.72 + (hashString(regionName) % 30) / 100)
  const chainFactor = chainScale[chainKey] ?? 1
  return Math.max(1, Math.round(base * regionFactor * chainFactor * factor))
}

function stripRegionSuffix(regionName: string): string {
  return regionName.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '')
}

function getSubregionLabels(regionName: string): string[] {
  if (regionName === '湖北省') {
    return hubeiTalentBars.map((item) => item.name)
  }
  const base = stripRegionSuffix(regionName)
  return [
    `${base}核心区`,
    `${base}高新区`,
    `${base}经开区`,
    `${base}创新港`,
    `${base}科创带`,
    `${base}转化区`,
    `${base}园区组团`,
    `${base}示范区`,
  ]
}

function buildMetricCards(regionName: string, chainKey: string) {
  return {
    left: hubeiBaseCards.left.map((card, index) => ({
      ...card,
      value: scaleValue(card.value, regionName, chainKey, 1 + index * 0.01),
    })),
    right: hubeiBaseCards.right.map((card, index) => ({
      ...card,
      value: scaleValue(card.value, regionName, chainKey, 1 + index * 0.012),
    })),
  }
}

function buildBarData(regionName: string, chainKey: string, baseData: InnovationBarDatum[], startFactor: number) {
  const labels = regionName === '湖北省' ? baseData.map((item) => item.name) : getSubregionLabels(regionName)
  return labels.map((name, index) => ({
    name,
    value: scaleValue(baseData[index % baseData.length].value, regionName, chainKey, startFactor - index * 0.035),
  }))
}

function buildHotspotValues(regionName: string, chainKey: string): InnovationHeatmapDatum[] {
  return hotspotYLabels.flatMap((year, yIndex) =>
    hotspotXLabels.map((label, xIndex) => ({
      xIndex,
      yIndex,
      value: scaleValue(28 + xIndex * 8 + yIndex * 6, regionName + year + label, chainKey, 1),
    })),
  )
}

function buildTrendSeries(regionName: string, chainKey: string): InnovationTrendSeries[] {
  return [
    {
      key: 'outcomes',
      label: '科技成果',
      color: '#3B7CFF',
      values: trendYears.map((_, index) => scaleValue(60 + index * 22, regionName, chainKey, 0.32)),
    },
    {
      key: 'institutions',
      label: '创新机构',
      color: '#42B883',
      values: trendYears.map((_, index) => scaleValue(16 + index * 3, regionName, chainKey, 0.18)),
    },
    {
      key: 'policies',
      label: '产业政策',
      color: '#F4B740',
      values: trendYears.map((_, index) => scaleValue(10 + index * 2, regionName, chainKey, 0.12)),
    },
  ]
}

function buildMapValues(chainKey: string): InnovationBarDatum[] {
  return provinceNames.map((name, index) => ({
    name,
    value: scaleValue(180000 + index * 1200, name, chainKey, 0.55),
  }))
}

function buildListItems({
  chainKey,
  regionName,
  category,
  metric,
}: Pick<InnovationListQuery, 'chainKey' | 'regionName' | 'category' | 'metric'>): InnovationListItem[] {
  const chainLabel = industryInnovationChainLabels[chainKey] ?? chainKey
  const regionLabel = stripRegionSuffix(regionName)
  const titleTemplates = titleTemplateByCategory[category]
  const orgSuffix = organizationSuffixByCategory[category]
  const count = category === 'innovators' ? 28 : category === 'institutions' ? 24 : 18

  return Array.from({ length: count }, (_, index) => {
    const seed = hashString(`${chainKey}-${regionName}-${category}-${metric}-${index}`)
    const titleSeed = titleTemplates[index % titleTemplates.length]
    const title =
      category === 'innovators'
        ? `${regionLabel}${chainLabel}${titleSeed}${index + 1}`
        : `${regionLabel}${chainLabel}${titleSeed}${String(index + 1).padStart(2, '0')}`

    return {
      id: `${chainKey}-${category}-${index}`,
      title,
      organization: `${regionLabel}${chainLabel}${orgSuffix}`,
      region: regionName,
      summary: `围绕${chainLabel}重点方向形成稳定创新供给，支持${regionLabel}在成果转化、平台共建和企业协同中的项目对接与资源落位。`,
      tags: [listCategoryLabels[category], chainLabel, regionLabel, index % 2 === 0 ? '重点推荐' : '可对接'],
      metrics: [
        { label: '匹配度', value: `${72 + (seed % 21)}%` },
        { label: '活跃度', value: `${48 + (seed % 36)}` },
        { label: '近90天', value: `${6 + (seed % 18)}条` },
      ],
      updatedAt: `2026-0${(index % 6) + 1}-${String((index % 27) + 1).padStart(2, '0')}`,
      score: 100 - index,
    }
  })
}

export function getIndustryInnovationOverviewData(chainKey: string, regionName = '湖北省'): InnovationOverviewData {
  const cards = buildMetricCards(regionName, chainKey)

  return {
    regionName,
    leftCards: cards.left,
    rightCards: cards.right,
    mapValues: buildMapValues(chainKey),
    charts: {
      talent: {
        title: '创新人才区域分布',
        subtitle: '点击图表进入列表视图',
        items: buildBarData(regionName, chainKey, hubeiTalentBars, 1.02),
      },
      organization: {
        title: '创新机构区域分布',
        subtitle: '展示重点创新载体与服务机构分布',
        items: buildBarData(regionName, chainKey, hubeiOrganizationBars, 0.92),
      },
      hotspot: {
        title: '技术热点分布热力图',
        subtitle: '按年度和主题观察资源活跃度',
        xLabels: hotspotXLabels,
        yLabels: hotspotYLabels,
        values: buildHotspotValues(regionName, chainKey),
      },
      trend: {
        title: '创新趋势',
        subtitle: '科技成果、创新机构与政策协同变化',
        years: trendYears,
        series: buildTrendSeries(regionName, chainKey),
      },
    },
  }
}

export function getIndustryInnovationListData({
  chainKey,
  regionName,
  category,
  metric,
  keyword = '',
  sort = 'match',
  page = 1,
  pageSize = 6,
}: InnovationListQuery): InnovationListResult {
  const allItems = buildListItems({ chainKey, regionName, category, metric })
  const normalizedKeyword = keyword.trim().toLowerCase()

  let filtered = normalizedKeyword
    ? allItems.filter((item) =>
        [item.title, item.organization, item.summary, ...item.tags].some((text) =>
          text.toLowerCase().includes(normalizedKeyword),
        ),
      )
    : allItems

  filtered = [...filtered].sort((left, right) => {
    if (sort === 'latest') {
      return right.updatedAt.localeCompare(left.updatedAt)
    }
    if (sort === 'hot') {
      return Number(right.metrics[1]?.value || 0) - Number(left.metrics[1]?.value || 0)
    }
    return right.score - left.score
  })

  const categories = (Object.keys(listCategoryLabels) as InnovationListCategoryKey[]).map((key) => ({
    key,
    label: listCategoryLabels[key],
    count: buildListItems({ chainKey, regionName, category: key, metric }).length,
  }))

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    categories,
    items: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize,
  }
}
