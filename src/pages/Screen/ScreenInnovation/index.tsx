import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'
import ScreenTabs from '../components/ScreenTabs'

// ========== 创新资源统计横向柱状图 ==========
function getResourceBarOption() {
  const items = [
    { name: '科技文献', value: 430002 },
    { name: '科技成果', value: 63553 },
    { name: '技术标准', value: 19756 },
    { name: '产业园区', value: 8073 },
  ]
  return {
    grid: { left: '5%', right: '15%', bottom: '5%', top: '5%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' as const, show: false },
    yAxis: {
      type: 'category' as const,
      data: items.map(i => i.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#B0C4DE', fontWeight: 500 },
      inverse: true,
    },
    series: [{
      type: 'bar',
      data: items.map(i => i.value),
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#1E40AF' }, { offset: 1, color: '#87CEEB' }],
        },
      },
      label: { show: true, position: 'right', color: '#FFD900', fontSize: 11, fontWeight: 600 },
    }],
  }
}

// ========== 技术热点矩形树图 ==========
function getHotspotOption() {
  const data = [
    { name: '石油、煤气及\n炼焦工业', value: 18,
      itemStyle: { color: { type: 'linear', colorStops: [{ offset: 0, color: '#8B5CF6' }, { offset: 1, color: '#3B82F6' }] } } },
    { name: '无机化学', value: 10,
      itemStyle: { color: { type: 'linear', colorStops: [{ offset: 0, color: '#1E3A8A' }, { offset: 1, color: '#60A5FA' }] } } },
    { name: '水、废水处理', value: 10,
      itemStyle: { color: { type: 'linear', colorStops: [{ offset: 0, color: '#F472B6' }, { offset: 1, color: '#F9A8D4' }] } } },
    { name: '液体变溶式机械', value: 14,
      itemStyle: { color: { type: 'linear', colorStops: [{ offset: 0, color: '#06B6D4' }, { offset: 1, color: '#2DD4BF' }] } } },
    { name: '一般的物理或\n化学方法', value: 6,
      itemStyle: { color: { type: 'linear', colorStops: [{ offset: 0, color: '#FCD34D' }, { offset: 1, color: '#FDE047' }] } } },
  ]
  return {
    tooltip: { trigger: 'item', formatter: (p: { name: string; value: number }) => `${p.name}<br/>数量: ${p.value}` },
    series: [{
      type: 'treemap',
      data,
      label: { show: true, position: 'inside', fontSize: 11, color: '#FFFFFF' },
      itemStyle: { borderColor: '#0A0F1A', borderWidth: 2, gapWidth: 2, borderRadius: 4 },
      roam: false,
      nodeClick: false as const,
      breadcrumb: { show: false },
    }],
  }
}

// ========== 年度趋势折线图 ==========
function getAnnualTrendOption() {
  const years = ['2021', '2022', '2023', '2024', '2025', '2026']
  const series = [
    { name: '专利申请', values: [680, 780, 950, 1100, 1680, 2000], color: '#3B82F6' },
    { name: '专利授权', values: [300, 350, 400, 450, 1120, 1200], color: '#10B981' },
    { name: '标准发布', values: [100, 125, 130, 135, 680, 1350], color: '#F59E0B' },
    { name: '科研项目', values: [50, 55, 60, 65, 1350, 1500], color: '#EF4444' },
  ]
  return {
    grid: { left: '5%', right: '5%', bottom: '8%', top: '20%', containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: {
      top: 4, right: 8, textStyle: { color: '#B0C4DE', fontSize: 10 },
      itemWidth: 12, itemHeight: 8,
    },
    xAxis: {
      type: 'category' as const, data: years,
      axisLabel: { fontSize: 10, color: '#B0C4DE' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' as const } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
      axisTick: { show: false },
    },
    series: series.map(s => ({
      name: s.name, type: 'line' as const, data: s.values,
      symbol: 'circle', symbolSize: 6, smooth: false,
      lineStyle: { color: s.color, width: 2 },
      itemStyle: { color: s.color },
    })),
  }
}

// ========== 专利列表数据 ==========
const patentHeaders = ['名称', '申请人/单位', '申请时间', '类型', 'IPC', '状态']
const patentColumnRatios = [0.25, 0.2, 0.15, 0.13, 0.13, 0.14]
const patentRows = [
  { name: '发明专利A', applicant: '李某某', applyTime: '2026.8', type: '发明', ipc: 'IPC-A', status: '已授权' },
  { name: '实用新型B', applicant: '张某某', applyTime: '2026.7', type: '实用新型', ipc: 'IPC-B', status: '审查中' },
  { name: '实用新型C', applicant: '王某某', applyTime: '2026.6', type: '实用新型', ipc: 'IPC-C', status: '审查中' },
  { name: '发明专利D', applicant: '赵某某', applyTime: '2026.5', type: '发明', ipc: 'IPC-D', status: '已授权' },
  { name: '外观专利E', applicant: '刘某某', applyTime: '2026.4', type: '外观', ipc: 'IPC-E', status: '申请中' },
  { name: '发明专利F', applicant: '陈某某', applyTime: '2026.3', type: '发明', ipc: 'IPC-F', status: '已授权' },
  { name: '实用新型G', applicant: '周某某', applyTime: '2026.2', type: '实用新型', ipc: 'IPC-G', status: '审查中' },
  { name: '发明专利H', applicant: '吴某某', applyTime: '2026.1', type: '发明', ipc: 'IPC-H', status: '已授权' },
  { name: '外观专利I', applicant: '郑某某', applyTime: '2025.12', type: '外观', ipc: 'IPC-I', status: '申请中' },
]

// ========== 资源列表Tab数据 ==========
const standardHeaders = ['名称', '制定单位', '起草人', '标准类型', '发布日期']
const standardColumnRatios = [0.30, 0.28, 0.10, 0.14, 0.18]
const standardRows = Array.from({ length: 8 }, () => ({
  name: '信息技术人工智能术语', issuer: '中国电子技术标准化研究院', drafter: '张三', standardType: '国家标准', publishDate: '2024-03-15',
}))

const projectHeaders = ['项目名称', '项目类型', '承担单位', '项目负责人', '关联专利']
const projectColumnRatios = [0.35, 0.15, 0.25, 0.13, 0.12]
const projectRows = Array.from({ length: 8 }, () => ({
  projectName: '面向6G的智能超表面技术研究与验证', projectType: '国家级', undertakingUnit: '中国科学院xx研究所', projectLeader: '张三', relatedPatent: '发明专利A',
}))

const transformHeaders = ['成果名称', '成果类型', '转化方式', '受让方', '转化主体', '技术领域']
const transformColumnRatios = [0.3, 0.12, 0.12, 0.18, 0.14, 0.14]
const transformRows = Array.from({ length: 8 }, () => ({
  achievementName: '基于深度学习的图像识别方法', achievementType: '发明专利', transformMethod: '技术转让', assignee: '华为技术有限公司', transformSubject: 'xx研究所', techField: '生物医药',
}))

type TabKey = '专利' | '标准' | '在研项目' | '成果转化'

const tabConfig: Record<TabKey, { headers: string[]; ratios: number[]; rows: Record<string, string>[] }> = {
  '专利': {
    headers: patentHeaders,
    ratios: patentColumnRatios,
    rows: patentRows.map(r => ({ '名称': r.name, '申请人/单位': r.applicant, '申请时间': r.applyTime, '类型': r.type, 'IPC': r.ipc, '状态': r.status })),
  },
  '标准': {
    headers: standardHeaders,
    ratios: standardColumnRatios,
    rows: standardRows.map(r => ({ '名称': r.name, '制定单位': r.issuer, '起草人': r.drafter, '标准类型': r.standardType, '发布日期': r.publishDate })),
  },
  '在研项目': {
    headers: projectHeaders,
    ratios: projectColumnRatios,
    rows: projectRows.map(r => ({ '项目名称': r.projectName, '项目类型': r.projectType, '承担单位': r.undertakingUnit, '项目负责人': r.projectLeader, '关联专利': r.relatedPatent })),
  },
  '成果转化': {
    headers: transformHeaders,
    ratios: transformColumnRatios,
    rows: transformRows.map(r => ({ '成果名称': r.achievementName, '成果类型': r.achievementType, '转化方式': r.transformMethod, '受让方': r.assignee, '转化主体': r.transformSubject, '技术领域': r.techField })),
  },
}

const resourceTabs: TabKey[] = ['专利', '标准', '在研项目', '成果转化']

export default function ScreenInnovation() {
  const [activeTab, setActiveTab] = useState<TabKey>('专利')
  const currentTab = tabConfig[activeTab]

  return (
    <div className="main-content innovation-container">
      {/* 左侧栏 */}
      <div className="left-column">
        {/* 创新资源统计 */}
        <div className="left-top">
          <div className="left-top-title" />
          <div style={{ padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#B0C4DE' }}>知识产权总数</span>
              <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                1,620,077
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getResourceBarOption()} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 技术热点 */}
        <div className="left-bottom">
          <div className="left-bottom-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getHotspotOption()} style={{ height: '100%' }} notMerge />
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <ScreenTabs />
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap ckey="创新" />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        {/* 年度趋势 */}
        <div className="right-top">
          <div className="right-top-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getAnnualTrendOption()} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 专利/标准/项目/成果 列表 */}
        <div className="right-bottom">
          <div className="right-bottom-title" />
          <div style={{ display: 'flex', flexShrink: 0, backgroundColor: '#0d4fa3', margin: '0 4px' }}>
            {resourceTabs.map(tab => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '8px 0', fontSize: 12, color: '#FFFFFF',
                  cursor: 'pointer', textAlign: 'center',
                  background: activeTab === tab ? 'linear-gradient(135deg, #3B82F6, #1E3A8A)' : 'transparent',
                  borderBottom: activeTab === tab ? '2px solid #00ffe4' : '2px solid transparent',
                }}
              >
                {tab}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
            {/* 表头 */}
            <div style={{ display: 'flex', backgroundColor: '#0d4fa3', flexShrink: 0 }}>
              {currentTab.headers.map((h, i) => (
                <div key={i} style={{ flex: currentTab.ratios[i] || 1, color: '#00ffe4', fontSize: 11, padding: '6px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h}
                </div>
              ))}
            </div>
            {/* 表体 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {currentTab.rows.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {currentTab.headers.map((h, ci) => (
                    <div key={ci} style={{ flex: currentTab.ratios[ci] || 1, color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row[h] || '-'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
