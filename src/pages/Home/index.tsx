import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homeBg from '@/assets/images/hero/home-bg-plain.jpg'
import searchIcon from '@/assets/images/icons/小图标_16.png'
import { getIndustryChainTotalStats } from '@/services/homeStats'
import styles from './Home.module.scss'

interface HomeStatItem {
  number: string
  unit: string
  label: string
  colorClass: string
  link: string
}

interface HomeChainStat {
  name: string
  chainKey: string
  enterprise: number
  talent: number
  colorClass: string
}

/** TG 链名 -> 产业页二级 chainKey（用于点击直达 /industry?chain=xxx） */
const CHAIN_KEY_BY_NAME: Record<string, string> = {
  '人工智能': 'ai',
  '湿电子化学品': 'wetchem',
  '新能源电池': 'newenergy',
  '先进制剂与高端仿制药': 'pharma',
  '酵母发酵与功能成分制造': 'yeast',
  '内河绿色智能船舶制造': 'ship',
}

// 接口异常时的兜底展示（与 TG 2026-06 口径一致）
const defaultChainStats: HomeChainStat[] = [
  { name: '人工智能', chainKey: 'ai', enterprise: 222606, talent: 1256049, colorClass: 'color0' },
  { name: '湿电子化学品', chainKey: 'wetchem', enterprise: 27770, talent: 73486, colorClass: 'color1' },
  { name: '新能源电池', chainKey: 'newenergy', enterprise: 115207, talent: 580181, colorClass: 'color2' },
  { name: '先进制剂与高端仿制药', chainKey: 'pharma', enterprise: 99686, talent: 510794, colorClass: 'color3' },
  { name: '酵母发酵与功能成分制造', chainKey: 'yeast', enterprise: 300055, talent: 3013497, colorClass: 'color4' },
  { name: '内河绿色智能船舶制造', chainKey: 'ship', enterprise: 35101, talent: 266073, colorClass: 'color5' },
]

const defaultSubStats: HomeStatItem[] = [
  { number: '300万', unit: '项', label: '技术标准', colorClass: 'color2', link: '/innovation' },
  { number: '257', unit: '款', label: '金融产品', colorClass: 'color3', link: '/funding' },
  { number: '41', unit: '项', label: '申报政策', colorClass: 'color4', link: '/policy' },
]

const tenThousandUnit = String.fromCharCode(0x4e07)

function formatHomeStatNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0'
  if (value >= 10000) {
    const text = (value / 10000).toFixed(value >= 10000000 ? 1 : 2)
    return `${text.replace(/\.?0+$/, '')}${tenThousandUnit}`
  }
  return value.toLocaleString()
}

const searchRoutes = [
  {
    path: '/talent',
    keywords: ['人才', '专家', '院士', '博士', '博士后', '教授', '工程师', '领军', '岗位', '招聘', '求职', '供需'],
  },
  {
    path: '/innovation',
    keywords: ['技术', '创新', '专利', '成果', '标准', '论文', '科研', '项目', '知识产权', '资源'],
  },
  {
    path: '/funding',
    keywords: ['资金', '融资', '金融', '贷款', '基金', '银行', '投资', 'vc', 'pe', '担保', '授信'],
  },
  {
    path: '/policy',
    keywords: ['政策', '申报', '补贴', '奖励', '扶持', '税', '通知', '兑现'],
  },
  {
    path: '/industry',
    keywords: ['企业', '公司', '产业', '招引', '产业链', '化工', '电池', '人工智能', '生物医药', '船舶', '新材料'],
  },
]

function resolveSearchPath(keyword: string) {
  const normalized = keyword.trim().toLowerCase()
  return searchRoutes.find((route) =>
    route.keywords.some((item) => normalized.includes(item.toLowerCase())),
  )?.path ?? '/industry'
}

export default function Home() {
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [chainStats, setChainStats] = useState<HomeChainStat[]>(defaultChainStats)
  const [subStats, setSubStats] = useState<HomeStatItem[]>(defaultSubStats)

  useEffect(() => {
    let cancelled = false

    getIndustryChainTotalStats()
      .then((data) => {
        if (cancelled) return
        if (data.chainList.length > 0) {
          setChainStats(data.chainList.map((chain, index) => ({
            name: chain.chainName,
            chainKey: CHAIN_KEY_BY_NAME[chain.chainName] ?? '',
            enterprise: chain.enterpriseTotal,
            talent: chain.talentTotal,
            colorClass: `color${index % 6}`,
          })))
        }
        setSubStats((prev) => prev.map((item, index) => (
          index === 0 ? { ...item, number: formatHomeStatNumber(data.standardTotal) } : item
        )))
      })
      .catch(() => {
        if (!cancelled) {
          setChainStats(defaultChainStats)
          setSubStats(defaultSubStats)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])


  const handleSearch = () => {
    const keyword = searchKeyword.trim()
    if (!keyword) return
    const path = resolveSearchPath(keyword)
    navigate(`${path}?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <div className={styles.page}>
      {/* Hero 区 — 无文字背景图 + 代码渲染标题 */}
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={homeBg} alt="" />
        </div>

        {/* 标题文案覆盖 */}
        <div className={styles.heroTitle}>
          <div className={styles.heroTitleMain}>产业人才创新平台</div>
          <div className={styles.heroTitleSub}>
            产业、人才、技术、资金、政策数据，构建"人才+"全要素数据服务
          </div>
          <div className={styles.heroTitleBar} />
        </div>

        <div className={styles.searchArea}>
          <input
            className={styles.searchInput}
            placeholder="搜索企业、人才、技术、政策..."
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch()
            }}
          />
          <button className={styles.searchBtn} onClick={handleSearch}>
            <img src={searchIcon} alt="" className={styles.searchIcon} />
            搜索
          </button>
        </div>
      </div>

      {/* 统计区：六大产业链数据卡（全国维度）+ 平台次级统计 */}
      <div className={styles.stats}>
        <div className={styles.statsHead}>
          <span className={styles.statsTitle}>六大重点产业链 · 全国企业数据</span>
          <span className={styles.statsHint}>点击卡片进入对应产业图谱</span>
        </div>

        <div className={styles.chainGrid}>
          {chainStats.map((chain, index) => (
            <div
              key={chain.name}
              className={`${styles.chainCard} ${styles[`accent${index % 6}`]}`}
              style={{ animationDelay: `${index * 70}ms` }}
              onClick={() => navigate(chain.chainKey ? `/industry?chain=${chain.chainKey}` : '/industry')}
            >
              <span className={styles.chainIndex}>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.chainName}>{chain.name}</div>
              <div className={styles.chainMetricValue}>
                {formatHomeStatNumber(chain.enterprise)}
                <span className={styles.chainMetricUnit}>家</span>
              </div>
              <div className={styles.chainMetricCaption}>全国企业数量</div>
            </div>
          ))}
        </div>

        <div className={styles.subStats}>
          {subStats.map((item) => (
            <div key={item.label} className={styles.subStatItem} onClick={() => navigate(item.link)}>
              <span className={`${styles.subStatDot} ${styles[item.colorClass]}`} />
              <span className={styles.subStatLabel}>{item.label}</span>
              <span className={styles.subStatNum}>{item.number}</span>
              <span className={styles.subStatUnit}>{item.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 版权 */}
      <div className={styles.copyright}>
        Copyright &copy; 2026 宜昌产业人才地图 All Rights Reserved | 鄂ICP备XXXXXXXXX号-1
      </div>
    </div>
  )
}
