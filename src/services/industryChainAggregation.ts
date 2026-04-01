import { searchOrgs } from './industry'
import { searchExperts } from './talent'

type AggregateType = 'orgs' | 'experts'

interface NodeKeywordMapping {
  keywords: string[]
  queryString: string
}

export interface ChainAggregateResult {
  items: Record<string, unknown>[]
  total: number
}

const PAGE_SIZE = 100
const QUERY_BATCH_SIZE = 1
const QUERY_BATCH_DELAY = 800
const cache = new Map<string, ChainAggregateResult>()
const pending = new Map<string, Promise<ChainAggregateResult>>()

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function runInBatches<T>(
  tasks: Array<() => Promise<T>>,
  batchSize = QUERY_BATCH_SIZE,
  batchDelay = QUERY_BATCH_DELAY,
) {
  const results: T[] = []

  for (let index = 0; index < tasks.length; index += batchSize) {
    const chunk = tasks.slice(index, index + batchSize)
    const chunkResults = await Promise.allSettled(chunk.map((task) => task()))
    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value as T)
      }
    }

    if (index + batchSize < tasks.length) {
      await delay(batchDelay)
    }
  }

  return results
}

function getOrgItems(result: Record<string, unknown> | null) {
  const data = result?.data as Record<string, unknown> | undefined
  return ((data?.orgRecommend ?? data?.items ?? []) as Record<string, unknown>[])
}

function getExpertItems(result: Record<string, unknown> | null) {
  const data = result?.data as Record<string, unknown> | undefined
  return ((data?.expertsRecommend ?? data?.items ?? []) as Record<string, unknown>[])
}

function getTotal(result: Record<string, unknown> | null) {
  const data = result?.data as Record<string, unknown> | undefined
  return Number(data?.total || 0)
}

function getOrgUniqueKey(item: Record<string, unknown>) {
  const id = String(item.ID ?? item.ORGID ?? item.UID ?? '')
  if (id) return `id:${id}`

  const name = String(item.NAME ?? item.name ?? item.org_name ?? '')
  const prov = String(item.PROV ?? item.prov ?? '')
  const city = String(item.CITY ?? item.city ?? '')
  return `name:${name}|${prov}|${city}`
}

function getExpertUniqueKey(item: Record<string, unknown>) {
  const id = String(item.AUID ?? item.ID ?? item.UID ?? '')
  if (id) return `id:${id}`

  const name = String(item.CNAME ?? item.name ?? '')
  const org = String(item.AORG ?? item.org ?? '')
  return `name:${name}|${org}`
}

async function fetchPagedItems(type: AggregateType, queryString: string, city?: string) {
  const fetchPage = async (from: number) => {
    if (type === 'orgs') {
      return (await searchOrgs(queryString, from, PAGE_SIZE, city)) as Record<string, unknown>
    }

    return (await searchExperts(queryString, from, PAGE_SIZE, city)) as Record<string, unknown>
  }

  const firstPage = await fetchPage(0)
  const total = getTotal(firstPage)
  const items = type === 'orgs' ? getOrgItems(firstPage) : getExpertItems(firstPage)

  if (total <= items.length) {
    return items
  }

  const pageTasks: Array<() => Promise<Record<string, unknown>>> = []
  for (let from = items.length; from < total; from += PAGE_SIZE) {
    pageTasks.push(() => fetchPage(from))
  }

  const restPages = await runInBatches(pageTasks)
  const restItems = restPages.flatMap((page) => (type === 'orgs' ? getOrgItems(page) : getExpertItems(page)))

  return [...items, ...restItems]
}

async function computeAggregate(
  type: AggregateType,
  nodeKeywords: Record<string, NodeKeywordMapping>,
  city?: string,
): Promise<ChainAggregateResult> {
  const queries = [...new Set(Object.values(nodeKeywords).map((item) => item.queryString.trim()).filter(Boolean))]

  if (queries.length === 0) {
    return { items: [], total: 0 }
  }

  const queryTasks = queries.map((queryString) => () => fetchPagedItems(type, queryString, city).catch(() => []))
  const queryResults = await runInBatches(queryTasks)
  const uniqueItems = new Map<string, Record<string, unknown>>()

  for (const items of queryResults) {
    for (const item of items) {
      const key = type === 'orgs' ? getOrgUniqueKey(item) : getExpertUniqueKey(item)
      if (!key || uniqueItems.has(key)) continue
      uniqueItems.set(key, item)
    }
  }

  return {
    items: Array.from(uniqueItems.values()),
    total: uniqueItems.size,
  }
}

export async function getChainAggregate(
  chainKey: string,
  type: AggregateType,
  nodeKeywords: Record<string, NodeKeywordMapping>,
  city?: string,
): Promise<ChainAggregateResult> {
  const cacheKey = `${chainKey}:${type}:${city || '__all__'}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  if (pending.has(cacheKey)) {
    return pending.get(cacheKey)!
  }

  const promise = computeAggregate(type, nodeKeywords, city)
  pending.set(cacheKey, promise)

  try {
    const result = await promise
    cache.set(cacheKey, result)
    return result
  } finally {
    pending.delete(cacheKey)
  }
}

export function clearChainAggregateCache(chainKey?: string) {
  if (!chainKey) {
    cache.clear()
    return
  }

  for (const key of cache.keys()) {
    if (key.startsWith(`${chainKey}:`)) {
      cache.delete(key)
    }
  }
}
