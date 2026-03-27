/**
 * @input antd 组件, { useNavigate } from 'react-router-dom', { fundingProducts, investmentInstitutions, fundTypeStats } from '../mock/data'
 * @output { Funding } 资金页组件
 * @position 业务页面，融资工具库 + 投资机构库表格 + 基金类型统计 + 对接清单
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Tag, Table, Button, Space, Input, Typography, List, Descriptions, Badge, Drawer, App, Cascader } from 'antd';
import {
  BankOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RightOutlined,
  StarOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { fundingProducts, investmentInstitutions, fundTypeStats } from '../mock/data';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const FINANCIAL_URL = 'https://www.threegorges-financial.com/';
const openFinancial = () => window.open(FINANCIAL_URL, '_blank');

const Funding: React.FC = () => {
  App.useApp(); // keep context alive
  const [searchValue, setSearchValue] = useState('');
  const hotTags = ['科技贷', '创业担保', '股权融资', '贴息政策', 'VC机构', '产业基金', '天使投资', '引导基金'];
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<'product' | 'institution'>('product');
  const [selectedItem, setSelectedItem] = useState<typeof fundingProducts[0] | typeof investmentInstitutions[0] | null>(null);
  const [fundTypeFilter, setFundTypeFilter] = useState<string>('all');

  // 融资工具表格列
  const productColumns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: typeof fundingProducts[0]) => (
        <a onClick={openFinancial}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        const colorMap: Record<string, string> = { '信贷': 'blue', '担保': 'green', '贴息': 'orange', '股权': 'purple' };
        return <Tag color={colorMap[text]}>{text}</Tag>;
      },
    },
    { title: '承办机构', dataIndex: 'institution', key: 'institution' },
    { title: '最高额度', dataIndex: 'maxAmount', key: 'maxAmount' },
    { title: '利率/费率', dataIndex: 'rate', key: 'rate' },
    { title: '期限', dataIndex: 'term', key: 'term' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: typeof fundingProducts[0]) => (
        <Space>
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={openFinancial}>加入对接清单</Button>
        </Space>
      ),
    },
  ];

  // 投资机构表格列
  const fundTypeColorMap: Record<string, string> = {
    'VC': 'blue',
    'PE': 'blue',
    '天使基金': 'blue',
    '引导基金': 'blue',
    '产业基金': 'blue',
    '母基金': 'blue',
  };

  const institutionColumns = [
    {
      title: '机构名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: typeof investmentInstitutions[0]) => (
        <a onClick={openFinancial}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color={fundTypeColorMap[text] || 'blue'}>{text}</Tag>,
    },
    {
      title: '关注领域',
      dataIndex: 'focus',
      key: 'focus',
      render: (focus: string[]) => focus.map(f => <Tag key={f}>{f}</Tag>),
    },
    { title: '投资阶段', dataIndex: 'stage', key: 'stage' },
    { title: '投资案例', dataIndex: 'cases', key: 'cases', render: (v: number) => `${v}个` },
    { title: '管理规模', dataIndex: 'fundSize', key: 'fundSize' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: typeof investmentInstitutions[0]) => (
        <Space>
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={openFinancial}>加入对接清单</Button>
        </Space>
      ),
    },
  ];

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
      {/* 找资金搜索框 */}
      <Card bodyStyle={{ padding: '24px 24px 16px' }} style={{ marginBottom: 16, ...glassCardStyle }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2468F2', marginBottom: 24, fontSize: 32, fontWeight: 600 }}>找资金</h2>
          <div className="search-hero-wrapper" style={{ maxWidth: 560, margin: '0 auto' }}>
            <Input.Search
              placeholder="搜索融资工具、投资机构、基金类型..."
              enterButton={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={() => openFinancial()}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ marginRight: 8 }}>热门搜索：</Text>
            {hotTags.map(tag => (
              <Tag key={tag} style={{ cursor: 'pointer', marginBottom: 8, padding: '4px 14px' }} color="blue"
                onClick={openFinancial}><span style={{fontSize:'16px'}}>{tag}</span></Tag>
            ))}
          </div>
        </div>
      </Card>

      <Row gutter={16} className="equal-height-row">
        {/* 主内容 */}
        <Col xs={24} lg={18} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 统计卡片 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {[
              { title: '融资工具', sub: '可申请的融资产品', value: '28', suffix: '款', color: '#2468F2', image: '/images/banner-bg3.png' },
              { title: '投资机构', sub: '合作投资机构', value: String(investmentInstitutions.length), suffix: '家', color: '#52c41a', image: '/images/banner-bg4.png' },
              { title: '本周对接', sub: '活跃融资对接', value: '34', suffix: '笔', color: '#722ed1', image: '/images/banner-bg7.png' },
              { title: '累计对接', sub: '融资总规模', value: '12.5', suffix: '亿', color: '#fa8c16', image: '/images/banner-bg8.png' },
            ].map((card, idx) => (
              <Col span={6} key={idx}>
                <Card size="small" className="funding-stat-card" bodyStyle={{ padding: 16 }} style={{ ...glassCardStyle, background: 'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(238,246,255,0.78) 60%, rgba(231,242,255,0.86) 100%)', border: '1px solid rgba(255,255,255,0.42)' }}>
                  <div className="stat-title">{card.title}</div>
                  <div className="stat-sub" style={{ marginTop: 2 }}>{card.sub}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
                    <img src={card.image} alt={card.title} style={{ width: 130, height: 130, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(62,113,201,0.16))' }} />
                  </div>
                  <div className="stat-value" style={{ textAlign: 'center', color: card.color }}>{card.value}<span className="stat-suffix" style={{ marginLeft: 2 }}>{card.suffix}</span></div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* 基金类型统计 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            {fundTypeStats.map((item, idx) => {
              const fundImages = [
                { image: '/images/icons/icon-funding.png', color: '#2468F2' },
                { image: '/images/icons/icon-industry.png', color: '#1e4d8c' },
                { image: '/images/icons/icon-innovation.png', color: '#722ed1' },
                { image: '/images/icons/icon-talent.png', color: '#faad14' },
                { image: '/images/icons/icon-policy.png', color: '#13c2c2' },
                { image: '/images/banner-bg7.png', color: '#52c41a' },
              ][idx] || { image: '/images/icons/icon-funding.png', color: '#2468F2' };
              return (
              <Col span={4} key={idx}>
                <Card
                  size="small"
                  className="funding-fund-card"
                  bodyStyle={{ padding: 12, cursor: 'pointer' }}
                  onClick={openFinancial}
                  style={{
                    borderColor: item.type === fundTypeFilter ? fundImages.color : undefined,
                    borderWidth: item.type === fundTypeFilter ? 2 : 1,
                    ...glassCardStyle,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(238,246,255,0.78) 60%, rgba(231,242,255,0.86) 100%)',
                    border: item.type === fundTypeFilter ? `2px solid ${fundImages.color}` : '1px solid rgba(255,255,255,0.42)',
                  }}
                >
                  <div className="stat-title">{item.type}</div>
                  <div className="stat-sub">规模 {item.totalSize}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 6px' }}>
                    <img src={fundImages.image} alt={item.type} style={{ width: 100, height: 100, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(62,113,201,0.16))' }} />
                  </div>
                  <div className="stat-value" style={{ textAlign: 'center', color: fundImages.color }}>{item.count}<span className="stat-suffix" style={{ marginLeft: 2 }}>家</span></div>
                </Card>
              </Col>
              );
            })}
          </Row>

          <Card bodyStyle={{ padding: 0 }} style={{ ...glassCardStyle }}>
            <Tabs defaultActiveKey="products" style={{ padding: '0 16px' }} tabBarExtraContent={
              <Space>
                <Text type="secondary">产业链：</Text>
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
            }>
              {/* 融资工具库 */}
              <TabPane tab={<><BankOutlined />融资工具库</>} key="products">
                <div style={{ padding: 16 }}>
                  <Table
                    dataSource={fundingProducts}
                    columns={productColumns}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              </TabPane>

              {/* 投资机构库 */}
              <TabPane tab={<><UserOutlined />投资机构库</>} key="institutions">
                <div style={{ padding: 16 }}>
                  <Table
                    dataSource={fundTypeFilter === 'all' ? investmentInstitutions : investmentInstitutions.filter(i => i.type === fundTypeFilter)}
                    columns={institutionColumns}
                    rowKey="id"
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Card>

        </Col>

        {/* 右侧对接区 */}
        <Col xs={24} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 我的对接清单 */}
          <Card
            title={<span style={{ fontSize: 17, fontWeight: 600 }}><StarOutlined style={{ color: '#faad14', fontSize: 18, marginRight: 6 }} />我的对接清单</span>}
            extra={<Button type="link" size="small" onClick={openFinancial}>管理 <RightOutlined /></Button>}
            bodyStyle={{ padding: 12 }}
            style={{ ...glassCardStyle }}
          >
            <List
              dataSource={[
                { name: '科技成果转化贷', status: 'pending', enterprise: '某生物科技' },
                { name: '深创投', status: 'contacted', enterprise: '某新材料' },
                { name: '绿色信贷', status: 'success', enterprise: '某清洁能源' },
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                      <Tag color={item.status === 'success' ? 'green' : item.status === 'contacted' ? 'blue' : 'orange'} style={{ fontSize: 13, padding: '2px 10px', margin: 0 }}>
                        {item.status === 'success' ? '已对接' : item.status === 'contacted' ? '已联系' : '待跟进'}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 16 }}>对象：{item.enterprise}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 跟进记录 */}
          <Card title={<span style={{ fontSize: 17, fontWeight: 600 }}><ClockCircleOutlined style={{ color: '#2468F2', fontSize: 18, marginRight: 6 }} />跟进记录</span>} style={{ marginTop: 16, ...glassCardStyle }} bodyStyle={{ padding: 12 }}>
            <List
              dataSource={[
                { date: '2026-01-10', content: '与深创投初步沟通，约定下周会议', status: 'done' },
                { date: '2026-01-08', content: '提交科技贷申请材料', status: 'done' },
                { date: '2026-01-15', content: '深创投项目路演', status: 'upcoming' },
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '6px 0' }}>
                  <Space size={8}>
                    {item.status === 'done' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                    )}
                    <div>
                      <Text style={{ fontSize: 16 }}>{item.content}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 16 }}>{item.date}</Text>
                    </div>
                  </Space>
                </List.Item>
              )}
            />
            <Button block style={{ marginTop: 8 }} onClick={openFinancial}>添加记录</Button>
          </Card>

          {/* 输出 - 美化为图片卡片 */}
          <Card title={<span style={{ fontSize: 17, fontWeight: 600 }}><FileTextOutlined style={{ color: '#fa8c16', fontSize: 18, marginRight: 6 }} />输出</span>} style={{ marginTop: 16, flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }} bodyStyle={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Row gutter={[8, 8]} style={{ flex: 1 }}>
              {[
                { title: '融资对接报告', image: '/images/banner-bg4.png' },
                { title: '导出对接清单', image: '/images/banner-bg3.png' },
              ].map((item, idx) => (
                <Col span={12} key={idx} style={{ display: 'flex' }}>
                  <div
                    onClick={openFinancial}
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

      {/* 详情抽屉 */}
      <Drawer
        title={drawerType === 'product' ? '融资产品详情' : '机构详情'}
        width={480}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openFinancial}>加入对接清单</Button>
        }
      >
        {selectedItem && drawerType === 'product' && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="产品名称" span={2}>{(selectedItem as typeof fundingProducts[0]).name}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color="blue">{(selectedItem as typeof fundingProducts[0]).type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="承办机构">{(selectedItem as typeof fundingProducts[0]).institution}</Descriptions.Item>
              <Descriptions.Item label="最高额度">{(selectedItem as typeof fundingProducts[0]).maxAmount}</Descriptions.Item>
              <Descriptions.Item label="利率/费率">{(selectedItem as typeof fundingProducts[0]).rate}</Descriptions.Item>
              <Descriptions.Item label="期限">{(selectedItem as typeof fundingProducts[0]).term}</Descriptions.Item>
              <Descriptions.Item label="适用对象">{(selectedItem as typeof fundingProducts[0]).applicable}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="申请条件" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={[
                  '企业注册地在宜昌市',
                  '具有独立法人资格',
                  '信用记录良好',
                  '符合产业发展方向',
                ]}
                renderItem={(item) => (
                  <List.Item><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{item}</List.Item>
                )}
              />
            </Card>

            <Card size="small" title="办理流程" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={['提交申请材料', '银行/机构审核', '签订协议', '放款/投资']}
                renderItem={(item, index) => (
                  <List.Item>
                    <Badge count={index + 1} style={{ backgroundColor: '#2468F2' }} />
                    <Text style={{ marginLeft: 8 }}>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}

        {selectedItem && drawerType === 'institution' && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="机构名称" span={2}>{(selectedItem as typeof investmentInstitutions[0]).name}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color="blue">{(selectedItem as typeof investmentInstitutions[0]).type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="管理规模">{(selectedItem as typeof investmentInstitutions[0]).fundSize}</Descriptions.Item>
              <Descriptions.Item label="投资阶段" span={2}>{(selectedItem as typeof investmentInstitutions[0]).stage}</Descriptions.Item>
              <Descriptions.Item label="投资案例" span={2}>{(selectedItem as typeof investmentInstitutions[0]).cases}个</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="关注领域" style={{ marginTop: 16 }}>
              <Space wrap>
                {(selectedItem as typeof investmentInstitutions[0]).focus.map(f => (
                  <Tag key={f} color="blue">{f}</Tag>
                ))}
              </Space>
            </Card>

            <Card size="small" title="投资偏好" style={{ marginTop: 16 }}>
              <Paragraph style={{ fontSize: 16 }}>
                偏好具有核心技术壁垒的科技型企业，关注团队背景、市场空间和商业模式可行性。单笔投资金额通常在1000万-5000万之间。
              </Paragraph>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Funding;
