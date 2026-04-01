import { useState, useEffect, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { UserOutlined, LoadingOutlined, BankOutlined } from '@ant-design/icons'
import { Tag, Spin, App, Empty } from 'antd'
import {
  searchExperts,
  getTalentGraph,
  getExpertSummary,
  getTalentBackground,
  getCoopTalentList,
  getCkeyIndustry,
  type GraphNode,
  type GraphLink,
  type GraphRelation,
} from '@/services/talent'
import TalentRelationGraph from './TalentRelationGraph'
import {
  getMockTalentPreview,
  MOCK_TALENT_EXPERTS,
  MOCK_TALENT_GRAPH_ENABLED,
  MOCK_TALENT_GRAPH_LINKS,
  MOCK_TALENT_GRAPH_NODES,
} from './mockTalentPreview'
import talentResearchDistributionIcon from '@/assets/images/icons/talent-research-distribution-icon.png'
import talentResearchTrendIcon from '@/assets/images/icons/talent-research-trend-icon.png'
import talentTopTalentsIcon from '@/assets/images/icons/talent-top-talents-icon.png'
import talentCurrentTalentIcon from '@/assets/images/icons/talent-current-talent-icon.jpg'
import talentCooperationTalentsIcon from '@/assets/images/icons/talent-cooperation-talents-icon.jpg'
import styles from './Talent.module.scss'

function getFieldBarOption(data: { name: string; value: number }[]) {
  const colors = ['#2873ff', '#25bcb0', '#fe4e4e', '#fe9f4d', '#4db9fe', '#5bcd96', '#fbcd6a', '#b3b2b0']
  const reversed = [...data].reverse()

  return {
    grid: { left: 80, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const,
      data: reversed.map((item) => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: reversed.map((item, index) => ({
          value: item.value,
          itemStyle: { color: colors[(data.length - 1 - index) % colors.length] },
        })),
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', fontSize: 12, color: '#4E5969' },
      },
    ],
  }
}

const defaultFieldData = [
  { name: '生物医药', value: 35 },
  { name: '新材料', value: 28 },
  { name: '装备制造', value: 22 },
  { name: '绿色化工', value: 18 },
  { name: '清洁能源', value: 15 },
  { name: 'AI/大数据', value: 12 },
  { name: '生物技术', value: 10 },
  { name: '其他', value: 6 },
]

interface TrendData {
  years: string[]
  papers: number[]
  patents: number[]
  standards: number[]
}

function getTrendOption(trend: TrendData) {
  return {
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    legend: { data: ['论文发表', '专利申请', '标准发布'], top: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: 'category' as const, data: trend.years },
    yAxis: { type: 'value' as const, splitLine: { lineStyle: { type: 'dashed' as const, color: '#eee' } } },
    series: [
      { name: '论文发表', type: 'line', data: trend.papers, smooth: true, lineStyle: { color: '#2468F2' }, itemStyle: { color: '#2468F2' } },
      { name: '专利申请', type: 'line', data: trend.patents, smooth: true, lineStyle: { color: '#2BA471' }, itemStyle: { color: '#2BA471' } },
      { name: '标准发布', type: 'line', data: trend.standards, smooth: true, lineStyle: { color: '#F5A623' }, itemStyle: { color: '#F5A623' } },
    ],
  }
}

const defaultTrend: TrendData = {
  years: ['2021', '2022', '2023', '2024', '2025'],
  papers: [0, 0, 0, 0, 0],
  patents: [0, 0, 0, 0, 0],
  standards: [0, 0, 0, 0, 0],
}

interface TalentInfo {
  auid: string
  name: string
  org: string
  field: string
  hIndex: number
  papers: number
  patents: number
  achievements: number
  direction: string
  title: string
  background: string
  keywords: string[]
}

interface CoopTalent {
  name: string
  org: string
  field: string
}

function getHLevelTag(h: number): { label: string; color: string } {
  if (h >= 30) return { label: '顶尖', color: '#f5222d' }
  if (h >= 15) return { label: '高端', color: '#fa541c' }
  if (h >= 5) return { label: '骨干', color: '#2468F2' }
  return { label: '基础', color: '#8c8c8c' }
}

interface TalentGraphProps {
  searchKeyword?: string
}

function getTitleWeight(expert: Record<string, unknown>): number {
  const rawTitle = Array.isArray(expert.TITLE) ? String((expert.TITLE as string[])[0] || '') : String(expert.TITLE || '')

  if (rawTitle.includes('院士')) return 6
  if (rawTitle.includes('教授')) return 5
  if (rawTitle.includes('研究员')) return 4
  if (rawTitle.includes('副教授')) return 3
  if (rawTitle.includes('副研究员')) return 2
  if (rawTitle.includes('讲师') || rawTitle.includes('工程师')) return 1
  return 0
}

function sortCandidateExperts(experts: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...experts].sort((left, right) => {
    const hDiff = Number(right.H || 0) - Number(left.H || 0)
    if (hDiff !== 0) return hDiff

    const titleDiff = getTitleWeight(right) - getTitleWeight(left)
    if (titleDiff !== 0) return titleDiff

    const orgDiff = String(left.AORG || '').localeCompare(String(right.AORG || ''), 'zh-CN')
    if (orgDiff !== 0) return orgDiff

    return String(left.ID || '').localeCompare(String(right.ID || ''), 'en')
  })
}

export default function TalentGraph({ searchKeyword }: TalentGraphProps) {
  const { message } = App.useApp()

  const [currentTalent, setCurrentTalent] = useState<TalentInfo | null>(null)
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([])
  const [graphLinks, setGraphLinks] = useState<GraphLink[]>([])
  const [coopTalents, setCoopTalents] = useState<CoopTalent[]>([])
  const [topTalents, setTopTalents] = useState<{ name: string; org: string; field: string; h: number; raw: Record<string, unknown> }[]>([])
  const [fieldData, setFieldData] = useState<{ name: string; value: number }[]>(defaultFieldData)
  const [trendData, setTrendData] = useState<TrendData>(defaultTrend)
  const [graphLoading, setGraphLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [candidates, setCandidates] = useState<Record<string, unknown>[]>([])
  const [showCandidates, setShowCandidates] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const parseExperts = (resData: Record<string, unknown> | undefined): Record<string, unknown>[] => {
    if (Array.isArray(resData?.expertsRecommend)) {
      return resData.expertsRecommend as Record<string, unknown>[]
    }
    if (Array.isArray(resData?.sources)) {
      return (resData.sources as Record<string, unknown>[]).map((item) => (item.source || item) as Record<string, unknown>)
    }
    return []
  }

  const applyMockPreview = useCallback((expert: Record<string, unknown>, allExperts: Record<string, unknown>[]) => {
    const preview = getMockTalentPreview(String(expert.ID || 'talent-1'))
    const sourceExperts = allExperts.length > 0 ? allExperts : MOCK_TALENT_EXPERTS

    setCurrentTalent(preview.currentTalent)
    setGraphNodes(MOCK_TALENT_GRAPH_NODES)
    setGraphLinks(MOCK_TALENT_GRAPH_LINKS)
    setCoopTalents(preview.coopTalents)
    setFieldData(preview.fieldData)
    setTrendData(preview.trendData)
    setTopTalents(sourceExperts.slice(0, 6).map((item) => ({
      name: String(item.CNAME || ''),
      org: String(item.AORG || ''),
      field: (item.CATE as string[])?.[0] || '',
      h: Number(item.H || 0),
      raw: item,
    })))
    setGraphLoading(false)
    setSearching(false)
  }, [])

  const selectCandidate = useCallback(async (expert: Record<string, unknown>, allExperts: Record<string, unknown>[], keyword: string, keepCandidates = false) => {
    if (!keepCandidates) {
      setShowCandidates(false)
      setCandidates([])
    }

    if (MOCK_TALENT_GRAPH_ENABLED) {
      applyMockPreview(expert, allExperts)
      return
    }
    setSearching(true)
    abortRef.current?.abort()

    const ac = new AbortController()
    abortRef.current = ac

    try {
      const auid = String(expert.ID || '')
      const name = String(expert.CNAME || '')
      const org = String(expert.AORG || '')
      const field = (expert.CATE as string[])?.[0] || ''
      const hIndex = Number(expert.H || 0)
      const direction = String(expert.DIRECTION || '')
      const title = (expert.TITLE as string[])?.[0] || ''

      const expertKeywords = ((expert.KEYWORDS || []) as { KEYWORD?: string }[])
        .slice(0, 10)
        .map((item) => item.KEYWORD || '')
        .filter(Boolean)

      setCurrentTalent({
        auid,
        name,
        org,
        field,
        hIndex,
        papers: Number(expert.QIKAN || 0),
        patents: Number(expert.ZHUANLI || 0),
        achievements: Number(expert.CHENGGUO || 0),
        direction,
        title,
        background: '',
        keywords: expertKeywords,
      })

      setTopTalents(allExperts.slice(0, 6).map((item) => ({
        name: String(item.CNAME || ''),
        org: String(item.AORG || ''),
        field: (item.CATE as string[])?.[0] || '',
        h: Number(item.H || 0),
        raw: item,
      })))

      const keywordCount: Record<string, number> = {}
      allExperts.forEach((item) => {
        const keywords = (item.KEYWORDS || []) as { NUM?: number; KEYWORD?: string }[]
        keywords.forEach((keywordItem) => {
          if (keywordItem.KEYWORD && keywordItem.KEYWORD.length >= 2 && keywordItem.KEYWORD.length <= 10) {
            keywordCount[keywordItem.KEYWORD] = (keywordCount[keywordItem.KEYWORD] || 0) + (keywordItem.NUM || 1)
          }
        })
      })

      const sortedKeywords = Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, value]) => ({ name: label, value }))
      if (sortedKeywords.length > 0) setFieldData(sortedKeywords)

      getCkeyIndustry(keyword.trim())
        .then((ckeyRes) => {
          if (ac.signal.aborted) return

          const extractRecent = (series?: { key: number[]; count: string[] }) => {
            if (!series) return { years: [] as string[], values: [] as number[] }
            const pairs = series.key.map((year, index) => ({ year, value: Number(series.count[index] || 0) }))
            const recent = pairs.filter((item) => item.year >= 2020)
            return {
              years: recent.map((item) => String(item.year)),
              values: recent.map((item) => item.value),
            }
          }

          const paperSeries = extractRecent(ckeyRes.g)
          const patentSeries = extractRecent(ckeyRes.h)
          const standardSeries = extractRecent(ckeyRes.b)

          if (paperSeries.years.length > 0) {
            setTrendData({
              years: paperSeries.years,
              papers: paperSeries.values,
              patents: patentSeries.values,
              standards: standardSeries.values,
            })
          }
        })
        .catch(() => undefined)

      setGraphLoading(true)
      const graphResult = await getTalentGraph(auid, 1, 20).catch(() => null)
      if (ac.signal.aborted) return

      setGraphNodes(graphResult?.data?.sources?.nodes || [])
      const relations: GraphRelation[] = graphResult?.data?.sources?.relations || []
      setGraphLinks(relations.map((relation) => ({
        source: relation.startid,
        target: relation.endid,
        value: relation.cnt || 1,
        ...relation,
      })))
      setGraphLoading(false)

      const [summaryRes, bgRes] = await Promise.all([
        getExpertSummary(auid).catch(() => null),
        getTalentBackground(auid).catch(() => null),
      ])
      if (ac.signal.aborted) return

      if (summaryRes) {
        setCurrentTalent((prev) => prev ? {
          ...prev,
          papers: Number(summaryRes['绉戝鏍稿績All'] || summaryRes['鏈熷垔All'] || prev.papers),
          patents: Number(summaryRes['涓撳埄All'] || prev.patents),
          achievements: Number(summaryRes['绉戞妧鎴愭灉All'] || prev.achievements),
        } : null)
      }

      if (bgRes) {
        const bgData = bgRes as Record<string, unknown>
        const bgList = (bgData.data || bgData.background || bgData.result) as Record<string, unknown>[] | string | undefined
        if (typeof bgList === 'string') {
          setCurrentTalent((prev) => prev ? { ...prev, background: bgList } : null)
        } else if (Array.isArray(bgList)) {
          setCurrentTalent((prev) => prev
            ? { ...prev, background: bgList.map((item) => String(item.content || item.value || '')).filter(Boolean).join('、') }
            : null)
        }
      }

      const coopRes = await getCoopTalentList(auid).catch(() => null)
      if (ac.signal.aborted) return

      let coopList: CoopTalent[] = []
      if (coopRes) {
        const data = coopRes as Record<string, unknown>
        let list: Record<string, unknown>[] = []
        if (Array.isArray(data.data)) list = data.data
        else if (data.data && typeof data.data === 'object') {
          const inner = data.data as Record<string, unknown>
          if (Array.isArray(inner.list)) list = inner.list
          else if (Array.isArray(inner.records)) list = inner.records
        }
        coopList = list.slice(0, 6).map((item) => ({
          name: String(item.name || item.CNAME || ''),
          org: String(item.org || item.AORG || ''),
          field: String(item.cate || item.CATE || item.field || ''),
        }))
      }

      if (coopList.length === 0 && relations.length > 0) {
        const graphPeople = (graphResult?.data?.sources?.nodes || []).filter(
          (node: Record<string, unknown>) => node.class === 'PERSON' && String(node.id) !== auid,
        )
        coopList = graphPeople.slice(0, 6).map((node: Record<string, unknown>) => ({
          name: String(node.name || ''),
          org: String(node.org || ''),
          field: '',
        }))
      }

      setCoopTalents(coopList)
    } catch {
      if (!ac.signal.aborted) message.error('加载失败，请稍后重试')
    } finally {
      if (!ac.signal.aborted) setSearching(false)
    }
  }, [applyMockPreview, message])

  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return

    if (MOCK_TALENT_GRAPH_ENABLED) {
      setSearching(true)
      setShowCandidates(false)
      setCandidates([])

      const normalizedKeyword = keyword.trim().toLowerCase()
      const matchedExperts = MOCK_TALENT_EXPERTS.filter((item) => {
        const fields = [
          String(item.CNAME || ''),
          String(item.AORG || ''),
          String(item.DIRECTION || ''),
          ...(((item.CATE as string[]) || [])),
        ]

        return fields.some((field) => field.toLowerCase().includes(normalizedKeyword))
      })

      const sourceExperts = matchedExperts.length > 0 ? matchedExperts : MOCK_TALENT_EXPERTS

      if (matchedExperts.length === 0) {
        message.info('当前为演示数据，已展示默认人才样例')
      }

      if (matchedExperts.length > 1) {
        const duplicateCandidates = sortCandidateExperts(sourceExperts).slice(0, 20)
        setCandidates(duplicateCandidates)
        setShowCandidates(true)
        await selectCandidate(duplicateCandidates[0], duplicateCandidates, keyword.trim(), true)
        return
      }

      applyMockPreview(sourceExperts[0], sourceExperts)
      return
    }

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setSearching(true)
    setShowCandidates(false)
    setCandidates([])

    try {
      const result = await searchExperts(keyword.trim(), 0, 20)
      if (ac.signal.aborted) return

      const resData = result?.data as Record<string, unknown> | undefined
      const experts = parseExperts(resData)

      if (experts.length === 0) {
        message.info('未找到相关人才')
        setSearching(false)
        return
      }

      if (experts.length > 1) {
        const duplicateCandidates = sortCandidateExperts(experts).slice(0, 20)
        setCandidates(duplicateCandidates)
        setShowCandidates(true)
        await selectCandidate(duplicateCandidates[0], duplicateCandidates, keyword.trim(), true)
        return
      }

      await selectCandidate(experts[0], experts, keyword.trim())
    } catch {
      if (!ac.signal.aborted) message.error('搜索失败，请稍后重试')
    } finally {
      if (!ac.signal.aborted) setSearching(false)
    }
  }, [applyMockPreview, message, selectCandidate])

  useEffect(() => {
    handleSearch(searchKeyword || (MOCK_TALENT_GRAPH_ENABLED ? String(MOCK_TALENT_EXPERTS[0]?.CNAME || '') : '人工智能'))
    return () => {
      abortRef.current?.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const relationNodes = (() => {
    if (!currentTalent) return []
    if (graphNodes.some((node) => node.class === 'PERSON')) return graphNodes

    return [{
      id: currentTalent.auid,
      name: currentTalent.name,
      org: currentTalent.org,
      h: currentTalent.hIndex,
      class: 'PERSON' as const,
    }]
  })()

  return (
    <div className={styles.twoColumnLayout}>
      <div className={styles.leftColumn}>
        <div className={styles.graphArea} style={{ position: 'relative' }}>
          {graphLoading || searching ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 420 }}>
              <Spin indicator={<LoadingOutlined spin style={{ fontSize: 32, color: '#5A9CF7' }} />} />
              <div style={{ color: '#5A9CF7', fontSize: 13, marginTop: 12 }}>{searching ? '搜索中...' : '加载图谱...'}</div>
            </div>
          ) : currentTalent ? (
            <TalentRelationGraph
              nodes={relationNodes}
              links={graphLinks}
              centerAuid={currentTalent.auid}
              currentName={currentTalent.name}
              onSearch={handleSearch}
              candidates={candidates}
              showCandidates={showCandidates}
              onSelectCandidate={(candidate) => {
                void selectCandidate(candidate, candidates, String(candidate.CNAME || ''))
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 420 }}>
              <Empty description={<span style={{ color: '#5A9CF7' }}>搜索人才姓名查看关系图谱</span>} />
            </div>
          )}
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <img src={talentResearchDistributionIcon} alt="" className={styles.iconImage} />
            研究方向分布
          </div>
          <ReactECharts option={getFieldBarOption(fieldData)} style={{ height: 240 }} notMerge />
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <img src={talentResearchTrendIcon} alt="" className={styles.iconImage} />
            研究方向趋势
          </div>
          <ReactECharts option={getTrendOption(trendData)} style={{ height: 200 }} notMerge />
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={`${styles.panelCard} ${styles.talentDetailCard}`}>
          <div className={styles.panelTitle}>
            <img src={talentCurrentTalentIcon} alt="" className={styles.iconImage} />
            当前人才
          </div>
          {currentTalent ? (
            <div className={styles.talentDetailContent}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <div className={styles.talentAvatarLarge}><UserOutlined style={{ fontSize: 28 }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1D2129' }}>{currentTalent.name}</span>
                    {currentTalent.title && <span style={{ fontSize: 12, color: '#86909C' }}>{currentTalent.title}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#4E5969', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentTalent.org}>
                    <BankOutlined style={{ marginRight: 4, fontSize: 11 }} />
                    {currentTalent.org}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {currentTalent.field && <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>{currentTalent.field}</Tag>}
                    <Tag color={getHLevelTag(currentTalent.hIndex).color} style={{ fontSize: 11, margin: 0 }}>
                      {getHLevelTag(currentTalent.hIndex).label}
                    </Tag>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#2468F2' }}>{currentTalent.hIndex}</span>, label: 'H指数', bg: '#f0f5ff' },
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#2BA471' }}>{currentTalent.papers}</span>, label: '论文', bg: '#f0fff4' },
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{currentTalent.patents}</span>, label: '专利', bg: '#fffbe6' },
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#F26B4A' }}>{currentTalent.achievements}</span>, label: '成果', bg: '#fff2f0' },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 0',
                      borderRadius: 10,
                      background: item.bg,
                    }}
                  >
                    {item.icon}
                    <div style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {currentTalent.direction && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: 1 }}>研究方向</div>
                  <div style={{ fontSize: 12, color: '#4E5969', lineHeight: 1.7 }}>
                    {currentTalent.direction.length > 80 ? `${currentTalent.direction.slice(0, 80)}...` : currentTalent.direction}
                  </div>
                </div>
              )}

              {currentTalent.background && (
                <div>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: 1 }}>学术背景</div>
                  <div style={{ fontSize: 12, color: '#4E5969', lineHeight: 1.7 }}>
                    {currentTalent.background.length > 80 ? `${currentTalent.background.slice(0, 80)}...` : currentTalent.background}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#999', fontSize: 13 }}>搜索人才后显示详情</div>
          )}
        </div>

        <div className={`${styles.panelCard} ${styles.talentRankCard}`}>
          <div className={styles.panelTitle}>
            <img src={talentTopTalentsIcon} alt="" className={styles.iconImage} />
            高端人才榜
          </div>
          <div className={styles.rankList}>
            {topTalents.length > 0 ? topTalents.map((talent, index) => {
              const level = getHLevelTag(talent.h)
              return (
                <div key={index} className={styles.rankItem}>
                  <span className={`${styles.rankNum} ${index === 0 ? styles.top1 : index === 1 ? styles.top2 : index === 2 ? styles.top3 : ''}`}>{index + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontWeight: 500, color: '#2468F2', fontSize: 13, cursor: 'pointer' }}
                      title={`点击查看 ${talent.name} 的详情`}
                      onClick={() => selectCandidate(talent.raw, topTalents.map((item) => item.raw), talent.name)}
                    >
                      {talent.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#86909C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={talent.org}>
                      {talent.org}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <Tag color="blue" style={{ fontSize: 11, margin: 0, borderRadius: 10, lineHeight: '18px', padding: '0 6px' }}>H:{talent.h}</Tag>
                    <Tag color={level.color} style={{ fontSize: 11, margin: 0, borderRadius: 10, lineHeight: '18px', padding: '0 6px' }}>{level.label}</Tag>
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>搜索后显示排行</div>
            )}
          </div>
        </div>

        <div className={`${styles.panelCard} ${styles.talentRankCard}`}>
          <div className={styles.panelTitle}>
            <img src={talentCooperationTalentsIcon} alt="" className={styles.iconImage} />
            合作人才
          </div>
          <div className={styles.rankList}>
            {coopTalents.length > 0 ? coopTalents.map((talent, index) => (
              <div key={index} className={styles.rankItem}>
                <span className={`${styles.rankNum} ${index === 0 ? styles.top1 : index === 1 ? styles.top2 : index === 2 ? styles.top3 : ''}`}>{index + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: '#1D2129', fontSize: 13 }}>{talent.name}</div>
                  <div style={{ fontSize: 11, color: '#86909C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={talent.org}>
                    {talent.org}
                  </div>
                </div>
                {talent.field && <Tag color="green" style={{ fontSize: 11, margin: 0, borderRadius: 10, lineHeight: '18px', padding: '0 6px' }}>{talent.field}</Tag>}
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>
                {currentTalent ? '暂无合作人才数据' : '搜索人才后显示合作人才'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

