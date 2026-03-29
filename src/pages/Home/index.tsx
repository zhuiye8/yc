import { useState, useEffect } from 'react'
import { getAreaStatistics } from '@/services/screen'
import homeBg from '@/assets/images/hero/home-bg.jpg'
import searchIcon from '@/assets/images/icons/小图标_16.png'
import styles from './Home.module.scss'

function formatNumber(n: number): string {
  if (n >= 10000) {
    return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  }
  return String(n)
}

const defaultStats = [
  { number: '29189', unit: '家', label: '企业总数', colorClass: 'color0' },
  { number: '458000', unit: '人', label: '人才总数', colorClass: 'color1' },
  { number: '4980', unit: '项', label: '技术标准', colorClass: 'color2' },
  { number: '290', unit: '项', label: '融资工具', colorClass: 'color3' },
  { number: '326', unit: '项', label: '申报政策', colorClass: 'color4' },
]

export default function Home() {
  const [stats, setStats] = useState(defaultStats)

  useEffect(() => {
    getAreaStatistics('420500').then(data => {
      const enterprise = typeof data['科技企业'] === 'number' ? data['科技企业'] as number : 0
      const talent = typeof data['创新人才'] === 'number' ? data['创新人才'] as number : 0
      const tech = typeof data['技术标准'] === 'number' ? data['技术标准'] as number : 0

      setStats([
        { number: enterprise ? formatNumber(enterprise) : '29189', unit: enterprise >= 10000 ? '家' : '家', label: '企业总数', colorClass: 'color0' },
        { number: talent ? formatNumber(talent) : '458000', unit: talent >= 10000 ? '人' : '人', label: '人才总数', colorClass: 'color1' },
        { number: tech ? formatNumber(tech) : '4980', unit: tech >= 10000 ? '项' : '项', label: '技术标准', colorClass: 'color2' },
        { number: '290', unit: '项', label: '融资工具', colorClass: 'color3' },
        { number: '41', unit: '项', label: '申报政策', colorClass: 'color4' },
      ])
    }).catch(() => {
      // Keep defaults on error, but update 申报政策 to 41
      setStats(prev => prev.map(s => s.label === '申报政策' ? { ...s, number: '41' } : s))
    })
  }, [])

  return (
    <div className={styles.page}>
      {/* Hero 区 — 背景图已含标题文字 */}
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={homeBg} alt="" />
        </div>

        <div className={styles.searchArea}>
          <input
            className={styles.searchInput}
            placeholder="搜索企业、人才、技术、政策..."
          />
          <button className={styles.searchBtn}>
            <img src={searchIcon} alt="" className={styles.searchIcon} />
            搜索
          </button>
        </div>
      </div>

      {/* 统计数字 */}
      <div className={styles.stats}>
        <div className={styles.statsRow}>
          {stats.map((item) => (
            <div key={item.label} className={styles.statItem}>
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
