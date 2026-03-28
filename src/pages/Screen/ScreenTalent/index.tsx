import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'
import ScreenTabs from '../components/ScreenTabs'
import { getCkeyMap, type ProvinceData } from '@/services/screen'
import { searchExperts } from '@/services/talent'
import talentGapData from '@/data/talent-gap.json'

const chainLabels = ['湿电子化学品', '新能源新材料', '先进制剂与高端仿制药', '酵母发酵与功能成分制造', '内河绿色智能船舶制造', '人工智能']
const chainColors = ['#06B6D4', '#FF8A00', '#EF4444', '#A855F7', '#10B981', '#3B82F6']

// 宜昌产业链人才搜索用宽关键词
const chainWiderKeys = [
  '化工 OR 化学',
  '新能源 OR 新材料 OR 电池',
  '生物医药 OR 制药 OR 仿制药',
  '发酵 OR 酵母 OR 生物工程',
  '船舶 OR 航运 OR 造船',
  '人工智能 OR 大数据 OR 算法',
]

// ========== 全国人才分布柱状图 ==========
function getNationwideOption(data: ProvinceData[]) {
  const top = data.slice(0, 11)
  return {
    grid: { left: '5%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category' as const, data: top.map(d => d.name),
      axisLabel: { fontSize: 10, color: '#FFFFFF', fontWeight: 400, interval: 0 },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const, name: '(总数)',
      nameTextStyle: { color: '#B0C4DE', fontSize: 10 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' as const } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar', data: top.map(d => d.value), barWidth: 16,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#6AB7FF' }, { offset: 1, color: '#1E3A8A' }] },
      },
      label: { show: true, position: 'top', color: '#FFD900', fontSize: 10, fontWeight: 600 },
    }],
  }
}

// ========== 人才分类玫瑰图 ==========
function getClassificationOption(total: number) {
  // 6:3:1 比例
  const innovative = Math.round(total * 6 / 10)
  const skilled = Math.round(total * 3 / 10)
  const leading = Math.round(total * 1 / 10)
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
    legend: { show: false },
    series: [{
      type: 'pie', radius: ['15%', '80%'], roseType: 'area' as const, padAngle: 5,
      center: ['50%', '50%'],
      label: { color: '#B0C4DE', fontSize: 11, formatter: '{b}\n{c}人' },
      data: [
        { name: '领军人才', value: leading, itemStyle: { color: '#3B82F6' } },
        { name: '技能人才', value: skilled, itemStyle: { color: '#FF8A00' } },
        { name: '创新人才', value: innovative, itemStyle: { color: '#10B981' } },
      ],
    }],
  }
}

// ========== 人才总数+等级横向柱状图 ==========
function getTotalOption(total: number) {
  // 合理比例：活跃 28%, 重点 6%, 院士/顶尖 0.1%
  const active = Math.round(total * 0.28)
  const key = Math.round(total * 0.06)
  const top = Math.round(total * 0.001)
  return {
    grid: { left: '5%', right: '5%', bottom: '5%', top: '5%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' as const, show: false },
    yAxis: {
      type: 'category' as const,
      data: ['院士/顶尖', '重点人才', '活跃人才'],
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#B0C4DE', fontWeight: 500 },
    },
    series: [{
      type: 'bar', data: [top, key, active],
      barWidth: 16,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#1890FF' }, { offset: 1, color: '#6AB7FF' }] },
      },
      label: { show: true, position: 'right', color: '#FFD900', fontSize: 12, fontWeight: 600 },
    }],
  }
}

// ========== 产业链人才分布环形图（专业样式） ==========
function getValueChainOption(chainData: { name: string; value: number; color: string }[]) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)',
      backgroundColor: 'rgba(0,20,40,0.9)',
      borderColor: 'rgba(0,198,255,0.3)',
      textStyle: { color: '#fff' },
    },
    legend: { show: false },
    series: [
      // 外圈 — 主数据
      {
        type: 'pie', radius: ['45%', '72%'], padAngle: 3,
        center: ['50%', '50%'],
        label: {
          color: '#B0C4DE', fontSize: 10,
          formatter: (p: { name: string; value: number; percent: number }) =>
            `{name|${p.name}}\n{value|${p.value.toLocaleString()}人}`,
          rich: {
            name: { fontSize: 10, color: '#B0C4DE', lineHeight: 16 },
            value: { fontSize: 12, color: '#FFD900', fontWeight: 600, lineHeight: 18 },
          },
        },
        labelLine: { length: 12, length2: 16, lineStyle: { color: 'rgba(176,196,222,0.4)' } },
        itemStyle: { borderColor: 'rgba(0,20,40,0.8)', borderWidth: 2 },
        emphasis: {
          scaleSize: 8,
          itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,198,255,0.5)' },
        },
        data: chainData.map(d => ({
          name: d.name, value: d.value,
          itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: d.color }, { offset: 1, color: d.color + '99' }] } },
        })),
      },
      // 内圈 — 装饰环
      {
        type: 'pie', radius: ['38%', '42%'], padAngle: 0,
        center: ['50%', '50%'],
        silent: true, label: { show: false },
        data: chainData.map(d => ({
          value: d.value,
          itemStyle: { color: d.color + '33' },
        })),
      },
    ],
  }
}

// ========== 人才缺口柱+线图（使用本地岗位数据） ==========
function getGapCountOption(values: number[]) {
  return {
    grid: { left: '5%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category' as const,
      data: chainLabels.map(l => l.length > 5 ? l.slice(0, 5) + '...' : l),
      axisLabel: { fontSize: 9, color: '#FFFFFF', rotate: 0, interval: 0 },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const, name: '岗位需求(人)',
      nameTextStyle: { color: '#B0C4DE', fontSize: 10 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' as const } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar', data: values, barWidth: 20,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params: { dataIndex: number }) => chainColors[params.dataIndex] || '#3B82F6',
        },
        label: { show: true, position: 'top', color: '#FFD900', fontSize: 10, fontWeight: 600 },
      },
      {
        type: 'line', data: values, smooth: true,
        symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#FFD900', width: 2, shadowColor: 'rgba(255,217,0,0.4)', shadowBlur: 8 },
        itemStyle: { color: '#FFD900', borderColor: '#fff', borderWidth: 2 },
      },
    ],
  }
}

export default function ScreenTalent() {
  const [nationwideData, setNationwideData] = useState<ProvinceData[]>([])
  const [nationwideTotal, setNationwideTotal] = useState(0)
  const [yichangData, setYichangData] = useState<ProvinceData[]>([])
  const [chainTalentData, setChainTalentData] = useState(
    chainLabels.map((name, i) => ({ name, value: 0, color: chainColors[i] }))
  )
  const [chainLoading, setChainLoading] = useState(true)

  // 人才缺口用本地岗位数据
  const gapValues = chainLabels.map(label => (talentGapData as Record<string, number>)[label] || 0)

  useEffect(() => {
    getCkeyMap('人才').then(data => {
      setNationwideData(data.sort((a, b) => b.value - a.value))
      setNationwideTotal(data.reduce((s, d) => s + d.value, 0))
    }).catch(() => {})

    getCkeyMap('宜昌').then(data => {
      setYichangData(data.sort((a, b) => b.value - a.value))
    }).catch(() => {})

    // 各产业链宜昌人才数（串行请求避免429限流）
    const fetchChainTalents = async () => {
      const totals: number[] = []
      for (const key of chainWiderKeys) {
        try {
          const res = await searchExperts(key, 0, 1, '宜昌')
          totals.push((res?.data as Record<string, unknown>)?.total as number || 0)
        } catch {
          totals.push(0)
        }
        // 间隔1.5秒避免限流
        await new Promise(r => setTimeout(r, 1500))
      }
      setChainTalentData(chainLabels.map((name, i) => ({
        name, value: totals[i], color: chainColors[i],
      })))
      setChainLoading(false)
    }
    // 延迟3秒再开始，等前面3个请求完成
    setTimeout(fetchChainTalents, 3000)
  }, [])

  return (
    <div className="main-content talent-container">
      {/* 左侧栏 */}
      <div className="left-column">
        {/* 全国人才分布 */}
        <div className="left-top">
          <div className="left-top-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getNationwideOption(nationwideData)} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 人才分类 */}
        <div className="left-middle">
          <div className="left-middle-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getClassificationOption(nationwideTotal)} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 人才总数 */}
        <div className="left-bottom">
          <div className="left-bottom-title" />
          <div style={{ padding: '0 12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {nationwideTotal > 0 ? nationwideTotal.toLocaleString() : '...'}
              </span>
              <span style={{ fontSize: 12, color: '#B0C4DE' }}>人才总数</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getTotalOption(nationwideTotal)} style={{ height: '100%' }} notMerge />
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <ScreenTabs />
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap ckey="人才" />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        {/* 宜昌籍人才分布 */}
        <div className="right-top">
          <div className="right-top-title" />
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getNationwideOption(yichangData)} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 宜昌人才所属产业链分布 */}
        <div className="right-middle">
          <div className="right-middle-title" />
          <div style={{ padding: '2px 12px 0', fontSize: 10, color: '#5a7a9a', letterSpacing: 1 }}>— 宜昌市 —</div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            {chainLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00c6ff', fontSize: 12 }}>
                <div style={{ fontSize: 20, marginBottom: 8, animation: 'spin 1.5s linear infinite' }}>⟳</div>
                加载宜昌产业链数据...
              </div>
            ) : (
              <ReactECharts option={getValueChainOption(chainTalentData)} style={{ height: '100%' }} notMerge />
            )}
          </div>
        </div>

        {/* 宜昌人才缺口 */}
        <div className="right-bottom">
          <div className="right-bottom-title" />
          <div style={{ padding: '2px 12px 0', fontSize: 10, color: '#5a7a9a', letterSpacing: 1 }}>— 宜昌市近12个月 —</div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getGapCountOption(gapValues)} style={{ height: '100%' }} notMerge />
          </div>
        </div>
      </div>
    </div>
  )
}
