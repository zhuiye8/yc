/**
 * @input antd 组件, @ant-design/icons
 * @output { About } 关于页组件
 * @position 业务页面，平台介绍 + 核心能力 + 数据维度 + 未来目标（纯展示，无 mock 数据导入）
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React from 'react';
import { Card, Row, Col, Typography, List, Tag, Space, Divider, Button, Statistic, Avatar } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  ExperimentOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  MailOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  CloudSyncOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const About: React.FC = () => {
  // 核心能力
  const coreCapabilities = [
    { icon: <TeamOutlined />, title: '人才引育', desc: '人才库检索与供需匹配' },
    { icon: <BankOutlined />, title: '产业链诊断', desc: '全景图谱构建与强/弱/缺链分析' },
    { icon: <TeamOutlined />, title: '招商引资', desc: '精准招商与候选企业推荐' },
    { icon: <ExperimentOutlined />, title: '技术洞察', desc: '专利/标准/项目趋势分析' },
    { icon: <FileTextOutlined />, title: '政策申报', desc: '政策匹配与申报任务管理' },
    { icon: <DollarOutlined />, title: '投融资对接', desc: '融资工具与机构精准匹配' },
  ];

  // 已上线能力
  const onlineFeatures = [
    '全维度检索（企业/人才/技术/政策/机构）',
    '多维画像与标签化展示',
    '自定义清单管理与跟进记录',
    '一键生成各类分析报告',
    '预警与提醒订阅服务',
    'AI智能问答与联动分析',
  ];

  // 数据维度
  const dataDimensions = [
    {
      title: '产业维度',
      items: ['5大主导产业链', '128个细分环节', '1330家链上企业', '强/弱/缺链状态诊断', '产业集聚度分析', '区域对标研究', '招商项目库管理'],
      color: '#2468F2',
      stats: { main: '1330', unit: '家企业', sub: '5大产业链全覆盖' }
    },
    {
      title: '人才维度',
      items: ['2856名专家人才', '分级分类管理', '供需匹配分析', '蓝领人才对接', '1256名宜昌籍人才', '人才画像构建', '引才意向跟踪'],
      color: '#2468F2',
      stats: { main: '2856', unit: '名人才', sub: '覆盖五大领域' }
    },
    {
      title: '技术维度',
      items: ['4526件专利数据', '128项技术标准', '186个在研项目', '23项技术缺口', 'IPC分类趋势', '技术成熟度评估', '产学研对接'],
      color: '#2468F2',
      stats: { main: '4526', unit: '件专利', sub: '23项关键技术缺口' }
    },
    {
      title: '资金维度',
      items: ['28款融资工具', '156家投资机构', '对接全流程管理', '12.5亿累计对接', '6类基金覆盖', '智能产品推荐', '融资进度追踪'],
      color: '#2468F2',
      stats: { main: '156', unit: '家机构', sub: '12.5亿累计对接' }
    },
    {
      title: '政策维度',
      items: ['86项有效政策', '智能匹配推荐', '申报任务管理', '到期预警提醒', '政策解读分析', '申报成功率统计', '历年政策归档'],
      color: '#2468F2',
      stats: { main: '86', unit: '项政策', sub: '智能精准匹配' }
    },
  ];

  // 典型应用场景
  const scenarios = [
    { title: '对内治理', icon: <GlobalOutlined />, desc: '人才引育、产业分析、招商引资', image: '/images/banner-bg3.png', color: '#2468F2' },
    { title: '对外展示', icon: <RocketOutlined />, desc: '大屏展示、路演支撑、招商推介', image: '/images/banner-bg1.png', color: '#2468F2' },
    { title: '闭环运营', icon: <SafetyCertificateOutlined />, desc: '清单管理、任务跟进、报告生成', image: '/images/banner-bg4.png', color: '#2468F2' },
  ];

  // 未来发展目标
  const futureGoals = [
    { layer: '数据层', icon: <CloudSyncOutlined />, items: ['增量数据自动更新', '多源数据融合', '数据质量评估与治理闭环'], image: '/images/banner-bg2.png' },
    { layer: '分析层', icon: <ExperimentOutlined />, items: ['更精细的诊断模型', '可配置指标体系', '对标分析与趋势预测'], image: '/images/banner-bg5.png' },
    { layer: '应用层', icon: <RocketOutlined />, items: ['跨模块自动联动', '任务驱动运营', '多端展示与开放接口'], image: '/images/banner-bg6.png' },
    { layer: '生态合作', icon: <ApiOutlined />, items: ['数据合作', '工具集成', '联合运营与持续迭代'], image: '/images/banner-bg3.png' },
  ];

  // 毛玻璃卡片样式
  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  };

  // Section 容器样式（全宽背景，抵消父级 padding: 16px）
  const sectionStyle = (bg: string): React.CSSProperties => ({
    padding: '60px 0',
    margin: '0 -16px',
    background: bg,
  });

  // 内容居中容器
  const innerStyle: React.CSSProperties = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  };

  // Section 标题
  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      <h2 style={{ fontSize: 28, fontWeight: 600, color: '#1D2129', margin: 0, lineHeight: 1.4 }}>
        <span style={{ marginRight: 8, color: '#2468F2' }}>{icon}</span>{title}
      </h2>
      <p style={{ fontSize: 15, color: '#86909C', margin: '8px 0 0' }}>{subtitle}</p>
    </div>
  );

  return (
    <div>
      {/* ====== Section 1 — 平台介绍 ====== */}
      <div style={sectionStyle('#fff')}>
        <div style={innerStyle}>
          {sectionHeader(<BankOutlined />, '平台介绍', '产业人才数智化服务平台，助力区域产业与人才高质量协同发展')}

          {/* 左：介绍文字(60%)  右：核心能力(40%) */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
            <div style={{ flex: '0 0 58%' }}>
              <Paragraph style={{ fontSize: 18, lineHeight: 1.9 }}>
                宜昌产业人才地图是在宜昌市委组织部指导下，由湖北三峡人才集团牵头建设的综合性产业人才数智化服务平台。平台致力于为政府部门、产业园区、产业机构、金融机构等提供全方位的产业人才服务数智化解决方案。依托大数据与人工智能等先进技术，构建了集数据整合、智能分析与业务闭环于一体的服务支撑体系，全面助推区域产业与人才的高质量协同发展。
              </Paragraph>
              <Paragraph style={{ fontSize: 18, lineHeight: 1.9 }}>
                平台深度聚焦宜昌市绿色化工、新能源新材料、生命健康、汽车及装备制造、算力及大数据、文化旅游六大主导产业，汇聚全国范围内的产业数据、人才资源、技术成果、政策信息和金融资源，构建起覆盖广泛的产业人才服务生态。通过精准智能分析与高效匹配，平台为合作伙伴提供贯穿产业人才全生命周期的服务支持，助力快速对接对接人才、企业、技术、资金及政策多维资源，为产业分析、人才引育、招商引资、技术对接、融资支持与政策申报等关键环节提供数智赋能，切实增强企业发展动能，提升区域产业核心竞争力，驱动产业结构持续优化升级。
              </Paragraph>
            </div>
            <div style={{ flex: 1 }}>
              <Card size="small" title={<><RocketOutlined style={{ color: '#2468F2', marginRight: 6 }} /><span style={{ fontSize: 16, fontWeight: 600 }}>核心能力</span></>} bodyStyle={{ padding: 12 }} style={{ height: '100%', ...glassCardStyle }}>
                <List
                  dataSource={coreCapabilities}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <Space>
                        <Avatar icon={item.icon} style={{ backgroundColor: '#2468F2' }} size="small" />
                        <div>
                          <Text strong style={{ fontSize: 18 }}>{item.title}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 18 }}>{item.desc}</Text>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </div>

          {/* 典型应用场景 */}
          <Title level={4} style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
            <GlobalOutlined style={{ color: '#2468F2', marginRight: 6 }} />典型应用场景
          </Title>
          <div style={{ display: 'flex', gap: 16 }}>
            {scenarios.map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  position: 'relative',
                  height: 140,
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, rgba(26, 58, 92, 0.9) 0%, ${item.color}cc 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#fff',
                  padding: 16,
                }}>
                  <span style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</span>
                  <Text strong style={{ color: '#fff', fontSize: 16 }}>{item.title}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, textAlign: 'center', marginTop: 4 }}>{item.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== Section 2 — 产品现状 ====== */}
      <div style={sectionStyle('#f7f9fc')}>
        <div style={innerStyle}>
          {sectionHeader(<RocketOutlined />, '产品现状', '当前版本及已上线核心能力')}

          {/* 左：版本信息  右：已上线能力 */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ fontSize: 16, fontWeight: 600 }}><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />当前版本</Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color="blue">V1.0</Tag>
                <Tag color="green">稳定版</Tag>
                <Tag>2026年1月发布</Tag>
              </Space>
              <Paragraph style={{ fontSize: 18, lineHeight: 1.8 }}>
                当前版本已实现产业、人才、技术、资金、政策五大模块的核心功能，支持全维度检索、多维画像、清单管理、报告生成、预警订阅等能力。平台采用先进的微服务架构，支持高并发访问和弹性扩展，确保系统稳定性和可靠性。
              </Paragraph>
              <Paragraph style={{ fontSize: 18, lineHeight: 1.8 }}>
                系统集成了智能AI助手，可以针对用户的具体需求提供个性化的政策推荐、人才匹配、融资方案等建议。同时，平台提供丰富的可视化分析工具，帮助用户直观了解产业发展态势、人才分布情况和技术创新趋势。
              </Paragraph>
              <Paragraph style={{ fontSize: 18, lineHeight: 1.8 }}>
                为确保数据安全，平台采用多层次安全防护体系，包括数据加密、访问控制、操作审计等措施，严格保护用户数据和隐私信息。
              </Paragraph>
            </div>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ fontSize: 16, fontWeight: 600 }}><SafetyCertificateOutlined style={{ color: '#2468F2', marginRight: 6 }} />已上线能力</Title>
              <List
                dataSource={onlineFeatures}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0', justifyContent: 'flex-start' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <Text style={{ fontSize: 18 }}>{item}</Text>
                  </List.Item>
                )}
              />
            </div>
          </div>

          <Divider />

          {/* 数据治理指标 */}
          <Title level={4} style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>
            <CloudSyncOutlined style={{ color: '#fa8c16', marginRight: 6 }} />数据更新与治理机制
          </Title>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <Statistic title="数据更新频率" value="每周" prefix={<CloudSyncOutlined />} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <Statistic title="数据源" value={12} suffix="个" />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <Statistic title="数据质量" value={98.5} suffix="%" />
            </div>
          </div>
        </div>
      </div>

      {/* ====== Section 3 — 数据维度与深度 ====== */}
      <div style={sectionStyle('#fff')}>
        <div style={innerStyle}>
          {sectionHeader(<ExperimentOutlined />, '数据维度与深度', '五大维度全面覆盖，数据透明可追溯')}

          {/* 2×3 网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {dataDimensions.map((dim, index) => (
              <Card
                key={index}
                style={{ borderTop: `3px solid ${dim.color}` }}
                size="small"
                title={<Text strong style={{ color: dim.color, fontSize: 18 }}>{dim.title}</Text>}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ textAlign: 'center', marginBottom: 12, padding: '8px 0', background: `${dim.color}10`, borderRadius: 6 }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: dim.color }}>{dim.stats.main}</Text>
                  <Text style={{ fontSize: 16, color: dim.color, marginLeft: 4 }}>{dim.stats.unit}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 16 }}>{dim.stats.sub}</Text>
                </div>
                <Row gutter={8}>
                  <Col span={12}>
                    {dim.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} style={{ padding: '3px 0' }}>
                        <Text style={{ fontSize: 18 }}>• {item}</Text>
                      </div>
                    ))}
                  </Col>
                  <Col span={12}>
                    {dim.items.slice(4).map((item, idx) => (
                      <div key={idx} style={{ padding: '3px 0' }}>
                        <Text style={{ fontSize: 18 }}>• {item}</Text>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card>
            ))}

            {/* 第 6 张：可解释与可追溯 */}
            <Card
              size="small"
              title={<Text strong style={{ color: '#2468F2', fontSize: 18 }}>可解释与可追溯</Text>}
              bodyStyle={{ padding: 16 }}
              style={{ borderTop: '3px solid #2468F2' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 12, padding: '8px 0', background: '#2468F210', borderRadius: 6 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2468F2' }}>100%</Text>
                <Text style={{ fontSize: 16, color: '#2468F2', marginLeft: 4 }}>可追溯</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 16 }}>数据透明有据可查</Text>
              </div>
              <Row gutter={8}>
                <Col span={12}>
                  {['完整证据链展示', '指标口径说明', '快照复现能力', '数据来源标注'].map((item, idx) => (
                    <div key={idx} style={{ padding: '3px 0' }}>
                      <Text style={{ fontSize: 18 }}>• {item}</Text>
                    </div>
                  ))}
                </Col>
                <Col span={12}>
                  {['更新时间记录', '版本变更追踪', '审计日志留存'].map((item, idx) => (
                    <div key={idx} style={{ padding: '3px 0' }}>
                      <Text style={{ fontSize: 18 }}>• {item}</Text>
                    </div>
                  ))}
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      </div>

      {/* ====== Section 4 — 未来发展目标 ====== */}
      <div style={sectionStyle('#f7f9fc')}>
        <div style={innerStyle}>
          {sectionHeader(<RocketOutlined />, '未来发展目标', '数据层 · 分析层 · 应用层 · 生态合作')}

          <div className="about-future-goals" style={{ display: 'flex', gap: 16 }}>
            {futureGoals.map((goal, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  minHeight: 200,
                }}
              >
                <img src={goal.image} alt={goal.layer} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
                <div style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(26, 58, 92, 0.9) 0%, #2468F2cc 100%)',
                  padding: 16,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <Avatar icon={goal.icon} size={48} style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 }} />
                  <Title level={4} style={{ color: '#fff', margin: '0 0 12px 0' }}>{goal.layer}</Title>
                  <List
                    dataSource={goal.items}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '4px 0', border: 'none', justifyContent: 'center' }}>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>{item}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== Section 5 — 使用帮助 ====== */}
      <div style={sectionStyle('#fff')}>
        <div style={innerStyle}>
          {sectionHeader(<BookOutlined />, '使用帮助', '操作手册、常见问题与问题反馈')}

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
            <Button block icon={<BookOutlined />} size="large" style={{ height: 60, maxWidth: 300 }}>
              操作手册下载
            </Button>
            <Button block icon={<QuestionCircleOutlined />} size="large" style={{ height: 60, maxWidth: 300 }}>
              常见问题解答
            </Button>
            <Button block icon={<MailOutlined />} size="large" style={{ height: 60, maxWidth: 300 }}>
              问题反馈
            </Button>
          </div>
          <Divider />
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 16 }}>
            如有更多问题，请通过页面底部的联系方式与我们取得联系
          </Text>
        </div>
      </div>
    </div>
  );
};

export default About;
