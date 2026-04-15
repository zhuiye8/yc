/**
 * 计算产业链节点真实数据 + 强弱缺状态
 *
 * - 叶子节点企业数：调 demo API `/industry/nodes/stats`（local SQLite，速度快）
 * - 叶子节点人才数：调 TG API `/api/talents/search`（8 并发 + 200ms 批间）
 * - 状态判定：本地企业数 0=缺链 / 1-19=弱链 / ≥20=强链
 * - 父节点聚合：全缺→缺 / 全强→强 / 混合含缺→弱 / 只强+弱→多数（平分归强）
 *
 * Run:
 *   1. 确保 demo API 在跑：http://127.0.0.1:38071
 *   2. npx tsx scripts/buildChainStats.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ========== 配置 ==========

const DEMO_API = 'http://127.0.0.1:38071'
const TG_API = 'http://119.36.242.222:19020'
const TG_USERNAME = 'yichang_888_20260414'
const TG_PASSWORD = 'epk#w55ujo66IHHhmYKXQhNnal'
const LOCAL_PROVINCE = '湖北'
const LOCAL_CITY = '宜昌'

// TG 并发控制
const TG_BATCH_SIZE = 8
const TG_BATCH_DELAY_MS = 200

// 强弱缺阈值
const STATUS_MISSING = 0
const STATUS_STRONG_THRESHOLD = 20

const chainKeyToLabel: Record<string, string> = {
  wetchem: '湿电子化学品',
  newenergy: '新能源新材料',
  pharma: '先进制剂与高端仿制药',
  yeast: '酵母发酵与功能成分制造',
  ship: '内河绿色智能船舶制造',
  ai: '人工智能',
}

// ========== 类型 ==========

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

interface GraphSet {
  upstream: { label: string; root: GraphNode }
  midstream: { label: string; root: GraphNode }
  downstream: { label: string; root: GraphNode }
}

interface NodeKw {
  keywords: string[]
  queryString: string
}

// ========== 读取已有数据 ==========

const graphPath = path.resolve(__dirname, '../src/mock/industryChainGraphData.ts')
const keywordsPath = path.resolve(__dirname, '../src/data/industry-keywords.json')

const keywords: Record<string, Record<string, NodeKw>> = JSON.parse(
  fs.readFileSync(keywordsPath, 'utf-8'),
)

/** 从 ts 文件反序列化，简单方法：用 dynamic import */
async function loadGraphData(): Promise<Record<string, GraphSet>> {
  // 读文件内容，evaluate 其中的 industryChainGraphData
  const content = fs.readFileSync(graphPath, 'utf-8')
  // 提取 export 后的 object literal
  const match = content.match(/industryChainGraphData:\s*Record<string,\s*IndustryGraphSet>\s*=\s*(\{[\s\S]+\});?\s*$/m)
  if (!match) throw new Error('Cannot parse industryChainGraphData.ts')
  const objLiteral = match[1]
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return (new Function(`return ${objLiteral}`))() as Record<string, GraphSet>
}

// ========== 工具 ==========

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function getTgToken(): Promise<string> {
  const r = await fetch(`${TG_API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TG_USERNAME, password: TG_PASSWORD }),
  })
  const j = await r.json() as { data: { token: string } }
  return j.data.token
}

/** 查 demo API 获取某关键词的企业数 */
async function fetchOrgStats(chainKey: string, nodeName: string): Promise<{ enterprises: number; localEnterprises: number }> {
  const urlNational = `${DEMO_API}/industry/nodes/stats?chainKey=${chainKey}&nodeName=${encodeURIComponent(nodeName)}`
  const urlLocal = `${DEMO_API}/industry/nodes/stats?chainKey=${chainKey}&nodeName=${encodeURIComponent(nodeName)}&province=${encodeURIComponent(LOCAL_PROVINCE)}&city=${encodeURIComponent(LOCAL_CITY)}`
  try {
    const [natResp, locResp] = await Promise.all([fetch(urlNational), fetch(urlLocal)])
    const nat = await natResp.json() as { orgTotal?: number }
    const loc = await locResp.json() as { localOrgTotal?: number }
    return {
      enterprises: Number(nat?.orgTotal ?? 0),
      localEnterprises: Number(loc?.localOrgTotal ?? 0),
    }
  } catch {
    return { enterprises: 0, localEnterprises: 0 }
  }
}

/** 查 TG 获取某关键词的人才数 */
async function fetchTalentStats(
  token: string,
  queryString: string,
): Promise<{ talents: number; localTalents: number }> {
  const h = { Authorization: `Bearer ${token}` }
  const base = `${TG_API}/api/talents/search?keyword=${encodeURIComponent(queryString)}&page=1&pageSize=1`
  try {
    const [natResp, locResp] = await Promise.all([
      fetch(base, { headers: h }),
      fetch(`${base}&city=${encodeURIComponent(LOCAL_CITY)}`, { headers: h }),
    ])
    const nat = await natResp.json() as { data?: { total?: number } }
    const loc = await locResp.json() as { data?: { total?: number } }
    return {
      talents: Number(nat?.data?.total ?? 0),
      localTalents: Number(loc?.data?.total ?? 0),
    }
  } catch {
    return { talents: 0, localTalents: 0 }
  }
}

// ========== 状态判定 ==========

function leafStatus(localEnterprises: number): 'strong' | 'weak' | 'missing' {
  if (localEnterprises === STATUS_MISSING) return 'missing'
  if (localEnterprises < STATUS_STRONG_THRESHOLD) return 'weak'
  return 'strong'
}

function parentStatus(children: GraphNode[]): 'strong' | 'weak' | 'missing' {
  const statuses = children.map((c) => c.status)
  const missing = statuses.filter((s) => s === 'missing').length
  const strong = statuses.filter((s) => s === 'strong').length
  const weak = statuses.filter((s) => s === 'weak').length

  if (missing === statuses.length) return 'missing'
  if (strong === statuses.length) return 'strong'
  if (missing > 0) return 'weak'   // 混合含缺 → 弱
  // 只强+弱，看多数（平分归强）
  return strong >= weak ? 'strong' : 'weak'
}

// ========== 遍历填充 ==========

interface CollectContext {
  chainKey: string
  leaves: GraphNode[]
}

function collectLeaves(node: GraphNode, ctx: CollectContext) {
  if (!node.children || node.children.length === 0) {
    ctx.leaves.push(node)
    return
  }
  for (const c of node.children) collectLeaves(c, ctx)
}

/** 父节点数字 = 子节点汇总；父节点 status 按子聚合 */
function computeParent(node: GraphNode) {
  if (!node.children || node.children.length === 0) return
  for (const c of node.children) computeParent(c)
  node.enterprises = node.children.reduce((s, c) => s + c.enterprises, 0)
  node.localEnterprises = node.children.reduce((s, c) => s + c.localEnterprises, 0)
  node.talents = node.children.reduce((s, c) => s + c.talents, 0)
  node.localTalents = node.children.reduce((s, c) => s + c.localTalents, 0)
  node.status = parentStatus(node.children)
}

// ========== 主流程 ==========

async function main() {
  console.log('🔑 获取 TG token...')
  const token = await getTgToken()
  console.log('✓ Token 获取成功')

  const graphData = await loadGraphData()

  for (const chainKey of Object.keys(graphData)) {
    const chainLabel = chainKeyToLabel[chainKey]
    const chainKw = keywords[chainLabel] ?? {}
    const chainData = graphData[chainKey]

    console.log(`\n📊 处理 ${chainKey} (${chainLabel})...`)

    // 收集所有叶子
    const ctx: CollectContext = { chainKey, leaves: [] }
    for (const col of [chainData.upstream.root, chainData.midstream.root, chainData.downstream.root]) {
      collectLeaves(col, ctx)
    }
    console.log(`  叶子节点: ${ctx.leaves.length}`)

    // ---- 1. 查企业数（demo API，可全部并发，速度快）----
    console.log('  📥 查企业数...')
    const orgStartAt = Date.now()
    const orgResults = await Promise.all(
      ctx.leaves.map((leaf) => fetchOrgStats(chainKey, leaf.name)),
    )
    orgResults.forEach((res, i) => {
      ctx.leaves[i].enterprises = res.enterprises
      ctx.leaves[i].localEnterprises = res.localEnterprises
    })
    console.log(`  ✓ 企业数查询完成 (${Date.now() - orgStartAt}ms)`)

    // ---- 2. 查人才数（TG API，8 并发批次）----
    console.log('  📥 查人才数（8 并发 + 200ms 批间）...')
    const talentStartAt = Date.now()
    const total = ctx.leaves.length
    let processed = 0
    for (let i = 0; i < total; i += TG_BATCH_SIZE) {
      const batch = ctx.leaves.slice(i, i + TG_BATCH_SIZE)
      const results = await Promise.all(
        batch.map(async (leaf) => {
          const kw = chainKw[leaf.name]
          const qs = kw?.queryString || leaf.name
          return fetchTalentStats(token, qs)
        }),
      )
      results.forEach((res, j) => {
        batch[j].talents = res.talents
        batch[j].localTalents = res.localTalents
      })
      processed += batch.length
      process.stdout.write(`\r    ${processed}/${total}`)
      if (i + TG_BATCH_SIZE < total) await sleep(TG_BATCH_DELAY_MS)
    }
    console.log(`\n  ✓ 人才数查询完成 (${Math.round((Date.now() - talentStartAt) / 1000)}s)`)

    // ---- 3. 叶子 status 判定 ----
    for (const leaf of ctx.leaves) {
      leaf.status = leafStatus(leaf.localEnterprises)
    }

    // ---- 4. 父节点聚合 ----
    computeParent(chainData.upstream.root)
    computeParent(chainData.midstream.root)
    computeParent(chainData.downstream.root)

    // ---- 5. 统计报告 ----
    const statusCount = { strong: 0, weak: 0, missing: 0 }
    for (const leaf of ctx.leaves) statusCount[leaf.status]++
    const totalEnt = ctx.leaves.reduce((s, l) => s + l.enterprises, 0)
    const totalLocalEnt = ctx.leaves.reduce((s, l) => s + l.localEnterprises, 0)
    const totalTalent = ctx.leaves.reduce((s, l) => s + l.talents, 0)
    const totalLocalTalent = ctx.leaves.reduce((s, l) => s + l.localTalents, 0)
    console.log(`  叶子状态: 强链 ${statusCount.strong} / 弱链 ${statusCount.weak} / 缺链 ${statusCount.missing}`)
    console.log(`  企业(全/本): ${totalEnt} / ${totalLocalEnt}  人才(全/本): ${totalTalent} / ${totalLocalTalent}`)
  }

  // ========== 输出 ==========
  console.log('\n📝 写回 industryChainGraphData.ts...')
  const output: string[] = []
  output.push('/**')
  output.push(' * @input type { IndustryGraphSet } from \'./data\'')
  output.push(' * @output { industryChainGraphData } 各产业链上中下游树形图谱数据（Record<string, IndustryGraphSet>）')
  output.push(' * @position Mock 数据层，由 parseChainXlsx.ts + buildChainStats.ts 脚本自动生成，勿手动编辑')
  output.push(' */')
  output.push('// Auto-generated by scripts/parseChainXlsx.ts + scripts/buildChainStats.ts — do not edit manually')
  output.push('import type { IndustryGraphSet } from \'./data\';')
  output.push('')
  output.push('export const industryChainGraphData: Record<string, IndustryGraphSet> = {')
  for (const [chainKey, chainData] of Object.entries(graphData)) {
    output.push(`  ${chainKey}: {`)
    output.push(`    upstream: { label: '上游', root: ${serializeNode(chainData.upstream.root, 6).trim()} },`)
    output.push(`    midstream: { label: '中游', root: ${serializeNode(chainData.midstream.root, 6).trim()} },`)
    output.push(`    downstream: { label: '下游', root: ${serializeNode(chainData.downstream.root, 6).trim()} },`)
    output.push(`  },`)
  }
  output.push('};')
  fs.writeFileSync(graphPath, output.join('\n'), 'utf-8')
  console.log('✅ Done')
}

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

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
