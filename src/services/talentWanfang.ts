/**
 * 人才相关 API — 万方旧接口 (port 8902)
 * 仅供产业图谱 / 大屏页面使用
 *
 * 人才引育页面请使用 talent.ts（新 TalentGraphService）
 */

import type { ExpertSearchResult, CkeyIndustryResult } from './talent'

const BASE_URL = '/wf-api'

// ========== 24h localStorage 缓存 ==========

const CACHE_PREFIX = 'wf:'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCached<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { expireAt: number; data: T }
    if (Date.now() > parsed.expireAt) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setCache(key: string, data: unknown) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      expireAt: Date.now() + CACHE_TTL_MS,
      data,
    }))
  } catch { /* ignore */ }
}

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

// ========== 人才搜索（万方） ==========

export async function searchExperts(
  key: string,
  from = 0,
  size = 10,
  city?: string,
): Promise<ExpertSearchResult> {
  const cacheKey = `search:${key}:${from}:${size}:${city ?? ''}`
  const cached = getCached<ExpertSearchResult>(cacheKey)
  if (cached) return cached

  let url =
    `${BASE_URL}/api/wf/findExpert-v2` +
    `?key=${encodeURIComponent(key)}` +
    `&from=${from}` +
    `&size=${size}`
  if (city) url += `&city=${encodeURIComponent(city)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  const result = await handleResponse<ExpertSearchResult>(resp)
  setCache(cacheKey, result)
  return result
}

// ========== 关键词趋势（万方） ==========

export async function getCkeyIndustry(ckey: string): Promise<CkeyIndustryResult> {
  const cacheKey = `trend:${ckey}`
  const cached = getCached<CkeyIndustryResult>(cacheKey)
  if (cached) return cached

  const url = `${BASE_URL}/api/wf/getCkeyIndustry?ckey=${encodeURIComponent(ckey)}`
  const resp = await fetch(url, { method: 'GET', headers: getAuthHeaders() })
  const result = await handleResponse<CkeyIndustryResult>(resp)
  setCache(cacheKey, result)
  return result
}
