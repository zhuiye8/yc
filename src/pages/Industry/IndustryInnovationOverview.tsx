import ReactECharts from 'echarts-for-react'
import {
  ApartmentOutlined,
  AppstoreOutlined,
  FundOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import type {
  InnovationMetricKey,
  InnovationOverviewData,
} from '@/mock/industryInnovationResources'
import styles from './IndustryInnovationResources.module.scss'

interface Props {
  overview: InnovationOverviewData
  onMetricSelect: (metric: InnovationMetricKey) => void
}

function getTalentBarOption(data: InnovationOverviewData['charts']['talent']['items']) {
  return {
    grid: { top: 16, right: 8, bottom: 28, left: 32 },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dfe7f5' } },
      axisLabel: { color: '#86909c', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef2f8' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#86909c', fontSize: 11 },
    },
    tooltip: { trigger: 'axis' },
    series: [
      {
        type: 'bar',
        data: data.map((item) => item.value),
        barWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: '#3f7cff',
        },
      },
    ],
  }
}

function getOrganizationBarOption(data: InnovationOverviewData['charts']['organization']['items']) {
  return {
    grid: { top: 16, right: 8, bottom: 28, left: 32 },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dfe7f5' } },
      axisLabel: { color: '#86909c', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef2f8' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#86909c', fontSize: 11 },
    },
    tooltip: { trigger: 'axis' },
    series: [
      {
        type: 'bar',
        data: data.map((item) => item.value),
        barWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: '#52c41a',
        },
      },
    ],
  }
}

function getHeatmapOption(chart: InnovationOverviewData['charts']['hotspot']) {
  return {
    grid: { top: 24, right: 16, bottom: 20, left: 56 },
    tooltip: {
      position: 'top',
      formatter: (params: { data: [number, number, number] }) => {
        const [xIndex, yIndex, value] = params.data
        return `${chart.yLabels[yIndex]} / ${chart.xLabels[xIndex]}：${value}`
      },
    },
    xAxis: {
      type: 'category',
      data: chart.xLabels,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#e8edf5' } },
      axisLabel: { color: '#86909c', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: chart.yLabels,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#e8edf5' } },
      axisLabel: { color: '#86909c', fontSize: 11 },
      axisTick: { show: false },
    },
    visualMap: {
      min: 0,
      max: Math.max(...chart.values.map((item) => item.value), 1),
      show: false,
      inRange: {
        color: ['#e6f4ff', '#b9d9ff', '#7eb4ff', '#3f7cff'],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: chart.values.map((item) => [item.xIndex, item.yIndex, item.value]),
        label: {
          show: true,
          color: '#1d2129',
          fontSize: 10,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(36, 104, 242, 0.15)',
          },
        },
      },
    ],
  }
}

function getTrendOption(chart: InnovationOverviewData['charts']['trend']) {
  return {
    grid: { top: 16, right: 12, bottom: 24, left: 38 },
    tooltip: { trigger: 'axis' },
    legend: {
      top: 0,
      icon: 'circle',
      textStyle: { color: '#86909c', fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: chart.years,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dfe7f5' } },
      axisLabel: { color: '#86909c', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef2f8' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#86909c', fontSize: 11 },
    },
    series: chart.series.map((series) => ({
      name: series.label,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: series.values,
      lineStyle: { width: 3, color: series.color },
      itemStyle: { color: series.color },
    })),
  }
}

export default function IndustryInnovationOverview({ overview, onMetricSelect }: Props) {
  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.chartCard} onClick={() => onMetricSelect('talent')}>
        <div className={styles.chartHeader}>
          <div>
            <div className={styles.chartTitle}>
              <FundOutlined style={{ marginRight: 8, color: '#3f7cff' }} />
              {overview.charts.talent.title}
            </div>
            <div className={styles.chartSubtitle}>{overview.charts.talent.subtitle}</div>
          </div>
        </div>
        <ReactECharts
          option={getTalentBarOption(overview.charts.talent.items)}
          className={styles.chartCanvas}
          notMerge
        />
      </div>

      <div className={styles.chartCard} onClick={() => onMetricSelect('organization')}>
        <div className={styles.chartHeader}>
          <div>
            <div className={styles.chartTitle}>
              <ApartmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              {overview.charts.organization.title}
            </div>
            <div className={styles.chartSubtitle}>{overview.charts.organization.subtitle}</div>
          </div>
        </div>
        <ReactECharts
          option={getOrganizationBarOption(overview.charts.organization.items)}
          className={styles.chartCanvas}
          notMerge
        />
      </div>

      <div className={styles.chartCard} onClick={() => onMetricSelect('hotspot')}>
        <div className={styles.chartHeader}>
          <div>
            <div className={styles.chartTitle}>
              <AppstoreOutlined style={{ marginRight: 8, color: '#2468f2' }} />
              {overview.charts.hotspot.title}
            </div>
            <div className={styles.chartSubtitle}>{overview.charts.hotspot.subtitle}</div>
          </div>
        </div>
        <ReactECharts
          option={getHeatmapOption(overview.charts.hotspot)}
          className={styles.chartCanvas}
          notMerge
        />
      </div>

      <div className={styles.chartCard} onClick={() => onMetricSelect('trend')}>
        <div className={styles.chartHeader}>
          <div>
            <div className={styles.chartTitle}>
              <LineChartOutlined style={{ marginRight: 8, color: '#2468f2' }} />
              {overview.charts.trend.title}
            </div>
            <div className={styles.chartSubtitle}>{overview.charts.trend.subtitle}</div>
          </div>
        </div>
        <ReactECharts
          option={getTrendOption(overview.charts.trend)}
          className={styles.chartCanvas}
          notMerge
        />
      </div>
    </div>
  )
}
