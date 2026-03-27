import { useState } from 'react'
import { Select, Table, Tag, Button } from 'antd'
import {
  ExperimentOutlined,
  FireOutlined,
  BankOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import ReportPanel from '@/components/ReportPanel'
import innovationBg from '@/assets/images/hero/innovation-bg.jpg'
import styles from './Innovation.module.scss'

const hotTags = ['基因编辑', '固态电池', '碳纤维', '智能传感', '绿色催化', '氢能', 'AI制药']

// 缺口对标表格数据
const gapData = [
  { id: '1', name: '高纯光刻胶', chain: '新材料', chainColor: 'orange', level: '严重', levelColor: 'red', local: '2家', national: '45家', suggestion: '引进核心技术团队' },
  { id: '2', name: '生物制品生产工艺', chain: '生物医药', chainColor: 'blue', level: '较大', levelColor: 'orange', local: '5家', national: '38家', suggestion: '产学研联合攻关' },
  { id: '3', name: '高精度传感器芯片', chain: '装备制造', chainColor: 'purple', level: '较大', levelColor: 'orange', local: '3家', national: '52家', suggestion: '与头部企业合作' },
  { id: '4', name: '氢燃料电池膜', chain: '清洁能源', chainColor: 'green', level: '中等', levelColor: 'gold', local: '8家', national: '28家', suggestion: '引进技术许可' },
  { id: '5', name: '高性能催化剂', chain: '绿色化工', chainColor: 'cyan', level: '轻微', levelColor: 'default', local: '12家', national: '35家', suggestion: '自主研发强化' },
]

const gapColumns = [
  { title: '技术缺口', dataIndex: 'name', key: 'name', width: 150 },
  { title: '所属链条', dataIndex: 'chain', key: 'chain', width: 90, render: (v: string, r: { chainColor: string }) => <Tag color={r.chainColor}>{v}</Tag> },
  { title: '缺口程度', dataIndex: 'level', key: 'level', width: 80, render: (v: string, r: { levelColor: string }) => <Tag color={r.levelColor}>{v}</Tag> },
  { title: '本地主体', dataIndex: 'local', key: 'local', width: 80 },
  { title: '全国主体', dataIndex: 'national', key: 'national', width: 80 },
  { title: '补链建议', dataIndex: 'suggestion', key: 'suggestion', ellipsis: true },
  { title: '操作', key: 'action', width: 160,
    render: () => (
      <span style={{ display: 'flex', gap: 4 }}>
        <Button type="link" size="small" style={{ padding: 0 }}>查看对标主体</Button>
        <Button type="link" size="small" style={{ padding: 0 }}>生成攻关建议</Button>
      </span>
    ),
  },
]

// 专利列表
const patentData = Array.from({ length: 10 }, (_, i) => ({
  id: `pat${i}`, name: i === 0 ? '一种基因编辑载体的制备方法' : '绿色催化剂制备及应用方法',
  applicant: i === 0 ? '宜昌人福药业公司' : '宜化集团',
  date: i === 0 ? '2025-11-15' : '2025-12-05',
  type: '发明',
  ipc: i === 0 ? 'A61K' : 'B01J',
  status: i === 0 ? '授权' : '实审',
}))

const patentColumns = [
  { title: '专利名称', dataIndex: 'name', key: 'name', ellipsis: true, render: (v: string) => <a style={{ color: '#2468F2' }}>{v}</a> },
  { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 120 },
  { title: '申请日期', dataIndex: 'date', key: 'date', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 60 },
  { title: 'IPC', dataIndex: 'ipc', key: 'ipc', width: 60, render: (v: string) => <Tag color="blue">{v}</Tag> },
  { title: '状态', dataIndex: 'status', key: 'status', width: 60, render: (v: string) => <span>● {v}</span> },
]

// 技术热度榜
const hotTopics = [
  { name: '基因编辑技术', color: '#F26B4A', tag: '热门', tagColor: '#FFF1F0', tagText: '#F26B4A' },
  { name: '高性能碳纤维', color: '#F59E5A', tag: '热门', tagColor: '#FFF7E6', tagText: '#F59E5A' },
  { name: '智能传感器', color: '#2BA471', tag: '稳定', tagColor: '#F0FFF4', tagText: '#2BA471' },
  { name: '绿色催化工艺', color: '#2468F2', tag: '上升', tagColor: '#E6F7FF', tagText: '#2468F2' },
  { name: '固态电池技术', color: '#F26B4A', tag: '热门', tagColor: '#FFF1F0', tagText: '#F26B4A' },
]

// 核心企业
const coreOrgs = [
  { name: '三峡实验室', type: '科研机构', typeColor: 'blue', patent: 178, project: 45, paper: 256 },
  { name: '三峡实验室', type: '高校', typeColor: 'green', patent: 178, project: 45, paper: 256 },
  { name: '三峡实验室', type: '企业', typeColor: 'orange', patent: 178, project: 45, paper: 256 },
  { name: '三峡实验室', type: '企业', typeColor: 'orange', patent: 178, project: 45, paper: 256 },
  { name: '三峡实验室', type: '企业', typeColor: 'orange', patent: 178, project: 45, paper: 256 },
  { name: '三峡实验室', type: '企业', typeColor: 'orange', patent: 178, project: 45, paper: 256 },
]

const reportMenuItems = [
  { key: 'analysis', label: '技术分析报告' },
  { key: 'gap', label: '技术缺口对标' },
  { key: 'trend', label: '技术趋势分析' },
  { key: 'compete', label: '技术竞争力对标' },
]

export default function Innovation() {
  const [activeTab, setActiveTab] = useState<'resource' | 'gap' | 'report'>('resource')

  return (
    <div>
      <HeroSection
        backgroundImage={innovationBg}
        searchPlaceholder="搜索专利、标准、技术成果、科研项目..."
        hotTags={hotTags}
      />

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          {(['resource', 'gap', 'report'] as const).map(tab => (
            <div key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : styles.inactive}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'resource' ? '创新资源' : tab === 'gap' ? '缺口对标' : '技术报告'}
            </div>
          ))}
        </div>
        <div className={styles.tabRight}>
          <span className={styles.filterLabel}>产业链</span>
          <Select defaultValue="green-chem" style={{ width: 140 }} size="small" options={[
            { value: 'green-chem', label: '绿色化工' },
            { value: 'ai', label: '人工智能' },
          ]} />
        </div>
      </div>

      {activeTab === 'resource' && (
        <div className={styles.content}>
          {/* 上区：缺口表格 + 热度榜 */}
          <div className={styles.topRow}>
            <div className={styles.topMain}>
              <div className={styles.panel}>
                <Table columns={gapColumns} dataSource={gapData} rowKey="id" size="small" pagination={false} scroll={{ x: 750 }} />
              </div>
            </div>
            <div className={styles.topSide}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <FireOutlined className={styles.icon} />
                  技术热度榜
                </div>
                {hotTopics.map((item, i) => (
                  <div key={item.name} className={styles.hotItem}>
                    <span className={`${styles.hotRank} ${i < 3 ? styles[`rank${i + 1}` as keyof typeof styles] : styles.rankDefault}`}>{i + 1}</span>
                    <span className={styles.hotDot} style={{ background: item.color }} />
                    <span className={styles.hotName}>{item.name}</span>
                    <span className={styles.hotTag} style={{ color: item.tagText, background: item.tagColor }}>{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 下区：专利列表 + 核心企业 */}
          <div className={styles.bottomRow}>
            <div className={styles.bottomMain}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <FileTextOutlined className={styles.icon} />
                    专利列表
                  </div>
                  <a style={{ fontSize: 13, color: '#86909C' }}>查看全部 &gt;</a>
                </div>
                <Table columns={patentColumns} dataSource={patentData} rowKey="id" size="small"
                  pagination={{ pageSize: 8, size: 'small' }} scroll={{ x: 600 }} />
              </div>
            </div>
            <div className={styles.bottomSide}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <BankOutlined className={styles.icon} />
                  核心企业
                </div>
                {coreOrgs.map((org, i) => (
                  <div key={i} className={styles.orgItem}>
                    <div className={styles.orgName}>
                      <span><ExperimentOutlined style={{ color: '#2468F2', marginRight: 6 }} />{org.name}</span>
                      <Tag color={org.typeColor}>{org.type}</Tag>
                    </div>
                    <div className={styles.orgMeta}>
                      <span>专利 {org.patent}</span>
                      <span>项目{org.project}</span>
                      <span>论文{org.paper}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gap' && (
        <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>缺口对标详情 — 待实现</div>
      )}

      {activeTab === 'report' && <ReportPanel menuItems={reportMenuItems} />}
    </div>
  )
}
