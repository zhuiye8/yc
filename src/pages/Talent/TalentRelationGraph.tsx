import { useEffect, useMemo, useRef, useState } from 'react'
import { Graph } from '@antv/g6'
import type { Graph as G6Graph, GraphData, IElementEvent } from '@antv/g6'

import type { GraphLink, GraphNode } from '@/services/talent'
import styles from './TalentRelationGraph.module.scss'

const GRAPH_HEIGHT = 420

type RelationCategory = 'center' | 'direct' | 'indirect' | 'related'

interface RelationNode extends Record<string, unknown> {
  id: string
  label: string
  org: string
  h: number
  category: RelationCategory
  size: number
  labelText: string
  labelFontSize: number
}

interface RelationEdge extends Record<string, unknown> {
  id: string
  source: string
  target: string
  strength: number
}

interface TalentRelationGraphProps {
  nodes: GraphNode[]
  links: GraphLink[]
  centerAuid: string
  onNodeClick?: (nodeId: string) => void
}

function buildRelationData(nodes: GraphNode[], links: GraphLink[], centerAuid: string): GraphData {
  const personNodes = nodes.filter((node) => node.class === 'PERSON')
  const personIds = new Set(personNodes.map((node) => node.id))
  const personLinks = links.filter((link) => personIds.has(String(link.source)) && personIds.has(String(link.target)))

  const directSet = new Set<string>()
  personLinks.forEach((link) => {
    const source = String(link.source)
    const target = String(link.target)

    if (source === centerAuid && target !== centerAuid) directSet.add(target)
    if (target === centerAuid && source !== centerAuid) directSet.add(source)
  })

  const indirectSet = new Set<string>()
  personLinks.forEach((link) => {
    const source = String(link.source)
    const target = String(link.target)

    if (directSet.has(source) && target !== centerAuid && !directSet.has(target)) indirectSet.add(target)
    if (directSet.has(target) && source !== centerAuid && !directSet.has(source)) indirectSet.add(source)
  })

  const graphNodes: RelationNode[] = personNodes.map((node) => {
    let category: RelationCategory = 'related'

    if (node.id === centerAuid) category = 'center'
    else if (directSet.has(node.id)) category = 'direct'
    else if (indirectSet.has(node.id)) category = 'indirect'

    const hValue = Number(node.h || 0)
    const baseSize = category === 'center' ? 38 : category === 'direct' ? 18 : category === 'indirect' ? 14 : 11
    const sizeBoost = Math.min(hValue * 0.16, category === 'center' ? 12 : 5)

    return {
      id: node.id,
      label: String(node.name || '未知人才'),
      org: String(node.org || ''),
      h: hValue,
      category,
      size: baseSize + sizeBoost,
      labelText: String(node.name || ''),
      labelFontSize:
        category === 'center'
          ? 12
          : category === 'direct'
            ? 9.5
            : category === 'indirect'
              ? 8
              : 7,
    }
  })

  const graphEdges: RelationEdge[] = personLinks.map((link, index) => ({
    id: `edge-${index}-${String(link.source)}-${String(link.target)}`,
    source: String(link.source),
    target: String(link.target),
    strength: Number(link.value || 1),
  }))

  return { nodes: graphNodes, edges: graphEdges }
}

function getNodeStyle(datum: Record<string, unknown>) {
  const category = String(datum.category || 'related') as RelationCategory
  const size = Number(datum.size || 12)
  const isCenter = category === 'center'
  const labelPlacement: 'center' | 'bottom' = isCenter ? 'center' : 'bottom'
  const glowColor =
    category === 'center'
      ? 'rgba(101, 212, 255, 0.78)'
      : category === 'direct'
        ? 'rgba(85, 149, 255, 0.56)'
        : category === 'indirect'
          ? 'rgba(76, 121, 255, 0.36)'
          : 'rgba(71, 115, 210, 0.2)'

  return {
    size,
    fill: isCenter ? '#66d6ff' : category === 'direct' ? '#4b8bff' : '#2f6fff',
    fillOpacity: isCenter ? 0.98 : category === 'direct' ? 0.94 : category === 'indirect' ? 0.84 : 0.68,
    stroke: isCenter ? '#e4fbff' : '#97c9ff',
    lineWidth: isCenter ? 2.5 : 1.2,
    shadowColor: glowColor,
    shadowBlur: isCenter ? 34 : category === 'direct' ? 18 : 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    labelText: String(datum.labelText || ''),
    labelPlacement,
    labelFill:
      category === 'center'
        ? 'rgba(244, 251, 255, 0.98)'
        : category === 'direct'
          ? 'rgba(231, 241, 255, 0.96)'
          : category === 'indirect'
            ? 'rgba(215, 228, 255, 0.78)'
            : 'rgba(203, 218, 245, 0.56)',
    labelFontSize: Number(datum.labelFontSize || 10),
    labelFontWeight: isCenter ? 600 : 500,
    labelBackground: false,
  }
}

function getEdgeStyle(datum: Record<string, unknown>) {
  const strength = Number(datum.strength || 1)

  return {
    stroke: 'rgba(95, 157, 255, 0.3)',
    lineWidth: Math.min(2.2, 1 + strength * 0.22),
    opacity: 0.95,
  }
}

export default function TalentRelationGraph({ nodes, links, centerAuid, onNodeClick }: TalentRelationGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<G6Graph | null>(null)
  const onNodeClickRef = useRef(onNodeClick)
  const [width, setWidth] = useState(0)

  const graphData = useMemo(() => buildRelationData(nodes, links, centerAuid), [nodes, links, centerAuid])

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
      padding: [26, 28, 22, 28],
      zoomRange: [0.75, 1.8],
      data: graphData,
      node: {
        type: 'circle',
        style: (datum) => getNodeStyle(datum as Record<string, unknown>),
      },
      edge: {
        type: 'quadratic',
        style: (datum) => getEdgeStyle(datum as Record<string, unknown>),
      },
      layout: {
        type: 'd3-force',
        alphaDecay: 0.12,
        velocityDecay: 0.42,
        center: {
          x: width / 2,
          y: GRAPH_HEIGHT / 2,
          strength: 0.24,
        },
        link: {
          distance: (datum: Record<string, unknown>) => {
            const strength = Number(datum.strength || 1)
            return Math.max(44, 82 - strength * 8)
          },
          strength: 0.58,
        },
        collide: {
          radius: (datum: Record<string, unknown>) => Number(datum.size || 12) + 10,
          strength: 1,
        },
        radial: {
          x: width / 2,
          y: GRAPH_HEIGHT / 2,
          radius: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'related') as RelationCategory
            if (category === 'center') return 0
            if (category === 'direct') return 112
            if (category === 'indirect') return 168
            return 220
          },
          strength: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'related') as RelationCategory
            return category === 'center' ? 1 : category === 'direct' ? 0.5 : 0.22
          },
        },
        manyBody: {
          strength: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'related') as RelationCategory
            return category === 'center' ? -380 : category === 'direct' ? -120 : -60
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas'],
    })

    graph.on('node:click', (event: IElementEvent) => {
      const targetId = String(event.target.id || '')
      if (targetId) onNodeClickRef.current?.(targetId)
    })

    graphRef.current = graph

    void (async () => {
      await graph.render()
      await graph.fitCenter()
    })()

    return () => {
      graph.destroy()
      graphRef.current = null
    }
  }, [graphData, width])

  return (
    <div className={styles.graphRoot}>
      <div className={styles.legend}>
        <span className={`${styles.legendItem} ${styles.legendCenter}`}>搜索人才</span>
        <span className={`${styles.legendItem} ${styles.legendDirect}`}>紧密合作</span>
        <span className={`${styles.legendItem} ${styles.legendIndirect}`}>研究方向</span>
        <span className={`${styles.legendItem} ${styles.legendRelated}`}>领域相关</span>
      </div>
      <div ref={containerRef} className={styles.graphCanvas} />
    </div>
  )
}
