/**
 * 产业链人才查询接口 — TalentGraphService ChainTalent
 *
 * 后端按产业链名称一次性查询去重后的人才数据，替代前端 141 次循环累加。
 * 认证方式：Bearer Token（通过 tgAuth.ts 自动管理）
 * 不缓存：研究院接口请求量已大幅降低，无需前端缓存。
 */

import { tgFetchWithAuth } from './tgAuth'

const BASE_URL = '/tg-api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleResponse<T = any>(resp: Response): Promise<T> {
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  const json = await resp.json()
  if (json.code === '401') throw new Error('ChainTalent: Invalid secret key')
  return json
}

function extractData<T>(json: Record<string, unknown>): T {
  return (json as { data: T }).data
}

// ========== 类型定义 ==========

export interface ChainTalentSearchResult {
  total: number
  page: number
  pageSize: number
  items: Record<string, unknown>[]
}

export interface ChainTalentDistributionItem {
  name?: string
  city?: string
  value: number
}

export interface ChainTalentDistributionResult {
  total: number
  items: ChainTalentDistributionItem[]
}

export interface ChainTalentYearTrendResult {
  years: number[]
  papers: number[]
  patents: number[]
  standards: number[]
}

// ========== 接口封装 ==========

/**
 * 产业链人才搜索 — 去重后的总数 + 分页列表
 */
export async function searchChainTalents(
  chain: string,
  province?: string,
  city?: string,
  page = 1,
  pageSize = 20,
  nativePlace?: string,
): Promise<ChainTalentSearchResult> {
  const params = new URLSearchParams({ chain, page: String(page), pageSize: String(pageSize) })
  if (province) params.set('province', province)
  if (city) params.set('city', city)
  if (nativePlace) params.set('nativePlace', nativePlace)

  const url = `${BASE_URL}/api/chain-talents/search?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<ChainTalentSearchResult>(json)

  return {
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    items: data?.items ?? [],
  }
}

/**
 * 产业链人才省份分布（全国 34 省）
 */
export async function getChainTalentProvinceDistribution(
  chain: string,
): Promise<ChainTalentDistributionResult> {
  const url = `${BASE_URL}/api/chain-talents/province-distribution?chain=${encodeURIComponent(chain)}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<ChainTalentDistributionResult>(json)

  return {
    total: data?.total ?? 0,
    items: data?.items ?? [],
  }
}

/**
 * 产业链人才城市分布（指定省份内）
 */
export async function getChainTalentCityDistribution(
  chain: string,
  province: string,
): Promise<ChainTalentDistributionResult> {
  const params = new URLSearchParams({ chain, province })
  const url = `${BASE_URL}/api/chain-talents/city-distribution?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<ChainTalentDistributionResult>(json)

  return {
    total: data?.total ?? 0,
    items: data?.items ?? [],
  }
}

/**
 * 产业链人才年度趋势
 */
export async function getChainTalentYearTrend(
  chain: string,
  startYear?: number,
  endYear?: number,
): Promise<ChainTalentYearTrendResult> {
  const params = new URLSearchParams({ chain })
  if (startYear) params.set('startYear', String(startYear))
  if (endYear) params.set('endYear', String(endYear))

  const url = `${BASE_URL}/api/chain-talents/year-trend?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<ChainTalentYearTrendResult>(json)

  return {
    years: data?.years ?? [],
    papers: data?.papers ?? [],
    patents: data?.patents ?? [],
    standards: data?.standards ?? [],
  }
}
