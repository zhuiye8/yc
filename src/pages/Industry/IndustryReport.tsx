import ReportPanel from '@/components/ReportPanel'

const reportMenuItems = [
  { key: 'research', label: '产业研究报告' },
  { key: 'investment', label: '精准招商报告' },
  { key: 'park', label: '园区画像报告' },
  { key: 'enterprise', label: '重点企业报告' },
  { key: 'survival', label: '企业存续报告' },
]

export default function IndustryReport() {
  return <ReportPanel menuItems={reportMenuItems} defaultActiveKey="investment" />
}
