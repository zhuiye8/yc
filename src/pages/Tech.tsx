/**
 * @input antd 组件, ReactECharts, { useNavigate } from 'react-router-dom', { technologies } from '../mock/data'
 * @output { Tech } 创新页组件
 * @position 业务页面，年度趋势折线图 + 热点主题矩形树图 + 技术缺口对标 + 专利列表
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Card, Row, Col, Tabs, Tag, Table, Button, Space, Input, Statistic, Typography, List, Badge, App, Cascader } from 'antd';
import {
  FileTextOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  NodeIndexOutlined,
  SearchOutlined,
  CalendarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router-dom';
import { technologies } from '../mock/data';

const { Text } = Typography;
const { TabPane } = Tabs;

const Tech: React.FC = () => {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const hotTags = ['基因编辑', '固态电池', '碳纤维', '智能传感', '绿色催化', '氢能', 'AI制药', '高端光刻胶'];

  // 年度趋势图
  const getTrendOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['专利申请', '专利授权', '标准发布', '科研项目'], bottom: 0, itemWidth: 16, itemHeight: 10, textStyle: { fontSize: 13, color: '#666' } },
    xAxis: { type: 'category', data: ['2021', '2022', '2023', '2024', '2025'], axisLabel: { fontSize: 13, color: '#666' }, axisLine: { lineStyle: { color: '#e8e8e8' } } },
    yAxis: { type: 'value', axisLabel: { fontSize: 13, color: '#999' }, splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } } },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    series: [
      { name: '专利申请', type: 'line', smooth: true, data: [1200, 1450, 1680, 1920, 2350], symbol: 'circle', symbolSize: 8, lineStyle: { width: 2.5, color: '#2A8AF6' }, itemStyle: { color: '#2A8AF6', borderColor: '#fff', borderWidth: 2 } },
      { name: '专利授权', type: 'line', smooth: true, data: [820, 980, 1120, 1340, 1680], symbol: 'circle', symbolSize: 8, lineStyle: { width: 2.5, color: '#3CC8B4' }, itemStyle: { color: '#3CC8B4', borderColor: '#fff', borderWidth: 2 } },
      { name: '标准发布', type: 'line', smooth: true, data: [450, 560, 680, 820, 950], symbol: 'circle', symbolSize: 8, lineStyle: { width: 2.5, color: '#F5C244' }, itemStyle: { color: '#F5C244', borderColor: '#fff', borderWidth: 2 } },
      { name: '科研项目', type: 'line', smooth: true, data: [890, 1120, 1350, 1580, 1860], symbol: 'circle', symbolSize: 8, lineStyle: { width: 2.5, color: '#F5943A' }, itemStyle: { color: '#F5943A', borderColor: '#fff', borderWidth: 2 } },
    ],
  });

  // 热点主题图
  const getHotTopicOption = () => ({
    tooltip: {},
    series: [
      {
        type: 'treemap',
        data: [
          { name: '基因编辑', value: 156, itemStyle: { color: '#1a3a5c' } },
          { name: '固态电池', value: 134, itemStyle: { color: '#1e4d8c' } },
          { name: '碳纤维', value: 112, itemStyle: { color: '#2468F2' } },
          { name: '智能传感', value: 98, itemStyle: { color: '#4585f5' } },
          { name: '绿色催化', value: 87, itemStyle: { color: '#6ba0f7' } },
          { name: '氢能', value: 76, itemStyle: { color: '#8fb8fa' } },
          { name: 'AI制药', value: 65, itemStyle: { color: '#b3d1fc' } },
          { name: '3D打印', value: 54, itemStyle: { color: '#d6e8fe' } },
        ],
        label: {
          show: true,
          formatter: '{b}\n{c}件',
        },
      },
    ],
  });

  // 技术缺口数据
  const techGaps = [
    { id: 1, name: '高端光刻胶', chain: '新材料', gapLevel: '严重', localCount: 2, nationalCount: 45, suggestion: '引进核心技术团队' },
    { id: 2, name: '生物制品生产工艺', chain: '生物医药', gapLevel: '较大', localCount: 5, nationalCount: 38, suggestion: '产学研联合攻关' },
    { id: 3, name: '高精度传感器芯片', chain: '装备制造', gapLevel: '较大', localCount: 3, nationalCount: 52, suggestion: '与头部企业合作' },
    { id: 4, name: '氢燃料电池膜', chain: '清洁能源', gapLevel: '中等', localCount: 8, nationalCount: 28, suggestion: '引进技术许可' },
    { id: 5, name: '高性能催化剂', chain: '绿色化工', gapLevel: '轻微', localCount: 12, nationalCount: 35, suggestion: '自主研发强化' },
  ];

  // 专利证据列表
  const patentList = [
    { id: 'p1', title: '一种基因编辑载体的制备方法', applicant: '宜昌人福药业', date: '2025-11-15', type: '发明', ipc: 'A61K', status: '授权' },
    { id: 'p2', title: '高性能碳纤维复合材料及制备工艺', applicant: '三峡新材股份', date: '2025-10-28', type: '发明', ipc: 'C08L', status: '实审' },
    { id: 'p3', title: '智能传感器数据处理系统', applicant: '中船710所', date: '2025-09-20', type: '发明', ipc: 'G06F', status: '授权' },
    { id: 'p4', title: '新型储能电池电解液配方', applicant: '三峡集团', date: '2025-08-15', type: '发明', ipc: 'H01M', status: '授权' },
    { id: 'p5', title: '绿色催化剂制备及应用方法', applicant: '宜化集团', date: '2025-12-05', type: '发明', ipc: 'B01J', status: '实审' },
    { id: 'p6', title: '酵母菌种改良培育技术', applicant: '安琪酵母', date: '2025-11-28', type: '发明', ipc: 'C12N', status: '授权' },
    { id: 'p7', title: '光伏组件封装工艺及设备', applicant: '三峡集团', date: '2025-10-12', type: '发明', ipc: 'H02S', status: '授权' },
    { id: 'p8', title: '高强度硅材料制备方法', applicant: '南玻硅材料', date: '2025-09-08', type: '发明', ipc: 'C01B', status: '实审' },
    { id: 'p9', title: '磷酸铁锂正极材料的改性方法', applicant: '宜化集团', date: '2025-12-18', type: '发明', ipc: 'H01M', status: '实审' },
    { id: 'p10', title: '船舶动力系统智能监控装置', applicant: '中船710所', date: '2025-11-05', type: '发明', ipc: 'B63H', status: '授权' },
    { id: 'p11', title: '微生物发酵法生产核苷酸工艺', applicant: '安琪酵母', date: '2025-10-22', type: '发明', ipc: 'C12P', status: '授权' },
    { id: 'p12', title: '高纯度电子级磷酸制备技术', applicant: '兴发集团', date: '2025-08-30', type: '发明', ipc: 'C01B', status: '授权' },
    { id: 'p13', title: '柔性太阳能电池封装结构', applicant: '三峡集团', date: '2025-07-20', type: '发明', ipc: 'H02S', status: '实审' },
    { id: 'p14', title: '缓控释药物制剂及其制备方法', applicant: '宜昌人福药业', date: '2025-12-10', type: '发明', ipc: 'A61K', status: '实审' },
  ];

  // 核心主体列表
  const coreEntities = [
    { name: '三峡实验室', type: '科研机构', patents: 178, projects: 45, papers: 256 },
    { name: '中船710研究所', type: '科研机构', patents: 342, projects: 67, papers: 189 },
    { name: '三峡大学', type: '高校', patents: 234, projects: 89, papers: 567 },
    { name: '宜昌人福药业', type: '企业', patents: 156, projects: 23, papers: 45 },
    { name: '安琪酵母', type: '企业', patents: 289, projects: 34, papers: 78 },
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
      {/* 找技术搜索框 */}
      <Card bodyStyle={{ padding: '24px 24px 16px' }} style={{ marginBottom: 16, ...glassCardStyle }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#2468F2', marginBottom: 24, fontSize: 32, fontWeight: 600 }}>找技术</h2>
          <div className="search-hero-wrapper" style={{ maxWidth: 560, margin: '0 auto' }}>
            <Input.Search
              placeholder="搜索专利、标准、技术成果、科研项目..."
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

      <Row gutter={16} className="equal-height-row">
        {/* 主视图 */}
        <Col xs={24} lg={18} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card bodyStyle={{ padding: 0 }} style={{ flex: 1, ...glassCardStyle }}>
            <Tabs defaultActiveKey="trend" style={{ padding: '0 16px' }} tabBarExtraContent={
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
              {/* 趋势洞察 */}
              <TabPane tab={<><RiseOutlined />趋势洞察</>} key="trend">
                <div style={{ padding: 16 }}>
                  {/* 统计卡片 */}
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', background: 'linear-gradient(135deg, #F5F9FF 0%, #E8F1FF 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ fontSize: 16, fontWeight: 500 }}>累计专利</span>} value={4526} valueStyle={{ color: '#2468F2', fontWeight: 700 }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', background: 'linear-gradient(135deg, #FAFFF0 0%, #F6FFED 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ fontSize: 16, fontWeight: 500 }}>有效标准</span>} value={128} valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', background: 'linear-gradient(135deg, #FCFAFF 0%, #F9F0FF 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ fontSize: 16, fontWeight: 500 }}>在研项目</span>} value={186} valueStyle={{ color: '#722ed1', fontWeight: 700 }} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" bodyStyle={{ textAlign: 'center', background: 'linear-gradient(135deg, #FFFBE6 0%, #FFF7E6 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ fontSize: 16, fontWeight: 500 }}>转化成果</span>} value={234} valueStyle={{ color: '#fa8c16', fontWeight: 700 }} />
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={14}>
                      <Card title={<><CalendarOutlined style={{ color: '#fa8c16', marginRight: 6 }} />年度趋势</>} size="small">
                        <ReactECharts option={getTrendOption()} style={{ height: 320 }} />
                      </Card>
                    </Col>
                    <Col span={10}>
                      <Card title={<><FireOutlined style={{ color: '#ff4d4f' }} /> 热点主题</>} size="small">
                        <ReactECharts option={getHotTopicOption()} style={{ height: 320 }} />
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* 缺口对标 */}
              <TabPane tab={<><NodeIndexOutlined />缺口对标</>} key="gap">
                <div style={{ padding: 16 }}>
                  <Table
                    dataSource={techGaps}
                    rowKey="id"
                    columns={[
                      { title: '技术缺口', dataIndex: 'name', key: 'name' },
                      {
                        title: '所属链条',
                        dataIndex: 'chain',
                        key: 'chain',
                        render: (text) => <Tag color="blue">{text}</Tag>,
                      },
                      {
                        title: '缺口程度',
                        dataIndex: 'gapLevel',
                        key: 'gapLevel',
                        render: (level) => {
                          const colorMap: Record<string, string> = { '严重': 'red', '较大': 'orange', '中等': 'gold', '轻微': 'green' };
                          return <Tag color={colorMap[level]}>{level}</Tag>;
                        },
                      },
                      {
                        title: '本地主体',
                        dataIndex: 'localCount',
                        key: 'local',
                        render: (v) => <Text type="secondary">{v}家</Text>,
                      },
                      {
                        title: '全国主体',
                        dataIndex: 'nationalCount',
                        key: 'national',
                        render: (v) => <Text>{v}家</Text>,
                      },
                      {
                        title: '补链建议',
                        dataIndex: 'suggestion',
                        key: 'suggestion',
                        render: (text) => <Tag icon={<BulbOutlined />}>{text}</Tag>,
                      },
                      {
                        title: '操作',
                        key: 'action',
                        render: (_: unknown, record: typeof techGaps[0]) => (
                          <Space>
                            <Button type="link" size="small" onClick={() => {
                              modal.info({
                                title: `${record.name} - 对标主体`,
                                width: 600,
                                content: (
                                  <div>
                                    <p><strong>本地主体（{record.localCount}家）：</strong></p>
                                    <p style={{ color: '#666' }}>三峡实验室、宜昌人福药业、安琪酵母研究院</p>
                                    <p style={{ marginTop: 16 }}><strong>全国标杆主体（{record.nationalCount}家）：</strong></p>
                                    <p style={{ color: '#666' }}>中科院相关研究所、清华大学、北京大学、复旦大学等知名高校及龙头企业</p>
                                    <p style={{ marginTop: 16 }}><strong>差距分析：</strong></p>
                                    <p style={{ color: '#666' }}>{record.gapLevel === '严重' ? '本地技术积累薄弱，需重点引进外部资源' : record.gapLevel === '较大' ? '有一定基础，需加强产学研合作' : '基础较好，可通过自主研发弥补差距'}</p>
                                  </div>
                                ),
                              });
                            }}>查看对标主体</Button>
                            <Button type="link" size="small" onClick={() => {
                              message.loading(`正在生成 ${record.name} 攻关建议...`, 2);
                              setTimeout(() => {
                                modal.success({
                                  title: `${record.name} 技术攻关建议`,
                                  width: 600,
                                  content: (
                                    <div>
                                      <p><strong>技术缺口：</strong>{record.name}</p>
                                      <p><strong>所属链条：</strong>{record.chain}</p>
                                      <p><strong>缺口程度：</strong>{record.gapLevel}</p>
                                      <p style={{ marginTop: 16 }}><strong>攻关建议：</strong></p>
                                      <p>1. {record.suggestion}</p>
                                      <p>2. 建立产学研联合实验室，整合本地{record.localCount}家主体资源</p>
                                      <p>3. 对接全国{record.nationalCount}家标杆主体，开展技术交流与合作</p>
                                      <p>4. 设立专项攻关基金，支持核心技术突破</p>
                                      <p style={{ marginTop: 16 }}><strong>预期成效：</strong></p>
                                      <p>预计2-3年内可缩小与全国先进水平的差距，培育3-5家核心技术企业</p>
                                    </div>
                                  ),
                                });
                              }, 2000);
                            }}>生成攻关建议</Button>
                          </Space>
                        ),
                      },
                    ]}
                    pagination={false}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Card>

          {/* 证据列表 */}
          <Card
            title={<span style={{ fontSize: 17, fontWeight: 600 }}><SafetyCertificateOutlined style={{ color: '#2468F2', fontSize: 18, marginRight: 6 }} />专利证据</span>}
            style={{ marginTop: 16, ...glassCardStyle }}
            extra={<Button type="link">查看全部</Button>}
          >
            <Table
              dataSource={patentList}
              rowKey="id"
              columns={[
                {
                  title: '专利名称',
                  dataIndex: 'title',
                  key: 'title',
                  render: (text) => <a>{text}</a>,
                  onHeaderCell: () => ({ style: { paddingLeft: 24 } }),
                  onCell: () => ({ style: { paddingLeft: 24 } }),
                },
                { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
                { title: '申请日期', dataIndex: 'date', key: 'date' },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  render: (text) => <Tag>{text}</Tag>,
                },
                {
                  title: 'IPC',
                  dataIndex: 'ipc',
                  key: 'ipc',
                  render: (text) => <Tag color="blue">{text}</Tag>,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Badge status={status === '授权' ? 'success' : 'processing'} text={status} />
                  ),
                },
              ]}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>

        {/* 右侧面板 */}
        <Col xs={24} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 技术热度排行 */}
          <Card title={<span style={{ fontSize: 17, fontWeight: 600 }}><FireOutlined style={{ color: '#ff4d4f', fontSize: 18, marginRight: 6 }} />技术热度榜</span>} bodyStyle={{ padding: 12 }} style={{ ...glassCardStyle }}>
            <List
              dataSource={technologies}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '10px 0' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Tag color={index === 0 ? '#f5222d' : index === 1 ? '#fa541c' : index === 2 ? '#fa8c16' : index === 3 ? '#faad14' : '#2468F2'} style={{ fontSize: 14, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{index + 1}</Tag>
                      <Text style={{ fontSize: 18, fontWeight: 500 }}>{item.name}</Text>
                    </Space>
                    <Space>
                      {item.trend === 'hot' ? (
                        <Tag color="red" icon={<FireOutlined />} style={{ fontSize: 13 }}>热门</Tag>
                      ) : item.trend === 'growing' ? (
                        <Tag color="green" icon={<RiseOutlined />} style={{ fontSize: 13 }}>上升</Tag>
                      ) : (
                        <Tag color="cyan" icon={<FallOutlined />} style={{ fontSize: 13 }}>稳定</Tag>
                      )}
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 核心主体 */}
          <Card title={<span style={{ fontSize: 17, fontWeight: 600 }}><BankOutlined style={{ color: '#722ed1', fontSize: 18, marginRight: 6 }} />核心主体</span>} style={{ marginTop: 16, ...glassCardStyle }} bodyStyle={{ padding: 12 }}>
            <List
              dataSource={coreEntities}
              renderItem={(item) => (
                <List.Item style={{ padding: '10px 0' }}>
                  <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 18 }}>{item.name}</Text>
                      <Tag color={item.type === '科研机构' ? 'blue' : item.type === '高校' ? 'purple' : 'green'} style={{ fontSize: 13 }}>{item.type}</Tag>
                    </Space>
                    <Space size={16}>
                      <Text type="secondary" style={{ fontSize: 14 }}>专利 {item.patents}</Text>
                      <Text type="secondary" style={{ fontSize: 14 }}>项目 {item.projects}</Text>
                      <Text type="secondary" style={{ fontSize: 14 }}>论文 {item.papers}</Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 一键输出 - 美化为图片卡片 */}
          <Card title={<span style={{ fontSize: 17, fontWeight: 600 }}><FileTextOutlined style={{ color: '#fa8c16', fontSize: 18, marginRight: 6 }} />一键输出</span>} style={{ marginTop: 16, flex: 1, display: 'flex', flexDirection: 'column', ...glassCardStyle }} bodyStyle={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Row gutter={[8, 8]} style={{ flex: 1 }}>
              {[
                { title: '技术攻关建议', image: '/images/banner-bg7.png' },
                { title: '合作建议报告', image: '/images/banner-bg4.png' },
                { title: '技术分析报告', image: '/images/banner-bg4.png' },
                { title: '创建技术预警', image: '/images/banner-bg8.png' },
              ].map((item, idx) => (
                <Col span={12} key={idx} style={{ display: 'flex' }}>
                  <div
                    onClick={() => {
                      if (item.title === '创建技术预警') {
                        message.success('技术预警创建成功');
                        navigate('/alerts');
                      } else {
                        message.loading(`正在生成${item.title}...`, 1.5);
                        setTimeout(() => {
                          message.success(`${item.title}生成完成`);
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
    </div>
  );
};

export default Tech;
