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
 * 用于大屏地图着色
 */
export async function getCkeyMap(ckey: string): Promise<ProvinceData[]> {
  const url = `${BASE_URL}/api/wf/getCkeyMap?ckey=${encodeURIComponent(ckey)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  const data = await handleResponse<ProvinceData[]>(resp)
  // 接口直接返回 [{name: "北京", value: 3723}, ...] 数组
  return Array.isArray(data) ? data : []
}

// ========== 区域资源统计 ==========

export interface AreaStatistics {
  [key: string]: number | string
}

/**
 * 区域资源统计
 * areacode: 420500=宜昌市, 420100=武汉市, 420000=湖北省
 * 返回各类资源总数：科技企业、重点人才、专利、论文、标准等
 */
export async function getAreaStatistics(areacode: string): Promise<AreaStatistics> {
  // 使用 queryString=(AREACODE:xx*) 格式，支持省市区通配
  const qs = areacode === '*' ? '*' : `(AREACODE:${areacode}*)`
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
