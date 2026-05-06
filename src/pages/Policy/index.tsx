import { useState } from 'react'
import { Button, Select, Switch, Table, Tag, type TableColumnsType } from 'antd'
import { CaretRightOutlined, CloseOutlined } from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import { localPolicies, type LocalPolicy } from '@/mock/localPolicies'
import PolicyReport from './PolicyReport'
import policyBg from '@/assets/images/hero/policy-bg-plain.jpg'
import policyListIcon from '@/assets/images/icons/policy-list-icon.png'
import policyAlertSubscriptionIcon from '@/assets/images/icons/policy-alert-subscription-icon.png'
import policyWeeklyUpdatesIcon from '@/assets/images/icons/policy-weekly-updates-icon.png'
import styles from './Policy.module.scss'

const hotTags = ['惠企政策', '人才认定', '科技创新券', '产业发展', '项目申报', '专项补贴', '数字经济']

const regionOptions = [
  { value: 'all', label: '全国' },
  { value: 'hubei', label: '湖北省' },
  { value: 'yichang', label: '宜昌市' },
]

const expiringCount = localPolicies.filter((policy) => {
  if (!policy.expiryDate) return false
  const diff = new Date(policy.expiryDate).getTime() - Date.now()
  return diff > 0 && diff < 180 * 24 * 3600 * 1000
}).length

const tagPalette = [
  { color: '#2468F2', bg: '#EAF2FF', border: '#B9D3FF' },
  { color: '#13A8A8', bg: '#E8FFFB', border: '#9DEBE3' },
  { color: '#F26B4A', bg: '#FFF1EB', border: '#FFD0BE' },
  { color: '#7B61FF', bg: '#F3F0FF', border: '#D8CFFF' },
  { color: '#D48806', bg: '#FFF7E6', border: '#FFD591' },
  { color: '#2BA471', bg: '#F0FFF4', border: '#B7E8C3' },
]

function getTagStyle(tag: string) {
  const sum = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const palette = tagPalette[sum % tagPalette.length]
  return {
    color: palette.color,
    background: palette.bg,
    borderColor: palette.border,
  }
}

const policyColumns: TableColumnsType<LocalPolicy> = [
  {
    title: '政策标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
    render: (value, record) => (
      <span>
        <CaretRightOutlined style={{ color: '#2468F2', marginRight: 4, fontSize: 10 }} />
        {record.sourceUrl ? (
          <a href={record.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#2468F2' }}>
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    ),
  },
  { title: '发布单位', dataIndex: 'issuer', key: 'issuer', width: 170, ellipsis: true },
  { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', width: 110 },
  {
    title: '截止日期',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 110,
    render: (value) => value || <span style={{ color: '#ccc' }}>长期有效</span>,
  },
  {
    title: '层级',
    dataIndex: 'level',
    key: 'level',
    width: 80,
    render: (value) => <Tag color={value === '省' ? 'purple' : value === '市' ? 'blue' : 'default'}>{value}</Tag>,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 140,
    ellipsis: true,
    render: (value) =>
      value
        .split(',')
        .slice(0, 2)
        .map((tag: string) => (
          <Tag key={tag} className={styles.policyTag} style={getTagStyle(tag.trim())}>
            {tag.trim()}
          </Tag>
        )),
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    render: () => (
      <span style={{ display: 'flex', gap: 8 }}>
        <Button type="link" size="small" style={{ padding: 0 }}>
          查看详情
        </Button>
        <Button type="link" size="small" style={{ padding: 0 }}>
          智能匹配
        </Button>
      </span>
    ),
  },
]

const alertSubscriptions = [
  {
    name: '高层次人才政策订阅',
    desc: '自动跟踪人才认定、住房补贴和团队支持类政策变化。',
    enabled: true,
  },
  {
    name: '企业奖补政策订阅',
    desc: '面向科技型企业、专精特新企业和重点链主进行定向提醒。',
    enabled: true,
  },
  {
    name: '产业专项通知订阅',
    desc: '监控产业基金、项目申报、设备更新等专项政策动态。',
    enabled: false,
  },
]

const weeklyUpdates = [
  { title: '市人民政府办公室发布《宜昌市支持生物制造产业高质量倍增发展若干措施》解读。', date: '2026-01-10' },
  { title: '宜昌高新区企业上市挂牌奖励办法进入集中申报窗口，系统已开放匹配。', date: '2026-01-10' },
  { title: '科技创新券管理办法更新，面向成果转化平台和创新主体推送新一轮通知。', date: '2026-01-10' },
  { title: '人才分类认定办法补充条款生效，系统已同步更新认定条件。', date: '2026-01-10' },
  { title: '数字经济和新型工业化相关县区政策新增 5 条，已进入智能匹配池。', date: '2026-01-10' },
  { title: '项目申报辅助功能新增到期提醒，支持一键生成材料清单。', date: '2026-01-10' },
]

export default function Policy() {
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list')
  const [showTip, setShowTip] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')

  return (
    <div className={styles.page}>
      <HeroSection
        backgroundImage={policyBg}
        searchPlaceholder="搜索政策标题、发布单位、补贴类型、申报条件..."
        hotTags={hotTags}
        variant="industry"
        titleLine1="自动匹配政策福利"
        titleLine2="让政策补贴一键直达"
      />

      {showTip && (
        <div className={styles.tipBar}>
          <div className={styles.tipContent}>
            <span>当前有 {expiringCount} 条政策将在 180 天内到期，建议优先关注并安排申报。</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button type="primary" size="small" ghost>
                查看提醒
              </Button>
              <CloseOutlined style={{ cursor: 'pointer', color: '#999' }} onClick={() => setShowTip(false)} />
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div className={`${styles.tab} ${activeTab === 'list' ? styles.active : styles.inactive}`} onClick={() => setActiveTab('list')}>
            政策清单
          </div>
          <div className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`} onClick={() => setActiveTab('report')}>
            专题报告
          </div>
        </div>
        <div className={styles.tabRight}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>区域</span>
            <Select
              value={selectedRegion}
              allowClear
              placeholder="全国"
              onChange={(value) => setSelectedRegion(value || 'all')}
              style={{ width: 200 }}
              size="small"
              options={regionOptions}
            />
          </div>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className={styles.content}>
          <div className={styles.twoColumn}>
            <div className={styles.mainCol}>
              <div className={styles.listPanel}>
                <div className={styles.listHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <img src={policyListIcon} alt="" className={styles.iconImage} />
                    政策清单
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#86909C', alignItems: 'center' }}>
                    <span>按政策有效期、层级和标签快速筛选</span>
                    <a style={{ color: '#2468F2', fontSize: 13 }}>导出列表</a>
                  </div>
                </div>
                <Table
                  className={styles.policyTable}
                  columns={policyColumns}
                  dataSource={localPolicies}
                  rowKey="id"
                  size="middle"
                  pagination={{ pageSize: 10, size: 'small' }}
                  scroll={{ x: 980 }}
                />
              </div>
            </div>

            <div className={styles.sideCol}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <img src={policyAlertSubscriptionIcon} alt="" className={styles.iconImage} />
                    政策预警订阅
                  </div>
                  <a style={{ fontSize: 13, color: '#86909C' }}>查看更多 &gt;</a>
                </div>
                {alertSubscriptions.map((item) => (
                  <div key={item.name} className={styles.alertItem}>
                    <div>
                      <div className={styles.alertName}>{item.name}</div>
                      <div className={styles.alertDesc}>{item.desc}</div>
                    </div>
                    <Switch size="small" defaultChecked={item.enabled} />
                  </div>
                ))}
              </div>

              <div className={styles.updatePanel}>
                <div className={styles.panelTitle}>
                  <img src={policyWeeklyUpdatesIcon} alt="" className={styles.iconImage} />
                  政策周更新
                </div>
                {weeklyUpdates.map((item) => (
                  <div key={item.title} className={styles.updateItem}>
                    <div className={styles.updateTitle}>{item.title}</div>
                    <div className={styles.updateDate}>{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && <PolicyReport />}
    </div>
  )
}
