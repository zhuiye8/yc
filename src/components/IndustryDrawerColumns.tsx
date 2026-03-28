/**
 * 产业招引 — 抽屉表格列定义（企业 + 人才）
 * 统一样式，标签颜色丰富
 */
import { Tag, Space, Typography, Tooltip } from 'antd'
import {
  BankOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BookOutlined,
} from '@ant-design/icons'

const { Text } = Typography

// ========== 标签配色映射 ==========

/** 企业标签 → 颜色 */
const orgTagColorMap: Record<string, string> = {
  '上市企业': '#f5222d',
  '世界500强': '#f5222d',
  '中国500强': '#fa541c',
  '中央企业': '#fa8c16',
  '专精特新企业': '#7c3aed',
  '国家高新技术企业': '#2468F2',
  '高新技术企业': '#2468F2',
  '科技型中小企业': '#13c2c2',
  '独角兽': '#eb2f96',
  '瞪羚企业': '#52c41a',
  '隐形冠军': '#722ed1',
  '211工程': '#1890ff',
  '985工程': '#1890ff',
  '双一流': '#2f54eb',
  '普通高等学校': '#8c8c8c',
}

/** 企业来源类型 → 显示 */
const orgTypeMap: Record<string, { label: string; color: string }> = {
  'QY': { label: '企业', color: '#2468F2' },
  'GX': { label: '高校', color: '#7c3aed' },
  'KY': { label: '科研', color: '#13c2c2' },
  'YY': { label: '医院', color: '#52c41a' },
}

/** H指数 → 颜色等级 */
function getHIndexColor(h: number): string {
  if (h >= 30) return '#f5222d'   // 顶尖
  if (h >= 15) return '#fa541c'   // 高
  if (h >= 5) return '#2468F2'    // 中
  if (h >= 1) return '#13c2c2'    // 低
  return '#d9d9d9'                // 无
}

/** 行业标签颜色轮转 */
const industryColors = ['#2468F2', '#7c3aed', '#13c2c2', '#52c41a', '#fa8c16', '#eb2f96', '#f5222d', '#722ed1']

function getIndustryColor(industry: string): string {
  let hash = 0
  for (let i = 0; i < industry.length; i++) {
    hash = ((hash << 5) - hash) + industry.charCodeAt(i)
    hash |= 0
  }
  return industryColors[Math.abs(hash) % industryColors.length]
}

function getOrgTagColor(tag: string): string {
  return orgTagColorMap[tag] || '#8c8c8c'
}

// ========== 企业表格列 ==========
export const orgDrawerColumns = [
  {
    title: '企业名称',
    dataIndex: 'NAME',
    key: 'name',
    ellipsis: true,
    render: (_: unknown, r: Record<string, unknown>) => {
      const name = String(r.NAME || r.name || '-')
      const orgType = orgTypeMap[String(r.SOURCE || r.ORGTYPE || '')] || orgTypeMap['QY']
      return (
        <Space size={4}>
          {orgType && (
            <Tag color={orgType.color} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', borderRadius: 2, marginRight: 0 }}>
              {orgType.label}
            </Tag>
          )}
          <Tooltip title={name}>
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
          </Tooltip>
        </Space>
      )
    },
  },
  {
    title: '地区',
    dataIndex: 'CITY',
    key: 'region',
    width: 100,
    render: (_: unknown, r: Record<string, unknown>) => {
      const prov = String(r.PROV || '')
      const city = String(r.CITY || '')
      return <Text type="secondary" style={{ fontSize: 12 }}>{prov}{city && city !== prov ? ` ${city}` : ''}</Text>
    },
  },
  {
    title: '行业',
    dataIndex: 'INDUSTRY',
    key: 'industry',
    width: 180,
    render: (_: unknown, r: Record<string, unknown>) => {
      const industries = (r.INDUSTRY || []) as string[]
      return (
        <Space size={2} wrap>
          {industries.slice(0, 2).map((ind, i) => (
            <Tag key={i} color={getIndustryColor(ind)} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', borderRadius: 2 }}>
              {ind.length > 8 ? ind.slice(0, 8) + '...' : ind}
            </Tag>
          ))}
        </Space>
      )
    },
  },
  {
    title: '标签',
    dataIndex: 'TAGS',
    key: 'tags',
    width: 200,
    render: (_: unknown, r: Record<string, unknown>) => {
      const tags = (r.TAGS || r.tags || []) as string[]
      if (tags.length === 0) return <Text type="secondary" style={{ fontSize: 12 }}>-</Text>
      return (
        <Space size={2} wrap>
          {tags.slice(0, 3).map((t, i) => (
            <Tag key={i} color={getOrgTagColor(t)} style={{ fontSize: 10, lineHeight: '18px', padding: '0 6px', borderRadius: 10 }}>
              {t}
            </Tag>
          ))}
        </Space>
      )
    },
  },
]

// ========== 人才表格列 ==========
export const expertDrawerColumns = [
  {
    title: '姓名',
    dataIndex: 'CNAME',
    key: 'name',
    width: 90,
    render: (_: unknown, r: Record<string, unknown>) => {
      const name = String(r.CNAME || r.name || '-')
      const title = r.TITLE ? (r.TITLE as string[])[0] : ''
      return (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          {title && <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{title}</div>}
        </div>
      )
    },
  },
  {
    title: '机构',
    dataIndex: 'AORG',
    key: 'org',
    ellipsis: true,
    render: (_: unknown, r: Record<string, unknown>) => {
      const org = String(r.AORG || r.org || '-')
      return (
        <Tooltip title={org}>
          <Space size={4}>
            <BankOutlined style={{ color: '#999', fontSize: 11 }} />
            <Text style={{ fontSize: 12 }}>{org}</Text>
          </Space>
        </Tooltip>
      )
    },
  },
  {
    title: 'H指数',
    dataIndex: 'H',
    key: 'h',
    width: 70,
    align: 'center' as const,
    render: (_: unknown, r: Record<string, unknown>) => {
      const h = Number(r.H ?? 0)
      return (
        <Tag color={getHIndexColor(h)} style={{ fontWeight: 600, minWidth: 32, textAlign: 'center', borderRadius: 10 }}>
          {h || '-'}
        </Tag>
      )
    },
  },
  {
    title: (
      <Tooltip title="学术论文数">
        <Space size={2}><BookOutlined style={{ fontSize: 11 }} /><span>论文</span></Space>
      </Tooltip>
    ),
    dataIndex: 'QIKAN',
    key: 'qikan',
    width: 60,
    align: 'center' as const,
    render: (_: unknown, r: Record<string, unknown>) => {
      const v = Number(r.QIKAN ?? 0)
      return <Text style={{ fontSize: 12, color: v > 0 ? '#333' : '#ccc' }}>{v || '-'}</Text>
    },
  },
  {
    title: (
      <Tooltip title="专利数">
        <Space size={2}><FileTextOutlined style={{ fontSize: 11 }} /><span>专利</span></Space>
      </Tooltip>
    ),
    dataIndex: 'ZHUANLI',
    key: 'patent',
    width: 60,
    align: 'center' as const,
    render: (_: unknown, r: Record<string, unknown>) => {
      const v = Number(r.ZHUANLI ?? 0)
      return <Text style={{ fontSize: 12, color: v > 0 ? '#333' : '#ccc' }}>{v || '-'}</Text>
    },
  },
  {
    title: (
      <Tooltip title="科研成果数">
        <Space size={2}><ExperimentOutlined style={{ fontSize: 11 }} /><span>成果</span></Space>
      </Tooltip>
    ),
    dataIndex: 'CHENGGUO',
    key: 'chengguo',
    width: 60,
    align: 'center' as const,
    render: (_: unknown, r: Record<string, unknown>) => {
      const v = Number(r.CHENGGUO ?? 0)
      return <Text style={{ fontSize: 12, color: v > 0 ? '#333' : '#ccc' }}>{v || '-'}</Text>
    },
  },
  {
    title: (
      <Tooltip title="产学研合作次数">
        <Space size={2}><TrophyOutlined style={{ fontSize: 11 }} /><span>合作</span></Space>
      </Tooltip>
    ),
    dataIndex: 'CHANXUEYANHZ',
    key: 'coop',
    width: 60,
    align: 'center' as const,
    render: (_: unknown, r: Record<string, unknown>) => {
      const v = Number(r.CHANXUEYANHZ ?? 0)
      return <Text style={{ fontSize: 12, color: v > 0 ? '#333' : '#ccc' }}>{v || '-'}</Text>
    },
  },
]
