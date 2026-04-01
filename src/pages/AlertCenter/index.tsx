/**
 * 预警中心 - 预警检索、分类筛选与处置管理
 */
import { useState } from 'react'
import type { TableColumnsType } from 'antd'
import { Button, Input, Select, Table, Tag } from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import heroBg from '@/assets/images/hero/solutions-bg.jpg'
import iconTotal from '@/assets/images/icons/预警总数.png'
import iconUnread from '@/assets/images/icons/未读预警.png'
import iconHigh from '@/assets/images/icons/高危预警.png'
import iconWarning from '@/assets/images/icons/警告预警.png'
import iconRule from '@/assets/images/icons/启用规则.png'
import iconToday from '@/assets/images/icons/今日新增.png'
import iconCenter from '@/assets/images/icons/预警中心.png'
import styles from './AlertCenter.module.scss'

type TabKey = 'all' | 'unread' | 'policy' | 'enterprise' | 'industry' | 'talent' | 'tech'
type AlertCategory = Exclude<TabKey, 'all' | 'unread'>
type AlertLevel = '高危' | '警告' | '提示' | '正常'
type LevelFilter = 'all' | AlertLevel
type CategoryTone = 'policy' | 'enterprise' | 'industry' | 'talent' | 'tech'

interface StatCard {
  icon: string
  label: string
  count: string
  desc: string
  tone: 'blue' | 'orange' | 'teal' | 'red' | 'green' | 'violet'
}

interface TabItem {
  key: TabKey
  label: string
  badge?: number
}

interface AlertItem {
  key: string
  title: string
  level: AlertLevel
  category: AlertCategory
  categoryLabel: string
  type: string
  time: string
  unread: boolean
  highlighted?: boolean
}

const statCards: StatCard[] = [
  {
    icon: iconTotal,
    label: '预警总数',
    count: '共17条',
    desc: '全部预警通知汇总',
    tone: 'blue',
  },
  {
    icon: iconUnread,
    label: '未读预警',
    count: '共4条',
    desc: '待处理的未读通知',
    tone: 'orange',
  },
  {
    icon: iconHigh,
    label: '高危预警',
    count: '共3条',
    desc: '需立即关注的紧急预警',
    tone: 'teal',
  },
  {
    icon: iconWarning,
    label: '警告预警',
    count: '共3条',
    desc: '需关注的风险提示',
    tone: 'red',
  },
  {
    icon: iconRule,
    label: '启用规则',
    count: '共3条',
    desc: '当前激活的预警规则',
    tone: 'green',
  },
  {
    icon: iconToday,
    label: '今日新增',
    count: '共5条',
    desc: '今天产生的新增预警',
    tone: 'violet',
  },
]

const tabs: TabItem[] = [
  { key: 'all', label: '全部', badge: 3 },
  { key: 'unread', label: '未读', badge: 3 },
  { key: 'policy', label: '政策' },
  { key: 'enterprise', label: '企业' },
  { key: 'industry', label: '产业' },
  { key: 'talent', label: '人才' },
  { key: 'tech', label: '技术' },
]

const alertData: AlertItem[] = [
  {
    key: 'alert-1',
    title: '政策申报截止提醒',
    level: '警告',
    category: 'policy',
    categoryLabel: '政策',
    type: '到期提醒',
    time: '2026-01-13 09:00',
    unread: true,
    highlighted: true,
  },
  {
    key: 'alert-2',
    title: '企业风险预警',
    level: '高危',
    category: 'enterprise',
    categoryLabel: '企业',
    type: '风险预警',
    time: '2026-01-12 16:00',
    unread: true,
    highlighted: true,
  },
  {
    key: 'alert-3',
    title: '新政触发布通知',
    level: '提示',
    category: 'policy',
    categoryLabel: '政策',
    type: '新政触达',
    time: '2026-01-12 14:30',
    unread: true,
    highlighted: true,
  },
  {
    key: 'alert-4',
    title: '产业链短板变化',
    level: '警告',
    category: 'industry',
    categoryLabel: '产业',
    type: '短板预警',
    time: '2026-01-11 15:00',
    unread: true,
    highlighted: true,
  },
  {
    key: 'alert-5',
    title: '申报窗口期开启',
    level: '正常',
    category: 'policy',
    categoryLabel: '政策',
    type: '窗口期提醒',
    time: '2026-01-11 10:00',
    unread: false,
  },
  {
    key: 'alert-6',
    title: '人才动态提醒',
    level: '提示',
    category: 'talent',
    categoryLabel: '人才',
    type: '动态提醒',
    time: '2026-01-10 14:00',
    unread: false,
  },
  {
    key: 'alert-7',
    title: '企业迁移提示',
    level: '警告',
    category: 'enterprise',
    categoryLabel: '企业',
    type: '动态提醒',
    time: '2026-01-10 11:30',
    unread: false,
  },
  {
    key: 'alert-8',
    title: '技术缺口扩大',
    level: '警告',
    category: 'tech',
    categoryLabel: '技术',
    type: '缺口预警',
    time: '2026-01-09 10:00',
    unread: false,
  },
  {
    key: 'alert-9',
    title: '产业热点变化',
    level: '提示',
    category: 'industry',
    categoryLabel: '产业',
    type: '热点提醒',
    time: '2026-01-09 09:30',
    unread: false,
  },
  {
    key: 'alert-10',
    title: '申报窗口期开启',
    level: '正常',
    category: 'policy',
    categoryLabel: '政策',
    type: '窗口期提醒',
    time: '2026-01-11 10:00',
    unread: false,
  },
  {
    key: 'alert-11',
    title: '人才动态提醒',
    level: '提示',
    category: 'talent',
    categoryLabel: '人才',
    type: '动态提醒',
    time: '2026-01-10 14:00',
    unread: false,
  },
  {
    key: 'alert-12',
    title: '企业迁移提示',
    level: '警告',
    category: 'enterprise',
    categoryLabel: '企业',
    type: '动态提醒',
    time: '2026-01-10 11:30',
    unread: false,
  },
  {
    key: 'alert-13',
    title: '技术缺口扩大',
    level: '警告',
    category: 'tech',
    categoryLabel: '技术',
    type: '缺口预警',
    time: '2026-01-09 10:00',
    unread: false,
  },
  {
    key: 'alert-14',
    title: '产业热点变化',
    level: '提示',
    category: 'industry',
    categoryLabel: '产业',
    type: '热点提醒',
    time: '2026-01-09 09:30',
    unread: false,
  },
  {
    key: 'alert-15',
    title: '新增高端人才',
    level: '正常',
    category: 'talent',
    categoryLabel: '人才',
    type: '新增提醒',
    time: '2026-01-08 16:30',
    unread: false,
  },
  {
    key: 'alert-16',
    title: '关键技术专利到期',
    level: '警告',
    category: 'tech',
    categoryLabel: '技术',
    type: '到期提醒',
    time: '2026-01-08 14:20',
    unread: false,
  },
]

const categoryClassMap: Record<CategoryTone, string> = {
  policy: 'categoryPolicy',
  enterprise: 'categoryEnterprise',
  industry: 'categoryIndustry',
  talent: 'categoryTalent',
  tech: 'categoryTech',
}

const levelClassMap: Record<AlertLevel, string> = {
  高危: 'levelHigh',
  警告: 'levelWarning',
  提示: 'levelNotice',
  正常: 'levelNormal',
}

export default function AlertCenter() {
  const [activeTab, setActiveTab] = useState<TabKey>('unread')
  const [draftKeyword, setDraftKeyword] = useState('')
  const [keyword, setKeyword] = useState('')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')

  const visibleData = alertData.filter((item) => {
    const matchesTab =
      activeTab === 'all' || activeTab === 'unread' ? true : item.category === activeTab
    const matchesLevel = levelFilter === 'all' || item.level === levelFilter
    const normalizedKeyword = keyword.trim().toLowerCase()
    const matchesKeyword =
      !normalizedKeyword ||
      item.title.toLowerCase().includes(normalizedKeyword) ||
      item.categoryLabel.toLowerCase().includes(normalizedKeyword) ||
      item.type.toLowerCase().includes(normalizedKeyword)

    return matchesTab && matchesLevel && matchesKeyword
  })

  const columns: TableColumnsType<AlertItem> = [
    {
      title: '预警内容',
      dataIndex: 'title',
      key: 'title',
      width: 210,
      render: (value: string, record) => (
        <span className={styles.alertName}>
          {record.highlighted ? <span className={styles.alertDot} /> : null}
          <a className={styles.alertLink}>{value}</a>
        </span>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 72,
      render: (value: AlertLevel) => (
        <Tag className={`${styles.levelTag} ${styles[levelClassMap[value]]}`}>
          {value === '提示' ? <BellOutlined className={styles.levelIcon} /> : null}
          {value === '正常' ? <CheckCircleOutlined className={styles.levelIcon} /> : null}
          {value === '高危' || value === '警告' ? (
            <ExclamationCircleOutlined className={styles.levelIcon} />
          ) : null}
          {value}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryLabel',
      key: 'categoryLabel',
      width: 72,
      render: (value: string, record) => (
        <Tag className={`${styles.categoryTag} ${styles[categoryClassMap[record.category]]}`}>{value}</Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: string) => <Tag className={styles.typeTag}>{value}</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 128,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: () => (
        <div className={styles.actionGroup}>
          <span className={styles.actionLink}>
            <EyeOutlined />
            查看
          </span>
          <span className={styles.actionLink}>
            <CheckCircleOutlined />
            已读
          </span>
          <span className={styles.actionLink}>
            <DeleteOutlined />
            删除
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
              <img src={iconCenter} alt="" className={styles.titleIcon} />
              <h2>预警中心</h2>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <Input
                  value={draftKeyword}
                  variant="borderless"
                  placeholder="搜索预警"
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
                value={levelFilter}
                size="small"
                popupMatchSelectWidth={false}
                className={styles.levelSelect}
                onChange={(value) => setLevelFilter(value)}
                options={[
                  { value: 'all', label: '全部级别' },
                  { value: '高危', label: '高危' },
                  { value: '警告', label: '警告' },
                  { value: '提示', label: '提示' },
                  { value: '正常', label: '正常' },
                ]}
              />

              <Button size="small" className={styles.lightButton} icon={<CheckCircleOutlined />}>
                全部已读
              </Button>

              <Button size="small" className={styles.lightButton} icon={<SettingOutlined />}>
                预警规则
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
                {tab.badge ? <span className={styles.tabBadge}>{tab.badge}</span> : null}
              </button>
            ))}
          </div>

          <div className={styles.tableWrap}>
            <Table<AlertItem>
              rowKey="key"
              columns={columns}
              dataSource={visibleData}
              size="small"
              className={styles.alertTable}
              scroll={{ x: 860 }}
              pagination={{
                position: ['bottomRight'],
                pageSize: 15,
                size: 'small',
                showSizeChanger: false,
              }}
              locale={{ emptyText: '暂无符合条件的预警数据' }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
