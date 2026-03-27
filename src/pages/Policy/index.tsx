import { useState } from 'react'
import { Select, Table, Tag, Button, Switch } from 'antd'
import {
  FileTextOutlined,
  BellOutlined,
  CalendarOutlined,
  CloseOutlined,
  CaretRightOutlined,
} from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import ReportPanel from '@/components/ReportPanel'
import { localPolicies } from '@/mock/localPolicies'
import policyBg from '@/assets/images/hero/policy-bg.jpg'
import styles from './Policy.module.scss'

const hotTags = ['人才引进', '科技创新', '产业扶持', '税收优惠', '创业补贴', '专精特新', '高新企业']

const expiringCount = localPolicies.filter(p => {
  if (!p.expiryDate) return false
  const diff = new Date(p.expiryDate).getTime() - Date.now()
  return diff > 0 && diff < 180 * 24 * 3600 * 1000
}).length

const policyColumns = [
  {
    title: '政策名称', dataIndex: 'title', key: 'title', ellipsis: true,
    render: (v: string, r: { sourceUrl: string }) => (
      <span>
        <CaretRightOutlined style={{ color: '#2468F2', marginRight: 4, fontSize: 10 }} />
        {r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#2468F2' }}>{v}</a> : v}
      </span>
    ),
  },
  { title: '发布部门', dataIndex: 'issuer', key: 'issuer', width: 140, ellipsis: true },
  { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', width: 100 },
  { title: '截止日期', dataIndex: 'expiryDate', key: 'expiryDate', width: 100,
    render: (v: string) => v || <span style={{ color: '#ccc' }}>长期</span>,
  },
  { title: '类型', dataIndex: 'level', key: 'level', width: 50,
    render: (v: string) => <Tag color={v === '省' ? 'purple' : v === '市' ? 'blue' : 'default'}>{v}</Tag>,
  },
  { title: '标签', dataIndex: 'tags', key: 'tags', width: 120, ellipsis: true,
    render: (v: string) => v.split(',').slice(0, 2).map(t => <Tag key={t} style={{ marginBottom: 2 }}>{t.trim()}</Tag>),
  },
  { title: '操作', key: 'action', width: 130,
    render: () => (
      <span style={{ display: 'flex', gap: 4 }}>
        <Button type="link" size="small" style={{ padding: 0 }}>查看详评</Button>
        <Button type="link" size="small" style={{ padding: 0 }}>已配对建立</Button>
      </span>
    ),
  },
]

const alertSubscriptions = [
  { name: '新政触达', desc: '符合条件的新政策发布时通知', enabled: true },
  { name: '到期提醒', desc: '申报截止前7天提醒', enabled: true },
  { name: '科技成果转化贷', desc: '窗口期提醒', enabled: false },
]

const weeklyUpdates = [
  { title: '宜昌市促进生物医药产业发展若干政策', date: '2026-01-10' },
  { title: '关于支持科技创新的若干措施', date: '2026-01-10' },
  { title: '高层次人才引进计划（更新）', date: '2026-01-10' },
  { title: '宜昌市促进生物医药产业发展若干政策', date: '2026-01-10' },
  { title: '关于支持科技创新的若干措施', date: '2026-01-10' },
  { title: '高层次人才引进计划（更新）', date: '2026-01-10' },
]

const reportMenuItems = [
  { key: 'advice', label: '申报建议分析' },
  { key: 'interpret', label: '政策解读报告' },
]

export default function Policy() {
  const [activeTab, setActiveTab] = useState<'list' | 'report'>('list')
  const [showTip, setShowTip] = useState(true)

  return (
    <div>
      <HeroSection
        backgroundImage={policyBg}
        searchPlaceholder="搜索政策名称、发布部门、关键词..."
        hotTags={hotTags}
      />

      {/* 提示条（全宽） */}
      {showTip && (
        <div className={styles.tipBar}>
          <div className={styles.tipContent}>
            <span>{expiringCount}项政策即将到期，请及时关注</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button type="primary" size="small" ghost>查看详情</Button>
              <CloseOutlined style={{ cursor: 'pointer', color: '#999' }} onClick={() => setShowTip(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Tab栏（全宽） */}
      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div className={`${styles.tab} ${activeTab === 'list' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('list')}>政策列表</div>
          <div className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('report')}>政策报告</div>
        </div>
        <div className={styles.tabRight}>
          <span className={styles.filterLabel}>产业链</span>
          <Select defaultValue="green-chem" style={{ width: 140 }} size="small" options={[
            { value: 'green-chem', label: '绿色化工' },
          ]} />
        </div>
      </div>

      {activeTab === 'list' && (
        <div className={styles.content}>
          <div className={styles.twoColumn}>
            {/* 左列：政策列表 */}
            <div className={styles.mainCol}>
              <div className={styles.listPanel}>
                <div className={styles.listHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <FileTextOutlined className={styles.icon} />
                    政策列表
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#86909C', alignItems: 'center' }}>
                    <span>更新频率：每周</span>
                    <a style={{ color: '#2468F2', fontSize: 13 }}>🔔 订阅更新</a>
                  </div>
                </div>
                <Table
                  columns={policyColumns}
                  dataSource={localPolicies}
                  rowKey="id"
                  size="middle"
                  pagination={{ pageSize: 10, size: 'small' }}
                  scroll={{ x: 850 }}
                />
              </div>
            </div>

            {/* 右列：预警订阅 + 本周更新 */}
            <div className={styles.sideCol}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <BellOutlined className={styles.icon} />
                    预警订阅
                  </div>
                  <a style={{ fontSize: 13, color: '#86909C' }}>管理 &gt;</a>
                </div>
                {alertSubscriptions.map((a, i) => (
                  <div key={i} className={styles.alertItem}>
                    <div>
                      <div className={styles.alertName}>{a.name}</div>
                      <div className={styles.alertDesc}>{a.desc}</div>
                    </div>
                    <Switch size="small" defaultChecked={a.enabled} />
                  </div>
                ))}
              </div>

              <div className={styles.updatePanel}>
                <div className={styles.panelTitle}>
                  <CalendarOutlined className={styles.icon} />
                  本周更新
                </div>
                {weeklyUpdates.map((u, i) => (
                  <div key={i} className={styles.updateItem}>
                    <div className={styles.updateTitle}>{u.title}</div>
                    <div className={styles.updateDate}>{u.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && <ReportPanel menuItems={reportMenuItems} />}
    </div>
  )
}
