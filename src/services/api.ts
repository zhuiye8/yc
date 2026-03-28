const BASE_URL = '/wf-api'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options

  let fullUrl = `${BASE_URL}${url}`
  if (params) {
    const search = new URLSearchParams(params).toString()
    fullUrl += `?${search}`
  }

  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(fullUrl, { ...init, headers })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
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
