import { industryChainGraphData } from '@/mock/industryChainGraphData'
import type { IndustryGraphNode } from '@/mock/data'
import industryKeywords from '@/data/industry-keywords.json'

type EntityType = 'orgs' | 'experts'
type CacheScope = 'national' | 'yichang'
type CacheEntity = Record<string, unknown>

interface CachedCollection<T extends CacheEntity = CacheEntity> {
  total: number
  items: T[]
}

interface CachedNodeFile {
  version: string
  builtAt: string
  chainKey: string
  chainLabel: string
  nodeId: string
  nodeName: string
  keywords: string[]
  queryString: string
  scopes: Record<CacheScope, Record<EntityType, CachedCollection>>
}

interface CachedChainSummary {
  version: string
  builtAt: string
  chainKey: string
  chainLabel: string
  chainSearchKey: string
  nodeCount: number
  coverage: {
    covered: number
    total: number
    rate: number
    chainStatus: 'strong' | 'weak' | 'missing'
    chainOrgTotal: number
    nodeOrgCounts: Record<string, number>
  }
  totals: Record<CacheScope, Record<EntityType, number>>
  previews: Record<CacheScope, Record<EntityType, CacheEntity[]>>
}

interface CachedChainAggregate {
  version: string
  builtAt: string
  chainKey: string
  chainLabel: string
  chainSearchKey: string
  scopes: Record<CacheScope, Record<EntityType, CachedCollection>>
}

interface CachedManifestNode {
  nodeId: string
  nodeName: string
  keywords: string[]
  queryString: string
  file: string
}

interface CachedManifestChain {
  chainKey: string
  chainLabel: string
  nodeCount: number
  summaryPath: string
  aggregatePath: string
  nodes: CachedManifestNode[]
}

interface CachedManifest {
  version: string
  builtAt: string
  status?: 'partial' | 'ready'
  scope: CacheScope[]
  localCity: string
  chains: CachedManifestChain[]
}

interface CachedSearchNode {
  chainKey: string
  chainLabel: string
  nodeId: string
  nodeName: string
  keywords: string[]
  queryString: string
  queryTerms: string[]
  file: string
}

interface CachedSearchIndex {
  version: string
  builtAt: string
  status?: 'partial' | 'ready'
  nodes: CachedSearchNode[]
}

interface SearchCandidate {
  chainKey: string
  label: string
  terms: string[]
  leafKeys: string[]
}

interface SearchCandidateContext {
  candidates: SearchCandidate[]
  leafFileMap: Map<string, string>
}

interface SearchIndustryCacheResult {
  orgs: CacheEntity[]
  orgTotal: number
  experts: CacheEntity[]
  expertTotal: number
  matchedLabels: string[]
}

const cacheRoot = '/cache/industry'
const jsonMemo = new Map<string, Promise<unknown>>()
const demoDelayMemo = new Set<string>()
const supportedLocalCity = '宜昌'

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function withDemoDelay<T>(key: string, promise: Promise<T>, minDelayMs: number) {
  if (demoDelayMemo.has(key)) {
    return promise
  }

  demoDelayMemo.add(key)
  const [result] = await Promise.all([promise, delay(minDelayMs)])
  return result
}

async function loadJson<T>(relativePath: string): Promise<T> {
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `${cacheRoot}/${relativePath}`

  if (!jsonMemo.has(normalizedPath)) {
    jsonMemo.set(
      normalizedPath,
      fetch(normalizedPath).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load cache file: ${normalizedPath}`)
        }
        return response.json()
      }),
    )
  }

  return jsonMemo.get(normalizedPath)! as Promise<T>
}

let manifestPromise: Promise<CachedManifest | null> | null = null
let searchContextPromise: Promise<SearchCandidateContext | null> | null = null

function stripStreamPrefix(name: string) {
  return name.replace(/^(上游|中游|下游)[：:]/, '').trim()
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[()（）[\]【】\s、，,。；;:：\-_/\\·.]/g, '')
    .trim()
}

function buildLeafKey(chainKey: string, nodeName: string) {
  return `${chainKey}:${nodeName}`
}

function getCollectionScope(city?: string): CacheScope | null {
  if (!city) return 'national'
  if (city === supportedLocalCity) return 'yichang'
  return null
}

function getOrgUniqueKey(item: CacheEntity) {
  const id = String(item.ID ?? item.ORGID ?? item.UID ?? '').trim()
  if (id) return `id:${id}`

  const name = String(item.NAME ?? '').trim()
  const prov = String(item.PROV ?? '').trim()
  const city = String(item.CITY ?? '').trim()
  return `name:${name}|${prov}|${city}`
}

function getExpertUniqueKey(item: CacheEntity) {
  const id = String(item.AUID ?? item.ID ?? item.UID ?? '').trim()
  if (id) return `id:${id}`

  const name = String(item.CNAME ?? '').trim()
  const org = String(item.AORG ?? '').trim()
  return `name:${name}|${org}`
}

function dedupeItems(items: CacheEntity[], type: EntityType) {
  const getKey = type === 'orgs' ? getOrgUniqueKey : getExpertUniqueKey
  const uniqueItems = new Map<string, CacheEntity>()

  for (const item of items) {
    const key = getKey(item)
    if (!key || uniqueItems.has(key)) continue
    uniqueItems.set(key, item)
  }

  return Array.from(uniqueItems.values())
}

function scoreCandidate(input: string, terms: string[]) {
  let bestScore = 0

  for (const term of terms) {
    const normalizedTerm = normalizeText(term)
    if (!normalizedTerm) continue

    if (normalizedTerm === input) {
      bestScore = Math.max(bestScore, 100)
      continue
    }

    if (normalizedTerm.includes(input)) {
      bestScore = Math.max(bestScore, 84)
      continue
    }

    if (input.includes(normalizedTerm) && normalizedTerm.length >= 2) {
      bestScore = Math.max(bestScore, 76)
      continue
    }
  }

  return bestScore
}

function collectLeafNames(node: IndustryGraphNode): string[] {
  if (!node.children?.length) {
    return [node.name]
  }

  return node.children.flatMap((child) => collectLeafNames(child))
}

function collectSearchCandidates(
  chainKey: string,
  node: IndustryGraphNode,
  nodeMappings: Record<string, { keywords: string[]; queryString: string }> | undefined,
  leafFileMap: Map<string, string>,
  acc: SearchCandidate[],
) {
  const leafNames = collectLeafNames(node)
  const leafKeys = leafNames
    .map((leafName) => buildLeafKey(chainKey, leafName))
    .filter((leafKey) => leafFileMap.has(leafKey))

  if (leafKeys.length === 0) {
    return
  }

  const terms = [node.name, stripStreamPrefix(node.name)]

  if (!node.children?.length) {
    const mapping = nodeMappings?.[node.name]
    if (mapping) {
      terms.push(...mapping.keywords)
      terms.push(...mapping.queryString.split(/\s+OR\s+/))
    }
  }

  acc.push({
    chainKey,
    label: stripStreamPrefix(node.name),
    terms: Array.from(new Set(terms.filter(Boolean))),
    leafKeys,
  })

  node.children?.forEach((child) => collectSearchCandidates(chainKey, child, nodeMappings, leafFileMap, acc))
}

async function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = loadJson<CachedManifest>('manifest.json').catch(() => null)
  }

  return manifestPromise
}

async function getChainManifest(chainKey: string) {
  const manifest = await loadManifest()
  if (!manifest || manifest.status === 'partial') {
    return null
  }
  return manifest?.chains.find((chain) => chain.chainKey === chainKey) ?? null
}

async function loadChainSummary(chainKey: string) {
  const manifestChain = await getChainManifest(chainKey)
  if (!manifestChain) return null
  return withDemoDelay(
    `summary:${chainKey}`,
    loadJson<CachedChainSummary>(manifestChain.summaryPath),
    1800,
  )
}

async function loadChainAggregate(chainKey: string) {
  const manifestChain = await getChainManifest(chainKey)
  if (!manifestChain) return null
  return withDemoDelay(
    `aggregate:${chainKey}`,
    loadJson<CachedChainAggregate>(manifestChain.aggregatePath),
    1800,
  )
}

async function loadSearchContext() {
  if (!searchContextPromise) {
    searchContextPromise = (async () => {
      const [manifest, searchIndex] = await Promise.all([
        loadManifest(),
        loadJson<CachedSearchIndex>('search-index.json').catch(() => null),
      ])

      if (!manifest || manifest.status === 'partial' || !searchIndex || searchIndex.status === 'partial') {
        return null
      }

      const leafFileMap = new Map<string, string>()
      for (const node of searchIndex.nodes) {
        leafFileMap.set(buildLeafKey(node.chainKey, node.nodeName), node.file)
      }

      const candidates: SearchCandidate[] = []
      for (const manifestChain of manifest.chains) {
        const nodeMappings = (industryKeywords as Record<string, Record<string, { keywords: string[]; queryString: string }>>)[manifestChain.chainLabel]
        const chainGraph = industryChainGraphData[manifestChain.chainKey]
        if (!chainGraph) continue

        const chainLeafKeys = manifestChain.nodes
          .map((node) => buildLeafKey(manifestChain.chainKey, node.nodeName))
          .filter((leafKey) => leafFileMap.has(leafKey))

        if (chainLeafKeys.length > 0) {
          candidates.push({
            chainKey: manifestChain.chainKey,
            label: manifestChain.chainLabel,
            terms: [manifestChain.chainLabel],
            leafKeys: chainLeafKeys,
          })
        }

        ;(['upstream', 'midstream', 'downstream'] as const).forEach((streamKey) => {
          collectSearchCandidates(
            manifestChain.chainKey,
            chainGraph[streamKey].root,
            nodeMappings,
            leafFileMap,
            candidates,
          )
        })
      }

      return {
        candidates,
        leafFileMap,
      }
    })()
  }

  return searchContextPromise
}

async function loadNodeCache(chainKey: string, nodeName: string) {
  const manifestChain = await getChainManifest(chainKey)
  if (!manifestChain) return null

  const targetNode = manifestChain.nodes.find((node) => node.nodeName === nodeName)
  if (!targetNode) return null

  return loadJson<CachedNodeFile>(targetNode.file)
}

async function loadNodeCacheByFile(relativeFile: string) {
  return loadJson<CachedNodeFile>(relativeFile)
}

export async function hasIndustryCache() {
  const manifest = await loadManifest()
  return Boolean(manifest && manifest.status !== 'partial')
}

export async function getCachedChainCoverage(chainKey: string, city?: string) {
  if (city && city !== supportedLocalCity) {
    return null
  }

  const summary = await loadChainSummary(chainKey)
  return summary?.coverage ?? null
}

export async function getCachedChainAggregate(
  chainKey: string,
  type: EntityType,
  city?: string,
) {
  const scope = getCollectionScope(city)
  if (!scope) {
    return null
  }

  const aggregate = await loadChainAggregate(chainKey)
  if (!aggregate) {
    return null
  }

  const collection = aggregate.scopes[scope][type]
  return {
    items: collection.items,
    total: collection.total,
  }
}

export async function getCachedNodeStats(
  chainKey: string,
  nodeName: string,
  city?: string,
) {
  if (city && city !== supportedLocalCity) {
    return null
  }

  const nodeCache = await withDemoDelay(
    `node-stats:${chainKey}:${nodeName}`,
    loadNodeCache(chainKey, nodeName),
    400,
  )

  if (!nodeCache) {
    return null
  }

  return {
    queryString: nodeCache.queryString,
    orgTotal: nodeCache.scopes.national.orgs.total,
    localOrgTotal: nodeCache.scopes.yichang.orgs.total,
    expertTotal: nodeCache.scopes.national.experts.total,
    localExpertTotal: nodeCache.scopes.yichang.experts.total,
  }
}

export async function getCachedNodePage(
  chainKey: string,
  nodeName: string,
  type: EntityType,
  city: string | undefined,
  page: number,
  pageSize: number,
) {
  const scope = getCollectionScope(city)
  if (!scope) {
    return null
  }

  const nodeCache = await withDemoDelay(
    `node-page:${chainKey}:${nodeName}:${type}:${scope}`,
    loadNodeCache(chainKey, nodeName),
    300,
  )

  if (!nodeCache) {
    return null
  }

  const collection = nodeCache.scopes[scope][type]
  const from = (page - 1) * pageSize
  return {
    items: collection.items.slice(from, from + pageSize),
    total: collection.total,
  }
}

export async function searchIndustryFromCache(keyword: string): Promise<SearchIndustryCacheResult | null> {
  const normalizedInput = normalizeText(keyword)
  if (!normalizedInput) {
    return null
  }

  const context = await loadSearchContext()
  if (!context) {
    return null
  }

  const scoredCandidates = context.candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(normalizedInput, candidate.terms),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)

  if (scoredCandidates.length === 0) {
    return null
  }

  const maxScore = scoredCandidates[0].score
  const selectedCandidates = scoredCandidates
    .filter((item) => item.score >= Math.max(maxScore - 10, 76))
    .slice(0, 12)

  const selectedFiles = Array.from(
    new Set(
      selectedCandidates.flatMap((item) =>
        item.candidate.leafKeys
          .map((leafKey) => context.leafFileMap.get(leafKey))
          .filter((file): file is string => Boolean(file)),
      ),
    ),
  )

  if (selectedFiles.length === 0) {
    return null
  }

  const nodeCaches = await withDemoDelay(
    `search:${normalizedInput}`,
    Promise.all(selectedFiles.map((file) => loadNodeCacheByFile(file))),
    1000,
  )

  const orgs = dedupeItems(
    nodeCaches.flatMap((nodeCache) => nodeCache.scopes.national.orgs.items),
    'orgs',
  )
  const experts = dedupeItems(
    nodeCaches.flatMap((nodeCache) => nodeCache.scopes.national.experts.items),
    'experts',
  )

  return {
    orgs,
    orgTotal: orgs.length,
    experts,
    expertTotal: experts.length,
    matchedLabels: selectedCandidates.map((item) => item.candidate.label),
  }
}
