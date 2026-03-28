/**
 * 人才相关 API
 * - findExpert-v2: 关键词搜索
 * - graphSinglePersonRelation: 人才关系图
 * - getExpertSummary: 产出统计
 * - talent-background: 学术背景
 * - talent-keyword: 研究关键词
 * - talent-coopTalentTitle: 合作者统计
 * - talent-coopOrgList: 合作机构
 */

const BASE_URL = '/wf-api'

/** 通用请求头 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

/** 通用响应处理 */
async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    if (resp.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  }
  return resp.json()
}

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

// ========== 人才关系图 ==========
export interface GraphNode {
  id: string
  name: string
  org?: string
  h?: number
  class: 'PERSON' | 'ORG'
  orgid?: string
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
      links?: GraphLink[]
    }
  }
}

/** 人才关系图 */
export async function getTalentGraph(auid: string, level = 1, nodeCount = 20): Promise<GraphResult> {
  const url = `${BASE_URL}/api/wf/graphSinglePersonRelation?AUID1=${encodeURIComponent(auid)}&Level=${level}&NodeCount=${nodeCount}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<GraphResult>(resp)
}

// ========== 人才详情 ==========
export interface ExpertSummary {
  [key: string]: number | string | undefined
}

/** 人才产出统计 (论文/专利/成果总数) */
export async function getExpertSummary(auid: string): Promise<ExpertSummary> {
  const url = `${BASE_URL}/api/wf/getExpertSummary?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<ExpertSummary>(resp)
}

/** 人才产出指标 (H指数/引用/合作等详细数据) */
export async function getOutputIndicator(auid: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/getOutputIndicator?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}

/** 人才学术背景 (学历/任职/奖项) */
export async function getTalentBackground(auid: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/talent-background?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}

/** 人才研究关键词 */
export async function getTalentKeywords(auid: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/talent-keyword?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}

// ========== 合作关系 ==========

/** 合作人才统计 */
export async function getCoopTalentTitle(auid: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/talent-coopTalentTitle?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}

/** 合作人才列表 */
export async function getCoopTalentList(auid: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/talent-coopTalentList?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}

/** 合作机构列表 */
export async function getCoopOrgList(auid: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/talent-coopOrgList?auid=${encodeURIComponent(auid)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}

// ========== 关键词趋势 ==========

export interface CkeyIndustryResult {
  g?: { key: number[]; count: string[] }  // 期刊论文
  h?: { key: number[]; count: string[] }  // 专利
  b?: { key: number[]; count: string[] }  // 标准
}

/** 关键词年度趋势（论文/专利/标准） */
export async function getCkeyIndustry(ckey: string): Promise<CkeyIndustryResult> {
  const url = `${BASE_URL}/api/wf/getCkeyIndustry?ckey=${encodeURIComponent(ckey)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<CkeyIndustryResult>(resp)
}

/**
 * 专家检索 - 按关键词查人才
 *
 * key 参数含 OR 运算符和中文，手动拼接 URL 避免 URLSearchParams 语义破坏。
 */
export async function searchExperts(
  key: string,
  from = 0,
  size = 10,
  city?: string,
): Promise<ExpertSearchResult> {
  let url =
    `${BASE_URL}/api/wf/findExpert-v2` +
    `?key=${encodeURIComponent(key)}` +
    `&from=${from}` +
    `&size=${size}`
  if (city) url += `&city=${encodeURIComponent(city)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<ExpertSearchResult>(resp)
}

/**
 * getTalentByQuery-v1 — 支持 PROVINCE + KEYWORD 组合筛选
 * 用于查本地人才数
 */
export async function searchTalentByQuery(
  keywords: string[],
  from = 0,
  size = 10,
  province?: string,
): Promise<ExpertSearchResult> {
  const keywordPart = keywords.map(k => `KEYWORD:${k}`).join(' OR ')
  let qs = `(${keywordPart})`
  if (province) qs = `PROVINCE:${province} AND ${qs}`
  const includes = 'ID,CNAME,ORG,AORG,PROVINCE,CITY,H,QIKAN,ZHUANLI,DIRECTION,CATE,TITLE'
  const url =
    `${BASE_URL}/api/wf/getTalentByQuery-v1` +
    `?from=${from}&size=${size}` +
    `&includes=${encodeURIComponent(includes)}` +
    `&queryString=${encodeURIComponent(qs)}` +
    `&sortField=H.D`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<ExpertSearchResult>(resp)
}
