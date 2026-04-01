import SmartReportPage, { type SmartReportMenuItem } from '@/components/SmartReportPage'

const reportMenuItems: SmartReportMenuItem[] = [
  { key: 'advice', label: '申报建议分析' },
  { key: 'interpret', label: '政策解读报告' },
]

export default function PolicyReport() {
  return (
    <SmartReportPage
      menuItems={reportMenuItems}
      defaultActiveKey="interpret"
      description="聚焦专业场景，专注政策推演匹配分析，融合多源数据建模与智能分析能力，自动生成高价值专业报告。"
    />
  )
}
