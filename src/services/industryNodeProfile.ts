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

function normalizeText(value: string) {
  return value.replace(/\s+/g, '').trim()
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
  const displayName = nodeName.trim()
  if (!displayName) return '当前节点用于汇聚产业链相关企业与人才资源，辅助判断资源储备、区域分布和后续招引对接方向。'

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

    return `${searchPrefix}“${matched.nodeName}”为产业链方向，当前本地维护 ${matched.nodeCount} 个可查询环节，用于汇聚该方向下企业、人才与技术资源，支撑产业链覆盖分析、资源筛选和招引研判。`
  }

  if (matched) {
    const keywordText = formatKeywords(matched.entry, options.queryString)
    const searchPrefix = options.searchKeyword && normalizeText(options.searchKeyword) !== normalizeText(matched.nodeName)
      ? `搜索词“${options.searchKeyword}”已匹配到“${matched.nodeName}”节点。`
      : ''

    return `${searchPrefix}“${matched.nodeName}”属于“${matched.chainName}”产业链的可查询节点${keywordText}。该节点用于汇聚相关企业、人才与技术资源，辅助判断资源储备、区域分布、薄弱环节和后续招引对接目标。`
  }

  const keywordText = options.queryString ? `，按“${options.queryString}”进行资源匹配` : ''
  const searchPrefix = options.searchKeyword && normalizeText(options.searchKeyword) !== normalizeText(displayName)
    ? `搜索词“${options.searchKeyword}”已匹配到“${displayName}”。`
    : ''

  return `${searchPrefix}“${displayName}”用于检索产业链相关企业与人才资源${keywordText}，辅助判断该方向的资源储备、区域分布和后续招引对接目标。`
}
