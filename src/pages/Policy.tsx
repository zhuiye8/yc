/**
 * @input antd 组件, { useNavigate } from 'react-router-dom', { policies } from '../mock/data'
 * @output { Policy } 政策页组件
 * @position 业务页面，政策搜索列表 + 到期预警 + 订阅开关 + 闭环输出入口
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Card, Row, Col, Tag, Table, Button, Space, Input, Typography, List, Descriptions, Badge, Drawer, Collapse, Timeline, Alert, Switch, Divider, App, Cascader } from 'antd';
import {
  PlusOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  StarOutlined,
  SearchOutlined,
  CalendarOutlined,
  RocketOutlined,
  CaretRightOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { policies } from '../mock/data';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Policy: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const hotTags = ['人才引进', '科技创新', '产业扶持', '税收优惠', '创业补贴', '专精特新', '高新企业', '绿色发展'];
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<typeof policies[0] | null>(null);

  // 政策列表列
  const columns = [
    {
      title: '政策标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: typeof policies[0]) => (
        <a onClick={() => { setSelectedPolicy(record); setDrawerVisible(true); }}>
          {record.status === 'active' && <Badge status="success" style={{ marginRight: 8 }} />}
          {text}
        </a>
      ),
    },
    {
      title: '发布部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 180,
      render: (text: string) => {
        const isNear = text !== '长期有效' && new Date(text) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const daysLeft = text !== '长期有效' ? Math.ceil((new Date(text).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {isNear && <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />}
            <Text type={isNear ? 'warning' : undefined}>{text}</Text>
            {daysLeft !== null && <Text type="secondary" style={{ marginLeft: 4, fontSize: 16 }}>({daysLeft}天)</Text>}
          </span>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        const colorMap: Record<string, string> = { '产业': 'blue', '人才': 'green', '技术': 'purple', '资金': 'orange' };
        return <Tag color={colorMap[text]}>{text}</Tag>;
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: typeof policies[0]) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setSelectedPolicy(record); setDrawerVisible(true); }}>查看详情</Button>
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => {
            message.info('请在右侧"政策匹配"区域选择企业进行匹配');
          }}>匹配对象</Button>
        </Space>
      ),
    },
  ];

  // 即将到期政策
  const nearDeadlinePolicies = policies.filter(p => {
    if (p.deadline === '长期有效') return false;
    return new Date(p.deadline) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  });

  // 毛玻璃卡片样式
  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div>
      {/* 找政策搜索框 */}
      <Card bodyStyle={{ padding: '24px 24px 16px' }} style={{ marginBottom: 16, ...glassCardStyle }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2468F2', marginBottom: 24, fontSize: 32, fontWeight: 600 }}>找政策</h2>
          <div className="search-hero-wrapper" style={{ maxWidth: 560, margin: '0 auto' }}>
            <Input.Search
              placeholder="搜索政策名称、发布部门、关键词..."
              enterButton={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={v => { if (v.trim()) message.info(`正在搜索"${v}"...`); }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ marginRight: 8 }}>热门搜索：</Text>
            {hotTags.map(tag => (
              <Tag key={tag} style={{ cursor: 'pointer', marginBottom: 8, padding: '4px 14px' }} color="blue"
                onClick={() => { setSearchValue(tag); message.info(`正在搜索"${tag}"...`); }}><span style={{fontSize:'16px'}}>{tag}</span></Tag>
            ))}
          </div>
        </div>
      </Card>

      {/* 预警提示 */}
      {nearDeadlinePolicies.length > 0 && (
        <Alert
          message={<span style={{ color: '#fff', fontWeight: 500 }}>{nearDeadlinePolicies.length}项政策即将到期，请及时关注</span>}
          type="info"
          showIcon
          closable
          icon={<ExclamationCircleOutlined style={{ color: '#fff' }} />}
          action={<Button size="small" style={{ borderColor: '#fff', color: '#fff', background: 'rgba(255,255,255,0.15)' }} onClick={() => {
          message.info(`${nearDeadlinePolicies.length}项政策即将到期，请关注申报截止时间`);
        }}>查看详情</Button>}
          style={{ marginBottom: 16, background: 'linear-gradient(135deg, #5b93f5, #7eadf8)', border: 'none', borderRadius: 12 }}
        />
      )}

      <Row gutter={16} className="equal-height-row">
        {/* 主内容 */}
        <Col xs={24} lg={17} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 政策列表 */}
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#2468F2', fontSize: 18 }} />
                <span style={{ fontSize: 17, fontWeight: 600 }}>政策列表</span>
                <Text type="secondary" style={{ fontWeight: 'normal' }}>产业链：</Text>
                <Cascader
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'chemical', label: '绿色化工', children: [
                      { value: 'chem-phosphorus', label: '磷化工' }, { value: 'chem-fine', label: '精细化工' }, { value: 'chem-new-material', label: '化工新材料' }, { value: 'chem-bio', label: '生物化工', disabled: true },
                    ]},
                    { value: 'energy', label: '新能源新材料', children: [
                      { value: 'energy-solar', label: '光伏材料' }, { value: 'energy-battery', label: '锂电材料' }, { value: 'energy-hydrogen', label: '氢能', disabled: true }, { value: 'energy-composite', label: '先进复合材料' },
                    ]},
                    { value: 'bio', label: '生命健康', children: [
                      { value: 'bio-pharma', label: '化学制药' }, { value: 'bio-tcm', label: '中药制剂' }, { value: 'bio-device', label: '医疗器械' }, { value: 'bio-reagent', label: '生物试剂', disabled: true },
                    ]},
                    { value: 'auto', label: '汽车及装备制造', children: [
                      { value: 'auto-ev', label: '新能源汽车' }, { value: 'auto-parts', label: '汽车零部件' }, { value: 'auto-smart', label: '智能网联汽车', disabled: true },
                    ]},
                    { value: 'bigdata', label: '算力及大数据', children: [
                      { value: 'bd-center', label: '数据中心' }, { value: 'bd-ai', label: '人工智能' }, { value: 'bd-cloud', label: '云计算' }, { value: 'bd-blockchain', label: '区块链', disabled: true },
                    ]},
                    { value: 'culture', label: '文化旅游', children: [
                      { value: 'culture-scenic', label: '文旅景区' }, { value: 'culture-hotel', label: '酒店民宿' }, { value: 'culture-creative', label: '文创产品' }, { value: 'culture-show', label: '演艺娱乐', disabled: true }, { value: 'culture-service', label: '旅游服务', disabled: true },
                    ]},
                  ]}
                  defaultValue={['chemical']}
                  changeOnSelect
                  expandTrigger="hover"
                  placeholder="请选择产业链"
                  style={{ width: 240 }}
                />
              </Space>
            }
            style={{ flex: 1, ...glassCardStyle }}
            extra={
              <Space>
                <Text type="secondary" style={{ fontSize: 16 }}>更新频率：每周</Text>
                <Divider type="vertical" />
                <Button type="link" size="small" icon={<BellOutlined />} onClick={() => message.success('政策更新订阅成功，新政策发布时将通知您')}>订阅更新</Button>
              </Space>
            }
          >
            <Table
              dataSource={policies}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 15 }}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) => (
                  <CaretRightOutlined
                    style={{
                      fontSize: 14,
                      color: '#2468F2',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                    onClick={(e) => onExpand(record, e)}
                  />
                ),
                expandedRowRender: (record) => (
                  <div style={{ padding: '8px 0' }}>
                    <Text type="secondary">摘要：</Text>
                    <Paragraph style={{ margin: '4px 0' }}>{record.summary}</Paragraph>
                    <Space>
                      {record.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                    </Space>
                  </div>
                ),
              }}
            />
          </Card>

        </Col>

        {/* 右侧面板 */}
        <Col xs={24} lg={7} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 预警订阅 */}
          <Card title={<><BellOutlined style={{ color: '#fa8c16', fontSize: 18 }} /> <span style={{ fontSize: 17, fontWeight: 600 }}>预警订阅</span></>} bodyStyle={{ padding: 12 }} style={{ ...glassCardStyle }}>
            <List
              dataSource={[
                { type: '新政触达', desc: '符合条件的新政策发布时通知', enabled: true },
                { type: '到期提醒', desc: '申报截止前7天提醒', enabled: true },
                { type: '窗口期提醒', desc: '申报窗口期开启时通知', enabled: false },
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{item.type}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 16 }}>{item.desc}</Text>
                    </div>
                    <Switch checked={item.enabled} size="default" />
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 本周更新 */}
          <Card
            title={<><CalendarOutlined style={{ color: '#52c41a', fontSize: 18 }} /> <span style={{ fontSize: 17, fontWeight: 600 }}>本周更新</span></>}
            extra={<Button type="link" size="small">更多 <RightOutlined /></Button>}
            style={{ marginTop: 16, ...glassCardStyle }}
            bodyStyle={{ padding: 12 }}
          >
            <Timeline
              items={[
                { color: 'green', children: <><Text style={{ fontSize: 16 }}>宜昌市促进生物医药产业发展若干政策</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2026-01-10</Text></> },
                { color: 'blue', children: <><Text style={{ fontSize: 16 }}>关于支持科技创新的若干措施</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2026-01-08</Text></> },
                { color: 'blue', children: <><Text style={{ fontSize: 16 }}>高层次人才引进计划（更新）</Text><br /><Text type="secondary" style={{ fontSize: 16 }}>2026-01-06</Text></> },
              ]}
            />
          </Card>

          {/* 闭环输出 - 美化为图片卡片 */}
          <Card title={<><RocketOutlined style={{ color: '#722ed1', fontSize: 18 }} /> <span style={{ fontSize: 17, fontWeight: 600 }}>闭环输出</span></>} style={{ marginTop: 16, flex: 1, ...glassCardStyle }} bodyStyle={{ padding: 12 }}>
            <Row gutter={[8, 8]}>
              {[
                { title: '生成申报建议', image: '/images/banner-bg7.png' },
                { title: '政策解读报告', image: '/images/banner-bg4.png' },
                { title: '创建申报任务', image: '/images/banner-bg3.png' },
              ].map((item, idx) => (
                <Col span={12} key={idx} offset={idx === 2 ? 6 : 0} style={{ display: 'flex' }}>
                  <div
                    onClick={() => {
                      if (item.title === '创建申报任务') {
                        message.success('申报任务创建成功');
                        navigate('/list');
                      } else {
                        message.loading(`正在${item.title}...`, 1.5);
                        setTimeout(() => {
                          message.success(`${item.title}完成`);
                          navigate('/reports');
                        }, 1500);
                      }
                    }}
                    style={{
                      position: 'relative',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 14,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.42)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      minHeight: 132,
                      maxHeight: 200,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(238,246,255,0.78) 60%, rgba(231,242,255,0.86) 100%)',
                      padding: 10,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <Text style={{ position: 'relative', zIndex: 1, color: '#2E3B55', fontSize: 16, fontWeight: 600, lineHeight: 1.2, padding: '0 2px', marginBottom: 5 }}>
                      {item.title}
                    </Text>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(95% 72% at 12% 10%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0) 60%), linear-gradient(145deg, rgba(118,162,238,0.12) 0%, rgba(118,162,238,0) 56%)',
                      opacity: 0.42,
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 4px 6px',
                    }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '86%',
                          height: '86%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 4px 8px rgba(62,113,201,0.16))',
                        }}
                      />
                    </div>
                    <div style={{
                      position: 'absolute',
                      right: 10,
                      bottom: 7,
                      zIndex: 1,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#5A86D6',
                      lineHeight: 1,
                      background: 'rgba(216,232,255,0.96)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.78), 0 1px 2px rgba(90,134,214,0.12)',
                    }}>
                      <PlusOutlined style={{ fontSize: 13, fontWeight: 700 }} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 政策详情抽屉 */}
      <Drawer
        title="政策详情"
        width={560}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button icon={<BellOutlined />} onClick={() => message.success(`已订阅「${selectedPolicy?.title}」的变更通知`)}>订阅</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              message.success(`已为「${selectedPolicy?.title}」创建申报任务`);
              setDrawerVisible(false);
            }}>创建申报任务</Button>
          </Space>
        }
      >
        {selectedPolicy && (
          <>
            <Title level={5}>{selectedPolicy.title}</Title>
            <Descriptions column={2} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="发布部门">{selectedPolicy.department}</Descriptions.Item>
              <Descriptions.Item label="发布日期">{selectedPolicy.publishDate}</Descriptions.Item>
              <Descriptions.Item label="截止日期">
                <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span>{selectedPolicy.deadline}</span>
                  {selectedPolicy.deadline !== '长期有效' && (
                    <Tag color="orange" icon={<ClockCircleOutlined />} style={{ margin: 0 }}>
                      剩余{Math.ceil((new Date(selectedPolicy.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}天
                    </Tag>
                  )}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="政策类型">
                <Tag color="blue">{selectedPolicy.type}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Collapse defaultActiveKey={['summary', 'conditions']}>
              <Panel header="政策摘要" key="summary">
                <Paragraph>{selectedPolicy.summary}</Paragraph>
                <Space wrap>
                  {selectedPolicy.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                </Space>
              </Panel>
              <Panel header="申报条件" key="conditions">
                <List
                  size="small"
                  dataSource={[
                    '在宜昌市注册的企业法人',
                    '符合相关产业发展方向',
                    '近三年无重大违法违规记录',
                    '具备相应的研发能力和条件',
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Panel>
              <Panel header="支持内容" key="support">
                <List
                  size="small"
                  dataSource={[
                    '落户奖励：最高2000万元',
                    '研发补贴：研发投入的10%',
                    '人才补贴：核心人才50万元/人',
                    '贷款贴息：贷款利息的50%',
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Panel>
              <Panel header="申报材料" key="materials">
                <List
                  size="small"
                  dataSource={[
                    '企业营业执照复印件',
                    '项目申报书',
                    '财务审计报告',
                    '知识产权证明材料',
                    '其他支撑材料',
                  ]}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Badge count={index + 1} style={{ backgroundColor: '#2468F2', marginRight: 8 }} size="small" />
                      {item}
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Policy;
