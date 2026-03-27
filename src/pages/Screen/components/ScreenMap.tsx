import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import chinaGeoJson from '@/assets/geo/china.json'
import tooltipBg from '@/assets/images/screen/tooltip.png'
import './ScreenMap.css'

const mockDatas = [
  { name: '湖北省', label: '宜昌市', enterprise: 11556, talents: 21366 },
  { name: '湖南省', label: '湖南省', enterprise: 71556, talents: 81366 },
  { name: '北京市', label: '', enterprise: 232560, talents: 152360 },
  { name: '上海市', label: '', enterprise: 213256, talents: 133366 },
  { name: '广东省', label: '', enterprise: 223256, talents: 123366 },
  { name: '西藏自治区', label: '', enterprise: 5864, talents: 11222 },
  { name: '四川省', label: '', enterprise: 81864, talents: 71222 },
  { name: '云南省', label: '', enterprise: 61064, talents: 31122 },
  { name: '浙江省', label: '', enterprise: 156000, talents: 98000 },
  { name: '江苏省', label: '', enterprise: 178000, talents: 112000 },
  { name: '山东省', label: '', enterprise: 145000, talents: 87000 },
  { name: '河南省', label: '', enterprise: 98000, talents: 65000 },
  { name: '陕西省', label: '', enterprise: 67000, talents: 45000 },
]

const CHINA_CENTER: [number, number] = [104.0, 32.5]
const YICHANG_CENTER: [number, number] = [111.1, 30.56]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMapOption(mapType: string, center: [number, number], zoom: number, chartWidth?: number): any {
  const fontSize = (chartWidth || 800) < 900 ? 9 : 10
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const item = mockDatas.find(v => v.name === params.name)
        if (!item) return ''
        return `<div style="padding:20px;min-width:160px;min-height:120px;background:url(${tooltipBg}) no-repeat center/100% 100%;">
          <div style="color:#B0E0E6;font-weight:bold;margin-bottom:8px;font-size:16px;">${item.label || item.name}</div>
          <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-top:10px;">
            <span style="color:#fff;">企业总数:</span>
            <span style="color:#fff;"><span style="color:#FF8C00;font-weight:bold;font-size:14px;">${item.enterprise}</span>家</span>
            <span style="color:#fff;">人才总数:</span>
            <span style="color:#fff;"><span style="color:#FF8C00;font-weight:bold;font-size:14px;">${item.talents}</span>人</span>
          </div>
        </div>`
      },
    },
    series: [{
      name: mapType,
      type: 'map',
      map: mapType,
      roam: false,
      center, zoom,
      animation: true,
      animationDuration: 1000,
      itemStyle: {
        areaColor: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3A64AD' }, { offset: 1, color: '#1A3A6A' }] },
        borderColor: '#4A79CE',
        borderWidth: 0.8,
        shadowBlur: 12,
        shadowColor: 'rgba(41, 98, 255, 0.3)',
      },
      emphasis: {
        itemStyle: {
          areaColor: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#5A8FEF' }, { offset: 1, color: '#3A64AD' }] },
          borderColor: '#FFFFFF',
          borderWidth: 2,
          shadowBlur: 20,
          shadowColor: '#2962FF',
        },
        label: { show: true, color: '#FFFFFF', fontSize: fontSize + 2, fontWeight: 'bold' },
      },
      label: { show: true, color: '#FFFFFF', fontSize, textShadow: '0 1px 2px rgba(0,0,0,0.6)' },
    }],
  }
}

export default function ScreenMap() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [currentMap, setCurrentMap] = useState('china')

  useEffect(() => {
    if (!chartRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    echarts.registerMap('china', chinaGeoJson as any)
    const myChart = echarts.init(chartRef.current)
    chartInstance.current = myChart
    myChart.setOption(getMapOption('china', CHINA_CENTER, 1.4, myChart.getWidth()))

    const handleResize = () => {
      let zoom = 1.4
      if (window.innerWidth < 1200) zoom = 1.1
      else if (window.innerWidth < 1400) zoom = 1.2
      else if (window.innerWidth < 1600) zoom = 1.3
      myChart.setOption(getMapOption('china', CHINA_CENTER, zoom, myChart.getWidth()))
      myChart.resize()
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      myChart.dispose()
    }
  }, [])

  useEffect(() => {
    const chart = chartInstance.current
    if (!chart) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (params: any) => {
      if (params.name === '湖北省' && currentMap === 'china') {
        loadYichangMap()
      }
    }
    chart.on('click', handleClick)
    return () => { chart.off('click', handleClick) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMap])

  async function loadYichangMap() {
    try {
      const yichangGeoJson = await import('@/assets/geo/yichang.json')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      echarts.registerMap('yichang', yichangGeoJson as any)
      chartInstance.current?.setOption(getMapOption('yichang', YICHANG_CENTER, 0.9))
      setCurrentMap('yichang')
    } catch (error) {
      console.error('加载宜昌地图失败:', error)
    }
  }

  function backToChina() {
    chartInstance.current?.setOption(getMapOption('china', CHINA_CENTER, 1.4))
    setCurrentMap('china')
  }

  return (
    <div className="echarts-map-container">
      <div className="map-bg-decor">
        <div className="bg-blur top-left" />
        <div className="bg-blur bottom-right" />
      </div>
      <div className="map-controls">
        <button onClick={backToChina}
          className={`map-btn ${currentMap === 'china' ? 'map-btn-active' : 'map-btn-inactive'}`}>
          全国视图
        </button>
        <button onClick={() => currentMap !== 'yichang' && loadYichangMap()}
          disabled={currentMap === 'yichang'}
          className={`map-btn ${currentMap === 'yichang' ? 'map-btn-active-yichang' : 'map-btn-inactive'}`}>
          宜昌聚焦
        </button>
      </div>
      <div ref={chartRef} className="map-chart" />
    </div>
  )
}
