import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { Graph } from '@antv/g6'
import type { Graph as G6Graph, GraphData } from '@antv/g6'

import type { GraphLink, GraphNode } from '@/services/talent'
import styles from './TalentRelationGraph.module.scss'

const GRAPH_HEIGHT = 460

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
  currentName?: string
  onSearch?: (keyword: string) => void
  candidates?: Record<string, unknown>[]
  showCandidates?: boolean
  onSelectCandidate?: (candidate: Record<string, unknown>) => void
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
    const baseSize = category === 'center' ? 34 : category === 'direct' ? 18 : category === 'indirect' ? 14 : 11
    const sizeBoost = Math.min(hValue * 0.18, category === 'center' ? 12 : 7)

    return {
      id: node.id,
      label: String(node.name || '未知'),
      org: String(node.org || ''),
      h: hValue,
      category,
      size: baseSize + sizeBoost,
      labelText: String(node.name || ''),
      labelFontSize:
        category === 'center'
          ? 12
          : category === 'direct'
            ? 10
            : category === 'indirect'
              ? 8.5
              : 7.5,
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
  const glowColor =
    category === 'center'
      ? 'rgba(75, 180, 255, 0.72)'
      : category === 'direct'
        ? 'rgba(73, 151, 255, 0.58)'
        : category === 'indirect'
          ? 'rgba(56, 123, 255, 0.44)'
          : 'rgba(52, 104, 230, 0.32)'

  return {
    size,
    fill: isCenter ? '#57c6ff' : '#3e84ff',
    fillOpacity: isCenter ? 0.98 : category === 'direct' ? 0.92 : 0.82,
    stroke: isCenter ? '#d7fbff' : '#8ac2ff',
    lineWidth: isCenter ? 2 : 1.2,
    shadowColor: glowColor,
    shadowBlur: isCenter ? 28 : category === 'direct' ? 18 : 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    labelText: String(datum.labelText || ''),
    labelPlacement: 'center' as const,
    labelFill:
      category === 'center'
        ? 'rgba(244, 251, 255, 0.98)'
        : category === 'direct'
          ? 'rgba(244, 251, 255, 0.88)'
          : category === 'indirect'
            ? 'rgba(244, 251, 255, 0.72)'
            : 'rgba(244, 251, 255, 0.56)',
    labelFontSize: Number(datum.labelFontSize || 10),
    labelFontWeight: isCenter ? 600 : 500,
    labelBackground: false,
  }
}

function getEdgeStyle(datum: Record<string, unknown>) {
  const strength = Number(datum.strength || 1)

  return {
    stroke: 'rgba(92, 145, 255, 0.28)',
    lineWidth: Math.min(2, 0.9 + strength * 0.25),
    opacity: 0.9,
  }
}

export default function TalentRelationGraph({
  nodes,
  links,
  centerAuid,
  currentName,
  onSearch,
  candidates = [],
  showCandidates = false,
  onSelectCandidate,
}: TalentRelationGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<G6Graph | null>(null)
  const [width, setWidth] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  const graphData = useMemo(() => buildRelationData(nodes, links, centerAuid), [nodes, links, centerAuid])

  useEffect(() => {
    setSearchValue(currentName || '')
  }, [currentName])

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
      padding: [42, 36, 28, 36],
      zoomRange: [0.55, 2.4],
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
        alphaDecay: 0.08,
        velocityDecay: 0.28,
        center: {
          x: width / 2,
          y: GRAPH_HEIGHT / 2,
          strength: 0.14,
        },
        link: {
          distance: (datum: Record<string, unknown>) => {
            const strength = Number(datum.strength || 1)
            return Math.max(68, 120 - strength * 10)
          },
          strength: 0.3,
        },
        collide: {
          radius: (datum: Record<string, unknown>) => Number(datum.size || 12) + 14,
          strength: 0.9,
        },
        radial: {
          x: width / 2,
          y: GRAPH_HEIGHT / 2,
          radius: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'related') as RelationCategory
            if (category === 'center') return 0
            if (category === 'direct') return 96
            if (category === 'indirect') return 156
            return 220
          },
          strength: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'related') as RelationCategory
            return category === 'center' ? 1 : 0.14
          },
        },
        manyBody: {
          strength: (datum: Record<string, unknown>) => {
            const category = String(datum.category || 'related') as RelationCategory
            return category === 'center' ? -320 : category === 'direct' ? -160 : -92
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas'],
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

  const handleSearch = () => {
    const value = searchValue.trim()
    if (!value || !onSearch) return
    onSearch(value)
  }

  return (
    <div className={styles.graphRoot}>
      <div className={styles.inlineSearch}>
        <input
          className={styles.searchInput}
          value={searchValue}
          placeholder="输入人才姓名..."
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSearch()
          }}
        />
        <button type="button" className={styles.searchButton} onClick={handleSearch} aria-label="搜索人才">
          <SearchOutlined />
        </button>
      </div>
      {showCandidates && candidates.length > 0 && (
        <div className={styles.searchDropdown}>
          {candidates.map((candidate, index) => {
            const field = (candidate.CATE as string[])?.[0] || ''
            const title = Array.isArray(candidate.TITLE) ? String((candidate.TITLE as string[])[0] || '') : String(candidate.TITLE || '')

            return (
              <button
                key={`${String(candidate.ID || index)}-${index}`}
                type="button"
                className={styles.searchOption}
                onClick={() => onSelectCandidate?.(candidate)}
              >
                <span className={styles.optionAvatar}>{String(candidate.CNAME || '?').slice(0, 1)}</span>
                <span className={styles.optionBody}>
                  <span className={styles.optionTitleRow}>
                    <span className={styles.optionName}>{String(candidate.CNAME || '未知人才')}</span>
                    {title ? <span className={styles.optionMeta}>{title}</span> : null}
                  </span>
                  <span className={styles.optionOrg}>{String(candidate.AORG || '')}</span>
                </span>
                {field ? <span className={styles.optionTag}>{field}</span> : null}
              </button>
            )
          })}
        </div>
      )}
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
