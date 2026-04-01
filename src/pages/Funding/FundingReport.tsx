import SmartReportPage, { type SmartReportMenuItem } from '@/components/SmartReportPage'

const reportMenuItems: SmartReportMenuItem[] = [
  { key: 'dock', label: '融资对接报告' },
  { key: 'gap', label: '资金缺口对接' },
  { key: 'risk', label: '风险预警报告' },
]

export default function FundingReport() {
  return (
    <SmartReportPage
      menuItems={reportMenuItems}
      defaultActiveKey="gap"
      description="聚焦专业场景，专注资金链深度分析，融合多源数据建模与智能分析能力，围绕产业基金布局、政府扶持政策、企业财务数据与资本市场动态自动生成专业报告。"
    />
  )
}
