import { useEffect, useMemo, useRef, useState } from 'react'
import { Graph } from '@antv/g6'
import type { Graph as G6Graph, GraphData, IElementEvent } from '@antv/g6'
import { DownloadOutlined, ReloadOutlined, SearchOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'

import type { GraphLink, GraphNode } from '@/services/talent'
import styles from './TalentRelationGraph.module.scss'

const GRAPH_HEIGHT = 620

type RelationFilter = 'all' | 'coauthor' | 'org' | 'tech' | 'chainRoot' | 'chain'
type RelationCategory = 'center' | 'coauthor' | 'org' | 'tech' | 'chainRoot' | 'chain'

interface RelationNode extends Record<string, unknown> {
  id: string
  label: string
  org: string
  category: RelationCategory
  size: number
  labelText: string
}

interface RelationEdge extends Record<string, unknown> {
  id: string
  source: string
  target: string
  relationType: string
}

interface TalentRelationGraphProps {
  nodes: GraphNode[]
  links: GraphLink[]
  centerAuid: string
  centerName?: string
  onNodeClick?: (nodeId: string) => void
  onSearch?: (keyword: string) => void
}

const filterOptions: Array<{ value: RelationFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'coauthor', label: '专家合作' },
  { value: 'org', label: '专家关联企业' },
  { value: 'tech', label: '专家关联技术' },
  { value: 'chainRoot', label: '专家关联产业链根节点' },
  { value: 'chain', label: '专家所属产业链' },
]

function getCategory(node: GraphNode, centerAuid: string): RelationCategory {
  if (node.id === centerAuid) return 'center'
  if (node.class === 'ORG') return 'org'
  if (node.class === 'TECH') return 'tech'
  if (node.class === 'CHAIN_ROOT') return 'chainRoot'
  if (node.class === 'CHAIN') return 'chain'
  return 'coauthor'
}

function getVisibleCategory(filter: RelationFilter): RelationCategory | null {
  if (filter === 'all') return null
  if (filter === 'chainRoot') return 'chainRoot'
  return filter
}

function buildRelationData(
  nodes: GraphNode[],
  links: GraphLink[],
  centerAuid: string,
  filter: RelationFilter,
): { data: GraphData; visibleNodes: RelationNode[] } {
  const visibleCategory = getVisibleCategory(filter)
  const normalizedNodes = nodes
    .filter((node) => node.id)
    .map((node) => {
      const category = getCategory(node, centerAuid)
      const labelText = String(node.name || '')
      const isCenter = category === 'center'
      const isMajor = category === 'coauthor' || category === 'org'

      return {
        id: String(node.id),
        label: labelText,
        org: String(node.org || ''),
        category,
        size: isCenter ? 76 : isMajor ? 62 : 56,
        labelText,
      }
    })

  const visibleNodes = normalizedNodes.filter((node) => (
    node.category === 'center' || visibleCategory === null || node.category === visibleCategory
  ))
  const visibleIds = new Set(visibleNodes.map((node) => node.id))
  const edgeSource = links.length > 0 ? links : []

  const graphEdges: RelationEdge[] = edgeSource
    .filter((link) => visibleIds.has(String(link.source)) && visibleIds.has(String(link.target)))
    .map((link, index) => ({
      id: `edge-${index}-${String(link.source)}-${String(link.target)}`,
      source: String(link.source),
      target: String(link.target),
      relationType: String(link.type || link.relationType || ''),
    }))

  return {
    data: { nodes: visibleNodes, edges: graphEdges },
    visibleNodes,
  }
}

function getNodeStyle(datum: Record<string, unknown>) {
  const category = String(datum.category || 'coauthor') as RelationCategory
  const palette: Record<RelationCategory, { fill: string; stroke: string; shadow: string; label: string }> = {
    center: { fill: '#5ba1ef', stroke: '#4a92e7', shadow: 'rgba(42, 118, 252, 0.22)', label: '#ffffff' },
    coauthor: { fill: '#5ba1ef', stroke: '#4c93e7', shadow: 'rgba(42, 118, 252, 0.16)', label: '#ffffff' },
    org: { fill: '#ee7041', stroke: '#dd5c32', shadow: 'rgba(238, 112, 65, 0.2)', label: '#ffffff' },
    tech: { fill: '#4ebdbd', stroke: '#31aaaa', shadow: 'rgba(19, 193, 193, 0.2)', label: '#ffffff' },
    chainRoot: { fill: '#e2ad2f', stroke: '#d39b1f', shadow: 'rgba(226, 173, 47, 0.2)', label: '#ffffff' },
    chain: { fill: '#e64e47', stroke: '#cf443f', shadow: 'rgba(230, 78, 71, 0.2)', label: '#ffffff' },
  }
  const color = palette[category]
  const size = Number(datum.size || 56)

  return {
    size,
    fill: color.fill,
    stroke: color.stroke,
    lineWidth: category === 'center' ? 2.5 : 1.4,
    shadowColor: color.shadow,
    shadowBlur: category === 'center' ? 24 : 14,
    labelText: String(datum.labelText || ''),
    labelPlacement: 'center' as const,
    labelFill: color.label,
    labelFontSize: category === 'center' ? 13 : 11,
    labelFontWeight: 600,
    labelWordWrap: true,
    labelMaxWidth: Math.max(46, size - 12),
    labelTextOverflow: 'ellipsis',
  }
}

function getEdgeStyle(datum: Record<string, unknown>) {
  const relationType = String(datum.relationType || '')
  const isCooperate = relationType === 'COOPERATE'

  return {
    stroke: isCooperate ? '#4f9bf4' : '#2f8de9',
    lineWidth: isCooperate ? 1.1 : 1,
    opacity: 0.72,
    endArrow: true,
    labelText: relationType === 'COAUTHOR'
      ? '专家合作'
      : relationType === 'TECH'
        ? '关联技术'
        : relationType === 'CHAIN_ROOT'
          ? '产业链'
          : '',
    labelFontSize: 9,
    labelFill: '#7b8796',
    labelBackground: true,
    labelBackgroundFill: 'rgba(255, 255, 255, 0.72)',
  }
}

function downloadCanvas(container: HTMLDivElement | null) {
  const canvas = container?.querySelector('canvas')
  if (!canvas) return
  const link = document.createElement('a')
  link.download = '人才图谱.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export default function TalentRelationGraph({
  nodes,
  links,
  centerAuid,
  centerName,
  onNodeClick,
  onSearch,
}: TalentRelationGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<G6Graph | null>(null)
  const onNodeClickRef = useRef(onNodeClick)
  const [width, setWidth] = useState(0)
  const [activeFilter, setActiveFilter] = useState<RelationFilter>('all')
  // 内层搜索框：默认填当前人才名，可改名后回车/点按钮重新检索
  // 当外部 centerName 变化（搜到新人才）时，在渲染期同步重置输入框（React 官方推荐写法，避免 effect）
  const [keyword, setKeyword] = useState(centerName || '')
  const [syncedCenterName, setSyncedCenterName] = useState(centerName)
  if (centerName !== syncedCenterName) {
    setSyncedCenterName(centerName)
    setKeyword(centerName || '')
  }

  const triggerSearch = () => {
    const kw = keyword.trim()
    if (kw) onSearch?.(kw)
  }

  const { data: graphData, visibleNodes } = useMemo(
    () => buildRelationData(nodes, links, centerAuid, activeFilter),
    [activeFilter, centerAuid, links, nodes],
  )
  const visibleNodeMap = useMemo(() => new Map(visibleNodes.map((node) => [node.id, node])), [visibleNodes])

  useEffect(() => {
    onNodeClickRef.current = onNodeClick
  }, [onNodeClick])

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.floor(entries[0]?.contentRect.width || 0)
      setWidth((prev) => (prev === nextWidth ? prev : nextWidth))
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current || width === 0) return

    const graph = new Graph({
      container: containerRef.current,
      width,
      height: GRAPH_HEIGHT,
      autoResize: false,
      animation: true,
      padding: [74, 52, 52, 52],
      zoomRange: [0.35, 2.4],
      data: graphData,
      node: {
        type: 'circle',
        style: (datum) => getNodeStyle(datum as Record<string, unknown>),
      },
      edge: {
        type: 'line',
        style: (datum) => getEdgeStyle(datum as Record<string, unknown>),
      },
      layout: {
        type: 'd3-force',
        alphaDecay: 0.035,
        velocityDecay: 0.34,
        center: { x: width / 2, y: GRAPH_HEIGHT / 2, strength: 0.14 },
        link: {
          distance: (datum: Record<string, unknown>) => {
            const relationType = String(datum.relationType || '')
            if (relationType === 'TECH') return 150
            if (relationType === 'CHAIN_ROOT' || relationType === 'CHAIN') return 170
            return 118
          },
          strength: 0.46,
        },
        collide: {
          radius: (datum: Record<string, unknown>) => Number(datum.size || 56) / 2 + 22,
          strength: 1,
        },
        manyBody: {
          strength: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'coauthor') as RelationCategory
            return category === 'center' ? -720 : -260
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    })

    graph.on('node:click', (event: IElementEvent) => {
      const targetId = String(event.target.id || '')
      const node = visibleNodeMap.get(targetId)
      if (targetId && node?.category === 'coauthor') onNodeClickRef.current?.(targetId)
    })

    graphRef.current = graph

    void (async () => {
      await graph.render()
      await graph.fitView({ when: 'always', direction: 'both' })
      await graph.fitCenter()
    })()

    return () => {
      graph.destroy()
      graphRef.current = null
    }
  }, [graphData, visibleNodeMap, width])

  const resetView = () => {
    void graphRef.current?.fitView({ when: 'always', direction: 'both' })
    void graphRef.current?.fitCenter()
  }

  const zoomBy = (ratio: number) => {
    const graph = graphRef.current as unknown as { zoomBy?: (ratio: number) => void }
    graph.zoomBy?.(ratio)
  }

  return (
    <div className={styles.graphRoot}>
      <div className={styles.topBar}>
        <div className={styles.searchDock}>
          <input
            className={styles.searchInput}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') triggerSearch() }}
            placeholder="输入人才姓名搜索"
          />
          <button className={styles.searchButton} type="button" onClick={triggerSearch}>
            <SearchOutlined />
            搜索
          </button>
        </div>

        <div className={styles.filterBar}>
          {filterOptions.map((option) => (
            <label key={option.value} className={styles.filterItem}>
              <input
                type="radio"
                checked={activeFilter === option.value}
                onChange={() => setActiveFilter(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div ref={containerRef} className={styles.graphCanvas} />

      <div className={styles.floatTools}>
        <button type="button" onClick={() => zoomBy(1.18)} title="放大">
          <ZoomInOutlined />
          <span>放大</span>
        </button>
        <button type="button" onClick={() => zoomBy(0.84)} title="缩小">
          <ZoomOutOutlined />
          <span>缩小</span>
        </button>
        <button type="button" onClick={resetView} title="刷新视图">
          <ReloadOutlined />
          <span>刷新</span>
        </button>
        <button type="button" onClick={() => downloadCanvas(containerRef.current)} title="下载图谱">
          <DownloadOutlined />
          <span>下载</span>
        </button>
      </div>
    </div>
  )
}
