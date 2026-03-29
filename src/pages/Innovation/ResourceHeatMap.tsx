/**
 * 创新资源热力图组件
 * 支持全国→省→市→区三级下钻
 * GeoJSON: 阿里云 DataV GeoAtlas API
 * 数据: talent-resourceStatistics 真实接口
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { api } from '@/services/api'
import RegionPicker from './RegionPicker'

// DataV GeoJSON base URL
const GEO_BASE = 'https://geo.datav.aliyun.com/areas_v3/bound'

function formatNum(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return Math.round(n / 10000) + '万'
  return n.toLocaleString()
}

interface ResourceStats { [key: string]: number | string }

interface MapLevel {
  adcode: string
  name: string
}

// 指标卡片样式
const cardStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 20,
  border: '1px solid #d6e4ff',
  background: '#f0f5ff',
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
  whiteSpace: 'nowrap',
}

// adcode 转 queryString 前缀
function adcodeToQueryPrefix(adcode: string): string {
  if (adcode === '100000') return '*'
  // 省级: 42xxxx → 42*
  if (adcode.endsWith('0000')) return `${adcode.slice(0, 2)}*`
  // 市级: 4205xx → 4205*
  if (adcode.endsWith('00')) return `${adcode.slice(0, 4)}*`
  // 区级: 420502 → 420502*
  return `${adcode}*`
}

export default function ResourceHeatMap() {
  // 地图层级路径（面包屑）
  const [path, setPath] = useState<MapLevel[]>([
    { adcode: '100000', name: '全国' },
    { adcode: '420000', name: '湖北省' },
    { adcode: '420500', name: '宜昌市' },
  ])

  const [mapLoading, setMapLoading] = useState(false)
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [mapData, setMapData] = useState<{ name: string; value: number; adcode: string }[]>([])
  const chartRef = useRef<ReactECharts | null>(null)
  const registeredMaps = useRef<Set<string>>(new Set())

  // 当前层级
  const currentLevel = path[path.length - 1]

  // 加载 GeoJSON 并注册到 ECharts
  const loadGeoJSON = useCallback(async (adcode: string) => {
    const mapName = `map_${adcode}`
    if (registeredMaps.current.has(mapName)) return mapName

    setMapLoading(true)
    try {
      const url = `${GEO_BASE}/${adcode}_full.json`
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      echarts.registerMap(mapName, json)
      registeredMaps.current.add(mapName)
      return mapName
    } catch (_e) {
      // 如果 _full 不存在（区级），尝试无 _full
      try {
        const url = `${GEO_BASE}/${adcode}.json`
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const json = await resp.json()
        echarts.registerMap(mapName, json)
        registeredMaps.current.add(mapName)
        return mapName
      } catch (_e2) {
        return null
      }
    } finally {
      setMapLoading(false)
    }
  }, [])

  // 加载统计数据（接口）
  const loadStats = useCallback((adcode: string) => {
    setStatsLoading(true)
    const prefix = adcodeToQueryPrefix(adcode)
    const qs = prefix === '*' ? '*' : `(AREACODE:${prefix})`
    api.get<ResourceStats>(`/api/wf/talent-resourceStatistics?queryString=${encodeURIComponent(qs)}`)
      .then(data => { setStats(data); setStatsLoading(false) })
      .catch(() => { setStats(null); setStatsLoading(false) })
  }, [])

  // 加载子区域地图数据（用于着色）
  const loadChildStats = useCallback(async (adcode: string) => {
    const mapName = `map_${adcode}`
    const registered = echarts.getMap(mapName)
    if (!registered) return

    const features = registered.geoJSON?.features || registered.geoJson?.features || []
    const childData: { name: string; value: number; adcode: string }[] = []

    // 逐个子区域查统计（批量，每批5个）
    const BATCH = 5
    for (let i = 0; i < features.length; i += BATCH) {
      const batch = features.slice(i, i + BATCH)
      const results = await Promise.allSettled(
        batch.map(async (f: { properties: { name: string; adcode: number } }) => {
          const childCode = String(f.properties.adcode)
          const prefix = adcodeToQueryPrefix(childCode)
          const qs = `(AREACODE:${prefix})`
          try {
            const data = await api.get<ResourceStats>(`/api/wf/talent-resourceStatistics?queryString=${encodeURIComponent(qs)}`)
            return {
              name: f.properties.name,
              value: (data?.['创新人才'] as number) || 0,
              adcode: childCode,
            }
          } catch (_e) {
            return { name: f.properties.name, value: 0, adcode: childCode }
          }
        })
      )
      for (const r of results) {
        if (r.status === 'fulfilled') childData.push(r.value)
      }
      // 每批间隔避免限流
      if (i + BATCH < features.length) {
        await new Promise(resolve => setTimeout(resolve, 800))
      }
    }
    setMapData(childData)
  }, [])

  // 导航到某个层级
  const navigateTo = useCallback(async (adcode: string, name: string, depth: number) => {
    // 更新路径
    const newPath = [...path.slice(0, depth), { adcode, name }]
    setPath(newPath)

    // 加载 GeoJSON
    await loadGeoJSON(adcode)

    // 加载当前区域统计
    loadStats(adcode)

    // 加载子区域着色数据
    loadChildStats(adcode)
  }, [path, loadGeoJSON, loadStats, loadChildStats])

  // 初始化：加载默认层级（宜昌市）
  useEffect(() => {
    const init = async () => {
      await loadGeoJSON('420500')
      loadStats('420500')
      loadChildStats('420500')
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // RegionPicker 选择回调
  const handleRegionSelect = useCallback((adcode: string, _name: string, newPath: { adcode: string; name: string }[]) => {
    setPath(newPath)
    loadGeoJSON(adcode).then(() => {
      loadStats(adcode)
      loadChildStats(adcode)
    })
  }, [loadGeoJSON, loadStats, loadChildStats])

  // 面包屑点击
  const handleBreadcrumbClick = useCallback((index: number) => {
    const target = path[index]
    navigateTo(target.adcode, target.name, index)
  }, [path, navigateTo])

  // 地图点击（下钻）
  const handleMapClick = useCallback(async (params: { name?: string; data?: { adcode?: string } }) => {
    if (!params.name) return
    const adcode = params.data?.adcode || mapData.find(d => d.name === params.name)?.adcode
    if (!adcode) return

    // 最多下钻到区级（6位非00结尾），不再深入
    if (!adcode.endsWith('0000') && !adcode.endsWith('00')) return

    const newDepth = path.length
    await navigateTo(adcode, params.name, newDepth)
  }, [path, mapData, navigateTo])

  const getVal = (key: string): number => {
    if (!stats) return 0
    const v = stats[key]
    return typeof v === 'number' ? v : parseInt(String(v)) || 0
  }

  // ECharts 配置
  const getMapOption = () => {
    const mapName = `map_${currentLevel.adcode}`
    const maxVal = mapData.length > 0 ? Math.max(...mapData.map(d => d.value), 1) : 100000

    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: { name: string; value?: number }) => {
          const val = params.value || 0
          return `<div style="font-weight:600;margin-bottom:4px">${params.name}</div>
            创新人才: ${val > 0 ? formatNum(val) : '加载中...'}`
        },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        left: 16,
        bottom: 10,
        text: ['高', '低'],
        inRange: { color: ['#e8f4f8', '#b3d9e8', '#6cb4d9', '#3498c6', '#1a6fa8', '#0d4a7a'] },
        show: true,
        textStyle: { color: '#86909C', fontSize: 10 },
        itemWidth: 10,
        itemHeight: 50,
      },
      geo: {
        map: mapName,
        roam: false,
        zoom: 1.05,
        top: 25,
        bottom: 15,
        left: 30,
        right: 30,
        layoutCenter: ['50%', '52%'],
        layoutSize: '90%',
        itemStyle: {
          areaColor: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#eaf3fb' }, { offset: 1, color: '#d4e6f5' }] },
          borderColor: '#a3c4e0',
          borderWidth: 0.6,
          shadowColor: 'rgba(0, 80, 160, 0.08)',
          shadowBlur: 6,
        },
        emphasis: {
          itemStyle: { areaColor: '#3b8fd4', borderColor: '#1a6fa8', borderWidth: 1.5,
            shadowColor: 'rgba(0, 80, 160, 0.3)', shadowBlur: 10 },
          label: { show: true, color: '#fff', fontSize: 12, fontWeight: 'bold' as const },
        },
        label: { show: true, fontSize: 10, color: '#5a7a94' },
      },
      series: [{ type: 'map', map: mapName, geoIndex: 0, data: mapData }],
    }
  }

  const isMapReady = registeredMaps.current.has(`map_${currentLevel.adcode}`)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
      {/* 标题栏：面包屑 + 地区选择器 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, background: 'linear-gradient(180deg, #e6f0ff 0%, #f8faff 100%)',
        borderRadius: 12, padding: '12px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1D2129' }}>
            {currentLevel.name}科创资源地图
          </span>
          {path.length > 1 && (
            <span style={{ fontSize: 13, color: '#86909C', marginLeft: 8 }}>
              {path.map((p, i) => (
                <span key={p.adcode}>
                  {i > 0 && ' > '}
                  {i < path.length - 1 ? (
                    <a onClick={() => handleBreadcrumbClick(i)} style={{ color: '#2468F2', cursor: 'pointer' }}>{p.name}</a>
                  ) : (
                    <span style={{ color: '#4E5969', fontWeight: 500 }}>{p.name}</span>
                  )}
                </span>
              ))}
            </span>
          )}
        </div>
        <RegionPicker
          value={currentLevel}
          onChange={handleRegionSelect}
        />
      </div>

      {/* 三列布局 */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'stretch',
        background: 'linear-gradient(180deg, #f6f9ff 0%, #fff 100%)',
        borderRadius: 12, padding: '20px 24px', minHeight: 440,
        position: 'relative',
      }}>
        {/* Loading overlay */}
        {statsLoading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, borderRadius: 12,
          }}>
            <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} />
            <span style={{ marginLeft: 8, color: '#666' }}>加载数据...</span>
          </div>
        )}

        {/* 左侧指标 */}
        <div style={{ width: 170, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
          {[
            { key: '创新人才', unit: '位' },
            { key: '创新机构', unit: '家' },
            { key: '双创载体', unit: '个' },
            { key: '产业园区', unit: '个' },
            { key: '科研项目', unit: '项' },
          ].map(m => (
            <div key={m.key} style={cardStyle}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#2468F2' }}>{formatNum(getVal(m.key))}</span>
              <span style={{ fontSize: 12, color: '#86909C' }}>({m.unit})</span>
              <span style={{ fontSize: 13, color: '#4E5969', marginLeft: 2 }}>{m.key}</span>
            </div>
          ))}
        </div>

        {/* 中间地图 */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {mapLoading || !isMapReady ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420 }}>
              <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} />
              <span style={{ marginLeft: 8, color: '#999' }}>加载地图...</span>
            </div>
          ) : (
            <ReactECharts
              ref={chartRef}
              option={getMapOption()}
              style={{ height: 420, width: '100%' }}
              onEvents={{ click: handleMapClick }}
              notMerge
            />
          )}
        </div>

        {/* 右侧指标 */}
        <div style={{ width: 170, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, textAlign: 'right' }}>
          {[
            { key: '科技成果', unit: '项' },
            { key: '专利', unit: '件' },
            { key: '技术标准', unit: '条' },
            { key: '产业政策', unit: '条' },
            { key: '科技文献', unit: '条' },
          ].map(m => (
            <div key={m.key} style={{ ...cardStyle, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 13, color: '#4E5969', marginRight: 2 }}>{m.key}</span>
              <span style={{ fontSize: 12, color: '#86909C' }}>({m.unit})</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#2468F2' }}>{formatNum(getVal(m.key))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
