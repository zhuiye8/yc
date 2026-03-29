/**
 * 自定义地区选择器 — 多列展开 + Radio 选中
 * 数据来源：阿里云 DataV GeoAtlas API
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Spin } from 'antd'
import { LoadingOutlined, DownOutlined } from '@ant-design/icons'

// 优先本地文件，fallback 到 DataV CDN
const GEO_LOCAL = '/geo'
const GEO_CDN = 'https://geo.datav.aliyun.com/areas_v3/bound'

interface AreaItem {
  name: string
  adcode: string
  hasChildren: boolean
}

interface Props {
  value: { adcode: string; name: string }
  onChange: (adcode: string, name: string, path: { adcode: string; name: string }[]) => void
}

// 缓存已加载的子区域
const childrenCache = new Map<string, AreaItem[]>()

async function loadChildren(adcode: string): Promise<AreaItem[]> {
  if (childrenCache.has(adcode)) return childrenCache.get(adcode)!
  // 尝试本地文件，失败则用CDN
  for (const base of [GEO_LOCAL, GEO_CDN]) {
    try {
      const resp = await fetch(`${base}/${adcode}_full.json`)
      if (!resp.ok) continue
      const json = await resp.json()
      const items: AreaItem[] = (json.features || []).map((f: { properties: { name: string; adcode: number } }) => ({
        name: f.properties.name,
        adcode: String(f.properties.adcode),
        hasChildren: !String(f.properties.adcode).endsWith('00') ? false : true,
      }))
      childrenCache.set(adcode, items)
      return items
    } catch (_e) {
      continue
    }
  }
  return []
}

// 预设省份列表（避免加载全国 GeoJSON 568KB）
const defaultProvinces: AreaItem[] = [
  { name: '北京市', adcode: '110000', hasChildren: true },
  { name: '天津市', adcode: '120000', hasChildren: true },
  { name: '河北省', adcode: '130000', hasChildren: true },
  { name: '山西省', adcode: '140000', hasChildren: true },
  { name: '内蒙古自治区', adcode: '150000', hasChildren: true },
  { name: '辽宁省', adcode: '210000', hasChildren: true },
  { name: '吉林省', adcode: '220000', hasChildren: true },
  { name: '黑龙江省', adcode: '230000', hasChildren: true },
  { name: '上海市', adcode: '310000', hasChildren: true },
  { name: '江苏省', adcode: '320000', hasChildren: true },
  { name: '浙江省', adcode: '330000', hasChildren: true },
  { name: '安徽省', adcode: '340000', hasChildren: true },
  { name: '福建省', adcode: '350000', hasChildren: true },
  { name: '江西省', adcode: '360000', hasChildren: true },
  { name: '山东省', adcode: '370000', hasChildren: true },
  { name: '河南省', adcode: '410000', hasChildren: true },
  { name: '湖北省', adcode: '420000', hasChildren: true },
  { name: '湖南省', adcode: '430000', hasChildren: true },
  { name: '广东省', adcode: '440000', hasChildren: true },
  { name: '广西壮族自治区', adcode: '450000', hasChildren: true },
  { name: '海南省', adcode: '460000', hasChildren: true },
  { name: '重庆市', adcode: '500000', hasChildren: true },
  { name: '四川省', adcode: '510000', hasChildren: true },
  { name: '贵州省', adcode: '520000', hasChildren: true },
  { name: '云南省', adcode: '530000', hasChildren: true },
  { name: '西藏自治区', adcode: '540000', hasChildren: true },
  { name: '陕西省', adcode: '610000', hasChildren: true },
  { name: '甘肃省', adcode: '620000', hasChildren: true },
  { name: '青海省', adcode: '630000', hasChildren: true },
  { name: '宁夏回族自治区', adcode: '640000', hasChildren: true },
  { name: '新疆维吾尔自治区', adcode: '650000', hasChildren: true },
]

const colStyle: React.CSSProperties = {
  width: 160,
  maxHeight: 400,
  overflowY: 'auto',
  borderRight: '1px solid #f0f0f0',
  padding: '4px 0',
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: 13,
  gap: 6,
  transition: 'background 0.15s',
}

export default function RegionPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedProv, setSelectedProv] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [cities, setCities] = useState<AreaItem[]>([])
  const [districts, setDistricts] = useState<AreaItem[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // 默认展开湖北省→宜昌市
  useEffect(() => {
    if (value.adcode.startsWith('4205')) {
      expandProvince('420000')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expandProvince = useCallback(async (adcode: string) => {
    setSelectedProv(adcode)
    setSelectedCity(null)
    setDistricts([])
    setLoadingCities(true)
    const items = await loadChildren(adcode)
    setCities(items)
    setLoadingCities(false)
  }, [])

  const expandCity = useCallback(async (adcode: string) => {
    setSelectedCity(adcode)
    setLoadingDistricts(true)
    const items = await loadChildren(adcode)
    setDistricts(items)
    setLoadingDistricts(false)
  }, [])

  const handleSelect = useCallback((item: AreaItem, level: 'province' | 'city' | 'district') => {
    const pathArr: { adcode: string; name: string }[] = [{ adcode: '100000', name: '全国' }]
    if (level === 'province') {
      pathArr.push({ adcode: item.adcode, name: item.name })
    } else if (level === 'city') {
      const prov = defaultProvinces.find(p => p.adcode === selectedProv)
      if (prov) pathArr.push({ adcode: prov.adcode, name: prov.name })
      pathArr.push({ adcode: item.adcode, name: item.name })
    } else {
      const prov = defaultProvinces.find(p => p.adcode === selectedProv)
      if (prov) pathArr.push({ adcode: prov.adcode, name: prov.name })
      const city = cities.find(c => c.adcode === selectedCity)
      if (city) pathArr.push({ adcode: city.adcode, name: city.name })
      pathArr.push({ adcode: item.adcode, name: item.name })
    }
    onChange(item.adcode, item.name, pathArr)
    setOpen(false)
  }, [selectedProv, selectedCity, cities, onChange])

  const isSelected = (adcode: string) => value.adcode === adcode

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={panelRef}>
      {/* 触发按钮 */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', border: '1px solid #d9d9d9', borderRadius: 6,
          cursor: 'pointer', fontSize: 13, background: '#fff',
          color: '#1D2129', minWidth: 120,
        }}
      >
        {value.name}
        <DownOutlined style={{ fontSize: 10, color: '#999' }} />
      </div>

      {/* 下拉面板 */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: '#fff', borderRadius: 8,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          zIndex: 1000, display: 'flex',
          border: '1px solid #e8e8e8',
        }}>
          {/* 省份列 */}
          <div style={colStyle}>
            {/* 全国选项 */}
            <div
              style={{ ...itemStyle, background: value.adcode === '100000' ? '#e6f4ff' : undefined }}
              onMouseEnter={(e) => { if (value.adcode !== '100000') (e.target as HTMLElement).style.background = '#f5f5f5' }}
              onMouseLeave={(e) => { if (value.adcode !== '100000') (e.target as HTMLElement).style.background = '' }}
            >
              <span
                onClick={() => handleSelect({ name: '全国', adcode: '100000', hasChildren: false }, 'province')}
                style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isSelected('100000') ? '#2468F2' : '#d9d9d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                {isSelected('100000') && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2468F2' }} />}
              </span>
              <span style={{ flex: 1, fontWeight: isSelected('100000') ? 600 : 400 }}>全国</span>
            </div>
            {defaultProvinces.map(prov => (
              <div
                key={prov.adcode}
                style={{ ...itemStyle, background: selectedProv === prov.adcode ? '#f0f7ff' : isSelected(prov.adcode) ? '#e6f4ff' : undefined }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = selectedProv === prov.adcode ? '#f0f7ff' : '#f5f5f5' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedProv === prov.adcode ? '#f0f7ff' : isSelected(prov.adcode) ? '#e6f4ff' : '' }}
              >
                <span
                  onClick={(e) => { e.stopPropagation(); handleSelect(prov, 'province') }}
                  style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isSelected(prov.adcode) ? '#2468F2' : '#d9d9d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                >
                  {isSelected(prov.adcode) && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2468F2' }} />}
                </span>
                <span
                  onClick={() => expandProvince(prov.adcode)}
                  style={{ flex: 1, color: selectedProv === prov.adcode ? '#2468F2' : undefined, fontWeight: selectedProv === prov.adcode ? 600 : 400 }}
                >
                  {prov.name.replace(/省$|自治区$|壮族|回族|维吾尔|特别行政区$/g, '')}
                </span>
                <span onClick={() => expandProvince(prov.adcode)} style={{ color: '#ccc', fontSize: 12 }}>›</span>
              </div>
            ))}
          </div>

          {/* 市列 */}
          {selectedProv && (
            <div style={colStyle}>
              {loadingCities ? (
                <div style={{ padding: 20, textAlign: 'center' }}><Spin indicator={<LoadingOutlined spin />} size="small" /></div>
              ) : cities.map(city => (
                <div
                  key={city.adcode}
                  style={{ ...itemStyle, background: selectedCity === city.adcode ? '#f0f7ff' : isSelected(city.adcode) ? '#e6f4ff' : undefined }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = selectedCity === city.adcode ? '#f0f7ff' : '#f5f5f5' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedCity === city.adcode ? '#f0f7ff' : isSelected(city.adcode) ? '#e6f4ff' : '' }}
                >
                  <span
                    onClick={(e) => { e.stopPropagation(); handleSelect(city, 'city') }}
                    style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isSelected(city.adcode) ? '#2468F2' : '#d9d9d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                  >
                    {isSelected(city.adcode) && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2468F2' }} />}
                  </span>
                  <span
                    onClick={() => city.hasChildren ? expandCity(city.adcode) : handleSelect(city, 'city')}
                    style={{ flex: 1, color: selectedCity === city.adcode ? '#2468F2' : undefined, fontWeight: selectedCity === city.adcode ? 600 : 400 }}
                  >
                    {city.name}
                  </span>
                  {city.hasChildren && (
                    <span onClick={() => expandCity(city.adcode)} style={{ color: '#ccc', fontSize: 12 }}>›</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 区列 */}
          {selectedCity && districts.length > 0 && (
            <div style={{ ...colStyle, borderRight: 'none' }}>
              {loadingDistricts ? (
                <div style={{ padding: 20, textAlign: 'center' }}><Spin indicator={<LoadingOutlined spin />} size="small" /></div>
              ) : districts.map(dist => (
                <div
                  key={dist.adcode}
                  style={{ ...itemStyle, background: isSelected(dist.adcode) ? '#e6f4ff' : undefined }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isSelected(dist.adcode) ? '#e6f4ff' : '' }}
                  onClick={() => handleSelect(dist, 'district')}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isSelected(dist.adcode) ? '#2468F2' : '#d9d9d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSelected(dist.adcode) && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2468F2' }} />}
                  </span>
                  <span style={{ flex: 1, fontWeight: isSelected(dist.adcode) ? 600 : 400 }}>{dist.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
