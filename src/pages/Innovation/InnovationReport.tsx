import SmartReportPage, { type SmartReportMenuItem } from '@/components/SmartReportPage'

const reportMenuItems: SmartReportMenuItem[] = [
  { key: 'analysis', label: '技术分析报告' },
  { key: 'gap', label: '技术缺口识别' },
  { key: 'warning', label: '技术预警分析' },
  { key: 'benchmark', label: '技术竞争力对标' },
]

export default function InnovationReport() {
  return (
    <SmartReportPage
      menuItems={reportMenuItems}
      defaultActiveKey="gap"
      description="聚焦专业场景，专注创新资源挖掘分析，融合多源数据建模与智能分析能力，通过创新资源评估与缺口对标引擎，自动生成高价值专业报告。"
      templateHref="/templates/技术库报告模板.docx"
      templateFileName="技术库报告模板.docx"
    />
  )
}
