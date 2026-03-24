/**
 * @input antd 组件, @ant-design/icons
 * @output { AlertCenter } 预警中心组件
 * @position 业务页面，多维预警（政策/企业/产业/人才/技术）+ 规则管理 + 已读/未读筛选（数据内联）
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Badge, Typography, Input, Select, Drawer, List, App, Switch, Divider, Modal } from 'antd';
import {
  AlertOutlined,
  BellOutlined,
  BankOutlined,
  TeamOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// 模拟预警数据
const alertData = {
  policy: [
    { id: 1, title: '政策申报截止提醒', content: '「宜昌市促进生物医药产业发展若干政策」将于7天后截止申报', type: '到期提醒', level: 'warning', time: '2026-01-13 09:00', read: false, category: 'policy' },
    { id: 2, title: '新政策发布通知', content: '「湖北省科技型中小企业评价办法」已正式发布，符合申报条件', type: '新政触达', level: 'info', time: '2026-01-12 14:30', read: false, category: 'policy' },
    { id: 3, title: '申报窗口期开启', content: '「高新技术企业认定」2026年第一批申报窗口已开启', type: '窗口期提醒', level: 'success', time: '2026-01-11 10:00', read: true, category: 'policy' },
  ],
  enterprise: [
    { id: 4, title: '企业风险预警', content: '关注企业「XX科技有限公司」出现经营异常记录', type: '风险预警', level: 'danger', time: '2026-01-12 16:00', read: false, category: 'enterprise' },
    { id: 5, title: '企业迁移提示', content: '目标招商企业「YY新材料」注册地址发生变更', type: '动态提醒', level: 'warning', time: '2026-01-10 11:30', read: true, category: 'enterprise' },
  ],
  industry: [
    { id: 6, title: '产业链短板变化', content: '生物医药产业链「基因检测」环节缺链程度加深', type: '短板预警', level: 'warning', time: '2026-01-11 15:00', read: false, category: 'industry' },
    { id: 7, title: '产业热点变化', content: '「固态电池」技术热度持续上升，建议关注相关企业', type: '热点提醒', level: 'info', time: '2026-01-09 09:30', read: true, category: 'industry' },
  ],
  talent: [
    { id: 8, title: '人才动态提醒', content: '引才对象「张明远教授」发表重要研究成果', type: '动态提醒', level: 'info', time: '2026-01-10 14:00', read: true, category: 'talent' },
    { id: 9, title: '新增高端人才', content: '3位新材料领域顶尖人才入库，符合引才需求', type: '新增提醒', level: 'success', time: '2026-01-08 16:30', read: true, category: 'talent' },
  ],
  tech: [
    { id: 10, title: '技术缺口扩大', content: '「高端光刻胶」技术缺口与全国差距进一步扩大', type: '缺口预警', level: 'warning', time: '2026-01-09 10:00', read: true, category: 'tech' },
    { id: 11, title: '专利到期提醒', content: '3件核心专利将于90天内到期，请关注续费', type: '到期提醒', level: 'warning', time: '2026-01-07 11:00', read: true, category: 'tech' },
  ],
};

// 预警规则数据
const alertRules = [
  { id: 1, name: '政策申报截止提醒', type: '政策', condition: '截止前7天', enabled: true, createTime: '2026-01-01' },
  { id: 2, name: '新政策发布通知', type: '政策', condition: '符合条件的新政策', enabled: true, createTime: '2026-01-01' },
  { id: 3, name: '企业风险预警', type: '企业', condition: '出现经营异常/处罚记录', enabled: true, createTime: '2026-01-01' },
  { id: 4, name: '产业链短板变化', type: '产业', condition: '缺链程度变化', enabled: true, createTime: '2026-01-01' },
  { id: 5, name: '人才动态提醒', type: '人才', condition: '关注人才有新动态', enabled: false, createTime: '2026-01-01' },
  { id: 6, name: '技术热点变化', type: '技术', condition: '热度排名变化≥3位', enabled: true, createTime: '2026-01-01' },
];

const AlertCenter: React.FC = () => {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [rules, setRules] = useState(alertRules);

  const allAlerts = [
    ...alertData.policy,
    ...alertData.enterprise,
    ...alertData.industry,
    ...alertData.talent,
    ...alertData.tech,
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const unreadCount = allAlerts.filter(a => !a.read).length;

  const getLevelConfig = (level: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      danger: { color: 'red', icon: <ExclamationCircleOutlined />, text: '高危' },
      warning: { color: 'orange', icon: <ExclamationCircleOutlined />, text: '警告' },
      info: { color: 'blue', icon: <BellOutlined />, text: '提示' },
      success: { color: 'green', icon: <CheckCircleOutlined />, text: '正常' },
    };
    return config[level] || config.info;
  };

  const getCategoryConfig = (category: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      policy: { color: 'magenta', icon: <FileTextOutlined />, text: '政策' },
      enterprise: { color: 'cyan', icon: <BankOutlined />, text: '企业' },
      industry: { color: 'blue', icon: <BankOutlined />, text: '产业' },
      talent: { color: 'green', icon: <TeamOutlined />, text: '人才' },
      tech: { color: 'purple', icon: <ExperimentOutlined />, text: '技术' },
    };
    return config[category] || config.policy;
  };

  const columns = [
    {
      title: '预警内容', dataIndex: 'title', key: 'title', width: 280,
      render: (text: string, record: any) => (
        <Space>
          {!record.read && <Badge status="processing" />}
          <a onClick={() => { setSelectedAlert(record); setDrawerVisible(true); }} style={{ fontWeight: record.read ? 'normal' : 600 }}>{text}</a>
        </Space>
      ),
    },
    {
      title: '级别', dataIndex: 'level', key: 'level', width: 100,
      render: (level: string) => {
        const config = getLevelConfig(level);
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: '分类', dataIndex: 'category', key: 'category', width: 100,
      render: (category: string) => {
        const config = getCategoryConfig(category);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    { title: '类型', dataIndex: 'type', key: 'type', render: (text: string) => <Tag>{text}</Tag> },
    { title: '时间', dataIndex: 'time', key: 'time' },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedAlert(record); setDrawerVisible(true); }}>查看</Button>
          <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => message.success('已标记为已读')}>已读</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: '确认删除', content: '确定删除该预警吗？', onOk: () => message.success('已删除') })}>删除</Button>
        </Space>
      ),
    },
  ];

  const getDataSource = () => {
    switch (activeTab) {
      case 'policy': return alertData.policy;
      case 'enterprise': return alertData.enterprise;
      case 'industry': return alertData.industry;
      case 'talent': return alertData.talent;
      case 'tech': return alertData.tech;
      case 'unread': return allAlerts.filter(a => !a.read);
      default: return allAlerts;
    }
  };

  const tabItems = [
    { key: 'all', label: <>全部 <Badge count={allAlerts.length} style={{ marginLeft: 4 }} /></> },
    { key: 'unread', label: <>未读 <Badge count={unreadCount} style={{ marginLeft: 4, backgroundColor: '#ff4d4f' }} /></> },
    { key: 'policy', label: <><FileTextOutlined /> 政策</> },
    { key: 'enterprise', label: <>企业</> },
    { key: 'industry', label: <><BankOutlined /> 产业</> },
    { key: 'talent', label: <><TeamOutlined /> 人才</> },
    { key: 'tech', label: <><ExperimentOutlined /> 技术</> },
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
          { title: '预警总数', desc: '全部预警通知汇总', value: allAlerts.length, unit: '条', icon: <AlertOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#2468F2' },
          { title: '未读预警', desc: '待处理的未读通知', value: unreadCount, unit: '条', icon: <BellOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#ff4d4f' },
          { title: '高危预警', desc: '需立即关注的紧急预警', value: allAlerts.filter(a => a.level === 'danger').length, unit: '条', icon: <ExclamationCircleOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#ff4d4f' },
          { title: '警告预警', desc: '需关注的风险提示', value: allAlerts.filter(a => a.level === 'warning').length, unit: '条', icon: <ExclamationCircleOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#fa8c16' },
          { title: '启用规则', desc: '当前激活的预警规则', value: rules.filter(r => r.enabled).length, unit: '条', icon: <SettingOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#52c41a' },
          { title: '今日新增', desc: '今天产生的新预警', value: 3, unit: '条', icon: <ThunderboltOutlined style={{ fontSize: 20, color: '#fff' }} />, color: '#722ed1' },
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

      {/* 预警列表 */}
      <Card
        title={<><AlertOutlined style={{ color: '#ff4d4f' }} /> 预警中心</>}
        extra={
          <Space>
            <Input.Search placeholder="搜索预警" style={{ width: 200 }} allowClear />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部级别</Select.Option>
              <Select.Option value="danger">高危</Select.Option>
              <Select.Option value="warning">警告</Select.Option>
              <Select.Option value="info">提示</Select.Option>
            </Select>
            <Button icon={<CheckCircleOutlined />} onClick={() => message.success('已将全部预警标记为已读')}>全部已读</Button>
            <Button icon={<SettingOutlined />} onClick={() => setRulesModalVisible(true)}>预警规则</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setRulesModalVisible(true)}>创建预警</Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Table dataSource={getDataSource()} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* 预警详情抽屉 */}
      <Drawer
        title="预警详情"
        width={520}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<CheckCircleOutlined />} onClick={() => message.success('已标记为已读')}>标记已读</Button>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => message.info('正在跳转到相关页面')}>立即处理</Button>
          </Space>
        }
      >
        {selectedAlert && (
          <>
            <div style={{ marginBottom: 24 }}>
              <Space style={{ marginBottom: 12 }}>
                <Tag color={getLevelConfig(selectedAlert.level).color} icon={getLevelConfig(selectedAlert.level).icon}>
                  {getLevelConfig(selectedAlert.level).text}
                </Tag>
                <Tag color={getCategoryConfig(selectedAlert.category).color}>
                  {getCategoryConfig(selectedAlert.category).text}
                </Tag>
                <Tag>{selectedAlert.type}</Tag>
              </Space>
              <Title level={4}>{selectedAlert.title}</Title>
              <Paragraph>{selectedAlert.content}</Paragraph>
              <Text type="secondary"><ClockCircleOutlined style={{ marginRight: 8 }} />{selectedAlert.time}</Text>
            </div>

            <Divider />

            <Card size="small" title="相关对象" style={{ marginBottom: 16 }}>
              <List
                size="small"
                dataSource={[
                  { label: '关联政策', value: '宜昌市促进生物医药产业发展若干政策' },
                  { label: '关联企业', value: '宜昌人福药业有限公司' },
                  { label: '关联产业链', value: '生物医药' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text type="secondary">{item.label}：</Text>
                    <a>{item.value}</a>
                  </List.Item>
                )}
              />
            </Card>

            <Card size="small" title="建议操作">
              <List
                size="small"
                dataSource={[
                  '查看政策详情，确认申报条件',
                  '准备申报材料，联系相关企业',
                  '设置日程提醒，跟进申报进度',
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <Badge count={index + 1} style={{ backgroundColor: '#2468F2', marginRight: 8 }} size="small" />
                    {item}
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Drawer>

      {/* 预警规则管理弹窗 */}
      <Modal
        title={<><SettingOutlined /> 预警规则管理</>}
        open={rulesModalVisible}
        onCancel={() => setRulesModalVisible(false)}
        width={700}
        footer={[
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => message.success('新规则创建成功')}>新建规则</Button>,
          <Button key="close" onClick={() => setRulesModalVisible(false)}>关闭</Button>,
        ]}
      >
        <Table
          dataSource={rules}
          rowKey="id"
          pagination={false}
          columns={[
            { title: '规则名称', dataIndex: 'name', key: 'name' },
            { title: '分类', dataIndex: 'type', key: 'type', render: (text: string) => <Tag>{text}</Tag> },
            { title: '触发条件', dataIndex: 'condition', key: 'condition' },
            { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
            {
              title: '状态', dataIndex: 'enabled', key: 'enabled',
              render: (enabled: boolean, record: any) => (
                <Switch
                  checked={enabled}
                  size="small"
                  onChange={(checked) => {
                    setRules(rules.map(r => r.id === record.id ? { ...r, enabled: checked } : r));
                    message.success(checked ? '规则已启用' : '规则已禁用');
                  }}
                />
              ),
            },
            {
              title: '操作', key: 'action',
              render: (_: any, record: any) => (
                <Space>
                  <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => modal.confirm({ title: '确认删除', content: `确定删除规则"${record.name}"吗？`, onOk: () => message.success('规则已删除') })}>删除</Button>
                </Space>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default AlertCenter;
