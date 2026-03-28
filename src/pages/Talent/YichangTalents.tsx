import { useState, useEffect, useMemo } from 'react'
import { Table, Input, Tag, Row, Col } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ColumnsType } from 'antd/es/table'
import styles from './Talent.module.scss'

interface YichangTalent {
  id: string
  name: string
  gender: string
  education: string
  school?: string
  major?: string
  skillName?: string
  certificate?: string
  workingYears?: string
  organization: string
  position: string
  nativePlace: string
  level: string
  industry: string
}

// Lazy load the JSON data
let cachedData: YichangTalent[] | null = null
function loadYichangData(): Promise<YichangTalent[]> {
  if (cachedData) return Promise.resolve(cachedData)
  return import('@/mock/yichang-talents.json').then((mod) => {
    cachedData = mod.default as YichangTalent[]
    return cachedData
  })
}

const barColors = [
  '#2468F2', '#F26B4A', '#2BA471', '#F5A623', '#7B61FF',
  '#00B8D9', '#FF6B9A', '#E8544E', '#36CFC9', '#9254DE',
  '#597EF7', '#73D13D', '#FFC53D', '#A0A4AB',
]

function getIndustryBarOption(industryData: { name: string; value: number }[]) {
  const sorted = [...industryData].sort((a, b) => a.value - b.value)
  return {
    grid: { left: 110, right: 50, top: 10, bottom: 30 },
    xAxis: { type: 'value' as const, axisLabel: { fontSize: 12 } },
    yAxis: {
      type: 'category' as const,
      data: sorted.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#4E5969' },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d, i) => ({
          value: d.value,
          itemStyle: { color: barColors[i % barColors.length] },
        })),
        barWidth: 16,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right' as const, fontSize: 12, color: '#4E5969' },
      },
    ],
  }
}

const columns: ColumnsType<YichangTalent> = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 90,
    render: (text: string) => <span style={{ fontWeight: 500, color: '#1D2129' }}>{text}</span>,
  },
  {
    title: '性别',
    dataIndex: 'gender',
    width: 60,
    filters: [
      { text: '男', value: '男' },
      { text: '女', value: '女' },
    ],
    onFilter: (value, record) => record.gender === value,
  },
  {
    title: '学历',
    dataIndex: 'education',
    width: 90,
    filters: [
      { text: '博士', value: '博士' },
      { text: '硕士', value: '硕士' },
      { text: '本科', value: '本科' },
      { text: '大专', value: '大专' },
      { text: '高中/中专', value: '高中/中专' },
    ],
    onFilter: (value, record) => record.education === value,
  },
  {
    title: '专业/技能',
    width: 140,
    ellipsis: true,
    render: (_: unknown, record: YichangTalent) => record.major || record.skillName || '-',
  },
  {
    title: '所在单位',
    dataIndex: 'organization',
    width: 200,
    ellipsis: true,
  },
  {
    title: '职位',
    dataIndex: 'position',
    width: 120,
    ellipsis: true,
  },
  {
    title: '行业',
    dataIndex: 'industry',
    width: 130,
    ellipsis: true,
    filters: [
      { text: '文化旅游', value: '文化旅游' },
      { text: '算力及大数据', value: '算力及大数据' },
      { text: '建筑产业链', value: '建筑产业链' },
      { text: '汽车及装备制造', value: '汽车及装备制造' },
      { text: '新能源新材料', value: '新能源新材料' },
      { text: '生命健康', value: '生命健康' },
      { text: '绿色化工', value: '绿色化工' },
      { text: '其他', value: '其他' },
    ],
    onFilter: (value, record) => record.industry === value,
  },
  {
    title: '人才等级',
    dataIndex: 'level',
    width: 90,
    render: (text: string) => {
      const colorMap: Record<string, string> = {
        '创新人才': 'blue',
        '技能人才': 'green',
      }
      return <Tag color={colorMap[text] || 'default'}>{text}</Tag>
    },
    filters: [
      { text: '创新人才', value: '创新人才' },
      { text: '技能人才', value: '技能人才' },
    ],
    onFilter: (value, record) => record.level === value,
  },
]

export default function YichangTalents() {
  const [data, setData] = useState<YichangTalent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    loadYichangData().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data
    const keyword = searchText.trim().toLowerCase()
    return data.filter(
      (t) =>
        t.name.toLowerCase().includes(keyword) ||
        (t.organization && t.organization.toLowerCase().includes(keyword)) ||
        (t.major && t.major.toLowerCase().includes(keyword)) ||
        (t.skillName && t.skillName.toLowerCase().includes(keyword)) ||
        (t.industry && t.industry.toLowerCase().includes(keyword))
    )
  }, [data, searchText])

  const stats = useMemo(() => {
    const total = data.length
    const innovativeCount = data.filter((t) => t.level === '创新人才').length
    const skillCount = data.filter((t) => t.level === '技能人才').length
    const industryMap: Record<string, number> = {}
    data.forEach((t) => {
      if (t.industry) {
        industryMap[t.industry] = (industryMap[t.industry] || 0) + 1
      }
    })
    const industryData = Object.entries(industryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    return { total, innovativeCount, skillCount, industryData }
  }, [data])

  const statCards = [
    {
      icon: <TeamOutlined />,
      label: '人才总数',
      value: stats.total.toLocaleString(),
      color: '#2468F2',
      bg: '#F0F5FF',
    },
    {
      icon: <UserOutlined />,
      label: '创新人才',
      value: stats.innovativeCount.toLocaleString(),
      suffix: `占比 ${stats.total ? ((stats.innovativeCount / stats.total) * 100).toFixed(1) : 0}%`,
      color: '#2468F2',
      bg: '#E8F1FF',
    },
    {
      icon: <RiseOutlined />,
      label: '技能人才',
      value: stats.skillCount.toLocaleString(),
      suffix: `占比 ${stats.total ? ((stats.skillCount / stats.total) * 100).toFixed(1) : 0}%`,
      color: '#2BA471',
      bg: '#F0FFF4',
    },
  ]

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {statCards.map((card) => (
          <Col key={card.label} span={8}>
            <div className={styles.panelCard} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#86909C', marginBottom: 2 }}>{card.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1D2129', lineHeight: 1.2 }}>
                  {card.value}
                </div>
                {card.suffix && (
                  <div style={{ fontSize: 12, color: '#86909C', marginTop: 2 }}>{card.suffix}</div>
                )}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 行业分布柱状图 */}
      <div className={styles.panelCard} style={{ marginBottom: 20 }}>
        <div className={styles.panelTitle}>
          <BarChartOutlined className={styles.icon} />
          行业分布
        </div>
        {stats.industryData.length > 0 ? (
          <ReactECharts
            option={getIndustryBarOption(stats.industryData)}
            style={{ height: 320 }}
          />
        ) : (
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            加载中...
          </div>
        )}
      </div>

      {/* 人才列表 */}
      <div className={styles.panelCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
            <TeamOutlined className={styles.icon} />
            宜昌人才列表
          </div>
          <Input.Search
            placeholder="搜索姓名、单位、专业、行业..."
            allowClear
            style={{ width: 300 }}
            onSearch={(v) => setSearchText(v)}
            onChange={(e) => {
              if (!e.target.value) setSearchText('')
            }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            pageSize: 15,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
            showQuickJumper: true,
          }}
          scroll={{ x: 920 }}
        />
      </div>
    </div>
  )
}
