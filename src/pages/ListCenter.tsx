/**
 * @input antd 组件, @ant-design/icons
 * @output { ListCenter } 清单中心组件
 * @position 业务页面，招商/引才/融资/申报四类清单 Tab 管理（数据内联，无 mock 导入）
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Badge, Avatar, Typography, Input, Select, Drawer, Descriptions, List, App } from 'antd';
import {
  StarOutlined,
  BankOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// 模拟清单数据
const listData = {
  investment: [
    { id: 1, name: '宜昌人福药业有限公司', industry: '生物医药', area: '西陵区', status: 'tracking', addTime: '2026-01-10', score: 92, contact: '已联系', nextStep: '安排实地考察' },
    { id: 2, name: '三峡新材股份有限公司', industry: '新材料', area: '猇亭区', status: 'evaluating', addTime: '2026-01-08', score: 88, contact: '待联系', nextStep: '准备尽调材料' },
    { id: 3, name: '中船重工710研究所', industry: '装备制造', area: '伍家岗区', status: 'contacted', addTime: '2026-01-05', score: 95, contact: '已联系', nextStep: '等待回复' },
    { id: 4, name: '宜昌三峡制药有限公司', industry: '生物医药', area: '夷陵区', status: 'new', addTime: '2026-01-12', score: 85, contact: '待联系', nextStep: '初步沟通' },
    { id: 5, name: '湖北兴发化工集团', industry: '绿色化工', area: '猇亭区', status: 'tracking', addTime: '2026-01-03', score: 90, contact: '已联系', nextStep: '项目对接' },
  ],
  talent: [
    { id: 1, name: '张明远', title: '教授/博导', field: '基因编辑', institution: '北京大学', level: '顶尖', addTime: '2026-01-11', status: 'contacting', willingness: '有意向' },
    { id: 2, name: '李华英', title: '研究员', field: '新材料', institution: '中科院武汉分院', level: '高端', addTime: '2026-01-09', status: 'negotiating', willingness: '考虑中' },
    { id: 3, name: '王志强', title: '首席科学家', field: '智能制造', institution: '华中科技大学', level: '顶尖', addTime: '2026-01-07', status: 'new', willingness: '有意向' },
    { id: 4, name: '陈小红', title: '副教授', field: '生物制药', institution: '武汉大学', level: '高端', addTime: '2026-01-05', status: 'settled', willingness: '已落地' },
  ],
  funding: [
    { id: 1, name: '科技成果转化贷', type: '信贷', institution: '中国银行宜昌分行', enterprise: '某生物科技公司', amount: '500万', status: 'applying', addTime: '2026-01-10' },
    { id: 2, name: '深创投', type: 'VC', institution: '深圳创新投资集团', enterprise: '某新材料公司', amount: '2000万', status: 'negotiating', addTime: '2026-01-08' },
    { id: 3, name: '绿色信贷', type: '信贷', institution: '农业银行宜昌分行', enterprise: '某清洁能源公司', amount: '800万', status: 'approved', addTime: '2026-01-05' },
  ],
  policy: [
    { id: 1, name: '宜昌市促进生物医药产业发展若干政策', department: '宜昌市科技局', deadline: '2026-03-31', enterprise: '人福医药', status: 'preparing', addTime: '2026-01-12' },
    { id: 2, name: '湖北省科技创新专项资金', department: '湖北省科技厅', deadline: '2026-02-28', enterprise: '三峡新材', status: 'submitted', addTime: '2026-01-10' },
    { id: 3, name: '高层次人才引进计划', department: '宜昌市人社局', deadline: '2026-04-15', enterprise: '中船710所', status: 'reviewing', addTime: '2026-01-08' },
  ],
};

const ListCenter: React.FC = () => {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState('investment');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerType, setDrawerType] = useState<string>('');

  const statusMap: Record<string, { color: string; text: string }> = {
    new: { color: 'blue', text: '新增' },
    tracking: { color: 'processing', text: '跟进中' },
    evaluating: { color: 'orange', text: '评估中' },
    contacted: { color: 'cyan', text: '已联系' },
    contacting: { color: 'processing', text: '联系中' },
    negotiating: { color: 'orange', text: '洽谈中' },
    settled: { color: 'success', text: '已落地' },
    applying: { color: 'processing', text: '申请中' },
    approved: { color: 'success', text: '已通过' },
    preparing: { color: 'default', text: '准备中' },
    submitted: { color: 'processing', text: '已提交' },
    reviewing: { color: 'orange', text: '审核中' },
  };

  const investmentColumns = [
    { title: '企业名称', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => { setSelectedItem(record); setDrawerType('investment'); setDrawerVisible(true); }}>{text}</a> },
    { title: '所属产业', dataIndex: 'industry', key: 'industry', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: '所在区域', dataIndex: 'area', key: 'area' },
    { title: '创新评分', dataIndex: 'score', key: 'score', render: (score: number) => <Tag color={score >= 90 ? 'green' : score >= 80 ? 'blue' : 'orange'}>{score}分</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Badge status={statusMap[status]?.color as any} text={statusMap[status]?.text} /> },
    { title: '加入时间', dataIndex: 'addTime', key: 'addTime' },
    { title: '下一步', dataIndex: 'nextStep', key: 'nextStep', render: (text: string) => <Text type="secondary">{text}</Text> },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedItem(record); setDrawerType('investment'); setDrawerVisible(true); }}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('编辑跟进记录')}>跟进</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: '确认移除', content: `确定将"${record.name}"从清单中移除吗？`, onOk: () => message.success('已移除') })}>移除</Button>
        </Space>
      ),
    },
  ];

  const talentColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <Space><Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#2468F2' }} /><a onClick={() => { setSelectedItem(record); setDrawerType('talent'); setDrawerVisible(true); }}>{text}</a></Space> },
    { title: '职称', dataIndex: 'title', key: 'title' },
    { title: '研究方向', dataIndex: 'field', key: 'field', render: (text: string) => <Tag color="purple">{text}</Tag> },
    { title: '所属机构', dataIndex: 'institution', key: 'institution' },
    { title: '级别', dataIndex: 'level', key: 'level', render: (level: string) => <Tag color={level === '顶尖' ? 'gold' : 'blue'}>{level}</Tag> },
    { title: '回流意愿', dataIndex: 'willingness', key: 'willingness', render: (w: string) => <Tag color={w === '有意向' ? 'green' : w === '已落地' ? 'success' : 'orange'}>{w}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Badge status={statusMap[status]?.color as any} text={statusMap[status]?.text} /> },
    { title: '加入时间', dataIndex: 'addTime', key: 'addTime' },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedItem(record); setDrawerType('talent'); setDrawerVisible(true); }}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('编辑联系记录')}>联系</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: '确认移除', content: `确定将"${record.name}"从清单中移除吗？`, onOk: () => message.success('已移除') })}>移除</Button>
        </Space>
      ),
    },
  ];

  const fundingColumns = [
    { title: '融资产品/机构', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => { setSelectedItem(record); setDrawerType('funding'); setDrawerVisible(true); }}>{text}</a> },
    { title: '类型', dataIndex: 'type', key: 'type', render: (text: string) => <Tag color={text === '信贷' ? 'blue' : text === 'VC' ? 'purple' : 'green'}>{text}</Tag> },
    { title: '承办机构', dataIndex: 'institution', key: 'institution' },
    { title: '对接企业', dataIndex: 'enterprise', key: 'enterprise' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (text: string) => <Text strong style={{ color: '#fa8c16' }}>{text}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Badge status={statusMap[status]?.color as any} text={statusMap[status]?.text} /> },
    { title: '加入时间', dataIndex: 'addTime', key: 'addTime' },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedItem(record); setDrawerType('funding'); setDrawerVisible(true); }}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('添加跟进记录')}>跟进</Button>
        </Space>
      ),
    },
  ];

  const policyColumns = [
    { title: '政策名称', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <a onClick={() => { setSelectedItem(record); setDrawerType('policy'); setDrawerVisible(true); }}>{text}</a>, width: 280 },
    { title: '发布部门', dataIndex: 'department', key: 'department' },
    { title: '申报对象', dataIndex: 'enterprise', key: 'enterprise' },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', render: (text: string) => <Tag icon={<ClockCircleOutlined />} color="orange">{text}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Badge status={statusMap[status]?.color as any} text={statusMap[status]?.text} /> },
    { title: '加入时间', dataIndex: 'addTime', key: 'addTime' },
    {
      title: '操作', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedItem(record); setDrawerType('policy'); setDrawerVisible(true); }}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('更新申报进度')}>更新</Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'investment', label: <><BankOutlined /> 招商候选 <Badge count={listData.investment.length} style={{ marginLeft: 8 }} /></>, children: <Table dataSource={listData.investment} columns={investmentColumns} rowKey="id" pagination={false} /> },
    { key: 'talent', label: <><TeamOutlined /> 引才对象 <Badge count={listData.talent.length} style={{ marginLeft: 8 }} /></>, children: <Table dataSource={listData.talent} columns={talentColumns} rowKey="id" pagination={false} /> },
    { key: 'funding', label: <><DollarOutlined /> 融资对接 <Badge count={listData.funding.length} style={{ marginLeft: 8 }} /></>, children: <Table dataSource={listData.funding} columns={fundingColumns} rowKey="id" pagination={false} /> },
    { key: 'policy', label: <><FileTextOutlined /> 申报对象 <Badge count={listData.policy.length} style={{ marginLeft: 8 }} /></>, children: <Table dataSource={listData.policy} columns={policyColumns} rowKey="id" pagination={false} /> },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 - 连体设计 */}
      <div style={{
        display: 'flex',
        marginBottom: 24,
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(240,245,255,0.8) 0%, rgba(248,249,254,0.6) 40%, rgba(245,240,255,0.8) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 2px 12px rgba(36,104,242,0.05)',
        overflow: 'hidden',
      }}>
        {[
          { title: '招商候选', desc: '企业跟进、实地考察、项目对接', value: listData.investment.length, unit: '家', icon: <BankOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#2468F2' },
          { title: '引才对象', desc: '人才联络、意向沟通、落地跟踪', value: listData.talent.length, unit: '人', icon: <TeamOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#52c41a' },
          { title: '融资对接', desc: '融资产品匹配、机构对接、进度管理', value: listData.funding.length, unit: '笔', icon: <DollarOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#fa8c16' },
          { title: '申报对象', desc: '政策匹配、材料准备、申报跟踪', value: listData.policy.length, unit: '项', icon: <FileTextOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#eb2f96' },
        ].map((item, idx, arr) => (
          <div key={idx} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '18px 24px',
            borderRight: idx < arr.length - 1 ? '1px solid rgba(36,104,242,0.08)' : 'none',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 3px 8px ${item.color}30`,
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{item.title}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: item.color }}>共{item.value}<span style={{ fontSize: 13, fontWeight: 500 }}>{item.unit}</span></span>
              </div>
              <div style={{ fontSize: 12, color: '#696868', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 清单内容 */}
      <Card
        title={<><StarOutlined style={{ color: '#faad14' }} /> 我的清单</>}
        extra={
          <Space>
            <Input.Search placeholder="搜索清单" style={{ width: 200 }} allowClear />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="new">新增</Select.Option>
              <Select.Option value="tracking">跟进中</Select.Option>
              <Select.Option value="done">已完成</Select.Option>
            </Select>
            <Button icon={<ExportOutlined />} onClick={() => message.success('清单导出成功')}>导出Excel</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('请在各业务页面将对象加入清单')}>添加对象</Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={drawerType === 'investment' ? '企业详情' : drawerType === 'talent' ? '人才详情' : drawerType === 'funding' ? '融资对接详情' : '政策申报详情'}
        width={520}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => message.info('编辑跟进记录')}>添加跟进</Button>
            <Button type="primary" icon={<ExportOutlined />} onClick={() => { message.loading('正在生成报告...', 1); setTimeout(() => message.success('报告生成完成'), 1000); }}>生成报告</Button>
          </Space>
        }
      >
        {selectedItem && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="名称" span={2}>{selectedItem.name}</Descriptions.Item>
              {drawerType === 'investment' && (
                <>
                  <Descriptions.Item label="所属产业">{selectedItem.industry}</Descriptions.Item>
                  <Descriptions.Item label="所在区域">{selectedItem.area}</Descriptions.Item>
                  <Descriptions.Item label="创新评分"><Tag color="green">{selectedItem.score}分</Tag></Descriptions.Item>
                  <Descriptions.Item label="联系状态">{selectedItem.contact}</Descriptions.Item>
                  <Descriptions.Item label="下一步" span={2}>{selectedItem.nextStep}</Descriptions.Item>
                </>
              )}
              {drawerType === 'talent' && (
                <>
                  <Descriptions.Item label="职称">{selectedItem.title}</Descriptions.Item>
                  <Descriptions.Item label="级别"><Tag color="gold">{selectedItem.level}</Tag></Descriptions.Item>
                  <Descriptions.Item label="研究方向">{selectedItem.field}</Descriptions.Item>
                  <Descriptions.Item label="回流意愿"><Tag color="green">{selectedItem.willingness}</Tag></Descriptions.Item>
                  <Descriptions.Item label="所属机构" span={2}>{selectedItem.institution}</Descriptions.Item>
                </>
              )}
              {drawerType === 'funding' && (
                <>
                  <Descriptions.Item label="类型"><Tag>{selectedItem.type}</Tag></Descriptions.Item>
                  <Descriptions.Item label="金额"><Text strong style={{ color: '#fa8c16' }}>{selectedItem.amount}</Text></Descriptions.Item>
                  <Descriptions.Item label="承办机构" span={2}>{selectedItem.institution}</Descriptions.Item>
                  <Descriptions.Item label="对接企业" span={2}>{selectedItem.enterprise}</Descriptions.Item>
                </>
              )}
              {drawerType === 'policy' && (
                <>
                  <Descriptions.Item label="发布部门" span={2}>{selectedItem.department}</Descriptions.Item>
                  <Descriptions.Item label="截止日期"><Tag color="orange">{selectedItem.deadline}</Tag></Descriptions.Item>
                  <Descriptions.Item label="申报对象">{selectedItem.enterprise}</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="加入时间">{selectedItem.addTime}</Descriptions.Item>
              <Descriptions.Item label="当前状态"><Badge status={statusMap[selectedItem.status]?.color as any} text={statusMap[selectedItem.status]?.text} /></Descriptions.Item>
            </Descriptions>

            <Card size="small" title="跟进记录" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={[
                  { time: '2026-01-13 14:30', content: '已发送合作意向函', user: '张三', status: 'done' },
                  { time: '2026-01-11 10:00', content: '初步电话沟通，对方表示有兴趣', user: '李四', status: 'done' },
                  { time: '2026-01-10 09:00', content: '加入清单，开始跟进', user: '系统', status: 'done' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      {item.status === 'done' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <SyncOutlined spin style={{ color: '#1890ff' }} />}
                      <div>
                        <Text>{item.content}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.time} · {item.user}</Text>
                      </div>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ListCenter;
