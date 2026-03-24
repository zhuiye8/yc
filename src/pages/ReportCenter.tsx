/**
 * @input antd 组件, @ant-design/icons
 * @output { ReportCenter } 报告中心组件
 * @position 业务页面，六类报告管理 + 预览/下载/删除（数据内联，无 mock 导入）
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Table, Button, Space, Tag, Badge, Typography, Input, Select, Drawer, List, App, Statistic, Divider } from 'antd';
import {
  FileSearchOutlined,
  BankOutlined,
  TeamOutlined,
  ExperimentOutlined,
  DollarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// 模拟报告数据
const reportData = {
  industry: [
    { id: 1, name: '生物医药产业链诊断报告', type: '产业研究', status: 'completed', createTime: '2026-01-12 14:30', size: '2.8MB', format: 'PDF', pages: 45, chain: '生物医药' },
    { id: 2, name: '新材料产业链全景分析报告', type: '产业研究', status: 'completed', createTime: '2026-01-10 09:15', size: '3.2MB', format: 'PDF', pages: 52, chain: '新材料' },
    { id: 3, name: '装备制造产业招商策略报告', type: '招商报告', status: 'completed', createTime: '2026-01-08 16:20', size: '1.9MB', format: 'Word', pages: 28, chain: '装备制造' },
    { id: 4, name: '清洁能源产业链缺口分析', type: '产业研究', status: 'generating', createTime: '2026-01-13 10:00', size: '-', format: 'PDF', pages: '-', chain: '清洁能源' },
  ],
  enterprise: [
    { id: 1, name: '宜昌人福药业企业尽调报告', type: '尽调报告', status: 'completed', createTime: '2026-01-11 11:30', size: '4.5MB', format: 'PDF', pages: 68, enterprise: '人福医药' },
    { id: 2, name: '三峡新材股份投资价值分析', type: '尽调报告', status: 'completed', createTime: '2026-01-09 14:00', size: '3.8MB', format: 'PDF', pages: 55, enterprise: '三峡新材' },
    { id: 3, name: '兴发集团企业画像报告', type: '企业画像', status: 'completed', createTime: '2026-01-07 09:45', size: '2.1MB', format: 'Word', pages: 32, enterprise: '兴发集团' },
  ],
  talent: [
    { id: 1, name: '生物医药领域引才建议报告', type: '引才建议', status: 'completed', createTime: '2026-01-10 16:30', size: '1.8MB', format: 'PDF', pages: 24, field: '生物医药' },
    { id: 2, name: '新材料领域人才供需分析', type: '供需分析', status: 'completed', createTime: '2026-01-08 10:15', size: '2.2MB', format: 'PDF', pages: 36, field: '新材料' },
    { id: 3, name: '宜昌籍高端人才回流可行性分析', type: '专题分析', status: 'completed', createTime: '2026-01-05 14:00', size: '1.5MB', format: 'Word', pages: 18, field: '综合' },
  ],
  tech: [
    { id: 1, name: '基因编辑技术攻关建议报告', type: '攻关建议', status: 'completed', createTime: '2026-01-11 09:00', size: '2.6MB', format: 'PDF', pages: 42, tech: '基因编辑' },
    { id: 2, name: '固态电池技术发展趋势分析', type: '技术分析', status: 'completed', createTime: '2026-01-09 15:30', size: '3.1MB', format: 'PDF', pages: 48, tech: '固态电池' },
    { id: 3, name: '产学研合作建议报告', type: '合作建议', status: 'completed', createTime: '2026-01-06 11:00', size: '1.9MB', format: 'Word', pages: 26, tech: '综合' },
  ],
  funding: [
    { id: 1, name: '某生物科技公司融资对接报告', type: '融资报告', status: 'completed', createTime: '2026-01-12 10:30', size: '1.6MB', format: 'PDF', pages: 22, enterprise: '某生物科技' },
    { id: 2, name: '融资工具匹配清单', type: '对接清单', status: 'completed', createTime: '2026-01-10 14:00', size: '0.8MB', format: 'Excel', pages: '-', enterprise: '综合' },
  ],
  policy: [
    { id: 1, name: '科技创新专项资金申报建议', type: '申报建议', status: 'completed', createTime: '2026-01-11 16:00', size: '1.4MB', format: 'PDF', pages: 18, policy: '科技创新专项' },
    { id: 2, name: '生物医药产业政策解读报告', type: '政策解读', status: 'completed', createTime: '2026-01-08 09:30', size: '2.0MB', format: 'PDF', pages: 32, policy: '生物医药政策' },
  ],
};

const ReportCenter: React.FC = () => {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const allReports = [
    ...reportData.industry.map(r => ({ ...r, category: '产业' })),
    ...reportData.enterprise.map(r => ({ ...r, category: '企业' })),
    ...reportData.talent.map(r => ({ ...r, category: '人才' })),
    ...reportData.tech.map(r => ({ ...r, category: '技术' })),
    ...reportData.funding.map(r => ({ ...r, category: '资金' })),
    ...reportData.policy.map(r => ({ ...r, category: '政策' })),
  ].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'Word': return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'Excel': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      default: return <FileTextOutlined />;
    }
  };

  const columns = [
    {
      title: '报告名称', dataIndex: 'name', key: 'name', width: 320,
      render: (text: string, record: any) => (
        <Space>
          {getFormatIcon(record.format)}
          <a onClick={() => { setSelectedReport(record); setDrawerVisible(true); }}>{text}</a>
        </Space>
      ),
    },
    { title: '类型', dataIndex: 'type', key: 'type', render: (text: string) => <Tag>{text}</Tag> },
    { title: '分类', dataIndex: 'category', key: 'category', render: (text: string) => {
      const colorMap: Record<string, string> = { '产业': 'blue', '企业': 'cyan', '人才': 'green', '技术': 'purple', '资金': 'orange', '政策': 'magenta' };
      return <Tag color={colorMap[text]}>{text}</Tag>;
    }},
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string) => status === 'completed' ? <Badge status="success" text="已完成" /> : <Badge status="processing" text="生成中" />,
    },
    { title: '生成时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '大小', dataIndex: 'size', key: 'size' },
    { title: '页数', dataIndex: 'pages', key: 'pages' },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedReport(record); setDrawerVisible(true); }}>预览</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} disabled={record.status !== 'completed'} onClick={() => message.success(`正在下载: ${record.name}`)}>下载</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: '确认删除', content: `确定删除报告"${record.name}"吗？`, onOk: () => message.success('已删除') })}>删除</Button>
        </Space>
      ),
    },
  ];

  const getDataSource = () => {
    switch (activeTab) {
      case 'industry': return reportData.industry.map(r => ({ ...r, category: '产业' }));
      case 'enterprise': return reportData.enterprise.map(r => ({ ...r, category: '企业' }));
      case 'talent': return reportData.talent.map(r => ({ ...r, category: '人才' }));
      case 'tech': return reportData.tech.map(r => ({ ...r, category: '技术' }));
      case 'funding': return reportData.funding.map(r => ({ ...r, category: '资金' }));
      case 'policy': return reportData.policy.map(r => ({ ...r, category: '政策' }));
      default: return allReports;
    }
  };

  const tabItems = [
    { key: 'all', label: <>全部 <Badge count={allReports.length} style={{ marginLeft: 4 }} /></> },
    { key: 'industry', label: <><BankOutlined /> 产业报告 <Badge count={reportData.industry.length} style={{ marginLeft: 4 }} /></> },
    { key: 'enterprise', label: <>企业报告 <Badge count={reportData.enterprise.length} style={{ marginLeft: 4 }} /></> },
    { key: 'talent', label: <><TeamOutlined /> 人才报告 <Badge count={reportData.talent.length} style={{ marginLeft: 4 }} /></> },
    { key: 'tech', label: <><ExperimentOutlined /> 技术报告 <Badge count={reportData.tech.length} style={{ marginLeft: 4 }} /></> },
    { key: 'funding', label: <><DollarOutlined /> 融资报告 <Badge count={reportData.funding.length} style={{ marginLeft: 4 }} /></> },
    { key: 'policy', label: <><FileTextOutlined /> 政策报告 <Badge count={reportData.policy.length} style={{ marginLeft: 4 }} /></> },
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
          { title: '报告总数', desc: '全部已生成的分析报告', value: allReports.length, unit: '份', icon: <FileSearchOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#2468F2' },
          { title: '产业报告', desc: '产业链诊断、招商策略分析', value: reportData.industry.length, unit: '份', icon: <BankOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#1890ff' },
          { title: '企业报告', desc: '企业尽调、画像、投资分析', value: reportData.enterprise.length, unit: '份', icon: <DollarOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#13c2c2' },
          { title: '人才报告', desc: '引才建议、人才供需分析', value: reportData.talent.length, unit: '份', icon: <TeamOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#52c41a' },
          { title: '技术报告', desc: '技术攻关、趋势、合作建议', value: reportData.tech.length, unit: '份', icon: <ExperimentOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#722ed1' },
          { title: '本周新增', desc: '近7天内新生成报告数', value: 5, unit: '份', icon: <FileTextOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#fa8c16' },
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

      {/* 报告列表 */}
      <Card
        title={<><FileSearchOutlined style={{ color: '#722ed1' }} /> 报告中心</>}
        extra={
          <Space>
            <Input.Search placeholder="搜索报告" style={{ width: 200 }} allowClear />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部格式</Select.Option>
              <Select.Option value="pdf">PDF</Select.Option>
              <Select.Option value="word">Word</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => message.success('列表已刷新')}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('请在各业务页面生成报告')}>生成报告</Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Table dataSource={getDataSource()} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* 报告预览抽屉 */}
      <Drawer
        title="报告预览"
        width={640}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => { message.loading('正在重新生成...', 2); setTimeout(() => message.success('报告重新生成完成'), 2000); }}>重新生成</Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => message.success(`正在下载: ${selectedReport?.name}`)}>下载报告</Button>
          </Space>
        }
      >
        {selectedReport && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>{getFormatIcon(selectedReport.format)}</div>
              <Title level={4}>{selectedReport.name}</Title>
              <Space>
                <Tag>{selectedReport.type}</Tag>
                <Tag color="blue">{selectedReport.category}</Tag>
                {selectedReport.status === 'completed' ? <Badge status="success" text="已完成" /> : <Badge status="processing" text="生成中" />}
              </Space>
            </div>

            <Divider />

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}><Statistic title="文件大小" value={selectedReport.size} /></Col>
              <Col span={8}><Statistic title="页数" value={selectedReport.pages} /></Col>
              <Col span={8}><Statistic title="格式" value={selectedReport.format} /></Col>
            </Row>

            <Card size="small" title="报告大纲" style={{ marginBottom: 16 }}>
              <List
                size="small"
                dataSource={[
                  { title: '一、概述与背景', desc: '分析对象基本情况与研究背景' },
                  { title: '二、现状分析', desc: '当前发展态势与关键指标分析' },
                  { title: '三、问题与挑战', desc: '存在的问题、短板与风险点' },
                  { title: '四、对策建议', desc: '针对性建议与行动方案' },
                  { title: '五、附录', desc: '数据来源、证据链与参考资料' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta title={item.title} description={item.desc} />
                  </List.Item>
                )}
              />
            </Card>

            <Card size="small" title="生成信息">
              <Paragraph>
                <Text type="secondary">生成时间：</Text>{selectedReport.createTime}<br />
                <Text type="secondary">生成耗时：</Text>约 {Math.floor(Math.random() * 30) + 10} 秒<br />
                <Text type="secondary">数据时效：</Text>截至 2026年1月13日<br />
                <Text type="secondary">生成人员：</Text>系统自动生成
              </Paragraph>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ReportCenter;
