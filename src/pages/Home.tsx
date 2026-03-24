/**
 * @input { Row, Col, Typography, Button, Space, App, Select, Input, Cascader } from 'antd', { useNavigate } from 'react-router-dom'
 * @output { Home } 首页组件
 * @position 业务页面，Hero 左对齐布局 + 全局筛选条（区域/时间/产业链）+ 五大模块卡片总览
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Row, Col, Typography, Button, Space, App, Select, Divider, Input, Cascader } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  ExperimentOutlined,
  DollarOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const Home: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  // 全局筛选状态
  const [globalFilters, setGlobalFilters] = useState<{
    region: (string | number)[];
    timeRange: string;
    industry: (string | number)[];
  }>({
    region: ['hubei', 'yichang'],
    timeRange: '1y',
    industry: ['all'],
  });

  // 区域三级联动数据（省→市→区县）
  const regionOptions = [
    {
      value: 'beijing', label: '北京市', children: [
        {
          value: 'bj-city', label: '北京市', children: [
            { value: 'haidian', label: '海淀区' }, { value: 'chaoyang', label: '朝阳区' }, { value: 'dongcheng', label: '东城区' }, { value: 'xicheng', label: '西城区' },
          ]
        },
      ]
    },
    {
      value: 'shanghai', label: '上海市', children: [
        {
          value: 'sh-city', label: '上海市', children: [
            { value: 'pudong', label: '浦东新区' }, { value: 'huangpu', label: '黄浦区' }, { value: 'xuhui', label: '徐汇区' },
          ]
        },
      ]
    },
    {
      value: 'guangdong', label: '广东省', children: [
        {
          value: 'guangzhou', label: '广州市', children: [
            { value: 'tianhe', label: '天河区' }, { value: 'yuexiu', label: '越秀区' },
          ]
        },
        {
          value: 'shenzhen', label: '深圳市', children: [
            { value: 'nanshan', label: '南山区' }, { value: 'futian', label: '福田区' },
          ]
        },
      ]
    },
    {
      value: 'zhejiang', label: '浙江省', children: [
        {
          value: 'hangzhou', label: '杭州市', children: [
            { value: 'xihu', label: '西湖区' }, { value: 'binjiang', label: '滨江区' },
          ]
        },
        {
          value: 'ningbo', label: '宁波市', children: [
            { value: 'haishu', label: '海曙区' }, { value: 'yinzhou', label: '鄞州区' },
          ]
        },
      ]
    },
    {
      value: 'jiangsu', label: '江苏省', children: [
        {
          value: 'nanjing', label: '南京市', children: [
            { value: 'xuanwu', label: '玄武区' }, { value: 'jianye', label: '建邺区' },
          ]
        },
        {
          value: 'suzhou', label: '苏州市', children: [
            { value: 'gusu', label: '姑苏区' }, { value: 'kunshan', label: '昆山市' },
          ]
        },
      ]
    },
    {
      value: 'hubei', label: '湖北省', children: [
        {
          value: 'wuhan', label: '武汉市', children: [
            { value: 'wuchang', label: '武昌区' }, { value: 'hongshan', label: '洪山区' }, { value: 'jianghan', label: '江汉区' }, { value: 'dongxihu', label: '东西湖区' },
          ]
        },
        {
          value: 'yichang', label: '宜昌市', children: [
            { value: 'xiling', label: '西陵区' }, { value: 'wujiagang', label: '伍家岗区' }, { value: 'yiling', label: '夷陵区' }, { value: 'dianjun', label: '点军区' }, { value: 'zhijiang', label: '枝江市' }, { value: 'dangyang', label: '当阳市' }, { value: 'yidu', label: '宜都市' },
          ]
        },
        {
          value: 'xiangyang', label: '襄阳市', children: [
            { value: 'xiangcheng', label: '襄城区' }, { value: 'fancheng', label: '樊城区' },
          ]
        },
        {
          value: 'shiyan', label: '十堰市', children: [
            { value: 'maojian', label: '茅箭区' }, { value: 'zhangwan', label: '张湾区' },
          ]
        },
        {
          value: 'jingzhou', label: '荆州市', children: [
            { value: 'shashi', label: '沙市区' }, { value: 'jingzhou-qu', label: '荆州区' },
          ]
        },
        {
          value: 'huangshi', label: '黄石市', children: [
            { value: 'huangshigang', label: '黄石港区' }, { value: 'xisaishan', label: '西塞山区' },
          ]
        },
      ]
    },
    {
      value: 'hunan', label: '湖南省', children: [
        {
          value: 'changsha', label: '长沙市', children: [
            { value: 'yuelu', label: '岳麓区' }, { value: 'kaifu', label: '开福区' },
          ]
        },
      ]
    },
    {
      value: 'sichuan', label: '四川省', children: [
        {
          value: 'chengdu', label: '成都市', children: [
            { value: 'wuhou', label: '武侯区' }, { value: 'jinjiang', label: '锦江区' }, { value: 'gaoxin', label: '高新区' },
          ]
        },
      ]
    },
    {
      value: 'shandong', label: '山东省', children: [
        {
          value: 'jinan', label: '济南市', children: [
            { value: 'lixia', label: '历下区' }, { value: 'shizhong-jn', label: '市中区' },
          ]
        },
        {
          value: 'qingdao', label: '青岛市', children: [
            { value: 'shinan', label: '市南区' }, { value: 'laoshan', label: '崂山区' },
          ]
        },
      ]
    },
    {
      value: 'henan', label: '河南省', children: [
        {
          value: 'zhengzhou', label: '郑州市', children: [
            { value: 'jinshui', label: '金水区' }, { value: 'zhongyuan', label: '中原区' },
          ]
        },
      ]
    },
  ];

  // 产业链二级联动数据
  const industryOptions = [
    { value: 'all', label: '全部' },
    {
      value: 'chemical', label: '绿色化工', children: [
        { value: 'chem-phosphorus', label: '磷化工' }, { value: 'chem-fine', label: '精细化工' }, { value: 'chem-new-material', label: '化工新材料' }, { value: 'chem-bio', label: '生物化工', disabled: true },
      ]
    },
    {
      value: 'energy', label: '新能源新材料', children: [
        { value: 'energy-solar', label: '光伏材料' }, { value: 'energy-battery', label: '锂电材料' }, { value: 'energy-hydrogen', label: '氢能', disabled: true }, { value: 'energy-composite', label: '先进复合材料' },
      ]
    },
    {
      value: 'bio', label: '生命健康', children: [
        { value: 'bio-pharma', label: '化学制药' }, { value: 'bio-tcm', label: '中药制剂' }, { value: 'bio-device', label: '医疗器械' }, { value: 'bio-reagent', label: '生物试剂', disabled: true },
      ]
    },
    {
      value: 'auto', label: '汽车及装备制造', children: [
        { value: 'auto-ev', label: '新能源汽车' }, { value: 'auto-parts', label: '汽车零部件' }, { value: 'auto-smart', label: '智能网联汽车', disabled: true },
      ]
    },
    {
      value: 'bigdata', label: '算力及大数据', children: [
        { value: 'bd-center', label: '数据中心' }, { value: 'bd-ai', label: '人工智能' }, { value: 'bd-cloud', label: '云计算' }, { value: 'bd-blockchain', label: '区块链', disabled: true },
      ]
    },
    {
      value: 'culture', label: '文化旅游', children: [
        { value: 'culture-scenic', label: '文旅景区' }, { value: 'culture-hotel', label: '酒店民宿' }, { value: 'culture-creative', label: '文创产品' }, { value: 'culture-show', label: '演艺娱乐', disabled: true }, { value: 'culture-service', label: '旅游服务', disabled: true },
      ]
    },
  ];

  // 五大模块总览数据
  const moduleOverviewData = [
    {
      key: 'industry',
      title: '产业',
      icon: <BankOutlined />,
      color: '#2468F2',
      path: '/industry',
      stats: [
        { label: '链上企业', value: 1330, unit: '家' },
        { label: '强链', value: 63, trend: 5.2 },
        { label: '弱链', value: 35, trend: -3.1 },
        { label: '缺链', value: 25, trend: -8.5 },
      ],
      highlight: '短板环节：高端光刻胶、生物制品工艺',
    },
    {
      key: 'talent',
      title: '人才',
      icon: <TeamOutlined />,
      color: '#52c41a',
      path: '/talent',
      stats: [
        { label: '人才总数', value: 2856, unit: '人' },
        { label: '宜昌籍人才', value: 1523, unit: '人' },
        { label: '领军人才', value: 128, trend: 12.5 },
        { label: '创新人才', value: 373, trend: 15.2 },
      ],
      highlight: '紧缺人才方向：生物医药研发、AI算法、新材料工艺',
    },
    {
      key: 'tech',
      title: '创新',
      icon: <ExperimentOutlined />,
      color: '#722ed1',
      path: '/tech',
      stats: [
        { label: '知识产权', value: 4526, unit: '件' },
        { label: '技术标准', value: 312, unit: '项' },
        { label: '科研项目', value: 856, unit: '个' },
        { label: '产业园区', value: 18, unit: '个' },
      ],
      highlight: '关键IPC趋势：A61K、C08L、H01M',
    },
    {
      key: 'funding',
      title: '资金',
      icon: <DollarOutlined />,
      color: '#fa8c16',
      path: '/funding',
      stats: [
        { label: '融资工具', value: 28, unit: '款' },
        { label: '投资机构', value: 156, unit: '家' },
        { label: '累计对接', value: 12.5, unit: '亿' },
        { label: '本周新增', value: 1.8, unit: '亿' },
      ],
      highlight: '热门推荐：科创贷、专精特新基金、天使投资',
    },
    {
      key: 'policy',
      title: '政策',
      icon: <FileTextOutlined />,
      color: '#eb2f96',
      path: '/policy',
      stats: [
        { label: '政策', value: 326, unit: '项' },
        { label: '可申报政策', value: 42, trend: 8.3 },
        { label: '人才政策', value: 87, unit: '项' },
        { label: '到期政策', value: 3, trend: 0 },
      ],
      highlight: '重点关注：科技创新专项资金、人才引进补贴',
    },
  ];

  return (
    <div>
      {/* Hero + 筛选条共用背景 */}
      <div style={{
        background: "url('/images/banner-bg5.png') no-repeat center top / 100% auto",
      }}>
        {/* Hero 区域 */}
        <div className="hero-section" style={{
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 右侧装饰背景图 */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60%',
            height: '100%',
            backgroundImage: "url('/images/banner-bg-1.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right top',
            backgroundSize: 'contain',
            opacity: 0.6,
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '0 48px', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#1D2129',
              lineHeight: 1.3,
              margin: 0,
              marginBottom: 16,
            }}>
              宜昌产业人才地图
            </h1>
            <div style={{
              fontSize: 18,
              color: '#86909C',
              lineHeight: 1.8,
              marginBottom: 36,
            }}>
              以"产业-人才-创新-资金-政策"五链深度融合为基础，构建"人才+"创新发展模式，共同打造中国产业人才创新服务大平台
            </div>

            {/* Hero 大搜索框 */}
            <div className="search-hero-wrapper" style={{ maxWidth: 720, margin: '0 auto' }}>
              <Input.Search
                placeholder="搜索企业、人才、技术、政策..."
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => value && message.success(`正在搜索: "${value}"`)}
              />
            </div>
          </div>
        </div>

        {/* 全局筛选条 */}
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          padding: '12px 48px',
          borderBottom: '1px solid rgba(232,232,232,0.6)',
          position: 'sticky',
          top: 64,
          zIndex: 99,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <Space>
              <FilterOutlined style={{ color: '#2468F2' }} />
              <Text type="secondary">全局筛选：</Text>
            </Space>
            <Space size={16}>
              <Space>
                <Text type="secondary">区域：</Text>
                <Cascader
                  options={regionOptions}
                  value={globalFilters.region as string[]}
                  onChange={(v) => setGlobalFilters({ ...globalFilters, region: v || [] })}
                  changeOnSelect
                  expandTrigger="hover"
                  placeholder="请选择区域"
                  style={{ width: 240 }}
                />
              </Space>
              <Space>
                <Text type="secondary">时间窗：</Text>
                <Select
                  value={globalFilters.timeRange}
                  onChange={(v) => setGlobalFilters({ ...globalFilters, timeRange: v })}
                  style={{ width: 100 }}
                  options={[
                    { value: '1y', label: '近1年' },
                    { value: '3y', label: '近3年' },
                    { value: '5y', label: '近5年' },
                    { value: 'custom', label: '自定义' },
                  ]}
                />
              </Space>
              <Space>
                <Text type="secondary">产业链：</Text>
                <Cascader
                  options={industryOptions}
                  value={globalFilters.industry as string[]}
                  onChange={(v) => setGlobalFilters({ ...globalFilters, industry: v || [] })}
                  changeOnSelect
                  expandTrigger="hover"
                  placeholder="请选择产业链"
                  style={{ width: 200 }}
                />
              </Space>
            </Space>
            <Button type="link" size="small" onClick={() => setGlobalFilters({ region: ['hubei', 'yichang'], timeRange: '1y', industry: ['all'] })}>重置筛选</Button>
          </div>
        </div>
      </div>

      {/* 五大模块总览卡片 */}
      <div style={{
        padding: '80px 0',
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 32px' }}>
          {(() => {
            const iconMap: Record<string, string> = {
              industry: '/images/icons/icon-industry.png',
              talent: '/images/icons/icon-talent.png',
              tech: '/images/icons/icon-innovation.png',
              funding: '/images/icons/icon-funding.png',
              policy: '/images/icons/icon-policy.png',
            };
            const topModules = moduleOverviewData.filter(m => m.key === 'industry' || m.key === 'talent');
            const bottomModules = moduleOverviewData.filter(m => m.key !== 'industry' && m.key !== 'talent');

            const renderCard = (module: typeof moduleOverviewData[0], isLarge: boolean) => (
              <div
                key={module.key}
                className="module-card"
                onClick={() => navigate(module.path)}
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: isLarge ? 16 : 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text strong className={isLarge ? 'module-title-lg' : 'module-title-sm'}>{module.title}</Text>
                    <span style={{
                      fontSize: isLarge ? 28 : 24,
                      color: 'rgba(36, 104, 242, 0.15)',
                      marginTop: 4,
                    }}>
                      {module.icon}
                    </span>
                  </div>
                  <Row gutter={[8, isLarge ? 14 : 8]}>
                    {module.stats.map((stat, idx) => (
                      <Col span={12} key={idx}>
                        <div>
                          <div style={{ fontSize: isLarge ? 32 : 26, fontWeight: 600, color: '#2468F2' }}>
                            {stat.value}
                            {stat.unit && <span style={{ fontSize: isLarge ? 16 : 15, color: '#2468F2', fontWeight: 400 }}>{stat.unit}</span>}
                          </div>
                          <div style={{ fontSize: isLarge ? 17 : 16, color: '#8c8c8c' }}>
                            {stat.label}
                            {stat.trend !== undefined && stat.trend !== 0 && (
                              <span style={{ color: stat.trend > 0 ? '#52c41a' : '#ff4d4f', marginLeft: 4 }}>
                                {stat.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                              </span>
                            )}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  <Divider style={{ margin: isLarge ? '16px 0 12px' : '10px 0 8px' }} />
                  <Text type="secondary" style={{ fontSize: isLarge ? 15 : 15 }} ellipsis>{module.highlight}</Text>
                </div>
                {/* 左下角圆形箭头 */}
                <div style={{
                  position: 'absolute',
                  left: 24,
                  bottom: isLarge ? 40 : 30,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#F0F1F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                }}>
                  <ArrowRightOutlined style={{ color: '#2468F2', fontSize: 22 }} />
                </div>
                <img
                  src={iconMap[module.key]}
                  alt={module.title}
                  style={{
                    position: 'absolute',
                    right: isLarge ? 16 :module.key === 'policy' ? -10 : 10,
                    bottom: isLarge ? 16 :module.key === 'policy' ? -10 : 10,
                    width: module.key === 'talent' ? 170 : isLarge ? 180 : module.key === 'policy' ? 180 : 140,
                    height: module.key === 'talent' ? 170 : isLarge ? 180 : module.key === 'policy' ? 180 : 140,
                    objectFit: 'contain',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            );

            return (
              <>
                <div className="module-grid">
                  {topModules.map(m => renderCard(m, true))}
                </div>
                <div className="module-grid-bottom">
                  {bottomModules.map(m => renderCard(m, false))}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Home;
