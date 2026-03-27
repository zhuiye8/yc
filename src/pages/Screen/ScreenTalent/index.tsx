import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'

const tabs = [
  { name: '产业布局', url: '/screen/industry' },
  { name: '人才总览', url: '/screen/talent' },
  { name: '创新资源', url: '/screen' },
  { name: '资金概览', url: '/screen' },
  { name: '政策全景', url: '/screen' },
]

function getNationwideOption() {
  return {
    grid: { left: 40, right: 10, top: 20, bottom: 25, containLabel: true },
    xAxis: { type: 'category' as const, data: ['北京', '上海', '广东', '湖北', '江苏', '安徽', '福建', '江西', '山东', '河南', '湖南'], axisLabel: { color: '#B0C4DE', fontSize: 9 }, axisLine: { lineStyle: { color: '#1a3a6a' } } },
    yAxis: { type: 'value' as const, name: '(总数)', nameTextStyle: { color: '#7a8ba8', fontSize: 10 }, axisLabel: { color: '#B0C4DE', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a3a6a' } } },
    series: [{ type: 'bar', data: [10000, 9000, 8500, 7200, 6800, 5500, 4200, 3800, 3200, 2800, 2400], barWidth: 16, itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#6AB7FF' }, { offset: 1, color: '#1E3A8A' }] } }, label: { show: true, position: 'top', color: '#FFD900', fontSize: 10, fontWeight: 600 } }],
  }
}

function getClassificationOption() {
  return {
    legend: { show: false },
    series: [{
      type: 'pie', radius: ['15%', '80%'], roseType: 'area' as const, padAngle: 5,
      center: ['50%', '50%'],
      label: { color: '#B0C4DE', fontSize: 11, formatter: '{b} {c}人' },
      data: [
        { name: '领军人才', value: 9668, itemStyle: { color: '#3B82F6' } },
        { name: '技能人才', value: 12668, itemStyle: { color: '#FF8A00' } },
        { name: '创新人才', value: 23146, itemStyle: { color: '#10B981' } },
      ],
    }],
  }
}

function getTotalOption() {
  return {
    grid: { left: 90, right: 50, top: 5, bottom: 5 },
    xAxis: { type: 'value' as const, show: false },
    yAxis: { type: 'category' as const, data: ['院士/顶尖', '高级人才', '骨干人才', '中坚力量'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#B0C4DE', fontSize: 11 } },
    series: [{ type: 'bar', data: [45, 235, 1890, 8432], barWidth: 14, itemStyle: { borderRadius: [0, 4, 4, 0], color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#1890FF' }, { offset: 1, color: '#6AB7FF' }] } }, label: { show: true, position: 'right', color: '#FFD900', fontSize: 11, fontWeight: 600 } }],
  }
}

function getYichangOption() {
  return {
    grid: { left: 40, right: 10, top: 20, bottom: 25, containLabel: true },
    xAxis: { type: 'category' as const, data: ['北京', '上海', '广东', '湖北', '江苏', '安徽', '福建', '江西', '山东', '河南', '湖南'], axisLabel: { color: '#B0C4DE', fontSize: 9 }, axisLine: { lineStyle: { color: '#1a3a6a' } } },
    yAxis: { type: 'value' as const, name: '(总数)', nameTextStyle: { color: '#7a8ba8', fontSize: 10 }, axisLabel: { color: '#B0C4DE', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a3a6a' } } },
    series: [{ type: 'bar', data: [10000, 7200, 6800, 7200, 4300, 3800, 3200, 2800, 2400, 2100, 1800], barWidth: 16, itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#6AB7FF' }, { offset: 1, color: '#1E3A8A' }] } }, label: { show: true, position: 'top', color: '#FFD900', fontSize: 10, fontWeight: 600 } }],
  }
}

function getValueChainOption() {
  return {
    legend: { show: false },
    series: [{
      type: 'pie', radius: ['40%', '75%'], padAngle: 5,
      label: { color: '#B0C4DE', fontSize: 10, formatter: '{b}\n{c}人' },
      itemStyle: { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 2 },
      data: [
        { name: '人工智能', value: 5713, itemStyle: { color: '#3B82F6' } },
        { name: '湿电子化学品', value: 5713, itemStyle: { color: '#06B6D4' } },
        { name: '新能源电池', value: 5713, itemStyle: { color: '#FF8A00' } },
        { name: '化学制药', value: 5713, itemStyle: { color: '#EF4444' } },
        { name: '合成生物', value: 5713, itemStyle: { color: '#A855F7' } },
        { name: '船舶制造', value: 5713, itemStyle: { color: '#10B981' } },
      ],
    }],
  }
}

function getGapCountOption() {
  return {
    grid: { left: 10, right: 30, top: 30, bottom: 25, containLabel: true },
    xAxis: { type: 'category' as const, data: ['湿电子化学品', '新能源电池', '化学制药', '合成生物', '船舶制造', '人工智能'], axisLabel: { color: '#B0C4DE', fontSize: 9, rotate: 15 }, axisLine: { lineStyle: { color: '#1a3a6a' } } },
    yAxis: [
      { type: 'value' as const, name: '(总数)', nameTextStyle: { color: '#7a8ba8', fontSize: 10 }, axisLabel: { color: '#B0C4DE', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a3a6a' } } },
    ],
    series: [
      { type: 'bar', data: [1500, 1200, 1300, 1100, 800, 1600], barWidth: 16, itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#6AB7FF' }, { offset: 1, color: '#1E3A8A' }] } } },
      { type: 'line', data: [1500, 1200, 1300, 1100, 800, 1600], smooth: true, lineStyle: { color: '#FFD900', width: 2 }, itemStyle: { color: '#FFD900' }, symbol: 'circle', symbolSize: 6 },
    ],
  }
}

export default function ScreenTalent() {
  const navigate = useNavigate()

  return (
    <div className="main-content">
      {/* 左侧栏 */}
      <div className="left-column">
        <div className="left-middle">
          <div className="left-middle-title" style={{ backgroundImage: `url(/src/assets/images/screen/nationwide-title.png)` }} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getNationwideOption()} style={{ height: '100%' }} />
          </div>
        </div>
        <div className="left-bottom">
          <div className="left-bottom-title" style={{ backgroundImage: `url(/src/assets/images/screen/classfication-title.png)` }} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getClassificationOption()} style={{ height: '100%' }} />
          </div>
        </div>
        <div className="left-middle" style={{ backgroundImage: `url(/src/assets/images/screen/talent.png)` }}>
          <div className="left-middle-title" style={{ backgroundImage: `url(/src/assets/images/screen/total-title.png)` }} />
          <div style={{ padding: '0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>517,482</span>
              <span style={{ fontSize: 12, color: '#B0C4DE' }}>人才总数</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getTotalOption()} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <div className="middle-top">
          {tabs.map(t => (
            <span key={t.name} className="tab-item" onClick={() => navigate(t.url)}>{t.name}</span>
          ))}
        </div>
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        <div className="right-top">
          <div className="right-top-title" style={{ backgroundImage: `url(/src/assets/images/screen/yichang-title.png)` }} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getYichangOption()} style={{ height: '100%' }} />
          </div>
        </div>
        <div className="right-middle">
          <div className="right-middle-title" style={{ backgroundImage: `url(/src/assets/images/screen/valuechain-title.png)` }} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getValueChainOption()} style={{ height: '100%' }} />
          </div>
        </div>
        <div className="right-bottom">
          <div className="right-bottom-title" style={{ backgroundImage: `url(/src/assets/images/screen/gapcount-title.png)` }} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getGapCountOption()} style={{ height: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
