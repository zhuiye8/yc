import { tgFetchWithAuth } from './tgAuth'

export interface IndustryChainTotalStats {
  enterpriseTotal: number
  talentTotal: number
  standardTotal: number
}

export async function getIndustryChainTotalStats(): Promise<IndustryChainTotalStats> {
  const resp = await tgFetchWithAuth('/tg-api/api/stats/industry-chain-total')
  if (!resp.ok) {
    throw new Error(`Industry chain total failed: HTTP ${resp.status}`)
  }

  const json = await resp.json() as {
    code?: string
    message?: string
    data?: Partial<IndustryChainTotalStats>
  }

  if (json.code && json.code !== '0') {
    throw new Error(json.message || 'Industry chain total failed')
  }

  return {
    enterpriseTotal: Number(json.data?.enterpriseTotal ?? 0),
    talentTotal: Number(json.data?.talentTotal ?? 0),
    standardTotal: Number(json.data?.standardTotal ?? 0),
  }
}
