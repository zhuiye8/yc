import { useState, lazy, Suspense } from 'react'
import { Select, Spin } from 'antd'
import HeroSection from '@/components/HeroSection'
import TalentGraph from './TalentGraph'
import TalentReport from './TalentReport'
import SupplyDemand from './SupplyDemand'
import talentBg from '@/assets/images/hero/talent-bg.jpg'
import styles from './Talent.module.scss'

const YichangTalents = lazy(() => import('./YichangTalents'))

const hotTags = ['生物医药', '新材料', '人工智能', '博士后', '高级工程师', '领军人才']

export default function Talent() {
  const [activeTab, setActiveTab] = useState<'graph' | 'supply' | 'report'>('graph')
  const [hometown, setHometown] = useState<'all' | 'yichang'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchCounter, setSearchCounter] = useState(0)

  const isYichangMode = hometown === 'yichang'

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setSearchCounter(c => c + 1)
    setActiveTab('graph')
    setHometown('all')
  }

  return (
    <div>
      <HeroSection
        backgroundImage={talentBg}
        searchPlaceholder="搜索人才姓名、研究方向、所属机构..."
        hotTags={hotTags}
        onSearch={handleSearch}
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

        <div className={styles.tabRight}>
          <Select defaultValue="all" style={{ width: 120 }} size="small" disabled options={[
            { value: 'all', label: '全部产业链' },
          ]} />
          <Select defaultValue="all" style={{ width: 110 }} size="small" disabled options={[
            { value: 'all', label: '全部机构' },
          ]} />
          <Select
            value={hometown}
            onChange={(v) => setHometown(v)}
            style={{ width: 110 }}
            size="small"
            options={[
              { value: 'all', label: '全部籍贯' },
              { value: 'yichang', label: '宜昌' },
            ]}
          />
          <Select defaultValue="all" style={{ width: 110 }} size="small" disabled options={[
            { value: 'all', label: '全部类型' },
          ]} />
        </div>
      </div>

      {activeTab === 'graph' && (
        <div className={styles.graphSection}>
          {isYichangMode ? (
            <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}><Spin size="large" /><div style={{ marginTop: 12, color: '#86909C' }}>加载宜昌人才数据...</div></div>}>
              <YichangTalents />
            </Suspense>
          ) : (
            <TalentGraph key={`${searchKeyword}-${searchCounter}`} searchKeyword={searchKeyword} />
          )}
        </div>
      )}

      {activeTab === 'supply' && <SupplyDemand />}

      {activeTab === 'report' && <TalentReport />}
    </div>
  )
}
