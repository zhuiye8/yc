/**
 * 大屏专用 API
 * - getCkeyMap: 各省分布数据（地图着色）
 * - talent-resourceStatistics: 区域资源统计（KPI数字）
 * - 复用 industry.ts / talent.ts 的搜索接口
 */

const BASE_URL = '/wf-api'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    if (resp.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  }
  return resp.json()
}

// ========== 各省分布（地图数据） ==========

export interface ProvinceData {
  name: string
  value: number
}

/**
 * 按关键词获取各省数量分布
 * 新接口: TalentGraphService /api/stats/region-aggregation
 * 24h localStorage 缓存
 */
export async function getCkeyMap(ckey: string): Promise<ProvinceData[]> {
  const cacheKey = `screen:ckeymap:${ckey}`
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const parsed = JSON.parse(raw) as { expireAt: number; data: ProvinceData[] }
      if (Date.now() <= parsed.expireAt) return parsed.data
      localStorage.removeItem(cacheKey)
    }
  } catch { /* ignore */ }

  const { tgFetchWithAuth } = await import('./tgAuth')
  const url = `/tg-api/api/stats/region-aggregation?keyword=${encodeURIComponent(ckey)}&size=34`
  const resp = await tgFetchWithAuth(url)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
  const json = await resp.json()
  const result = (json?.data as { items?: ProvinceData[] })?.items ?? []

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ expireAt: Date.now() + 24 * 60 * 60 * 1000, data: result }))
  } catch { /* ignore */ }

  return result
}

// ========== 区域资源统计 ==========

export interface AreaStatistics {
  [key: string]: number | string
}

/**
 * 区域资源统计
 * areacode: 420500=宜昌市, 420100=武汉市, 420000=湖北省
 * keyword: 可选产业链关键词（如"人工智能"），用 AND 组合查询
 * 返回各类资源总数：科技企业、重点人才、专利、论文、标准等
 */
export async function getAreaStatistics(areacode: string, keyword?: string): Promise<AreaStatistics> {
  // 使用 queryString=(AREACODE:xx*) 格式，支持省市区通配
  let qs = areacode === '*' ? '*' : `(AREACODE:${areacode}*)`
  if (keyword) qs += ` AND ${keyword}`
  const url = `${BASE_URL}/api/wf/talent-resourceStatistics?queryString=${encodeURIComponent(qs)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<AreaStatistics>(resp)
}

// ========== 关键词综合信息 ==========

/**
 * 获取关键词综合信息
 */
export async function getCkeyInfo(ckey: string): Promise<Record<string, unknown>> {
  const url = `${BASE_URL}/api/wf/getCkeyInfo?ckey=${encodeURIComponent(ckey)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  return handleResponse<Record<string, unknown>>(resp)
}
