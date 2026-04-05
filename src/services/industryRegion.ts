import { regionOptions } from '@/mock/regions'

export interface IndustryRegionFilter {
  province?: string
  city?: string
}

const provinceSuffixes = ['维吾尔自治区', '壮族自治区', '回族自治区', '特别行政区', '自治区', '省', '市']
const citySuffixes = ['自治州', '地区', '盟', '市']

function stripSuffix(value: string | undefined, suffixes: string[]) {
  let text = String(value ?? '').trim()

  for (const suffix of suffixes) {
    if (text.endsWith(suffix)) {
      text = text.slice(0, -suffix.length)
      break
    }
  }

  return text.trim()
}

export function normalizeProvinceName(value: string | undefined) {
  return stripSuffix(value, provinceSuffixes)
}

export function normalizeCityName(value: string | undefined) {
  return stripSuffix(value, citySuffixes)
}

const regionLabelMap: Record<string, string> = {}
const cityToProvinceMap = new Map<string, string>()

regionOptions.forEach((province) => {
  const provinceLabel = String(province.label ?? '')
  regionLabelMap[String(province.value ?? '')] = provinceLabel

  province.children?.forEach((city) => {
    const cityLabel = String(city.label ?? '')
    regionLabelMap[String(city.value ?? '')] = cityLabel
    cityToProvinceMap.set(normalizeCityName(cityLabel), normalizeProvinceName(provinceLabel))
  })
})

export function resolveIndustryRegionFromCascader(value?: string[]): IndustryRegionFilter {
  if (!value || value.length === 0 || value[0] === '__all__') {
    return {}
  }

  const province = normalizeProvinceName(regionLabelMap[String(value[0])] || '')
  const city = value.length >= 2 ? normalizeCityName(regionLabelMap[String(value[1])] || '') : ''

  return {
    province: province || undefined,
    city: city || undefined,
  }
}

export function resolveIndustryRegionFromCity(city?: string): IndustryRegionFilter {
  const normalizedCity = normalizeCityName(city)
  if (!normalizedCity) {
    return {}
  }

  const province = cityToProvinceMap.get(normalizedCity)
  return {
    province,
    city: normalizedCity,
  }
}
