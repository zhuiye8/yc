import { useState, useEffect, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'
import ScreenTabs from '../components/ScreenTabs'
import { searchOrgs } from '@/services/industry'
import { searchExperts } from '@/services/talent'

const chainOptions = [
  { key: 'wetchem', label: '湿电子化学品', searchKey: '电子化学品 OR 半导体材料 OR 湿电子' },
  { key: 'newenergy', label: '新能源新材料', searchKey: '新能源 OR 新材料 OR 电池 OR 储能' },
  { key: 'pharma', label: '先进制剂与高端仿制药', searchKey: '制药 OR 仿制药 OR 生物医药 OR 药物制剂' },
  { key: 'yeast', label: '酵母发酵与功能成分制造', searchKey: '酵母 OR 发酵 OR 生物工程 OR 功能食品' },
  { key: 'ship', label: '内河绿色智能船舶制造', searchKey: '船舶 OR 造船 OR 航运 OR 船舶制造' },
  { key: 'ai', label: '人工智能', searchKey: '人工智能' },
]

// 企业类型分布图 option（完全复制旧项目 distribution.jsx）
function getDistributionOption(values: number[]) {
  const categories = ['上市公司', '专精特新', '科技型中小', '全量科技']
  return {
    grid: { left: '5%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category', data: categories,
      axisLabel: { fontSize: 12, color: '#FFFFFF', fontWeight: 400, rotate: 0, interval: 0 },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false }, splitLine: { show: false },
    },
    yAxis: {
      type: 'value', name: '数量 (总数)',
      nameTextStyle: { color: '#B0C4DE', fontSize: 12 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' as const } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
      axisTick: { show: false },
    },
    series: [
      {
        name: '企业数量', type: 'bar', data: values, barWidth: 24,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: '#1E3A8A' }] },
          borderRadius: [4, 4, 0, 0],
        },
        label: { show: true, position: 'top', fontWeight: 600, fontSize: 12, color: '#87CEEB', offset: [0, 4] },
      },
      {
        name: '趋势线', type: 'line', data: values,
        symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#87CEEB', width: 3, shadowColor: 'rgba(135, 206, 235, 0.5)', shadowBlur: 10 },
        itemStyle: { color: '#87CEEB', borderColor: '#FFFFFF', borderWidth: 2 },
        smooth: false, zlevel: 2, label: { show: false },
      },
    ],
  }
}

interface OrgRow { name: string; industry: string }
interface TalentRow { name: string; title: string; org: string }

export default function ScreenIndustry() {
  const [selectedChain, setSelectedChain] = useState(5)

  const [indicators, setIndicators] = useState({ chains: 6, missing: 4, strong: 10, orgTotal: 0, talentTotal: 0 })
  const [enterpriseList, setEnterpriseList] = useState<OrgRow[]>([])
  const [talentList, setTalentList] = useState<TalentRow[]>([])
  const [distValues, setDistValues] = useState([0, 0, 0, 0])
  const [orgLoading, setOrgLoading] = useState(false)
  const [talentLoading, setTalentLoading] = useState(false)
  const [city, setCity] = useState<string | undefined>(undefined)
  const loadIdRef = useRef(0)

  const chainSearchKey = chainOptions[selectedChain].searchKey

  const handleViewChange = useCallback((view: 'china' | 'yichang') => {
    setCity(view === 'yichang' ? '宜昌' : undefined)
  }, [])

  // 企业和人才独立加载，先到先显示
  useEffect(() => {
    const id = ++loadIdRef.current

    // 企业（200条样本：前10给列表，全部做TAGS统计）
    setOrgLoading(true)
    searchOrgs(chainSearchKey, 0, 200, city).then(res => {
      if (id !== loadIdRef.current) return
      const d = res?.data as Record<string, unknown> | undefined
      const list = (d?.orgRecommend || []) as Record<string, unknown>[]
      const total = (d?.total as number) || 0

      setEnterpriseList(list.slice(0, 10).map(o => ({
        name: String(o.NAME || ''),
        industry: ((o.TRADE || []) as string[])[0]?.replace(/^.+、/, '') || '',
      })))

      // TAGS统计企业类型
      let listed = 0, specialized = 0, techSme = 0
      list.forEach(o => {
        const tags = ((o.TAGS || []) as string[]).join(',')
        if (tags.includes('上市')) listed++
        if (tags.includes('专精特新')) specialized++
        if (tags.includes('科技型中小')) techSme++
      })
      const ratio = list.length > 0 ? total / list.length : 1
      setDistValues([
        Math.max(listed, Math.round(listed * ratio)),
        Math.max(specialized, Math.round(specialized * ratio)),
        Math.max(techSme, Math.round(techSme * ratio)),
        total,
      ])

      setIndicators(prev => ({ ...prev, orgTotal: total }))
      setOrgLoading(false)
    }).catch(() => { if (id === loadIdRef.current) setOrgLoading(false) })

    // 人才
    setTalentLoading(true)
    searchExperts(chainSearchKey, 0, 12, city).then(res => {
      if (id !== loadIdRef.current) return
      const d = res?.data as Record<string, unknown> | undefined
      const list = (d?.expertsRecommend || []) as Record<string, unknown>[]
      const total = (d?.total as number) || 0

      setTalentList(list.map(e => ({
        name: String(e.CNAME || ''),
        title: ((e.TITLE || []) as string[])[0] || '',
        org: String(e.AORG || ''),
      })))

      setIndicators(prev => ({ ...prev, talentTotal: total }))
      setTalentLoading(false)
    }).catch(() => { if (id === loadIdRef.current) setTalentLoading(false) })
  }, [chainSearchKey, city])

  return (
    <div className="main-content industry-container">
      {/* 左侧栏 */}
      <div className="left-column">
        {/* 产业选择网格 */}
        <div className="industry-top">
          <div className="industry-items">
            {chainOptions.map((item, i) => (
              <div key={i} onClick={() => setSelectedChain(i)}
                className={`industry-item ${i === selectedChain ? 'active' : ''}`}>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* 产业链综合指标 */}
        <div className="left-middle">
          <div className="left-middle-title" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 12px', gap: 8, justifyContent: 'center' }}>
            {/* 第一行：缺链数 + 强链数 */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: '缺链数', value: indicators.missing },
                { label: '强链数', value: indicators.strong },
              ].map(ind => (
                <div key={ind.label} style={{ flex: 1, textAlign: 'center', padding: '14px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4, background: 'rgba(0,198,255,0.03)' }}>
                  <div style={{ fontSize: 12, color: '#AFABAB', marginBottom: 6, fontWeight: 500 }}>{ind.label}</div>
                  <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{ind.value}</div>
                </div>
              ))}
            </div>
            {/* 第二行：产业链数 + 企业总数 + 人才总数 */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: '产业链数', value: indicators.chains },
                { label: '企业总数', value: indicators.orgTotal.toLocaleString() },
                { label: '人才总数', value: indicators.talentTotal.toLocaleString() },
              ].map(ind => (
                <div key={ind.label} style={{ flex: 1, textAlign: 'center', padding: '14px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4, background: 'rgba(0,198,255,0.03)' }}>
                  <div style={{ fontSize: 12, color: '#AFABAB', marginBottom: 6, fontWeight: 500 }}>{ind.label}</div>
                  <div style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.8rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{ind.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 链上企业 */}
        <div className="left-bottom">
          <div className="left-bottom-title" />
          <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#7a8ba8' }}>
              <span style={{ flex: 1, textAlign: 'center' }}>企业名</span>
              <span style={{ flex: 1, textAlign: 'center' }}>所属行业</span>
            </div>
            {orgLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#00c6ff', fontSize: 12 }}>
                <div style={{ marginBottom: 6, opacity: 0.6 }}>⟳</div>加载中...
              </div>
            ) : enterpriseList.length > 0 ? enterpriseList.map((e, i) => (
              <div key={i} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#B0C4DE' }}>
                <span style={{ flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                <span style={{ flex: 1, textAlign: 'center', color: '#00c6ff', fontSize: 11 }}>{e.industry}</span>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#7a8ba8', fontSize: 12 }}>暂无企业数据</div>
            )}
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <ScreenTabs />
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap ckey={chainSearchKey} onViewChange={handleViewChange} />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        {/* 链上人才 */}
        <div className="right-middle">
          <div className="right-middle-title" />
          <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#7a8ba8' }}>
              <span style={{ flex: 1, textAlign: 'center' }}>人才名</span>
              <span style={{ flex: 1, textAlign: 'center' }}>职称</span>
              <span style={{ flex: 1, textAlign: 'center' }}>机构</span>
            </div>
            {talentLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#00c6ff', fontSize: 12 }}>
                <div style={{ marginBottom: 6, opacity: 0.6 }}>⟳</div>加载中...
              </div>
            ) : talentList.length > 0 ? talentList.map((t, i) => (
              <div key={i} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#B0C4DE' }}>
                <span style={{ flex: 1, textAlign: 'center' }}>{t.name}</span>
                <span style={{ flex: 1, textAlign: 'center', color: '#00c6ff' }}>{t.title || '-'}</span>
                <span style={{ flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.org}</span>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#7a8ba8', fontSize: 12 }}>暂无人才数据</div>
            )}
          </div>
        </div>

        {/* 企业类型分布 — 柱状+折线图 */}
        <div className="right-bottom">
          <div className="right-bottom-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getDistributionOption(distValues)} style={{ height: '100%' }} notMerge />
          </div>
        </div>
      </div>
    </div>
  )
}
