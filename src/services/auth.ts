import { api } from './api'

interface LoginRequest {
  username: string
  secret: string
}

interface LoginResponse {
  accessToken?: string
  token?: string
  tokenType?: string
  expiresIn?: number
  [key: string]: unknown
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/token', data)
  // 服务端返回 accessToken 字段
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
