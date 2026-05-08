import { tgFetchWithAuth } from './tgAuth'

const BASE_URL = '/tg-api'

export interface ChainOrgSearchResult {
  total: number
  page: number
  pageSize: number
  items: Record<string, unknown>[]
}

export interface ChainOrgDistributionItem {
  name: string
  total: number
}

export interface ChainOrgCoverageSummary {
  totalNodes: number
  coveredNodes: number
  coverageRate: number
  orgTotal: number
}

export interface ChainOrgNodeCount {
  name: string
  total: number
  children: ChainOrgNodeCount[]
}

async function handleResponse(resp: Response) {
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  const json = await resp.json()
  if (json.code === '401') throw new Error('ChainOrg: Invalid secret key')
  return json as Record<string, unknown>
}

function extractData<T>(json: Record<string, unknown>): T {
  return (json as { data: T }).data
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num : 0
}

export async function searchChainOrgs(
  chain: string,
  province?: string,
  city?: string,
  tags?: string,
  page = 1,
  pageSize = 20,
): Promise<ChainOrgSearchResult> {
  const params = new URLSearchParams({ chain, page: String(page), pageSize: String(pageSize) })
  if (province) params.set('province', province)
  if (city) params.set('city', city)
  if (tags) params.set('tags', tags)

  const url = `${BASE_URL}/api/chain-orgs/search?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse(resp)
  const data = extractData<ChainOrgSearchResult>(json)

  return {
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    items: data?.items ?? [],
  }
}

export async function getChainOrgProvinceDistribution(
  chain: string,
  tags?: string,
): Promise<{ total: number; items: ChainOrgDistributionItem[] }> {
  const params = new URLSearchParams({ chain })
  if (tags) params.set('tags', tags)

  const url = `${BASE_URL}/api/chain-orgs/province-distribution?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse(resp)
  const data = extractData<{ total?: number; items?: Record<string, unknown>[] } | Record<string, unknown>[]>(json)
  const rawItems = Array.isArray(data) ? data : data?.items ?? []
  const items = rawItems
    .map((item) => ({
      name: String(item.province ?? item.name ?? ''),
      total: Number(item.total ?? item.value ?? 0),
    }))
    .filter((item) => item.name && item.total > 0)

  const itemTotal = items.reduce((sum, item) => sum + item.total, 0)

  return {
    total: Array.isArray(data) ? itemTotal : Number(data?.total ?? itemTotal),
    items,
  }
}

export async function getChainOrgCoverageSummary(
  chain: string,
  province?: string,
  city?: string,
  tags?: string,
): Promise<ChainOrgCoverageSummary> {
  const params = new URLSearchParams({ chain })
  if (province) params.set('province', province)
  if (city) params.set('city', city)
  if (tags) params.set('tags', tags)

  const url = `${BASE_URL}/api/chain-orgs/coverage-summary?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse(resp)
  const data = extractData<Partial<ChainOrgCoverageSummary>>(json)

  return {
    totalNodes: toNumber(data?.totalNodes),
    coveredNodes: toNumber(data?.coveredNodes),
    coverageRate: toNumber(data?.coverageRate),
    orgTotal: toNumber(data?.orgTotal),
  }
}

function normalizeNodeCount(node: Record<string, unknown> | undefined): ChainOrgNodeCount {
  const children = Array.isArray(node?.children) ? node.children : []

  return {
    name: String(node?.name ?? ''),
    total: toNumber(node?.total),
    children: children
      .filter((child): child is Record<string, unknown> => Boolean(child && typeof child === 'object'))
      .map((child) => normalizeNodeCount(child)),
  }
}

export async function getChainOrgNodeCounts(
  chain: string,
  province?: string,
  city?: string,
  tags?: string,
): Promise<ChainOrgNodeCount | null> {
  const params = new URLSearchParams({ chain })
  if (province) params.set('province', province)
  if (city) params.set('city', city)
  if (tags) params.set('tags', tags)

  const url = `${BASE_URL}/api/chain-orgs/node-org-counts?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse(resp)
  const data = extractData<Record<string, unknown> | undefined>(json)

  if (!data) return null
  return normalizeNodeCount(data)
}

export async function getChainOrgCityDistribution(
  chain: string,
  province: string,
  tags?: string,
): Promise<{ total: number; items: ChainOrgDistributionItem[] }> {
  const params = new URLSearchParams({ chain, province })
  if (tags) params.set('tags', tags)

  const url = `${BASE_URL}/api/chain-orgs/city-distribution?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse(resp)
  const data = extractData<{ total?: number; items?: Record<string, unknown>[] } | Record<string, unknown>[]>(json)
  const rawItems = Array.isArray(data) ? data : data?.items ?? []
  const items = rawItems
    .map((item) => ({
      name: String(item.city ?? item.name ?? ''),
      total: Number(item.total ?? item.value ?? 0),
    }))
    .filter((item) => item.name && item.total > 0)
  const itemTotal = items.reduce((sum, item) => sum + item.total, 0)

  return {
    total: Array.isArray(data) ? itemTotal : Number(data?.total ?? itemTotal),
    items,
  }
}
