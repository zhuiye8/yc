import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import chinaGeoJson from '@/assets/geo/china.json'
import tooltipBg from '@/assets/images/screen/tooltip.png'
import { getCkeyMap, type ProvinceData } from '@/services/screen'
import './ScreenMap.css'

const CHINA_CENTER: [number, number] = [104.0, 32.5]
const YICHANG_CENTER: [number, number] = [111.1, 30.56]

// 省份名映射（接口返回"北京"，地图需要"北京市"）
const provinceNameMap: Record<string, string> = {
  '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
  '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省',
  '黑龙江': '黑龙江省', '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省',
  '福建': '福建省', '江西': '江西省', '山东': '山东省', '河南': '河南省',
  '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省', '海南': '海南省',
  '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '陕西': '陕西省',
  '甘肃': '甘肃省', '青海': '青海省', '台湾': '台湾省',
  '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '西藏': '西藏自治区',
  '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区',
  '香港': '香港特别行政区', '澳门': '澳门特别行政区',
}

interface ScreenMapProps {
  /** 产业链关键词，用于获取各省分布数据 */
  ckey?: string
  /** 地图视图切换回调 */
  onViewChange?: (view: 'china' | 'yichang') => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMapOption(mapType: string, center: [number, number], zoom: number, provinceData: ProvinceData[], chartWidth?: number): any {
  const fontSize = (chartWidth || 800) < 900 ? 9 : 10

  // 构建省份→数值映射（用于着色和tooltip）
  const dataMap = new Map<string, number>()
  provinceData.forEach(d => {
    // 尝试匹配完整省名
    const fullName = provinceNameMap[d.name] || d.name
    dataMap.set(fullName, d.value)
    dataMap.set(d.name, d.value) // 短名也存
  })

  // 转为 ECharts series data（带 value 着色）
  const seriesData = provinceData.map(d => ({
    name: provinceNameMap[d.name] || d.name,
    value: d.value,
  }))

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
        const val = dataMap.get(params.name) ?? dataMap.get(params.name?.replace(/(省|市|自治区|壮族自治区|维吾尔自治区|回族自治区|特别行政区)$/, ''))
        if (val === undefined) return ''
        const displayName = params.name
        return `<div style="padding:20px;min-width:160px;min-height:100px;background:url(${tooltipBg}) no-repeat center/100% 100%;">
          <div style="color:#B0E0E6;font-weight:bold;margin-bottom:8px;font-size:16px;">${displayName}</div>
          <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;margin-top:10px;">
            <span style="color:#fff;">相关人才:</span>
            <span style="color:#fff;"><span style="color:#FF8C00;font-weight:bold;font-size:14px;">${val.toLocaleString()}</span>人</span>
          </div>
        </div>`
      },
    },
    visualMap: mapType === 'china' && seriesData.length > 0 ? {
      min: 0,
      max: Math.max(...seriesData.map(d => d.value), 1),
      show: false,
      inRange: { color: ['#1A3A6A', '#2A5CAD', '#3A7CF0', '#5A9CF7', '#7BBFFF'] },
    } : undefined,
    series: [{
      name: mapType,
      type: 'map',
      map: mapType,
      roam: false,
      center, zoom,
      animation: true,
      animationDuration: 1000,
      data: seriesData,
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

export default function ScreenMap({ ckey = '人工智能', onViewChange }: ScreenMapProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [currentMap, setCurrentMap] = useState('china')
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([])

  // 加载各省分布数据
  useEffect(() => {
    let cancelled = false
    getCkeyMap(ckey).then(data => {
      if (!cancelled) setProvinceData(data)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [ckey])

  // 初始化地图
  useEffect(() => {
    if (!chartRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    echarts.registerMap('china', chinaGeoJson as any)
    const myChart = echarts.init(chartRef.current)
    chartInstance.current = myChart

    const handleResize = () => {
      let zoom = 1.4
      if (window.innerWidth < 1200) zoom = 1.1
      else if (window.innerWidth < 1400) zoom = 1.2
      else if (window.innerWidth < 1600) zoom = 1.3
      myChart.setOption(getMapOption('china', CHINA_CENTER, zoom, provinceData, myChart.getWidth()), true)
      myChart.resize()
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      myChart.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 数据更新时刷新地图
  useEffect(() => {
    const chart = chartInstance.current
    if (!chart || currentMap !== 'china') return
    let zoom = 1.4
    if (window.innerWidth < 1200) zoom = 1.1
    else if (window.innerWidth < 1400) zoom = 1.2
    else if (window.innerWidth < 1600) zoom = 1.3
    chart.setOption(getMapOption('china', CHINA_CENTER, zoom, provinceData, chart.getWidth()), true)
  }, [provinceData, currentMap])

  const loadYichangMap = useCallback(async () => {
    try {
      const yichangGeoJson = await import('@/assets/geo/yichang.json')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      echarts.registerMap('yichang', yichangGeoJson as any)
      chartInstance.current?.setOption(getMapOption('yichang', YICHANG_CENTER, 0.9, []))
      setCurrentMap('yichang')
      onViewChange?.('yichang')
    } catch (error) {
      console.error('加载宜昌地图失败:', error)
    }
  }, [onViewChange])

  const backToChina = useCallback(() => {
    let zoom = 1.4
    if (window.innerWidth < 1600) zoom = 1.3
    chartInstance.current?.setOption(getMapOption('china', CHINA_CENTER, zoom, provinceData), true)
    setCurrentMap('china')
    onViewChange?.('china')
  }, [provinceData, onViewChange])

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
  }, [currentMap, loadYichangMap])

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
          className={`map-btn ${currentMap === 'yichang' ? 'map-btn-active-yichang' : 'map-btn-inactive'}`}>
          宜昌聚焦
        </button>
      </div>
      <div ref={chartRef} className="map-chart" />
    </div>
  )
}
