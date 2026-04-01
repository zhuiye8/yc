import { useMemo, useState, type ReactNode } from 'react'
import { FileTextOutlined, ProfileOutlined, SearchOutlined } from '@ant-design/icons'

import styles from './SmartReportPage.module.scss'

export type SmartReportMenuItem = {
  key: string
  label: string
}

export type SmartReportCard = {
  key: string
  title: string
  description: string
  icon?: ReactNode
}

interface SmartReportPageProps {
  menuItems: SmartReportMenuItem[]
  defaultActiveKey: string
  description: string
  title?: string
  featureCards?: SmartReportCard[]
  keywordLabel?: string
  goalLabel?: string
  keywordPlaceholder?: string
  goalPlaceholder?: string
  templateHref?: string
  templateFileName?: string
}

const defaultFeatureCards: SmartReportCard[] = [
  {
    key: 'insight',
    title: '聚焦专业场景',
    description: '聚焦专业场景智能体与多维数据推理分析能力',
    icon: <FileTextOutlined />,
  },
  {
    key: 'analysis',
    title: '聚焦专业场景',
    description: '聚焦专业场景智能体与专业任务拆解编排能力',
    icon: <ProfileOutlined />,
  },
  {
    key: 'report',
    title: '聚焦专业场景',
    description: '聚焦专业场景智能体与自动生成报告协同能力',
    icon: <SearchOutlined />,
  },
]

export default function SmartReportPage({
  menuItems,
  defaultActiveKey,
  description,
  title = '应用智能体',
  featureCards,
  keywordLabel = '关键词：',
  goalLabel = '预期目标：',
  keywordPlaceholder = '',
  goalPlaceholder = '请输入关键目标...',
  templateHref,
  templateFileName,
}: SmartReportPageProps) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey)
  const [keyword, setKeyword] = useState('')
  const [goal, setGoal] = useState('')

  const cards = useMemo(() => featureCards ?? defaultFeatureCards, [featureCards])

  const handleSubmit = () => {
    if (!templateHref) return

    const link = document.createElement('a')
    const fallbackName = decodeURIComponent(templateHref.split('/').pop() || 'report-template.docx')

    link.href = encodeURI(templateHref)
    link.download = templateFileName || fallbackName
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className={styles.reportPage}>
      <aside className={styles.sidebar}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.menuButton} ${item.key === activeKey ? styles.menuButtonActive : ''}`}
            onClick={() => setActiveKey(item.key)}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <div className={styles.content}>
        <div className={styles.workspaceCard}>
          <div className={styles.workspaceHeader}>
            <h3 className={styles.workspaceTitle}>{title}</h3>
            <p className={styles.workspaceDescription}>{description}</p>
          </div>

          <div className={styles.cardRow}>
            {cards.map((card) => (
              <article key={card.key} className={styles.featureCard}>
                <span className={styles.featureIcon}>{card.icon}</span>
                <h4 className={styles.featureTitle}>{card.title}</h4>
                <p className={styles.featureDescription}>{card.description}</p>
              </article>
            ))}
          </div>

          <div className={styles.workspaceCanvas} />
        </div>

        <div className={styles.promptCard}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                <span className={styles.fieldRequired}>*</span>
                {keywordLabel}
              </span>
              <input
                className={styles.fieldInput}
                type="text"
                placeholder={keywordPlaceholder}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>{goalLabel}</span>
              <input
                className={styles.fieldInput}
                type="text"
                placeholder={goalPlaceholder}
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
              />
            </label>
          </div>

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            aria-label="生成报告"
            style={{ height: '28px' }}
          >
            <span className={styles.submitArrow} />
          </button>
        </div>
      </div>
    </section>
  )
}
