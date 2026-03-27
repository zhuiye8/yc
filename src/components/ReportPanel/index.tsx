import { useState } from 'react'
import { FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons'
import styles from './ReportPanel.module.scss'

interface ReportMenuItem {
  key: string
  label: string
}

interface ReportPanelProps {
  menuItems: ReportMenuItem[]
  defaultActiveKey?: string
}

export default function ReportPanel({ menuItems, defaultActiveKey }: ReportPanelProps) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || menuItems[0]?.key)

  return (
    <div className={styles.container}>
      {/* 左侧报告类型菜单 */}
      <div className={styles.menu}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`${styles.menuItem} ${activeKey === item.key ? styles.active : ''}`}
            onClick={() => setActiveKey(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* 右侧内容 */}
      <div className={styles.content}>
        <h2 className={styles.aiTitle}>应用智能体</h2>
        <p className={styles.aiDesc}>
          聚焦专业场景，专注产业链深度分析，融合多源数据建模与智能分析能力，自动生成高价值专业报告。
        </p>

        <div className={styles.cards}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon}>
                <FileTextOutlined />
              </div>
              <div className={styles.cardTitle}>聚焦专业场景</div>
              <div className={styles.cardDesc}>
                聚焦专业场景的深度数据分析服务
              </div>
            </div>
          ))}
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputGroup}>
            <label>* 关键词</label>
            <input placeholder="请输入关键词" />
          </div>
          <div className={styles.inputGroup}>
            <label>期限目标</label>
            <input placeholder="请输入期限" />
          </div>
          <button className={styles.submitBtn}>
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  )
}
