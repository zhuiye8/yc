/**
 * 产业链相关 API（机构推荐）
 * GET /api/wf/findOrgByModelsDecode-v1
 */

const BASE_URL = '/wf-api'

export interface OrgItem {
  org_name?: string
  province?: string
  city?: string
  industry_tags?: string[]
  // API 返回的其他字段
  [key: string]: unknown
}

export interface OrgSearchResult {
  code?: number
  data?: {
    total?: number
    items?: OrgItem[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * 机构推荐 - 按关键词查企业
 *
 * queryString 含 OR 运算符和中文，不适合走 URLSearchParams（会破坏语义），
 * 所以直接拼接 URL，仅对 text 参数做 encodeURIComponent。
 */
export async function searchOrgs(
  queryString: string,
  from = 0,
  size = 10,
  city?: string,
): Promise<OrgSearchResult> {
  // text 取 queryString 中第一个关键词（OR 分隔）
  const firstKeyword = queryString.split(/\s+OR\s+/)[0].trim()

  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // 手动拼接 URL，对各参数单独编码
  let url =
    `${BASE_URL}/api/wf/findOrgByModelsDecode-v1` +
    `?text=${encodeURIComponent(firstKeyword)}` +
    `&queryString=${encodeURIComponent(queryString)}` +
    `&from=${from}` +
    `&recommendOrgSize=${size}` +
    `&model=1`

  // city 筛选（注意：prov 参数不生效，只用 city）
  if (city) {
    url += `&city=${encodeURIComponent(city)}`
  }

  const resp = await fetch(url, { method: 'GET', headers })

  if (!resp.ok) {
    if (resp.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  }

  return resp.json()
}
