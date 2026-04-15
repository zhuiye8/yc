import { searchExperts } from './talent'

type NodeKeywordMapping = {
  keywords: string[]
  queryString: string
}

interface ExpertListResult {
  items: Record<string, unknown>[]
  total: number
}

interface ChainExpertLiveState {
  queries: string[]
  city?: string
  loadedItems: Record<string, unknown>[]
  seenKeys: Set<string>
  nextOffsets: Map<string, number>
  queryTotals: Map<string, number>
  exhaustedQueries: Set<string>
  total?: number
  totalPromise?: Promise<number>
  loadPromise?: Promise<void>
}

const QUERY_TOTAL_BATCH_SIZE = 2
const QUERY_TOTAL_BATCH_DELAY = 500
const QUERY_FETCH_BATCH_SIZE = 10
// v2: 切换到 TG 接口后清除旧万方缓存
const CACHE_PREFIX = 'industry:experts:v2:'
const DEFAULT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const CACHE_TTL_MS = Number(import.meta.env.VITE_INDUSTRY_EXPERT_CACHE_TTL_MS ?? DEFAULT_CACHE_TTL_MS)
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const MAX_RETRY_ATTEMPTS = 4
const BASE_RETRY_DELAY_MS = 600

const chainExpertStateCache = new Map<string, ChainExpertLiveState>()

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function runInBatches<T>(
  tasks: Array<() => Promise<T>>,
  batchSize = QUERY_TOTAL_BATCH_SIZE,
  batchDelay = QUERY_TOTAL_BATCH_DELAY,
) {
  const results: T[] = []

  for (let index = 0; index < tasks.length; index += batchSize) {
    const chunk = tasks.slice(index, index + batchSize)
    const chunkResults = await Promise.allSettled(chunk.map((task) => task()))
    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      }
    }

    if (index + batchSize < tasks.length) {
      await delay(batchDelay)
    }
  }

  return results
}

function getExpertItems(result: Record<string, unknown> | null) {
  const data = result?.data as Record<string, unknown> | undefined
  return ((data?.expertsRecommend ?? data?.items ?? []) as Record<string, unknown>[])
}

function getTotal(result: Record<string, unknown> | null) {
  const data = result?.data as Record<string, unknown> | undefined
  return Number(data?.total || 0)
}

function getExpertUniqueKey(item: Record<string, unknown>) {
  const id = String(item.AUID ?? item.ID ?? item.UID ?? '')
  if (id) return `id:${id}`

  const name = String(item.CNAME ?? item.name ?? '')
  const org = String(item.AORG ?? item.org ?? '')
  return `name:${name}|${org}`
}

function getHttpStatus(error: unknown) {
  const text = error instanceof Error ? error.message : String(error)
  const match = text.match(/HTTP\s+(\d{3})/i)
  return match ? Number(match[1]) : null
}

function getRetryDelayMs(attempt: number, status: number | null) {
  const baseDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
  const jitter = Math.floor(Math.random() * 300)
  if (status === 429) {
    return baseDelay + 400 + jitter
  }

  return baseDelay + jitter
}

async function searchExpertsWithRetry(query: string, from: number, size: number, city?: string) {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await searchExperts(query, from, size, city)
    } catch (error) {
      lastError = error
      const status = getHttpStatus(error)
      if (!status || !RETRYABLE_STATUS.has(status) || attempt === MAX_RETRY_ATTEMPTS) {
        throw error
      }

      await delay(getRetryDelayMs(attempt, status))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Expert search failed')
}

function getCacheKey(chainKey: string, city?: string) {
  return `${chainKey}:${city || '__all__'}`
}

function getQueries(nodeKeywords: Record<string, NodeKeywordMapping>) {
  return [...new Set(Object.values(nodeKeywords).map((item) => item.queryString.trim()).filter(Boolean))]
}

function getState(chainKey: string, nodeKeywords: Record<string, NodeKeywordMapping>, city?: string) {
  const cacheKey = getCacheKey(chainKey, city)
  const existing = chainExpertStateCache.get(cacheKey)
  if (existing) {
    return existing
  }

  const nextState: ChainExpertLiveState = {
    queries: getQueries(nodeKeywords),
    city,
    loadedItems: [],
    seenKeys: new Set<string>(),
    nextOffsets: new Map<string, number>(),
    queryTotals: new Map<string, number>(),
    exhaustedQueries: new Set<string>(),
  }

  chainExpertStateCache.set(cacheKey, nextState)
  return nextState
}

function getStorageKey(...parts: Array<string | number | undefined>) {
  return `${CACHE_PREFIX}${parts.map((part) => String(part ?? '__all__')).join(':')}`
}

function getCachedValue<T>(storageKey: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { expireAt?: number; data?: T }
    if (!parsed || typeof parsed.expireAt !== 'number') {
      window.localStorage.removeItem(storageKey)
      return null
    }

    if (Date.now() > parsed.expireAt) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    return parsed.data ?? null
  } catch {
    return null
  }
}

function setCachedValue<T>(storageKey: string, data: T) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        expireAt: Date.now() + CACHE_TTL_MS,
        data,
      }),
    )
  } catch {
    // Ignore storage failures and continue with live data.
  }
}

async function fetchExpertPage(queryString: string, from: number, size: number, city?: string) {
  return (await searchExpertsWithRetry(queryString, from, size, city)) as Record<string, unknown>
}

async function computeLightTotal(state: ChainExpertLiveState) {
  if (typeof state.total === 'number') {
    return state.total
  }

  if (state.totalPromise) {
    return state.totalPromise
  }

  state.totalPromise = (async () => {
    const results = await runInBatches(
      state.queries.map((queryString) => async () => ({
        queryString,
        result: await fetchExpertPage(queryString, 0, 1, state.city),
      })),
    )
    const total = results.reduce((sum, entry) => {
      const queryTotal = getTotal(entry.result)
      state.queryTotals.set(entry.queryString, queryTotal)
      return sum + queryTotal
    }, 0)

    state.total = total
    return total
  })()

  try {
    return await state.totalPromise
  } finally {
    state.totalPromise = undefined
  }
}

async function loadUntil(state: ChainExpertLiveState, targetCount: number) {
  while (state.loadedItems.length < targetCount && state.exhaustedQueries.size < state.queries.length) {
    let progressed = false

    for (const queryString of state.queries) {
      if (state.loadedItems.length >= targetCount) {
        break
      }

      if (state.exhaustedQueries.has(queryString)) {
        continue
      }

      const from = state.nextOffsets.get(queryString) ?? 0
      let result: Record<string, unknown> | null = null

      try {
        result = await fetchExpertPage(queryString, from, QUERY_FETCH_BATCH_SIZE, state.city)
      } catch {
        state.exhaustedQueries.add(queryString)
        continue
      }

      const items = getExpertItems(result)
      const total = getTotal(result)
      state.queryTotals.set(queryString, total)

      if (items.length === 0 || from + items.length >= total) {
        state.exhaustedQueries.add(queryString)
      } else {
        state.nextOffsets.set(queryString, from + items.length)
      }

      if (items.length === 0) {
        continue
      }

      progressed = true

      for (const item of items) {
        const uniqueKey = getExpertUniqueKey(item)
        if (!uniqueKey || state.seenKeys.has(uniqueKey)) {
          continue
        }

        state.seenKeys.add(uniqueKey)
        state.loadedItems.push(item)

        if (state.loadedItems.length >= targetCount) {
          break
        }
      }
    }

    if (!progressed) {
      break
    }
  }
}

async function ensureLoadedCount(state: ChainExpertLiveState, targetCount: number) {
  if (state.loadedItems.length >= targetCount) {
    return
  }

  state.loadPromise = (state.loadPromise ?? Promise.resolve()).then(() => loadUntil(state, targetCount))

  try {
    await state.loadPromise
  } finally {
    state.loadPromise = undefined
  }
}

export async function getIndustryChainExpertPreviewLive(
  chainKey: string,
  nodeKeywords: Record<string, NodeKeywordMapping>,
  city?: string,
  limit = 8,
): Promise<ExpertListResult> {
  const storageKey = getStorageKey('chain-preview', chainKey, city, limit)
  const cached = getCachedValue<ExpertListResult>(storageKey)
  if (cached) {
    return cached
  }

  const state = getState(chainKey, nodeKeywords, city)
  const totalPromise = computeLightTotal(state)
  await ensureLoadedCount(state, limit)
  const total = await totalPromise

  const result = {
    total,
    items: state.loadedItems.slice(0, limit),
  }
  setCachedValue(storageKey, result)
  return result
}

export async function getIndustryChainExpertPageLive(
  chainKey: string,
  nodeKeywords: Record<string, NodeKeywordMapping>,
  city: string | undefined,
  page = 1,
  pageSize = 10,
): Promise<ExpertListResult> {
  const storageKey = getStorageKey('chain-page', chainKey, city, page, pageSize)
  const cached = getCachedValue<ExpertListResult>(storageKey)
  if (cached) {
    return cached
  }

  const state = getState(chainKey, nodeKeywords, city)
  const totalPromise = computeLightTotal(state)
  await ensureLoadedCount(state, page * pageSize)
  const total = await totalPromise
  const from = (page - 1) * pageSize

  const result = {
    total,
    items: state.loadedItems.slice(from, from + pageSize),
  }
  setCachedValue(storageKey, result)
  return result
}

export async function getIndustryNodeExpertTotalsLive(queryString: string, city?: string) {
  const storageKey = getStorageKey('node-total', queryString, city)
  const cached = getCachedValue<{ expertTotal: number; localExpertTotal: number }>(storageKey)
  if (cached) {
    return cached
  }

  const [national, local] = await Promise.all([
    searchExpertsWithRetry(queryString, 0, 1).catch(() => null),
    city ? searchExpertsWithRetry(queryString, 0, 1, city).catch(() => null) : Promise.resolve(null),
  ])

  const result = {
    expertTotal: getTotal(national as Record<string, unknown> | null),
    localExpertTotal: city ? getTotal(local as Record<string, unknown> | null) : 0,
  }
  setCachedValue(storageKey, result)
  return result
}

export async function getIndustryNodeExpertPageLive(
  queryString: string,
  page = 1,
  pageSize = 10,
  city?: string,
): Promise<ExpertListResult> {
  const storageKey = getStorageKey('node-page', queryString, city, page, pageSize)
  const cached = getCachedValue<ExpertListResult>(storageKey)
  if (cached) {
    return cached
  }

  const from = (page - 1) * pageSize
  const result = await searchExpertsWithRetry(queryString, from, pageSize, city)
  const data = result?.data as Record<string, unknown> | undefined

  const response = {
    total: Number(data?.total || 0),
    items: ((data?.expertsRecommend ?? data?.items ?? []) as Record<string, unknown>[]),
  }
  setCachedValue(storageKey, response)
  return response
}

export async function searchIndustryExpertsLive(keyword: string, pageSize = 20, city?: string): Promise<ExpertListResult> {
  const storageKey = getStorageKey('search', keyword.trim(), city, pageSize)
  const cached = getCachedValue<ExpertListResult>(storageKey)
  if (cached) {
    return cached
  }

  const result = await searchExpertsWithRetry(keyword, 0, pageSize, city)
  const data = result?.data as Record<string, unknown> | undefined

  const response = {
    total: Number(data?.total || 0),
    items: ((data?.expertsRecommend ?? data?.items ?? []) as Record<string, unknown>[]),
  }
  setCachedValue(storageKey, response)
  return response
}

export function clearIndustryChainExpertLiveCache(chainKey?: string) {
  if (!chainKey) {
    chainExpertStateCache.clear()
    return
  }

  for (const cacheKey of chainExpertStateCache.keys()) {
    if (cacheKey.startsWith(`${chainKey}:`)) {
      chainExpertStateCache.delete(cacheKey)
    }
  }
}

export function clearIndustryExpertLiveStorageCache() {
  if (typeof window === 'undefined') {
    return
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key))
}
