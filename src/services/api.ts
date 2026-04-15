const BASE_URL = '/wf-api'

// WF 服务凭证（登录和 token 自动刷新复用）
const WF_API_USERNAME = 'i3dev'
const WF_API_SECRET = 'woeuty#WHU!027'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

// 刷新 token 的并发去重
let pendingRefreshPromise: Promise<string | null> | null = null

/**
 * 刷新 WF token。并发调用会复用同一个 promise。
 * 成功返回新 token；失败返回 null（上层可跳转登录页）。
 */
export async function refreshWfToken(): Promise<string | null> {
  if (pendingRefreshPromise) return pendingRefreshPromise

  pendingRefreshPromise = (async () => {
    try {
      const resp = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: WF_API_USERNAME, secret: WF_API_SECRET }),
      })
      if (!resp.ok) return null
      const data = await resp.json() as { accessToken?: string; token?: string }
      const newToken = data.accessToken || data.token
      if (newToken) {
        localStorage.setItem('token', newToken)
        return newToken
      }
      return null
    } catch {
      return null
    } finally {
      pendingRefreshPromise = null
    }
  })()

  return pendingRefreshPromise
}

async function sendRequest(url: string, init: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(url, { ...init, headers })
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options

  let fullUrl = `${BASE_URL}${url}`
  if (params) {
    const search = new URLSearchParams(params).toString()
    fullUrl += `?${search}`
  }

  // 登录接口本身不走 token 自动刷新（避免死循环）
  const isAuthEndpoint = url === '/auth/token' || url.startsWith('/auth/')

  let token = localStorage.getItem('token')
  let response = await sendRequest(fullUrl, init, token)

  // 401 → 尝试刷新 token 重试一次
  if (response.status === 401 && !isAuthEndpoint) {
    const newToken = await refreshWfToken()
    if (newToken) {
      response = await sendRequest(fullUrl, init, newToken)
      token = newToken
    }

    // 刷新失败或重试仍然 401 → 跳登录页
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error(`HTTP 401: Unauthorized (auto-refresh failed)`)
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  get: <T>(url: string, params?: Record<string, string>) =>
    request<T>(url, { method: 'GET', params }),

  post: <T>(url: string, data?: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(data) }),

  put: <T>(url: string, data?: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),

  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
}
