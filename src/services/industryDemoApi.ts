import type { IndustryRegionFilter } from './industryRegion'

type EntityType = 'orgs' | 'experts'

const demoApiRoot = '/demo-api'
const dataSourceMode = import.meta.env.VITE_INDUSTRY_DATA_SOURCE ?? 'live'
const demoDelayMs = Number(import.meta.env.VITE_INDUSTRY_DEMO_DELAY_MS ?? 1200)

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function withDemoDelay<T>(promise: Promise<T>) {
  if (demoDelayMs <= 0) {
    return promise
  }

  const [result] = await Promise.all([promise, delay(demoDelayMs)])
  return result
}

async function requestDemoApi<T>(pathname: string, params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })

  const url = `${demoApiRoot}${pathname}${search.size > 0 ? `?${search.toString()}` : ''}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Demo API request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

function toQueryParams(region?: IndustryRegionFilter) {
  return {
    province: region?.province,
    city: region?.city,
  }
}

export function isIndustryDemoApiEnabled() {
  return dataSourceMode === 'demo-api'
}

export async function getDemoChainCoverage(chainKey: string, region?: IndustryRegionFilter) {
  return withDemoDelay(
    requestDemoApi<{
      covered: number
      total: number
      rate: number
      chainStatus: 'strong' | 'weak' | 'missing'
      chainOrgTotal: number
      chainExpertTotal: number
      nodeOrgCounts: Record<string, number>
    }>(`/industry/chains/${chainKey}/summary`, toQueryParams(region)),
  )
}

export async function getDemoChainAggregate(
  chainKey: string,
  type: EntityType,
  region?: IndustryRegionFilter,
  page = 1,
  pageSize = 10,
) {
  return withDemoDelay(
    requestDemoApi<{ total: number; items: Record<string, unknown>[] }>(
      `/industry/chains/${chainKey}/aggregate/${type}`,
      {
        ...toQueryParams(region),
        page,
        pageSize,
      },
    ),
  )
}

export async function getDemoNodeStats(
  chainKey: string,
  nodeName: string,
  region?: IndustryRegionFilter,
) {
  return withDemoDelay(
    requestDemoApi<{
      queryString: string
      orgTotal: number
      localOrgTotal: number
      expertTotal: number
      localExpertTotal: number
      scopeKey: string
    }>('/industry/nodes/stats', {
      chainKey,
      nodeName,
      ...toQueryParams(region),
    }),
  )
}

export async function getDemoNodePage(
  chainKey: string,
  nodeName: string,
  type: EntityType,
  region?: IndustryRegionFilter,
  page = 1,
  pageSize = 10,
) {
  return withDemoDelay(
    requestDemoApi<{ total: number; items: Record<string, unknown>[] }>(
      '/industry/nodes/items',
      {
        chainKey,
        nodeName,
        type,
        ...toQueryParams(region),
        page,
        pageSize,
      },
    ),
  )
}

export async function searchIndustryInDemoApi(keyword: string, region?: IndustryRegionFilter) {
  return withDemoDelay(
    requestDemoApi<{
      mode: 'node-match' | 'fallback' | 'empty'
      matchedLabels: string[]
      orgs: Record<string, unknown>[]
      orgTotal: number
      experts: Record<string, unknown>[]
      expertTotal: number
    }>('/industry/search', {
      q: keyword,
      ...toQueryParams(region),
      limit: 50,
    }),
  )
}
