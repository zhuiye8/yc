/**
 * 自定义地区选择器 — 多列展开 + Radio 选中
 * 数据来源：阿里云 DataV GeoAtlas API
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { DownOutlined } from '@ant-design/icons'

// 省市区列表数据（精简JSON，不含地理边界）
const AREA_TREE_URL = '/geo/area-tree.json'

interface AreaItem {
  name: string
  adcode: string
  hasChildren: boolean
  children?: AreaItem[]
}

interface AreaTreeNode {
  name: string
  adcode: string
  children?: AreaTreeNode[]
}

interface Props {
  value: { adcode: string; name: string }
  onChange: (adcode: string, name: string, path: { adcode: string; name: string }[]) => void
}

// 完整省市区树（从 area-tree.json 加载）
let areaTree: AreaItem[] | null = null
let areaTreeLoading = false
const areaTreeCallbacks: (() => void)[] = []

function toAreaItems(nodes: AreaTreeNode[]): AreaItem[] {
  return nodes.map(n => ({
    name: n.name,
    adcode: n.adcode,
    hasChildren: !!(n.children && n.children.length > 0),
    children: n.children ? toAreaItems(n.children) : undefined,
  }))
}

async function ensureAreaTree(): Promise<AreaItem[]> {
  if (areaTree) return areaTree
  if (areaTreeLoading) {
    return new Promise(resolve => {
      areaTreeCallbacks.push(() => resolve(areaTree || []))
    })
  }
  areaTreeLoading = true
  try {
    const resp = await fetch(AREA_TREE_URL)
    const json: AreaTreeNode[] = await resp.json()
    areaTree = toAreaItems(json)
  } catch (_e) {
    areaTree = []
  }
  areaTreeLoading = false
  areaTreeCallbacks.forEach(cb => cb())
  areaTreeCallbacks.length = 0
  return areaTree
}

function findByAdcode(items: AreaItem[], adcode: string): AreaItem | null {
  for (const item of items) {
    if (item.adcode === adcode) return item
    if (item.children) {
      const found = findByAdcode(item.children, adcode)
      if (found) return found
    }
  }
  return null
}

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
  const [provinces, setProvinces] = useState<AreaItem[]>([])
  const [selectedProv, setSelectedProv] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 加载省市区树
  useEffect(() => {
    ensureAreaTree().then(tree => {
      setProvinces(tree)
      // 默认展开湖北
      if (value.adcode.startsWith('4205') || value.adcode.startsWith('4200')) {
        setSelectedProv('420000')
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const cities = selectedProv ? (findByAdcode(provinces, selectedProv)?.children || []) : []
  const districts = selectedCity ? (findByAdcode(provinces, selectedCity)?.children || []) : []

  const expandProvince = useCallback((adcode: string) => {
    setSelectedProv(adcode)
    setSelectedCity(null)
  }, [])

  const expandCity = useCallback((adcode: string) => {
    setSelectedCity(adcode)
  }, [])

  const handleSelect = useCallback((item: AreaItem, level: 'province' | 'city' | 'district') => {
    const pathArr: { adcode: string; name: string }[] = [{ adcode: '100000', name: '全国' }]
    if (level === 'province') {
      pathArr.push({ adcode: item.adcode, name: item.name })
    } else if (level === 'city') {
      const prov = provinces.find(p => p.adcode === selectedProv)
      if (prov) pathArr.push({ adcode: prov.adcode, name: prov.name })
      pathArr.push({ adcode: item.adcode, name: item.name })
    } else {
      const prov = provinces.find(p => p.adcode === selectedProv)
      if (prov) pathArr.push({ adcode: prov.adcode, name: prov.name })
      const city = cities.find(c => c.adcode === selectedCity)
      if (city) pathArr.push({ adcode: city.adcode, name: city.name })
      pathArr.push({ adcode: item.adcode, name: item.name })
    }
    onChange(item.adcode, item.name, pathArr)
    setOpen(false)
  }, [provinces, selectedProv, selectedCity, cities, onChange])

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
            {provinces.map(prov => (
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
          {selectedProv && cities.length > 0 && (
            <div style={colStyle}>
              {cities.map(city => (
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
              {districts.map(dist => (
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
