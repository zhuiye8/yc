/**
 * TalentGraphService (port 19020) Token 管理
 *
 * 独立于万方 token，自动获取、缓存、刷新
 * - 登录接口: POST /tg-api/api/auth/login
 * - 认证方式: Authorization: Bearer {token}
 * - Token 存储: localStorage['tg_token'] + localStorage['tg_token_expires']
 *
 * 修改账号密码：修改下方 TG_USERNAME / TG_PASSWORD 常量
 */

const TG_BASE_URL = '/tg-api'

/** TG 服务账号（写死，用户无感知） */
const TG_USERNAME = 'yichang_888_20260414'
const TG_PASSWORD = 'epk#w55ujo66IHHhmYKXQhNnal'

const STORAGE_TOKEN_KEY = 'tg_token'
const STORAGE_EXPIRES_KEY = 'tg_token_expires'

/** 提前 60 秒刷新，避免刚好过期 */
const REFRESH_BUFFER_MS = 60 * 1000

/** 防止并发获取 token */
let pendingTokenPromise: Promise<string> | null = null

/**
 * 调用 TG 登录接口获取新 token
 */
async function fetchNewToken(): Promise<string> {
  const resp = await fetch(`${TG_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TG_USERNAME, password: TG_PASSWORD }),
  })

  if (!resp.ok) {
    throw new Error(`TG login failed: HTTP ${resp.status}`)
  }

  const json = await resp.json()
  const data = json?.data as { token?: string; expiresAt?: string } | undefined

  if (!data?.token) {
    throw new Error('TG login: no token in response')
  }

  // 存储 token 和过期时间
  localStorage.setItem(STORAGE_TOKEN_KEY, data.token)
  if (data.expiresAt) {
    localStorage.setItem(STORAGE_EXPIRES_KEY, data.expiresAt)
  }

  return data.token
}

/**
 * 检查 token 是否有效（未过期）
 */
function isTokenValid(): boolean {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY)
  if (!token) return false

  const expiresAt = localStorage.getItem(STORAGE_EXPIRES_KEY)
  if (!expiresAt) return true // 没有过期时间就假定有效

  const expiresMs = new Date(expiresAt).getTime()
  return Date.now() < expiresMs - REFRESH_BUFFER_MS
}

/**
 * 获取有效的 TG token（自动刷新）
 * 并发安全：多个请求同时调用只会发一次登录请求
 */
export async function getTgToken(): Promise<string> {
  // 缓存有效直接返回
  if (isTokenValid()) {
    return localStorage.getItem(STORAGE_TOKEN_KEY)!
  }

  // 已有进行中的请求，复用
  if (pendingTokenPromise) {
    return pendingTokenPromise
  }

  // 发起新的登录请求
  pendingTokenPromise = fetchNewToken().finally(() => {
    pendingTokenPromise = null
  })

  return pendingTokenPromise
}

/**
 * 获取 TG 请求头（含 Bearer token）
 * 所有 TG API 调用前使用此函数获取 headers
 */
export async function getTgAuthHeaders(): Promise<Record<string, string>> {
  const token = await getTgToken()
  return { 'Authorization': `Bearer ${token}` }
}

/**
 * 清除 TG token（登出时调用）
 */
export function clearTgToken() {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_EXPIRES_KEY)
}

/**
 * 处理 401 响应：清除 token 并重试一次
 * 用于包装 fetch 调用
 */
export async function tgFetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getTgAuthHeaders()
  const resp = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  })

  if (resp.status === 401) {
    // Token 过期，清除并重新获取
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    const newHeaders = await getTgAuthHeaders()
    return fetch(url, {
      ...options,
      headers: { ...newHeaders, ...(options.headers as Record<string, string> || {}) },
    })
  }

  return resp
}
