import { api } from './api'

// 前端展示用账号（用户输入的）
const DISPLAY_USERNAME = 'yc_vx274'
const DISPLAY_PASSWORD = 'T9#qL2@pW7!mR4'

// 真实 API 凭证（对用户不可见）
const API_USERNAME = 'i3dev'
const API_SECRET = 'woeuty#WHU!027'

interface LoginResponse {
  accessToken?: string
  token?: string
  tokenType?: string
  expiresIn?: number
  [key: string]: unknown
}

/**
 * 两层登录：先校验前端账号密码，通过后再用真实凭证获取 token
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  // 第一层：硬编码校验
  if (username !== DISPLAY_USERNAME || password !== DISPLAY_PASSWORD) {
    throw new Error('账号或密码错误')
  }

  // 第二层：用真实凭证获取 token
  const res = await api.post<LoginResponse>('/auth/token', {
    username: API_USERNAME,
    secret: API_SECRET,
  })
  const token = res.accessToken || res.token
  if (token) {
    localStorage.setItem('token', token)
  }
  return res
}

export function logout() {
  localStorage.removeItem('token')
  window.location.href = '/login'
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}
