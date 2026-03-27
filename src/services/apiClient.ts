/**
 * 万方数据接口客户端
 * - Token 自动刷新（有效期 2 小时，提前 2 分钟刷新）
 * - 通过 Vite 代理路由 /wf-api → http://119.36.242.222:8902 以规避 CORS
 */
const BASE = '/wf-api';

interface TokenCache {
  value: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
let tokenPromise: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  const res = await fetch(`${BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'i3dev', secret: 'woeuty#WHU!027' }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  tokenCache = {
    value: data.accessToken,
    expiresAt: Date.now() + (data.expiresIn - 120) * 1000,
  };
  return tokenCache.value;
}

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value;
  }
  // Deduplicate concurrent token requests
  if (!tokenPromise) {
    tokenPromise = fetchToken().finally(() => { tokenPromise = null; });
  }
  return tokenPromise;
}

export async function wfGet<T = unknown>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const token = await getToken();
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = `${BASE}/api/wf/${endpoint}${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${endpoint} error: ${res.status}`);
  return res.json();
}
