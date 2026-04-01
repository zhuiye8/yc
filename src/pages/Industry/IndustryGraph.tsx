import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Button, Tag, Spin, Drawer, Cascader, Table } from 'antd'
import {
  TeamOutlined,
  BankOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  LoadingOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import IndustryChainGraph from '@/components/IndustryTree'
import { industryChainGraphData } from '@/mock/industryChainGraphData'
import { getChainCoverage, clearCoverageCache } from '@/services/coverageCache'
import { getChainAggregate, clearChainAggregateCache } from '@/services/industryChainAggregation'
import { regionOptions } from '@/mock/regions'
import industryKeywords from '@/data/industry-keywords.json'
import { orgDrawerColumns, expertDrawerColumns } from '@/components/IndustryDrawerColumns'
import industryWarningScoreIcon from '@/assets/images/icons/industry-warning-score-icon.png'
import industryLocalizationRateIcon from '@/assets/images/icons/industry-localization-rate-icon.png'
import industryChainEnterprisesIcon from '@/assets/images/icons/industry-chain-enterprises-icon.png'
import industryChainTalentsIcon from '@/assets/images/icons/industry-chain-talents-icon.png'
import styles from './Industry.module.scss'

interface IndustryGraphProps {
  chainKey: string
  selectedCity?: string
  regionValue?: string[]
}

interface ChainListState {
  loading: boolean
  orgs: Record<string, unknown>[]
  orgTotal: number
  localOrgTotal: number
  experts: Record<string, unknown>[]
  expertTotal: number
}

interface ChainDrawerState {
  visible: boolean
  type: 'orgs' | 'experts'
  city: string
  regionValue: string[]
  loading: boolean
  data: Record<string, unknown>[]
  total: number
  page: number
}

const chainKeyToLabel: Record<string, string> = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
}

const chainKeyToSearchKey: Record<string, string> = {
  wetchem: '电子化学品 OR 半导体材料 OR 湿电子化学品',
  newenergy: '新能源 OR 新材料 OR 电池 OR 储能',
  pharma: '制药 OR 仿制药 OR 生物医药 OR 药物制剂',
  yeast: '酵母 OR 发酵 OR 生物工程 OR 功能食品',
  ship: '船舶 OR 造船 OR 航运 OR 智能船舶',
  ai: '人工智能',
}

function buildLabelMap(options: typeof regionOptions): Record<string, string> {
  const map: Record<string, string> = {}
  const walk = (items: typeof regionOptions) => {
    items?.forEach((item) => {
      if (item.value && item.label) map[String(item.value)] = String(item.label)
      if (item.children) walk(item.children as typeof regionOptions)
    })
  }
  walk(options)
  return map
}

const regionLabelMap = buildLabelMap(regionOptions)

function getCityFromCascader(val: string[]): string {
  if (val.length >= 2) {
    const label = regionLabelMap[String(val[1])] || ''
    return label.replace(/市$/, '')
  }
  return ''
}

const allRegionOptions = [
  { value: '__all__', label: '全国' },
  ...regionOptions,
]

export default function IndustryGraph({ chainKey, selectedCity, regionValue: externalRegionValue }: IndustryGraphProps) {
  const graphData = useMemo(() => industryChainGraphData[chainKey], [chainKey])

  const nodeKeywords = useMemo(() => {
    const chainLabel = chainKeyToLabel[chainKey]
    if (!chainLabel) return undefined
    return (industryKeywords as Record<string, Record<string, { keywords: string[]; queryString: string }>>)[chainLabel]
  }, [chainKey])

  const chainLabel = chainKeyToLabel[chainKey] || ''
  const chainSearchKey = chainKeyToSearchKey[chainKey] || chainLabel
  const localCity = selectedCity || '宜昌'

  const [coverageState, setCoverageState] = useState<{
    loading: boolean
    checked: number
    covered: number
    total: number
    rate: number
    chainStatus: 'strong' | 'weak' | 'missing'
    chainOrgTotal: number
    nodeOrgCounts: Record<string, number>
  }>({
    loading: false,
    checked: 0,
    covered: 0,
    total: 0,
    rate: 0,
    chainStatus: 'strong',
    chainOrgTotal: 0,
    nodeOrgCounts: {},
  })

  useEffect(() => {
    if (!nodeKeywords || !chainSearchKey) return

    const nodeCount = Object.keys(nodeKeywords).length
    setCoverageState((prev) => ({
      ...prev,
      loading: true,
      checked: 0,
      covered: 0,
      total: nodeCount,
      nodeOrgCounts: {},
    }))

    let cancelled = false

    getChainCoverage(
      chainKey,
      nodeKeywords,
      chainSearchKey,
      localCity,
      (checked, total) => {
        if (!cancelled) {
          setCoverageState((prev) => ({ ...prev, checked, total }))
        }
      },
    )
      .then((result) => {
        if (cancelled) return
        setCoverageState({
          loading: false,
          checked: result.total,
          covered: result.covered,
          total: result.total,
          rate: result.rate,
          chainStatus: result.chainStatus,
          chainOrgTotal: result.chainOrgTotal,
          nodeOrgCounts: result.nodeOrgCounts,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setCoverageState((prev) => ({ ...prev, loading: false }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [chainKey, chainSearchKey, localCity, nodeKeywords])

  useEffect(() => {
    clearCoverageCache()
    clearChainAggregateCache(chainKey)
  }, [chainKey, localCity])

  const [chainList, setChainList] = useState<ChainListState>({
    loading: false,
    orgs: [],
    orgTotal: 0,
    localOrgTotal: 0,
    experts: [],
    expertTotal: 0,
  })
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    let cancelled = false

    debounceTimerRef.current = setTimeout(() => {
      if (!nodeKeywords) {
        setChainList({
          loading: false,
          orgs: [],
          orgTotal: 0,
          localOrgTotal: 0,
          experts: [],
          expertTotal: 0,
        })
        return
      }

      setChainList({
        loading: true,
        orgs: [],
        orgTotal: 0,
        localOrgTotal: 0,
        experts: [],
        expertTotal: 0,
      })

      if (coverageState.loading) return

      void (async () => {
        const orgAggregate = await getChainAggregate(chainKey, 'orgs', nodeKeywords, localCity).catch(() => ({ items: [], total: 0 }))
        if (cancelled) return

        const expertAggregate = await getChainAggregate(chainKey, 'experts', nodeKeywords, localCity).catch(() => ({ items: [], total: 0 }))
        if (cancelled) return

        setChainList({
          loading: false,
          orgs: orgAggregate.items,
          orgTotal: orgAggregate.total,
          localOrgTotal: orgAggregate.total,
          experts: expertAggregate.items,
          expertTotal: expertAggregate.total,
        })
      })()
    }, 500)

    return () => {
      cancelled = true
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [chainKey, coverageState.loading, localCity, nodeKeywords])

  const [chainDrawer, setChainDrawer] = useState<ChainDrawerState>({
    visible: false,
    type: 'orgs',
    city: '',
    regionValue: [],
    loading: false,
    data: [],
    total: 0,
    page: 1,
  })

  const loadChainDrawerData = useCallback((type: 'orgs' | 'experts', city: string, page: number) => {
    setChainDrawer((prev) => ({ ...prev, loading: true }))
    if (!nodeKeywords) {
      setChainDrawer((prev) => ({ ...prev, loading: false, data: [], total: 0, page }))
      return
    }

    const request = type === 'orgs'
      ? getChainAggregate(chainKey, 'orgs', nodeKeywords, city || undefined)
      : getChainAggregate(chainKey, 'experts', nodeKeywords, city || undefined)

    request
      .then((result) => {
        const from = (page - 1) * 10
        const list = result.items.slice(from, from + 10)
        setChainDrawer((prev) => ({ ...prev, loading: false, data: list, total: result.total, page }))
      })
      .catch(() => {
        setChainDrawer((prev) => ({ ...prev, loading: false, data: [], total: 0 }))
      })
  }, [chainKey, nodeKeywords])

  const openChainDrawer = useCallback((type: 'orgs' | 'experts') => {
    const city = localCity
    const region = externalRegionValue || ['hubei', 'yichang']
    setChainDrawer({
      visible: true,
      type,
      city,
      regionValue: region,
      loading: true,
      data: [],
      total: 0,
      page: 1,
    })
    loadChainDrawerData(type, city, 1)
  }, [externalRegionValue, loadChainDrawerData, localCity])

  const handleChainDrawerRegionChange = useCallback((val: string[]) => {
    if (!val || val.length === 0 || val[0] === '__all__') {
      setChainDrawer((prev) => {
        loadChainDrawerData(prev.type, '', 1)
        return { ...prev, city: '', regionValue: [], page: 1 }
      })
      return
    }

    const nextCity = getCityFromCascader(val)
    setChainDrawer((prev) => {
      loadChainDrawerData(prev.type, nextCity, 1)
      return { ...prev, city: nextCity, regionValue: val, page: 1 }
    })
  }, [loadChainDrawerData])

  if (!graphData) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无该产业链图谱数据</div>
  }

  const localizationRate = coverageState.rate
  const localizationRateStr = localizationRate > 0 ? localizationRate.toFixed(1) : '0'
  const chainListLoadingText = coverageState.loading
    ? `正在统计${localCity}最小子节点，请稍候...`
    : '正在按最小子节点汇总链上企业和链上人才...'
  const analysisLabel = coverageState.loading
    ? `正在统计${localCity}强弱缺链（${coverageState.checked}/${coverageState.total}）`
    : undefined

  return (
    <div className={styles.graphLayout}>
      <div className={styles.leftColumn}>
        <div className={styles.graphArea}>
          <div className={styles.legend}>
            <span><span className={styles.legendDot} style={{ background: '#2468F2' }} /> 强链</span>
            <span><span className={styles.legendDot} style={{ background: '#7BA3FA' }} /> 弱链</span>
            <span><span className={styles.legendDot} style={{ background: '#BFC8D6' }} /> 缺链</span>
            {coverageState.loading && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  color: '#faad14',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <LoadingOutlined spin style={{ fontSize: 12 }} />
                正在统计{localCity}强弱缺链（{coverageState.checked}/{coverageState.total}）
              </span>
            )}
          </div>

          <IndustryChainGraph
            key={chainKey}
            graphData={graphData}
            nodeKeywords={nodeKeywords}
            selectedCity={selectedCity}
            regionValue={externalRegionValue}
            nodeOrgCounts={coverageState.nodeOrgCounts}
            analyzing={coverageState.loading}
            analysisLabel={analysisLabel}
          />
        </div>

        <div className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <img src={industryChainEnterprisesIcon} alt="" className={styles.sectionIconImage} />
              链上企业
              {chainList.localOrgTotal > 0 && (
                <span style={{ color: '#999', fontWeight: 400, fontSize: 13, marginLeft: 4 }}>
                  （{localCity} {chainList.localOrgTotal}家）
                </span>
              )}
            </div>
            <Button className={styles.listAddButton} type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>

          {chainList.loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin indicator={<LoadingOutlined spin />} />
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>{chainListLoadingText}</div>
            </div>
          ) : chainList.orgs.length > 0 ? (
            <div className={styles.enterpriseGrid}>
              <table className={styles.enterpriseTable}>
                <thead>
                  <tr>
                    <th>企业</th>
                    <th>地区</th>
                  </tr>
                </thead>
                <tbody>
                  {chainList.orgs.slice(0, 5).map((org, index) => (
                    <tr key={index}>
                      <td title={String(org.NAME || org.name || '')} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(org.NAME || org.name || '未知')}
                      </td>
                      <td>{String(org.PROV || org.prov || '')}{org.CITY || org.city ? ` ${org.CITY || org.city}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className={styles.enterpriseTable}>
                <thead>
                  <tr>
                    <th>企业</th>
                    <th>地区</th>
                  </tr>
                </thead>
                <tbody>
                  {chainList.orgs.slice(5, 10).map((org, index) => (
                    <tr key={index}>
                      <td title={String(org.NAME || org.name || '')} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(org.NAME || org.name || '未知')}
                      </td>
                      <td>{String(org.PROV || org.prov || '')}{org.CITY || org.city ? ` ${org.CITY || org.city}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#999', fontSize: 13 }}>暂无{localCity}企业数据</div>
          )}

          <div className={styles.viewAll} onClick={() => openChainDrawer('orgs')} style={{ cursor: 'pointer' }}>
            查看全部企业 &gt;
          </div>
        </div>
      </div>

      <div className={styles.sidePanel}>
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <img src={industryWarningScoreIcon} alt="" className={styles.iconImage} />
            预警系数
          </div>
          <div className={styles.statValue}>
            72.5
            <span className={`${styles.statTrend} ${styles.up}`}>
              <ArrowUpOutlined /> 3.2%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '72.5%', background: 'linear-gradient(90deg, #ffbf17, #fa5319)' }} />
          </div>
          <div className={styles.statSub}>较上月下降 3.2%，需重点关注缺链环节</div>
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <img src={industryLocalizationRateIcon} alt="" className={styles.iconImage} />
            本地化率（节点覆盖）
          </div>
          <div className={styles.statValue} style={{ color: '#2468F2' }}>
            {coverageState.loading ? (
              <span style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spin indicator={<LoadingOutlined spin style={{ fontSize: 16 }} />} />
                分析中 {coverageState.checked}/{coverageState.total}
              </span>
            ) : (
              `${localizationRateStr}%`
            )}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: coverageState.loading
                  ? `${coverageState.total > 0 ? (coverageState.checked / coverageState.total) * 100 : 0}%`
                  : `${Math.min(localizationRate, 100)}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div className={styles.statSub}>
            {coverageState.loading
              ? `正在分析${localCity}产业覆盖情况...`
              : `${localCity}覆盖 ${coverageState.covered} / ${coverageState.total} 个产业节点`}
          </div>
        </div>

        <div className={styles.panelCard} style={{ flex: 1 }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <img src={industryChainTalentsIcon} alt="" className={styles.sectionIconImage} />
              链上人才
            </div>
            <Button className={styles.listAddButton} type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>

          {chainList.expertTotal > 0 && (
            <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>{localCity} 共 {chainList.expertTotal.toLocaleString()} 位</div>
          )}

          {chainList.loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin indicator={<LoadingOutlined spin />} />
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>{chainListLoadingText}</div>
            </div>
          ) : chainList.experts.length > 0 ? (
            <table className={styles.talentTable}>
              <thead>
                <tr>
                  <th>人才</th>
                  <th>机构</th>
                  <th>H指数</th>
                </tr>
              </thead>
              <tbody>
                {chainList.experts.slice(0, 8).map((expert, index) => (
                  <tr key={index}>
                    <td>{String(expert.CNAME || expert.name || '未知')}</td>
                    <td title={String(expert.AORG || expert.org || '')} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(expert.AORG || expert.org || '')}
                    </td>
                    <td><Tag color="blue">{String(expert.H ?? '-')}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#999', fontSize: 13 }}>暂无{localCity}人才数据</div>
          )}

          <div className={styles.viewAll} onClick={() => openChainDrawer('experts')} style={{ cursor: 'pointer' }}>
            查看全部人才 &gt;
          </div>
        </div>
      </div>

      <Drawer
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {chainDrawer.type === 'orgs' ? <BankOutlined /> : <TeamOutlined />}
            <span>{chainLabel} - {chainDrawer.type === 'orgs' ? '链上企业' : '链上人才'}</span>
            {chainDrawer.total > 0 && <Tag color="blue">{chainDrawer.total.toLocaleString()}</Tag>}
          </div>
        )}
        open={chainDrawer.visible}
        onClose={() => setChainDrawer((prev) => ({ ...prev, visible: false }))}
        width={860}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#2468F2' }} />
          <span style={{ fontSize: 13, color: '#666' }}>地区筛选：</span>
          <Cascader
            options={allRegionOptions}
            value={chainDrawer.regionValue.length > 0 ? chainDrawer.regionValue : ['__all__']}
            onChange={(val) => handleChainDrawerRegionChange((val || []) as string[])}
            changeOnSelect
            size="small"
            style={{ width: 220 }}
            placeholder="选择地区"
          />
        </div>

        <Table
          columns={chainDrawer.type === 'orgs' ? orgDrawerColumns : expertDrawerColumns}
          dataSource={chainDrawer.data}
          rowKey={(_, index) => String(index)}
          loading={chainDrawer.loading}
          size="small"
          pagination={{
            current: chainDrawer.page,
            total: Math.min(chainDrawer.total, 100),
            pageSize: 10,
            showSizeChanger: false,
            showTotal: () => `共 ${chainDrawer.total.toLocaleString()} 条`,
            onChange: (page) => {
              loadChainDrawerData(chainDrawer.type, chainDrawer.city, page)
              setChainDrawer((prev) => ({ ...prev, page }))
            },
          }}
        />
      </Drawer>
    </div>
  )
}
