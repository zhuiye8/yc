/**
 * 产业链一级/二级层级结构 + 可选性标记
 *
 * 数据来源：C:/work/yichang/yc-new/yc/产业链划分.xlsx（客户提供）
 * - enabled: true  → 正常可选
 * - enabled: false → 灰色禁用（暂无数据）
 *
 * 当前已对接的 6 条二级产业链对应 chainKey：
 *   wetchem / newenergy / pharma / yeast / ship / ai
 */

export interface SecondaryChain {
  key: string        // 对应 chainKey（industry-keywords.json 的 key），未对接用占位如 'disabled-xxx'
  label: string
  enabled: boolean
}

export interface PrimaryChain {
  key: string
  label: string
  enabled: boolean
  secondaries: SecondaryChain[]
}

export const INDUSTRY_CHAIN_TREE: PrimaryChain[] = [
  {
    key: 'green-chem',
    label: '绿色化工',
    enabled: true,
    secondaries: [
      { key: 'wetchem', label: '湿电子化学品', enabled: true },
      { key: 'disabled-phosphorus', label: '磷化工', enabled: false },
      { key: 'disabled-coal', label: '现代煤化工', enabled: false },
      { key: 'disabled-silicon', label: '硅化工', enabled: false },
      { key: 'disabled-salt', label: '盐化工', enabled: false },
      { key: 'disabled-fluorine', label: '氟化工', enabled: false },
    ],
  },
  {
    key: 'new-energy-materials',
    label: '新能源新材料',
    enabled: true,
    secondaries: [
      { key: 'newenergy', label: '新能源电池', enabled: true },
      { key: 'disabled-hpfiber', label: '高性能纤维', enabled: false },
      { key: 'disabled-phosphorus-flame', label: '磷系阻燃剂', enabled: false },
      { key: 'disabled-next-gen-battery', label: '新一代动力及储能电池', enabled: false },
      { key: 'disabled-fluorosilicon', label: '氟硅新材料', enabled: false },
      { key: 'disabled-black-phosphorus', label: '黑磷新材料及光引发剂', enabled: false },
    ],
  },
  {
    key: 'life-health',
    label: '生命健康',
    enabled: true,
    secondaries: [
      { key: 'pharma', label: '先进制剂与高端仿制药', enabled: true },
      { key: 'yeast', label: '酵母发酵与功能成分制造', enabled: true },
      { key: 'disabled-medical-device', label: '医疗器械', enabled: false },
      { key: 'disabled-tcm', label: '中药活性成分靶向纯化', enabled: false },
      { key: 'disabled-new-drug', label: '新药及原辅料研发转化', enabled: false },
      { key: 'disabled-microbe-protein', label: '微生物蛋白', enabled: false },
      { key: 'disabled-biomaterial', label: '生物制品及材料', enabled: false },
    ],
  },
  {
    key: 'auto-equipment',
    label: '汽车及装备制造',
    enabled: true,
    secondaries: [
      { key: 'ship', label: '绿色智能船舶（内河绿色智能船舶制造）', enabled: true },
      { key: 'disabled-nev', label: '新能源智能网联汽车', enabled: false },
      { key: 'disabled-space', label: '商业航天装备', enabled: false },
      { key: 'disabled-aircraft', label: '飞机维修改装', enabled: false },
      { key: 'disabled-high-equip', label: '高端专用装备', enabled: false },
      { key: 'disabled-marine-unmanned', label: '海洋无人装备', enabled: false },
      { key: 'disabled-low-altitude', label: '低空装备', enabled: false },
      { key: 'disabled-embodied-ai', label: '具身智能', enabled: false },
    ],
  },
  {
    key: 'computing-bigdata',
    label: '大数据和人工智能',
    enabled: true,
    secondaries: [
      { key: 'ai', label: '人工智能', enabled: true },
      { key: 'disabled-computing-infra', label: '算力基础设施', enabled: false },
      { key: 'disabled-data-element', label: '数据要素', enabled: false },
      { key: 'disabled-iot', label: '物联网', enabled: false },
      { key: 'disabled-software-service', label: '软件和信息服务业', enabled: false },
      { key: 'disabled-electronic-mfg', label: '电子信息制造业', enabled: false },
      { key: 'disabled-ecommerce-logistics', label: '电商物流', enabled: false },
      { key: 'disabled-egaming-anime', label: '电竞游戏动漫', enabled: false },
    ],
  },
  {
    key: 'culture-tourism',
    label: '文化旅游',
    enabled: false,   // 整个一级禁用
    secondaries: [
      { key: 'disabled-leisure', label: '休闲度假', enabled: false },
      { key: 'disabled-creative', label: '文化创意', enabled: false },
      { key: 'disabled-digital-tourism', label: '数字文旅', enabled: false },
      { key: 'disabled-smart-agri', label: '智慧农业', enabled: false },
    ],
  },
]

/** 默认选中：一级 "大数据和人工智能" / 二级 "人工智能" */
export const DEFAULT_PRIMARY_KEY = 'computing-bigdata'
export const DEFAULT_SECONDARY_KEY = 'ai'

/** 根据 chainKey 找对应的一级 key（用于选择器回填） */
export function findPrimaryKeyByChainKey(chainKey: string): string | null {
  for (const primary of INDUSTRY_CHAIN_TREE) {
    if (primary.secondaries.some((s) => s.key === chainKey)) {
      return primary.key
    }
  }
  return null
}

/** 给一级 key，返回该一级下第一个 enabled 的二级 chainKey */
export function getFirstEnabledSecondary(primaryKey: string): string | null {
  const primary = INDUSTRY_CHAIN_TREE.find((p) => p.key === primaryKey)
  if (!primary) return null
  const first = primary.secondaries.find((s) => s.enabled)
  return first?.key ?? null
}
