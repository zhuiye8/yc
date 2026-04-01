/**
 * 报告中心 - 报告检索、筛选与下载管理
 */
import { useState } from 'react'
import type { TableColumnsType } from 'antd'
import { Button, Input, Select, Table, Tag } from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FormOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import heroBg from '@/assets/images/hero/solutions-bg.jpg'
import iconTotal from '@/assets/images/icons/报告总数.png'
import iconIndustry from '@/assets/images/icons/产业报告.png'
import iconEnterprise from '@/assets/images/icons/企业报告.png'
import iconTalent from '@/assets/images/icons/人才报告.png'
import iconTech from '@/assets/images/icons/技术报告.png'
import iconWeekly from '@/assets/images/icons/本周新增.png'
import iconCenter from '@/assets/images/icons/报告中心.png'
import styles from './ReportCenter.module.scss'

type TabKey = 'all' | 'industry' | 'enterprise' | 'talent' | 'tech' | 'fund' | 'policy'
type ReportCategory = Exclude<TabKey, 'all'>
type IndustryKey = 'all' | 'green-chem' | 'bio-medicine' | 'equipment' | 'new-material'
type ReportStatus = '已完成' | '生成中'
type FileKind = 'pdf' | 'form'
type ClassificationTone = 'blue' | 'orange' | 'green' | 'cyan' | 'purple' | 'pink' | 'teal'

interface StatCard {
  icon: string
  label: string
  count: string
  desc: string
  tone: 'blue' | 'orange' | 'green' | 'red' | 'teal' | 'violet'
}

interface TabItem {
  key: TabKey
  label: string
  badge?: number
}

interface ReportItem {
  key: string
  category: ReportCategory
  title: string
  type: string
  classification: string
  classificationTone: ClassificationTone
  status: ReportStatus
  time: string
  size: string
  pages: number
  industryKey: Exclude<IndustryKey, 'all'>
  fileKind: FileKind
}

const statCards: StatCard[] = [
  {
    icon: iconTotal,
    label: '报告总数',
    count: '共17份',
    desc: '全量沉淀的分析报告',
    tone: 'blue',
  },
  {
    icon: iconIndustry,
    label: '产业报告',
    count: '共4份',
    desc: '产业诊断、场景研判分析',
    tone: 'orange',
  },
  {
    icon: iconEnterprise,
    label: '企业报告',
    count: '共3份',
    desc: '企业画像、融资、投融资',
    tone: 'green',
  },
  {
    icon: iconTalent,
    label: '人才报告',
    count: '共3份',
    desc: '引才对象、人才专题分析',
    tone: 'red',
  },
  {
    icon: iconTech,
    label: '技术报告',
    count: '共3份',
    desc: '技术风向、趋势、创新链',
    tone: 'teal',
  },
  {
    icon: iconWeekly,
    label: '本周新增',
    count: '共5份',
    desc: '近7天的新增生成报告',
    tone: 'violet',
  },
]

const tabs: TabItem[] = [
  { key: 'all', label: '全部', badge: 3 },
  { key: 'industry', label: '产业报告', badge: 3 },
  { key: 'enterprise', label: '企业报告', badge: 3 },
  { key: 'talent', label: '人才报告' },
  { key: 'tech', label: '技术报告' },
  { key: 'fund', label: '融资报告' },
  { key: 'policy', label: '政策报告' },
]

const reportData: ReportItem[] = [
  {
    key: 'report-1',
    category: 'industry',
    title: '宜昌绿色化工产业全景分析报告',
    type: '产业研究',
    classification: '全链',
    classificationTone: 'blue',
    status: '已完成',
    time: '2026-01-13 10:00',
    size: '2.8MB',
    pages: 45,
    industryKey: 'green-chem',
    fileKind: 'pdf',
  },
  {
    key: 'report-2',
    category: 'industry',
    title: '生物医药产业全景诊断报告',
    type: '产业研究',
    classification: '产业',
    classificationTone: 'cyan',
    status: '已完成',
    time: '2026-01-12 14:30',
    size: '1.6MB',
    pages: 22,
    industryKey: 'bio-medicine',
    fileKind: 'pdf',
  },
  {
    key: 'report-3',
    category: 'enterprise',
    title: '某生物医药企业竞争力分析报告',
    type: '企业诊断',
    classification: '企业',
    classificationTone: 'pink',
    status: '已完成',
    time: '2026-01-12 13:30',
    size: '1.4MB',
    pages: 18,
    industryKey: 'bio-medicine',
    fileKind: 'pdf',
  },
  {
    key: 'report-4',
    category: 'tech',
    title: '关键技术专利布局分析报告',
    type: '技术洞察',
    classification: '技术',
    classificationTone: 'purple',
    status: '已完成',
    time: '2026-01-11 16:00',
    size: '4.5MB',
    pages: 60,
    industryKey: 'equipment',
    fileKind: 'pdf',
  },
  {
    key: 'report-5',
    category: 'talent',
    title: '高层次人才画像专题报告',
    type: '人才分析',
    classification: '人才',
    classificationTone: 'green',
    status: '已完成',
    time: '2026-01-11 09:00',
    size: '2.6MB',
    pages: 42,
    industryKey: 'new-material',
    fileKind: 'pdf',
  },
  {
    key: 'report-6',
    category: 'policy',
    title: '政策申报可行性诊断报告',
    type: '政策研究',
    classification: '政策',
    classificationTone: 'teal',
    status: '已完成',
    time: '2026-01-10 16:30',
    size: '1.8MB',
    pages: 24,
    industryKey: 'green-chem',
    fileKind: 'pdf',
  },
  {
    key: 'report-7',
    category: 'fund',
    title: '项目融资渠道匹配评估报告',
    type: '融资评估',
    classification: '融资',
    classificationTone: 'orange',
    status: '已完成',
    time: '2026-01-10 14:00',
    size: '0.8MB',
    pages: 12,
    industryKey: 'equipment',
    fileKind: 'pdf',
  },
  {
    key: 'report-8',
    category: 'industry',
    title: '绿色化工重点项目走访表单',
    type: '走访表单',
    classification: '项目',
    classificationTone: 'cyan',
    status: '已完成',
    time: '2026-01-10 09:15',
    size: '0.6MB',
    pages: 6,
    industryKey: 'green-chem',
    fileKind: 'form',
  },
  {
    key: 'report-9',
    category: 'talent',
    title: '高层次人才对接纪要表单',
    type: '纪要表单',
    classification: '人才',
    classificationTone: 'green',
    status: '生成中',
    time: '2026-01-09 15:30',
    size: '0.3MB',
    pages: 3,
    industryKey: 'new-material',
    fileKind: 'form',
  },
  {
    key: 'report-10',
    category: 'industry',
    title: '产业招商周报自动生成任务',
    type: '周报生成',
    classification: '招商',
    classificationTone: 'blue',
    status: '生成中',
    time: '2026-01-09 09:00',
    size: '1.2MB',
    pages: 16,
    industryKey: 'green-chem',
    fileKind: 'pdf',
  },
  {
    key: 'report-11',
    category: 'enterprise',
    title: '产业链关键企业画像分析报告',
    type: '企业诊断',
    classification: '企业',
    classificationTone: 'pink',
    status: '已完成',
    time: '2026-01-08 16:30',
    size: '1.8MB',
    pages: 24,
    industryKey: 'green-chem',
    fileKind: 'pdf',
  },
  {
    key: 'report-12',
    category: 'fund',
    title: '产业基金匹配专题分析报告',
    type: '融资评估',
    classification: '融资',
    classificationTone: 'orange',
    status: '已完成',
    time: '2026-01-08 14:00',
    size: '0.8MB',
    pages: 12,
    industryKey: 'green-chem',
    fileKind: 'pdf',
  },
  {
    key: 'report-13',
    category: 'policy',
    title: '重点项目政策适配性评估报告',
    type: '政策研究',
    classification: '政策',
    classificationTone: 'teal',
    status: '已完成',
    time: '2026-01-08 10:20',
    size: '1.1MB',
    pages: 17,
    industryKey: 'green-chem',
    fileKind: 'pdf',
  },
  {
    key: 'report-14',
    category: 'tech',
    title: '先进装备技术路线研判报告',
    type: '技术洞察',
    classification: '技术',
    classificationTone: 'purple',
    status: '已完成',
    time: '2026-01-07 16:45',
    size: '2.2MB',
    pages: 31,
    industryKey: 'equipment',
    fileKind: 'pdf',
  },
  {
    key: 'report-15',
    category: 'enterprise',
    title: '重点企业走访记录表单',
    type: '走访表单',
    classification: '企业',
    classificationTone: 'pink',
    status: '已完成',
    time: '2026-01-07 11:10',
    size: '0.4MB',
    pages: 4,
    industryKey: 'bio-medicine',
    fileKind: 'form',
  },
  {
    key: 'report-16',
    category: 'fund',
    title: '融资需求收集表单',
    type: '填报表单',
    classification: '融资',
    classificationTone: 'orange',
    status: '生成中',
    time: '2026-01-06 09:30',
    size: '0.2MB',
    pages: 2,
    industryKey: 'green-chem',
    fileKind: 'form',
  },

]

const classificationClassMap: Record<ClassificationTone, string> = {
  blue: 'classificationBlue',
  orange: 'classificationOrange',
  green: 'classificationGreen',
  cyan: 'classificationCyan',
  purple: 'classificationPurple',
  pink: 'classificationPink',
  teal: 'classificationTeal',
}

export default function ReportCenter() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [draftKeyword, setDraftKeyword] = useState('')
  const [keyword, setKeyword] = useState('')
  const [industryFilter, setIndustryFilter] = useState<IndustryKey>('green-chem')

  const visibleData = reportData.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab
    const matchesIndustry = industryFilter === 'all' || item.industryKey === industryFilter
    const normalizedKeyword = keyword.trim().toLowerCase()
    const matchesKeyword =
      !normalizedKeyword ||
      item.title.toLowerCase().includes(normalizedKeyword) ||
      item.type.toLowerCase().includes(normalizedKeyword) ||
      item.classification.toLowerCase().includes(normalizedKeyword)

    return matchesTab && matchesIndustry && matchesKeyword
  })

  const columns: TableColumnsType<ReportItem> = [
    {
      title: '报告名称',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (value: string, record) => (
        <span className={styles.reportName}>
          {record.fileKind === 'pdf' ? (
            <FilePdfOutlined className={`${styles.docIcon} ${styles.pdfIcon}`} />
          ) : (
            <FormOutlined className={`${styles.docIcon} ${styles.formIcon}`} />
          )}
          <a className={styles.reportLink}>{value}</a>
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 92,
      render: (value: string) => <Tag className={styles.typeTag}>{value}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'classification',
      key: 'classification',
      width: 84,
      render: (value: string, record) => (
        <Tag className={`${styles.classificationTag} ${styles[classificationClassMap[record.classificationTone]]}`}>
          {value}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 78,
      render: (value: ReportStatus) => (
        <span className={`${styles.statusText} ${value === '已完成' ? styles.statusDone : styles.statusGenerating}`}>
          <span className={styles.statusDot} />
          {value}
        </span>
      ),
    },
    {
      title: '生成时间',
      dataIndex: 'time',
      key: 'time',
      width: 126,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 68,
    },
    {
      title: '页数',
      dataIndex: 'pages',
      key: 'pages',
      width: 54,
    },
    {
      title: '操作',
      key: 'action',
      width: 154,
      render: (_: unknown, record) => {
        const generating = record.status === '生成中'

        return (
          <div className={styles.actionGroup}>
            <span className={`${styles.actionLink} ${generating ? styles.actionMuted : ''}`}>
              <EyeOutlined />
              预览
            </span>
            <span className={`${styles.actionLink} ${generating ? styles.actionMuted : ''}`}>
              <DownloadOutlined />
              下载
            </span>
            <span className={styles.actionLink}>
              <DeleteOutlined />
              删除
            </span>
          </div>
        )
      },
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
              <h2>报告中心</h2>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <Input
                  value={draftKeyword}
                  variant="borderless"
                  placeholder="搜索报告"
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
                value={industryFilter}
                size="small"
                popupMatchSelectWidth={false}
                className={styles.filterSelect}
                onChange={(value) => setIndustryFilter(value)}
                options={[
                  { value: 'green-chem', label: '绿色化工' },
                  { value: 'bio-medicine', label: '生物医药' },
                  { value: 'equipment', label: '装备制造' },
                  { value: 'new-material', label: '新材料' },
                  { value: 'all', label: '全部分类' },
                ]}
              />

              <Button
                size="small"
                className={styles.refreshButton}
                icon={<SyncOutlined />}
                onClick={() => {
                  setDraftKeyword('')
                  setKeyword('')
                  setIndustryFilter('green-chem')
                  setActiveTab('all')
                }}
              >
                刷新
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
            <Table<ReportItem>
              rowKey="key"
              columns={columns}
              dataSource={visibleData}
              pagination={false}
              size="small"
              className={styles.reportTable}
              scroll={{ x: 950 }}
              locale={{ emptyText: '暂无符合条件的报告数据' }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
