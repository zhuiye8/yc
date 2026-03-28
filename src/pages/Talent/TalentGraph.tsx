import { useState, useEffect, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import {
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  LoadingOutlined,
  BankOutlined,
} from '@ant-design/icons'
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
} from '@/services/talent'
import styles from './Talent.module.scss'

// ========== 图谱选项生成 ==========
function buildGraphOption(nodes: GraphNode[], links: GraphLink[], centerAuid: string) {
  const personNodes = nodes.filter(n => n.class === 'PERSON')
  const personIds = new Set(personNodes.map(n => n.id))
  const personLinks = links.filter(l => personIds.has(String(l.source)) && personIds.has(String(l.target)))

  const centerDirectLinks = new Set<string>()
  personLinks.forEach(l => {
    if (String(l.source) === centerAuid) centerDirectLinks.add(String(l.target))
    if (String(l.target) === centerAuid) centerDirectLinks.add(String(l.source))
  })

  const indirectLinks = new Set<string>()
  personLinks.forEach(l => {
    const s = String(l.source), t = String(l.target)
    if (centerDirectLinks.has(s) && !centerDirectLinks.has(t) && t !== centerAuid) indirectLinks.add(t)
    if (centerDirectLinks.has(t) && !centerDirectLinks.has(s) && s !== centerAuid) indirectLinks.add(s)
  })

  const chartNodes = personNodes.map(n => {
    let category = 3
    if (n.id === centerAuid) category = 0
    else if (centerDirectLinks.has(n.id)) category = 1
    else if (indirectLinks.has(n.id)) category = 2

    const h = Number(n.h || 0)
    const baseSize = category === 0 ? 55 : category === 1 ? 38 : category === 2 ? 30 : 24
    const sizeBoost = Math.min(h * 0.5, 15)

    return {
      id: n.id, name: n.name || '未知',
      symbolSize: baseSize + sizeBoost, category,
      fixed: n.id === centerAuid,
      x: n.id === centerAuid ? 300 : undefined,
      y: n.id === centerAuid ? 200 : undefined,
      org: n.org || '', h,
    }
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: (p: { data?: { name?: string; org?: string; h?: number } }) => {
        if (!p.data) return ''
        return `<b>${p.data.name || ''}</b><br/>${p.data.org || ''}<br/>H指数: ${p.data.h ?? '-'}`
      },
    },
    legend: {
      data: ['搜索人才', '紧密合作', '间接合作', '领域相关'],
      top: 8, left: 8, textStyle: { color: '#B0C4DE', fontSize: 11 },
      itemWidth: 10, itemHeight: 10,
    },
    series: [{
      type: 'graph', layout: 'force',
      force: { repulsion: 200, edgeLength: 120 },
      roam: true,
      label: { show: true, fontSize: 11, color: '#fff' },
      categories: [
        { name: '搜索人才', itemStyle: { color: '#1849B0' } },
        { name: '紧密合作', itemStyle: { color: '#2468F2' } },
        { name: '间接合作', itemStyle: { color: '#4A90D9' } },
        { name: '领域相关', itemStyle: { color: '#2BA471' } },
      ],
      data: chartNodes,
      links: personLinks.map(l => ({ source: String(l.source), target: String(l.target) })),
      lineStyle: { color: 'rgba(91,155,247,0.4)', width: 1.5, curveness: 0.1 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
    }],
  }
}

// ========== 研究方向柱状图 ==========
function getFieldBarOption(data: { name: string; value: number }[]) {
  const colors = ['#2468F2', '#F26B4A', '#2BA471', '#F5A623', '#7B61FF', '#00B8D9', '#FF6B9A', '#A0A4AB']
  // ECharts y轴从下到上渲染，反转让高的在上面
  const reversed = [...data].reverse()
  return {
    grid: { left: 80, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'value' as const },
    yAxis: { type: 'category' as const, data: reversed.map(d => d.name), axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar',
      data: reversed.map((d, i) => ({ value: d.value, itemStyle: { color: colors[(data.length - 1 - i) % colors.length] } })),
      barWidth: 14, itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', fontSize: 12, color: '#4E5969' },
    }],
  }
}

const defaultFieldData = [
  { name: '生物医药', value: 35 }, { name: '新材料', value: 28 },
  { name: '装备制造', value: 22 }, { name: '绿色化工', value: 18 },
  { name: '清洁能源', value: 15 }, { name: 'AI/大数据', value: 12 },
  { name: '生物技术', value: 10 }, { name: '其他', value: 6 },
]

// 趋势数据
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
  papers: [0, 0, 0, 0, 0], patents: [0, 0, 0, 0, 0], standards: [0, 0, 0, 0, 0],
}

// ========== 人才详情 ==========
interface TalentInfo {
  auid: string; name: string; org: string; field: string; hIndex: number
  papers: number; patents: number; achievements: number
  direction: string; title: string; background: string
  keywords: string[]
}

interface CoopTalent { name: string; org: string; field: string }

// H指数→等级颜色
function getHLevelTag(h: number): { label: string; color: string } {
  if (h >= 30) return { label: '顶尖', color: '#f5222d' }
  if (h >= 15) return { label: '高端', color: '#fa541c' }
  if (h >= 5) return { label: '骨干', color: '#2468F2' }
  return { label: '基础', color: '#8c8c8c' }
}

interface TalentGraphProps {
  searchKeyword?: string
}

export default function TalentGraph({ searchKeyword }: TalentGraphProps) {
  const { message } = App.useApp()

  const [currentTalent, setCurrentTalent] = useState<TalentInfo | null>(null)
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([])
  const [graphLinks, setGraphLinks] = useState<GraphLink[]>([])
  const [coopTalents, setCoopTalents] = useState<CoopTalent[]>([])
  const [topTalents, setTopTalents] = useState<{ name: string; org: string; field: string; h: number }[]>([])
  const [fieldData, setFieldData] = useState<{ name: string; value: number }[]>(defaultFieldData)
  const [trendData, setTrendData] = useState<TrendData>(defaultTrend)
  const [graphLoading, setGraphLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setSearching(true)

    try {
      const result = await searchExperts(keyword.trim(), 0, 20)
      if (ac.signal.aborted) return

      const resData = result?.data as Record<string, unknown> | undefined

      // 兼容两种响应结构:
      // 搜关键词 → data.expertsRecommend: [{ID, CNAME, ...}]
      // 搜人名   → data.sources: [{indexId, source: {ID, CNAME, ...}}]
      let experts: Record<string, unknown>[] = []
      if (Array.isArray(resData?.expertsRecommend)) {
        experts = resData.expertsRecommend as Record<string, unknown>[]
      } else if (Array.isArray(resData?.sources)) {
        experts = (resData.sources as Record<string, unknown>[]).map(s => {
          const src = (s.source || s) as Record<string, unknown>
          return src
        })
      }

      if (experts.length === 0) {
        message.info('未找到相关人才')
        setSearching(false)
        return
      }

      const first = experts[0]
      const auid = String(first.ID || '')
      const name = String(first.CNAME || '')
      const org = String(first.AORG || '')
      const field = (first.CATE as string[])?.[0] || ''
      const h = Number(first.H || 0)
      const direction = String(first.DIRECTION || '')
      const title = (first.TITLE as string[])?.[0] || ''

      // 提取前10个关键词
      const firstKeywords = ((first.KEYWORDS || []) as { KEYWORD?: string }[])
        .slice(0, 10)
        .map(k => k.KEYWORD || '')
        .filter(Boolean)

      setCurrentTalent({
        auid, name, org, field, hIndex: h,
        papers: Number(first.QIKAN || 0),
        patents: Number(first.ZHUANLI || 0),
        achievements: Number(first.CHENGGUO || 0),
        direction, title, background: '', keywords: firstKeywords,
      })

      // 高端人才榜
      setTopTalents(experts.slice(0, 6).map(e => ({
        name: String(e.CNAME || ''),
        org: String(e.AORG || ''),
        field: (e.CATE as string[])?.[0] || '',
        h: Number(e.H || 0),
      })))

      // 研究方向分布 — 从所有专家的 KEYWORDS 聚合
      const kwCount: Record<string, number> = {}
      experts.forEach(e => {
        const kws = (e.KEYWORDS || []) as { NUM?: number; KEYWORD?: string }[]
        kws.forEach(kw => {
          if (kw.KEYWORD && kw.KEYWORD.length >= 2 && kw.KEYWORD.length <= 10) {
            kwCount[kw.KEYWORD] = (kwCount[kw.KEYWORD] || 0) + (kw.NUM || 1)
          }
        })
      })
      const sortedKw = Object.entries(kwCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
      if (sortedKw.length > 0) setFieldData(sortedKw)

      // 研究方向趋势 — 用搜索关键词调 getCkeyIndustry
      getCkeyIndustry(keyword.trim()).then(ckeyRes => {
        if (ac.signal.aborted) return
        const extractRecent = (series?: { key: number[]; count: string[] }) => {
          if (!series) return { years: [] as string[], values: [] as number[] }
          const pairs = series.key.map((y, i) => ({ y, v: Number(series.count[i] || 0) }))
          const recent = pairs.filter(p => p.y >= 2020)
          return { years: recent.map(p => String(p.y)), values: recent.map(p => p.v) }
        }
        const g = extractRecent(ckeyRes.g)
        const h = extractRecent(ckeyRes.h)
        const b = extractRecent(ckeyRes.b)
        if (g.years.length > 0) {
          setTrendData({
            years: g.years,
            papers: g.values,
            patents: h.values,
            standards: b.values,
          })
        }
      }).catch(() => { /* ignore */ })

      // 加载图谱
      setGraphLoading(true)
      const graphResult = await getTalentGraph(auid, 1, 20).catch(() => null)
      if (ac.signal.aborted) return
      setGraphNodes(graphResult?.data?.sources?.nodes || [])
      setGraphLinks(graphResult?.data?.sources?.links || [])
      setGraphLoading(false)

      // 加载详情
      const [summaryRes, bgRes] = await Promise.all([
        getExpertSummary(auid).catch(() => null),
        getTalentBackground(auid).catch(() => null),
      ])
      if (ac.signal.aborted) return

      if (summaryRes) {
        setCurrentTalent(prev => prev ? {
          ...prev,
          papers: Number(summaryRes['科学核心All'] || summaryRes['期刊All'] || prev.papers),
          patents: Number(summaryRes['专利All'] || prev.patents),
          achievements: Number(summaryRes['科技成果All'] || prev.achievements),
        } : null)
      }

      if (bgRes) {
        const bgData = bgRes as Record<string, unknown>
        const bgList = (bgData.data || bgData.background || bgData.result) as Record<string, unknown>[] | string | undefined
        if (typeof bgList === 'string') {
          setCurrentTalent(prev => prev ? { ...prev, background: bgList } : null)
        } else if (Array.isArray(bgList)) {
          setCurrentTalent(prev => prev ? { ...prev, background: bgList.map(b => String(b.content || b.value || '')).filter(Boolean).join('；') } : null)
        }
      }

      // 加载合作人才
      const coopRes = await getCoopTalentList(auid).catch(() => null)
      if (ac.signal.aborted) return
      if (coopRes) {
        const d = coopRes as Record<string, unknown>
        let list: Record<string, unknown>[] = []
        if (Array.isArray(d.data)) list = d.data
        else if (d.data && typeof d.data === 'object') {
          const inner = d.data as Record<string, unknown>
          if (Array.isArray(inner.list)) list = inner.list
          else if (Array.isArray(inner.records)) list = inner.records
        }
        setCoopTalents(list.slice(0, 6).map(c => ({
          name: String(c.name || c.CNAME || ''),
          org: String(c.org || c.AORG || ''),
          field: String(c.cate || c.CATE || c.field || ''),
        })))
      }
    } catch {
      if (!ac.signal.aborted) message.error('搜索失败，请稍后重试')
    } finally {
      if (!ac.signal.aborted) setSearching(false)
    }
  }, [message])

  useEffect(() => {
    handleSearch(searchKeyword || '人工智能')
    return () => { abortRef.current?.abort() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 构造图谱：即使接口返回空，也保底显示中心人物节点
  const graphOption = (() => {
    if (!currentTalent) return null
    let nodes = graphNodes
    let links = graphLinks
    const hasPersonNodes = nodes.some(n => n.class === 'PERSON')
    if (!hasPersonNodes) {
      // 保底：构造只有中心人物的单节点
      nodes = [{
        id: currentTalent.auid,
        name: currentTalent.name,
        org: currentTalent.org,
        h: currentTalent.hIndex,
        class: 'PERSON',
      }]
      links = []
    }
    return buildGraphOption(nodes, links, currentTalent.auid)
  })()

  return (
    <div className={styles.twoColumnLayout}>
      {/* 左列 */}
      <div className={styles.leftColumn}>
        <div className={styles.graphArea}>
          {graphLoading || searching ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 420 }}>
              <Spin indicator={<LoadingOutlined spin style={{ fontSize: 32, color: '#5A9CF7' }} />} />
              <div style={{ color: '#5A9CF7', fontSize: 13, marginTop: 12 }}>{searching ? '搜索中...' : '加载图谱...'}</div>
            </div>
          ) : graphOption ? (
            <ReactECharts option={graphOption} style={{ height: '100%', minHeight: 420 }} notMerge />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 420 }}>
              <Empty description={<span style={{ color: '#5A9CF7' }}>搜索人才姓名查看关系图谱</span>} />
            </div>
          )}
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}><BarChartOutlined className={styles.icon} />研究方向分布</div>
          <ReactECharts option={getFieldBarOption(fieldData)} style={{ height: 240 }} notMerge />
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}><LineChartOutlined className={styles.icon} />研究方向趋势</div>
          <ReactECharts option={getTrendOption(trendData)} style={{ height: 200 }} notMerge />
        </div>
      </div>

      {/* 右列 */}
      <div className={styles.rightColumn}>
        {/* 当前人才 — 与左侧图谱同高 */}
        <div className={`${styles.panelCard} ${styles.talentDetailCard}`}>
          <div className={styles.panelTitle}><UserOutlined className={styles.icon} />当前人才</div>
          {currentTalent ? (
            <div className={styles.talentDetailContent}>
              {/* 顶部：头像 + 姓名 + 机构 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <div className={styles.talentAvatarLarge}><UserOutlined style={{ fontSize: 28 }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1D2129' }}>{currentTalent.name}</span>
                    {currentTalent.title && <span style={{ fontSize: 12, color: '#86909C' }}>{currentTalent.title}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#4E5969', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentTalent.org}>
                    <BankOutlined style={{ marginRight: 4, fontSize: 11 }} />{currentTalent.org}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {currentTalent.field && <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>{currentTalent.field}</Tag>}
                    <Tag color={getHLevelTag(currentTalent.hIndex).color} style={{ fontSize: 11, margin: 0 }}>{getHLevelTag(currentTalent.hIndex).label}</Tag>
                  </div>
                </div>
              </div>

              {/* 核心指标：四宫格 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#2468F2' }}>{currentTalent.hIndex}</span>, label: 'H指数', bg: '#f0f5ff' },
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#2BA471' }}>{currentTalent.papers}</span>, label: '论文', bg: '#f0fff4' },
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{currentTalent.patents}</span>, label: '专利', bg: '#fffbe6' },
                  { icon: <span style={{ fontSize: 20, fontWeight: 700, color: '#F26B4A' }}>{currentTalent.achievements}</span>, label: '成果', bg: '#fff2f0' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '12px 0', borderRadius: 10, background: item.bg,
                  }}>
                    {item.icon}
                    <div style={{ fontSize: 11, color: '#86909C', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* 研究方向 */}
              {currentTalent.direction && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: 1 }}>研究方向</div>
                  <div style={{ fontSize: 12, color: '#4E5969', lineHeight: 1.7 }}>
                    {currentTalent.direction.length > 80 ? currentTalent.direction.slice(0, 80) + '...' : currentTalent.direction}
                  </div>
                </div>
              )}

              {/* 学术背景 */}
              {currentTalent.background && (
                <div>
                  <div style={{ fontSize: 11, color: '#86909C', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: 1 }}>学术背景</div>
                  <div style={{ fontSize: 12, color: '#4E5969', lineHeight: 1.7 }}>
                    {currentTalent.background.length > 80 ? currentTalent.background.slice(0, 80) + '...' : currentTalent.background}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#999', fontSize: 13 }}>搜索人才后显示详情</div>
          )}
        </div>

        {/* 合作人才 */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}><TeamOutlined className={styles.icon} />合作人才</div>
          <div className={styles.cooperateList}>
            {coopTalents.length > 0 ? coopTalents.map((t, i) => (
              <div key={i} className={styles.cooperateItem}>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.institution}>{t.org}</div>
                </div>
                {t.field && <span className={styles.field}>{t.field}</span>}
              </div>
            )) : (
              <div style={{ padding: 16, textAlign: 'center', color: '#999', fontSize: 13 }}>
                {currentTalent ? '暂无合作人才数据' : '搜索人才后显示合作者'}
              </div>
            )}
          </div>
        </div>

        {/* 高端人才榜 */}
        <div className={`${styles.panelCard} ${styles.talentRankCard}`}>
          <div className={styles.panelTitle}><TrophyOutlined className={styles.icon} />高端人才榜</div>
          <div className={styles.rankList}>
            {topTalents.length > 0 ? topTalents.map((t, i) => {
              const level = getHLevelTag(t.h)
              return (
                <div key={i} className={styles.rankItem}>
                  <span className={`${styles.rankNum} ${i === 0 ? styles.top1 : i === 1 ? styles.top2 : i === 2 ? styles.top3 : ''}`}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: '#1D2129', fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#86909C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.org}>
                      {t.org}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <Tag color="blue" style={{ fontSize: 11, margin: 0, borderRadius: 10, lineHeight: '18px', padding: '0 6px' }}>H:{t.h}</Tag>
                    <Tag color={level.color} style={{ fontSize: 11, margin: 0, borderRadius: 10, lineHeight: '18px', padding: '0 6px' }}>{level.label}</Tag>
                  </div>
                </div>
              )
            }) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>搜索后显示排名</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
