import { useState } from 'react'
import { Button, Select, Table, Tag, type TableColumnsType } from 'antd'
import { ExperimentOutlined } from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import ResourceHeatMap from './ResourceHeatMap'
import InnovationReport from './InnovationReport'
import innovationBg from '@/assets/images/hero/innovation-bg-plain.jpg'
import innovationTechnologyHeatIcon from '@/assets/images/icons/innovation-technology-heat-icon.png'
import innovationPatentListIcon from '@/assets/images/icons/innovation-patent-list-icon.png'
import innovationCoreEnterprisesIcon from '@/assets/images/icons/innovation-core-enterprises-icon.png'
import styles from './Innovation.module.scss'

type GapRecord = {
  id: string
  name: string
  chain: string
  chainColor: string
  level: string
  levelColor: string
  local: string
  national: string
  suggestion: string
}

type PatentRecord = {
  id: string
  name: string
  applicant: string
  date: string
  type: string
  ipc: string
  status: string
}

type HotTopic = {
  name: string
  color: string
  tag: string
  tagColor: string
  tagText: string
}

type CoreOrg = {
  name: string
  type: string
  typeColor: string
  patent: number
  project: number
  paper: number
}

const hotTags = ['产学研合作', '成果转化', '技术需求', '科研项目', '专利布局', '揭榜挂帅', 'AI 创新']

const gapData: GapRecord[] = [
  {
    id: '1',
    name: '高端生物催化剂中试平台',
    chain: '生物医药',
    chainColor: 'orange',
    level: '高价值缺口',
    levelColor: 'red',
    local: '2家',
    national: '45家',
    suggestion: '优先对接高校实验室与龙头企业，推动中试验证能力在宜昌落地。',
  },
  {
    id: '2',
    name: '电子级氟材料关键工艺',
    chain: '绿色化工',
    chainColor: 'blue',
    level: '重点突破',
    levelColor: 'orange',
    local: '5家',
    national: '38家',
    suggestion: '围绕关键原料和工艺装备建立攻关联合体，补齐核心环节短板。',
  },
  {
    id: '3',
    name: '高导热碳基复合材料制备',
    chain: '新材料',
    chainColor: 'purple',
    level: '重点突破',
    levelColor: 'orange',
    local: '3家',
    national: '52家',
    suggestion: '引入头部科研团队，建设联合实验室，提升关键材料转化效率。',
  },
  {
    id: '4',
    name: '氢能装备核心密封部件',
    chain: '清洁能源',
    chainColor: 'green',
    level: '前瞻储备',
    levelColor: 'gold',
    local: '8家',
    national: '28家',
    suggestion: '优先组织专题招商，锁定具备量产经验的细分企业和团队。',
  },
  {
    id: '5',
    name: '工业视觉算法测试平台',
    chain: '装备制造',
    chainColor: 'cyan',
    level: '持续跟踪',
    levelColor: 'default',
    local: '12家',
    national: '35家',
    suggestion: '围绕重点场景建立示范线，用真实需求加速算法和设备落地。',
  },
]

const gapColumns: TableColumnsType<GapRecord> = [
  { title: '技术方向', dataIndex: 'name', key: 'name', width: 180 },
  {
    title: '所属链条',
    dataIndex: 'chain',
    key: 'chain',
    width: 100,
    render: (value, record) => <Tag color={record.chainColor}>{value}</Tag>,
  },
  {
    title: '缺口等级',
    dataIndex: 'level',
    key: 'level',
    width: 110,
    render: (value, record) => <Tag color={record.levelColor}>{value}</Tag>,
  },
  { title: '本地主体', dataIndex: 'local', key: 'local', width: 90 },
  { title: '全国主体', dataIndex: 'national', key: 'national', width: 90 },
  { title: '建议动作', dataIndex: 'suggestion', key: 'suggestion', ellipsis: true },
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
          生成建议
        </Button>
      </span>
    ),
  },
]

const patentData: PatentRecord[] = Array.from({ length: 10 }, (_, index) => ({
  id: `pat-${index}`,
  name:
    index === 0
      ? '一种用于生物制造场景的高稳定性酶催化体系'
      : `技术成果样例 ${index + 1}：高性能材料制备及产业化应用`,
  applicant: index === 0 ? '三峡大学生物工程学院' : '宜昌产业创新联合体',
  date: index === 0 ? '2025-11-15' : '2025-12-05',
  type: '发明',
  ipc: index === 0 ? 'A61K' : 'B01J',
  status: index === 0 ? '已授权' : '实审中',
}))

const patentColumns: TableColumnsType<PatentRecord> = [
  {
    title: '成果名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    render: (value) => <a style={{ color: '#2468F2' }}>{value}</a>,
  },
  { title: '申请主体', dataIndex: 'applicant', key: 'applicant', width: 140 },
  { title: '公开日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  {
    title: 'IPC',
    dataIndex: 'ipc',
    key: 'ipc',
    width: 80,
    render: (value) => <Tag color="blue">{value}</Tag>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 90,
    render: (value) => <span>{value}</span>,
  },
]

const hotTopics: HotTopic[] = [
  { name: '合成生物中试平台', color: '#F26B4A', tag: '高关注', tagColor: '#FFF1F0', tagText: '#F26B4A' },
  { name: '高导热碳纤维材料', color: '#F59E5A', tag: '高关注', tagColor: '#FFF7E6', tagText: '#F59E5A' },
  { name: '工业视觉大模型', color: '#2BA471', tag: '快速增长', tagColor: '#F0FFF4', tagText: '#2BA471' },
  { name: '新能源装备轻量化', color: '#2468F2', tag: '重点布局', tagColor: '#E6F7FF', tagText: '#2468F2' },
  { name: '电子级氟材料工艺', color: '#F26B4A', tag: '高关注', tagColor: '#FFF1F0', tagText: '#F26B4A' },
]

const coreOrgs: CoreOrg[] = [
  { name: '湖北三峡实验室', type: '科研平台', typeColor: 'blue', patent: 178, project: 45, paper: 256 },
  { name: '三峡大学', type: '高校', typeColor: 'green', patent: 132, project: 38, paper: 214 },
  { name: '宜昌人福药业有限公司', type: '企业', typeColor: 'orange', patent: 156, project: 22, paper: 48 },
  { name: '安琪酵母股份有限公司', type: '企业', typeColor: 'orange', patent: 289, project: 31, paper: 67 },
  { name: '三峡新材股份有限公司', type: '企业', typeColor: 'orange', patent: 67, project: 14, paper: 16 },
  { name: '中船重工710研究所', type: '企业', typeColor: 'orange', patent: 342, project: 52, paper: 84 },
]

export default function Innovation() {
  const [activeTab, setActiveTab] = useState<'resource' | 'gap' | 'report'>('resource')

  return (
    <div className={styles.page}>
      <HeroSection
        backgroundImage={innovationBg}
        searchPlaceholder="搜索技术成果、专利、机构、科研项目..."
        hotTags={hotTags}
        titleLine1="链接产学研资源"
        titleLine2="让技术成果快速落地"
      />

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          {(['resource', 'gap', 'report'] as const).map((tab) => (
            <div
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : styles.inactive}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'resource' ? '资源热力' : tab === 'gap' ? '缺口识别' : '专题报告'}
            </div>
          ))}
        </div>
        {activeTab !== 'resource' && (
          <div className={styles.tabRight}>
            <span className={styles.filterLabel}>产业链</span>
            <Select
              defaultValue="green-chem"
              style={{ width: 140 }}
              size="small"
              options={[
                { value: 'green-chem', label: '绿色化工' },
                { value: 'ai', label: '人工智能' },
              ]}
            />
          </div>
        )}
      </div>

      {activeTab === 'resource' && <ResourceHeatMap />}

      {activeTab === 'gap' && (
        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={styles.topMain}>
              <div className={styles.panel}>
                <Table columns={gapColumns} dataSource={gapData} rowKey="id" size="small" pagination={false} scroll={{ x: 860 }} />
              </div>
            </div>
            <div className={styles.topSide}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <img src={innovationTechnologyHeatIcon} alt="" className={styles.iconImage} />
                  技术热点
                </div>
                {hotTopics.map((item, index) => {
                  const rankClass =
                    index === 0
                      ? styles.rank1
                      : index === 1
                        ? styles.rank2
                        : index === 2
                          ? styles.rank3
                          : styles.rankDefault

                  return (
                    <div key={item.name} className={styles.hotItem}>
                      <span className={`${styles.hotRank} ${rankClass}`}>{index + 1}</span>
                      <span className={styles.hotDot} style={{ background: item.color }} />
                      <span className={styles.hotName}>{item.name}</span>
                      <span className={styles.hotTag} style={{ color: item.tagText, background: item.tagColor }}>
                        {item.tag}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.bottomMain}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <img src={innovationPatentListIcon} alt="" className={styles.iconImage} />
                    成果清单
                  </div>
                  <span style={{ fontSize: 13, color: '#86909C' }}>查看更多 &gt;</span>
                </div>
                <Table
                  columns={patentColumns}
                  dataSource={patentData}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 8, size: 'small' }}
                  scroll={{ x: 760 }}
                />
              </div>
            </div>
            <div className={styles.bottomSide}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <img src={innovationCoreEnterprisesIcon} alt="" className={styles.iconImage} />
                  核心机构
                </div>
                {coreOrgs.map((org) => (
                  <div key={org.name} className={styles.orgItem}>
                    <div className={styles.orgName}>
                      <span>
                        <ExperimentOutlined style={{ color: '#2468F2', marginRight: 6 }} />
                        {org.name}
                      </span>
                      <Tag color={org.typeColor}>{org.type}</Tag>
                    </div>
                    <div className={styles.orgMeta}>
                      <span>专利 {org.patent}</span>
                      <span>项目 {org.project}</span>
                      <span>论文 {org.paper}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && <InnovationReport />}
    </div>
  )
}
