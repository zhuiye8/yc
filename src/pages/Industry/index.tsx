import { useState } from 'react'
import { Select, Cascader } from 'antd'
import HeroSection from '@/components/HeroSection'
import IndustryGraph from './IndustryGraph'
import IndustryReport from './IndustryReport'
import { regionOptions } from '@/mock/regions'
import industryBg from '@/assets/images/hero/industry-bg.jpg'
import styles from './Industry.module.scss'

// 真实六条产业链（value 对应 industryChainGraphData 的 key）
const chainOptions = [
  { value: 'wetchem', label: '湿电子化学品' },
  { value: 'newenergy', label: '新能源新材料' },
  { value: 'pharma', label: '先进制剂与高端仿制药' },
  { value: 'yeast', label: '酵母发酵与功能成分制造' },
  { value: 'ship', label: '内河绿色智能船舶制造' },
  { value: 'ai', label: '人工智能' },
]

const hotTags = ['湿电子化学品', '氟化工', '锂电材料', '生物制药', '智能传感器', '碳纤维', '光伏材料']

export default function Industry() {
  const [activeTab, setActiveTab] = useState<'graph' | 'report'>('graph')
  const [selectedChain, setSelectedChain] = useState('ai')

  return (
    <div>
      <HeroSection
        backgroundImage={industryBg}
        searchPlaceholder="搜索产业链、产业环节、企业..."
        hotTags={hotTags}
      />

      {/* Tab 栏 */}
      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div
            className={`${styles.tab} ${activeTab === 'graph' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('graph')}
          >
            产业图谱
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'report' ? styles.active : styles.inactive}`}
            onClick={() => setActiveTab('report')}
          >
            产业报告
          </div>
        </div>

        <div className={styles.tabRight}>
          <span className={styles.filterLabel}>地区</span>
          <Cascader
            options={regionOptions}
            defaultValue={['hubei', 'yichang']}
            size="small"
            style={{ width: 200 }}
            placeholder="选择地区"
          />
          <span className={styles.filterLabel}>产业链</span>
          <Select
            value={selectedChain}
            onChange={setSelectedChain}
            options={chainOptions}
            style={{ width: 200 }}
            size="small"
          />
        </div>
      </div>

      {/* 内容区 */}
      {activeTab === 'graph' ? (
        <div className={styles.graphSection}>
          <div className={styles.graphDesc}>
            当前产业链：{chainOptions.find(c => c.value === selectedChain)?.label} —
            展示上游原料 → 中游制造 → 下游应用的产业链全景结构，节点颜色标识强/弱/缺链状态。
          </div>
          <IndustryGraph chainKey={selectedChain} />
        </div>
      ) : (
        <IndustryReport />
      )}
    </div>
  )
}
