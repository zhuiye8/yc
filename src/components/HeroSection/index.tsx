import { useMemo, useState } from 'react'
import { AutoComplete } from 'antd'
import styles from './HeroSection.module.scss'
import searchIconImg from '@/assets/images/icons/小图标_16.png'

export interface HeroSearchOption {
  value: string
  label: string
  chain: string
  parentChain?: string
}

interface HeroSectionProps {
  backgroundImage: string
  searchPlaceholder?: string
  hotTags?: string[]
  onSearch?: (value: string) => void
  searchOptions?: HeroSearchOption[]
  onSearchOptionSelect?: (option: HeroSearchOption) => void
  variant?: 'default' | 'industry'
  /** 覆盖背景图文字的标题（两行） */
  titleLine1?: string
  titleLine2?: string
}

export default function HeroSection({
  backgroundImage,
  searchPlaceholder = '搜索...',
  hotTags = [],
  onSearch,
  searchOptions = [],
  onSearchOptionSelect,
  variant = 'default',
  titleLine1,
  titleLine2,
}: HeroSectionProps) {
  const [selectedSearchValue, setSelectedSearchValue] = useState<string>()
  const [searchText, setSearchText] = useState('')
  const hasSearchOptions = searchOptions.length > 0
  const optionMap = useMemo(() => new Map(searchOptions.map((option) => [option.value, option])), [searchOptions])
  const autoCompleteOptions = useMemo(
    () =>
      searchOptions
        .filter((option) => {
          const normalizedInput = searchText.trim().toLowerCase()
          return !normalizedInput || option.label.toLowerCase().includes(normalizedInput)
        })
        .slice(0, 80)
        .map((option) => ({
          value: option.value,
          label: (
            <div className={styles.searchOption}>
              <span className={styles.searchOptionLabel}>{option.label}</span>
              {option.chain && option.chain !== option.label && (
                <span className={styles.searchOptionChain}>{option.chain}</span>
              )}
            </div>
          ),
        })),
    [searchOptions, searchText],
  )

  const triggerOptionSearch = (value: string | undefined) => {
    if (!value) return
    const option = optionMap.get(value)
    if (option) {
      setSearchText(option.label)
      onSearchOptionSelect?.(option)
    }
  }

  const handleSearch = () => {
    if (hasSearchOptions) {
      triggerOptionSearch(selectedSearchValue)
      return
    }

    const input = document.querySelector<HTMLInputElement>(`.${styles.searchInput}`)
    if (input && onSearch) {
      onSearch(input.value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleHotTagClick = (tag: string) => {
    if (hasSearchOptions) {
      const normalizedTag = tag.trim().toLowerCase()
      const option = searchOptions.find((item) => item.label.toLowerCase() === normalizedTag)
        ?? searchOptions.find((item) => item.label.toLowerCase().includes(normalizedTag))
      if (option) {
        setSelectedSearchValue(option.value)
        setSearchText(option.label)
        onSearchOptionSelect?.(option)
      }
      return
    }

    const input = document.querySelector<HTMLInputElement>(`.${styles.searchInput}`)
    if (input) input.value = tag
    if (onSearch) onSearch(tag)
  }

  const isIndustryVariant = variant === 'industry'
  const heroOuterClassName = isIndustryVariant
    ? `${styles.heroOuter} ${styles.industryHeroOuter}`
    : styles.heroOuter
  const searchWrapperClassName = isIndustryVariant
    ? `${styles.searchWrapper} ${styles.industrySearchWrapper}`
    : styles.searchWrapper

  return (
    <div className={heroOuterClassName}>
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={backgroundImage} alt="" />
        </div>
        {/* 覆盖标题文案（客户要求更换背景图上的文字） */}
        {(titleLine1 || titleLine2) && (
          <div className={styles.heroTitle}>
            {titleLine1 && <div className={styles.heroTitleLine}>{titleLine1}</div>}
            {titleLine2 && <div className={styles.heroTitleLine}>{titleLine2}</div>}
            <div className={styles.heroTitleBar} />
          </div>
        )}
      </div>

      {/* 搜索容器：横跨 Hero 底部边缘 */}
      <div className={styles.searchContainer}>
        <div className={searchWrapperClassName}>
          <div className={styles.searchRow}>
            {hasSearchOptions ? (
              <AutoComplete
                className={styles.searchAutoComplete}
                value={searchText}
                placeholder={searchPlaceholder}
                options={autoCompleteOptions}
                filterOption={false}
                onChange={(value) => {
                  setSearchText(value)
                  setSelectedSearchValue(undefined)
                }}
                onSearch={(value) => {
                  setSearchText(value)
                  setSelectedSearchValue(undefined)
                }}
                onSelect={(value: string) => {
                  setSelectedSearchValue(value)
                  triggerOptionSearch(value)
                }}
              />
            ) : (
              <input
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                onKeyDown={handleKeyDown}
              />
            )}
            <button
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={hasSearchOptions && !selectedSearchValue}
            >
              <img src={searchIconImg} alt="" className={styles.searchIcon} />
              搜索
            </button>
          </div>

          {hotTags.length > 0 && (
            <div className={styles.hotTags}>
              <span className={styles.hotLabel}>热门搜索：</span>
              {hotTags.map((tag) => (
                <span
                  key={tag}
                  className={styles.hotTag}
                  onClick={() => handleHotTagClick(tag)}
                  style={{ cursor: 'pointer' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
