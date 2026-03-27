import ReportPanel from '@/components/ReportPanel'

const reportMenuItems = [
  { key: 'quality', label: '人才素质比较' },
  { key: 'migration', label: '人才迁移比例报告' },
  { key: 'competitiveness', label: '人才竞争力评估' },
  { key: 'enterprise', label: '重点企业报告' },
  { key: 'environment', label: '企业环境报告' },
]

export default function TalentReport() {
  return <ReportPanel menuItems={reportMenuItems} defaultActiveKey="migration" />
}
