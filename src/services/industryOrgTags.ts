export const ORG_TAG_FILTER_OPTIONS = [
  '企业',
  '科研机构',
  '高校',
  '医院',
  '高新技术企业',
  '专精特新',
  '上市公司',
  '中国500强',
  '中国民营企业500强',
  '中国制造业500强',
  '国家级企业技术中心',
]

export function normalizeOrgTagFilter(value?: string) {
  return String(value || '').trim()
}
