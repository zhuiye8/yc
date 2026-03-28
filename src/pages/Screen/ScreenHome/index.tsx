import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'
import ScreenTabs from '../components/ScreenTabs'

function getIndustryOption() {
  return {
    grid: { left: 10, right: 10, top: 30, bottom: 30, containLabel: true },
    xAxis: { type: 'category' as const, data: ['湿电子化学品', '新能源新材料', '先进制剂', '酵母发酵', '船舶制造', '人工智能'], axisLabel: { color: '#B0C4DE', fontSize: 10, rotate: 15 }, axisLine: { lineStyle: { color: '#1a3a6a' } } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#B0C4DE', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a3a6a' } } },
    legend: { data: ['强链', '弱链', '缺链'], textStyle: { color: '#B0C4DE', fontSize: 10 }, top: 0 },
    series: [
      { name: '强链', type: 'bar', stack: 'total', data: [3200, 1800, 1950, 500, 1300, 500], itemStyle: { color: '#28fab4' } },
      { name: '弱链', type: 'bar', stack: 'total', data: [2100, 1400, 1200, 300, 900, 400], itemStyle: { color: '#1890ff' } },
      { name: '缺链', type: 'bar', stack: 'total', data: [320, 400, 250, 100, 200, 150], itemStyle: { color: '#f5222d' } },
    ],
  }
}

function getInnovationOption() {
  return {
    grid: { left: 80, right: 30, top: 5, bottom: 5 },
    xAxis: { type: 'value' as const, show: false },
    yAxis: { type: 'category' as const, data: ['知识产权', '技术标准', '科研项目', '产业园区'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#B0C4DE', fontSize: 11 } },
    series: [{ type: 'bar', data: [234, 156, 89, 12], barWidth: 12, itemStyle: { borderRadius: [0, 4, 4, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#28fab4' }] } }, label: { show: true, position: 'right', color: '#FFD900', fontSize: 12 } }],
  }
}

function getFundsOption() {
  return {
    grid: { left: 10, right: 10, top: 5, bottom: 25, containLabel: true },
    xAxis: { type: 'category' as const, data: ['融资工具', '投资机构', '对接数', '周更新'], axisLabel: { color: '#B0C4DE', fontSize: 10 }, axisLine: { lineStyle: { color: '#1a3a6a' } } },
    yAxis: { type: 'value' as const, show: false },
    series: [{ type: 'bar', data: [67, 133, 55, 34], barWidth: 20, itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#6AB7FF' }, { offset: 1, color: '#1890FF' }] } }, label: { show: true, position: 'top', color: '#FFD900', fontSize: 12, fontWeight: 600 } }],
  }
}

const gradientNum = {
  fontWeight: 700,
  background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

function StatCard({ value, text }: { value: string | number; text: string }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 4px',
      backgroundImage: 'url(/images/screen/tab.png)',
      backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)', ...gradientNum }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 10, color: '#AFABAB', marginTop: 2 }}>{text}</div>
    </div>
  )
}

const talentData = {
  total: 490032,
  items: [
    { text: '宜昌籍人才', value: 23457 },
    { text: '领军人才', value: 1235 },
    { text: '创新人才', value: 41134 },
    { text: '紧缺人才', value: 2752 },
  ],
}

const policyData = {
  total: 134,
  items: [
    { text: '人才政策', value: 44 },
    { text: '可申报', value: 56 },
    { text: '到期预警', value: 4 },
  ],
}

export default function ScreenHome() {
  return (
    <div className="main-content">
      {/* 左侧栏 */}
      <div className="left-column">
        <div className="left-middle">
          <div className="left-middle-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 8px' }}>
            <ReactECharts option={getIndustryOption()} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="left-bottom">
          <div className="left-bottom-title" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 12px' }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', ...gradientNum }}>
                {talentData.total.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#B0C4DE' }}>人才总数</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
              {talentData.items.map(i => (
                <StatCard key={i.text} value={i.value} text={i.text} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <ScreenTabs />
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        <div className="right-top">
          <div className="right-top-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 8px' }}>
            <ReactECharts option={getInnovationOption()} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="right-middle">
          <div className="right-middle-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 8px' }}>
            <ReactECharts option={getFundsOption()} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="right-bottom">
          <div className="right-bottom-title" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 12px' }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', ...gradientNum }}>
                {policyData.total}
              </div>
              <div style={{ fontSize: 12, color: '#B0C4DE' }}>政策总数</div>
            </div>
            <div style={{ display: 'flex', gap: 6, width: '100%' }}>
              {policyData.items.map(i => (
                <StatCard key={i.text} value={i.value} text={i.text} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
