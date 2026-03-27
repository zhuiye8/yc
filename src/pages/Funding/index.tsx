import { useState } from 'react'
import { Select, Table, Tag, Button } from 'antd'
import {
  DollarOutlined,
  BankOutlined,
  SwapOutlined,
  RiseOutlined,
  UnorderedListOutlined,
  HistoryOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import ReportPanel from '@/components/ReportPanel'
import { fundingProducts, investmentInstitutions } from '@/mock/data'
import fundingBg from '@/assets/images/hero/funding-bg.jpg'
import styles from './Funding.module.scss'

const FINANCIAL_URL = 'https://www.threegorges-financial.com/'
const goFinancial = () => window.open(FINANCIAL_URL, '_blank')

const hotTags = ['科技贷', '创业担保', '股权融资', '贴息政策', 'VC机构', '产业基金', '天使投资']

const statCards = [
  { icon: <DollarOutlined />, color: '#2468F2', title: '融资工具', desc: '可申请融资产品', num: '28', unit: '款' },
  { icon: <BankOutlined />, color: '#2BA471', title: '投资机构', desc: '合作投资机构', num: '15', unit: '家' },
  { icon: <SwapOutlined />, color: '#7B61FF', title: '本周对接', desc: '连续融资对接', num: '34', unit: '笔' },
  { icon: <RiseOutlined />, color: '#F26B4A', title: '累计对接', desc: '融资总规模', num: '12.5', unit: '亿' },
]

const fundCards = [
  { label: 'VC', desc: '规模 580 亿', num: '45', unit: '家', color: '#2468F2' },
  { label: 'PE', desc: '规模 420 亿', num: '28', unit: '家', color: '#F26B4A' },
  { label: '引导基金', desc: '规模 1200 亿', num: '15', unit: '家', color: '#2BA471' },
  { label: '天使基金', desc: '规模 35 亿', num: '22', unit: '家', color: '#F5A623' },
  { label: '产业基金', desc: '规模 280 亿', num: '18', unit: '家', color: '#7B61FF' },
  { label: '母基金', desc: '规模 1500 亿', num: '8', unit: '家', color: '#00B8D9' },
]

const productColumns = [
  { title: '产品名称', dataIndex: 'name', key: 'name', render: (v: string) => <a onClick={goFinancial} style={{ color: '#2468F2', cursor: 'pointer' }}>{v}</a> },
  { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color="blue">{v}</Tag> },
  { title: '承办机构', dataIndex: 'institution', key: 'institution' },
  { title: '最高额度', dataIndex: 'maxAmount', key: 'maxAmount' },
  { title: '利率/费率', dataIndex: 'rate', key: 'rate' },
  { title: '期限', dataIndex: 'term', key: 'term' },
  { title: '操作', key: 'action', width: 120,
    render: () => <Button type="link" size="small" icon={<PlusOutlined />} onClick={goFinancial}>加入对接清单</Button>,
  },
]

const institutionColumns = [
  { title: '机构名称', dataIndex: 'name', key: 'name', render: (v: string) => <a onClick={goFinancial} style={{ color: '#2468F2', cursor: 'pointer' }}>{v}</a> },
  { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v}</Tag> },
  { title: '管理规模', dataIndex: 'fundSize', key: 'fundSize' },
  { title: '投资阶段', dataIndex: 'stage', key: 'stage' },
]

const dockList = [
  { name: '科技成果转化贷', target: '对象：某生物科技', status: '待跟进', color: '#F26B4A' },
  { name: '科技成果转化贷', target: '对象：某生物科技', status: '已联系', color: '#2468F2' },
  { name: '科技成果转化贷', target: '对象：某生物科技', status: '已对接', color: '#2BA471' },
  { name: '科技成果转化贷', target: '对象：某生物科技', status: '已联系', color: '#2468F2' },
  { name: '科技成果转化贷', target: '对象：某生物科技', status: '已对接', color: '#2BA471' },
]

const records = [
  { text: '与深创投初步沟通，约定下周会议', date: '2026-01-10' },
  { text: '与深创投初步沟通，约定下周会议', date: '2026-01-10' },
  { text: '与深创投初步沟通，约定下周会议', date: '2026-01-10' },
  { text: '与深创投初步沟通，约定下周会议', date: '2026-01-10' },
  { text: '与深创投初步沟通，约定下周会议', date: '2026-01-10' },
]

const reportMenuItems = [
  { key: 'dock', label: '融资对接报告' },
  { key: 'gap', label: '资金缺口对接' },
  { key: 'risk', label: '风险预警报告' },
]

export default function Funding() {
  const [activeTab, setActiveTab] = useState<'market' | 'report'>('market')
  const [subTab, setSubTab] = useState<'product' | 'institution'>('product')

  return (
    <div>
      <HeroSection
        backgroundImage={fundingBg}
        searchPlaceholder="搜索融资工具、投资机构、基金类型..."
        hotTags={hotTags}
      />

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div className={`${styles.tab} ${activeTab === 'market' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('market')}>产品超市</div>
          <div className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('report')}>融资报告</div>
        </div>
        <div className={styles.tabRight} />
      </div>

      {activeTab === 'market' && (
        <div className={styles.content}>
          <div className={styles.twoColumn}>
            {/* 左上：统计卡片 + 基金类型 */}
            <div className={styles.mainTop}>
              <div className={styles.statsRow}>
                {statCards.map((c) => (
                  <div key={c.title} className={styles.statCard} onClick={goFinancial} style={{ cursor: 'pointer' }}>
                    <div className={styles.statIcon} style={{ color: c.color, fontSize: 32 }}>{c.icon}</div>
                    <div className={styles.statTitle}>{c.title}</div>
                    <div className={styles.statDesc}>{c.desc}</div>
                    <div className={styles.statNum} style={{ color: c.color }}>
                      {c.num}<span className={styles.statUnit}>{c.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.fundRow}>
                {fundCards.map((f) => (
                  <div key={f.label} className={styles.fundCard} onClick={goFinancial} style={{ cursor: 'pointer' }}>
                    <div className={styles.fundLabel}>{f.label}</div>
                    <div className={styles.fundDesc}>{f.desc}</div>
                    <div className={styles.fundNum} style={{ color: f.color }}>{f.num}<span className={styles.fundUnit}>{f.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右上：对接清单 */}
            <div className={styles.sideTop}>
              <div className={styles.panel} style={{ height: '100%' }}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
                    <UnorderedListOutlined className={styles.icon} />
                    我的对接清单
                  </div>
                  <a style={{ fontSize: 13, color: '#86909C' }} onClick={goFinancial}>管理 &gt;</a>
                </div>
                {dockList.map((d, i) => (
                  <div key={i} className={styles.dockItem} onClick={goFinancial} style={{ cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1D2129' }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: '#86909C' }}>{d.target}</div>
                    </div>
                    <Tag color={d.color} style={{ borderRadius: 2 }}>{d.status}</Tag>
                  </div>
                ))}
              </div>
            </div>

            {/* 左下：子Tab + 表格 */}
            <div className={styles.mainBottom}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div className={styles.subTabBar}>
                  <div className={`${styles.subTab} ${subTab === 'product' ? styles.active : styles.inactive}`}
                    onClick={() => setSubTab('product')}>融资工具库</div>
                  <div className={`${styles.subTab} ${subTab === 'institution' ? styles.active : styles.inactive}`}
                    onClick={() => setSubTab('institution')}>投资机构库</div>
                </div>
                <span style={{ fontSize: 13, color: '#86909C' }}>产业链：</span>
                <Select defaultValue="green-chem" style={{ width: 130 }} size="small" options={[
                  { value: 'green-chem', label: '绿色化工' },
                ]} />
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Table
                columns={subTab === 'product' ? productColumns : institutionColumns as any}
                dataSource={subTab === 'product' ? fundingProducts : investmentInstitutions as any}
                rowKey="id" size="small"
                pagination={{ pageSize: 6, size: 'small' }}
              />
            </div>

            {/* 右下：跟进记录 */}
            <div className={styles.sideBottom}>
              <div className={styles.panel} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className={styles.panelTitle}>
                  <HistoryOutlined className={styles.icon} />
                  跟进记录
                </div>
                <div style={{ flex: 1 }}>
                  {records.map((r, i) => (
                    <div key={i} className={styles.recordItem}>
                      {r.text}
                      <span className={styles.recordDate}>{r.date}</span>
                    </div>
                  ))}
                </div>
                <Button type="dashed" block size="small" style={{ marginTop: 8 }} onClick={goFinancial}>添加记录</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && <ReportPanel menuItems={reportMenuItems} />}
    </div>
  )
}
