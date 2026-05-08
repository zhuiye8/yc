import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Spin, Drawer, Cascader, Table, Select } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  TeamOutlined,
  BankOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  LoadingOutlined,
  EnvironmentOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import IndustryChainGraph from '@/components/IndustryTree'
import { industryChainGraphData } from '@/mock/industryChainGraphData'
import type { IndustryGraphNode } from '@/mock/data'
import { getChainCoverage, clearCoverageCache } from '@/services/coverageCache'
import { searchChainTalents } from '@/services/chainTalent'
import { getChainOrgProvinceDistribution, searchChainOrgs } from '@/services/chainOrg'
import { normalizeProvinceName, resolveIndustryRegionFromCascader } from '@/services/industryRegion'
import { regionOptions } from '@/mock/regions'
import industryKeywords from '@/data/industry-keywords.json'
import { orgDrawerColumns, expertDrawerColumns } from '@/components/IndustryDrawerColumns'
import { ORG_TAG_FILTER_OPTIONS, normalizeOrgTagFilter } from '@/services/industryOrgTags'
import industryWarningScoreIcon from '@/assets/images/icons/industry-warning-score-icon.png'
import industryLocalizationRateIcon from '@/assets/images/icons/industry-localization-rate-icon.png'
import industryChainEnterprisesIcon from '@/assets/images/icons/industry-chain-enterprises-icon.png'
import industryChainTalentsIcon from '@/assets/images/icons/industry-chain-talents-icon.png'
import industryOverviewChainIcon from '@/assets/images/icons/industry-overview-chain-icon.png'
import industryOverviewEnterpriseIcon from '@/assets/images/icons/industry-overview-enterprise-icon.png'
import industryOverviewRegionIcon from '@/assets/images/icons/industry-overview-region-icon.png'
import industryOverviewCoverageIcon from '@/assets/images/icons/industry-overview-coverage-icon.png'
import styles from './Industry.module.scss'

interface IndustryGraphProps {
  chainKey: string
  selectedCity?: string
  regionValue?: string[]
  onRegionChange?: (value: string[]) => void
}

interface ChainListState {
  orgLoading: boolean
  expertLoading: boolean
  orgs: Record<string, unknown>[]
  orgTotal: number
  localOrgTotal: number
  experts: Record<string, unknown>[]
  expertTotal: number
}

interface ChainDrawerState {
  visible: boolean
  type: 'orgs' | 'experts'
  city: string
  regionValue: string[]
  queryChain?: string
  orgTag: string
  loading: boolean
  data: Record<string, unknown>[]
  total: number
  page: number
}

interface CountableGraphNode {
  id?: string
  name?: string
  children?: CountableGraphNode[]
}

interface CountableGraphSet {
  upstream?: { root: CountableGraphNode }
  midstream?: { root: CountableGraphNode }
  downstream?: { root: CountableGraphNode }
}

interface ChartBarItem {
  name: string
  value: number
}

interface ProvinceDistributionState {
  loading: boolean
  items: ChartBarItem[]
  total: number
}

interface TalentChartState {
  loading: boolean
  items: ChartBarItem[]
  total: number
}

interface EChartsClickEvent {
  name?: unknown
}

const chainKeyToLabel: Record<string, string> = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
}

const allRegionOptions = [
  { value: '__all__', label: '全国' },
  ...regionOptions,
]

const CHART_BAR_COLORS = ['#2A76FC', '#13C1C1']

function formatChartValue(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`
  return value.toLocaleString()
}

function buildBarChartOption(items: ChartBarItem[], compact = false): EChartsOption {
  return {
    animation: true,
    grid: {
      top: compact ? 34 : 36,
      right: compact ? 12 : 18,
      bottom: compact ? 46 : 38,
      left: compact ? 46 : 50,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: unknown) => `${Number(value || 0).toLocaleString()}`,
    },
    xAxis: {
      type: 'category',
      data: items.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5edf8' } },
      axisLabel: {
        color: '#6b7890',
        fontSize: compact ? 11 : 12,
        interval: 0,
        width: compact ? 56 : 62,
        overflow: 'truncate',
      },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#e8eff8' } },
      axisLabel: {
        color: '#8a94a6',
        fontSize: 12,
        formatter: (value: number) => formatChartValue(value),
      },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: compact ? 32 : 18,
        barCategoryGap: compact ? '32%' : '16%',
        data: items.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: CHART_BAR_COLORS[index % CHART_BAR_COLORS.length],
            borderRadius: [2, 2, 0, 0],
          },
        })),
      },
    ],
  }
}

function collectGraphNodes(graphData?: CountableGraphSet): IndustryGraphNode[] {
  if (!graphData) return []

  const streams = ['upstream', 'midstream', 'downstream'] as const
  const result: IndustryGraphNode[] = []
  const walk = (node?: CountableGraphNode) => {
    if (!node?.name) return
    result.push(node as IndustryGraphNode)
    node.children?.forEach(walk)
  }

  streams.forEach((stream) => walk(graphData[stream]?.root))
  return result
}

function findRegionValueByProvinceName(provinceName: string) {
  const normalized = normalizeProvinceName(provinceName)
  const matched = regionOptions.find((option) => {
    const optionLabel = String(option.label ?? '')
    return normalizeProvinceName(optionLabel) === normalized || optionLabel === provinceName
  })

  return matched ? [String(matched.value)] : []
}

function countGraphLevels(chainKeys: string[], fallbackGraphData?: CountableGraphSet): number[] {
  const counts = [0, 0, 0, 0]
  const streams = ['upstream', 'midstream', 'downstream'] as const
  const graphSets = chainKeys
    .map((key) => industryChainGraphData[key] as CountableGraphSet | undefined)
    .filter((item): item is CountableGraphSet => Boolean(item))

  if (graphSets.length === 0 && fallbackGraphData) graphSets.push(fallbackGraphData)

  const walk = (node: CountableGraphNode | undefined, depth: number) => {
    if (!node) return
    const levelIndex = Math.min(depth, counts.length - 1)
    counts[levelIndex] += 1
    node.children?.forEach((child) => walk(child, depth + 1))
  }

  graphSets.forEach((graphSet) => {
    streams.forEach((stream) => {
      walk(graphSet[stream]?.root, 0)
    })
  })

  return counts
}

function stripLevelPrefix(name: string): string {
  return name.replace(/^(上游|中游|下游)[：:]/, '').trim()
}

function collectFirstLevelNames(chainKeys: string[], fallbackGraphData?: CountableGraphSet): string[] {
  const streams = ['upstream', 'midstream', 'downstream'] as const
  const graphSets = chainKeys
    .map((key) => industryChainGraphData[key] as CountableGraphSet | undefined)
    .filter((item): item is CountableGraphSet => Boolean(item))

  if (graphSets.length === 0 && fallbackGraphData) graphSets.push(fallbackGraphData)

  return graphSets.flatMap((graphSet) =>
    streams
      .map((stream) => graphSet[stream]?.root)
      .filter((node): node is CountableGraphNode & { name?: string } => Boolean(node))
      .map((node) => stripLevelPrefix(String(node.name || '')))
      .filter(Boolean),
  )
}

function formatLevelBreakdown(counts: number[]): string {
  const labels = ['二级环节', '三级环节', '四级环节']
  return counts
    .slice(1)
    .map((count, index) => (count > 0 ? `${count.toLocaleString()}个${labels[index]}` : ''))
    .filter(Boolean)
    .join('、')
}

function cleanText(value: unknown): string {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join('、')
  return String(value ?? '').replace(/^\[|]$/g, '').trim()
}

function getTalentField(record: Record<string, unknown>, fallback: string): string {
  const candidates = [
    record.DIRECTION,
    record.direction,
    record.CATE,
    record.cate,
    record.FIELD,
    record.field,
    record.research_fields,
    record.KEYWORDS,
    record.keywords,
  ]

  const result = candidates.map(cleanText).find(Boolean)
  return result || fallback || '—'
}

export default function IndustryGraph({
  chainKey,
  selectedCity,
  regionValue: externalRegionValue,
  onRegionChange,
}: IndustryGraphProps) {
  const navigate = useNavigate()
  const graphData = useMemo(() => industryChainGraphData[chainKey], [chainKey])

  const nodeKeywords = useMemo(() => {
    const chainLabel = chainKeyToLabel[chainKey]
    if (!chainLabel) return undefined
    return (industryKeywords as Record<string, Record<string, { keywords: string[]; queryString: string }>>)[chainLabel]
  }, [chainKey])

  const chainLabel = chainKeyToLabel[chainKey] || ''
  const chainLevelCounts = useMemo(
    () => countGraphLevels([chainKey], graphData as CountableGraphSet | undefined),
    [chainKey, graphData],
  )
  const firstLevelNames = useMemo(
    () => collectFirstLevelNames([chainKey], graphData as CountableGraphSet | undefined),
    [chainKey, graphData],
  )
  const localRegion = useMemo(() => resolveIndustryRegionFromCascader(externalRegionValue), [externalRegionValue])
  const localCity = localRegion.city || selectedCity || '宜昌'
  const coverageProvince = localRegion.province || undefined
  const coverageCity = localRegion.city || selectedCity || undefined
  const [selectedTalentNode, setSelectedTalentNode] = useState<{ chainKey: string; name: string } | null>(null)

  const [coverageState, setCoverageState] = useState<{
    loading: boolean
    checked: number
    covered: number
    total: number
    rate: number
    chainStatus: 'strong' | 'weak' | 'missing'
    chainOrgTotal: number
    nodeOrgCounts: Record<string, number>
  }>({
    loading: false,
    checked: 0,
    covered: 0,
    total: 0,
    rate: 0,
    chainStatus: 'strong',
    chainOrgTotal: 0,
    nodeOrgCounts: {},
  })

  useEffect(() => {
    if (!nodeKeywords || !chainLabel) return

    const nodeCount = Object.keys(nodeKeywords).length

    let cancelled = false

    void (async () => {
      await Promise.resolve()
      if (cancelled) return

      setCoverageState((prev) => ({
        ...prev,
        loading: true,
        checked: 0,
        covered: 0,
        total: nodeCount,
        nodeOrgCounts: {},
      }))

      getChainCoverage(
        chainKey,
        chainLabel,
        coverageProvince,
        coverageCity,
        (checked, total) => {
          if (!cancelled) {
            setCoverageState((prev) => ({ ...prev, checked, total }))
          }
        },
      )
        .then((result) => {
          if (cancelled) return
          setCoverageState({
            loading: false,
            checked: result.total,
            covered: result.covered,
            total: result.total,
            rate: result.rate,
            chainStatus: result.chainStatus,
            chainOrgTotal: result.chainOrgTotal,
            nodeOrgCounts: result.nodeOrgCounts,
          })
        })
        .catch(() => {
          if (!cancelled) {
            setCoverageState((prev) => ({ ...prev, loading: false }))
          }
        })
    })()

    return () => {
      cancelled = true
    }
  }, [chainKey, chainLabel, coverageCity, coverageProvince, nodeKeywords])

  useEffect(() => {
    clearCoverageCache()
  }, [chainKey, coverageCity, coverageProvince])

  const [chainList, setChainList] = useState<ChainListState>({
    orgLoading: false,
    expertLoading: false,
    orgs: [],
    orgTotal: 0,
    localOrgTotal: 0,
    experts: [],
    expertTotal: 0,
  })
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const graphAreaRef = useRef<HTMLDivElement | null>(null)
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false)
  const [enterpriseChart, setEnterpriseChart] = useState<ProvinceDistributionState>({
    loading: false,
    items: [],
    total: 0,
  })

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    let cancelled = false

    debounceTimerRef.current = setTimeout(() => {
      if (!nodeKeywords) {
        setChainList({
          orgLoading: false,
          expertLoading: false,
          orgs: [],
          orgTotal: 0,
          localOrgTotal: 0,
          experts: [],
          expertTotal: 0,
        })
        return
      }

      setChainList({
        orgLoading: true,
        expertLoading: true,
        orgs: [],
        orgTotal: 0,
        localOrgTotal: 0,
        experts: [],
        expertTotal: 0,
      })

      void (async () => {
        const orgAggregate = await searchChainOrgs(
          chainLabel || chainKey,
          localRegion.province,
          localRegion.city,
          undefined,
          1,
          10,
        ).catch(() => ({ items: [], total: 0 }))
        if (cancelled) return

        setChainList({
          orgLoading: false,
          expertLoading: true,
          orgs: orgAggregate.items,
          orgTotal: orgAggregate.total,
          localOrgTotal: orgAggregate.total,
          experts: [],
          expertTotal: 0,
        })

        // chain-talents/search — 后端按全子节点去重，一次请求
        const expertAggregate = await searchChainTalents(chainLabel || chainKey, undefined, localRegion.city || undefined, 1, 8)
          .then((r) => ({ items: r.items, total: r.total }))
          .catch(() => ({ items: [] as Record<string, unknown>[], total: 0 }))
        if (cancelled) return

        setChainList((prev) => ({
          ...prev,
          expertLoading: false,
          experts: expertAggregate.items,
          expertTotal: expertAggregate.total,
        }))
      })()
    }, 500)

    return () => {
      cancelled = true
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [chainKey, chainLabel, localRegion, nodeKeywords])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      setEnterpriseChart({ loading: true, items: [], total: 0 })

      try {
        const result = await getChainOrgProvinceDistribution(chainLabel || chainKey).catch(() => null)
        if (cancelled) return
        const chartItems = (result?.items || [])
          .filter((item) => item.name && item.total > 0)
          .map((item) => ({ name: item.name, value: item.total }))
        setEnterpriseChart({
          loading: false,
          items: chartItems,
          total: result?.total || chartItems.reduce((sum, item) => sum + item.value, 0),
        })
      } catch {
        if (!cancelled) setEnterpriseChart({ loading: false, items: [], total: 0 })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chainKey, chainLabel])

  const graphNodes = useMemo(
    () => collectGraphNodes(graphData as CountableGraphSet | undefined),
    [graphData],
  )
  const baseTalentNodeNames = useMemo(() => {
    const queryableNames = new Set(Object.keys(nodeKeywords || {}))
    const orderedNames = graphNodes
      .map((node) => stripLevelPrefix(cleanText(node.name)))
      .filter((name) => name && queryableNames.has(name))

    return orderedNames.slice(0, 5)
  }, [graphNodes, nodeKeywords])
  const [talentChart, setTalentChart] = useState<TalentChartState>({
    loading: false,
    items: [],
    total: 0,
  })

  useEffect(() => {
    let cancelled = false
    const nodeNames = baseTalentNodeNames

    void (async () => {
      await Promise.resolve()
      if (cancelled) return

      if (!chainLabel) {
        setTalentChart({ loading: false, items: [], total: 0 })
        return
      }

      setTalentChart((prev) => ({
        loading: true,
        items: nodeNames.map((name) => ({
          name,
          value: prev.items.find((item) => item.name === name)?.value ?? 0,
        })),
        total: prev.total,
      }))

      const [chainTotal, nodeTotals] = await Promise.all([
        searchChainTalents(chainLabel, undefined, undefined, 1, 1)
          .then((result) => result.total)
          .catch(() => 0),
        Promise.all(
          nodeNames.map((name) =>
            searchChainTalents(name, undefined, undefined, 1, 1)
              .then((result) => ({ name, value: result.total }))
              .catch(() => ({ name, value: 0 })),
          ),
        ),
      ])

      if (cancelled) return
      setTalentChart({
        loading: false,
        items: nodeTotals,
        total: chainTotal,
      })
    })()

    return () => {
      cancelled = true
    }
  }, [chainLabel, baseTalentNodeNames])

  useEffect(() => {
    let cancelled = false
    const nodeName = selectedTalentNode?.chainKey === chainKey ? selectedTalentNode.name : ''

    if (!nodeName) return () => {
      cancelled = true
    }

    void (async () => {
      await Promise.resolve()
      if (cancelled) return

      setTalentChart((prev) => {
        if (prev.items.length === 0) return prev

        return {
          ...prev,
          items: [
            ...prev.items.slice(0, 4),
            {
              name: nodeName,
              value: prev.items.find((item) => item.name === nodeName)?.value ?? 0,
            },
          ],
        }
      })

      const nodeTotal = await searchChainTalents(nodeName, undefined, undefined, 1, 1)
        .then((result) => result.total)
        .catch(() => 0)

      if (cancelled) return
      setTalentChart((prev) => {
        if (prev.items[4]?.name !== nodeName) return prev

        return {
          ...prev,
          items: [
            ...prev.items.slice(0, 4),
            { name: nodeName, value: nodeTotal },
          ],
        }
      })
    })()

    return () => {
      cancelled = true
    }
  }, [chainKey, selectedTalentNode])

  const [chainDrawer, setChainDrawer] = useState<ChainDrawerState>({
    visible: false,
    type: 'orgs',
    city: '',
    regionValue: [],
    queryChain: undefined,
    orgTag: '',
    loading: false,
    data: [],
    total: 0,
    page: 1,
  })

  const loadChainDrawerData = useCallback((type: 'orgs' | 'experts', regionValue: string[], page: number, queryChain?: string, orgTag = '') => {
    setChainDrawer((prev) => ({ ...prev, loading: true }))
    if (!nodeKeywords) {
      setChainDrawer((prev) => ({ ...prev, loading: false, data: [], total: 0, page }))
      return
    }

    void (async () => {
      const region = resolveIndustryRegionFromCascader(regionValue)
      if (type === 'orgs') {
        const tagFilter = normalizeOrgTagFilter(orgTag)
        const result = await searchChainOrgs(
          queryChain || chainLabel || chainKey,
          region.province,
          region.city,
          tagFilter || undefined,
          page,
          10,
        ).catch(() => ({ items: [], total: 0 }))

        setChainDrawer((prev) => ({ ...prev, loading: false, data: result.items, total: result.total, page }))
        return
      }

      const talentChain = queryChain || chainKeyToLabel[chainKey] || chainKey
      const result = await searchChainTalents(talentChain, undefined, region.city || undefined, page, 10)
        .then((r) => ({ items: r.items, total: r.total }))
        .catch(() => ({ items: [] as Record<string, unknown>[], total: 0 }))
      setChainDrawer((prev) => ({ ...prev, loading: false, data: result.items, total: result.total, page }))
    })().catch(() => {
      setChainDrawer((prev) => ({ ...prev, loading: false, data: [], total: 0 }))
    })
  }, [chainKey, chainLabel, nodeKeywords])

  const openChainDrawer = useCallback((type: 'orgs' | 'experts', regionOverride?: string[]) => {
    const region = regionOverride || externalRegionValue || ['hubei', 'yichang']
    const nextRegion = resolveIndustryRegionFromCascader(region)
    setChainDrawer({
      visible: true,
      type,
      city: nextRegion.city || '',
      regionValue: region,
      queryChain: undefined,
      orgTag: '',
      loading: true,
      data: [],
      total: 0,
      page: 1,
    })
    loadChainDrawerData(type, region, 1, undefined, '')
  }, [externalRegionValue, loadChainDrawerData])

  const openEnterpriseProvinceDrawer = useCallback((provinceName: string) => {
    const region = findRegionValueByProvinceName(provinceName)
    openChainDrawer('orgs', region.length > 0 ? region : undefined)
  }, [openChainDrawer])

  const openTalentNodeDrawer = useCallback((nodeName: string) => {
    setChainDrawer({
      visible: true,
      type: 'experts',
      city: nodeName,
      regionValue: [],
      queryChain: nodeName,
      orgTag: '',
      loading: true,
      data: [],
      total: 0,
      page: 1,
    })

    loadChainDrawerData('experts', [], 1, nodeName)
  }, [loadChainDrawerData])

  const handleEnterpriseChartClick = useCallback((event: EChartsClickEvent) => {
    const provinceName = String(event.name || '')
    if (!provinceName) return
    openEnterpriseProvinceDrawer(provinceName)
  }, [openEnterpriseProvinceDrawer])

  const handleTalentChartClick = useCallback((event: EChartsClickEvent) => {
    const nodeName = String(event.name || '')
    if (!nodeName) return
    openTalentNodeDrawer(nodeName)
  }, [openTalentNodeDrawer])

  const handleGraphNodeContextSelect = useCallback((node: IndustryGraphNode) => {
    const talentNodeName = stripLevelPrefix(cleanText(node.name))
    if (talentNodeName) setSelectedTalentNode({ chainKey, name: talentNodeName })
  }, [chainKey])

  const handleChainDrawerRegionChange = useCallback((val: string[]) => {
    if (!val || val.length === 0 || val[0] === '__all__') {
      setChainDrawer((prev) => {
      loadChainDrawerData(prev.type, [], 1, prev.queryChain, prev.orgTag)
        return { ...prev, city: '', regionValue: [], page: 1 }
      })
      return
    }

    const nextRegion = resolveIndustryRegionFromCascader(val)
    setChainDrawer((prev) => {
      loadChainDrawerData(prev.type, val, 1, prev.queryChain, prev.orgTag)
      return { ...prev, city: nextRegion.city || '', regionValue: val, page: 1 }
    })
  }, [loadChainDrawerData])

  const handleChainDrawerOrgTagChange = useCallback((value?: string) => {
    const nextTag = normalizeOrgTagFilter(value)

    setChainDrawer((prev) => {
      loadChainDrawerData(prev.type, prev.regionValue, 1, prev.queryChain, nextTag)
      return {
        ...prev,
        orgTag: nextTag,
        page: 1,
      }
    })
  }, [loadChainDrawerData])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsGraphFullscreen(document.fullscreenElement === graphAreaRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleGraphFullscreen = useCallback(() => {
    if (document.fullscreenElement === graphAreaRef.current) {
      void document.exitFullscreen?.()
      return
    }

    void graphAreaRef.current?.requestFullscreen?.()
  }, [])

  const handleGraphDownload = useCallback(() => {
    const target = graphAreaRef.current
    if (!target) return

    const canvases = Array.from(target.querySelectorAll('canvas'))
    if (canvases.length === 0) return

    const targetRect = target.getBoundingClientRect()
    const scale = window.devicePixelRatio || 1
    const output = document.createElement('canvas')
    output.width = Math.max(1, Math.round(targetRect.width * scale))
    output.height = Math.max(1, Math.round(targetRect.height * scale))

    const ctx = output.getContext('2d')
    if (!ctx) return

    ctx.scale(scale, scale)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetRect.width, targetRect.height)

    canvases.forEach((canvas) => {
      const rect = canvas.getBoundingClientRect()
      ctx.drawImage(canvas, rect.left - targetRect.left, rect.top - targetRect.top, rect.width, rect.height)
    })

    const link = document.createElement('a')
    link.download = `${chainLabel || '产业链图谱'}-${new Date().toISOString().slice(0, 10)}.png`
    link.href = output.toDataURL('image/png')
    link.click()
  }, [chainLabel])

  const openEnterpriseDetail = useCallback((record: Record<string, unknown>) => {
    const name = String(record.NAME || record.name || '未知企业')
    const id = String(record.ID || record.id || name)
    const params = new URLSearchParams({
      name,
      region: `${record.PROV || record.prov || ''}${record.CITY || record.city ? ` ${record.CITY || record.city}` : ''}`.trim(),
      tags: ((record.TAGS || record.tags || []) as string[]).join(','),
      back: '/industry',
    })
    navigate(`/industry/enterprise/${encodeURIComponent(id)}?${params.toString()}`)
  }, [navigate])

  const openTalentDetail = useCallback((record: Record<string, unknown>) => {
    const id = String(record.ID || record.id || record.auid || '')
    if (!id) return
    navigate(`/industry/talent/${encodeURIComponent(id)}`)
  }, [navigate])

  if (!graphData) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无该产业链图谱数据</div>
  }

  const localizationRate = coverageState.rate
  const localizationRateStr = localizationRate > 0 ? localizationRate.toFixed(1) : '0'
  const orgListLoadingText = coverageState.loading
    ? `正在统计${localCity}最小子节点，请稍候...`
    : '正在按最小子节点汇总链上企业和链上人才...'
  const expertListLoadingText = '正在拉取链上人才预览数据...'
  const analysisLabel = coverageState.loading
    ? `正在统计${localCity}强弱缺链（${coverageState.checked}/${coverageState.total}）`
    : undefined
  const subChainTotal = coverageState.total || (nodeKeywords ? Object.keys(nodeKeywords).length : 0)
  const firstLevelText = firstLevelNames.join('、')
  const levelBreakdown = formatLevelBreakdown(chainLevelCounts)
  const overviewCards = [
    {
      icon: industryOverviewChainIcon,
      value: coverageState.loading ? '统计中' : subChainTotal.toLocaleString(),
      unit: coverageState.loading ? '' : '个',
      label: '全产业链环节',
    },
    {
      icon: industryOverviewEnterpriseIcon,
      value: chainList.orgLoading ? '统计中' : chainList.orgTotal.toLocaleString(),
      unit: chainList.orgLoading ? '' : '家',
      label: '企业数量',
    },
    {
      icon: industryOverviewCoverageIcon,
      value: coverageState.loading ? '统计中' : `${localizationRateStr}%`,
      unit: '',
      label: '产业覆盖度',
    },
  ]
  const enterpriseChartOption = buildBarChartOption(enterpriseChart.items)
  const talentChartOption = buildBarChartOption(talentChart.items, true)

  return (
    <>
      <div className={styles.chainOverview}>
        <div className={styles.chainOverviewHeader}>
          <div className={styles.chainOverviewTitleGroup}>
            <span className={styles.chainOverviewTitle}>{chainLabel}</span>
            <div className={styles.chainOverviewRegionWrap}>
              <img src={industryOverviewRegionIcon} alt="" className={styles.chainOverviewRegionIcon} />
              <Cascader
                options={regionOptions}
                value={externalRegionValue}
                onChange={(value) => onRegionChange?.((value || []) as string[])}
                size="small"
                className={styles.chainOverviewRegion}
                placeholder="全国"
              />
            </div>
          </div>
          <span className={styles.chainOverviewDate}>数据更新至:2026年04月</span>
        </div>
        <div className={styles.chainOverviewDesc}>
          {chainLabel}产业链共{subChainTotal.toLocaleString()}个环节，包含{chainLevelCounts[0] > 0 ? `${chainLevelCounts[0]}个一级环节（${firstLevelText}）` : ''}{levelBreakdown ? `、${levelBreakdown}` : ''}。
        </div>
        <div className={styles.chainOverviewCards}>
          {overviewCards.map((card) => (
            <div className={styles.chainOverviewCard} key={card.label}>
              <div>
                <div className={styles.chainOverviewValue}>
                  {card.value}
                  {card.unit && <span>{card.unit}</span>}
                </div>
                <div className={styles.chainOverviewCardLabel}>{card.label}</div>
              </div>
              <img src={card.icon} alt="" className={styles.chainOverviewIcon} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.graphLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.graphArea} ref={graphAreaRef}>
          <div className={styles.graphToolbar}>
            <Button
              size="small"
              icon={isGraphFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={handleGraphFullscreen}
            >
              {isGraphFullscreen ? '退出全屏' : '全屏'}
            </Button>
            <Button size="small" icon={<DownloadOutlined />} onClick={handleGraphDownload}>
              下载图谱
            </Button>
          </div>
          <div className={styles.legend}>
            <span><span className={styles.legendDot} style={{ background: '#2468F2' }} /> 强链</span>
            <span><span className={styles.legendDot} style={{ background: '#7BA3FA' }} /> 弱链</span>
            <span><span className={styles.legendDot} style={{ background: '#BFC8D6' }} /> 缺链</span>
            {coverageState.loading && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  color: '#faad14',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <LoadingOutlined spin style={{ fontSize: 12 }} />
                正在统计{localCity}强弱缺链（{coverageState.checked}/{coverageState.total}）
              </span>
            )}
          </div>

          <IndustryChainGraph
            key={chainKey}
            chainKey={chainKey}
            graphData={graphData}
            nodeKeywords={nodeKeywords}
            selectedCity={selectedCity}
            regionValue={externalRegionValue}
            nodeOrgCounts={coverageState.nodeOrgCounts}
            analyzing={coverageState.loading}
            analysisLabel={analysisLabel}
            onNodeContextSelect={handleGraphNodeContextSelect}
          />
        </div>

        <div className={`${styles.panelCard} ${styles.chainEnterpriseCard}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <img src={industryChainEnterprisesIcon} alt="" className={styles.sectionIconImage} />
              链上企业
              {chainList.localOrgTotal > 0 && (
                <span style={{ color: '#999', fontWeight: 400, fontSize: 13, marginLeft: 4 }}>
                  （{localCity} {chainList.localOrgTotal}家）
                </span>
              )}
            </div>
            <Button className={styles.listAddButton} type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>

          {enterpriseChart.loading ? (
            <div className={styles.listState}>
              <Spin indicator={<LoadingOutlined spin />} />
              <div className={styles.listStateText}>{orgListLoadingText}</div>
            </div>
          ) : enterpriseChart.items.length > 0 ? (
            <div className={styles.chartBox}>
              <ReactECharts
                option={enterpriseChartOption}
                className={styles.enterpriseBarChart}
                style={{ height: 220 }}
                onEvents={{ click: handleEnterpriseChartClick }}
                notMerge
              />
              <table className={styles.enterpriseTable}>
                <thead>
                  <tr>
                    <th>企业</th>
                    <th>地区</th>
                  </tr>
                </thead>
                <tbody>
                  {chainList.orgs.slice(0, 4).map((org, index) => (
                    <tr key={index} onClick={() => openEnterpriseDetail(org)}>
                      <td title={String(org.NAME || '')}>
                        {String(org.NAME || org.name || '未知')}
                      </td>
                      <td>{String(org.PROV || org.prov || '')}{org.CITY || org.city ? ` ${org.CITY || org.city}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className={styles.enterpriseTable}>
                <thead>
                  <tr>
                    <th>企业</th>
                    <th>地区</th>
                  </tr>
                </thead>
                <tbody>
                  {chainList.orgs.slice(4, 7).map((org, index) => (
                    <tr key={index} onClick={() => openEnterpriseDetail(org)}>
                      <td title={String(org.NAME || org.name || '')}>
                        {String(org.NAME || org.name || '未知')}
                      </td>
                      <td>{String(org.PROV || org.prov || '')}{org.CITY || org.city ? ` ${org.CITY || org.city}` : ''}</td>
                    </tr>
                  ))}
                  <tr className={styles.enterpriseViewAllRow} onClick={() => openChainDrawer('orgs')}>
                    <td colSpan={2}>查看全部企业 &gt;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.listState}>
              <div className={styles.skeletonRows} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.listStateText}>暂无{localCity}企业数据</div>
            </div>
          )}

        </div>
      </div>

      <div className={styles.sidePanel}>
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <img src={industryWarningScoreIcon} alt="" className={styles.iconImage} />
            预警系数
          </div>
          <div className={styles.statValue}>
            72.5
            <span className={`${styles.statTrend} ${styles.up}`}>
              <ArrowUpOutlined /> 3.2%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '72.5%', background: 'linear-gradient(90deg, #ffbf17, #fa5319)' }} />
          </div>
          <div className={styles.statSub}>较上月下降 3.2%，需重点关注缺链环节</div>
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <img src={industryLocalizationRateIcon} alt="" className={styles.iconImage} />
            本地化率
          </div>
          <div className={styles.statValue} style={{ color: '#2468F2' }}>
            {coverageState.loading ? (
              <span style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spin indicator={<LoadingOutlined spin style={{ fontSize: 16 }} />} />
                分析中 {coverageState.checked}/{coverageState.total}
              </span>
            ) : (
              `${localizationRateStr}%`
            )}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: coverageState.loading
                  ? `${coverageState.total > 0 ? (coverageState.checked / coverageState.total) * 100 : 0}%`
                  : `${Math.min(localizationRate, 100)}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div className={styles.statSub}>
            {coverageState.loading
              ? `正在分析${localCity}产业覆盖情况...`
              : `${localCity}覆盖 ${coverageState.covered} / ${coverageState.total} 个产业节点`}
          </div>
        </div>

        <div className={`${styles.panelCard} ${styles.chainTalentCard}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <img src={industryChainTalentsIcon} alt="" className={styles.sectionIconImage} />
              链上人才
            </div>
            {!talentChart.loading && talentChart.items.length > 0 && (
              <div className={styles.chartMeta}>
                <span>总计：{talentChart.total.toLocaleString()}人</span>
              </div>
            )}
          </div>

          {talentChart.loading ? (
            <div className={styles.listState}>
              <Spin indicator={<LoadingOutlined spin />} />
              <div className={styles.listStateText}>{expertListLoadingText}</div>
            </div>
          ) : talentChart.items.length > 0 ? (
            <div className={styles.chartBox}>
              <ReactECharts
                option={talentChartOption}
                className={styles.talentBarChart}
                style={{ height: 330 }}
                onEvents={{ click: handleTalentChartClick }}
                notMerge
              />
              <table className={styles.talentTable}>
                <thead>
                  <tr>
                    <th>人才</th>
                    <th>职称</th>
                    <th>领域</th>
                  </tr>
                </thead>
                <tbody>
                  {chainList.experts.slice(0, 8).map((expert, index) => {
                    const title = cleanText(expert.TITLE || expert.title)
                    const field = getTalentField(expert, chainLabel)
                    return (
                      <tr key={index} onClick={() => openTalentDetail(expert)}>
                        <td>{String(expert.CNAME || expert.name || '未知')}</td>
                        <td>
                          {title ? <span className={styles.talentTitlePill}>{title}</span> : '—'}
                        </td>
                        <td title={field}>{field}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.listState}>
              <div className={styles.skeletonRows} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.listStateText}>暂无{localCity}人才数据</div>
            </div>
          )}
        </div>
      </div>

      </div>

      <Drawer
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {chainDrawer.type === 'orgs' ? <BankOutlined /> : <TeamOutlined />}
            <span>{chainLabel} - {chainDrawer.type === 'orgs' ? '链上企业' : '链上人才'}</span>
            {chainDrawer.total > 0 && <Tag color="blue">{chainDrawer.total.toLocaleString()}</Tag>}
          </div>
        )}
        open={chainDrawer.visible}
        onClose={() => setChainDrawer((prev) => ({ ...prev, visible: false }))}
        width={860}
        destroyOnClose
      >
        <div className={styles.filterGroup} style={{ marginBottom: 16 }}>
          <EnvironmentOutlined style={{ color: '#2468F2' }} />
          <span className={styles.filterLabel}>地区筛选：</span>
          <Cascader
            options={allRegionOptions}
            value={chainDrawer.regionValue.length > 0 ? chainDrawer.regionValue : ['__all__']}
            onChange={(val) => handleChainDrawerRegionChange((val || []) as string[])}
            changeOnSelect
            size="small"
            style={{ width: 200 }}
            placeholder="选择地区"
          />
          {chainDrawer.type === 'orgs' && (
            <>
              <span className={styles.filterLabel}>企业类型：</span>
              <Select
                allowClear
                size="small"
                style={{ width: 190 }}
                placeholder="全部企业类型"
                value={chainDrawer.orgTag || undefined}
                onChange={handleChainDrawerOrgTagChange}
                options={ORG_TAG_FILTER_OPTIONS.map((tag) => ({ label: tag, value: tag }))}
              />
            </>
          )}
        </div>

        <Table
          columns={chainDrawer.type === 'orgs' ? orgDrawerColumns : expertDrawerColumns}
          dataSource={chainDrawer.data}
          rowKey={(_, index) => String(index)}
          loading={chainDrawer.loading}
          size="small"
          onRow={(record) => ({
            onClick: () => {
              if (chainDrawer.type === 'orgs') openEnterpriseDetail(record)
              else openTalentDetail(record)
            },
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: chainDrawer.page,
            total: Math.min(chainDrawer.total, 100),
            pageSize: 10,
            showSizeChanger: false,
            showTotal: () => `共 ${chainDrawer.total.toLocaleString()} 条`,
            onChange: (page) => {
              loadChainDrawerData(chainDrawer.type, chainDrawer.regionValue, page, chainDrawer.queryChain, chainDrawer.orgTag)
              setChainDrawer((prev) => ({ ...prev, page }))
            },
          }}
        />
      </Drawer>
    </>
  )
}
