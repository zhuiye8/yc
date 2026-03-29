/**
 * 产业链节点覆盖率缓存服务
 * 批量查询每个末端节点在指定城市是否有企业，计算覆盖率
 * 同时返回每个节点的企业数，用于动态判定强/弱/缺链状态
 */
import { searchOrgs } from './industry'

export interface CoverageResult {
  covered: number
  total: number
  rate: number
  chainStatus: 'strong' | 'weak' | 'missing'
  chainOrgTotal: number
  /** 每个叶子节点名→宜昌企业数 */
  nodeOrgCounts: Record<string, number>
}

// 内存缓存
const cache = new Map<string, CoverageResult>()
const pending = new Map<string, Promise<CoverageResult>>()
const progressCallbacks = new Map<string, (checked: number, total: number) => void>()

export async function getChainCoverage(
  chainKey: string,
  nodeKeywords: Record<string, { keywords: string[]; queryString: string }>,
  chainSearchKey: string,
  city: string,
  onProgress?: (checked: number, total: number) => void,
): Promise<CoverageResult> {
  const cacheKey = `${chainKey}:${city}`

  if (onProgress) {
    progressCallbacks.set(cacheKey, onProgress)
  }

  if (cache.has(cacheKey)) {
    progressCallbacks.delete(cacheKey)
    return cache.get(cacheKey)!
  }

  if (pending.has(cacheKey)) {
    return pending.get(cacheKey)!
  }

  const proxyProgress = (checked: number, total: number) => {
    const cb = progressCallbacks.get(cacheKey)
    cb?.(checked, total)
  }

  const promise = computeCoverage(nodeKeywords, chainSearchKey, city, proxyProgress)
  pending.set(cacheKey, promise)

  try {
    const result = await promise
    cache.set(cacheKey, result)
    progressCallbacks.delete(cacheKey)
    return result
  } finally {
    pending.delete(cacheKey)
  }
}

export function clearCoverageCache(chainKey?: string) {
  if (chainKey) {
    for (const key of cache.keys()) {
      if (key.startsWith(`${chainKey}:`)) cache.delete(key)
    }
  } else {
    cache.clear()
  }
}

/** 根据企业数判定节点状态 */
export function getNodeStatus(orgCount: number): 'strong' | 'weak' | 'missing' {
  if (orgCount === 0) return 'missing'
  if (orgCount <= 20) return 'weak'
  return 'strong'
}

/**
 * 根据子节点状态聚合父节点状态
 * - 全部缺链 → 缺链
 * - 有缺有非缺 → 弱链
 * - 全部非缺（强+弱混合）→ 弱链
 * - 全部强链 → 强链
 */
export function aggregateStatus(childStatuses: ('strong' | 'weak' | 'missing')[]): 'strong' | 'weak' | 'missing' {
  if (childStatuses.length === 0) return 'missing'
  const allMissing = childStatuses.every(s => s === 'missing')
  if (allMissing) return 'missing'
  const allStrong = childStatuses.every(s => s === 'strong')
  if (allStrong) return 'strong'
  return 'weak'
}

// ---------- 内部实现 ----------

async function computeCoverage(
  nodeKeywords: Record<string, { keywords: string[]; queryString: string }>,
  chainSearchKey: string,
  city: string,
  onProgress?: (checked: number, total: number) => void,
): Promise<CoverageResult> {
  const nodes = Object.entries(nodeKeywords)
  const total = nodes.length
  const nodeOrgCounts: Record<string, number> = {}

  if (total === 0) {
    return { covered: 0, total: 0, rate: 0, chainStatus: 'missing', chainOrgTotal: 0, nodeOrgCounts }
  }

  // 先查产业链整体企业数
  let chainOrgTotal = 0
  try {
    const res = await searchOrgs(chainSearchKey, 0, 1, city || undefined)
    const d = res?.data as Record<string, unknown> | undefined
    chainOrgTotal = (d?.total as number) || 0
  } catch (_e) {
    // ignore
  }

  const chainStatus = getNodeStatus(chainOrgTotal)

  // 分批查询每个节点
  const BATCH_SIZE = 5
  const BATCH_DELAY = 1000
  let covered = 0
  let checked = 0

  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(([nodeName, mapping]) =>
        searchOrgs(mapping.queryString, 0, 1, city || undefined)
          .then(res => {
            const d = res?.data as Record<string, unknown> | undefined
            const count = (d?.total as number) || 0
            return { nodeName, count }
          })
          .catch(() => ({ nodeName, count: 0 }))
      )
    )

    for (const r of results) {
      checked++
      if (r.status === 'fulfilled') {
        const { nodeName, count } = r.value
        nodeOrgCounts[nodeName] = count
        if (count > 0) covered++
      }
    }

    onProgress?.(checked, total)
    await new Promise(resolve => setTimeout(resolve, i + BATCH_SIZE < nodes.length ? BATCH_DELAY : 0))
  }

  const rate = total > 0 ? (covered / total) * 100 : 0

  return { covered, total, rate, chainStatus, chainOrgTotal, nodeOrgCounts }
}
