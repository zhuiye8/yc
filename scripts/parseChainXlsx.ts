/**
 * One-time parser: reads 6 industry chain xlsx files,
 * builds trees from 上级路径 + 末端环节 + keywords,
 * outputs TypeScript for src/mock/industryChainGraphData.ts
 * and JSON for src/data/industry-keywords.json.
 *
 * Run: npx tsx scripts/parseChainXlsx.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const XLSX = require('xlsx')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface TreeNode {
  name: string
  children: TreeNode[]
  keywords: string[]  // 直属关键词（仅叶子有）
  isLeaf: boolean
}

interface GraphNode {
  id: string
  name: string
  status: 'strong' | 'weak' | 'missing'
  enterprises: number
  talents: number
  localEnterprises: number
  localTalents: number
  children?: GraphNode[]
}

interface NodeKeywordMapping {
  keywords: string[]
  queryString: string
}

// ===== xlsx 文件和分组配置 =====

interface ChainConfig {
  prefix: string        // 节点 ID 前缀
  chainLabel: string    // 对应 industry-keywords.json 的 key
  rootName: string      // xlsx 上级路径中的根节点名
  file: string          // xlsx 文件名
  branches: {
    upstream: string[]
    midstream: string[]
    downstream: string[]
  }
}

const CHAINS: Record<string, ChainConfig> = {
  ai: {
    prefix: 'ai',
    chainLabel: '人工智能',
    rootName: '人工智能与生成式AI',
    file: '人工智能与生成式A总表.xlsx',
    branches: {
      upstream: ['上游：基础硬件与算力基础设施'],
      midstream: ['中游：云平台、数据要素与模型工具链'],
      downstream: ['下游：行业应用、终端落地与服务生态', '治理：标准、合规与评测认证'],
    },
  },
  newenergy: {
    prefix: 'ne',
    chainLabel: '新能源新材料',
    rootName: '新能源电池',
    file: '新能源电池全链总表.xlsx',
    branches: {
      upstream: ['产品类型与技术路线', '材料制备与加工', '制造装备与产线自动化'],
      midstream: ['电芯制造', '模组与电池包', '电池管理与能量系统'],
      downstream: ['应用场景', '回收与循环利用'],
    },
  },
  pharma: {
    prefix: 'ph',
    chainLabel: '先进制剂与高端仿制药',
    rootName: '先进制剂与高端仿制药',
    file: '先进制剂与高端仿制药总表.xlsx',
    branches: {
      upstream: ['剂型与给药系统'],
      midstream: ['制造工艺与产线'],
      downstream: ['分析检测与等效性评价', '产业化配套与工程服务'],
    },
  },
  yeast: {
    prefix: 'ye',
    chainLabel: '酵母发酵与功能成分制造',
    rootName: '酵母发酵与功能成分制造',
    file: '酵母发酵与功能成分制造总表.xlsx',
    branches: {
      upstream: ['关键要素与投入体系'],
      midstream: ['制造与过程工程'],
      downstream: ['产品体系与功能成分', '应用场景与产业生态'],
    },
  },
  ship: {
    prefix: 'sh',
    chainLabel: '内河绿色智能船舶制造',
    rootName: '内河绿色智能船舶制造',
    file: '内河绿色智能船舶制造总表.xlsx',
    branches: {
      upstream: ['设计与工程制造'],
      midstream: ['关键系统与核心部件'],
      downstream: ['智能化与航运运营生态', '循环利用与环境治理'],
    },
  },
  wetchem: {
    prefix: 'wc',
    chainLabel: '湿电子化学品',
    rootName: '湿电子化学品',
    file: '湿电子化学品总表.xlsx',
    branches: {
      upstream: ['产品体系'],
      midstream: ['生产制造', '供应与交付'],
      downstream: ['下游工艺应用', '回收与环保'],
    },
  },
}

// ===== 读 xlsx =====

interface XlsxRow {
  upperPath: string   // 列 A
  leaf: string        // 列 B
  kwMain: string      // 列 C
  kwExtra: string     // 列 D
}

function readXlsx(filepath: string): XlsxRow[] {
  const wb = XLSX.readFile(filepath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { header: 1, defval: '' })
  // 跳过表头
  return rows.slice(1).map((r: unknown) => {
    const arr = r as unknown[]
    return {
      upperPath: String(arr[0] ?? '').trim(),
      leaf: String(arr[1] ?? '').trim(),
      kwMain: String(arr[2] ?? '').trim(),
      kwExtra: String(arr[3] ?? '').trim(),
    }
  }).filter(r => r.leaf)  // 只保留有末端环节的行
}

function parseKeywords(raw: string): string[] {
  if (!raw) return []
  return raw
    .replace(/；/g, ';')
    .split(/[;,，、]/)
    .map(s => s.trim())
    .filter(s => s && s !== '无')
}

// ===== 构建树 =====

/** 在父节点下查找或创建子节点 */
function findOrCreate(parent: TreeNode, name: string): TreeNode {
  const existing = parent.children.find(c => c.name === name)
  if (existing) return existing
  const node: TreeNode = { name, children: [], keywords: [], isLeaf: false }
  parent.children.push(node)
  return node
}

/** 构建一条链的树（从 rootName 开始） */
function buildChainTree(rows: XlsxRow[], rootName: string): TreeNode {
  const root: TreeNode = { name: rootName, children: [], keywords: [], isLeaf: false }

  for (const row of rows) {
    if (!row.upperPath) continue
    const parts = row.upperPath.split('>').map(s => s.trim()).filter(Boolean)

    // 定位到 rootName
    const rootIdx = parts.indexOf(rootName)
    if (rootIdx < 0) continue

    // 从 rootName 之后开始建节点
    let cursor = root
    for (let i = rootIdx + 1; i < parts.length; i++) {
      cursor = findOrCreate(cursor, parts[i])
    }

    // 叶子节点
    const leaf = findOrCreate(cursor, row.leaf)
    leaf.isLeaf = true
    leaf.keywords = [...parseKeywords(row.kwMain), ...parseKeywords(row.kwExtra)]
      .filter((v, i, arr) => arr.indexOf(v) === i)
  }

  return root
}

/** 合并节点的所有叶子 keywords（用于生成中间/根节点的 queryString） */
function collectAllKeywords(node: TreeNode): string[] {
  if (node.isLeaf) return node.keywords
  const set = new Set<string>()
  for (const child of node.children) {
    for (const kw of collectAllKeywords(child)) set.add(kw)
  }
  return Array.from(set)
}

// ===== 转换为 GraphNode =====

function toGraphNode(node: TreeNode, prefix: string, counter: { n: number }): GraphNode {
  const id = `${prefix}-${counter.n++}`
  const g: GraphNode = {
    id,
    name: node.name,
    status: 'strong',
    enterprises: 0,
    talents: 0,
    localEnterprises: 0,
    localTalents: 0,
  }
  if (node.children.length > 0) {
    g.children = node.children.map(c => toGraphNode(c, prefix, counter))
  }
  return g
}

/** 把一组 branch 名称合并成一个顶级节点（用于"治理"等多 branch 下游场景） */
function collectBranches(root: TreeNode, branchNames: string[]): TreeNode[] {
  const out: TreeNode[] = []
  for (const name of branchNames) {
    const found = root.children.find(c => c.name === name)
    if (found) out.push(found)
  }
  return out
}

// ===== 输出 =====

function serializeNode(node: GraphNode, indent: number): string {
  const pad = ' '.repeat(indent)
  const parts: string[] = []
  parts.push(`${pad}{`)
  parts.push(`${pad}  id: '${node.id}', name: '${node.name.replace(/'/g, "\\'")}', status: '${node.status}',`)
  parts.push(`${pad}  enterprises: ${node.enterprises}, talents: ${node.talents}, localEnterprises: ${node.localEnterprises}, localTalents: ${node.localTalents},`)
  if (node.children && node.children.length > 0) {
    parts.push(`${pad}  children: [`)
    for (const child of node.children) {
      parts.push(serializeNode(child, indent + 4) + ',')
    }
    parts.push(`${pad}  ],`)
  }
  parts.push(`${pad}}`)
  return parts.join('\n')
}

function serializeChain(data: { upstream: GraphNode; midstream: GraphNode; downstream: GraphNode }): string {
  const lines: string[] = []
  lines.push(`    upstream: { label: '上游', root: ${serializeNode(data.upstream, 6).trim()} },`)
  lines.push(`    midstream: { label: '中游', root: ${serializeNode(data.midstream, 6).trim()} },`)
  lines.push(`    downstream: { label: '下游', root: ${serializeNode(data.downstream, 6).trim()} },`)
  return lines.join('\n')
}

/** 将多个 branch TreeNode 合并成一个虚拟根（当 upstream/midstream/downstream 对应多个 xlsx 分支时） */
function mergeBranches(branchNodes: TreeNode[], streamLabel: string): TreeNode {
  if (branchNodes.length === 1) return branchNodes[0]
  return {
    name: streamLabel,
    children: branchNodes,
    keywords: [],
    isLeaf: false,
  }
}

// ===== 主流程 =====

const xlsxDir = path.resolve(__dirname, '../产业链全环节企业放入逻辑')
const mdDir = path.resolve(__dirname, '../宜昌产业链六条')  // 保留旧 md 供对照
void mdDir

const allChainGraphs: Record<string, { upstream: GraphNode; midstream: GraphNode; downstream: GraphNode }> = {}
const allKeywords: Record<string, Record<string, NodeKeywordMapping>> = {}

for (const [chainKey, config] of Object.entries(CHAINS)) {
  const rows = readXlsx(path.join(xlsxDir, config.file))
  const root = buildChainTree(rows, config.rootName)

  if (root.children.length === 0) {
    console.error(`⚠ ${chainKey}: 树构建失败，根节点无子节点`)
    continue
  }

  // 切分上中下游
  const upstreamBranches = collectBranches(root, config.branches.upstream)
  const midstreamBranches = collectBranches(root, config.branches.midstream)
  const downstreamBranches = collectBranches(root, config.branches.downstream)

  const upstreamNode = mergeBranches(upstreamBranches, '上游')
  const midstreamNode = mergeBranches(midstreamBranches, '中游')
  const downstreamNode = mergeBranches(downstreamBranches, '下游')

  const counter = { n: 0 }
  const upstream = toGraphNode(upstreamNode, config.prefix, counter)
  const midstream = toGraphNode(midstreamNode, config.prefix, counter)
  const downstream = toGraphNode(downstreamNode, config.prefix, counter)

  allChainGraphs[chainKey] = { upstream, midstream, downstream }

  // 构建 keywords json（每个叶子节点一条）
  const chainKeywords: Record<string, NodeKeywordMapping> = {}
  function walkTree(n: TreeNode) {
    if (n.isLeaf) {
      chainKeywords[n.name] = {
        keywords: n.keywords,
        queryString: n.keywords.join(' OR '),
      }
    }
    for (const c of n.children) walkTree(c)
  }
  // 只遍历实际 include 的分支
  for (const b of [...upstreamBranches, ...midstreamBranches, ...downstreamBranches]) {
    walkTree(b)
  }
  allKeywords[config.chainLabel] = chainKeywords

  // 统计
  function countNodes(g: GraphNode): number {
    return 1 + (g.children?.reduce((sum, c) => sum + countNodes(c), 0) ?? 0)
  }
  const total = countNodes(upstream) + countNodes(midstream) + countNodes(downstream)
  console.error(`✓ ${chainKey}: ${total} 节点（${Object.keys(chainKeywords).length} 叶子）`)
}

// 输出 industryChainGraphData.ts
const output: string[] = []
output.push('/**')
output.push(' * @input type { IndustryGraphSet } from \'./data\'')
output.push(' * @output { industryChainGraphData } 各产业链上中下游树形图谱数据（Record<string, IndustryGraphSet>）')
output.push(' * @position Mock 数据层，由 parseChainXlsx.ts 脚本自动生成，勿手动编辑')
output.push(' */')
output.push('// Auto-generated by scripts/parseChainXlsx.ts — do not edit manually')
output.push('import type { IndustryGraphSet } from \'./data\';')
output.push('')
output.push('export const industryChainGraphData: Record<string, IndustryGraphSet> = {')
for (const [chainKey, chainData] of Object.entries(allChainGraphs)) {
  output.push(`  ${chainKey}: {`)
  output.push(serializeChain(chainData))
  output.push('  },')
}
output.push('};')

const outPath = path.resolve(__dirname, '../src/mock/industryChainGraphData.ts')
fs.writeFileSync(outPath, output.join('\n'), 'utf-8')
console.error(`📝 Wrote: ${outPath}`)

// 输出 industry-keywords.json
const kwPath = path.resolve(__dirname, '../src/data/industry-keywords.json')
fs.writeFileSync(kwPath, JSON.stringify(allKeywords, null, 2), 'utf-8')
console.error(`📝 Wrote: ${kwPath}`)

console.error('✅ Done')
