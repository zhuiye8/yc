import { Empty, Input, Pagination, Select, Tag } from 'antd'
import { BankOutlined, LeftOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type {
  InnovationListCategory,
  InnovationListCategoryKey,
  InnovationListItem,
} from '@/mock/industryInnovationResources'
import styles from './IndustryInnovationResources.module.scss'

interface Props {
  chainKey: string
  regionName: string
  metricLabel: string
  categories: InnovationListCategory[]
  activeCategory: InnovationListCategoryKey
  items: InnovationListItem[]
  total: number
  page: number
  pageSize: number
  keyword: string
  sort: 'match' | 'latest' | 'hot'
  onKeywordChange: (value: string) => void
  onSortChange: (value: 'match' | 'latest' | 'hot') => void
  onCategoryChange: (value: InnovationListCategoryKey) => void
  onPageChange: (page: number, pageSize: number) => void
  onBack: () => void
}

function renderMetricValue(item: InnovationListItem, label: string) {
  const target = item.metrics.find((metric) => metric.label === label)
  return target?.value || '--'
}

function getItemIcon(category: InnovationListCategoryKey) {
  if (category === 'innovators') return <UserOutlined />
  return <BankOutlined />
}

export default function IndustryInnovationList({
  chainKey,
  regionName,
  metricLabel,
  categories,
  activeCategory,
  items,
  total,
  page,
  pageSize,
  keyword,
  sort,
  onKeywordChange,
  onSortChange,
  onCategoryChange,
  onPageChange,
  onBack,
}: Props) {
  const navigate = useNavigate()

  const handleItemClick = (item: InnovationListItem) => {
    const backParams = new URLSearchParams({
      tab: 'innovation',
      chain: chainKey,
    })

    if (activeCategory === 'innovators') {
      const params = new URLSearchParams({
        name: item.title,
        org: item.organization,
        direction: item.summary,
        h: String(item.metrics.find(m => m.label === 'H指数')?.value ?? 0),
        papers: String(item.metrics.find(m => m.label === '论文')?.value ?? 0),
        patents: String(item.metrics.find(m => m.label === '专利')?.value ?? 0),
        back: `/industry?${backParams.toString()}`,
      })
      navigate(`/industry/talent/${encodeURIComponent(item.id)}?${params}`)
    } else if (activeCategory === 'institutions') {
      const params = new URLSearchParams({
        name: item.title,
        trade: item.organization,
        region: item.region,
        tags: item.tags.join(','),
        back: `/industry?${backParams.toString()}`,
      })
      navigate(`/industry/enterprise/${encodeURIComponent(item.id)}?${params}`)
    }
  }

  const isClickable = activeCategory === 'innovators' || activeCategory === 'institutions'

  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <div className={styles.listTitleGroup}>
          <div className={styles.listTitle}>创新资源列表</div>
          <div className={styles.listDesc}>
            当前区域：{regionName} · 来源视图：{metricLabel}
          </div>
        </div>
        <div className={styles.listHeaderActions}>
          <span className={styles.metricBadge}>{metricLabel}</span>
          <span className={styles.backButton} onClick={onBack}>
            <LeftOutlined style={{ marginRight: 6 }} />
            返回统计图
          </span>
        </div>
      </div>

      <div className={styles.categoryTabs}>
        {categories.map((category) => (
          <div
            key={category.key}
            className={`${styles.categoryTab} ${category.key === activeCategory ? styles.active : ''}`}
            onClick={() => onCategoryChange(category.key)}
          >
            {category.label}
            <span style={{ marginLeft: 6, color: '#a0a4ab' }}>({category.count})</span>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <Input.Search
          placeholder="搜索资源名称、机构名称、关键词..."
          allowClear
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <Select
          value={sort}
          onChange={onSortChange}
          options={[
            { value: 'match', label: '综合排序' },
            { value: 'latest', label: '最新发布' },
            { value: 'hot', label: '热度优先' },
          ]}
        />
        <Select
          value={regionName}
          options={[{ value: regionName, label: regionName }]}
          disabled
        />
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <Empty description="当前筛选条件下暂无可展示资源" />
        </div>
      ) : (
        <>
          <div className={styles.listItems}>
            {items.map((item) => (
                <div
                  key={item.id}
                  className={styles.listItem}
                  style={isClickable ? { cursor: 'pointer' } : undefined}
                  onClick={() => isClickable && handleItemClick(item)}
                >
                  <div className={styles.listIcon}>
                    {getItemIcon(activeCategory)}
                  </div>
                <div className={styles.listBody}>
                  <div className={styles.listTop}>
                    <div>
                      <div className={styles.listTitleText}>{item.title}</div>
                      <div className={styles.listOrg}>
                        {item.organization} · {item.region}
                      </div>
                    </div>
                    <div className={styles.listDate}>更新于 {item.updatedAt}</div>
                  </div>
                  <div className={styles.listSummary}>{item.summary}</div>
                  <div className={styles.tagRow}>
                    {item.tags.map((tag) => (
                      <Tag key={tag} color={tag === '重点推荐' ? 'blue' : 'default'}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statItem}>匹配度 {renderMetricValue(item, '匹配度')}</span>
                    <span className={styles.statItem}>活跃度 {renderMetricValue(item, '活跃度')}</span>
                    <span className={styles.statItem}>近90天 {renderMetricValue(item, '近90天')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.pager}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              size="small"
              showSizeChanger={false}
              onChange={onPageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}
