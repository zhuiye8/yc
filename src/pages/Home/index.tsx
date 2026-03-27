import homeBg from '@/assets/images/hero/home-bg.jpg'
import searchIcon from '@/assets/images/icons/小图标_16.png'
import styles from './Home.module.scss'

const stats = [
  { number: '29189', unit: '家', label: '企业总数', colorClass: 'color0' },
  { number: '458000', unit: '人', label: '人才总数', colorClass: 'color1' },
  { number: '4980', unit: '项', label: '技术标准', colorClass: 'color2' },
  { number: '290', unit: '项', label: '融资工具', colorClass: 'color3' },
  { number: '326', unit: '项', label: '申报政策', colorClass: 'color4' },
]

export default function Home() {
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
