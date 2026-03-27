import { useState } from 'react'
import { Select } from 'antd'
import HeroSection from '@/components/HeroSection'
import TalentGraph from './TalentGraph'
import TalentReport from './TalentReport'
import talentBg from '@/assets/images/hero/talent-bg.jpg'
import styles from './Talent.module.scss'

const hotTags = ['生物医药', '新材料', '人工智能', '博士后', '高级工程师', '领军人才', '宜昌籍']

export default function Talent() {
  const [activeTab, setActiveTab] = useState<'graph' | 'match' | 'report'>('graph')

  return (
    <div>
      <HeroSection
        backgroundImage={talentBg}
        searchPlaceholder="搜索人才姓名、研究方向、所属机构..."
        hotTags={hotTags}
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
            className={`${styles.tab} ${activeTab === 'match' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('match')}
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
          <Select defaultValue="all" style={{ width: 120 }} size="small" options={[
            { value: 'all', label: '全部产业链' },
          ]} />
          <Select defaultValue="all" style={{ width: 110 }} size="small" options={[
            { value: 'all', label: '全部机构' },
          ]} />
          <Select defaultValue="all" style={{ width: 110 }} size="small" options={[
            { value: 'all', label: '全部籍贯' },
          ]} />
          <Select defaultValue="all" style={{ width: 110 }} size="small" options={[
            { value: 'all', label: '全部类型' },
          ]} />
        </div>
      </div>

      {activeTab === 'graph' && (
        <div className={styles.graphSection}>
          <TalentGraph />
        </div>
      )}

      {activeTab === 'match' && (
        <div style={{ padding: 60, textAlign: 'center', color: '#999', fontSize: 16 }}>供需匹配功能 — 待实现</div>
      )}

      {activeTab === 'report' && <TalentReport />}
    </div>
  )
}
