/**
 * 人才相关 API — TalentGraphService (port 19020)
 *
 * 认证方式：Bearer Token（通过 tgAuth.ts 自动管理）
 * 修改账号密码：在 src/services/tgAuth.ts 中修改 TG_USERNAME / TG_PASSWORD
 */

import { tgFetchWithAuth } from './tgAuth'

const BASE_URL = '/tg-api'

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  const json = await resp.json()
  if (json.code === '401') throw new Error('TalentGraphService: Invalid secret key')
  return json
}

function extractData<T>(json: Record<string, unknown>): T {
  return (json as { data: T }).data
}

// 研究院接口不缓存：请求量已大幅降低，无需前端 localStorage 缓存

// ========== 类型定义（保持不变，供外部使用） ==========

export interface ExpertItem {
  name?: string
  org?: string
  h_index?: number
  research_fields?: string[]
  [key: string]: unknown
}

export interface ExpertSearchResult {
  code?: number
  data?: {
    total?: number
    items?: ExpertItem[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface GraphNode {
  id: string
  name: string
  org?: string
  h?: number
  class: 'PERSON' | 'ORG' | 'TECH' | 'CHAIN_ROOT' | 'CHAIN'
  orgid?: string
  [key: string]: unknown
}

export interface GraphRelation {
  startid: string
  endid: string
  cnt?: number
  type?: string
  attr?: string
  class?: string
  [key: string]: unknown
}

export interface GraphLink {
  source: string
  target: string
  value?: number
  [key: string]: unknown
}

export interface GraphResult {
  code?: number
  data?: {
    sources?: {
      nodes?: GraphNode[]
      relations?: GraphRelation[]
    }
  }
}

export interface ExpertSummary {
  [key: string]: number | string | undefined
}

export interface CkeyIndustryResult {
  [key: string]: { key: number[]; count: string[] } | undefined
  g?: { key: number[]; count: string[] }
  h?: { key: number[]; count: string[] }
  b?: { key: number[]; count: string[] }
  c?: { key: number[]; count: string[] }
  a?: { key: number[]; count: string[] }
}

// ========== 人才搜索 ==========

export async function searchExperts(
  key: string,
  from = 0,
  size = 10,
  city?: string,
): Promise<ExpertSearchResult> {
  const page = Math.floor(from / size) + 1
  const params = new URLSearchParams({
    keyword: key,
    page: String(page),
    pageSize: String(size),
  })
  if (city) params.set('city', city)
  const url = `${BASE_URL}/api/talents/search?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{ total?: number; items?: Record<string, unknown>[] }>(json)

  const result: ExpertSearchResult = {
    code: 200,
    data: {
      total: data?.total ?? 0,
      expertsRecommend: data?.items ?? [],
      items: data?.items ?? [],
    },
  }
  return result
}

export async function searchTalentByQuery(
  keywords: string[],
  from = 0,
  size = 10,
  province?: string,
): Promise<ExpertSearchResult> {
  const keyword = keywords.join(' ')
  const page = Math.floor(from / size) + 1
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    pageSize: String(size),
  })
  if (province) params.set('province', province)
  const url = `${BASE_URL}/api/talents/search?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{ total?: number; items?: Record<string, unknown>[] }>(json)

  const result: ExpertSearchResult = {
    code: 200,
    data: {
      total: data?.total ?? 0,
      sources: (data?.items ?? []).map(item => ({ source: item })),
      items: data?.items ?? [],
    },
  }
  return result
}

// ========== 人才关系图 ==========

export async function getTalentGraph(auid: string, level = 1, nodeCount = 20): Promise<GraphResult> {
  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}/graph?level=${level}&nodeCount=${nodeCount}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{ nodes?: GraphNode[]; relations?: GraphRelation[] }>(json)

  const result: GraphResult = {
    code: 200,
    data: {
      sources: {
        nodes: data?.nodes ?? [],
        relations: data?.relations ?? [],
      },
    },
  }
  return result
}

// ========== 人才详情 ==========

export async function getExpertSummary(auid: string): Promise<ExpertSummary> {
  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}/output-stats`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const result = extractData<ExpertSummary>(json)
  return result
}

export async function getOutputIndicator(auid: string): Promise<Record<string, unknown>> {

  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}/output-stats`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const result = extractData<Record<string, unknown>>(json)
  return result
}

export async function getTalentBackground(auid: string): Promise<Record<string, unknown>> {

  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<Record<string, unknown>>(json)

  const intro = String(data?.INTRO ?? '').replace(/\^A\d+\^B/g, '').replace(/%/g, '；')
  const result = { data: intro || data?.EDU || '', background: intro, detail: data }
  return result
}

export async function getTalentKeywords(auid: string): Promise<Record<string, unknown>> {

  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<Record<string, unknown>>(json)

  const direction = String(data?.DIRECTION ?? '')
  const tags = Array.isArray(data?.TAGLARG) ? data.TAGLARG as string[] : []
  const keywords = [
    ...direction.split(/[,，、\s]+/).filter(Boolean),
    ...tags.filter((t: string) => !t.startsWith('中图_') && !t.startsWith('行业_') && !t.startsWith('主题_') && !t.startsWith('战略新兴产业_') && !t.startsWith('专利_')).map((t: string) => t.replace(/^人才类型_/, '')),
  ].slice(0, 15)

  const result = { data: keywords.map(kw => ({ KEYWORD: kw })), keywords }
  return result
}

// ========== 合作关系 ==========

export async function getCoopTalentTitle(auid: string): Promise<Record<string, unknown>> {

  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}/coauthors?page=1&pageSize=1`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{ total?: number }>(json)
  const result = { data: { total: data?.total ?? 0 } }
  return result
}

export async function getCoopTalentList(auid: string): Promise<Record<string, unknown>> {

  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}/coauthors?page=1&pageSize=20`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{ items?: Record<string, unknown>[]; total?: number }>(json)

  const list = (data?.items ?? []).map(item => ({
    CNAME: item.name, AORG: item.org, CATE: item.field, CNT: 0, ...item,
  }))
  const result = { data: list, result: list }
  return result
}

export async function getCoopOrgList(auid: string): Promise<Record<string, unknown>> {

  const url = `${BASE_URL}/api/talents/${encodeURIComponent(auid)}/cooperate-orgs?page=1&pageSize=20`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{ items?: Record<string, unknown>[]; total?: number }>(json)

  const list = (data?.items ?? []).map(item => ({
    ORG: item.orgName, org: item.orgName, name: item.orgName, TYPE: '', CNT: 0, ...item,
  }))
  const result = { data: list, result: list }
  return result
}

// ========== 关键词趋势 ==========

export async function getCkeyIndustry(ckey: string): Promise<CkeyIndustryResult> {
  const params = new URLSearchParams({
    keyword: ckey,
    startYear: '2018',
    endYear: String(new Date().getFullYear()),
  })
  const url = `${BASE_URL}/api/stats/year-trend?${params}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<{
    years?: number[]; papers?: number[]; patents?: number[]; standards?: number[]
  }>(json)

  const years = data?.years ?? []
  const toStringArray = (arr?: number[]) => (arr ?? []).map(String)

  const result: CkeyIndustryResult = {
    g: { key: years, count: toStringArray(data?.papers) },
    h: { key: years, count: toStringArray(data?.patents) },
    b: { key: years, count: toStringArray(data?.standards) },
  }
  return result
}

// ========== 论文 / 专利列表（新增） ==========

export interface PaperItem {
  id: string
  title: string
  publishYear: string
  journal: string
  authors: string[]
  doi: string | null
}

export interface PatentItem {
  id: string
  title: string
  applyDate: string
  patentType: string
  status: string
  patentNo: string
}

export interface PagedListResult<T> {
  total: number
  page: number
  pageSize: number
  items: T[]
}

/** 人才论文列表 — GET /api/papers/list */
export async function getPaperList(talentId: string, page = 1, pageSize = 5): Promise<PagedListResult<PaperItem>> {

  const url = `${BASE_URL}/api/papers/list?id=${encodeURIComponent(talentId)}&page=${page}&pageSize=${pageSize}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<PagedListResult<PaperItem>>(json)
  const result = { total: data?.total ?? 0, page: data?.page ?? page, pageSize: data?.pageSize ?? pageSize, items: data?.items ?? [] }
  return result
}

/** 人才专利列表 — GET /api/patents/list */
export async function getPatentList(talentId: string, page = 1, pageSize = 5): Promise<PagedListResult<PatentItem>> {

  const url = `${BASE_URL}/api/patents/list?id=${encodeURIComponent(talentId)}&page=${page}&pageSize=${pageSize}`
  const resp = await tgFetchWithAuth(url)
  const json = await handleResponse<Record<string, unknown>>(resp)
  const data = extractData<PagedListResult<PatentItem>>(json)
  const result = { total: data?.total ?? 0, page: data?.page ?? page, pageSize: data?.pageSize ?? pageSize, items: data?.items ?? [] }
  return result
}
