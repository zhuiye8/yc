/**
 * 产业图谱组件 — 纯 React + CSS
 * - 默认展示2层（根+一级），点击展开下级
 * - 三列布局，聚焦某列时宽度变化
 * - 浮窗：4个统计（企业/本地企业/人才/本地人才）+ 查看按钮
 * - 抽屉：点击"查看相关企业/人才"展开右侧列表，地区与外部选择器同步
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button, Typography, App, Spin, Drawer, Cascader, Table } from 'antd'
import { Tag } from 'antd'
import { PlusOutlined, LoadingOutlined, BankOutlined, TeamOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { orgDrawerColumns, expertDrawerColumns } from '@/components/IndustryDrawerColumns'
import type { IndustryGraphNode } from '@/mock/data'
import { searchOrgs } from '@/services/industry'
import { searchExperts } from '@/services/talent'
import { regionOptions } from '@/mock/regions'
import './IndustryTree.css'

const { Text } = Typography

type StreamKey = 'upstream' | 'midstream' | 'downstream'

interface IndustryGraphSet {
  upstream: { label: string; root: IndustryGraphNode }
  midstream: { label: string; root: IndustryGraphNode }
  downstream: { label: string; root: IndustryGraphNode }
}

interface Props {
  graphData: IndustryGraphSet
  onNodeAction?: (action: 'enterprises' | 'talent' | 'addList', node: IndustryGraphNode) => void
  nodeKeywords?: Record<string, { keywords: string[]; queryString: string }>
  selectedCity?: string
  /** 外部 Cascader 的 value，如 ['hubei', 'yichang'] */
  regionValue?: (string | number)[]
}

const STATUS_COLORS: Record<string, string> = {
  strong: '#2468F2', weak: '#7BA3FA', missing: '#BFC8D6',
}
const STATUS_LABELS: Record<string, string> = {
  strong: '强链', weak: '弱链', missing: '缺链',
}

// 构建 value->label 映射
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

/** 从 Cascader value 解析出城市名（去掉"市"后缀） */
function getCityFromCascader(val: (string | number)[]): string {
  if (val.length >= 2) {
    const label = regionLabelMap[String(val[1])] || ''
    return label.replace(/市$/, '')
  }
  return ''
}

// ========== 节点组件 ==========
function TreeNode({
  node, depth, expandedNodes, onToggle, onLeafClick, compact,
}: {
  node: IndustryGraphNode; depth: number; expandedNodes: Set<string>
  onToggle: (id: string) => void; onLeafClick: (node: IndustryGraphNode, el: HTMLElement) => void
  compact: boolean
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const nodeColor = STATUS_COLORS[node.status] || '#2468F2'
  const isDashed = node.status === 'missing'

  let displayName = node.name
  if (depth === 0) displayName = displayName.replace(/^(上游|中游|下游)[：:]/, '')

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (hasChildren) onToggle(node.id)
    else onLeafClick(node, e.currentTarget)
  }, [hasChildren, node, onToggle, onLeafClick])

  return (
    <div className="chain-node-group">
      <div
        className={`chain-node ${isExpanded ? 'expanded' : ''} ${depth === 0 ? 'root-node' : ''}`}
        onClick={handleClick}
        style={{
          borderColor: nodeColor,
          borderStyle: isDashed ? 'dashed' : 'solid',
          color: node.status === 'missing' ? '#999' : nodeColor,
          fontSize: compact ? 11 : 12,
        }}
        title={displayName}
      >
        <span className="chain-node-text">{displayName}</span>
        {hasChildren && (
          <span className={`chain-node-arrow ${isExpanded ? 'arrow-down' : ''}`}>›</span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="chain-children">
          {node.children!.map(child => (
            <div key={child.id} className="chain-child-row">
              <div className="chain-connector"><div className="chain-connector-h" /></div>
              <TreeNode node={child} depth={depth + 1} expandedNodes={expandedNodes}
                onToggle={onToggle} onLeafClick={onLeafClick} compact={compact} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ========== 浮窗数据状态 ==========
interface PopoverData {
  node: IndustryGraphNode
  screenX: number
  screenY: number
  loading: boolean
  queryString: string
  orgTotal: number
  localOrgTotal: number
  expertTotal: number
  localExpertTotal: number
}

// ========== 抽屉状态 ==========
interface DrawerState {
  visible: boolean
  type: 'orgs' | 'experts'
  nodeName: string
  queryString: string
  city: string           // 当前筛选城市，空串=全国
  regionValue: (string | number)[]  // Cascader 的值
  loading: boolean
  data: Record<string, unknown>[]
  total: number
  page: number
}

// ========== 主组件 ==========
export default function IndustryChainGraph({ graphData, onNodeAction, nodeKeywords, selectedCity, regionValue: externalRegionValue }: Props) {
  const { message } = App.useApp()
  const [focusedStream, setFocusedStream] = useState<StreamKey | null>(null)

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    ;(['upstream', 'midstream', 'downstream'] as StreamKey[]).forEach(sk => {
      ids.add(graphData[sk].root.id)
    })
    return ids
  })

  const [popover, setPopover] = useState<PopoverData | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // 抽屉
  const [drawer, setDrawer] = useState<DrawerState>({
    visible: false, type: 'orgs', nodeName: '', queryString: '',
    city: '', regionValue: [], loading: false, data: [], total: 0, page: 1,
  })

  // 切换产业链时关闭浮窗和抽屉
  useEffect(() => {
    setPopover(null)
    setDrawer(d => ({ ...d, visible: false }))
  }, [graphData])

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }, [])

  const handleLeafClick = useCallback((node: IndustryGraphNode, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const screenX = Math.min(rect.right + 8, window.innerWidth - 340)
    const screenY = Math.max(10, Math.min(rect.top - 10, window.innerHeight - 320))

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const mapping = nodeKeywords?.[node.name]

    if (!mapping) {
      setPopover({
        node, screenX, screenY, loading: false, queryString: '',
        orgTotal: 0, localOrgTotal: 0, expertTotal: 0, localExpertTotal: 0,
      })
      return
    }

    setPopover({
      node, screenX, screenY, loading: true, queryString: mapping.queryString,
      orgTotal: 0, localOrgTotal: 0, expertTotal: 0, localExpertTotal: 0,
    })

    const qs = mapping.queryString
    const localCity = selectedCity || '宜昌'

    // 并行发4个请求，全部使用 city 筛选
    Promise.all([
      searchOrgs(qs, 0, 1).catch(() => null),                 // 全国企业
      searchOrgs(qs, 0, 1, localCity).catch(() => null),       // 本地企业
      searchExperts(qs, 0, 1).catch(() => null),               // 全国人才
      searchExperts(qs, 0, 1, localCity).catch(() => null),    // 本地人才
    ]).then(([orgAll, orgLocal, expertAll, expertLocal]) => {
      if (ac.signal.aborted) return

      const getOrgTotal = (res: Record<string, unknown> | null): number => {
        const d = res?.data as Record<string, unknown> | undefined
        return (d?.total as number) || 0
      }
      const getExpertTotal = (res: Record<string, unknown> | null): number => {
        const d = res?.data as Record<string, unknown> | undefined
        return (d?.total as number) || 0
      }

      setPopover(prev => prev ? {
        ...prev,
        loading: false,
        orgTotal: getOrgTotal(orgAll),
        localOrgTotal: getOrgTotal(orgLocal),
        expertTotal: getExpertTotal(expertAll),
        localExpertTotal: getExpertTotal(expertLocal),
      } : null)
    })
  }, [nodeKeywords, selectedCity])

  // ========== 抽屉数据加载 ==========
  const loadDrawerData = useCallback((type: 'orgs' | 'experts', qs: string, city: string, page: number) => {
    setDrawer(d => ({ ...d, loading: true }))
    const from = (page - 1) * 10

    const fetcher = type === 'orgs'
      ? searchOrgs(qs, from, 10, city || undefined)
      : searchExperts(qs, from, 10, city || undefined)

    fetcher.then(res => {
      const d = res?.data as Record<string, unknown> | undefined
      const list = (d?.orgRecommend ?? d?.expertsRecommend ?? d?.items ?? []) as Record<string, unknown>[]
      const total = (d?.total as number) || list.length
      setDrawer(prev => ({ ...prev, loading: false, data: list, total, page }))
    }).catch(() => {
      setDrawer(prev => ({ ...prev, loading: false, data: [], total: 0 }))
    })
  }, [])

  const openDrawer = useCallback((type: 'orgs' | 'experts') => {
    if (!popover) return
    const city = selectedCity || '宜昌'
    const rv = externalRegionValue || ['hubei', 'yichang']
    setDrawer({
      visible: true, type,
      nodeName: popover.node.name,
      queryString: popover.queryString,
      city, regionValue: rv,
      loading: true, data: [], total: 0, page: 1,
    })
    setPopover(null)
    loadDrawerData(type, popover.queryString, city, 1)
  }, [popover, selectedCity, externalRegionValue, loadDrawerData])

  const handleDrawerRegionChange = useCallback((val: (string | number)[]) => {
    const newCity = getCityFromCascader(val)
    setDrawer(prev => {
      loadDrawerData(prev.type, prev.queryString, newCity, 1)
      return { ...prev, city: newCity, regionValue: val, page: 1 }
    })
  }, [loadDrawerData])

  const streams: StreamKey[] = ['upstream', 'midstream', 'downstream']
  const headers = ['上 游', '中 游', '下 游']

  // "全国"选项 — Cascader 不支持空值, 用特殊标记
  const allRegionOptions = [
    { value: '__all__', label: '全国' },
    ...regionOptions,
  ]

  return (
    <>
      <div className="chain-graph-container" onClick={(e) => {
        const t = e.target as HTMLElement
        if (t.classList.contains('chain-graph-container') || t.classList.contains('chain-stream-col')) {
          setPopover(null)
        }
      }}>
        <div className="chain-graph-columns">
          {streams.map((sk, idx) => {
            const isFocused = focusedStream === sk
            return (
              <div key={sk} style={{ display: 'contents' }}>
                {idx > 0 && <div className="chain-stream-separator">›</div>}
                <div className={`chain-stream-col ${isFocused ? 'focused' : ''}`}>
                  <div className="chain-stream-header"
                    onClick={() => setFocusedStream(prev => prev === sk ? null : sk)}>
                    <span className="chain-header-line" />
                    <span className="chain-header-text">{headers[idx]}</span>
                    <span className="chain-header-line" />
                  </div>
                  <div className="chain-tree-content">
                    <TreeNode node={graphData[sk].root} depth={0} expandedNodes={expandedNodes}
                      onToggle={handleToggle} onLeafClick={handleLeafClick}
                      compact={focusedStream !== null && !isFocused} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========== 节点浮窗 ========== */}
      {popover && createPortal(
        <div className="chain-popover-portal"
          style={{ left: popover.screenX, top: popover.screenY }}>
          <div className="chain-popover-header">
            <Text strong style={{ fontSize: 15 }}>{popover.node.name}</Text>
            <Tag color={STATUS_COLORS[popover.node.status]}>{STATUS_LABELS[popover.node.status]}</Tag>
          </div>

          {popover.loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin indicator={<LoadingOutlined spin />} size="small" />
              <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>搜索中...</div>
            </div>
          ) : popover.queryString ? (
            <>
              <div className="chain-popover-stats">
                <div>企业 <Text strong style={{ color: '#2468F2' }}>{popover.orgTotal.toLocaleString()}</Text> 家 | 本地企业 <Text strong style={{ color: '#F26B4A' }}>{popover.localOrgTotal.toLocaleString()}</Text> 家</div>
                <div>人才 <Text strong style={{ color: '#2468F2' }}>{popover.expertTotal.toLocaleString()}</Text> 位 | 本地人才 <Text strong style={{ color: '#F26B4A' }}>{popover.localExpertTotal.toLocaleString()}</Text> 位</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button type="link" size="small" icon={<BankOutlined />}
                  onClick={() => openDrawer('orgs')}>查看相关企业</Button>
                <Button type="link" size="small" icon={<TeamOutlined />}
                  onClick={() => openDrawer('experts')}>查看相关人才</Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '16px 0', fontSize: 13 }}>暂无关键词映射</div>
          )}

          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => {
              message.success(`已将"${popover.node.name}"加入清单`)
              onNodeAction?.('addList', popover.node)
              setPopover(null)
            }}>加入清单</Button>
            <Button type="text" size="small" onClick={() => setPopover(null)} style={{ color: '#999' }}>关闭</Button>
          </div>
        </div>,
        document.body
      )}

      {/* ========== 右侧抽屉 ========== */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {drawer.type === 'orgs' ? <BankOutlined /> : <TeamOutlined />}
            <span>{drawer.nodeName} - {drawer.type === 'orgs' ? '相关企业' : '相关人才'}</span>
            {drawer.total > 0 && <Tag color="blue">{drawer.total.toLocaleString()}</Tag>}
          </div>
        }
        open={drawer.visible}
        onClose={() => setDrawer(d => ({ ...d, visible: false }))}
        width={860}
        destroyOnClose
      >
        {/* 地区筛选 — 与外部选择器同款 Cascader */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#2468F2' }} />
          <span style={{ fontSize: 13, color: '#666' }}>地区筛选：</span>
          <Cascader
            options={allRegionOptions}
            value={drawer.regionValue.length > 0 ? drawer.regionValue : ['__all__']}
            onChange={(val) => {
              if (!val || val.length === 0 || val[0] === '__all__') {
                // 选了"全国"
                setDrawer(prev => {
                  loadDrawerData(prev.type, prev.queryString, '', 1)
                  return { ...prev, city: '', regionValue: [], page: 1 }
                })
              } else {
                handleDrawerRegionChange(val)
              }
            }}
            changeOnSelect
            size="small"
            style={{ width: 220 }}
            placeholder="选择地区"
          />
        </div>

        {/* 数据表格 */}
        <Table
          columns={drawer.type === 'orgs' ? orgDrawerColumns : expertDrawerColumns}
          dataSource={drawer.data}
          rowKey={(_, i) => String(i)}
          loading={drawer.loading}
          size="small"
          pagination={{
            current: drawer.page,
            total: Math.min(drawer.total, 100),
            pageSize: 10,
            showSizeChanger: false,
            showTotal: () => `共 ${drawer.total.toLocaleString()} 条`,
            onChange: (p) => {
              loadDrawerData(drawer.type, drawer.queryString, drawer.city, p)
              setDrawer(prev => ({ ...prev, page: p }))
            },
          }}
        />
      </Drawer>
    </>
  )
}
