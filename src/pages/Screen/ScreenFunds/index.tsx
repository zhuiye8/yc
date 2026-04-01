import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'
import ScreenTabs from '../components/ScreenTabs'

// ========== 资金指标横向柱状图 ==========
function getIndicatorBarOption() {
  const items = [
    { name: '金融产品', value: 257 },
    { name: '入驻机构', value: 34 },
    { name: '申请次数', value: 678435 },
    { name: '注册用户', value: 182712 },
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

// ========== 基金概览柱状图 ==========
function getFundOverviewOption() {
  const categories = ['VC', 'PE', '引导基金', '天使基金', '产业基金', '母基金']
  const values = [1300, 600, 2502, 1123, 1678, 98]
  return {
    grid: { left: '5%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category' as const, data: categories,
      axisLabel: { fontSize: 10, color: '#FFFFFF', fontWeight: 400, interval: 0 },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      max: 2500, interval: 500,
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' as const } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar', data: values, barWidth: 20,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: '#1E3A8A' }],
        },
      },
      label: { show: true, position: 'top', color: '#FFD900', fontSize: 10, fontWeight: 600 },
    }],
  }
}

// ========== 产品列表数据 ==========
const productHeaders = ['产品名称', '所属机构', '贷款额度/万', '贷款利率/%', '贷款周期/月']
const productColumnWidths = ['25%', '25%', '17%', '16%', '17%']
const productRows = [
  { name: '楚天快e贷', org: '中国农业银行三峡分行', max: '0-50', rate: '2.8-3.6', period: '12-36', hot: false },
  { name: '白领快贷', org: '湖北银行宜昌分行', max: '0-100', rate: '3.15-3.2', period: '12-60', hot: false },
  { name: '碳减排支持领域贷款', org: '广发银行', max: '0-9999', rate: '2-6', period: '0-180', hot: false },
  { name: '惠民贷', org: '交通银行宜昌分行', max: '0-80', rate: '3.05-4.36', period: '12-60', hot: false },
  { name: '生态保护修复贷款', org: '中国农业银行三峡分行', max: '0-9999', rate: '2-6', period: '0-180', hot: false },
  { name: '小微企业信用快贷', org: '中国建设银行三峡分行', max: '0-300', rate: '3-8', period: '0-12', hot: false },
  { name: '三峡云e贷', org: '三峡农商银行', max: '0-30', rate: '3-4.55', period: '0-36', hot: false },
  { name: '创业担保贷(小微)', org: '三峡农商银行', max: '30-500', rate: '1.75-2', period: '12-36', hot: true },
  { name: '科技人才贷', org: '三峡农商银行', max: '200-1500', rate: '2.7-4', period: '12-60', hot: true },
  { name: '知识产权贷', org: '三峡农商银行', max: '0-500', rate: '3.8-6', period: '1-24', hot: true },
]

// ========== 授信列表数据 ==========
const creditHeaders = ['授信对象', '所属机构', '授信日期', '授信金额']
const creditColumnWidths = ['35%', '25%', '20%', '20%']
const creditRows = [
  { name: '枝江市顾店红仓储服务有限公司', org: '枝江农商银行', date: '2026-03-20', amount: '30万元' },
  { name: '夷陵区小溪塔恒帆灯具经营部', org: '邮储银行', date: '2026-03-19', amount: '30万元' },
  { name: '当阳市特种水产养殖中心', org: '邮储银行', date: '2026-03-19', amount: '30万元' },
  { name: '湖北宸聚建设有限公司', org: '三峡农商银行', date: '2026-03-19', amount: '250万元' },
  { name: '五峰丽涛宾馆', org: '邮储银行', date: '2026-03-19', amount: '30万元' },
  { name: '宜昌土家神韵农业开发有限公司', org: '三峡农商银行', date: '2026-03-19', amount: '100万元' },
  { name: '宜昌咖芒文化传媒有限公司', org: '汉口银行', date: '2026-03-19', amount: '30万元' },
  { name: '宜都市碧香茶业厂', org: '宜都农商银行', date: '2026-03-19', amount: '15万元' },
  { name: '夷陵区顺心油厂', org: '邮储银行', date: '2026-03-19', amount: '30万元' },
  { name: '湖北博卡贸易有限公司', org: '三峡农商银行', date: '2026-03-19', amount: '150万元' },
]

// 排序：热门产品在前
const sortedProducts = [...productRows].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0))

export default function ScreenFunds() {
  return (
    <div className="main-content funds-container">
      {/* 左侧栏 */}
      <div className="left-column">
        {/* 资金指标 */}
        <div className="left-top">
          <div className="left-top-title" />
          <div style={{ padding: '0 8px' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4, background: 'rgba(0,198,255,0.03)' }}>
                <div style={{ fontSize: 11, color: '#AFABAB', marginBottom: 4 }}>授信金额</div>
                <div style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3154.44亿</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4, background: 'rgba(0,198,255,0.03)' }}>
                <div style={{ fontSize: 11, color: '#AFABAB', marginBottom: 4 }}>放款金额</div>
                <div style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>1732.18亿</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getIndicatorBarOption()} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 基金概览 */}
        <div className="left-bottom">
          <div className="left-bottom-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getFundOverviewOption()} style={{ height: '100%' }} notMerge />
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <ScreenTabs />
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap ckey="资金" />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        {/* 产品列表 */}
        <div className="right-top">
          <div className="right-top-title" />
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
            <div style={{ display: 'flex', backgroundColor: '#0d4fa3', flexShrink: 0 }}>
              {productHeaders.map((h, i) => (
                <div key={i} style={{ width: productColumnWidths[i], color: '#00ffe4', fontSize: 11, padding: '6px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {sortedProducts.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: row.hot ? 'rgba(0,198,255,0.08)' : 'transparent' }}>
                  <div style={{ width: productColumnWidths[0], color: row.hot ? '#00c6ff' : '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.hot ? '\uD83D\uDD25' : ''}{row.name}
                  </div>
                  <div style={{ width: productColumnWidths[1], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.org}</div>
                  <div style={{ width: productColumnWidths[2], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.max}</div>
                  <div style={{ width: productColumnWidths[3], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.rate}</div>
                  <div style={{ width: productColumnWidths[4], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 授信列表 */}
        <div className="right-bottom">
          <div className="right-bottom-title" />
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
            <div style={{ display: 'flex', backgroundColor: '#0d4fa3', flexShrink: 0 }}>
              {creditHeaders.map((h, i) => (
                <div key={i} style={{ width: creditColumnWidths[i], color: '#00ffe4', fontSize: 11, padding: '6px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {creditRows.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: creditColumnWidths[0], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</div>
                  <div style={{ width: creditColumnWidths[1], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.org}</div>
                  <div style={{ width: creditColumnWidths[2], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.date}</div>
                  <div style={{ width: creditColumnWidths[3], color: '#00c6ff', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
