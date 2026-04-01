import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { App, Button, Cascader, Drawer, Spin, Table, Tag, Typography } from 'antd'
import { BankOutlined, EnvironmentOutlined, LoadingOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons'
import { Graph, treeToGraphData } from '@antv/g6'
import type { GraphData, Graph as G6Graph, IElementEvent } from '@antv/g6'
import { orgDrawerColumns, expertDrawerColumns } from '@/components/IndustryDrawerColumns'
import type { IndustryGraphNode } from '@/mock/data'
import { regionOptions } from '@/mock/regions'
import { aggregateStatus, getNodeStatus } from '@/services/coverageCache'
import { searchOrgs } from '@/services/industry'
import { searchExperts } from '@/services/talent'
import './IndustryTree.css'

const { Text } = Typography

type StreamKey = 'upstream' | 'midstream' | 'downstream'
type NodeStatus = 'strong' | 'weak' | 'missing' | 'analyzing'

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
  regionValue?: string[]
  nodeOrgCounts?: Record<string, number>
  analyzing?: boolean
  analysisLabel?: string
}

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

interface DrawerState {
  visible: boolean
  type: 'orgs' | 'experts'
  nodeName: string
  queryString: string
  city: string
  regionValue: string[]
  loading: boolean
  data: Record<string, unknown>[]
  total: number
  page: number
}

interface StreamTreeNode {
  id: string
  label: string
  status: NodeStatus
  hasChildren: boolean
  depth: number
  nodeWidth: number
  nodeHeight: number
  originalNode: IndustryGraphNode
  children?: StreamTreeNode[]
}

interface StreamGraphProps {
  streamKey: StreamKey
  root: IndustryGraphNode
  getStatus: (node: IndustryGraphNode) => NodeStatus
  collapsedIds: Set<string>
  onToggleNode: (stream: StreamKey, nodeId: string) => void
  onLeafClick: (node: IndustryGraphNode, event: IElementEvent) => void
  onCanvasClick: () => void
}

const STREAM_GRAPH_HEIGHT = 520

const STREAMS: StreamKey[] = ['upstream', 'midstream', 'downstream']
const STREAM_LABELS: Record<StreamKey, string> = {
  upstream: '上游',
  midstream: '中游',
  downstream: '下游',
}

const STATUS_COLORS: Record<NodeStatus, { fill: string; stroke: string; text: string; shadow: string }> = {
  strong: {
    fill: '#2f6ef1',
    stroke: '#2f6ef1',
    text: '#ffffff',
    shadow: 'rgba(47, 110, 241, 0.28)',
  },
  weak: {
    fill: '#52c565',
    stroke: '#52c565',
    text: '#ffffff',
    shadow: 'rgba(82, 197, 101, 0.22)',
  },
  missing: {
    fill: '#b4c0ce',
    stroke: '#b4c0ce',
    text: '#ffffff',
    shadow: 'rgba(180, 192, 206, 0.2)',
  },
  analyzing: {
    fill: '#f6c24a',
    stroke: '#f6c24a',
    text: '#ffffff',
    shadow: 'rgba(246, 194, 74, 0.22)',
  },
}

const STATUS_LABELS: Record<NodeStatus, string> = {
  strong: '强链',
  weak: '弱链',
  missing: '缺链',
  analyzing: '分析中',
}

function stripStreamPrefix(name: string) {
  return name.replace(/^(上游|中游|下游)[：:]/, '').trim()
}

function getNodeSize(label: string, depth: number) {
  const textLength = Array.from(label).length
  const width = Math.min(226, Math.max(depth === 0 ? 136 : 96, textLength * 15 + 36))
  const height = depth === 0 ? 44 : 36

  return { width, height }
}

function normalizeNodeName(name: string) {
  return name.replace(/[\s：:]/g, '').trim()
}

function buildLabelMap(options: typeof regionOptions): Record<string, string> {
  const map: Record<string, string> = {}

  const walk = (items: typeof regionOptions) => {
    items.forEach((item) => {
      if (item.value && item.label) map[String(item.value)] = String(item.label)
      if (item.children) walk(item.children as typeof regionOptions)
    })
  }

  walk(options)
  return map
}

const regionLabelMap = buildLabelMap(regionOptions)
const allRegionOptions = [{ value: '__all__', label: '全国' }, ...regionOptions]

function getCityFromCascader(value: string[]) {
  if (value.length >= 2) {
    const label = regionLabelMap[String(value[1])] || ''
    return label.replace(/市$/, '')
  }

  return ''
}

function collectInitialCollapsedIds(node: IndustryGraphNode, depth = 0, acc: string[] = []) {
  if (!node.children?.length) return acc

  if (depth >= 1) acc.push(node.id)
  node.children.forEach((child) => collectInitialCollapsedIds(child, depth + 1, acc))
  return acc
}

function buildInitialCollapsedState(graphData: IndustryGraphSet): Record<StreamKey, string[]> {
  return {
    upstream: collectInitialCollapsedIds(graphData.upstream.root),
    midstream: collectInitialCollapsedIds(graphData.midstream.root),
    downstream: collectInitialCollapsedIds(graphData.downstream.root),
  }
}

function buildTreeNode(
  node: IndustryGraphNode,
  depth: number,
  collapsedIds: Set<string>,
  getStatus: (node: IndustryGraphNode) => NodeStatus,
): StreamTreeNode {
  const label = depth === 0 ? stripStreamPrefix(node.name) : node.name
  const { width, height } = getNodeSize(label, depth)
  const hasChildren = Boolean(node.children?.length)
  const children = hasChildren && !collapsedIds.has(node.id)
    ? node.children!.map((child) => buildTreeNode(child, depth + 1, collapsedIds, getStatus))
    : undefined

  return {
    id: node.id,
    label,
    status: getStatus(node),
    hasChildren,
    depth,
    nodeWidth: width,
    nodeHeight: height,
    originalNode: node,
    children,
  }
}

function buildGraphData(
  root: IndustryGraphNode,
  collapsedIds: Set<string>,
  getStatus: (node: IndustryGraphNode) => NodeStatus,
): GraphData {
  const tree = buildTreeNode(root, 0, collapsedIds, getStatus)

  return treeToGraphData(tree, {
    getChildren: (node) => node.children || [],
    getNodeData: (node, depth) => {
      const { children, ...rest } = node
      return {
        ...rest,
        depth,
        children: children?.map((child) => child.id) || [],
      }
    },
    getEdgeData: (source, target) => ({
      id: `${source.id}-${target.id}`,
      source: source.id,
      target: target.id,
    }),
  })
}

function getGraphNodeStyle(datum: Record<string, unknown>) {
  const status = (datum.status as NodeStatus) || 'strong'
  const colors = STATUS_COLORS[status]
  const depth = Number(datum.depth || 0)
  const width = Number(datum.nodeWidth || 88)
  const height = Number(datum.nodeHeight || (depth === 0 ? 38 : 30))
  const isMissing = status === 'missing'

  return {
    size: [width, height] as [number, number],
    radius: Math.round(height / 2),
    fill: colors.fill,
    stroke: colors.stroke,
    lineWidth: isMissing ? 1.2 : 1,
    lineDash: isMissing ? [4, 3] : undefined,
    shadowColor: colors.shadow,
    shadowBlur: depth === 0 ? 14 : 10,
    shadowOffsetY: 4,
    labelText: String(datum.label || ''),
    labelPlacement: 'center' as const,
    labelFill: colors.text,
    labelFontSize: depth === 0 ? 17 : 14,
    labelFontWeight: depth === 0 ? 700 : 600,
    labelMaxWidth: `${Math.max(88, width - 20)}px`,
    labelWordWrap: true,
    labelWordWrapWidth: Math.max(88, width - 20),
  }
}

function StreamGraph({
  streamKey,
  root,
  getStatus,
  collapsedIds,
  onToggleNode,
  onLeafClick,
  onCanvasClick,
}: StreamGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<G6Graph | null>(null)
  const onToggleRef = useRef(onToggleNode)
  const onLeafClickRef = useRef(onLeafClick)
  const onCanvasClickRef = useRef(onCanvasClick)
  const [width, setWidth] = useState(0)

  onToggleRef.current = onToggleNode
  onLeafClickRef.current = onLeafClick
  onCanvasClickRef.current = onCanvasClick

  const graphData = useMemo(
    () => buildGraphData(root, collapsedIds, getStatus),
    [root, collapsedIds, getStatus],
  )

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const nextWidth = Math.floor(entry.contentRect.width)

      setWidth((prev) => (prev === nextWidth ? prev : nextWidth))
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current || width === 0) return

    let graph = graphRef.current

    if (!graph) {
      graph = new Graph({
        container: containerRef.current,
        width,
        height: STREAM_GRAPH_HEIGHT,
        autoResize: false,
        zoomRange: [0.5, 2.4],
        autoFit: {
          type: 'view',
          options: {
            when: 'always',
            direction: 'both',
          },
        },
        animation: false,
        padding: [20, 28, 20, 28],
        node: {
          type: 'rect',
          style: (datum) => getGraphNodeStyle(datum as Record<string, unknown>),
        },
        edge: {
          type: 'cubic-horizontal',
          style: {
            stroke: '#c8dcff',
            lineWidth: 1.5,
            opacity: 0.96,
          },
        },
        layout: {
          type: 'compact-box',
          direction: 'LR',
          getWidth: (datum: Record<string, unknown>) => Number(datum.nodeWidth || 88),
          getHeight: (datum: Record<string, unknown>) => Number(datum.nodeHeight || 30),
          getHGap: (datum: Record<string, unknown>) => (Number(datum.depth || 0) === 0 ? 64 : 54),
          getVGap: (datum: Record<string, unknown>) => (Number(datum.depth || 0) <= 1 ? 44 : 34),
        },
        data: graphData,
        behaviors: ['drag-canvas', 'zoom-canvas'],
      })

      graph.on('canvas:click', () => {
        onCanvasClickRef.current()
      })

      graph.on('node:click', (event: IElementEvent) => {
        const targetId = String(event.target.id || '')
        if (!targetId) return

        const datum = graph?.getNodeData(targetId) as (Record<string, unknown> & {
          originalNode?: IndustryGraphNode
          hasChildren?: boolean
        }) | undefined

        if (!datum?.originalNode) return

        if (datum.hasChildren) {
          onToggleRef.current(streamKey, targetId)
          return
        }

        onLeafClickRef.current(datum.originalNode, event)
      })

      graphRef.current = graph
    }

    graph.resize(width, STREAM_GRAPH_HEIGHT)
    graph.setData(graphData)

    void (async () => {
      await graph.render()
      await graph.fitView({ when: 'always', direction: 'both' })
      await graph.fitCenter()
    })()
  }, [graphData, streamKey, width])

  useEffect(() => {
    return () => {
      graphRef.current?.destroy()
      graphRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="chain-stream-graph" />
}

export default function IndustryChainGraph({
  graphData,
  onNodeAction,
  nodeKeywords,
  selectedCity,
  regionValue: externalRegionValue,
  nodeOrgCounts,
  analyzing,
  analysisLabel,
}: Props) {
  const { message } = App.useApp()
  const abortRef = useRef<AbortController | null>(null)
  const [collapsedByStream, setCollapsedByStream] = useState<Record<StreamKey, string[]>>(() => buildInitialCollapsedState(graphData))
  const [popover, setPopover] = useState<PopoverData | null>(null)
  const [drawer, setDrawer] = useState<DrawerState>({
    visible: false,
    type: 'orgs',
    nodeName: '',
    queryString: '',
    city: '',
    regionValue: [],
    loading: false,
    data: [],
    total: 0,
    page: 1,
  })

  useEffect(() => {
    setCollapsedByStream(buildInitialCollapsedState(graphData))
    setPopover(null)
    setDrawer((prev) => ({ ...prev, visible: false }))
  }, [graphData])

  const getEffectiveStatus = useCallback((node: IndustryGraphNode): NodeStatus => {
    if (analyzing) return 'analyzing'
    if (!nodeOrgCounts || Object.keys(nodeOrgCounts).length === 0) return node.status

    const hasChildren = Boolean(node.children?.length)
    if (!hasChildren) {
      let count = nodeOrgCounts[node.name]

      if (count === undefined) {
        const normalizedName = normalizeNodeName(node.name)
        for (const [key, value] of Object.entries(nodeOrgCounts)) {
          if (normalizeNodeName(key) === normalizedName) {
            count = value
            break
          }
        }
      }

      if (count === undefined) return node.status
      return getNodeStatus(count) as NodeStatus
    }

    const childStatuses = (node.children || []).map((child) => getEffectiveStatus(child))
    const validStatuses = childStatuses.filter((status) => status !== 'analyzing') as Array<'strong' | 'weak' | 'missing'>

    if (validStatuses.length === 0) return analyzing ? 'analyzing' : node.status
    return aggregateStatus(validStatuses) as NodeStatus
  }, [analyzing, nodeOrgCounts])

  const handleToggleNode = useCallback((stream: StreamKey, nodeId: string) => {
    setPopover(null)
    setCollapsedByStream((prev) => {
      const nextSet = new Set(prev[stream])

      if (nextSet.has(nodeId)) nextSet.delete(nodeId)
      else nextSet.add(nodeId)

      return {
        ...prev,
        [stream]: Array.from(nextSet),
      }
    })
  }, [])

  const handleLeafClick = useCallback((node: IndustryGraphNode, event: IElementEvent) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const mapping = nodeKeywords?.[node.name]
    const clientX = typeof event.client?.x === 'number' ? event.client.x : 0
    const clientY = typeof event.client?.y === 'number' ? event.client.y : 0

    const screenX = Math.min(clientX + 12, window.innerWidth - 340)
    const screenY = Math.max(12, Math.min(clientY - 16, window.innerHeight - 320))

    if (!mapping) {
      setPopover({
        node,
        screenX,
        screenY,
        loading: false,
        queryString: '',
        orgTotal: 0,
        localOrgTotal: 0,
        expertTotal: 0,
        localExpertTotal: 0,
      })
      return
    }

    setPopover({
      node,
      screenX,
      screenY,
      loading: true,
      queryString: mapping.queryString,
      orgTotal: 0,
      localOrgTotal: 0,
      expertTotal: 0,
      localExpertTotal: 0,
    })

    const currentCity = selectedCity || '宜昌'

    void Promise.all([
      searchOrgs(mapping.queryString, 0, 1).catch(() => null),
      searchOrgs(mapping.queryString, 0, 1, currentCity).catch(() => null),
      searchExperts(mapping.queryString, 0, 1).catch(() => null),
      searchExperts(mapping.queryString, 0, 1, currentCity).catch(() => null),
    ]).then(([orgAll, orgLocal, expertAll, expertLocal]) => {
      if (controller.signal.aborted) return

      const getOrgTotal = (result: Record<string, unknown> | null) => {
        const data = result?.data as Record<string, unknown> | undefined
        return Number(data?.total || 0)
      }

      const getExpertTotal = (result: Record<string, unknown> | null) => {
        const data = result?.data as Record<string, unknown> | undefined
        return Number(data?.total || 0)
      }

      setPopover((prev) => {
        if (!prev) return null

        return {
          ...prev,
          loading: false,
          orgTotal: getOrgTotal(orgAll),
          localOrgTotal: getOrgTotal(orgLocal),
          expertTotal: getExpertTotal(expertAll),
          localExpertTotal: getExpertTotal(expertLocal),
        }
      })
    })
  }, [nodeKeywords, selectedCity])

  const loadDrawerData = useCallback((type: 'orgs' | 'experts', queryString: string, city: string, page: number) => {
    setDrawer((prev) => ({ ...prev, loading: true }))
    const from = (page - 1) * 10

    const request = type === 'orgs'
      ? searchOrgs(queryString, from, 10, city || undefined)
      : searchExperts(queryString, from, 10, city || undefined)

    void request.then((result) => {
      const data = result?.data as Record<string, unknown> | undefined
      const list = (data?.orgRecommend ?? data?.expertsRecommend ?? data?.items ?? []) as Record<string, unknown>[]
      const total = Number(data?.total || list.length)

      setDrawer((prev) => ({
        ...prev,
        loading: false,
        data: list,
        total,
        page,
      }))
    }).catch(() => {
      setDrawer((prev) => ({
        ...prev,
        loading: false,
        data: [],
        total: 0,
      }))
    })
  }, [])

  const openDrawer = useCallback((type: 'orgs' | 'experts') => {
    if (!popover) return

    const city = selectedCity || '宜昌'
    const region = externalRegionValue || ['hubei', 'yichang']

    setDrawer({
      visible: true,
      type,
      nodeName: popover.node.name,
      queryString: popover.queryString,
      city,
      regionValue: region,
      loading: true,
      data: [],
      total: 0,
      page: 1,
    })

    setPopover(null)
    loadDrawerData(type, popover.queryString, city, 1)
  }, [externalRegionValue, loadDrawerData, popover, selectedCity])

  const handleDrawerRegionChange = useCallback((value: string[]) => {
    const nextCity = getCityFromCascader(value)

    setDrawer((prev) => {
      loadDrawerData(prev.type, prev.queryString, nextCity, 1)
      return {
        ...prev,
        city: nextCity,
        regionValue: value,
        page: 1,
      }
    })
  }, [loadDrawerData])

  const popoverStatus = popover
    ? (popover.loading ? 'analyzing' : getEffectiveStatus(popover.node))
    : null

  return (
    <>
      <div className="chain-graph-shell" onClick={() => setPopover(null)}>
        <div className="chain-legend-row">
          <div className="chain-legend-bar">
          <span className="chain-legend-item">
            <span className="chain-legend-icon chain-legend-strong" />
            强链
          </span>
          <span className="chain-legend-item">
            <span className="chain-legend-icon chain-legend-weak" />
            弱链
          </span>
          <span className="chain-legend-item">
            <span className="chain-legend-icon chain-legend-missing" />
            缺链
          </span>
          </div>
          {analysisLabel && (
            <div className={`chain-analysis-tip${analyzing ? ' is-loading' : ''}`}>
              {analyzing && <LoadingOutlined spin />}
              <span>{analysisLabel}</span>
            </div>
          )}
        </div>

        <div className="chain-stage">
          <div className="chain-stage-header">
            {STREAMS.map((stream) => (
              <div key={stream} className={`chain-stage-pill stream-${stream}`}>
                {STREAM_LABELS[stream]}
              </div>
            ))}
          </div>

          <div className="chain-stage-body">
            {STREAMS.map((stream) => (
              <div key={stream} className={`chain-stage-column stream-${stream}`} onClick={(event) => event.stopPropagation()}>
                <StreamGraph
                  streamKey={stream}
                  root={graphData[stream].root}
                  getStatus={getEffectiveStatus}
                  collapsedIds={new Set(collapsedByStream[stream])}
                  onToggleNode={handleToggleNode}
                  onLeafClick={handleLeafClick}
                  onCanvasClick={() => setPopover(null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {popover && createPortal(
        <div className="chain-popover-portal" style={{ left: popover.screenX, top: popover.screenY }}>
          <div className="chain-popover-header">
            <Text strong style={{ fontSize: 15 }}>
              {popover.node.name}
            </Text>
            <Tag color={STATUS_COLORS[popoverStatus || 'strong'].fill}>
              {STATUS_LABELS[popoverStatus || 'strong']}
            </Tag>
          </div>

          {popover.loading ? (
            <div className="chain-popover-loading">
              <Spin indicator={<LoadingOutlined spin />} size="small" />
              <div className="chain-popover-tip">检索中...</div>
            </div>
          ) : popover.queryString ? (
            <>
              <div className="chain-popover-stats">
                <div>
                  企业 <Text strong style={{ color: '#2468F2' }}>{popover.orgTotal.toLocaleString()}</Text> 家
                  {' '}| 本地企业 <Text strong style={{ color: '#F26B4A' }}>{popover.localOrgTotal.toLocaleString()}</Text> 家
                </div>
                <div>
                  人才 <Text strong style={{ color: '#2468F2' }}>{popover.expertTotal.toLocaleString()}</Text> 位
                  {' '}| 本地人才 <Text strong style={{ color: '#F26B4A' }}>{popover.localExpertTotal.toLocaleString()}</Text> 位
                </div>
              </div>
              <div className="chain-popover-actions">
                <Button type="link" size="small" icon={<BankOutlined />} onClick={() => openDrawer('orgs')}>
                  查看相关企业
                </Button>
                <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => openDrawer('experts')}>
                  查看相关人才
                </Button>
              </div>
            </>
          ) : (
            <div className="chain-popover-empty">暂无关键词映射</div>
          )}

          <div className="chain-popover-footer">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                message.success(`已将“${popover.node.name}”加入清单`)
                onNodeAction?.('addList', popover.node)
                setPopover(null)
              }}
            >
              加入清单
            </Button>
            <Button type="text" size="small" onClick={() => setPopover(null)} style={{ color: '#8a94a6' }}>
              关闭
            </Button>
          </div>
        </div>,
        document.body,
      )}

      <Drawer
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {drawer.type === 'orgs' ? <BankOutlined /> : <TeamOutlined />}
            <span>{drawer.nodeName} - {drawer.type === 'orgs' ? '相关企业' : '相关人才'}</span>
            {drawer.total > 0 && <Tag color="blue">{drawer.total.toLocaleString()}</Tag>}
          </div>
        )}
        open={drawer.visible}
        onClose={() => setDrawer((prev) => ({ ...prev, visible: false }))}
        width={860}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#2468F2' }} />
          <span style={{ fontSize: 13, color: '#666' }}>地区筛选：</span>
          <Cascader
            options={allRegionOptions}
            value={drawer.regionValue.length > 0 ? drawer.regionValue : ['__all__']}
            onChange={(value) => {
              const nextValue = (value || []) as string[]

              if (nextValue.length === 0 || nextValue[0] === '__all__') {
                setDrawer((prev) => {
                  loadDrawerData(prev.type, prev.queryString, '', 1)
                  return {
                    ...prev,
                    city: '',
                    regionValue: [],
                    page: 1,
                  }
                })
                return
              }

              handleDrawerRegionChange(nextValue)
            }}
            changeOnSelect
            size="small"
            style={{ width: 220 }}
            placeholder="选择地区"
          />
        </div>

        <Table
          columns={drawer.type === 'orgs' ? orgDrawerColumns : expertDrawerColumns}
          dataSource={drawer.data}
          rowKey={(_, index) => String(index)}
          loading={drawer.loading}
          size="small"
          pagination={{
            current: drawer.page,
            total: Math.min(drawer.total, 100),
            pageSize: 10,
            showSizeChanger: false,
            showTotal: () => `共 ${drawer.total.toLocaleString()} 条`,
            onChange: (page) => {
              loadDrawerData(drawer.type, drawer.queryString, drawer.city, page)
              setDrawer((prev) => ({ ...prev, page }))
            },
          }}
        />
      </Drawer>
    </>
  )
}
