import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { App, Button, Cascader, Drawer, Select, Table, Tag } from 'antd'
import { BankOutlined, DownloadOutlined, TeamOutlined } from '@ant-design/icons'
import HeroSection from '@/components/HeroSection'
import IndustryGraph from './IndustryGraph'
import IndustryInnovationResources from './IndustryInnovationResources'
import IndustryReport from './IndustryReport'
import { regionOptions } from '@/mock/regions'
import { resolveIndustryRegionFromCascader } from '@/services/industryRegion'
import { searchIndustryFromSource } from '@/services/industrySource'
import { searchChainTalents } from '@/services/chainTalent'
import { searchOrgs } from '@/services/industry'
import { exportRecordsCsv } from '@/utils/exportCsv'
import {
  industryKeywordOptions,
  resolveIndustryKeywordOption,
  type IndustryKeywordOption,
} from '@/utils/industryKeywordOptions'
import {
  INDUSTRY_CHAIN_TREE,
  DEFAULT_PRIMARY_KEY,
  DEFAULT_SECONDARY_KEY,
  findPrimaryKeyByChainKey,
  getFirstEnabledSecondary,
} from '@/data/industryChainTree'
import industryBg from '@/assets/images/hero/industry-bg-plain.jpg'
import styles from './Industry.module.scss'

const hotTags = ['服务器制造', 'AI服务器整机', '锂离子电池', '热交换', '再生石墨', '电源模块', '辊压']

interface SearchDrawerState {
  visible: boolean
  keyword: string
  chain: string
  loading: boolean
  orgs: Record<string, unknown>[]
  orgTotal: number
  experts: Record<string, unknown>[]
  expertTotal: number
  activeTab: 'orgs' | 'experts'
}

export default function Industry() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const initialChain = searchParams.get('chain')
  const searchKeywordFromUrl = searchParams.get('q') ?? ''
  const initialSearchKeyword = searchKeywordFromUrl.trim()
  const [activeTab, setActiveTab] = useState<'graph' | 'innovation' | 'report'>(
    initialTab === 'innovation' || initialTab === 'report' ? initialTab : 'graph',
  )
  // 从 URL 初始化二级 chainKey（若有效）
  const initialSecondary = initialChain && findPrimaryKeyByChainKey(initialChain)
    ? initialChain
    : DEFAULT_SECONDARY_KEY
  const [selectedPrimary, setSelectedPrimary] = useState(
    findPrimaryKeyByChainKey(initialSecondary) ?? DEFAULT_PRIMARY_KEY,
  )
  const [selectedChain, setSelectedChain] = useState(initialSecondary)

  // 一级产业链下拉选项
  const primaryOptions = useMemo(
    () =>
      INDUSTRY_CHAIN_TREE.map((p) => ({
        value: p.key,
        label: p.label,
        disabled: !p.enabled,
      })),
    [],
  )

  // 二级产业链下拉选项（根据一级联动）
  const secondaryOptions = useMemo(() => {
    const primary = INDUSTRY_CHAIN_TREE.find((p) => p.key === selectedPrimary)
    if (!primary) return []
    return primary.secondaries.map((s) => ({
      value: s.key,
      label: s.label,
      disabled: !s.enabled,
    }))
  }, [selectedPrimary])

  const handlePrimaryChange = useCallback((value: string) => {
    setSelectedPrimary(value)
    // 切换一级时，自动选中该一级下第一个 enabled 的二级
    const firstEnabled = getFirstEnabledSecondary(value)
    if (firstEnabled) setSelectedChain(firstEnabled)
  }, [])
  const [regionValue, setRegionValue] = useState<string[]>(['hubei', 'yichang'])
  const [searchDrawer, setSearchDrawer] = useState<SearchDrawerState>({
    visible: false,
    keyword: '',
    chain: '',
    loading: false,
    orgs: [],
    orgTotal: 0,
    experts: [],
    expertTotal: 0,
    activeTab: 'orgs',
  })

  const selectedRegion = useMemo(() => resolveIndustryRegionFromCascader(regionValue), [regionValue])
  const selectedCity = selectedRegion.city || ''

  const loadSearchResults = useCallback((option: IndustryKeywordOption) => {
    void (async () => {
      const searchChain = option.chain.trim()
      const sourceResult = await searchIndustryFromSource(searchChain, selectedRegion).catch(() => null)
      const [orgResult, expertResult] = await Promise.allSettled([
        sourceResult
          ? Promise.resolve({
            data: {
              total: sourceResult.orgTotal,
              orgRecommend: sourceResult.orgs,
            },
          })
          : searchOrgs(searchChain, 0, 20, selectedRegion.city),
        searchChainTalents(searchChain, undefined, undefined, 1, 20),
      ])

      const orgData = orgResult.status === 'fulfilled'
        ? (orgResult.value?.data as Record<string, unknown> | undefined)
        : undefined
      const expertData = expertResult.status === 'fulfilled' ? expertResult.value : undefined

      setSearchDrawer((prev) => ({
        ...prev,
        loading: false,
        orgs: (orgData?.orgRecommend ?? []) as Record<string, unknown>[],
        orgTotal: Number(orgData?.total ?? 0),
        experts: expertData?.items ?? [],
        expertTotal: expertData?.total ?? 0,
      }))
    })()
  }, [selectedRegion])

  const handleSearchOptionSelect = useCallback((option: IndustryKeywordOption) => {
    const label = option.label.trim()
    const chain = option.chain.trim()
    if (!label || !chain) return

    setSearchDrawer((prev) => ({
      ...prev,
      visible: true,
      keyword: label,
      chain,
      loading: true,
      orgs: [],
      experts: [],
      orgTotal: 0,
      expertTotal: 0,
    }))

    message.info(`正在搜索“${label}”…`)
    loadSearchResults(option)
  }, [loadSearchResults, message])

  useEffect(() => {
    if (!initialSearchKeyword) return
    const option = resolveIndustryKeywordOption(initialSearchKeyword)
    if (!option) {
      message.warning('请先选择匹配的产业链关键词后搜索')
      return
    }

    const timer = window.setTimeout(() => {
      handleSearchOptionSelect(option)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [handleSearchOptionSelect, initialSearchKeyword, message])

  const openEnterpriseDetail = useCallback((record: Record<string, unknown>) => {
    const name = String(record.NAME || record.name || '未知企业')
    const id = String(record.ID || record.id || name)
    const params = new URLSearchParams({
      name,
      region: `${record.PROV || record.prov || ''}${record.CITY || record.city ? ` ${record.CITY || record.city}` : ''}`.trim(),
      tags: ((record.TAGS || record.tags || []) as string[]).join(','),
      back: '/industry',
    })
    navigate(`/industry/enterprise/${encodeURIComponent(id)}?${params.toString()}`)
  }, [navigate])

  const openTalentDetail = useCallback((record: Record<string, unknown>) => {
    const id = String(record.ID || record.id || record.auid || '')
    if (!id) return
    navigate(`/industry/talent/${encodeURIComponent(id)}`)
  }, [navigate])

  const handleExportSearchDrawerData = useCallback(() => {
    const isOrgTab = searchDrawer.activeTab === 'orgs'
    const records = isOrgTab ? searchDrawer.orgs : searchDrawer.experts
    const typeLabel = isOrgTab ? '企业' : '人才'
    exportRecordsCsv(records, `搜索-${searchDrawer.keyword}-${typeLabel}`)
    message.success(`已导出${typeLabel}列表`)
  }, [message, searchDrawer.activeTab, searchDrawer.experts, searchDrawer.keyword, searchDrawer.orgs])

  return (
    <div className={styles.page}>
      <HeroSection
        backgroundImage={industryBg}
        searchPlaceholder="输入产业链关键词，选择匹配项后搜索..."
        hotTags={hotTags}
        searchOptions={industryKeywordOptions}
        onSearchOptionSelect={handleSearchOptionSelect}
        variant="industry"
        titleLine1="摸清产业底数"
        titleLine2="让招引更精准、决策更高效"
      />

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div
            className={`${styles.tab} ${activeTab === 'graph' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('graph')}
          >
            产业图谱
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'innovation' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('innovation')}
          >
            创新资源
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('report')}
          >
            产业报告
          </div>
        </div>

        {activeTab === 'graph' && (
          <div className={styles.tabRight}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>地区：</span>
              <Cascader
                options={regionOptions}
                value={regionValue}
                onChange={(value) => setRegionValue((value || []) as string[])}
                size="small"
                style={{ width: 200 }}
                placeholder="选择地区"
              />
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>一级产业链：</span>
              <Select
                value={selectedPrimary}
                onChange={handlePrimaryChange}
                options={primaryOptions}
                style={{ width: 200 }}
                size="small"
              />
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>二级产业链：</span>
              <Select
                value={selectedChain}
                onChange={setSelectedChain}
                options={secondaryOptions}
                style={{ width: 200 }}
                size="small"
              />
            </div>
          </div>
        )}

        {activeTab === 'innovation' && (
          <div className={styles.tabRight}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>一级产业链：</span>
              <Select
                value={selectedPrimary}
                onChange={handlePrimaryChange}
                options={primaryOptions}
                style={{ width: 200 }}
                size="small"
              />
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>二级产业链：</span>
              <Select
                value={selectedChain}
                onChange={setSelectedChain}
                options={secondaryOptions}
                style={{ width: 200 }}
                size="small"
              />
            </div>
          </div>
        )}
      </div>

      {activeTab === 'graph' ? (
        <div className={styles.graphSection}>
          <div className={styles.graphDesc}>
            当前产业链：{
              INDUSTRY_CHAIN_TREE
                .flatMap((p) => p.secondaries)
                .find((s) => s.key === selectedChain)?.label
            }
            ，展示上游原料、中游制造、下游应用的产业链全景结构，节点颜色标识强链、弱链、缺链状态。
          </div>
          <IndustryGraph
            chainKey={selectedChain}
            selectedCity={selectedCity}
            regionValue={regionValue}
          />
        </div>
      ) : activeTab === 'innovation' ? (
        <IndustryInnovationResources chainKey={selectedChain} />
      ) : (
        <IndustryReport />
      )}

      <Drawer
        title={<span><BankOutlined style={{ marginRight: 8 }} />搜索结果：{searchDrawer.keyword}</span>}
        open={searchDrawer.visible}
        onClose={() => setSearchDrawer((prev) => ({ ...prev, visible: false }))}
        width={960}
        rootClassName={styles.industryDataDrawerRoot}
        destroyOnClose
      >
        <div className={styles.drawerIntro}>
          <div className={styles.drawerIntroTitle}>产业链节点介绍</div>
          <div className={styles.drawerIntroText}>
            围绕“{searchDrawer.chain || searchDrawer.keyword}”检索产业链相关企业与人才资源，展示匹配对象的区域、行业标签和科研能力，可用于进一步筛选招引目标与对接人才。
            {searchDrawer.chain && searchDrawer.chain !== searchDrawer.keyword ? ` 当前选项：${searchDrawer.keyword}。` : ''}
          </div>
        </div>

        <div className={styles.drawerToolbar}>
          <div className={styles.drawerTabs}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div
            onClick={() => setSearchDrawer((prev) => ({ ...prev, activeTab: 'orgs' }))}
            style={{
              padding: '6px 20px',
              cursor: 'pointer',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: searchDrawer.activeTab === 'orgs' ? 600 : 400,
              color: searchDrawer.activeTab === 'orgs' ? '#fff' : '#2468F2',
              background: searchDrawer.activeTab === 'orgs' ? '#2468F2' : '#f0f5ff',
            }}
          >
            <BankOutlined style={{ marginRight: 4 }} />
            企业 ({searchDrawer.orgTotal})
          </div>
          <div
            onClick={() => setSearchDrawer((prev) => ({ ...prev, activeTab: 'experts' }))}
            style={{
              padding: '6px 20px',
              cursor: 'pointer',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: searchDrawer.activeTab === 'experts' ? 600 : 400,
              color: searchDrawer.activeTab === 'experts' ? '#fff' : '#2468F2',
              background: searchDrawer.activeTab === 'experts' ? '#2468F2' : '#f0f5ff',
            }}
          >
            <TeamOutlined style={{ marginRight: 4 }} />
            人才 ({searchDrawer.expertTotal})
          </div>
        </div>
          </div>
          <Button
            icon={<DownloadOutlined />}
            disabled={(searchDrawer.activeTab === 'orgs' ? searchDrawer.orgs : searchDrawer.experts).length === 0}
            onClick={handleExportSearchDrawerData}
          >
            批量导出
          </Button>
        </div>

        {searchDrawer.activeTab === 'orgs' ? (
          <Table
            className={styles.drawerTable}
            loading={searchDrawer.loading}
            dataSource={searchDrawer.orgs}
            rowKey={(_, index) => String(index)}
            size="small"
            onRow={(record) => ({
              onClick: () => openEnterpriseDetail(record),
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showTotal: () => `共 ${searchDrawer.orgTotal} 条` }}
            columns={[
              {
                title: '企业名称',
                dataIndex: 'NAME',
                key: 'name',
                ellipsis: true,
                render: (_value, record: Record<string, unknown>) => String(record.NAME || '-'),
              },
              {
                title: '地区',
                key: 'region',
                width: 120,
                render: (_value, record: Record<string, unknown>) =>
                  `${record.PROV || ''}${record.CITY ? ` ${record.CITY}` : ''}`,
              },
              {
                title: '行业',
                dataIndex: 'INDUSTRY',
                key: 'industry',
                width: 180,
                render: (_value, record: Record<string, unknown>) =>
                  ((record.INDUSTRY || []) as string[])
                    .slice(0, 2)
                    .map((item, index) => (
                      <Tag key={index} color="blue" style={{ fontSize: 12, lineHeight: '20px', padding: '0 7px', borderRadius: 10 }}>
                        {item.length > 8 ? `${item.slice(0, 8)}...` : item}
                      </Tag>
                    )),
              },
              {
                title: '标签',
                dataIndex: 'TAGS',
                key: 'tags',
                width: 160,
                render: (_value, record: Record<string, unknown>) =>
                  ((record.TAGS || []) as string[])
                    .slice(0, 2)
                    .map((item, index) => (
                      <Tag key={index} style={{ fontSize: 12, lineHeight: '20px', padding: '0 7px', borderRadius: 10 }}>
                        {item}
                      </Tag>
                    )),
              },
            ]}
          />
        ) : (
          <Table
            className={styles.drawerTable}
            loading={searchDrawer.loading}
            dataSource={searchDrawer.experts}
            rowKey={(_, index) => String(index)}
            size="small"
            onRow={(record) => ({
              onClick: () => openTalentDetail(record),
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showTotal: () => `共 ${searchDrawer.expertTotal} 条` }}
            columns={[
              {
                title: '姓名',
                key: 'name',
                width: 80,
                render: (_value, record: Record<string, unknown>) => String(record.CNAME || '-'),
              },
              {
                title: '机构',
                key: 'org',
                ellipsis: true,
                render: (_value, record: Record<string, unknown>) => String(record.AORG || '-'),
              },
              {
                title: 'H指数',
                key: 'h',
                width: 70,
                render: (_value, record: Record<string, unknown>) => <Tag color="blue" style={{ fontSize: 13, minWidth: 36, textAlign: 'center', borderRadius: 10 }}>{String(record.H ?? '-')}</Tag>,
              },
              {
                title: '论文',
                key: 'qikan',
                width: 60,
                render: (_value, record: Record<string, unknown>) => String(record.QIKAN ?? '-'),
              },
              {
                title: '专利',
                key: 'patent',
                width: 60,
                render: (_value, record: Record<string, unknown>) => String(record.ZHUANLI ?? '-'),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  )
}
