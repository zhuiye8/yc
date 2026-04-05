import { useState } from 'react'
import { Button, Select, Table, Tag, type TableColumnsType } from 'antd'
import { BankOutlined, DollarOutlined, PlusOutlined, RiseOutlined, SwapOutlined } from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import FundingReport from './FundingReport'
import { fundingProducts, investmentInstitutions } from '@/mock/data'
import fundingBg from '@/assets/images/hero/funding-bg-plain.jpg'
import fundingMatchListIcon from '@/assets/images/icons/funding-match-list-icon.png'
import fundingFollowRecordsIcon from '@/assets/images/icons/funding-follow-records-icon.png'
import styles from './Funding.module.scss'

type FundingProduct = (typeof fundingProducts)[number]
type InvestmentInstitution = (typeof investmentInstitutions)[number]

const FINANCIAL_URL = 'https://www.threegorges-financial.com/'

const hotTags = ['科技贷款', '成果转化融资', '产业基金', '政府贴息', 'VC/PE', '天使投资', '供应链金融']

const statCards = [
  { icon: <DollarOutlined />, color: '#2468F2', title: '可对接资金规模', desc: '整合银行、基金、担保和政府引导资金能力。', num: '28', unit: '亿元' },
  { icon: <BankOutlined />, color: '#2BA471', title: '入驻金融机构', desc: '覆盖银行、基金、担保、租赁等多类机构。', num: '15', unit: '家' },
  { icon: <SwapOutlined />, color: '#7B61FF', title: '撮合对接项目', desc: '围绕企业融资需求自动进行机构匹配。', num: '34', unit: '项' },
  { icon: <RiseOutlined />, color: '#F26B4A', title: '融资转化效率', desc: '对接流程线上化，提升融资落地转化速度。', num: '12.5', unit: '%' },
]

const fundCards = [
  { label: 'VC', desc: '重点覆盖早期创新项目', num: '45', unit: '家', color: '#2468F2' },
  { label: 'PE', desc: '聚焦成长期和成熟期企业', num: '28', unit: '家', color: '#F26B4A' },
  { label: '政府引导基金', desc: '兼顾产业培育与社会资本撬动', num: '15', unit: '支', color: '#2BA471' },
  { label: '天使基金', desc: '适合初创团队和技术孵化', num: '22', unit: '支', color: '#F5A623' },
  { label: '产业基金', desc: '服务重点链主和战略项目', num: '18', unit: '支', color: '#7B61FF' },
  { label: '融资租赁', desc: '支撑设备投入和产线扩建', num: '8', unit: '类', color: '#00B8D9' },
]

const productColumns: TableColumnsType<FundingProduct> = [
  {
    title: '金融产品',
    dataIndex: 'name',
    key: 'name',
    render: (value) => (
      <a href={FINANCIAL_URL} target="_blank" rel="noreferrer" style={{ color: '#2468F2' }}>
        {value}
      </a>
    ),
  },
  { title: '类型', dataIndex: 'type', key: 'type', render: (value) => <Tag color="blue">{value}</Tag> },
  { title: '提供机构', dataIndex: 'institution', key: 'institution' },
  { title: '最高额度', dataIndex: 'maxAmount', key: 'maxAmount' },
  { title: '参考利率/贴息', dataIndex: 'rate', key: 'rate' },
  { title: '期限', dataIndex: 'term', key: 'term' },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: () => (
      <Button type="link" size="small" icon={<PlusOutlined />} href={FINANCIAL_URL} target="_blank">
        申请对接
      </Button>
    ),
  },
]

const institutionColumns: TableColumnsType<InvestmentInstitution> = [
  {
    title: '投资机构',
    dataIndex: 'name',
    key: 'name',
    render: (value) => (
      <a href={FINANCIAL_URL} target="_blank" rel="noreferrer" style={{ color: '#2468F2' }}>
        {value}
      </a>
    ),
  },
  { title: '机构类型', dataIndex: 'type', key: 'type', render: (value) => <Tag>{value}</Tag> },
  { title: '基金规模', dataIndex: 'fundSize', key: 'fundSize' },
  { title: '关注阶段', dataIndex: 'stage', key: 'stage' },
]

const dockList = [
  { name: '三峡实验室技术成果转化项目', target: '匹配宜昌市政府引导基金与科技成果转化贷', status: '待跟进', color: '#F26B4A' },
  { name: '绿色化工中试线扩建项目', target: '匹配产业基金和设备融资租赁方案', status: '已匹配', color: '#2468F2' },
  { name: '新能源储能材料孵化项目', target: '匹配天使投资基金和贴息贷款', status: '已签约', color: '#2BA471' },
  { name: '智能装备联合攻关项目', target: '匹配供应链金融与商业银行授信', status: '已匹配', color: '#2468F2' },
  { name: '高校专利包转化项目', target: '匹配知识产权质押融资与政策贴息', status: '已签约', color: '#2BA471' },
]

const records = [
  { text: '宜昌人福药业已提交成果转化贷申请，系统同步推送至匹配机构。', date: '2026-01-10' },
  { text: '三峡新材扩产项目完成初步融资需求画像，进入人工复核阶段。', date: '2026-01-10' },
  { text: '创新团队“新型储能材料”已收到两家天使基金的意向反馈。', date: '2026-01-10' },
  { text: '高端装备企业授信额度更新，平台已自动重排机构推荐顺序。', date: '2026-01-10' },
  { text: '政策贴息匹配结果已回传，用户可直接进入申报辅助流程。', date: '2026-01-10' },
]

export default function Funding() {
  const [activeTab, setActiveTab] = useState<'market' | 'report'>('market')
  const [subTab, setSubTab] = useState<'product' | 'institution'>('product')

  return (
    <div className={styles.page}>
      <HeroSection
        backgroundImage={fundingBg}
        searchPlaceholder="搜索金融产品、机构、基金、融资需求..."
        hotTags={hotTags}
        titleLine1="连接多元资本"
        titleLine2="让人才与技术获得精准融资"
      />

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div className={`${styles.tab} ${activeTab === 'market' ? styles.active : styles.inactive}`} onClick={() => setActiveTab('market')}>
            资金市场
          </div>
          <div className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`} onClick={() => setActiveTab('report')}>
            专题报告
          </div>
        </div>
        <div className={styles.tabRight}>
          {activeTab === 'report' && (
            <>
              <span className={styles.filterLabel}>产业链</span>
              <Select
                defaultValue="green-chem"
                style={{ width: 140 }}
                size="small"
                options={[{ value: 'green-chem', label: '绿色化工' }]}
              />
            </>
          )}
        </div>
      </div>

      {activeTab === 'market' && (
        <div className={styles.content}>
          <div className={styles.twoColumn}>
            <div className={styles.mainTop}>
              <div className={styles.statsRow}>
                {statCards.map((card) => (
                  <div key={card.title} className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: card.color, fontSize: 32 }}>
                      {card.icon}
                    </div>
                    <div className={styles.statTitle}>{card.title}</div>
                    <div className={styles.statDesc}>{card.desc}</div>
                    <div className={styles.statNum} style={{ color: card.color }}>
                      {card.num}
                      <span className={styles.statUnit}>{card.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.fundRow}>
                {fundCards.map((card) => (
                  <div key={card.label} className={styles.fundCard}>
                    <div className={styles.fundLabel}>{card.label}</div>
                    <div className={styles.fundDesc}>{card.desc}</div>
                    <div className={styles.fundNum} style={{ color: card.color }}>
                      {card.num}
                      <span className={styles.fundUnit}>{card.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sideTop}>
              <div className={styles.panel} style={{ height: '100%' }}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <img src={fundingMatchListIcon} alt="" className={styles.iconImage} />
                    智能撮合清单
                  </div>
                  <a href={FINANCIAL_URL} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#86909C' }}>
                    查看更多 &gt;
                  </a>
                </div>
                {dockList.map((item) => (
                  <div key={item.name} className={styles.dockItem}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1D2129' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#86909C' }}>{item.target}</div>
                    </div>
                    <Tag color={item.color} style={{ borderRadius: 2 }}>
                      {item.status}
                    </Tag>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.mainBottom}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div className={styles.subTabBar}>
                  <div className={`${styles.subTab} ${subTab === 'product' ? styles.active : styles.inactive}`} onClick={() => setSubTab('product')}>
                    融资产品
                  </div>
                  <div className={`${styles.subTab} ${subTab === 'institution' ? styles.active : styles.inactive}`} onClick={() => setSubTab('institution')}>
                    投资机构
                  </div>
                </div>
                <span style={{ fontSize: 13, color: '#86909C' }}>产业链</span>
                <Select
                  defaultValue="green-chem"
                  style={{ width: 130 }}
                  size="small"
                  options={[{ value: 'green-chem', label: '绿色化工' }]}
                />
              </div>
              {subTab === 'product' ? (
                <Table<FundingProduct>
                  columns={productColumns}
                  dataSource={fundingProducts}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 6, size: 'small' }}
                />
              ) : (
                <Table<InvestmentInstitution>
                  columns={institutionColumns}
                  dataSource={investmentInstitutions}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 6, size: 'small' }}
                />
              )}
            </div>

            <div className={styles.sideBottom}>
              <div className={styles.panel} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className={styles.panelTitle}>
                  <img src={fundingFollowRecordsIcon} alt="" className={styles.iconImage} />
                  跟进记录
                </div>
                <div style={{ flex: 1 }}>
                  {records.map((record) => (
                    <div key={`${record.text}-${record.date}`} className={styles.recordItem}>
                      {record.text}
                      <span className={styles.recordDate}>{record.date}</span>
                    </div>
                  ))}
                </div>
                <Button type="dashed" block size="small" style={{ marginTop: 8 }} href={FINANCIAL_URL} target="_blank">
                  查看全部记录
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && <FundingReport />}
    </div>
  )
}
