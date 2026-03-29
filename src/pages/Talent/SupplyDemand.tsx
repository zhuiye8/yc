import { useState, useMemo } from 'react'
import { Table, Input, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import jobsData from '@/mock/yichang-jobs.json'

interface JobRecord {
  positionName: string
  occupationName: string
  headcount: number
  workRegion: string
  educationMin: string
  salaryMin: string
  salaryMax: string
  status: string
  startDate: string
}

const columns: ColumnsType<JobRecord> = [
  { title: '岗位名称', dataIndex: 'positionName', key: 'positionName', ellipsis: true, width: 180 },
  { title: '岗位类型', dataIndex: 'occupationName', key: 'occupationName', width: 120, render: (v: string) => <Tag color="blue">{v}</Tag> },
  { title: '需求人数', dataIndex: 'headcount', key: 'headcount', width: 90, sorter: (a, b) => a.headcount - b.headcount },
  { title: '工作地区', dataIndex: 'workRegion', key: 'workRegion', width: 100 },
  { title: '学历要求', dataIndex: 'educationMin', key: 'educationMin', width: 100, render: (v: string) => v || '不限' },
  {
    title: '薪资范围', key: 'salary', width: 120,
    render: (_: unknown, record: JobRecord) => {
      if (!record.salaryMin && !record.salaryMax) return '面议'
      return `${record.salaryMin}-${record.salaryMax}`
    },
  },
  {
    title: '状态', dataIndex: 'status', key: 'status', width: 80,
    render: (v: string) => <Tag color={v === '已发布' ? 'green' : 'default'}>{v}</Tag>,
  },
]

export default function SupplyDemand() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return jobsData as JobRecord[]
    const kw = search.trim().toLowerCase()
    return (jobsData as JobRecord[]).filter(
      r => r.positionName.toLowerCase().includes(kw) || r.occupationName.toLowerCase().includes(kw)
    )
  }, [search])

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 48px 48px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input.Search
          placeholder="搜索岗位名称、岗位类型..."
          allowClear
          onSearch={setSearch}
          onChange={e => { if (!e.target.value) setSearch('') }}
          style={{ width: 320 }}
        />
        <span style={{ color: '#86909C', fontSize: 13 }}>共 {filtered.length} 条岗位记录</span>
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey={(_, i) => String(i)}
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: total => `共 ${total} 条` }}
        scroll={{ x: 800 }}
      />
    </div>
  )
}
