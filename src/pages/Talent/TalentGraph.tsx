import ReactECharts from 'echarts-for-react'
import {
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  AimOutlined,
} from '@ant-design/icons'
import { Tag } from 'antd'
import { talents } from '@/mock/data'
import styles from './Talent.module.scss'

// 力导向图 — 只有人才节点
function getGraphOption() {
  const nodes = [
    { id: 'center', name: '王建国', symbolSize: 50, category: 0, fixed: true, x: 300, y: 200 },
    { id: '1', name: '李明华', symbolSize: 35, category: 1 },
    { id: '2', name: '张晓峰', symbolSize: 35, category: 1 },
    { id: '3', name: '刘芳', symbolSize: 30, category: 2 },
    { id: '4', name: '陈伟', symbolSize: 30, category: 2 },
    { id: '5', name: '赵丽娜', symbolSize: 25, category: 3 },
    { id: '6', name: '周志远', symbolSize: 28, category: 2 },
    { id: '7', name: '吴婷婷', symbolSize: 25, category: 3 },
    { id: '8', name: '孙明辉', symbolSize: 22, category: 3 },
  ]
  const links = [
    { source: 'center', target: '1' }, { source: 'center', target: '2' },
    { source: 'center', target: '3' }, { source: 'center', target: '6' },
    { source: '1', target: '4' }, { source: '1', target: '7' },
    { source: '2', target: '5' }, { source: '3', target: '8' },
    { source: '4', target: '5' },
  ]
  return {
    backgroundColor: 'transparent',
    legend: {
      data: ['搜索人才', '紧密合作', '间接合作', '领域相关'],
      top: 8, left: 8, textStyle: { color: '#B0C4DE', fontSize: 11 },
      itemWidth: 10, itemHeight: 10,
    },
    series: [{
      type: 'graph', layout: 'force',
      force: { repulsion: 200, edgeLength: 120 },
      roam: true,
      label: { show: true, fontSize: 11, color: '#B0C4DE' },
      categories: [
        { name: '搜索人才', itemStyle: { color: '#2468F2' } },
        { name: '紧密合作', itemStyle: { color: '#5A9CF7' } },
        { name: '间接合作', itemStyle: { color: '#7BBFFF' } },
        { name: '领域相关', itemStyle: { color: '#A8D4FF' } },
      ],
      data: nodes, links,
      lineStyle: { color: 'rgba(91,155,247,0.4)', width: 1.5, curveness: 0.1 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
    }],
  }
}

// 研究方向分布 — 每个方向一个颜色
function getFieldBarOption() {
  const categories = ['生物医药', '新材料', '装备制造', '绿色化工', '清洁能源', 'AI/大数据', '生物技术', '其他']
  const values = [35, 28, 22, 18, 15, 12, 10, 6]
  const colors = ['#2468F2', '#F26B4A', '#2BA471', '#F5A623', '#7B61FF', '#00B8D9', '#FF6B9A', '#A0A4AB']

  return {
    grid: { left: 80, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'value' as const },
    yAxis: {
      type: 'category' as const, data: categories,
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
      barWidth: 14,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', fontSize: 12, color: '#4E5969' },
    }],
  }
}

// 趋势折线图
function getTrendOption() {
  return {
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    legend: { data: ['论文发表', '专利申请', '项目合作'], top: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: 'category' as const, data: ['2021', '2022', '2023', '2024', '2025'] },
    yAxis: { type: 'value' as const, splitLine: { lineStyle: { type: 'dashed' as const, color: '#eee' } } },
    series: [
      { name: '论文发表', type: 'line', data: [12, 18, 22, 28, 35], smooth: true, lineStyle: { color: '#2468F2' }, itemStyle: { color: '#2468F2' } },
      { name: '专利申请', type: 'line', data: [8, 10, 14, 18, 22], smooth: true, lineStyle: { color: '#2BA471' }, itemStyle: { color: '#2BA471' } },
      { name: '项目合作', type: 'line', data: [5, 8, 10, 15, 20], smooth: true, lineStyle: { color: '#F5A623' }, itemStyle: { color: '#F5A623' } },
    ],
  }
}

const topDirections = [
  { name: '生物医药研发', color: '#F26B4A' },
  { name: 'AI/算法工程', color: '#F59E5A' },
  { name: '新能源技术', color: '#FFC75A' },
  { name: '智能制造', color: '#A0A4AB' },
  { name: '绿色化工', color: '#A0A4AB' },
]

const topTalents = [
  { name: '王建国', field: '生物医药', level: '顶尖', levelClass: 'levelTop' as const },
  { name: '李明华', field: '新材料', level: '高端', levelClass: 'levelHigh' as const },
  { name: '张晓峰', field: '装备制造', level: '高端', levelClass: 'levelHigh' as const },
  { name: '刘芳', field: '绿色化工', level: '骨干', levelClass: 'levelCore' as const },
]

export default function TalentGraph() {
  const currentTalent = talents[0]

  return (
    <div className={styles.twoColumnLayout}>
      {/* 左列 */}
      <div className={styles.leftColumn}>
        <div className={styles.graphArea}>
          <ReactECharts option={getGraphOption()} style={{ height: '100%', minHeight: 420 }} />
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <BarChartOutlined className={styles.icon} />
            研究方向分布
          </div>
          <ReactECharts option={getFieldBarOption()} style={{ height: 240 }} />
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <LineChartOutlined className={styles.icon} />
            研究方向趋势
          </div>
          <ReactECharts option={getTrendOption()} style={{ height: 200 }} />
        </div>
      </div>

      {/* 右列 */}
      <div className={styles.rightColumn}>
        {/* 当前人才 */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <UserOutlined className={styles.icon} />
            当前人才
          </div>
          <div className={styles.currentTalent}>
            <div className={styles.talentAvatar}><UserOutlined /></div>
            <div className={styles.talentInfo}>
              <h4>{currentTalent.name}</h4>
              <p>{currentTalent.institution}</p>
              <div className={styles.talentTags}>
                <Tag color="blue">{currentTalent.field}</Tag>
                <span style={{ color: '#F26B4A', fontSize: 12 }}>H指数: {currentTalent.hIndex}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 合作人才 */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <TeamOutlined className={styles.icon} />
            合作人才
          </div>
          <div className={styles.cooperateList}>
            {talents.slice(1, 6).map((t) => (
              <div key={t.id} className={styles.cooperateItem}>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.institution}>{t.institution}</div>
                </div>
                <span className={styles.field}>{t.field}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 紧缺方向Top */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <AimOutlined className={styles.icon} />
            紧缺方向Top
          </div>
          <div className={styles.rankList}>
            {topDirections.map((d, i) => (
              <div key={d.name} className={styles.rankItem}>
                <span
                  className={`${styles.rankNum} ${i === 0 ? styles.top1 : i === 1 ? styles.top2 : i === 2 ? styles.top3 : ''}`}
                >{i + 1}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span className={styles.rankName}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 高端人才榜 */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <TrophyOutlined className={styles.icon} />
            高端人才榜
          </div>
          <div className={styles.rankList}>
            {topTalents.map((t, i) => (
              <div key={i} className={styles.rankItem}>
                <span className={`${styles.rankNum} ${i === 0 ? styles.top1 : i === 1 ? styles.top2 : i === 2 ? styles.top3 : ''}`}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#1D2129' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#86909C' }}>{t.field}</div>
                </div>
                <span className={`${styles.rankTag} ${styles[t.levelClass]}`}>{t.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
