import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { DatePicker, Empty, FloatButton, Pagination, Spin } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import {
  BankOutlined,
  BookOutlined,
  DownOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  IdcardOutlined,
  LeftOutlined,
  UserOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  getCoopOrgList,
  getCoopTalentList,
  getCkeyIndustry,
  getOutputIndicator,
  getPaperList,
  getPatentList,
  getTalentBackground,
  getTalentKeywords,
  type PaperItem,
  type PatentItem,
} from '@/services/talent'
import talentDetailBanner from '@/assets/images/hero/talent-detail-banner.jpg'
import styles from './TalentDetail.module.scss'

type DetailTabKey = 'basic' | 'coopOrg' | 'coopTalent' | 'monitor'

interface DetailTab {
  key: DetailTabKey
  label: string
}

interface RelationItem {
  id: string
  name: string
  org: string
  field: string
  count: number
}

interface CollaborativeTalentCardItem extends RelationItem {
  outputCount: number
  paperCount: number
  patentCount: number
  fieldSecondary: string
}

interface CollaborativeOrgCardItem extends RelationItem {
  typeLabel: string
}

interface TrendData {
  years: string[]
  papers: number[]
  patents: number[]
  standards: number[]
}

interface ActivitySeries {
  years: string[]
  annual: number[]
  cumulative: number[]
}

interface DirectionKeywordLayout {
  text: string
  color: string
  left: string
  top: string
  size?: 'sm' | 'md' | 'lg'
}

const DETAIL_TABS: DetailTab[] = [
  { key: 'basic', label: '基本信息' },
  { key: 'coopOrg', label: '合作机构' },
  { key: 'coopTalent', label: '合作人才' },
  { key: 'monitor', label: '动态监测' },
]

const EMPTY_TREND: TrendData = {
  years: [],
  papers: [],
  patents: [],
  standards: [],
}

const FALLBACK_ACTIVITY_SERIES: ActivitySeries = {
  years: ['1991', '1993', '1994', '1995', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2021', '2022', '2023'],
  annual: [1, 3, 1, 1, 1, 4, 1, 2, 8, 2, 6, 12, 9, 2, 4, 10, 2, 2, 1, 1, 2, 1, 1],
  cumulative: [1, 4, 5, 6, 7, 11, 12, 14, 22, 24, 30, 42, 51, 53, 57, 67, 69, 71, 72, 73, 75, 77, 79],
}

const DIRECTION_KEYWORD_LAYOUTS: DirectionKeywordLayout[] = [
  { text: '无迹卡尔曼滤波', color: '#177a46', left: '50%', top: '12%', size: 'md' },
  { text: '优化', color: '#20b362', left: '24%', top: '28%', size: 'sm' },
  { text: '空间碎片', color: '#e4518f', left: '47%', top: '28%', size: 'md' },
  { text: '机器学习', color: '#8f47ce', left: '69%', top: '28%', size: 'md' },
  { text: '姿态控制', color: '#ef5266', left: '21%', top: '45%', size: 'md' },
  { text: '飞行动力学', color: '#62a320', left: '44%', top: '45%', size: 'md' },
  { text: '协同控制', color: '#19a97f', left: '70%', top: '45%', size: 'md' },
  { text: '故障诊断', color: '#4158c8', left: '24%', top: '62%', size: 'md' },
  { text: '卫星', color: '#ce4ddb', left: '46%', top: '62%', size: 'sm' },
  { text: '航天器', color: '#24bd4e', left: '65%', top: '62%', size: 'md' },
  { text: '小波分析', color: '#4e4acb', left: '35%', top: '80%', size: 'md' },
  { text: '单轴气浮台', color: '#567d18', left: '61%', top: '80%', size: 'md' },
]

const COLLABORATIVE_TALENT_FALLBACKS: CollaborativeTalentCardItem[] = [
  {
    id: 'fallback-yang-yu',
    name: '杨宇',
    org: '北京航空航天大学',
    field: '基于 VxWorks 系统的网络通讯技术开发与应用',
    fieldSecondary: '航空宇航科学与技术',
    count: 27,
    outputCount: 27,
    paperCount: 8,
    patentCount: 18,
  },
  {
    id: 'fallback-yang-zhu',
    name: '杨子',
    org: '北京航空航天大学',
    field: '基于 VxWorks 系统的网络通讯技术开发与应用',
    fieldSecondary: '航空宇航科学与技术',
    count: 27,
    outputCount: 27,
    paperCount: 8,
    patentCount: 18,
  },
  {
    id: 'fallback-lin-zhenhua',
    name: '林振华',
    org: '北京航空航天大学',
    field: '卫星姿态与轨道控制',
    fieldSecondary: '环境科学与工程、力学',
    count: 2,
    outputCount: 2,
    paperCount: 2,
    patentCount: 0,
  },
]

const COLLABORATIVE_GRAPH_FILLERS = [
  '刘波芳',
  '邹家武',
  '张彦',
  '胡新平',
  '张海波',
  '李沛',
  '邓晓',
  '余明华',
  '唐冠群',
  '朱烟敏',
  '俞学锋',
  '姚鹏',
  '李知洪',
  '胡骏鹏',
  '冷建新',
  '张荆',
  '李志军',
  '余华顺',
  '李天乐',
  '郑国斌',
]

void COLLABORATIVE_TALENT_FALLBACKS
void COLLABORATIVE_GRAPH_FILLERS

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\^A\d+\^B/g, '')
    .replace(/%/g, '，')
    .replace(/\s+/g, ' ')
    .trim()
}

function renderTitle(title: string) {
  const prefix = title.slice(0, 2)
  const rest = title.slice(2)
  return (
    <div className={styles.cardTitle}>
      <span className={styles.cardTitleAccent} />
      <span className={styles.cardTitlePrefix}>{prefix}</span>
      <span>{rest}</span>
    </div>
  )
}

function buildActivityOption(data: ActivitySeries): EChartsOption {
  return {
    grid: { left: 42, right: 22, top: 34, bottom: 26 },
    tooltip: { trigger: 'axis' },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 14,
      itemHeight: 8,
      icon: 'rect',
      textStyle: { color: '#7a8595', fontSize: 11 },
      data: ['年度发文量', '累计发文量'],
    },
    xAxis: {
      type: 'category',
      data: data.years,
      boundaryGap: true,
      axisLine: { lineStyle: { color: '#e7edf8' } },
      axisTick: { show: false },
      axisLabel: { color: '#7a8595', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#edf2fb', type: 'dashed' } },
      axisLabel: { color: '#7a8595', fontSize: 11 },
      minInterval: 1,
    },
    series: [
      {
        name: '年度发文量',
        type: 'bar',
        barWidth: 12,
        data: data.annual,
        itemStyle: {
          color: '#5a86f2',
          borderRadius: [3, 3, 0, 0],
        },
      },
      {
        name: '累计发文量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: data.cumulative,
        lineStyle: { color: '#f0c84b', width: 2 },
        itemStyle: { color: '#fff', borderColor: '#f0c84b', borderWidth: 2 },
      },
    ],
  }
}

const TREEMAP_COLORS = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#6ea8fe',
]

/** 研究方向矩形树图（基于 keyword_stat） */
function buildKeywordTreemapOption(keywordStat: { name: string; value: number }[]): EChartsOption {
  // 过滤空 key，前 7 正常展示，第 8 条以后合并为"其他（x个方向）"
  const filtered = keywordStat.filter((item) => item.name && item.name.trim() && item.value > 0)
  let items: { name: string; value: number }[]
  if (filtered.length <= 8) {
    items = filtered
  } else {
    const top7 = filtered.slice(0, 7)
    const otherCount = filtered.length - 7
    const otherValue = filtered.slice(7).reduce((sum, item) => sum + item.value, 0)
    items = [...top7, { name: `其他（${otherCount}个方向）`, value: otherValue }]
  }

  return {
    animation: true,
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number }
        return `<b>${p.name}</b><br/>频次：${p.value}`
      },
    },
    series: [{
      type: 'treemap',
      width: '100%',
      height: '100%',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; treePathInfo?: { treeChildren?: { value: number }[] }[] }
          // 通过 treeAncestors 拿到总值算占比，占比太小只显示名称
          const total = items.reduce((s, i) => s + i.value, 0)
          const ratio = total > 0 ? p.value / total : 0
          if (ratio < 0.04) return ''
          return ratio < 0.08 ? p.name : `${p.name}\n${p.value}`
        },
        fontSize: 11,
        color: '#fff',
        lineHeight: 15,
        align: 'center' as const,
        verticalAlign: 'middle' as const,
        minMargin: 4,
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
        gapWidth: 2,
        borderRadius: 4,
      },
      levels: [{
        itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2 },
      }],
      data: items.map((item, index) => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: TREEMAP_COLORS[index % TREEMAP_COLORS.length] },
      })),
    }],
  }
}

function buildRelationOption(centerLabel: string, items: RelationItem[], accent: string): EChartsOption {
  const orbit = 144
  const nodes = [
    {
      id: 'center',
      name: centerLabel,
      x: 0,
      y: 0,
      symbolSize: 74,
      itemStyle: {
        color: accent,
        shadowBlur: 22,
        shadowColor: `${accent}55`,
      },
      label: { color: '#fff', fontSize: 13, fontWeight: 700 },
    },
    ...items.slice(0, 12).map((item, index, source) => {
      const angle = (Math.PI * 2 * index) / Math.max(source.length, 1) - Math.PI / 2
      const x = Math.cos(angle) * orbit
      const y = Math.sin(angle) * 108
      return {
        id: item.id,
        name: item.name,
        x,
        y,
        symbolSize: Math.max(34, Math.min(62, 30 + item.count * 3)),
        itemStyle: {
          color: `${accent}22`,
          borderColor: accent,
          borderWidth: 1.3,
        },
        label: {
          color: '#445064',
          fontSize: 11,
          formatter: item.name.length > 6 ? `${item.name.slice(0, 6)}...` : item.name,
        },
      }
    }),
  ]

  const links = items.slice(0, 12).map((item) => ({
    source: 'center',
    target: item.id,
    lineStyle: { color: `${accent}44`, width: 1.1, curveness: 0.14 },
  }))

  return {
    animation: false,
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const payload = typeof params === 'object' && params !== null
          ? params as { dataType?: unknown; name?: unknown }
          : {}
        if (payload.dataType === 'edge') return ''
        const currentName = typeof payload.name === 'string' ? payload.name : ''
        const current = items.find((item) => item.name === currentName)
        if (!current) return currentName
        return `${current.name}<br/>${current.org}<br/>${current.field || '暂无标签'}`
      },
    },
    xAxis: { min: -210, max: 210, show: false },
    yAxis: { min: -160, max: 160, show: false },
    series: [
      {
        type: 'graph',
        coordinateSystem: 'cartesian2d',
        roam: false,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        data: nodes,
        links,
        label: { show: true, position: 'inside' },
        lineStyle: { opacity: 0.84 },
        emphasis: { scale: false },
      },
    ],
  }
}
void buildRelationOption

function buildCollaborativeTalentOption(centerLabel: string, items: CollaborativeTalentCardItem[]): EChartsOption {
  const primaryItems = items.slice(0, 6)
  const allNodes = primaryItems.map((item, index) => ({ ...item, order: index, primary: true }))
  const nodes = [
    {
      id: 'center',
      name: centerLabel,
      x: 170,
      y: 160,
      symbolSize: 44,
      itemStyle: {
        color: '#4d8fff',
        shadowBlur: 16,
        shadowColor: 'rgba(77,143,255,0.35)',
      },
      label: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        formatter: centerLabel.length > 4 ? centerLabel.slice(0, 4) : centerLabel,
      },
    },
    ...allNodes.map((item, index, source) => {
      const angle = (Math.PI * 2 * index) / Math.max(source.length, 1) - Math.PI / 2
      const radius = source.length <= 2 ? 78 : source.length <= 4 ? 90 : 100
      return {
        id: item.id,
        name: item.name,
        x: 170 + Math.cos(angle) * radius,
        y: 160 + Math.sin(angle) * Math.max(radius - 16, 66),
        symbolSize: 28,
        itemStyle: {
          color: 'rgba(77, 143, 255, 0.12)',
          borderColor: '#dbe8ff',
          borderWidth: 1,
        },
        label: {
          color: '#66758b',
          fontSize: 10,
          formatter: item.name.length > 3 ? item.name.slice(0, 3) : item.name,
        },
      }
    }),
  ]

  return {
    animation: false,
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const payload = typeof params === 'object' && params !== null
          ? params as { dataType?: unknown; name?: unknown }
          : {}
        if (payload.dataType === 'edge') return ''
        const currentName = typeof payload.name === 'string' ? payload.name : ''
        const current = primaryItems.find((item) => item.name === currentName)
        if (!current) return currentName
        return `${current.name}<br/>${current.org || '暂无机构'}<br/>${current.field || '暂无研究方向'}`
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        roam: false,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        data: nodes,
        links: allNodes.map((item) => ({
          source: 'center',
          target: item.id,
          lineStyle: {
            color: 'rgba(77, 143, 255, 0.26)',
            width: 1.2,
            curveness: 0.12,
          },
        })),
        label: { show: true, position: 'inside' },
        lineStyle: { opacity: 0.88 },
        emphasis: { scale: false },
      },
    ],
  }
}

void buildCollaborativeTalentOption

function buildCollaborativeTalentGraphNodes(centerLabel: string, items: CollaborativeTalentCardItem[]) {
  const presets: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 24, y: 50 }],
    2: [{ x: 24, y: 34 }, { x: 24, y: 66 }],
    3: [{ x: 24, y: 28 }, { x: 18, y: 50 }, { x: 28, y: 72 }],
    4: [{ x: 24, y: 24 }, { x: 16, y: 42 }, { x: 18, y: 66 }, { x: 30, y: 76 }],
    5: [{ x: 26, y: 22 }, { x: 18, y: 34 }, { x: 14, y: 52 }, { x: 18, y: 70 }, { x: 30, y: 80 }],
    6: [{ x: 28, y: 20 }, { x: 20, y: 30 }, { x: 14, y: 46 }, { x: 14, y: 62 }, { x: 22, y: 76 }, { x: 36, y: 82 }],
  }
  const primaryItems = items.slice(0, 6)
  const positions = presets[primaryItems.length] ?? presets[6]

  return [
    {
      id: 'center',
      label: centerLabel.length > 4 ? centerLabel.slice(0, 4) : centerLabel,
      x: 52,
      y: 50,
      center: true,
    },
    ...primaryItems.map((item, index) => ({
      id: item.id,
      label: item.name.length > 3 ? item.name.slice(0, 3) : item.name,
      x: positions[index]?.x ?? 24,
      y: positions[index]?.y ?? 50,
      center: false,
    })),
  ]
}

function buildCollaborativeOrgGraphNodes(centerLabel: string, items: CollaborativeOrgCardItem[]) {
  const presets: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 24, y: 50 }],
    2: [{ x: 24, y: 34 }, { x: 24, y: 66 }],
    3: [{ x: 24, y: 24 }, { x: 16, y: 50 }, { x: 28, y: 76 }],
    4: [{ x: 24, y: 20 }, { x: 14, y: 38 }, { x: 16, y: 66 }, { x: 30, y: 80 }],
    5: [{ x: 26, y: 18 }, { x: 16, y: 30 }, { x: 12, y: 50 }, { x: 18, y: 72 }, { x: 34, y: 82 }],
    6: [{ x: 28, y: 16 }, { x: 18, y: 26 }, { x: 12, y: 42 }, { x: 12, y: 60 }, { x: 20, y: 76 }, { x: 36, y: 84 }],
    7: [{ x: 30, y: 14 }, { x: 20, y: 22 }, { x: 12, y: 36 }, { x: 10, y: 52 }, { x: 14, y: 68 }, { x: 24, y: 82 }, { x: 40, y: 84 }],
  }

  const primaryItems = items.slice(0, 7)
  const positions = presets[primaryItems.length] ?? presets[7]

  return [
    {
      id: 'center',
      label: centerLabel.length > 4 ? centerLabel.slice(0, 4) : centerLabel,
      x: 52,
      y: 50,
      center: true,
    },
    ...primaryItems.map((item, index) => ({
      id: item.id,
      label: item.name.length > 6 ? item.name.slice(0, 6) : item.name,
      x: positions[index]?.x ?? 20,
      y: positions[index]?.y ?? 50,
      center: false,
    })),
  ]
}

function PanelCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className={styles.panelCard}>
      {renderTitle(title)}
      <div className={styles.panelBody}>{children}</div>
    </section>
  )
}

function MonitorCard({
  title,
  total,
  page,
  onPageChange,
  children,
}: {
  title: string
  total: number
  page: number
  onPageChange: (page: number) => void
  children: React.ReactNode
}) {
  return (
    <section className={styles.monitorCard}>
      {renderTitle(title)}
      <div className={styles.panelBody}>{children}</div>
      <div className={styles.monitorFooter}>
        <span className={styles.monitorFooterCount}>
          共计 <strong>{total}</strong> 条
        </span>
        <Pagination
          current={page}
          total={total}
          pageSize={4}
          size="small"
          onChange={onPageChange}
        />
      </div>
    </section>
  )
}

export default function TalentDetail() {
  const { id: talentId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<DetailTabKey>('basic')
  const [paperPage, setPaperPage] = useState(1)
  const [patentPage, setPatentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [paperLoading, setPaperLoading] = useState(false)
  const [patentLoading, setPatentLoading] = useState(false)
  const [introExpanded, setIntroExpanded] = useState(false)
  const [coopTalentPage, setCoopTalentPage] = useState(1)
  const [coopTalentKeyword, setCoopTalentKeyword] = useState('')
  const [coopOrgPage, setCoopOrgPage] = useState(1)
  const [coopOrgKeyword, setCoopOrgKeyword] = useState('')
  const [intro, setIntro] = useState('')
  const [detail, setDetail] = useState<Record<string, unknown>>({})
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordStat, setKeywordStat] = useState<{ name: string; value: number }[]>([])
  const [outputStats, setOutputStats] = useState<Record<string, unknown>>({})
  const [trendData, setTrendData] = useState<TrendData>(EMPTY_TREND)
  const [coopTalents, setCoopTalents] = useState<RelationItem[]>([])
  const [coopOrgs, setCoopOrgs] = useState<RelationItem[]>([])
  const [papers, setPapers] = useState<{ total: number; items: PaperItem[] }>({ total: 0, items: [] })
  const [patents, setPatents] = useState<{ total: number; items: PatentItem[] }>({ total: 0, items: [] })

  // 论文筛选
  const [paperType, setPaperType] = useState<string>('all')
  const [paperYearRange, setPaperYearRange] = useState<[string, string] | null>(null)
  const [paperKeyword, setPaperKeyword] = useState('')

  // 专利筛选
  const [patentType, setPatentType] = useState<string>('all')
  const [patentYearRange, setPatentYearRange] = useState<[string, string] | null>(null)
  const [patentKeyword, setPatentKeyword] = useState('')

  const auid = talentId ?? ''
  const fallbackName = searchParams.get('name') ?? '未知人才'
  const fallbackOrg = searchParams.get('org') ?? ''
  const fallbackDirection = searchParams.get('direction') ?? ''
  const backTarget = searchParams.get('back') || '/industry?tab=innovation'

  // 详情页统一从列表/图谱新开页签进入：无站内历史时关闭页签即可回到来源页（抽屉/气泡状态保留）；
  // 页签内有跳转历史则正常返回；浏览器拒绝关闭（如直接输入网址打开）时回退到产业页
  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1)
      return
    }
    window.close()
    window.setTimeout(() => navigate(backTarget), 200)
  }

  useEffect(() => {
    if (!auid) return
    let cancelled = false

    async function loadTalent() {
      setLoading(true)
      try {
        const [
          backgroundRes,
          keywordRes,
          outputRes,
          coopTalentRes,
          coopOrgRes,
          paperRes,
          patentRes,
        ] = await Promise.all([
          getTalentBackground(auid).catch(() => null),
          getTalentKeywords(auid).catch(() => null),
          getOutputIndicator(auid).catch(() => null),
          getCoopTalentList(auid).catch(() => null),
          getCoopOrgList(auid).catch(() => null),
          getPaperList(auid, 1, 4).catch(() => null),
          getPatentList(auid, 1, 4).catch(() => null),
        ])

        if (cancelled) return

        const bg = backgroundRes as Record<string, unknown> | null
        const rawDetail = (bg?.detail ?? {}) as Record<string, unknown>
        const normalizedIntro = cleanText(bg?.background) || cleanText(rawDetail.INTRO) || cleanText(rawDetail.ABSTRACT)
        const normalizedKeywords = keywordRes as { keywords?: string[] } | null
        const output = (outputRes ?? {}) as Record<string, unknown>
        const coopTalentList = ((coopTalentRes as { data?: Record<string, unknown>[] } | null)?.data ?? [])
        const coopOrgList = ((coopOrgRes as { data?: Record<string, unknown>[] } | null)?.data ?? [])

        setDetail(rawDetail)
        setIntro(normalizedIntro)
        setKeywords(Array.isArray(normalizedKeywords?.keywords) ? normalizedKeywords!.keywords : [])
        // 解析 keyword_stat: [{keyword: count}, ...]
        const rawKwStat = Array.isArray(rawDetail.keyword_stat) ? rawDetail.keyword_stat as Record<string, number>[] : []
        const parsedKwStat = rawKwStat
          .map((entry) => { const [name, value] = Object.entries(entry)[0] ?? []; return name ? { name, value: Number(value ?? 0) } : null })
          .filter((item): item is { name: string; value: number } => item !== null)
          .sort((a, b) => b.value - a.value)
        setKeywordStat(parsedKwStat)
        setOutputStats(output)
        setCoopTalents(
          coopTalentList.map((item, index) => ({
            id: String(item.id ?? item.AUID ?? `talent-${index}`),
            name: cleanText(item.CNAME ?? item.name) || `合作人才${index + 1}`,
            org: cleanText(item.AORG ?? item.org),
            field: cleanText(item.CATE ?? item.field),
            count: Number(item.CNT ?? item.count ?? 0),
          })),
        )
        setCoopOrgs(
          coopOrgList.map((item, index) => ({
            id: String(item.orgId ?? item.id ?? `org-${index}`),
            name: cleanText(item.ORG ?? item.orgName ?? item.name) || `合作机构${index + 1}`,
            org: cleanText(item.TYPE ?? item.type ?? item.region),
            field: cleanText(item.region),
            count: Number(item.CNT ?? item.count ?? 0),
          })),
        )
        if (paperRes) setPapers({ total: paperRes.total, items: paperRes.items })
        if (patentRes) setPatents({ total: patentRes.total, items: patentRes.items })

        const directionKeyword = cleanText(rawDetail.DIRECTION) || fallbackDirection
        if (directionKeyword) {
          const trend = await getCkeyIndustry(directionKeyword.split(/[,，、]/)[0].trim()).catch(() => null)
          if (!cancelled && trend) {
            const years = (trend.g?.key ?? []).map(String)
            setTrendData({
              years,
              papers: (trend.g?.count ?? []).map((item) => Number(item ?? 0)),
              patents: (trend.h?.count ?? []).map((item) => Number(item ?? 0)),
              standards: (trend.b?.count ?? []).map((item) => Number(item ?? 0)),
            })
          }
        } else {
          setTrendData(EMPTY_TREND)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadTalent()
    return () => {
      cancelled = true
    }
  }, [auid, fallbackDirection])

  useEffect(() => {
    if (!auid || paperPage === 1) return
    let cancelled = false

    async function loadPapers() {
      setPaperLoading(true)
      try {
        const result = await getPaperList(auid, paperPage, 4)
        if (!cancelled) {
          setPapers({ total: result.total, items: result.items })
        }
      } finally {
        if (!cancelled) setPaperLoading(false)
      }
    }

    void loadPapers()
    return () => {
      cancelled = true
    }
  }, [auid, paperPage])

  useEffect(() => {
    if (!auid || patentPage === 1) return
    let cancelled = false

    async function loadPatents() {
      setPatentLoading(true)
      try {
        const result = await getPatentList(auid, patentPage, 4)
        if (!cancelled) {
          setPatents({ total: result.total, items: result.items })
        }
      } finally {
        if (!cancelled) setPatentLoading(false)
      }
    }

    void loadPatents()
    return () => {
      cancelled = true
    }
  }, [auid, patentPage])

  useEffect(() => {
    const targets = DETAIL_TABS
      .map((tab) => ({
        key: tab.key,
        element: document.getElementById(tab.key),
      }))
      .filter((entry): entry is { key: DetailTabKey; element: HTMLElement } => Boolean(entry.element))

    if (targets.length === 0) return

    const handleScroll = () => {
      const current = [...targets]
        .reverse()
        .find(({ element }) => element.getBoundingClientRect().top <= 150)
      if (current) {
        setActiveTab((previous) => (previous === current.key ? previous : current.key))
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading])

  const name = cleanText(detail.CNAME) || fallbackName
  const org = cleanText(detail.AORG) || fallbackOrg
  const title = cleanText(detail.TITLE)
  const direction = cleanText(detail.DIRECTION) || fallbackDirection
  const region = [cleanText(detail.PROVINCE), cleanText(detail.CITY)].filter(Boolean).join(' / ') || '暂无地区信息'
  const heroTags = useMemo(() => {
    const result: string[] = []
    if (title) result.push(title)
    if (cleanText(detail.DEGREE)) result.push(cleanText(detail.DEGREE))
    if (cleanText(detail.DIRECTION)) result.push(cleanText(detail.DIRECTION))
    return Array.from(new Set(result.filter(Boolean))).slice(0, 4)
  }, [detail, title])

  const educationText = useMemo(
    () => [cleanText(detail.EDU), cleanText(detail.DEGREE)].filter(Boolean).join(' / ') || '--',
    [detail],
  )
  const majorText = useMemo(() => {
    const cate = Array.isArray(detail.CATE) ? (detail.CATE as string[]).filter(Boolean).join('、') : ''
    return cate || direction || '--'
  }, [detail, direction])
  const nativeText = useMemo(
    () => [cleanText(detail.NATIVEPROVINCE), cleanText(detail.NATIVECITY)].filter(Boolean).join(' / ') || '--',
    [detail],
  )
  const introText = intro || '暂无人才简介信息。'
  const introShouldCollapse = introText.length > 180
  const introDisplayText = introExpanded || !introShouldCollapse
    ? introText
    : `${introText.slice(0, 180)}...`
  const directionSummary = direction || majorText || '该专家主要研究方向为航天器总体设计技术、航天器动力学与控制技术、飞行动力学与姿态模拟技术。'
  const directionKeywords = useMemo(() => {
    // 用 keyword_stat 驱动标签云（不展示 TAGLARG）
    const kwSource = keywordStat.length > 0
      ? keywordStat.map((item) => item.name)
      : [
          ...keywords,
          ...cleanText(detail.DIRECTION).split(/[、,，/；;：:\s]+/).map((item) => item.trim()).filter((item) => item.length >= 2),
        ]
    const uniqueKeywords = Array.from(new Set(kwSource)).slice(0, DIRECTION_KEYWORD_LAYOUTS.length)
    if (uniqueKeywords.length > 0) {
      return DIRECTION_KEYWORD_LAYOUTS.slice(0, Math.min(uniqueKeywords.length, DIRECTION_KEYWORD_LAYOUTS.length)).map((layout, index) => ({
        ...layout,
        text: uniqueKeywords[index] ?? layout.text,
      }))
    }
    return DIRECTION_KEYWORD_LAYOUTS
  }, [detail.DIRECTION, keywords, keywordStat])
  const activitySeries = useMemo<ActivitySeries>(() => {
    if (trendData.years.length > 0) {
      const annual = trendData.years.map((_, index) => {
        const papers = Number(trendData.papers[index] ?? 0)
        const patents = Number(trendData.patents[index] ?? 0)
        const standards = Number(trendData.standards[index] ?? 0)
        return papers + patents + standards
      })
      const hasRealValue = annual.some((value) => value > 0)
      if (hasRealValue) {
        let running = 0
        return {
          years: trendData.years,
          annual,
          cumulative: annual.map((value) => {
            running += value
            return running
          }),
        }
      }
    }
    return FALLBACK_ACTIVITY_SERIES
  }, [trendData])

  const academicInfluenceRow = useMemo(() => ({
    index: 1,
    name,
    hIndex: Number(outputStats.H ?? 0),
    citationCount: 0,
    totalOutputs: Number(outputStats.QIKAN ?? 0) + Number(outputStats.ZHUANLI ?? 0) + Number(outputStats.CHENGGUO ?? 0),
  }), [name, outputStats])

  const paperRows = papers.items
    .filter((item) => {
      if (paperKeyword) {
        const kw = paperKeyword.trim().toLowerCase()
        if (kw && !(item.title || '').toLowerCase().includes(kw)) return false
      }
      if (paperYearRange && item.publishYear) {
        const y = String(item.publishYear)
        if (y < paperYearRange[0] || y > paperYearRange[1]) return false
      }
      // type 暂不区分（API 未返回类型字段）
      void paperType
      return true
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: [item.journal, item.publishYear].filter(Boolean).join(' / ') || '--',
      summary: (item.authors ?? []).join('、') || '暂无作者信息',
      extra: item.doi || '暂无 DOI',
    }))

  const patentRows = patents.items
    .filter((item) => {
      if (patentKeyword) {
        const kw = patentKeyword.trim().toLowerCase()
        if (kw && !(item.title || '').toLowerCase().includes(kw)) return false
      }
      if (patentYearRange && item.applyDate) {
        const y = String(item.applyDate).slice(0, 4)
        if (y < patentYearRange[0] || y > patentYearRange[1]) return false
      }
      if (patentType !== 'all' && item.patentType) {
        const map: Record<string, string> = { invention: '发明', utility: '实用', design: '外观' }
        const target = map[patentType]
        if (target && !item.patentType.includes(target)) return false
      }
      return true
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: [item.patentType, item.applyDate].filter(Boolean).join(' / ') || '--',
      summary: item.status || '暂无状态信息',
      extra: item.patentNo || '暂无专利号',
    }))

  const collaborativeTalentBaseItems = useMemo<CollaborativeTalentCardItem[]>(() => {
    return coopTalents.map((item) => ({
      ...item,
      outputCount: item.count || 0,
      paperCount: Math.max(Math.round((item.count || 0) / 3), 0),
      patentCount: Math.max(Math.round((item.count || 0) / 4), 0),
      fieldSecondary: item.org || '暂无机构信息',
    }))
  }, [coopTalents])

  const filteredCoopTalents = useMemo(() => {
    const keyword = coopTalentKeyword.trim().toLowerCase()
    if (!keyword) return collaborativeTalentBaseItems
    return collaborativeTalentBaseItems.filter((item) =>
      [item.name, item.org, item.field].some((value) => value.toLowerCase().includes(keyword)),
    )
  }, [collaborativeTalentBaseItems, coopTalentKeyword])
  const coopTalentPageSize = 3
  const coopTalentTotalPages = Math.max(1, Math.ceil(filteredCoopTalents.length / coopTalentPageSize))
  const normalizedCoopTalentPage = Math.min(coopTalentPage, coopTalentTotalPages)
  const coopTalentRows = filteredCoopTalents.slice(
    (normalizedCoopTalentPage - 1) * coopTalentPageSize,
    normalizedCoopTalentPage * coopTalentPageSize,
  )
  const collaborativeGraphNodes = useMemo(
    () => buildCollaborativeTalentGraphNodes(name, collaborativeTalentBaseItems),
    [name, collaborativeTalentBaseItems],
  )
  const collaborativeOrgBaseItems = useMemo<CollaborativeOrgCardItem[]>(() => {
    return coopOrgs.map((item) => ({
      ...item,
      typeLabel: item.org || item.field || '暂无机构类型',
    }))
  }, [coopOrgs])
  const filteredCoopOrgs = useMemo(() => {
    const keyword = coopOrgKeyword.trim().toLowerCase()
    if (!keyword) return collaborativeOrgBaseItems
    return collaborativeOrgBaseItems.filter((item) =>
      [item.name, item.org, item.field].some((value) => value.toLowerCase().includes(keyword)),
    )
  }, [collaborativeOrgBaseItems, coopOrgKeyword])
  const coopOrgPageSize = 7
  const coopOrgTotalPages = Math.max(1, Math.ceil(filteredCoopOrgs.length / coopOrgPageSize))
  const normalizedCoopOrgPage = Math.min(coopOrgPage, coopOrgTotalPages)
  const coopOrgRows = filteredCoopOrgs.slice(
    (normalizedCoopOrgPage - 1) * coopOrgPageSize,
    normalizedCoopOrgPage * coopOrgPageSize,
  )
  const collaborativeOrgGraphNodes = useMemo(
    () => buildCollaborativeOrgGraphNodes(name, collaborativeOrgBaseItems),
    [name, collaborativeOrgBaseItems],
  )

  useEffect(() => {
    setCoopTalentPage(1)
  }, [coopTalentKeyword])

  useEffect(() => {
    if (coopTalentPage > coopTalentTotalPages) {
      setCoopTalentPage(coopTalentTotalPages)
    }
  }, [coopTalentPage, coopTalentTotalPages])
  useEffect(() => {
    setCoopOrgPage(1)
  }, [coopOrgKeyword])
  useEffect(() => {
    if (coopOrgPage > coopOrgTotalPages) {
      setCoopOrgPage(coopOrgTotalPages)
    }
  }, [coopOrgPage, coopOrgTotalPages])

  const renderCollaborativeTalentCard = () => (
    <section className={styles.collaborativeCard}>
      <div className={styles.collaborativeLayout}>
        <div className={styles.collaborativeGraph}>
          {filteredCoopTalents.length > 0 ? (
            <div className={styles.collaborativeGraphCanvas}>
              <svg className={styles.collaborativeGraphSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {collaborativeGraphNodes
                  .filter((node) => !node.center)
                  .map((node) => (
                    <line
                      key={`line-${node.id}`}
                      x1="52"
                      y1="50"
                      x2={String(node.x)}
                      y2={String(node.y)}
                    />
                  ))}
              </svg>
              {collaborativeGraphNodes.map((node) => (
                <div
                  key={node.id}
                  className={styles.collaborativeGraphNode}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <span>{node.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyRelation}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无合作人才数据" />
            </div>
          )}
        </div>
        <div className={styles.collaborativeSide}>
          <div className={styles.collaborativeToolbar}>
            <input
              className={styles.collaborativeSearch}
              value={coopTalentKeyword}
              onChange={(event) => setCoopTalentKeyword(event.target.value)}
              placeholder="请输入关键词查询"
            />
          </div>
          <div className={styles.collaborativeList}>
            {coopTalentRows.length > 0 ? (
              coopTalentRows.map((item) => (
                <div
                  key={item.id}
                  className={styles.collaborativeRow}
                  style={item.id.startsWith('talent-') ? undefined : { cursor: 'pointer' }}
                  onClick={item.id.startsWith('talent-')
                    ? undefined
                    : () => window.open(`/industry/talent/${encodeURIComponent(item.id)}?name=${encodeURIComponent(item.name)}`, '_blank')}
                  title={item.id.startsWith('talent-') ? undefined : `查看 ${item.name} 的详情`}
                >
                  <div className={styles.collaborativeAvatar}>
                    <UserOutlined />
                  </div>
                  <div className={styles.collaborativeMain}>
                    <div className={styles.collaborativeName}>{item.name}</div>
                    <div className={styles.collaborativeOrg}>{item.org || '暂无机构信息'}</div>
                    <div className={styles.collaborativeTags}>
                      <span className={`${styles.collaborativeTag} ${styles.collaborativeTagDirection}`}>研究方向</span>
                      <span className={styles.collaborativeField}>{item.field || '暂无研究方向'}</span>
                    </div>
                    <div className={styles.collaborativeTags}>
                      <span className={`${styles.collaborativeTag} ${styles.collaborativeTagSecondary}`}>研究领域</span>
                      <span className={styles.collaborativeField}>{item.fieldSecondary || '暂无研究领域'}</span>
                    </div>
                  </div>
                  <div className={styles.collaborativeStats}>
                    <div className={styles.collaborativeStat}>
                      <strong>{item.outputCount}</strong>
                      <span>总学术成果</span>
                    </div>
                    <div className={styles.collaborativeStat}>
                      <strong>{item.paperCount}</strong>
                      <span>论文</span>
                    </div>
                    <div className={styles.collaborativeStat}>
                      <strong>{item.patentCount}</strong>
                      <span>专利</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyRelation}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无合作人才数据" />
              </div>
            )}
          </div>
          <div className={styles.collaborativeFooter}>
            <span>
              共计 <strong className={styles.collaborativeFooterCount}>{filteredCoopTalents.length}</strong> 条
            </span>
            <div className={styles.collaborativePager}>
              <button
                type="button"
                className={styles.collaborativePagerButton}
                disabled={normalizedCoopTalentPage <= 1}
                onClick={() => setCoopTalentPage((page) => Math.max(page - 1, 1))}
              >
                &lt;
              </button>
              <span className={styles.collaborativePagerCurrent}>{normalizedCoopTalentPage}</span>
              <button
                type="button"
                className={styles.collaborativePagerButton}
                disabled={normalizedCoopTalentPage >= coopTalentTotalPages}
                onClick={() => setCoopTalentPage((page) => Math.min(page + 1, coopTalentTotalPages))}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
  const renderCollaborativeOrgCard = () => (
    <section className={styles.organizationCard}>
      <div className={styles.organizationLayout}>
        <div className={styles.organizationGraph}>
          {filteredCoopOrgs.length > 0 ? (
            <div className={styles.organizationGraphCanvas}>
              <svg className={styles.organizationGraphSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {collaborativeOrgGraphNodes
                  .filter((node) => !node.center)
                  .map((node) => (
                    <line
                      key={`org-line-${node.id}`}
                      x1="52"
                      y1="50"
                      x2={String(node.x)}
                      y2={String(node.y)}
                    />
                  ))}
              </svg>
              {collaborativeOrgGraphNodes.map((node) => (
                <div
                  key={node.id}
                  className={`${styles.organizationGraphNode} ${node.center ? styles.organizationGraphNodeCenter : ''}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <span>{node.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyRelation}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无合作机构数据" />
            </div>
          )}
        </div>
        <div className={styles.organizationSide}>
          <div className={styles.organizationToolbar}>
            <input
              className={styles.organizationSearch}
              value={coopOrgKeyword}
              onChange={(event) => setCoopOrgKeyword(event.target.value)}
              placeholder="请输入关键词查询"
            />
          </div>
          <div className={styles.organizationList}>
            {coopOrgRows.length > 0 ? (
              coopOrgRows.map((item) => (
                <div key={item.id} className={styles.organizationRow}>
                  <div className={styles.organizationIcon}>
                    <BankOutlined />
                  </div>
                  <div className={styles.organizationName}>{item.name}</div>
                  <div className={styles.organizationCount}>
                    <span className={styles.organizationCountLabel}>合作次数:</span>
                    <strong>{item.count}</strong>
                  </div>
                  <button type="button" className={styles.organizationExpandButton} aria-label="展开机构详情">
                    <DownOutlined />
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyRelation}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无合作机构数据" />
              </div>
            )}
          </div>
          <div className={styles.organizationFooter}>
            <span>
              共计 <strong className={styles.organizationFooterCount}>{filteredCoopOrgs.length}</strong> 条
            </span>
            <div className={styles.organizationPager}>
              <button
                type="button"
                className={styles.organizationPagerButton}
                disabled={normalizedCoopOrgPage <= 1}
                onClick={() => setCoopOrgPage((page) => Math.max(page - 1, 1))}
              >
                &lt;
              </button>
              <span className={styles.organizationPagerCurrent}>{normalizedCoopOrgPage}</span>
              <button
                type="button"
                className={styles.organizationPagerButton}
                disabled={normalizedCoopOrgPage >= coopOrgTotalPages}
                onClick={() => setCoopOrgPage((page) => Math.min(page + 1, coopOrgTotalPages))}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderMonitorList = (
    rows: Array<{ id: string; title: string; subtitle: string; summary: string; extra: string }>,
    type: 'paper' | 'patent',
  ) => (
    <div className={styles.monitorList}>
      {rows.length > 0 ? (
        rows.map((row) => (
          <div key={row.id} className={styles.monitorRow}>
            {type === 'paper' ? (
              <div className={`${styles.monitorTypeTag} ${styles.monitorPaper}`}>
                <span>中文</span>
                <span>期刊</span>
              </div>
            ) : (
              <div className={`${styles.monitorTypeTag} ${styles.monitorPatent}`}>
                <span>发明</span>
                <span>专利</span>
              </div>
            )}
            <div className={styles.monitorBody}>
              <div className={styles.monitorTitle}>{row.title}</div>
              <div className={styles.monitorMeta}>{row.subtitle}</div>
              <div className={styles.monitorSummary}>{row.summary}</div>
            </div>
            <div className={styles.monitorExtra}>{row.extra}</div>
          </div>
        ))
      ) : (
        <div className={styles.emptyWrap}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无监测数据" />
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={talentDetailBanner} alt="" />
        </div>
        <div className={styles.heroInner}>
          <div className={styles.heroBreadcrumb} onClick={handleBack}>
            <LeftOutlined />
            返回上一级
          </div>
          <div className={styles.heroBody}>
            <div className={styles.heroCard}>
              <div className={styles.heroAvatar}>
                <UserOutlined />
              </div>
              <div className={styles.heroContent}>
                <div className={styles.heroTitleRow}>
                  <div className={styles.heroTitle}>{name}</div>
                  <div className={styles.heroTagRow}>
                    {heroTags.map((tag) => (
                      <span key={tag} className={styles.heroTag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.heroMeta}>
                  <span><BankOutlined /> {org || '暂无所属机构'}</span>
                  <span><EnvironmentOutlined /> {region}</span>
                </div>
                <div className={styles.heroSummary}>{intro || '暂无人才简介信息。'}</div>
                {direction && <div className={styles.heroDirectionPill}>{direction}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
              onClick={() => {
                setActiveTab(tab.key)
                document.getElementById(tab.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.panelShell}>
          {loading ? (
            <div className={styles.loadingState}>
              <Spin />
            </div>
          ) : (
            <div className={styles.longPage}>
              <section id="basic" className={styles.sectionBlock}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingTitle}>基本信息</div>
                  <div className={styles.sectionHeadingSubtitle}>BASIC INFORMATION</div>
                </div>
                <div className={styles.tabPane}>
                  <PanelCard title="人才简介">
                    <div className={styles.introLayout}>
                      <div className={styles.introInfoList}>
                        <div className={styles.introInfoRow}>
                          <span className={styles.introInfoIcon}><BookOutlined /></span>
                          <span className={styles.introInfoLabel}>教育:</span>
                          <span className={styles.introInfoValue}>{educationText}</span>
                        </div>
                        <div className={styles.introInfoRow}>
                          <span className={styles.introInfoIcon}><IdcardOutlined /></span>
                          <span className={styles.introInfoLabel}>专业:</span>
                          <span className={styles.introInfoValue}>{majorText}</span>
                        </div>
                        <div className={styles.introInfoRow}>
                          <span className={styles.introInfoIcon}><EnvironmentOutlined /></span>
                          <span className={styles.introInfoLabel}>籍贯:</span>
                          <span className={styles.introInfoValue}>{nativeText}</span>
                        </div>
                        <div className={`${styles.introInfoRow} ${styles.introInfoRowSummary}`}>
                          <span className={styles.introInfoIcon}><FileTextOutlined /></span>
                          <span className={styles.introInfoLabel}>简介:</span>
                          <div className={styles.introSummaryBlock}>
                            <div className={styles.introSummary}>{introDisplayText}</div>
                            {introShouldCollapse && (
                              <button
                                type="button"
                                className={styles.introToggle}
                                onClick={() => setIntroExpanded((value) => !value)}
                              >
                                {introExpanded ? '收起' : '展开'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PanelCard>

                  <PanelCard title="研究方向">
                    <div className={styles.directionCard}>
                      <div className={styles.directionIntro}>
                        该专家主要研究方向为: {directionSummary}
                      </div>
                      <div className={styles.directionVisuals}>
                        <div className={styles.directionCloud}>
                          {directionKeywords.map((keyword) => (
                            <span
                              key={`${keyword.text}-${keyword.left}-${keyword.top}`}
                              className={`${styles.directionKeyword} ${keyword.size ? styles[`directionKeyword${keyword.size}`] : ''}`}
                              style={{ color: keyword.color, left: keyword.left, top: keyword.top }}
                            >
                              {keyword.text}
                            </span>
                          ))}
                        </div>
                        <div className={styles.directionTrend}>
                          <ReactECharts option={buildKeywordTreemapOption(keywordStat)} style={{ height: '100%' }} notMerge />
                        </div>
                      </div>
                    </div>
                  </PanelCard>

                  <PanelCard title="学术影响力">
                    <div className={styles.academicCard}>
                      <div className={styles.academicIntro}>说明：H指数越大，学术影响力越大。</div>
                      <div className={styles.academicTable}>
                        <div className={styles.academicTableHead}>
                          <span>序号</span>
                          <span>姓名</span>
                          <span>H指数</span>
                          <span>总引用次数</span>
                          <span>总成果数</span>
                        </div>
                        <div className={styles.academicTableBody}>
                          <span>{academicInfluenceRow.index}</span>
                          <span>{academicInfluenceRow.name}</span>
                          <span>{academicInfluenceRow.hIndex}</span>
                          <span>{academicInfluenceRow.citationCount}</span>
                          <span>{academicInfluenceRow.totalOutputs}</span>
                        </div>
                      </div>
                    </div>
                  </PanelCard>

                  <PanelCard title="科创活跃度">
                    <div className={styles.activityCard}>
                      <div className={styles.activityIntro}>
                        说明：展现人才近年来的科研活跃度，累计曲线稳步上升，则科研产出稳定；如果累计曲线趋势放缓，则科研活跃度下降。
                      </div>
                      <div className={styles.trendWrap}>
                        <ReactECharts option={buildActivityOption(activitySeries)} style={{ height: '100%' }} />
                      </div>
                    </div>
                  </PanelCard>
                </div>
              </section>

              <section id="coopTalent" className={styles.sectionBlock}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingTitle}>合作人才</div>
                  <div className={styles.sectionHeadingSubtitle}>COOPERATIVE TALENTS</div>
                </div>
                {renderCollaborativeTalentCard()}
              </section>

              <section id="coopOrg" className={styles.sectionBlock}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingTitle}>合作机构</div>
                  <div className={styles.sectionHeadingSubtitle}>COOPERATIVE ORGANIZATIONS</div>
                </div>
                {renderCollaborativeOrgCard()}
              </section>

              <section id="monitor" className={styles.sectionBlock}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionHeadingTitle}>动态监测</div>
                  <div className={styles.sectionHeadingSubtitle}>DYNAMIC MONITORING</div>
                </div>
                <div className={styles.tabPane}>
                  <MonitorCard title="论文" total={papers.total} page={paperPage} onPageChange={setPaperPage}>
                    <div className={styles.monitorFilterBar}>
                      <div className={styles.monitorFilterField}>
                        <span className={styles.monitorFilterLabel}>类  型</span>
                        <select className={styles.monitorFilterSelect} value={paperType} onChange={(e) => setPaperType(e.target.value)}>
                          <option value="all">全部</option>
                          <option value="zh">中文期刊</option>
                          <option value="en">英文期刊</option>
                          <option value="conf">会议论文</option>
                          <option value="thesis">学位论文</option>
                        </select>
                      </div>
                      <div className={styles.monitorFilterField}>
                        <span className={styles.monitorFilterLabel}>时间区间</span>
                        <DatePicker.RangePicker
                          picker="year"
                          size="small"
                          className={styles.monitorFilterRange}
                          value={paperYearRange ? [dayjs(paperYearRange[0]), dayjs(paperYearRange[1])] : null}
                          onChange={(values) => {
                            const range = values as [Dayjs | null, Dayjs | null] | null
                            if (range && range[0] && range[1]) {
                              setPaperYearRange([range[0].format('YYYY'), range[1].format('YYYY')])
                            } else {
                              setPaperYearRange(null)
                            }
                          }}
                          allowClear
                        />
                      </div>
                      <div className={styles.monitorFilterField}>
                        <span className={styles.monitorFilterLabel}>关键词</span>
                        <input
                          className={styles.monitorFilterInput}
                          type="text"
                          placeholder="请输入"
                          value={paperKeyword}
                          onChange={(e) => setPaperKeyword(e.target.value)}
                        />
                      </div>
                    </div>
                    {paperLoading ? <div className={styles.loadingBlock}><Spin /></div> : renderMonitorList(paperRows, 'paper')}
                  </MonitorCard>
                  <MonitorCard title="专利" total={patents.total} page={patentPage} onPageChange={setPatentPage}>
                    <div className={styles.monitorFilterBar}>
                      <div className={styles.monitorFilterField}>
                        <span className={styles.monitorFilterLabel}>类  型</span>
                        <select className={styles.monitorFilterSelect} value={patentType} onChange={(e) => setPatentType(e.target.value)}>
                          <option value="all">全部</option>
                          <option value="invention">发明专利</option>
                          <option value="utility">实用新型</option>
                          <option value="design">外观设计</option>
                        </select>
                      </div>
                      <div className={styles.monitorFilterField}>
                        <span className={styles.monitorFilterLabel}>时间区间</span>
                        <DatePicker.RangePicker
                          picker="year"
                          size="small"
                          className={styles.monitorFilterRange}
                          value={patentYearRange ? [dayjs(patentYearRange[0]), dayjs(patentYearRange[1])] : null}
                          onChange={(values) => {
                            const range = values as [Dayjs | null, Dayjs | null] | null
                            if (range && range[0] && range[1]) {
                              setPatentYearRange([range[0].format('YYYY'), range[1].format('YYYY')])
                            } else {
                              setPatentYearRange(null)
                            }
                          }}
                          allowClear
                        />
                      </div>
                      <div className={styles.monitorFilterField}>
                        <span className={styles.monitorFilterLabel}>关键词</span>
                        <input
                          className={styles.monitorFilterInput}
                          type="text"
                          placeholder="请输入"
                          value={patentKeyword}
                          onChange={(e) => setPatentKeyword(e.target.value)}
                        />
                      </div>
                    </div>
                    {patentLoading ? <div className={styles.loadingBlock}><Spin /></div> : renderMonitorList(patentRows, 'patent')}
                  </MonitorCard>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      <FloatButton.BackTop visibilityHeight={260} style={{ insetInlineEnd: 28, bottom: 132 }} />
    </div>
  )
}
