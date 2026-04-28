import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homeBg from '@/assets/images/hero/home-bg-plain.jpg'
import searchIcon from '@/assets/images/icons/小图标_16.png'
import styles from './Home.module.scss'

const defaultStats = [
  { number: '200万', unit: '家', label: '企业总数', colorClass: 'color0', link: '/industry' },
  { number: '4000万', unit: '人', label: '人才总数', colorClass: 'color1', link: '/talent' },
  { number: '300万', unit: '项', label: '技术标准', colorClass: 'color2', link: '/innovation' },
  { number: '257', unit: '款', label: '金融产品', colorClass: 'color3', link: '/funding' },
  { number: '41', unit: '项', label: '申报政策', colorClass: 'color4', link: '/policy' },
]

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
  const stats = defaultStats

  // useEffect(() => {
  //   getAreaStatistics('4205').then(data => {
  //     const enterprise = typeof data['科技企业'] === 'string' ? parseInt(data['科技企业'] as string) : (data['科技企业'] as number) || 0
  //     const talent = (data['创新人才'] as number) || 0
  //     const tech = (data['技术标准'] as number) || 0

  //     setStats([
  //       { number: enterprise ? formatNumber(enterprise) : '29189', unit: '家', label: '企业总数', colorClass: 'color0', link: '/industry' },
  //       { number: talent ? formatNumber(talent) : '458000', unit: '人', label: '人才总数', colorClass: 'color1', link: '/talent' },
  //       { number: tech ? formatNumber(tech) : '4980', unit: '项', label: '技术标准', colorClass: 'color2', link: '/innovation' },
  //       { number: '257', unit: '款', label: '金融产品', colorClass: 'color3', link: '/funding' },
  //       { number: '41', unit: '项', label: '申报政策', colorClass: 'color4', link: '/policy' },
  //     ])
  //   }).catch(() => {
  //     // Keep defaults on error, but update 申报政策 to 41
  //     setStats(prev => prev.map(s => s.label === '申报政策' ? { ...s, number: '41' } : s))
  //   })
  // }, [])

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
            整合产业、人才、技术、资金、政策数据，构建"人才+"全要素数据服务
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

      {/* 统计数字 */}
      <div className={styles.stats}>
        <div className={styles.statsRow}>
          {stats.map((item) => (
            <div key={item.label} className={styles.statItem} onClick={() => item.link && navigate(item.link)} style={{ cursor: 'pointer' }}>
              <div className={`${styles.statNumber} ${styles[item.colorClass]}`}>
                {item.number}
                <span className={styles.statUnit}>{item.unit}</span>
              </div>
              <div className={styles.statLabel}>{item.label}</div>
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
