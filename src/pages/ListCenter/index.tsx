/**
 * 我的清单 - 招商/引才/融资/申报四类清单管理
 */
import { useState } from 'react'
import type { TableColumnsType } from 'antd'
import { Button, Input, Select, Table, Tag } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import heroBg from '@/assets/images/hero/solutions-bg.jpg'
import iconInvest from '@/assets/images/icons/招商候选.png'
import iconTalent from '@/assets/images/icons/引才对象.png'
import iconFund from '@/assets/images/icons/融资对接.png'
import iconApply from '@/assets/images/icons/申报对象.png'
import iconList from '@/assets/images/icons/我的清单.png'
import styles from './ListCenter.module.scss'

type TabKey = 'invest' | 'talent' | 'fund' | 'apply'
type ListStatus = '跟进中' | '评估中' | '已更新' | '新增'

interface StatCard {
  icon: string
  label: string
  count: string
  desc: string
  tone: 'blue' | 'orange' | 'teal' | 'red'
}

interface TabItem {
  key: TabKey
  label: string
  badge: number
}

interface ListItem {
  key: string
  category: TabKey
  company: string
  industry: string
  region: string
  score: number
  status: ListStatus
  date: string
  nextStep: string
}

const statCards: StatCard[] = [
  {
    icon: iconInvest,
    label: '招商候选',
    count: '共17家',
    desc: '企业筛选、实地考察、项目对接',
    tone: 'blue',
  },
  {
    icon: iconTalent,
    label: '引才对象',
    count: '共4人',
    desc: '人才联络、意向沟通、落地跟踪',
    tone: 'orange',
  },
  {
    icon: iconFund,
    label: '融资对接',
    count: '共3笔',
    desc: '融资产品匹配、机构对接、进度管理',
    tone: 'teal',
  },
  {
    icon: iconApply,
    label: '申报对象',
    count: '共3项',
    desc: '政策匹配、材料准备、申报跟踪',
    tone: 'red',
  },
]

const tabs: TabItem[] = [
  { key: 'invest', label: '招商候选', badge: 3 },
  { key: 'talent', label: '引才对象', badge: 3 },
  { key: 'fund', label: '融资对接', badge: 3 },
  { key: 'apply', label: '申报对象', badge: 3 },
]

const statusColorMap: Record<ListStatus, string> = {
  跟进中: '#4D8EF7',
  评估中: '#F5A623',
  已更新: '#2BA471',
  新增: '#7B61FF',
}

const listData: ListItem[] = [
  {
    key: 'invest-1',
    category: 'invest',
    company: '宜昌人福药业有限公司',
    industry: '生物医药',
    region: '西陵区',
    score: 92,
    status: '跟进中',
    date: '2026-01-10',
    nextStep: '安排实地考察',
  },
  {
    key: 'invest-2',
    category: 'invest',
    company: '三峡新材料股份有限公司',
    industry: '新材料',
    region: '猇亭区',
    score: 88,
    status: '评估中',
    date: '2026-01-08',
    nextStep: '准备尽调材料',
  },
  {
    key: 'invest-3',
    category: 'invest',
    company: '中国船舶集团七一〇研究所',
    industry: '装备制造',
    region: '伍家岗区',
    score: 95,
    status: '已更新',
    date: '2026-01-05',
    nextStep: '商机跟踪',
  },
  {
    key: 'invest-4',
    category: 'invest',
    company: '宜昌三峡制药有限公司',
    industry: '生物医药',
    region: '夷陵区',
    score: 85,
    status: '新增',
    date: '2026-01-12',
    nextStep: '初步沟通',
  },
  {
    key: 'invest-5',
    category: 'invest',
    company: '湖北兴发化工集团股份有限公司',
    industry: '绿色化工',
    region: '猇亭区',
    score: 90,
    status: '跟进中',
    date: '2026-01-03',
    nextStep: '项目对接',
  },
  {
    key: 'talent-1',
    category: 'talent',
    company: '张建国教授团队',
    industry: '生物医药',
    region: '北京',
    score: 94,
    status: '跟进中',
    date: '2026-01-09',
    nextStep: '对接回宜意向',
  },
  {
    key: 'talent-2',
    category: 'talent',
    company: '刘明远研究员',
    industry: '新材料',
    region: '上海',
    score: 89,
    status: '评估中',
    date: '2026-01-07',
    nextStep: '安排视频沟通',
  },
  {
    key: 'talent-3',
    category: 'talent',
    company: '王海峰教授',
    industry: '人工智能',
    region: '武汉',
    score: 91,
    status: '已更新',
    date: '2026-01-04',
    nextStep: '确认合作主题',
  },
  {
    key: 'fund-1',
    category: 'fund',
    company: '三峡科创成果转化贷',
    industry: '融资产品',
    region: '宜昌',
    score: 93,
    status: '跟进中',
    date: '2026-01-06',
    nextStep: '推进授信流程',
  },
  {
    key: 'fund-2',
    category: 'fund',
    company: '兴发产业基金',
    industry: '产业基金',
    region: '宜昌',
    score: 87,
    status: '评估中',
    date: '2026-01-02',
    nextStep: '梳理投资条款',
  },
  {
    key: 'fund-3',
    category: 'fund',
    company: '绿色化工专项融资方案',
    industry: '融资产品',
    region: '武汉',
    score: 90,
    status: '新增',
    date: '2026-01-11',
    nextStep: '机构路演对接',
  },
  {
    key: 'apply-1',
    category: 'apply',
    company: '高新技术企业认定',
    industry: '政策申报',
    region: '西陵区',
    score: 92,
    status: '跟进中',
    date: '2026-01-10',
    nextStep: '完善申报附件',
  },
  {
    key: 'apply-2',
    category: 'apply',
    company: '省级专精特新申报',
    industry: '政策申报',
    region: '夷陵区',
    score: 86,
    status: '评估中',
    date: '2026-01-06',
    nextStep: '校验财务材料',
  },
  {
    key: 'apply-3',
    category: 'apply',
    company: '创新平台建设项目',
    industry: '科技项目',
    region: '猇亭区',
    score: 89,
    status: '已更新',
    date: '2026-01-01',
    nextStep: '等待初审反馈',
  },
]

export default function ListCenter() {
  const [activeTab, setActiveTab] = useState<TabKey>('invest')
  const [draftKeyword, setDraftKeyword] = useState('')
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ListStatus>('all')

  const visibleData = listData.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const normalizedKeyword = keyword.trim().toLowerCase()
    const matchesKeyword =
      !normalizedKeyword ||
      item.company.toLowerCase().includes(normalizedKeyword) ||
      item.industry.toLowerCase().includes(normalizedKeyword) ||
      item.region.toLowerCase().includes(normalizedKeyword)

    return matchesStatus && matchesKeyword
  })

  const columns: TableColumnsType<ListItem> = [
    {
      title: '企业名称',
      dataIndex: 'company',
      key: 'company',
      width: 180,
      render: (value: string) => <a className={styles.companyLink}>{value}</a>,
    },
    {
      title: '所属产业',
      dataIndex: 'industry',
      key: 'industry',
      width: 90,
      render: (value: string) => <Tag className={styles.industryTag}>{value}</Tag>,
    },
    {
      title: '所在区域',
      dataIndex: 'region',
      key: 'region',
      width: 68,
    },
    {
      title: '创新评分',
      dataIndex: 'score',
      key: 'score',
      width: 72,
      render: (value: number) => (
        <span className={`${styles.scoreBadge} ${value >= 90 ? styles.scoreStrong : styles.scoreNormal}`}>
          {value}分
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 74,
      render: (value: ListStatus) => (
        <span className={styles.statusText}>
          <span className={styles.statusDot} style={{ backgroundColor: statusColorMap[value] }} />
          {value}
        </span>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'date',
      key: 'date',
      width: 82,
    },
    {
      title: '下一步',
      dataIndex: 'nextStep',
      key: 'nextStep',
      width: 110,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: () => (
        <div className={styles.actionGroup}>
          <span className={styles.actionLink}>
            <EyeOutlined />
            详情
          </span>
          <span className={styles.actionLink}>
            <EditOutlined />
            跟进
          </span>
          <span className={styles.actionLink}>
            <DeleteOutlined />
            移除
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src={heroBg} alt="" />
      </div>

      <div className={styles.narrowWrap}>
        <section className={styles.statsRow}>
          {statCards.map((card) => (
            <div key={card.label} className={styles.statItem}>
              <div className={styles.statIconWrap}>
                <img src={card.icon} alt="" className={styles.statIcon} />
              </div>
              <div className={styles.statBody}>
                <div className={styles.statTitle}>
                  {card.label}
                  <span className={styles[card.tone]}>{card.count}</span>
                </div>
                <div className={styles.statDesc}>{card.desc}</div>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.board}>
          <div className={styles.boardHeader}>
            <div className={styles.boardTitle}>
              <img src={iconList} alt="" className={styles.titleIcon} />
              <h2>我的清单</h2>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <Input
                  value={draftKeyword}
                  variant="borderless"
                  placeholder="搜索清单"
                  className={styles.searchInput}
                  onChange={(event) => {
                    const value = event.target.value
                    setDraftKeyword(value)
                    if (!value) setKeyword('')
                  }}
                  onPressEnter={() => setKeyword(draftKeyword.trim())}
                />
                <button
                  type="button"
                  className={styles.searchButton}
                  onClick={() => setKeyword(draftKeyword.trim())}
                >
                  <SearchOutlined />
                </button>
              </div>

              <Select
                value={statusFilter}
                size="small"
                popupMatchSelectWidth={false}
                className={styles.statusSelect}
                style={{height:'32px'}}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: '跟进中', label: '跟进中' },
                  { value: '评估中', label: '评估中' },
                  { value: '已更新', label: '已更新' },
                  { value: '新增', label: '新增' },
                ]}
              />

              <Button size="small" className={styles.exportButton} icon={<ExportOutlined />}>
                导出Excel
              </Button>

              <Button size="small" className={styles.reportButton} icon={<PlusOutlined />}>
                生成报告
              </Button>
            </div>
          </div>

          <div className={styles.headerDivider} />

          <div className={styles.tabBar}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tabChip} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span className={styles.tabBadge}>{tab.badge}</span>
              </button>
            ))}
          </div>

          <div className={styles.tableWrap}>
            <Table<ListItem>
              rowKey="key"
              columns={columns}
              dataSource={visibleData}
              pagination={false}
              size="small"
              className={styles.listTable}
              scroll={{ x: 780 }}
              locale={{ emptyText: '暂无符合条件的清单数据' }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
