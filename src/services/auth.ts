import { api } from './api'
import { getTgToken, clearTgToken } from './tgAuth'

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
 * 两层登录：先校验前端账号密码，通过后并行获取 WF + TG 两个 token
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  // 第一层：硬编码校验
  if (username !== DISPLAY_USERNAME || password !== DISPLAY_PASSWORD) {
    throw new Error('账号或密码错误')
  }

  // 第二层：并行获取两个 token（互不阻塞）
  const [wfResult] = await Promise.all([
    // WF token（万方）
    api.post<LoginResponse>('/auth/token', {
      username: API_USERNAME,
      secret: API_SECRET,
    }),
    // TG token（TalentGraphService）— 失败不影响 WF 登录
    getTgToken().catch(() => null),
  ])

  const token = wfResult.accessToken || wfResult.token
  if (token) {
    localStorage.setItem('token', token)
  }
  return wfResult
}

/** 清除所有我们前缀的 localStorage（token + 业务缓存） */
function clearAllLocalCaches() {
  const prefixes = [
    'token',
    'tg_token',
    'tg_token_expires',
    'tg:v2:',
    'industry:experts:v2:',
    'innovation:stats:',
    'screen:ckeymap:',
    'wf:',
  ]
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (prefixes.some((p) => key === p || key.startsWith(p))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}

export function logout() {
  clearAllLocalCaches()
  clearTgToken()
  window.location.href = '/login'
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}
