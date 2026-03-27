import { api } from './api'

interface LoginRequest {
  username: string
  secret: string
}

interface LoginResponse {
  token: string
  [key: string]: unknown
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/token', data)
  if (res.token) {
    localStorage.setItem('token', res.token)
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
