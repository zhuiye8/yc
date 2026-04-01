import SmartReportPage, { type SmartReportMenuItem } from '@/components/SmartReportPage'

const reportMenuItems: SmartReportMenuItem[] = [
  { key: 'directory', label: '人才聚集目录' },
  { key: 'migration', label: '人才迁移迁出报告' },
  { key: 'competitiveness', label: '人才竞争力评估' },
  { key: 'enterprise', label: '重点企业报告' },
  { key: 'insight', label: '企业尽调报告' },
]

export default function TalentReport() {
  return (
    <SmartReportPage
      menuItems={reportMenuItems}
      defaultActiveKey="migration"
      description="聚焦专业场景，专注人才搜索匹配分析，融合多源数据建模与智能分析能力，自动生成高价值专业报告。"
      templateHref="/templates/人才库报告模板.docx"
      templateFileName="人才库报告模板.docx"
    />
  )
}
