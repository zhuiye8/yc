/**
 * 产业图谱组件 — 纯 React + CSS
 * - 默认展示2层（根+一级），点击展开下级
 * - 三列布局，聚焦某列时宽度变化
 * - 浮窗渲染在 portal 中避免被裁切
 */
import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Tag, Button, Space, Typography, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { IndustryGraphNode } from '@/mock/data'
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
}

const STATUS_COLORS: Record<string, string> = {
  strong: '#2468F2', weak: '#7BA3FA', missing: '#BFC8D6',
}
const STATUS_LABELS: Record<string, string> = {
  strong: '强链', weak: '弱链', missing: '缺链',
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

// ========== 主组件 ==========
export default function IndustryChainGraph({ graphData, onNodeAction }: Props) {
  const { message } = App.useApp()
  const [focusedStream, setFocusedStream] = useState<StreamKey | null>(null)

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    ;(['upstream', 'midstream', 'downstream'] as StreamKey[]).forEach(sk => {
      ids.add(graphData[sk].root.id)
    })
    return ids
  })

  const [popover, setPopover] = useState<{
    node: IndustryGraphNode; screenX: number; screenY: number
  } | null>(null)

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
    setPopover({ node, screenX: rect.right + 8, screenY: rect.top - 10 })
  }, [])

  const streams: StreamKey[] = ['upstream', 'midstream', 'downstream']
  const headers = ['上 游', '中 游', '下 游']

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

      {popover && createPortal(
        <div className="chain-popover-portal"
          style={{ left: popover.screenX, top: popover.screenY }}>
          <div className="chain-popover-header">
            <Text strong style={{ fontSize: 15 }}>{popover.node.name}</Text>
            <Tag color={STATUS_COLORS[popover.node.status]}>{STATUS_LABELS[popover.node.status]}</Tag>
          </div>
          <div className="chain-popover-stats">
            <div>企业 <Text strong>{popover.node.enterprises}</Text> 家 | 人才 <Text strong>{popover.node.talents}</Text> 人</div>
            <div>本地企业 <Text strong>{popover.node.localEnterprises}</Text> 家 | 本地人才 <Text strong>{popover.node.localTalents}</Text> 人</div>
          </div>
          <Space style={{ marginTop: 10 }} wrap>
            <Button type="link" size="small" onClick={() => { setPopover(null); onNodeAction?.('enterprises', popover.node) }}>相关企业</Button>
            <Button type="link" size="small" onClick={() => { setPopover(null); onNodeAction?.('talent', popover.node) }}>相关人才</Button>
          </Space>
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
    </>
  )
}
