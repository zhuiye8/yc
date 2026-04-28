import industryKeywordsJson from '@/data/industry-keywords.json'

interface IndustryKeywordNode {
  keywords?: unknown
}

type IndustryKeywords = Record<string, Record<string, IndustryKeywordNode>>

export interface IndustryKeywordOption {
  value: string
  label: string
  chain: string
  parentChain?: string
}

const industryKeywords = industryKeywordsJson as IndustryKeywords

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function buildIndustryKeywordOptions() {
  const options: IndustryKeywordOption[] = []
  const seen = new Set<string>()

  const addOption = (label: string, chain: string, parentChain?: string) => {
    const trimmedLabel = label.trim()
    const trimmedChain = chain.trim()
    if (!trimmedLabel || !trimmedChain) return

    const key = `${trimmedLabel}\u0000${trimmedChain}`
    if (seen.has(key)) return
    seen.add(key)

    options.push({
      value: key,
      label: trimmedLabel,
      chain: trimmedChain,
      parentChain,
    })
  }

  Object.entries(industryKeywords).forEach(([parentChain, nodes]) => {
    addOption(parentChain, parentChain)

    Object.entries(nodes).forEach(([nodeName, node]) => {
      addOption(nodeName, nodeName, parentChain)

      const keywords = Array.isArray(node.keywords) ? node.keywords : []
      keywords.forEach((keyword) => {
        if (typeof keyword === 'string') {
          addOption(keyword, nodeName, parentChain)
        }
      })
    })
  })

  return options
}

export const industryKeywordOptions = buildIndustryKeywordOptions()

export function resolveIndustryKeywordOption(keyword: string) {
  const normalizedKeyword = normalizeText(keyword)
  if (!normalizedKeyword) return undefined

  return industryKeywordOptions.find((option) => normalizeText(option.label) === normalizedKeyword)
    ?? industryKeywordOptions.find((option) => normalizeText(option.label).includes(normalizedKeyword))
}
