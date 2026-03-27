/**
 * 产业图谱组件 — 纯 React + CSS 实现
 * 替代 ECharts tree，解决文字截断、自动缩放等问题
 *
 * 特性：
 * - 上中下游三列布局，默认 30/30/30，聚焦某列时 50/20/20
 * - 默认只展示2层（根 + 一级子节点），点击一级节点展开其子节点
 * - 节点宽度自适应文字，永不截断
 * - 强链/弱链/缺链用颜色 + 边框样式区分
 * - 点击叶节点弹出详情卡片
 */
import React, { useState, useCallback } from 'react';
import { Tag, Button, Space, Typography, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { IndustryGraphNode } from '../mock/data';

const { Text } = Typography;

type StreamKey = 'upstream' | 'midstream' | 'downstream';

interface IndustryGraphSet {
  upstream: { label: string; root: IndustryGraphNode };
  midstream: { label: string; root: IndustryGraphNode };
  downstream: { label: string; root: IndustryGraphNode };
}

interface Props {
  graphData: IndustryGraphSet;
  headers: [string, string, string];
  statusColorMap: Record<string, string>;
  statusLabelMap: Record<string, string>;
  onNodeAction?: (action: 'enterprises' | 'talent' | 'addList', node: IndustryGraphNode) => void;
}

// ==================== 节点组件 ====================
const TreeNode: React.FC<{
  node: IndustryGraphNode;
  depth: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onLeafClick: (node: IndustryGraphNode, el: HTMLElement) => void;
  statusColorMap: Record<string, string>;
  compact: boolean;
}> = ({ node, depth, expandedNodes, onToggle, onLeafClick, statusColorMap, compact }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const nodeColor = statusColorMap[node.status] || '#2468F2';
  const textColor = node.status === 'missing' ? '#999' : nodeColor;
  const isDashed = node.status === 'missing';

  // 去掉根节点的"上游：/中游：/下游："前缀
  let displayName = node.name;
  if (depth === 0) {
    displayName = displayName.replace(/^(上游|中游|下游)[：:]/, '');
  }

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hasChildren) {
      onToggle(node.id);
    } else {
      onLeafClick(node, e.currentTarget);
    }
  }, [hasChildren, node, onToggle, onLeafClick]);

  return (
    <div className="chain-node-group">
      {/* 节点本体 */}
      <div
        className={`chain-node ${isExpanded ? 'expanded' : ''} ${depth === 0 ? 'root-node' : ''}`}
        onClick={handleClick}
        style={{
          borderColor: nodeColor,
          borderStyle: isDashed ? 'dashed' : 'solid',
          color: textColor,
          fontSize: compact ? 11 : 12,
        }}
        title={displayName}
      >
        <span className="chain-node-text">{displayName}</span>
        {hasChildren && (
          <span className={`chain-node-arrow ${isExpanded ? 'arrow-down' : ''}`}>
            ›
          </span>
        )}
      </div>

      {/* 子节点区域 */}
      {hasChildren && isExpanded && (
        <div className="chain-children">
          {node.children!.map(child => (
            <div key={child.id} className="chain-child-row">
              {/* 连线 */}
              <div className="chain-connector">
                <div className="chain-connector-h" />
              </div>
              {/* 递归渲染子节点 */}
              <TreeNode
                node={child}
                depth={depth + 1}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                onLeafClick={onLeafClick}
                statusColorMap={statusColorMap}
                compact={compact}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== 主组件 ====================
const IndustryChainGraph: React.FC<Props> = ({
  graphData,
  headers,
  statusColorMap,
  statusLabelMap,
  onNodeAction,
}) => {
  const { message } = App.useApp();
  const [focusedStream, setFocusedStream] = useState<StreamKey | null>(null);

  // 默认展开所有根节点（显示2层：根 + 一级子节点）
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    (['upstream', 'midstream', 'downstream'] as StreamKey[]).forEach(sk => {
      ids.add(graphData[sk].root.id);
    });
    return ids;
  });
  const [popover, setPopover] = useState<{
    node: IndustryGraphNode;
    rect: { left: number; top: number };
  } | null>(null);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleLeafClick = useCallback((node: IndustryGraphNode, el: HTMLElement) => {
    const containerEl = el.closest('.chain-graph-container');
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    const nodeRect = el.getBoundingClientRect();
    setPopover({
      node,
      rect: {
        left: nodeRect.right - containerRect.left + 8,
        top: nodeRect.top - containerRect.top - 10,
      },
    });
  }, []);

  const handleStreamClick = useCallback((sk: StreamKey) => {
    setFocusedStream(prev => prev === sk ? null : sk);
  }, []);

  const streams: StreamKey[] = ['upstream', 'midstream', 'downstream'];

  return (
    <div className="chain-graph-container" onClick={(e) => {
      // 点击空白区域关闭弹窗
      if ((e.target as HTMLElement).classList.contains('chain-graph-container') ||
          (e.target as HTMLElement).classList.contains('chain-stream-col')) {
        setPopover(null);
      }
    }}>
      <div className="chain-graph-columns">
        {streams.map((sk, idx) => {
          const isFocused = focusedStream === sk;
          const anyFocused = focusedStream !== null;
          const widthPercent = anyFocused
            ? (isFocused ? '50%' : '22%')
            : '31%';

          return (
            <React.Fragment key={sk}>
              {idx > 0 && (
                <div className="chain-stream-separator">›</div>
              )}
              <div
                className={`chain-stream-col ${isFocused ? 'focused' : ''}`}
                style={{ flexBasis: widthPercent }}
              >
                {/* 列标题 */}
                <div className="chain-stream-header" onClick={() => handleStreamClick(sk)}>
                  <span className="chain-header-line" />
                  <span className="chain-header-text">{headers[idx]}</span>
                  <span className="chain-header-line" />
                  {isFocused && (
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setFocusedStream(null); }}
                      style={{ color: '#999', padding: '0 4px', marginLeft: 4 }}
                    >收起</Button>
                  )}
                </div>

                {/* 树内容 */}
                <div className="chain-tree-content">
                  <TreeNode
                    node={graphData[sk].root}
                    depth={0}
                    expandedNodes={expandedNodes}
                    onToggle={handleToggle}
                    onLeafClick={handleLeafClick}
                    statusColorMap={statusColorMap}
                    compact={anyFocused && !isFocused}
                  />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* 弹窗 */}
      {popover && (
        <div
          className="chain-popover"
          style={{ left: popover.rect.left, top: popover.rect.top }}
        >
          <div className="chain-popover-header">
            <Text strong style={{ fontSize: 16 }}>{popover.node.name}</Text>
            <Tag color={statusColorMap[popover.node.status]}>
              {statusLabelMap[popover.node.status]}
            </Tag>
          </div>
          <div className="chain-popover-stats">
            <div>企业 <Text strong>{popover.node.enterprises ?? '--'}</Text> 家 &nbsp;|&nbsp; 人才 <Text strong>{popover.node.talents ?? '--'}</Text> 人</div>
            <div>本地企业 <Text strong>{popover.node.localEnterprises ?? '--'}</Text> 家 &nbsp;|&nbsp; 本地人才 <Text strong>{popover.node.localTalents ?? '--'}</Text> 人</div>
          </div>
          <Space style={{ marginTop: 10 }} wrap>
            <Button type="link" size="small"
              onClick={() => { setPopover(null); onNodeAction?.('enterprises', popover.node); }}>
              相关企业
            </Button>
            <Button type="link" size="small"
              onClick={() => { setPopover(null); onNodeAction?.('talent', popover.node); }}>
              相关人才
            </Button>
          </Space>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" size="small" icon={<PlusOutlined />}
              onClick={() => {
                message.success(`已将"${popover.node.name}"相关企业加入清单`);
                onNodeAction?.('addList', popover.node);
                setPopover(null);
              }}>加入清单</Button>
            <Button type="text" size="small" onClick={() => setPopover(null)}
              style={{ color: '#999' }}>关闭</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryChainGraph;
