import { useState, useMemo, useCallback } from 'react'
import { Select, Cascader, App, Drawer, Table, Tag } from 'antd'
import { BankOutlined, TeamOutlined } from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import IndustryGraph from './IndustryGraph'
import IndustryReport from './IndustryReport'
import { regionOptions } from '@/mock/regions'
import { searchOrgs } from '@/services/industry'
import { searchExperts } from '@/services/talent'
import type { CascaderProps } from 'antd'
import industryBg from '@/assets/images/hero/industry-bg.jpg'
import styles from './Industry.module.scss'

// 真实六条产业链（value 对应 industryChainGraphData 的 key）
const chainOptions = [
  { value: 'wetchem', label: '湿电子化学品' },
  { value: 'newenergy', label: '新能源新材料' },
  { value: 'pharma', label: '先进制剂与高端仿制药' },
  { value: 'yeast', label: '酵母发酵与功能成分制造' },
  { value: 'ship', label: '内河绿色智能船舶制造' },
  { value: 'ai', label: '人工智能' },
]

const hotTags = ['湿电子化学品', '氟化工', '锂电材料', '生物制药', '智能传感器', '碳纤维', '光伏材料']

// 从 regionOptions 构建 value->label 映射
function buildLabelMap(options: CascaderProps['options']): Record<string, string> {
  const map: Record<string, string> = {}
  const walk = (items: CascaderProps['options']) => {
    items?.forEach((item) => {
      if (item.value && item.label) map[String(item.value)] = String(item.label)
      if (item.children) walk(item.children)
    })
  }
  walk(options)
  return map
}

// 搜索结果抽屉
interface SearchDrawerState {
  visible: boolean
  keyword: string
  loading: boolean
  orgs: Record<string, unknown>[]
  orgTotal: number
  experts: Record<string, unknown>[]
  expertTotal: number
  activeTab: 'orgs' | 'experts'
}

export default function Industry() {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState<'graph' | 'report'>('graph')
  const [selectedChain, setSelectedChain] = useState('ai')
  const [regionValue, setRegionValue] = useState<string[]>(['hubei', 'yichang'])
  const [searchDrawer, setSearchDrawer] = useState<SearchDrawerState>({
    visible: false, keyword: '', loading: false,
    orgs: [], orgTotal: 0, experts: [], expertTotal: 0, activeTab: 'orgs',
  })

  const handleSearch = useCallback((keyword: string) => {
    if (!keyword.trim()) return
    setSearchDrawer(prev => ({ ...prev, visible: true, keyword, loading: true, orgs: [], experts: [], orgTotal: 0, expertTotal: 0 }))

    // 并行搜企业和人才
    searchOrgs(keyword.trim(), 0, 20).then(res => {
      const d = res?.data as Record<string, unknown> | undefined
      const list = (d?.orgRecommend ?? []) as Record<string, unknown>[]
      const total = (d?.total as number) || list.length
      setSearchDrawer(prev => ({ ...prev, orgs: list, orgTotal: total }))
    }).catch(() => {})

    searchExperts(keyword.trim(), 0, 20).then(res => {
      const d = res?.data as Record<string, unknown> | undefined
      const sources = d?.sources as Record<string, unknown>[] | undefined
      const list = (d?.expertsRecommend ?? sources?.map((s) => (s.source || s) as Record<string, unknown>) ?? []) as Record<string, unknown>[]
      const total = (d?.total as number) || list.length
      setSearchDrawer(prev => ({ ...prev, experts: list, expertTotal: total, loading: false }))
    }).catch(() => {
      setSearchDrawer(prev => ({ ...prev, loading: false }))
    })

    message.info(`正在搜索"${keyword}"...`)
  }, [message])

  const labelMap = useMemo(() => buildLabelMap(regionOptions), [])

  const selectedCity = useMemo(() => {
    if (regionValue.length >= 2) {
      const label = labelMap[String(regionValue[1])] || ''
      // 去掉"市"后缀，如"宜昌市" → "宜昌"
      return label.replace(/市$/, '')
    }
    return ''
  }, [regionValue, labelMap])

  return (
    <div>
      <HeroSection
        backgroundImage={industryBg}
        searchPlaceholder="搜索产业链、产业环节、企业..."
        hotTags={hotTags}
        onSearch={handleSearch}
      />

      {/* Tab 栏 */}
      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div
            className={`${styles.tab} ${activeTab === 'graph' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('graph')}
          >
            产业图谱
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('report')}
          >
            产业报告
          </div>
        </div>

        <div className={styles.tabRight}>
          <span className={styles.filterLabel}>地区</span>
          <Cascader
            options={regionOptions}
            value={regionValue}
            onChange={(val) => setRegionValue(val || [])}
            size="small"
            style={{ width: 200 }}
            placeholder="选择地区"
          />
          <span className={styles.filterLabel}>产业链</span>
          <Select
            value={selectedChain}
            onChange={setSelectedChain}
            options={chainOptions}
            style={{ width: 200 }}
            size="small"
          />
        </div>
      </div>

      {/* 内容区 */}
      {activeTab === 'graph' ? (
        <div className={styles.graphSection}>
          <div className={styles.graphDesc}>
            当前产业链：{chainOptions.find(c => c.value === selectedChain)?.label} —
            展示上游原料 → 中游制造 → 下游应用的产业链全景结构，节点颜色标识强/弱/缺链状态。
          </div>
          <IndustryGraph
            chainKey={selectedChain}
            selectedCity={selectedCity}
            regionValue={regionValue}
          />
        </div>
      ) : (
        <IndustryReport />
      )}

      {/* 搜索结果抽屉 */}
      <Drawer
        title={<span><BankOutlined style={{ marginRight: 8 }} />搜索结果：{searchDrawer.keyword}</span>}
        open={searchDrawer.visible}
        onClose={() => setSearchDrawer(prev => ({ ...prev, visible: false }))}
        width={860}
        destroyOnClose
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div
            onClick={() => setSearchDrawer(prev => ({ ...prev, activeTab: 'orgs' }))}
            style={{ padding: '6px 20px', cursor: 'pointer', borderRadius: 4, fontSize: 14, fontWeight: searchDrawer.activeTab === 'orgs' ? 600 : 400, color: searchDrawer.activeTab === 'orgs' ? '#fff' : '#2468F2', background: searchDrawer.activeTab === 'orgs' ? '#2468F2' : '#f0f5ff' }}
          >
            <BankOutlined style={{ marginRight: 4 }} />企业 ({searchDrawer.orgTotal})
          </div>
          <div
            onClick={() => setSearchDrawer(prev => ({ ...prev, activeTab: 'experts' }))}
            style={{ padding: '6px 20px', cursor: 'pointer', borderRadius: 4, fontSize: 14, fontWeight: searchDrawer.activeTab === 'experts' ? 600 : 400, color: searchDrawer.activeTab === 'experts' ? '#fff' : '#2468F2', background: searchDrawer.activeTab === 'experts' ? '#2468F2' : '#f0f5ff' }}
          >
            <TeamOutlined style={{ marginRight: 4 }} />人才 ({searchDrawer.expertTotal})
          </div>
        </div>

        {searchDrawer.activeTab === 'orgs' ? (
          <Table
            loading={searchDrawer.loading}
            dataSource={searchDrawer.orgs}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={{ pageSize: 10, showTotal: () => `共 ${searchDrawer.orgTotal} 条` }}
            columns={[
              { title: '企业名称', dataIndex: 'NAME', key: 'name', ellipsis: true, render: (_, r: Record<string, unknown>) => String(r.NAME || r.name || '-') },
              { title: '地区', key: 'region', width: 100, render: (_, r: Record<string, unknown>) => `${r.PROV || ''}${r.CITY ? ' ' + r.CITY : ''}` },
              { title: '行业', dataIndex: 'INDUSTRY', key: 'ind', width: 180, render: (_, r: Record<string, unknown>) => ((r.INDUSTRY || []) as string[]).slice(0, 2).map((t, i) => <Tag key={i} color="blue" style={{ fontSize: 11 }}>{t.length > 8 ? t.slice(0, 8) + '...' : t}</Tag>) },
              { title: '标签', dataIndex: 'TAGS', key: 'tags', width: 160, render: (_, r: Record<string, unknown>) => ((r.TAGS || []) as string[]).slice(0, 2).map((t, i) => <Tag key={i} style={{ fontSize: 11 }}>{t}</Tag>) },
            ]}
          />
        ) : (
          <Table
            loading={searchDrawer.loading}
            dataSource={searchDrawer.experts}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={{ pageSize: 10, showTotal: () => `共 ${searchDrawer.expertTotal} 条` }}
            columns={[
              { title: '姓名', key: 'name', width: 80, render: (_, r: Record<string, unknown>) => String(r.CNAME || r.name || '-') },
              { title: '机构', key: 'org', ellipsis: true, render: (_, r: Record<string, unknown>) => String(r.AORG || r.org || '-') },
              { title: 'H指数', key: 'h', width: 65, render: (_, r: Record<string, unknown>) => <Tag color="blue">{String(r.H ?? '-')}</Tag> },
              { title: '论文', key: 'qikan', width: 55, render: (_, r: Record<string, unknown>) => String(r.QIKAN ?? '-') },
              { title: '专利', key: 'patent', width: 55, render: (_, r: Record<string, unknown>) => String(r.ZHUANLI ?? '-') },
            ]}
          />
        )}
      </Drawer>
    </div>
  )
}
