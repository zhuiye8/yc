import { tgFetchWithAuth } from './tgAuth'

export interface IndustryChainStatItem {
  chainName: string
  enterpriseTotal: number
  talentTotal: number
  standardTotal: number
}

export interface IndustryChainTotalStats {
  enterpriseTotal: number
  talentTotal: number
  standardTotal: number
  chainList: IndustryChainStatItem[]
}

export async function getIndustryChainTotalStats(): Promise<IndustryChainTotalStats> {
  const resp = await tgFetchWithAuth('/tg-api/api/stats/industry-chain-total')
  if (!resp.ok) {
    throw new Error(`Industry chain total failed: HTTP ${resp.status}`)
  }

  const json = await resp.json() as {
    code?: string
    message?: string
    data?: {
      enterpriseTotal?: number
      talentTotal?: number
      standardTotal?: number
      chainList?: Partial<IndustryChainStatItem>[]
    }
  }

  if (json.code && json.code !== '0') {
    throw new Error(json.message || 'Industry chain total failed')
  }

  const chainList = (json.data?.chainList ?? [])
    .map((chain) => ({
      chainName: String(chain.chainName ?? ''),
      enterpriseTotal: Number(chain.enterpriseTotal ?? 0),
      talentTotal: Number(chain.talentTotal ?? 0),
      standardTotal: Number(chain.standardTotal ?? 0),
    }))
    .filter((chain) => chain.chainName)

  return {
    enterpriseTotal: Number(json.data?.enterpriseTotal ?? 0),
    talentTotal: Number(json.data?.talentTotal ?? 0),
    standardTotal: Number(json.data?.standardTotal ?? 0),
    chainList,
  }
}
