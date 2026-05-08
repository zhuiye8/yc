import {
  getChainOrgCoverageSummary,
  getChainOrgNodeCounts,
  type ChainOrgNodeCount,
} from './chainOrg'

export interface CoverageResult {
  covered: number
  total: number
  rate: number
  chainStatus: 'strong' | 'weak' | 'missing'
  chainOrgTotal: number
  nodeOrgCounts: Record<string, number>
}

const cache = new Map<string, CoverageResult>()
const pending = new Map<string, Promise<CoverageResult>>()
const progressCallbacks = new Map<string, (checked: number, total: number) => void>()

export async function getChainCoverage(
  chainKey: string,
  chainName: string,
  province?: string,
  city?: string,
  onProgress?: (checked: number, total: number) => void,
): Promise<CoverageResult> {
  const cacheKey = `${chainKey}:${province || 'national'}:${city || 'all'}`

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

  const promise = computeCoverage(chainName, province, city, proxyProgress)
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

export function getNodeStatus(orgCount: number): 'strong' | 'weak' | 'missing' {
  if (orgCount === 0) return 'missing'
  if (orgCount <= 20) return 'weak'
  return 'strong'
}

export function aggregateStatus(childStatuses: ('strong' | 'weak' | 'missing')[]): 'strong' | 'weak' | 'missing' {
  if (childStatuses.length === 0) return 'missing'
  const allMissing = childStatuses.every(s => s === 'missing')
  if (allMissing) return 'missing'
  const allStrong = childStatuses.every(s => s === 'strong')
  if (allStrong) return 'strong'
  return 'weak'
}

function stripStagePrefix(name: string) {
  return name.replace(/^(上游|中游|下游)[：:]\s*/, '').trim()
}

function addNodeCountAliases(counts: Record<string, number>, name: string, total: number) {
  if (!name) return

  counts[name] = total

  const stripped = stripStagePrefix(name)
  if (stripped && stripped !== name && counts[stripped] === undefined) {
    counts[stripped] = total
  }
}

function flattenNodeCounts(node: ChainOrgNodeCount | null, counts: Record<string, number>) {
  if (!node) return

  addNodeCountAliases(counts, node.name.trim(), node.total)
  node.children.forEach((child) => flattenNodeCounts(child, counts))
}

function emptyCoverage(): CoverageResult {
  return {
    covered: 0,
    total: 0,
    rate: 0,
    chainStatus: 'missing',
    chainOrgTotal: 0,
    nodeOrgCounts: {},
  }
}

async function computeCoverage(
  chainName: string,
  province?: string,
  city?: string,
  onProgress?: (checked: number, total: number) => void,
): Promise<CoverageResult> {
  try {
    const summary = await getChainOrgCoverageSummary(chainName, province, city)
    onProgress?.(0, summary.totalNodes)

    const nodeCounts = await getChainOrgNodeCounts(chainName, province, city).catch(() => null)
    const flattenedCounts: Record<string, number> = {}
    flattenNodeCounts(nodeCounts, flattenedCounts)

    onProgress?.(summary.totalNodes, summary.totalNodes)

    return {
      covered: summary.coveredNodes,
      total: summary.totalNodes,
      rate: summary.coverageRate,
      chainStatus: getNodeStatus(summary.orgTotal),
      chainOrgTotal: summary.orgTotal,
      nodeOrgCounts: flattenedCounts,
    }
  } catch {
    return emptyCoverage()
  }
}
