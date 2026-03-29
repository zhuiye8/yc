/**
 * 产业链节点覆盖率缓存服务
 * 批量查询每个末端节点在指定城市是否有企业，计算覆盖率
 */
import { searchOrgs } from './industry'

export interface CoverageResult {
  covered: number   // 有覆盖的节点数
  total: number     // 总节点数
  rate: number      // 覆盖率百分比
  chainStatus: 'strong' | 'weak' | 'missing'  // 链整体状态
  chainOrgTotal: number  // 该产业链在指定城市的企业总数
}

// 内存缓存：key = chainKey + city
const cache = new Map<string, CoverageResult>()

// 正在计算中的 Promise（防止重复请求）
const pending = new Map<string, Promise<CoverageResult>>()

/**
 * 获取产业链覆盖率
 * @param chainKey 产业链 key
 * @param nodeKeywords 节点→关键词映射
 * @param chainSearchKey 产业链宽关键词（用于查总企业数和判定链状态）
 * @param city 城市名（如"宜昌"），空串=全国
 * @param onProgress 进度回调
 */
// 存储当前活跃的 onProgress 回调（支持 StrictMode 下 effect 重跑时替换回调）
const progressCallbacks = new Map<string, (checked: number, total: number) => void>()

export async function getChainCoverage(
  chainKey: string,
  nodeKeywords: Record<string, { keywords: string[]; queryString: string }>,
  chainSearchKey: string,
  city: string,
  onProgress?: (checked: number, total: number) => void,
): Promise<CoverageResult> {
  const cacheKey = `${chainKey}:${city}`

  // 注册/替换进度回调（即使正在计算中，新回调也能接收进度）
  if (onProgress) {
    progressCallbacks.set(cacheKey, onProgress)
  }

  // 1. 检查缓存
  if (cache.has(cacheKey)) {
    progressCallbacks.delete(cacheKey)
    return cache.get(cacheKey)!
  }

  // 2. 如果正在计算，等待结果（新回调已注册，computeCoverage 会用最新回调）
  if (pending.has(cacheKey)) {
    return pending.get(cacheKey)!
  }

  // 3. 启动计算 — 用代理回调，总是调最新注册的回调
  const proxyProgress = (checked: number, total: number) => {
    const cb = progressCallbacks.get(cacheKey)
    cb?.(checked, total)
  }

  const promise = computeCoverage(chainKey, nodeKeywords, chainSearchKey, city, proxyProgress)
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

/** 清除指定产业链的缓存 */
export function clearCoverageCache(chainKey?: string) {
  if (chainKey) {
    for (const key of cache.keys()) {
      if (key.startsWith(`${chainKey}:`)) cache.delete(key)
    }
  } else {
    cache.clear()
  }
}

// ---------- 内部实现 ----------

async function computeCoverage(
  _chainKey: string,
  nodeKeywords: Record<string, { keywords: string[]; queryString: string }>,
  chainSearchKey: string,
  city: string,
  onProgress?: (checked: number, total: number) => void,
): Promise<CoverageResult> {
  const nodes = Object.entries(nodeKeywords)
  const total = nodes.length

  if (total === 0) {
    return { covered: 0, total: 0, rate: 0, chainStatus: 'missing', chainOrgTotal: 0 }
  }

  // 先查产业链整体的企业数（用于判定强弱缺链）
  let chainOrgTotal = 0
  try {
    const res = await searchOrgs(chainSearchKey, 0, 1, city || undefined)
    const d = res?.data as Record<string, unknown> | undefined
    chainOrgTotal = (d?.total as number) || 0
  } catch (_e) {
    // ignore
  }

  // 判定链状态
  const chainStatus: 'strong' | 'weak' | 'missing' =
    chainOrgTotal === 0 ? 'missing' :
    chainOrgTotal <= 20 ? 'weak' : 'strong'

  // 分批查询每个节点
  const BATCH_SIZE = 5       // 每批并发数（5个/s）
  const BATCH_DELAY = 1000   // 批间隔（1秒）
  let covered = 0
  let checked = 0

  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(([, mapping]) =>
        searchOrgs(mapping.queryString, 0, 1, city || undefined)
          .then(res => {
            const d = res?.data as Record<string, unknown> | undefined
            return (d?.total as number) || 0
          })
          .catch(() => 0)
      )
    )

    for (const r of results) {
      checked++
      if (r.status === 'fulfilled' && r.value > 0) {
        covered++
      }
    }

    // 先让出事件循环让 React 渲染进度，再延迟
    onProgress?.(checked, total)
    await new Promise(resolve => setTimeout(resolve, i + BATCH_SIZE < nodes.length ? BATCH_DELAY : 0))
  }

  const rate = total > 0 ? (covered / total) * 100 : 0

  return { covered, total, rate, chainStatus, chainOrgTotal }
}
