/**
 * 创新资源热力图组件
 * 参照客户设计稿：标题居中 + 左指标 + 中间地图 + 右指标
 * 数据来源：province-resources.json
 */
import { useState, useEffect, useMemo } from 'react'
import { Select, Spin } from 'antd'
import { LoadingOutlined, DownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import resourceData from '@/data/province-resources.json'

let chinaMapRegistered = false

function formatNum(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return Math.round(n / 10000) + '万'
  return n.toLocaleString()
}

// 省份选项
const provinceOptions = [
  { value: 'china', label: '全国' },
  ...resourceData.provinces.map((p: { name: string }) => ({ value: p.name, label: p.name })),
]

// 指标卡片样式
const metricCardStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 20,
  border: '1px solid #d6e4ff',
  background: '#f0f5ff',
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
  whiteSpace: 'nowrap',
}

export default function ResourceHeatMap() {
  const [mapReady, setMapReady] = useState(chinaMapRegistered)
  const [selectedProvince, setSelectedProvince] = useState('china')

  useEffect(() => {
    if (chinaMapRegistered) return
    fetch('/china-map.json')
      .then(r => r.json())
      .then(json => {
        const filtered = {
          ...json,
          features: json.features.filter((f: { properties: { name: string } }) => {
            const n = f.properties.name
            return !['南海诸岛', '九段线', '十段线'].includes(n)
          }),
        }
        echarts.registerMap('china', filtered)
        chinaMapRegistered = true
        setMapReady(true)
      })
  }, [])

  // 当前统计数据
  const stats = useMemo(() => {
    if (selectedProvince === 'china') {
      return resourceData.national as Record<string, number>
    }
    const prov = (resourceData.provinces as Record<string, unknown>[]).find((p) => (p as { name: string }).name === selectedProvince)
    if (prov) {
      const s: Record<string, number> = {}
      for (const k of Object.keys(resourceData.national)) {
        s[k] = (prov[k] as number) || 0
      }
      return s
    }
    return resourceData.national as Record<string, number>
  }, [selectedProvince])

  // 地图数据
  const mapData = useMemo(() => {
    return (resourceData.provinces as { name: string }[]).map(p => ({
      name: p.name.replace(/省$|市$|自治区$|壮族|回族|维吾尔|特别行政区$/g, '') || p.name,
      value: ((p as Record<string, unknown>)['创新人才'] as number) || 0,
    }))
  }, [])

  const getMapOption = () => ({
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { name: string }) => {
        const prov = (resourceData.provinces as { name: string }[]).find(p =>
          p.name.includes(params.name) || params.name.includes(p.name.replace(/省$|市$/g, ''))
        )
        if (!prov) return `${params.name}<br/>暂无数据`
        const d = prov as Record<string, unknown>
        return `<div style="font-weight:600;margin-bottom:4px">${(prov as { name: string }).name}</div>
          创新人才: ${formatNum(d['创新人才'] as number)}<br/>
          科技企业: ${formatNum(d['科技企业'] as number)}<br/>
          专利: ${formatNum(d['专利'] as number)}`
      },
    },
    visualMap: {
      min: 0,
      max: 4500000,
      left: 16,
      bottom: 10,
      text: ['高', '低'],
      inRange: {
        color: ['#e8f4f8', '#b3d9e8', '#6cb4d9', '#3498c6', '#1a6fa8', '#0d4a7a'],
      },
      show: true,
      textStyle: { color: '#86909C', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 50,
    },
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.2,
      center: [104, 36],
      top: 5,
      bottom: 5,
      left: 50,
      right: 50,
      itemStyle: {
        areaColor: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#eaf3fb' },
            { offset: 1, color: '#d4e6f5' },
          ],
        },
        borderColor: '#a3c4e0',
        borderWidth: 0.6,
        shadowColor: 'rgba(0, 80, 160, 0.08)',
        shadowBlur: 6,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#3b8fd4',
          borderColor: '#1a6fa8',
          borderWidth: 1.5,
          shadowColor: 'rgba(0, 80, 160, 0.3)',
          shadowBlur: 10,
        },
        label: { show: true, color: '#fff', fontSize: 11, fontWeight: 'bold' },
      },
      label: {
        show: true,
        fontSize: 8,
        color: '#5a7a94',
      },
      select: {
        itemStyle: { areaColor: '#2980b9' },
        label: { show: true, color: '#fff' },
      },
    },
    series: [{
      type: 'map',
      map: 'china',
      geoIndex: 0,
      data: mapData,
      // 涟漪效果标记重点城市
    }],
  })

  const handleMapClick = (params: { name?: string }) => {
    if (!params.name) return
    const prov = (resourceData.provinces as { name: string }[]).find(p =>
      p.name.includes(params.name!) || params.name!.includes(p.name.replace(/省$|市$/g, ''))
    )
    if (prov) setSelectedProvince(prov.name)
  }

  const title = selectedProvince === 'china' ? '全国' : selectedProvince
  const displayTitle = `${title}科创资源地图`

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
      {/* 标题 + 省份选择 */}
      <div style={{
        textAlign: 'center', marginBottom: 20,
        background: 'linear-gradient(180deg, #e6f0ff 0%, #f8faff 100%)',
        borderRadius: 12, padding: '16px 0 12px',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1D2129' }}>{displayTitle}</span>
          <Select
            value={selectedProvince}
            onChange={setSelectedProvince}
            options={provinceOptions}
            style={{ width: 120 }}
            size="small"
            suffixIcon={<DownOutlined />}
            variant="borderless"
          />
        </div>
      </div>

      {/* 三列布局 */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'stretch',
        background: 'linear-gradient(180deg, #f6f9ff 0%, #fff 100%)',
        borderRadius: 12, padding: '20px 24px', minHeight: 440,
      }}>
        {/* 左侧指标 */}
        <div style={{ width: 170, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
          {[
            { key: '创新人才', unit: '位' },
            { key: '创新机构', unit: '家' },
            { key: '双创载体', unit: '个' },
            { key: '产业园区', unit: '个' },
            { key: '科研项目', unit: '项' },
          ].map(m => (
            <div key={m.key} style={metricCardStyle}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#2468F2' }}>
                {formatNum(stats[m.key] || 0)}
              </span>
              <span style={{ fontSize: 12, color: '#86909C' }}>
                ({m.unit})
              </span>
              <span style={{ fontSize: 13, color: '#4E5969', marginLeft: 2 }}>
                {m.key}
              </span>
            </div>
          ))}
        </div>

        {/* 中间地图 */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
          {mapReady ? (
            <ReactECharts
              option={getMapOption()}
              style={{ height: 420, width: '100%' }}
              onEvents={{ click: handleMapClick }}
              notMerge
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420 }}>
              <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} />
              <span style={{ marginLeft: 8, color: '#999' }}>加载地图...</span>
            </div>
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
            <div key={m.key} style={{ ...metricCardStyle, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 13, color: '#4E5969', marginRight: 2 }}>
                {m.key}
              </span>
              <span style={{ fontSize: 12, color: '#86909C' }}>
                ({m.unit})
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#2468F2' }}>
                {formatNum(stats[m.key] || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
