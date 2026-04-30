import industryKeywords from '@/data/industry-keywords.json'
import industryNodeProfiles from '@/data/industry-node-profiles.json'

interface NodeKeywordEntry {
  keywords?: string[]
  queryString?: string
}

interface NodeProfileOptions {
  searchKeyword?: string
  queryString?: string
}

const keywordMap = industryKeywords as Record<string, Record<string, NodeKeywordEntry>>
const profileMap = industryNodeProfiles as Record<string, Record<string, string>>

function stripStagePrefix(value: string) {
  return value.replace(/^(?:上游|中游|下游)[：:]\s*/, '').trim()
}

function normalizeText(value: string) {
  return stripStagePrefix(value).replace(/\s+/g, '').trim()
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)))
}

function findNodeEntry(nodeName: string) {
  const normalizedNodeName = normalizeText(nodeName)

  for (const [chainName, nodes] of Object.entries(keywordMap)) {
    if (normalizeText(chainName) === normalizedNodeName) {
      return {
        chainName,
        nodeName: chainName,
        entry: undefined,
        nodeCount: Object.keys(nodes).length,
        isChainRoot: true,
      }
    }

    for (const [candidateName, entry] of Object.entries(nodes)) {
      if (normalizeText(candidateName) === normalizedNodeName) {
        return {
          chainName,
          nodeName: candidateName,
          entry,
          nodeCount: Object.keys(nodes).length,
          isChainRoot: false,
        }
      }
    }
  }

  return null
}

function findCachedProfile(nodeName: string) {
  const normalizedNodeName = normalizeText(nodeName)

  for (const [chainName, profiles] of Object.entries(profileMap)) {
    if (normalizeText(chainName) === normalizedNodeName) return null

    for (const [candidateName, profile] of Object.entries(profiles)) {
      if (normalizeText(candidateName) === normalizedNodeName) return profile
    }
  }

  return null
}

function formatKeywords(entry?: NodeKeywordEntry, fallbackQuery?: string) {
  const queryKeywords = fallbackQuery
    ? fallbackQuery.split(/\s+OR\s+/i)
    : []
  const keywords = uniqueValues([...(entry?.keywords || []), ...queryKeywords]).slice(0, 5)

  if (keywords.length === 0) return ''
  return `，覆盖“${keywords.join('、')}”等关键词`
}

export function getIndustryNodeProfileText(nodeName: string, options: NodeProfileOptions = {}) {
  const displayName = stripStagePrefix(nodeName)
  if (!displayName) return '当前节点是产业链中的基础观察单元，承接相关技术、企业和人才能力。'

  const cachedProfile = findCachedProfile(displayName)
  if (cachedProfile) {
    if (options.searchKeyword && normalizeText(options.searchKeyword) !== normalizeText(displayName)) {
      return `搜索词“${options.searchKeyword}”已匹配到“${displayName}”节点。${cachedProfile}`
    }

    return cachedProfile
  }

  const matched = findNodeEntry(displayName)

  if (matched?.isChainRoot) {
    const searchPrefix = options.searchKeyword && normalizeText(options.searchKeyword) !== normalizeText(matched.nodeName)
      ? `搜索词“${options.searchKeyword}”已匹配到“${matched.nodeName}”。`
      : ''

    return `${searchPrefix}“${matched.nodeName}”为产业链方向，包含 ${matched.nodeCount} 个可查询环节，体现该方向的企业、人才与技术能力分布。`
  }

  if (matched) {
    const keywordText = formatKeywords(matched.entry, options.queryString)
    const searchPrefix = options.searchKeyword && normalizeText(options.searchKeyword) !== normalizeText(matched.nodeName)
      ? `搜索词“${options.searchKeyword}”已匹配到“${matched.nodeName}”节点。`
      : ''

    return `${searchPrefix}“${matched.nodeName}”属于“${matched.chainName}”产业链的可查询节点${keywordText}，反映该环节的技术能力、企业基础和人才储备。`
  }

  const keywordText = options.queryString ? `，当前关联词为“${options.queryString}”` : ''
  const searchPrefix = options.searchKeyword && normalizeText(options.searchKeyword) !== normalizeText(displayName)
    ? `搜索词“${options.searchKeyword}”已匹配到“${displayName}”。`
    : ''

  return `${searchPrefix}“${displayName}”是产业链中的观察节点${keywordText}，可结合企业、人才和技术数据判断该方向的发展基础。`
}
