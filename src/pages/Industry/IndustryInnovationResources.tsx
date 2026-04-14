import { useCallback, useEffect, useMemo, useState } from 'react'
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import {
  getIndustryInnovationList,
  getIndustryInnovationOverview,
  getInnovationExpertList,
  getInnovationOrgList,
} from '@/services/industryInnovationResources'
import {
  industryInnovationChainLabels,
  innovationMetricLabels,
  innovationMetricToCategory,
  type InnovationListCategoryKey,
  type InnovationListItem,
  type InnovationListResult,
  type InnovationMetricKey,
  type InnovationOverviewData,
} from '@/mock/industryInnovationResources'
import IndustryInnovationList from './IndustryInnovationList'
import IndustryInnovationMap from './IndustryInnovationMap'
import IndustryInnovationOverview from './IndustryInnovationOverview'
import styles from './IndustryInnovationResources.module.scss'

interface Props {
  chainKey: string
}

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

function mapApiItemToListItem(item: Record<string, unknown>, idx: number, isTalent: boolean): InnovationListItem {
  if (isTalent) {
    const name = String(item.CNAME ?? item.name ?? '未知')
    const org = String(item.AORG ?? item.ORG ?? item.org ?? '')
    const direction = String(item.DIRECTION ?? item.direction ?? '')
    const h = Number(item.H ?? 0)
    const papers = Number(item.QIKAN ?? 0)
    const patents = Number(item.ZHUANLI ?? 0)
    const cate = Array.isArray(item.CATE) ? item.CATE as string[] : []
    return {
      id: String(item.ID ?? item.AUID ?? `expert-${idx}`),
      title: name,
      organization: org,
      region: String(item.PROVINCE ?? '') + (item.CITY ? ` · ${item.CITY}` : ''),
      summary: direction || '暂无研究方向描述',
      tags: [...cate.slice(0, 2), ...(h >= 20 ? ['高影响力'] : [])],
      metrics: [
        { label: 'H指数', value: String(h) },
        { label: '论文', value: String(papers) },
        { label: '专利', value: String(patents) },
      ],
      updatedAt: '',
      score: h,
    }
  }
  const name = String(item.org_name ?? item.NAME ?? item.name ?? item.corpname ?? '未知')
  const prov = String(item.PROV ?? item.prov ?? '')
  const city = String(item.CITY ?? item.city ?? '')
  const tags = String(item.tags ?? item.TAGS ?? '').split('%').filter(Boolean)
  const trade = String(item.trade ?? item.TRADE ?? item.industry ?? '')
  return {
    id: String(item.ID ?? item.ORGID ?? item.id ?? `org-${idx}`),
    title: name,
    organization: trade || name,
    region: prov + (city ? ` · ${city}` : ''),
    summary: trade ? `行业：${trade}` : '暂无行业描述',
    tags: tags.slice(0, 3),
    metrics: [{ label: '匹配度', value: item.score ? `${Math.round(Number(item.score))}%` : '--' }],
    updatedAt: '',
    score: Number(item.score ?? 0),
  }
}

export default function IndustryInnovationResources({ chainKey }: Props) {
  const [selectedRegion, setSelectedRegion] = useState('湖北省')
  const [bottomMode, setBottomMode] = useState<'dashboard' | 'list'>('dashboard')
  const [selectedMetric, setSelectedMetric] = useState<InnovationMetricKey>('talent')
  const [activeCategory, setActiveCategory] = useState<InnovationListCategoryKey>('innovators')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<'match' | 'latest' | 'hot'>('match')
  const [page, setPage] = useState(1)
  const [overviewData, setOverviewData] = useState<InnovationOverviewData | null>(null)
  const [listData, setListData] = useState<InnovationListResult | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] = useState(false)

  const chainLabel = industryInnovationChainLabels[chainKey] ?? chainKey
  const metricLabel = innovationMetricLabels[selectedMetric]
  const leftCards = useMemo(() => overviewData?.leftCards ?? [], [overviewData])

  // ========== Overview 数据加载 ==========
  useEffect(() => {
    let cancelled = false

    void Promise.resolve().then(() => {
      if (!cancelled) setOverviewLoading(true)
      return getIndustryInnovationOverview(chainKey, selectedRegion)
    }).then((data) => {
      if (!cancelled) {
        setOverviewData(data)
        setOverviewLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setOverviewLoading(false)
    })

    return () => { cancelled = true }
  }, [chainKey, selectedRegion])

  // ========== 列表数据加载 ==========
  useEffect(() => {
    if (bottomMode !== 'list') return

    let cancelled = false
    const isRealTalent = activeCategory === 'innovators'
    const isRealOrg = activeCategory === 'institutions'

    if (isRealTalent || isRealOrg) {
      void Promise.resolve().then(() => {
        if (!cancelled) setListLoading(true)
        return isRealTalent
          ? getInnovationExpertList(chainKey, page, 6)
          : getInnovationOrgList(chainKey, page, 6)
      }).then((result) => {
        if (cancelled || !result) return
        const mappedItems = result.items.map((item, idx) => mapApiItemToListItem(item, idx, isRealTalent))

        const cardTalentTotal = leftCards.find((card) => card.label === '创新人才')?.value ?? 0
        const cardOrgTotal = leftCards.find((card) => card.label === '创新机构')?.value ?? 0
        const expertTotal = isRealTalent ? result.total : cardTalentTotal
        const orgTotal = isRealOrg ? result.total : cardOrgTotal

        setListData({
          categories: [
            { key: 'innovators' as const, label: '创新人才', count: expertTotal },
            { key: 'institutions' as const, label: '创新机构', count: orgTotal },
            { key: 'services' as const, label: '资源服务', count: 18 },
            { key: 'parks' as const, label: '产业园区', count: 18 },
            { key: 'outcomes' as const, label: '科技成果', count: 18 },
            { key: 'ip' as const, label: '知识产权', count: 18 },
            { key: 'policies' as const, label: '产业政策', count: 18 },
            { key: 'papers' as const, label: '科技文献', count: 18 },
          ],
          items: mappedItems,
          total: result.total,
          page,
          pageSize: 6,
        })
        setListLoading(false)
      }).catch(() => {
        if (!cancelled) setListLoading(false)
      })
    } else {
      void Promise.resolve().then(() => {
        if (!cancelled) setListLoading(true)
        return getIndustryInnovationList({
          chainKey,
          regionName: selectedRegion,
          category: activeCategory,
          metric: selectedMetric,
          keyword,
          sort,
          page,
          pageSize: 6,
        })
      }).then((data) => {
        if (!cancelled && data) {
          setListData(data)
          setListLoading(false)
        }
      }).catch(() => {
        if (!cancelled) setListLoading(false)
      })
    }

    return () => { cancelled = true }
  }, [activeCategory, bottomMode, chainKey, keyword, leftCards, page, selectedMetric, selectedRegion, sort])

  const handleMapClick = useCallback((regionName: string) => {
    setSelectedRegion(regionName)
    setBottomMode('dashboard')
    setPage(1)
  }, [])

  const handleMetricSelect = useCallback((metric: InnovationMetricKey) => {
    setSelectedMetric(metric)
    setActiveCategory(innovationMetricToCategory[metric])
    setKeyword('')
    setSort('match')
    setPage(1)
    setBottomMode('list')
  }, [])

  const handleCategoryChange = useCallback((category: InnovationListCategoryKey) => {
    setActiveCategory(category)
    setPage(1)
  }, [])

  return (
    <div className={styles.section}>
      <div className={styles.leadText}>
        当前围绕 <strong>{chainLabel}</strong> 展示 <strong>{selectedRegion}</strong>{' '}
        创新资源画像。点击地图切换省级区域，保持展示统计图；点击任意统计图后进入对应资源列表。
      </div>

      <div className={styles.mapCard}>
        <div className={styles.mapHeader}>
          <div className={styles.mapTitleBlock}>
            <div>
              <div className={styles.mapTitle}>创新资源总览</div>
              <div className={styles.mapSubtitle}>省级热力图 + 统计图联动展示</div>
            </div>
            <span className={styles.currentBadge}>
              <span className={styles.currentDot} />
              当前：{selectedRegion}
            </span>
          </div>
          <span className={styles.regionBadge}>
            <EnvironmentOutlined />
            {chainLabel}
          </span>
        </div>

        <Spin spinning={overviewLoading} indicator={<LoadingOutlined style={{ fontSize: 28 }} />} tip="正在加载创新资源数据...">
          <div className={styles.mapLayout}>
            <div className={`${styles.metricColumn} ${styles.metricColumnLeft}`}>
              {overviewData?.leftCards.map((card) => (
                <div key={card.label} className={styles.metricCard}>
                  <div className={styles.metricValue}>
                    <span className={styles.metricNumber}>{formatNumber(card.value)}</span>
                    <span className={styles.metricUnit}>({card.unit})</span>
                  </div>
                  <div className={styles.metricLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.mapCenter}>
              <div className={styles.mapPanel}>
                <IndustryInnovationMap
                  loading={!overviewData}
                  selectedRegion={selectedRegion}
                  mapValues={overviewData?.mapValues ?? []}
                  onRegionSelect={handleMapClick}
                />
              </div>
              <div className={styles.mapFooter}>
                点击任意省级区域，可切换当前统计对象并刷新下方视图。
              </div>
            </div>

            <div className={`${styles.metricColumn} ${styles.metricColumnRight}`}>
              {overviewData?.rightCards.map((card) => (
                <div key={card.label} className={styles.metricCard}>
                  <div className={styles.metricValue}>
                    <span className={styles.metricNumber}>{formatNumber(card.value)}</span>
                    <span className={styles.metricUnit}>({card.unit})</span>
                  </div>
                  <div className={styles.metricLabel}>{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Spin>
      </div>

      {bottomMode === 'dashboard' && (
        <Spin spinning={overviewLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} />}>
          {overviewData && (
            <IndustryInnovationOverview overview={overviewData} onMetricSelect={handleMetricSelect} />
          )}
        </Spin>
      )}

      {bottomMode === 'list' && (
        <Spin spinning={listLoading} indicator={<LoadingOutlined style={{ fontSize: 24 }} />}>
          {listData && (
            <IndustryInnovationList
              chainKey={chainKey}
              regionName={selectedRegion}
              metricLabel={metricLabel}
              categories={listData.categories}
              activeCategory={activeCategory}
              items={listData.items}
              total={listData.total}
              page={listData.page}
              pageSize={listData.pageSize}
              keyword={keyword}
              sort={sort}
              onKeywordChange={setKeyword}
              onSortChange={setSort}
              onCategoryChange={handleCategoryChange}
              onPageChange={(nextPage) => setPage(nextPage)}
              onBack={() => setBottomMode('dashboard')}
            />
          )}
        </Spin>
      )}
    </div>
  )
}
