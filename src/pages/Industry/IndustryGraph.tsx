import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Button, Tag, Spin, Drawer, Cascader, Table } from 'antd'
import {
  AlertOutlined,
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  LoadingOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import IndustryChainGraph from '@/components/IndustryTree'
import { industryChainGraphData } from '@/mock/industryChainGraphData'
import { searchOrgs } from '@/services/industry'
import { searchExperts } from '@/services/talent'
import { regionOptions } from '@/mock/regions'
import industryKeywords from '@/data/industry-keywords.json'
import { orgDrawerColumns, expertDrawerColumns } from '@/components/IndustryDrawerColumns'
import styles from './Industry.module.scss'

interface IndustryGraphProps {
  chainKey: string
  selectedCity?: string
  regionValue?: (string | number)[]
}

const chainKeyToLabel: Record<string, string> = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
}

// 链上企业/人才搜索用宽关键词（原名在万方库匹配度低）
const chainKeyToSearchKey: Record<string, string> = {
  wetchem: '电子化学品 OR 半导体材料 OR 湿电子',
  newenergy: '新能源 OR 新材料 OR 电池 OR 储能',
  pharma: '制药 OR 仿制药 OR 生物医药 OR 药物制剂',
  yeast: '酵母 OR 发酵 OR 生物工程 OR 功能食品',
  ship: '船舶 OR 造船 OR 航运 OR 船舶制造',
  ai: '人工智能',
}

// 构建 cascader value->label 映射
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

function getCityFromCascader(val: (string | number)[]): string {
  if (val.length >= 2) {
    const label = regionLabelMap[String(val[1])] || ''
    return label.replace(/市$/, '')
  }
  return ''
}

// ---------- 链上企业/人才的数据类型 ----------
interface ChainListState {
  loading: boolean
  orgs: Record<string, unknown>[]
  orgTotal: number
  localOrgTotal: number
  experts: Record<string, unknown>[]
  expertTotal: number
}

// ---------- 抽屉状态 ----------
interface ChainDrawerState {
  visible: boolean
  type: 'orgs' | 'experts'
  city: string
  regionValue: (string | number)[]
  loading: boolean
  data: Record<string, unknown>[]
  total: number
  page: number
}

// "全国"选项
const allRegionOptions = [
  { value: '__all__', label: '全国' },
  ...regionOptions,
]

// 表格列定义使用共享组件 orgDrawerColumns / expertDrawerColumns

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

  // ========== 链上企业/人才（默认使用地区选择器的城市） ==========
  const [chainList, setChainList] = useState<ChainListState>({
    loading: false, orgs: [], orgTotal: 0, localOrgTotal: 0, experts: [], expertTotal: 0,
  })
  const chainListAbortRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    chainListAbortRef.current?.abort()

    debounceTimerRef.current = setTimeout(() => {
      if (!chainLabel) return

      const ac = new AbortController()
      chainListAbortRef.current = ac

      setChainList({ loading: true, orgs: [], orgTotal: 0, localOrgTotal: 0, experts: [], expertTotal: 0 })

      Promise.all([
        searchOrgs(chainSearchKey, 0, 10, localCity).catch(() => null),    // 本地企业（列表+total）
        searchOrgs(chainSearchKey, 0, 1).catch(() => null),                // 全国企业（仅取total算本地化率）
        searchExperts(chainSearchKey, 0, 10, localCity).catch(() => null),  // 本地人才（列表+total）
      ]).then(([localOrgRes, allOrgRes, localExpertRes]) => {
        if (ac.signal.aborted) return

        const localOrgData = localOrgRes?.data as Record<string, unknown> | undefined
        const orgList = (localOrgData?.orgRecommend ?? []) as Record<string, unknown>[]
        const localOrgTotal = (localOrgData?.total as number) || orgList.length

        const allOrgData = allOrgRes?.data as Record<string, unknown> | undefined
        const orgTotal = (allOrgData?.total as number) || 0

        const localExpertData = localExpertRes?.data as Record<string, unknown> | undefined
        const expertList = (localExpertData?.expertsRecommend ?? []) as Record<string, unknown>[]
        const expertTotal = (localExpertData?.total as number) || expertList.length

        setChainList({ loading: false, orgs: orgList, orgTotal, localOrgTotal, experts: expertList, expertTotal })
      }).catch(() => {
        if (ac.signal.aborted) return
        setChainList({ loading: false, orgs: [], orgTotal: 0, localOrgTotal: 0, experts: [], expertTotal: 0 })
      })
    }, 500)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      chainListAbortRef.current?.abort()
    }
  }, [chainSearchKey, localCity])

  // ========== 链上抽屉（查看全部企业/人才） ==========
  const [chainDrawer, setChainDrawer] = useState<ChainDrawerState>({
    visible: false, type: 'orgs', city: '', regionValue: [],
    loading: false, data: [], total: 0, page: 1,
  })

  const loadChainDrawerData = useCallback((type: 'orgs' | 'experts', city: string, page: number) => {
    setChainDrawer(d => ({ ...d, loading: true }))
    const from = (page - 1) * 10

    const fetcher = type === 'orgs'
      ? searchOrgs(chainSearchKey, from, 10, city || undefined)
      : searchExperts(chainSearchKey, from, 10, city || undefined)

    fetcher.then(res => {
      const d = res?.data as Record<string, unknown> | undefined
      const list = (d?.orgRecommend ?? d?.expertsRecommend ?? []) as Record<string, unknown>[]
      const total = (d?.total as number) || list.length
      setChainDrawer(prev => ({ ...prev, loading: false, data: list, total, page }))
    }).catch(() => {
      setChainDrawer(prev => ({ ...prev, loading: false, data: [], total: 0 }))
    })
  }, [chainSearchKey])

  const openChainDrawer = useCallback((type: 'orgs' | 'experts') => {
    const city = localCity
    const rv = externalRegionValue || ['hubei', 'yichang']
    setChainDrawer({
      visible: true, type, city, regionValue: rv,
      loading: true, data: [], total: 0, page: 1,
    })
    loadChainDrawerData(type, city, 1)
  }, [localCity, externalRegionValue, loadChainDrawerData])

  const handleChainDrawerRegionChange = useCallback((val: (string | number)[]) => {
    if (!val || val.length === 0 || val[0] === '__all__') {
      setChainDrawer(prev => {
        loadChainDrawerData(prev.type, '', 1)
        return { ...prev, city: '', regionValue: [], page: 1 }
      })
    } else {
      const newCity = getCityFromCascader(val)
      setChainDrawer(prev => {
        loadChainDrawerData(prev.type, newCity, 1)
        return { ...prev, city: newCity, regionValue: val, page: 1 }
      })
    }
  }, [loadChainDrawerData])

  if (!graphData) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无该产业链图谱数据</div>
  }

  // 本地化率
  const localizationRate = chainList.orgTotal > 0
    ? ((chainList.localOrgTotal / chainList.orgTotal) * 100)
    : 0
  const localizationRateStr = localizationRate > 0 ? localizationRate.toFixed(1) : '0'

  return (
    <div className={styles.graphLayout}>
      {/* 左列：图谱 + 链上企业 */}
      <div className={styles.leftColumn}>
        <div className={styles.graphArea}>
          <div className={styles.legend}>
            <span><span className={styles.legendDot} style={{ background: '#2468F2' }} /> 强链</span>
            <span><span className={styles.legendDot} style={{ background: '#7BA3FA' }} /> 弱链</span>
            <span><span className={styles.legendDot} style={{ background: '#BFC8D6' }} /> 缺链</span>
          </div>
          <IndustryChainGraph
            key={chainKey}
            graphData={graphData}
            nodeKeywords={nodeKeywords}
            selectedCity={selectedCity}
            regionValue={externalRegionValue}
          />
        </div>

        {/* 链上企业 */}
        <div className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <BankOutlined className={styles.icon} />
              链上企业{chainList.localOrgTotal > 0 && <span style={{ color: '#999', fontWeight: 400, fontSize: 13, marginLeft: 4 }}>({localCity} {chainList.localOrgTotal}家)</span>}
            </div>
            <Button type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>
          {chainList.loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin indicator={<LoadingOutlined spin />} />
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>加载中...</div>
            </div>
          ) : chainList.orgs.length > 0 ? (
            <div className={styles.enterpriseGrid}>
              <table className={styles.enterpriseTable}>
                <thead><tr><th>企业</th><th>地区</th></tr></thead>
                <tbody>
                  {chainList.orgs.slice(0, 5).map((o, i) => (
                    <tr key={i}>
                      <td title={String(o.NAME || o.name || '')} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(o.NAME || o.name || '未知')}
                      </td>
                      <td>{String(o.PROV || o.prov || '')}{o.CITY || o.city ? ` ${o.CITY || o.city}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className={styles.enterpriseTable}>
                <thead><tr><th>企业</th><th>地区</th></tr></thead>
                <tbody>
                  {chainList.orgs.slice(5, 10).map((o, i) => (
                    <tr key={i}>
                      <td title={String(o.NAME || o.name || '')} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(o.NAME || o.name || '未知')}
                      </td>
                      <td>{String(o.PROV || o.prov || '')}{o.CITY || o.city ? ` ${o.CITY || o.city}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#999', fontSize: 13 }}>暂无{localCity}企业数据</div>
          )}
          <div className={styles.viewAll} onClick={() => openChainDrawer('orgs')} style={{ cursor: 'pointer' }}>查看全部企业 &gt;</div>
        </div>
      </div>

      {/* 右列：预警系数 + 本地化率 + 链上人才 */}
      <div className={styles.sidePanel}>
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <AlertOutlined className={styles.icon} />
            预警系数
          </div>
          <div className={styles.statValue}>
            72.5
            <span className={`${styles.statTrend} ${styles.up}`}>
              <ArrowUpOutlined /> 3.2%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '72.5%', background: '#F26B4A' }} />
          </div>
          <div className={styles.statSub}>较上月下降3.2%，需关注缺链环节</div>
        </div>

        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <HomeOutlined className={styles.icon} />
            本地化率
          </div>
          <div className={styles.statValue} style={{ color: '#2468F2' }}>
            {chainList.loading ? '...' : `${localizationRateStr}%`}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min(localizationRate, 100)}%` }} />
          </div>
          <div className={styles.statSub}>
            {localCity}企业 {chainList.localOrgTotal} 家 / 全国 {chainList.orgTotal} 家
          </div>
        </div>

        <div className={styles.panelCard} style={{ flex: 1 }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <TeamOutlined className={styles.icon} />
              链上人才
            </div>
            <Button type="primary" size="small" icon={<PlusOutlined />}>批量加入清单</Button>
          </div>
          {chainList.expertTotal > 0 && (
            <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>{localCity} 共 {chainList.expertTotal.toLocaleString()} 位</div>
          )}
          {chainList.loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin indicator={<LoadingOutlined spin />} />
              <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>加载中...</div>
            </div>
          ) : chainList.experts.length > 0 ? (
            <table className={styles.talentTable}>
              <thead>
                <tr><th>人才</th><th>机构</th><th>H指数</th></tr>
              </thead>
              <tbody>
                {chainList.experts.slice(0, 8).map((e, i) => (
                  <tr key={i}>
                    <td>{String(e.CNAME || e.name || '未知')}</td>
                    <td title={String(e.AORG || e.org || '')} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(e.AORG || e.org || '')}
                    </td>
                    <td><Tag color="blue">{String(e.H ?? '-')}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#999', fontSize: 13 }}>暂无{localCity}人才数据</div>
          )}
          <div className={styles.viewAll} onClick={() => openChainDrawer('experts')} style={{ cursor: 'pointer' }}>查看全部人才 &gt;</div>
        </div>
      </div>

      {/* ========== 链上抽屉（查看全部企业/人才） ========== */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {chainDrawer.type === 'orgs' ? <BankOutlined /> : <TeamOutlined />}
            <span>{chainLabel} - {chainDrawer.type === 'orgs' ? '链上企业' : '链上人才'}</span>
            {chainDrawer.total > 0 && <Tag color="blue">{chainDrawer.total.toLocaleString()}</Tag>}
          </div>
        }
        open={chainDrawer.visible}
        onClose={() => setChainDrawer(d => ({ ...d, visible: false }))}
        width={860}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#2468F2' }} />
          <span style={{ fontSize: 13, color: '#666' }}>地区筛选：</span>
          <Cascader
            options={allRegionOptions}
            value={chainDrawer.regionValue.length > 0 ? chainDrawer.regionValue : ['__all__']}
            onChange={(val) => handleChainDrawerRegionChange(val || [])}
            changeOnSelect
            size="small"
            style={{ width: 220 }}
            placeholder="选择地区"
          />
        </div>

        <Table
          columns={chainDrawer.type === 'orgs' ? orgDrawerColumns : expertDrawerColumns}
          dataSource={chainDrawer.data}
          rowKey={(_, i) => String(i)}
          loading={chainDrawer.loading}
          size="small"
          pagination={{
            current: chainDrawer.page,
            total: Math.min(chainDrawer.total, 100),
            pageSize: 10,
            showSizeChanger: false,
            showTotal: () => `共 ${chainDrawer.total.toLocaleString()} 条`,
            onChange: (p) => {
              loadChainDrawerData(chainDrawer.type, chainDrawer.city, p)
              setChainDrawer(prev => ({ ...prev, page: p }))
            },
          }}
        />
      </Drawer>
    </div>
  )
}
