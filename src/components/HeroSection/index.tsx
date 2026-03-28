import styles from './HeroSection.module.scss'
import searchIconImg from '@/assets/images/icons/小图标_16.png'

interface HeroSectionProps {
  backgroundImage: string
  searchPlaceholder?: string
  hotTags?: string[]
  onSearch?: (value: string) => void
}

export default function HeroSection({
  backgroundImage,
  searchPlaceholder = '搜索...',
  hotTags = [],
  onSearch,
}: HeroSectionProps) {
  const handleSearch = () => {
    const input = document.querySelector<HTMLInputElement>(`.${styles.searchInput}`)
    if (input && onSearch) {
      onSearch(input.value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className={styles.heroOuter}>
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={backgroundImage} alt="" />
        </div>
      </div>

      {/* 搜索容器：横跨 Hero 底部边缘 */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.searchBtn} onClick={handleSearch}>
              <img src={searchIconImg} alt="" className={styles.searchIcon} />
              搜索
            </button>
          </div>

          {hotTags.length > 0 && (
            <div className={styles.hotTags}>
              <span className={styles.hotLabel}>热门搜索：</span>
              {hotTags.map((tag) => (
                <span key={tag} className={styles.hotTag} onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(`.${styles.searchInput}`)
                  if (input) input.value = tag
                  if (onSearch) onSearch(tag)
                }} style={{ cursor: 'pointer' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
