import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { App, Button, Cascader, Drawer, Select, Spin, Table, Tabs, Tag, Typography } from 'antd'
import { BankOutlined, DownloadOutlined, EnvironmentOutlined, LoadingOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons'
import { Graph, treeToGraphData } from '@antv/g6'
import type { GraphData, Graph as G6Graph, IElementEvent } from '@antv/g6'
import { orgDrawerColumns, expertDrawerColumns } from '@/components/IndustryDrawerColumns'
import type { IndustryGraphNode } from '@/mock/data'
import { regionOptions } from '@/mock/regions'
import { aggregateStatus, getNodeStatus } from '@/services/coverageCache'
import { searchChainTalents } from '@/services/chainTalent'
import { searchChainOrgs } from '@/services/chainOrg'
import { resolveIndustryRegionFromCascader } from '@/services/industryRegion'
import { ORG_TAG_FILTER_OPTIONS, normalizeOrgTagFilter } from '@/services/industryOrgTags'
import { getIndustryNodeProfileText } from '@/services/industryNodeProfile'
import { exportRecordsCsv } from '@/utils/exportCsv'
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
  chainKey: string
  graphData: IndustryGraphSet
  onNodeAction?: (action: 'enterprises' | 'talent' | 'addList', node: IndustryGraphNode) => void
  nodeKeywords?: Record<string, { keywords: string[]; queryString: string }>
  selectedCity?: string
  regionValue?: string[]
  nodeOrgCounts?: Record<string, number>
  analyzing?: boolean
  analysisLabel?: string
  summaryLabel?: string
  onNodeContextSelect?: (node: IndustryGraphNode) => void
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
  orgTag: string
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
  onNodeInspect: (node: IndustryGraphNode, event: IElementEvent) => void
  onCanvasClick: () => void
  // 视口联动：注册图实例、注销、上报视口变化、以及"程序化重排期间不联动"的标记集合
  registerGraph?: (graph: G6Graph) => void
  unregisterGraph?: (graph: G6Graph) => void
  onViewportChange?: (graph: G6Graph) => void
  selfAdjustingRef?: React.MutableRefObject<Set<G6Graph>>
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

function getRenderableStreamRoots(root: IndustryGraphNode, stream: StreamKey) {
  if (root.name === STREAM_LABELS[stream] && root.children?.length) return root.children
  return [root]
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

function stripStagePrefix(name: string) {
  return name.replace(/^(?:\u4e0a\u6e38|\u4e2d\u6e38|\u4e0b\u6e38)[\uff1a:]\s*/, '').trim()
}

const allRegionOptions = [{ value: '__all__', label: '全国' }, ...regionOptions]

function collectInitialCollapsedIds(node: IndustryGraphNode, depth = 0, acc: string[] = []) {
  if (!node.children?.length) return acc

  if (depth >= 1) acc.push(node.id)
  node.children.forEach((child) => collectInitialCollapsedIds(child, depth + 1, acc))
  return acc
}

function buildInitialCollapsedState(graphData: IndustryGraphSet): Record<StreamKey, string[]> {
  return {
    upstream: getRenderableStreamRoots(graphData.upstream.root, 'upstream').flatMap((root) => collectInitialCollapsedIds(root)),
    midstream: getRenderableStreamRoots(graphData.midstream.root, 'midstream').flatMap((root) => collectInitialCollapsedIds(root)),
    downstream: getRenderableStreamRoots(graphData.downstream.root, 'downstream').flatMap((root) => collectInitialCollapsedIds(root)),
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
  onNodeInspect,
  onCanvasClick,
  registerGraph,
  unregisterGraph,
  onViewportChange,
  selfAdjustingRef,
}: StreamGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<G6Graph | null>(null)
  const onToggleRef = useRef(onToggleNode)
  const onLeafClickRef = useRef(onLeafClick)
  const onNodeInspectRef = useRef(onNodeInspect)
  const onCanvasClickRef = useRef(onCanvasClick)
  const registerGraphRef = useRef(registerGraph)
  const unregisterGraphRef = useRef(unregisterGraph)
  const onViewportChangeRef = useRef(onViewportChange)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(STREAM_GRAPH_HEIGHT)

  const graphData = useMemo(
    () => buildGraphData(root, collapsedIds, getStatus),
    [root, collapsedIds, getStatus],
  )

  useEffect(() => {
    onToggleRef.current = onToggleNode
    onLeafClickRef.current = onLeafClick
    onNodeInspectRef.current = onNodeInspect
    onCanvasClickRef.current = onCanvasClick
    registerGraphRef.current = registerGraph
    unregisterGraphRef.current = unregisterGraph
    onViewportChangeRef.current = onViewportChange
  }, [onCanvasClick, onLeafClick, onNodeInspect, onToggleNode, registerGraph, unregisterGraph, onViewportChange])

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const nextWidth = Math.floor(entry.contentRect.width)
      const nextHeight = Math.floor(entry.contentRect.height)

      setWidth((prev) => (prev === nextWidth ? prev : nextWidth))
      setHeight((prev) => (prev === nextHeight ? prev : nextHeight))
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current || width === 0 || height === 0) return

    let graph = graphRef.current
    const graphHeight = Math.max(1, height)

    if (!graph) {
      graph = new Graph({
        container: containerRef.current,
        width,
        height: graphHeight,
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

      graph.on('node:contextmenu', (event: IElementEvent) => {
        event.preventDefault?.()
        const targetId = String(event.target.id || '')
        if (!targetId) return

        const datum = graph?.getNodeData(targetId) as (Record<string, unknown> & {
          originalNode?: IndustryGraphNode
        }) | undefined

        if (datum?.originalNode) onNodeInspectRef.current(datum.originalNode, event)
      })

      // 视口联动：上报本图的缩放/平移，让其它图同步
      const createdGraph = graph
      createdGraph.on('aftertransform', () => onViewportChangeRef.current?.(createdGraph))
      registerGraphRef.current?.(createdGraph)

      graphRef.current = createdGraph
    }

    graph.resize(width, graphHeight)
    graph.setData(graphData)

    // 程序化重排（首次适配、展开/收起后的重新 fit）期间不触发联动，避免互相干扰
    const activeGraph = graph
    selfAdjustingRef?.current.add(activeGraph)
    void (async () => {
      await activeGraph.render()
      await activeGraph.fitView({ when: 'always', direction: 'both' })
      await activeGraph.fitCenter()
      requestAnimationFrame(() => selfAdjustingRef?.current.delete(activeGraph))
    })()
  }, [graphData, height, streamKey, width, selfAdjustingRef])

  useEffect(() => {
    return () => {
      if (graphRef.current) unregisterGraphRef.current?.(graphRef.current)
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
  summaryLabel,
  onNodeContextSelect,
}: Props) {
  const { message } = App.useApp()
  const abortRef = useRef<AbortController | null>(null)

  // ===== 上中下游图谱视口联动：所有子图作为一个整体缩放/平移 =====
  const graphRegistryRef = useRef<Set<G6Graph>>(new Set())
  const selfAdjustingRef = useRef<Set<G6Graph>>(new Set())
  const syncingViewportRef = useRef(false)
  const lastViewportRef = useRef<Map<G6Graph, { zoom: number; x: number; y: number }>>(new Map())

  const snapshotViewport = (graph: G6Graph) => {
    // 渲染完成前 getPosition/getZoom 会抛错（canvas 未就绪），兜底返回默认
    try {
      const [x, y] = graph.getPosition()
      return { zoom: graph.getZoom(), x, y }
    } catch {
      return { zoom: 1, x: 0, y: 0 }
    }
  }

  const mirrorViewport = useCallback((source: G6Graph) => {
    const current = snapshotViewport(source)
    const prev = lastViewportRef.current.get(source) ?? current
    lastViewportRef.current.set(source, current)
    // 程序化重排或正在同步中：只更新基准，不向其它图传播
    if (syncingViewportRef.current || selfAdjustingRef.current.has(source)) return

    const ratio = prev.zoom ? current.zoom / prev.zoom : 1
    const dx = current.x - prev.x
    const dy = current.y - prev.y
    const zoomChanged = Math.abs(ratio - 1) > 1e-3
    const moved = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5
    if (!zoomChanged && !moved) return

    syncingViewportRef.current = true
    graphRegistryRef.current.forEach((target) => {
      if (target === source) return
      if (zoomChanged) target.zoomBy(ratio)
      if (moved) target.translateBy([dx, dy])
      lastViewportRef.current.set(target, snapshotViewport(target))
    })
    syncingViewportRef.current = false
  }, [])

  const registerGraph = useCallback((graph: G6Graph) => {
    // 只登记，不在此刻读视口（此时尚未 render，canvas 未就绪）；基准在首次视口事件时惰性建立
    graphRegistryRef.current.add(graph)
  }, [])

  const unregisterGraph = useCallback((graph: G6Graph) => {
    graphRegistryRef.current.delete(graph)
    lastViewportRef.current.delete(graph)
  }, [])

  const [collapsedByStream, setCollapsedByStream] = useState<Record<StreamKey, string[]>>(() => buildInitialCollapsedState(graphData))
  const [popover, setPopover] = useState<PopoverData | null>(null)
  const [drawer, setDrawer] = useState<DrawerState>({
    visible: false,
    type: 'orgs',
    nodeName: '',
    queryString: '',
    city: '',
    regionValue: [],
    orgTag: '',
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

  const getEffectiveStatus = useCallback(function resolveEffectiveStatus(node: IndustryGraphNode): NodeStatus {
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

    const childStatuses = (node.children || []).map((child) => resolveEffectiveStatus(child))
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

    const sourceNodeName = stripStagePrefix(node.name) || node.name
    const mapping = nodeKeywords?.[sourceNodeName]
    const clientX = typeof event.client?.x === 'number' ? event.client.x : 0
    const clientY = typeof event.client?.y === 'number' ? event.client.y : 0

    const screenX = Math.min(clientX + 12, window.innerWidth - 340)
    const screenY = Math.max(12, Math.min(clientY - 16, window.innerHeight - 320))

    setPopover({
      node,
      screenX,
      screenY,
      loading: true,
      queryString: mapping?.queryString || sourceNodeName,
      orgTotal: 0,
      localOrgTotal: 0,
      expertTotal: 0,
      localExpertTotal: 0,
    })

    const selectedRegion = resolveIndustryRegionFromCascader(externalRegionValue)
    const currentCity = selectedRegion.city || selectedCity || '宜昌'

    void (async () => {
      const queryString = mapping?.queryString || sourceNodeName
      if (!queryString) {
        if (controller.signal.aborted) return

        setPopover((prev) => {
          if (!prev) return null

          return {
            ...prev,
            loading: false,
            queryString: '',
            orgTotal: 0,
            localOrgTotal: 0,
            expertTotal: 0,
            localExpertTotal: 0,
          }
        })
        return
      }

      const [orgAll, orgLocal] = await Promise.all([
        searchChainOrgs(sourceNodeName, undefined, undefined, undefined, 1, 1).catch(() => null),
        searchChainOrgs(
          sourceNodeName,
          selectedRegion.province || undefined,
          currentCity || undefined,
          undefined,
          1,
          1,
        ).catch(() => null),
      ])
      if (controller.signal.aborted) return

      const orgTotal = orgAll?.total ?? 0
      const localOrgTotal = orgLocal?.total ?? 0

      const expertTotals = await Promise.all([
        searchChainTalents(sourceNodeName, undefined, undefined, 1, 1).catch(() => null),
        searchChainTalents(
          sourceNodeName,
          selectedRegion.province || undefined,
          currentCity || undefined,
          1,
          1,
        ).catch(() => null),
      ]).then(([expertAll, expertLocal]) => ({
        expertTotal: expertAll?.total ?? 0,
        localExpertTotal: expertLocal?.total ?? 0,
      }))
      if (controller.signal.aborted) return

      setPopover((prev) => {
        if (!prev) return null

        return {
          ...prev,
          loading: false,
          queryString,
          orgTotal,
          localOrgTotal,
          expertTotal: expertTotals.expertTotal,
          localExpertTotal: expertTotals.localExpertTotal,
        }
      })
    })()
  }, [externalRegionValue, nodeKeywords, selectedCity])

  const handleNodeInspect = useCallback((node: IndustryGraphNode, event: IElementEvent) => {
    onNodeContextSelect?.(node)
    handleLeafClick(node, event)
  }, [handleLeafClick, onNodeContextSelect])

  const loadDrawerData = useCallback((
    type: 'orgs' | 'experts',
    nodeName: string,
    regionValue: string[],
    page: number,
    orgTag = '',
  ) => {
    setDrawer((prev) => ({ ...prev, loading: true }))
    const region = resolveIndustryRegionFromCascader(regionValue)

    void (async () => {
      if (type === 'orgs') {
        const tagFilter = normalizeOrgTagFilter(orgTag)
        const result = await searchChainOrgs(
          nodeName,
          region.province,
          region.city,
          tagFilter || undefined,
          page,
          10,
        )
        setDrawer((prev) => ({
          ...prev,
          loading: false,
          data: result.items,
          total: result.total,
          page,
        }))
        return
      }

      if (type === 'experts') {
        const result = await searchChainTalents(
          nodeName,
          region.province || undefined,
          region.city || undefined,
          page,
          10,
        )
        setDrawer((prev) => ({
          ...prev,
          loading: false,
          data: result.items,
          total: result.total,
          page,
        }))
        return
      }

    })().catch(() => {
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

    const currentPopover = popover
    const drawerNodeName = stripStagePrefix(currentPopover.node.name) || currentPopover.node.name
    const region = externalRegionValue || ['hubei', 'yichang']
    const nextRegion = resolveIndustryRegionFromCascader(region)

    const showDrawer = () => {
      setDrawer({
        visible: true,
        type,
        nodeName: drawerNodeName,
        queryString: currentPopover.queryString,
        city: nextRegion.city || '',
        regionValue: region,
        loading: true,
        data: [],
        total: 0,
        page: 1,
        orgTag: '',
      })

      loadDrawerData(
        type,
        drawerNodeName,
        region,
        1,
        '',
      )
    }

    setPopover(null)

    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => undefined).finally(showDrawer)
      return
    }

    showDrawer()
  }, [externalRegionValue, loadDrawerData, popover])

  const handleDrawerRegionChange = useCallback((value: string[]) => {
    const nextRegion = resolveIndustryRegionFromCascader(value)

    setDrawer((prev) => {
      loadDrawerData(prev.type, prev.nodeName, value, 1, prev.orgTag)
      return {
        ...prev,
        city: nextRegion.city || '',
        regionValue: value,
        page: 1,
      }
    })
  }, [loadDrawerData])

  const handleDrawerOrgTagChange = useCallback((value?: string) => {
    const nextTag = normalizeOrgTagFilter(value)

    setDrawer((prev) => {
      loadDrawerData(prev.type, prev.nodeName, prev.regionValue, 1, nextTag)
      return {
        ...prev,
        orgTag: nextTag,
        page: 1,
      }
    })
  }, [loadDrawerData])

  const handleDrawerTypeChange = useCallback((activeKey: string) => {
    const nextType = activeKey === 'experts' ? 'experts' : 'orgs'
    const nextOrgTag = nextType === 'orgs' ? drawer.orgTag : ''

    setDrawer((prev) => ({
      ...prev,
      type: nextType,
      orgTag: nextOrgTag,
      data: [],
      total: 0,
      page: 1,
      loading: true,
    }))
    loadDrawerData(
      nextType,
      drawer.nodeName,
      drawer.regionValue,
      1,
      nextOrgTag,
    )
  }, [
    drawer.nodeName,
    drawer.orgTag,
    drawer.regionValue,
    loadDrawerData,
  ])

  const openEnterpriseDetail = useCallback((record: Record<string, unknown>) => {
    const name = String(record.NAME || record.name || '未知企业')
    const id = String(record.ID || record.id || name)
    const params = new URLSearchParams({
      name,
      region: `${record.PROV || record.prov || ''}${record.CITY || record.city ? ` ${record.CITY || record.city}` : ''}`.trim(),
      tags: ((record.TAGS || record.tags || []) as string[]).join(','),
      back: '/industry',
    })
    // 新开页签，保留当前页的气泡/抽屉状态；详情页"返回上一级"会关闭页签
    window.open(`/industry/enterprise/${encodeURIComponent(id)}?${params.toString()}`, '_blank')
  }, [])

  const openTalentDetail = useCallback((record: Record<string, unknown>) => {
    const id = String(record.ID || record.id || record.auid || '')
    if (!id) return
    window.open(`/industry/talent/${encodeURIComponent(id)}`, '_blank')
  }, [])

  const handleExportDrawerData = useCallback(() => {
    const typeLabel = drawer.type === 'orgs' ? '相关企业' : '相关人才'
    exportRecordsCsv(drawer.data, `${drawer.nodeName}-${typeLabel}`)
    message.success(`已导出${typeLabel}列表`)
  }, [drawer.data, drawer.nodeName, drawer.type, message])

  const popoverStatus = popover
    ? (popover.loading ? 'analyzing' : getEffectiveStatus(popover.node))
    : null
  const popoverDisplayName = popover
    ? (stripStagePrefix(popover.node.name) || popover.node.name)
    : ''
  const drawerDisplayName = stripStagePrefix(drawer.nodeName) || drawer.nodeName
  const popoverProfileText = popover
    ? getIndustryNodeProfileText(popover.node.name, { queryString: popover.queryString })
    : ''
  const drawerProfileText = drawer.nodeName
    ? getIndustryNodeProfileText(drawer.nodeName, { queryString: drawer.queryString })
    : ''
  const popoverPortalTarget = document.fullscreenElement || document.body

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
          {summaryLabel && (
            <div className="chain-summary-tip">{summaryLabel}</div>
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
            {STREAMS.map((stream) => {
              const streamRoots = getRenderableStreamRoots(graphData[stream].root, stream)

              return (
                <div key={stream} className={`chain-stage-column stream-${stream}`} onClick={(event) => event.stopPropagation()}>
                  {streamRoots.map((root) => (
                    <StreamGraph
                      key={root.id}
                      streamKey={stream}
                      root={root}
                      getStatus={getEffectiveStatus}
                      collapsedIds={new Set(collapsedByStream[stream])}
                      onToggleNode={handleToggleNode}
                      onLeafClick={handleLeafClick}
                      onNodeInspect={handleNodeInspect}
                      onCanvasClick={() => setPopover(null)}
                      registerGraph={registerGraph}
                      unregisterGraph={unregisterGraph}
                      onViewportChange={mirrorViewport}
                      selfAdjustingRef={selfAdjustingRef}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {popover && createPortal(
        <div className="chain-popover-portal" style={{ left: popover.screenX, top: popover.screenY }}>
          <div className="chain-popover-header">
            <Text strong style={{ fontSize: 15 }}>
              {popoverDisplayName}
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
              <div className="chain-popover-intro">
                <div className="chain-popover-intro-title">节点介绍</div>
                <div>{popoverProfileText}</div>
              </div>
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
                message.success(`已将“${popoverDisplayName}”加入清单`)
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
        popoverPortalTarget,
      )}

      <Drawer
        title={(
          <div className="industry-drawer-title">
            {drawer.type === 'orgs' ? <BankOutlined /> : <TeamOutlined />}
            <span>{drawerDisplayName}</span>
            {drawer.total > 0 && <Tag color="blue">{drawer.total.toLocaleString()}</Tag>}
          </div>
        )}
        open={drawer.visible}
        onClose={() => setDrawer((prev) => ({ ...prev, visible: false }))}
        width={960}
        rootClassName="industry-data-drawer-root"
        destroyOnClose
      >
        <div className="industry-drawer-intro">
          <div className="industry-drawer-intro-title">产业链节点介绍</div>
          <div className="industry-drawer-intro-text">{drawerProfileText}</div>
        </div>

        <Tabs
          className="industry-drawer-tabs"
          activeKey={drawer.type}
          onChange={handleDrawerTypeChange}
          items={[
            {
              key: 'orgs',
              label: (
                <span>
                  <BankOutlined />
                  相关企业
                </span>
              ),
            },
            {
              key: 'experts',
              label: (
                <span>
                  <TeamOutlined />
                  相关人才
                </span>
              ),
            },
          ]}
        />

        <div className="industry-drawer-toolbar">
          <div className="industry-drawer-filter">
            <EnvironmentOutlined />
            <span>地区筛选：</span>
            <Cascader
              options={allRegionOptions}
              value={drawer.regionValue.length > 0 ? drawer.regionValue : ['__all__']}
              onChange={(value) => {
                const nextValue = (value || []) as string[]

                if (nextValue.length === 0 || nextValue[0] === '__all__') {
                  setDrawer((prev) => {
                    loadDrawerData(prev.type, prev.nodeName, [], 1, prev.orgTag)
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
          {drawer.type === 'orgs' && (
            <div className="industry-drawer-filter">
              <span>企业类型：</span>
              <Select
                allowClear
                size="small"
                style={{ width: 190 }}
                placeholder="全部企业类型"
                value={drawer.orgTag || undefined}
                onChange={handleDrawerOrgTagChange}
                options={ORG_TAG_FILTER_OPTIONS.map((tag) => ({ label: tag, value: tag }))}
              />
            </div>
          )}
          <Button
            icon={<DownloadOutlined />}
            disabled={drawer.data.length === 0}
            onClick={handleExportDrawerData}
          >
            批量导出
          </Button>
        </div>

        <div style={{ display: 'none' }}>
          <EnvironmentOutlined style={{ color: '#2468F2' }} />
          <span style={{ fontSize: 13, color: '#666' }}>地区筛选：</span>
          <Cascader
            options={allRegionOptions}
            value={drawer.regionValue.length > 0 ? drawer.regionValue : ['__all__']}
            onChange={(value) => {
              const nextValue = (value || []) as string[]

              if (nextValue.length === 0 || nextValue[0] === '__all__') {
                setDrawer((prev) => {
                  loadDrawerData(prev.type, prev.nodeName, [], 1, prev.orgTag)
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
          className="industry-drawer-table"
          columns={drawer.type === 'orgs' ? orgDrawerColumns : expertDrawerColumns}
          dataSource={drawer.data}
          rowKey={(_, index) => String(index)}
          loading={drawer.loading}
          size="small"
          rowClassName={() => `industry-drawer-row industry-drawer-row-${drawer.type === 'orgs' ? 'org' : 'expert'}`}
          onRow={(record) => ({
            onClick: () => {
              if (drawer.type === 'orgs') openEnterpriseDetail(record)
              else openTalentDetail(record)
            },
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: drawer.page,
            total: Math.min(drawer.total, 100),
            pageSize: 10,
            showSizeChanger: false,
            showTotal: () => `共 ${drawer.total.toLocaleString()} 条`,
            onChange: (page) => {
              loadDrawerData(drawer.type, drawer.nodeName, drawer.regionValue, page, drawer.orgTag)
              setDrawer((prev) => ({ ...prev, page }))
            },
          }}
        />
      </Drawer>
    </>
  )
}
