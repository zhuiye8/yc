import { useEffect, useState } from 'react'
import * as echarts from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { GeoComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import ReactECharts from 'echarts-for-react'

echarts.use([MapChart, GeoComponent, TooltipComponent, CanvasRenderer])
import styles from './IndustryInnovationResources.module.scss'

interface MapValueItem {
  name: string
  value: number
}

interface Props {
  loading: boolean
  selectedRegion: string
  mapValues: MapValueItem[]
  onRegionSelect: (regionName: string) => void
}

const MAP_NAME = 'chinaInnovation'

let registerPromise: Promise<boolean> | null = null

function ensureMapRegistered(): Promise<boolean> {
  if (echarts.getMap(MAP_NAME)) {
    return Promise.resolve(true)
  }

  if (registerPromise) return registerPromise

  registerPromise = fetch('/china-map.json')
    .then((res) => res.json())
    .then((json) => {
      echarts.registerMap(MAP_NAME, json)
      return true
    })
    .catch(() => false)
    .finally(() => {
      registerPromise = null
    })

  return registerPromise
}

export default function IndustryInnovationMap({
  loading,
  selectedRegion,
  mapValues,
  onRegionSelect,
}: Props) {
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void ensureMapRegistered().then((ok) => {
      if (cancelled) return
      setMapReady(ok)
      setMapError(!ok)
    })
    return () => { cancelled = true }
  }, [])

  if (loading || !mapReady) {
    if (mapError) {
      return <div className={styles.mapLoading}>创新资源地图加载失败，请刷新后重试。</div>
    }
    return <div className={styles.mapLoading}>正在加载创新资源地图...</div>
  }

  const regions = selectedRegion
    ? [{
        name: selectedRegion,
        itemStyle: { areaColor: '#2f72f5', borderColor: '#1d58ea', borderWidth: 2 },
        label: { show: true, color: '#fff', fontSize: 11, fontWeight: 600 as const },
      }]
    : []

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(47,114,245,0.38)',
      borderWidth: 1,
      textStyle: { color: '#1d2129', fontSize: 13 },
      padding: [10, 12],
      borderRadius: 10,
      extraCssText: 'box-shadow:0 12px 24px rgba(36,104,242,0.14);backdrop-filter:blur(8px)',
      formatter: (p: unknown) => {
        const params = p as { name?: string; value?: number }
        return `<div style="font-size:14px;font-weight:600;color:#1d2129">${params.name || ''}</div>
          <div style="margin-top:6px;font-size:12px;color:#86909c">创新资源指数:
          <span style="margin-left:8px;font-size:22px;font-weight:700;color:#2468f2">${(params.value || 0).toLocaleString()}</span></div>`
      },
    },
    geo: {
      map: MAP_NAME,
      roam: false,
      boundingCoords: [[76, 53], [134, 18.5]],
      aspectScale: 0.82,
      layoutCenter: ['50%', '50%'],
      layoutSize: '100%',
      selectedMode: false,
      itemStyle: {
        areaColor: '#f8fbff',
        borderColor: '#d7e5f7',
        borderWidth: 1.15,
        shadowColor: 'rgba(118,169,241,0.12)',
        shadowOffsetY: 10,
        shadowBlur: 18,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#edf5ff',
          borderColor: '#9fbfff',
          shadowColor: 'rgba(47,114,245,0.22)',
          shadowOffsetY: 10,
          shadowBlur: 18,
        },
        label: { show: true, color: '#333', fontSize: 11 },
      },
      label: {
        show: true,
        color: '#7d8ca4',
        fontSize: 9,
      },
      regions,
    },
    series: [{
      type: 'map',
      geoIndex: 0,
      selectedMode: false,
      data: mapValues,
    }],
  }

  const handleClick = (params: { name?: string }) => {
    if (params.name) onRegionSelect(params.name)
  }

  return (
    <div className={styles.mapChart}>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        onEvents={{ click: handleClick }}
        notMerge
      />
    </div>
  )
}
