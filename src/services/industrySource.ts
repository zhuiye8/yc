import {
  getCachedChainAggregate,
  getCachedChainCoverage,
  getCachedNodePage,
  getCachedNodeStats,
  searchIndustryFromCache,
} from './industryCache'
import {
  getDemoChainAggregate,
  getDemoChainCityDistribution,
  getDemoChainCoverage,
  getDemoNodePage,
  getDemoNodeStats,
  getDemoChainProvinceDistribution,
  isIndustryDemoApiEnabled,
  searchIndustryInDemoApi,
} from './industryDemoApi'
import type { IndustryRegionFilter } from './industryRegion'

type EntityType = 'orgs' | 'experts'

function canUseStaticCache(region?: IndustryRegionFilter) {
  return !region?.province || region.city === '宜昌'
}

export async function searchIndustryFromSource(keyword: string, region?: IndustryRegionFilter) {
  if (isIndustryDemoApiEnabled()) {
    return searchIndustryInDemoApi(keyword, region)
  }

  if (canUseStaticCache(region)) {
    return searchIndustryFromCache(keyword)
  }

  return null
}

export async function getIndustryChainCoverageFromSource(chainKey: string, region?: IndustryRegionFilter) {
  if (isIndustryDemoApiEnabled()) {
    return getDemoChainCoverage(chainKey, region)
  }

  if (canUseStaticCache(region)) {
    return getCachedChainCoverage(chainKey, region?.city)
  }

  return null
}

export async function getIndustryChainAggregateFromSource(
  chainKey: string,
  type: EntityType,
  region?: IndustryRegionFilter,
  page = 1,
  pageSize = 10,
) {
  if (isIndustryDemoApiEnabled()) {
    return getDemoChainAggregate(chainKey, type, region, page, pageSize)
  }

  if (page === 1 && pageSize >= 10 && canUseStaticCache(region)) {
    const cached = await getCachedChainAggregate(chainKey, type, region?.city)
    if (!cached) {
      return null
    }

    const from = (page - 1) * pageSize
    return {
      total: cached.total,
      items: cached.items.slice(from, from + pageSize),
    }
  }

  return null
}

/**
 * 获取产业链省内各城市机构分布
 * - Demo-API 模式：直接调 city-distribution 接口
 * - 非 demo 模式：返回 null（上层 fallback 到硬编码比例）
 */
export async function getIndustryChainCityDistributionFromSource(
  chainKey: string,
  province: string,
) {
  if (isIndustryDemoApiEnabled()) {
    return getDemoChainCityDistribution(chainKey, province)
  }

  return null
}

export async function getIndustryChainProvinceDistributionFromSource(chainKey: string) {
  if (isIndustryDemoApiEnabled()) {
    return getDemoChainProvinceDistribution(chainKey)
  }

  return null
}

export async function getIndustryNodeStatsFromSource(
  chainKey: string,
  nodeName: string,
  region?: IndustryRegionFilter,
) {
  if (isIndustryDemoApiEnabled()) {
    return getDemoNodeStats(chainKey, nodeName, region)
  }

  if (canUseStaticCache(region)) {
    return getCachedNodeStats(chainKey, nodeName, region?.city)
  }

  return null
}

export async function getIndustryNodePageFromSource(
  chainKey: string,
  nodeName: string,
  type: EntityType,
  region?: IndustryRegionFilter,
  page = 1,
  pageSize = 10,
) {
  if (isIndustryDemoApiEnabled()) {
    return getDemoNodePage(chainKey, nodeName, type, region, page, pageSize)
  }

  if (canUseStaticCache(region)) {
    return getCachedNodePage(chainKey, nodeName, type, region?.city, page, pageSize)
  }

  return null
}
