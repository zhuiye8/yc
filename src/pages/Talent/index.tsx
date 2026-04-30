import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import HeroSection from '@/components/HeroSection'
import TalentGraph from './TalentGraph'
import TalentReport from './TalentReport'
import SupplyDemand from './SupplyDemand'
import talentBg from '@/assets/images/hero/talent-bg-plain.jpg'
import styles from './Talent.module.scss'

const hotTags = ['人工智能', '生物医药', '新材料', '智能制造', '大数据', '博士后']

export default function Talent() {
  const [searchParams] = useSearchParams()
  const initialKeyword = searchParams.get('q') ?? ''
  const [activeTab, setActiveTab] = useState<'graph' | 'supply' | 'report'>('graph')
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword)
  const [searchCounter, setSearchCounter] = useState(0)

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setSearchCounter(c => c + 1)
    setActiveTab('graph')
  }

  return (
    <div className={styles.page}>
      <HeroSection
        backgroundImage={talentBg}
        searchPlaceholder="搜索人才姓名、研究方向、所属机构..."
        hotTags={hotTags}
        onSearch={handleSearch}
        variant="industry"
        titleLine1="人才智能画像"
        titleLine2="人岗精准对接"
      />

      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div
            className={`${styles.tab} ${activeTab === 'graph' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('graph')}
          >
            人才图谱
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'supply' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('supply')}
          >
            供需匹配
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('report')}
          >
            人才报告
          </div>
        </div>
      </div>

      {activeTab === 'graph' && (
        <div className={styles.graphSection}>
          <TalentGraph key={`${searchKeyword}-${searchCounter}`} searchKeyword={searchKeyword} />
        </div>
      )}

      {activeTab === 'supply' && <SupplyDemand />}

      {activeTab === 'report' && <TalentReport />}
    </div>
  )
}
