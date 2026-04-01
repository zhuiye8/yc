import SmartReportPage, { type SmartReportMenuItem } from '@/components/SmartReportPage'

const reportMenuItems: SmartReportMenuItem[] = [
  { key: 'industry-overview', label: '产业洞察报告' },
  { key: 'investment', label: '精准招商报告' },
  { key: 'park', label: '园区画像报告' },
  { key: 'focus-enterprise', label: '重点企业报告' },
  { key: 'enterprise-insight', label: '企业尽调报告' },
]

export default function IndustryReport() {
  return (
    <SmartReportPage
      menuItems={reportMenuItems}
      defaultActiveKey="investment"
      description="聚焦专业场景，专注产业链深度分析，融合多源数据建模与智能分析能力，自动生成高价值专业报告。"
      templateHref="/templates/企业库报告模板.docx"
      templateFileName="企业库报告模板.docx"
    />
  )
}
