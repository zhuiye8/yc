/**
 * @input { Input, Button, Space, Tag, List, Avatar, Typography, Spin } from 'antd', @ant-design/icons
 * @output { AIFloatButton } AI 智能助手浮窗组件
 * @position 共享 UI 组件，由 MainLayout 固定渲染在右下角，内置关键词匹配知识库（6 大主题）
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { useState, useRef, useEffect } from 'react';
import { Input, Button, Space, Tag, List, Avatar, Typography, Spin } from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  SearchOutlined,
  FileTextOutlined,
  BellOutlined,
  ExportOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  FileSearchOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 智能回复知识库
const knowledgeBase = {
  // 企业相关
  enterprise: {
    keywords: ['企业', '公司', '龙头', '龙头企业', '上市', '产业链'],
    responses: [
      {
        keywords: ['生物医药', '医药'],
        answer: `【生物医药产业龙头企业】

宜昌生物医药产业共有链上企业 **286家**，主要龙头企业包括：

1. **人福医药集团** - 全国医药百强企业，主营麻醉药品
2. **东阳光药业** - 专注于特色原料药和制剂研发
3. **安琪酵母** - 亚洲第一、全球第三大酵母生产商
4. **宜昌人福药业** - 国内麻醉药品龙头
5. **三峡制药** - 专注于生物发酵类药物

💡 点击企业名称可查看详细画像，或将其加入招商清单。`
      },
      {
        keywords: ['新材料', '材料'],
        answer: `【新材料产业龙头企业】

宜昌新材料产业共有链上企业 **198家**，主要龙头企业包括：

1. **宜化集团** - 全国化工百强，磷化工龙头
2. **兴发集团** - 精细磷化工领军企业
3. **三宁化工** - 煤化工、磷化工一体化
4. **华强化工** - 农用化学品专业制造商
5. **湖北鼎龙** - 电子材料细分领域冠军

💡 可生成产业链诊断报告，分析强弱缺链状态。`
      },
      {
        keywords: ['装备', '制造', '装备制造'],
        answer: `【装备制造产业龙头企业】

宜昌装备制造产业共有链上企业 **312家**，主要龙头企业包括：

1. **三峡集团** - 全球最大水电开发企业
2. **长机科技** - 齿轮加工机床龙头
3. **宜昌船舶柴油机** - 船用发动机专业制造
4. **黑旋风锯业** - 金刚石工具领军企业
5. **微特电子** - 船舶电子设备专家

💡 装备制造是宜昌"3+2"主导产业之一，拥有完整的产业链配套。`
      },
    ],
    defaultAnswer: `【宜昌产业企业概况】

宜昌市共有规模以上工业企业 **1330家**，覆盖五大主导产业：

📊 **产业分布**
• 生物医药：286家（21.5%）
• 新材料：198家（14.9%）
• 装备制造：312家（23.5%）
• 绿色化工：356家（26.8%）
• 清洁能源：178家（13.4%）

💡 您可以输入具体产业名称，获取该领域龙头企业详情。
🔍 也可以直接搜索企业名称，查看企业画像。`
  },

  // 人才相关
  talent: {
    keywords: ['人才', '专家', '团队', '引才', '紧缺', '招聘'],
    responses: [
      {
        keywords: ['新材料', '材料'],
        answer: `【新材料领域人才分析】

📊 **人才库统计**
新材料领域现有专家人才 **456位**，分布如下：
• 顶尖人才（院士级）：3位
• 高端人才（国家级）：28位
• 骨干人才（省级）：89位
• 基础人才：336位

⚠️ **紧缺方向 TOP5**
1. 先进陶瓷材料
2. 高性能纤维及复合材料
3. 电子功能材料
4. 新能源材料
5. 生物医用材料

💡 建议：可生成人才引进建议报告，或查看候选人才清单。`
      },
      {
        keywords: ['生物', '医药', '生物医药'],
        answer: `【生物医药领域人才分析】

📊 **人才库统计**
生物医药领域现有专家人才 **523位**，分布如下：
• 顶尖人才（院士级）：5位
• 高端人才（国家级）：42位
• 骨干人才（省级）：126位
• 基础人才：350位

⚠️ **紧缺方向 TOP5**
1. 创新药研发
2. 基因治疗
3. 细胞治疗
4. 高端医疗器械
5. 中药现代化

💡 可点击"找人才"快捷按钮，筛选符合条件的专家。`
      },
    ],
    defaultAnswer: `【宜昌人才资源概况】

📊 **人才总量**：2,856 位专家人才

**分级分布**
• 顶尖人才：15位（院士、国家杰青等）
• 高端人才：186位（国家级人才称号）
• 骨干人才：428位（省级人才称号）
• 基础人才：2,227位

**产业分布**
• 生物医药：523位
• 新材料：456位
• 装备制造：389位
• 绿色化工：298位
• 清洁能源：190位

💡 输入具体领域可查看该方向人才详情及紧缺分析。`
  },

  // 政策相关
  policy: {
    keywords: ['政策', '申报', '补贴', '扶持', '奖励', '资助'],
    responses: [
      {
        keywords: ['科技', '创新', '研发'],
        answer: `【科技创新政策推荐】

📋 **可申报政策清单**（共 12 项）

1. **湖北省科技创新专项资金**
   - 资助金额：50-500万元
   - 申报截止：2025年2月28日
   - 匹配度：⭐⭐⭐⭐⭐

2. **宜昌市重点研发计划**
   - 资助金额：20-100万元
   - 申报截止：2025年3月15日
   - 匹配度：⭐⭐⭐⭐

3. **高新技术企业认定奖励**
   - 奖励金额：10-30万元
   - 长期有效

💡 点击政策名称查看详情，或生成申报建议报告。`
      },
      {
        keywords: ['人才', '引才', '引进'],
        answer: `【人才引进政策推荐】

📋 **可申报政策清单**（共 8 项）

1. **楚天英才计划·卓越工程师**
   - 资助金额：30万元/人
   - 申报截止：2025年3月31日
   - 推荐申报 ✅

2. **宜昌市"三峡英才"计划**
   - 资助金额：10-100万元
   - 长期有效

3. **东湖高新区人才安居补贴**
   - 补贴标准：最高50万元
   - 长期有效

💡 可根据企业情况生成政策匹配报告。`
      },
    ],
    defaultAnswer: `【宜昌政策资源概况】

📊 **有效政策**：86 项

**分类统计**
• 产业扶持类：32项
• 人才引进类：18项
• 科技创新类：22项
• 融资支持类：14项

⏰ **近期可申报**
• 本周新增：5项
• 即将截止：3项（7天内）
• 长期有效：45项

💡 输入具体领域（如"科技"、"人才"），获取精准政策推荐。`
  },

  // 融资相关
  funding: {
    keywords: ['融资', '贷款', '投资', '资金', '基金', 'VC', 'PE'],
    responses: [
      {
        keywords: ['信贷', '贷款', '银行'],
        answer: `【信贷融资产品推荐】

💰 **匹配融资产品**（共 15 款）

1. **科技型企业信用贷**
   - 额度：100-1000万元
   - 利率：LPR-50BP
   - 期限：1-3年

2. **知识产权质押贷**
   - 额度：50-500万元
   - 利率：LPR基准
   - 专利、商标可质押

3. **产业链金融贷**
   - 额度：200-2000万元
   - 核心企业担保

💡 可生成融资对接清单，一键提交贷款意向。`
      },
      {
        keywords: ['股权', '投资', 'VC', 'PE'],
        answer: `【股权投资机构推荐】

🏛️ **匹配投资机构**（共 28 家）

1. **光谷创投**
   - 偏好阶段：A轮-B轮
   - 重点领域：生物医药、新材料
   - 已对接案例：12个

2. **湖北高投**
   - 偏好阶段：Pre-A到B轮
   - 重点领域：硬科技、先进制造
   - 已对接案例：8个

3. **长江产业基金**
   - 偏好阶段：B轮及以后
   - 重点领域：产业链龙头

💡 可生成融资对接报告，提高对接成功率。`
      },
    ],
    defaultAnswer: `【宜昌融资资源概况】

💰 **融资工具库**
• 信贷产品：28款
• 担保产品：12款
• 贴息政策：8项

🏛️ **投资机构库**
• 创投机构：56家
• 产业基金：23支
• 本周新增对接：15次

📈 **累计对接成效**
• 对接金额：12.5亿元
• 成功案例：86个
• 平均周期：23天

💡 输入"信贷"或"股权"，获取精准融资产品推荐。`
  },

  // 技术相关
  tech: {
    keywords: ['技术', '专利', '标准', '研发', '创新', '成果'],
    responses: [
      {
        keywords: ['专利', '发明', '知识产权'],
        answer: `【专利技术分析】

📊 **宜昌专利数据概览**
• 发明专利：4,526件
• 实用新型：8,932件
• 外观设计：2,156件

🔥 **热门技术领域 TOP5**
1. 磷化工深加工技术
2. 生物医药合成技术
3. 新能源材料制备
4. 智能装备控制系统
5. 环保处理技术

💡 可进入技术页面查看详细专利分析报告。`
      },
    ],
    defaultAnswer: `【技术创新资源概况】

📊 **技术资源统计**
• 专利数据：4,526件
• 技术标准：128项
• 在研项目：186个
• 科技成果：356项

⚠️ **技术缺口提示**
已识别 23 个关键技术缺口，主要集中在：
• 高端装备核心部件
• 新型功能材料
• 生物医药原料药

💡 输入具体技术领域，获取详细趋势分析。`
  },

  // 报告相关
  report: {
    keywords: ['报告', '生成', '分析', '诊断', '尽调'],
    responses: [
      {
        keywords: ['产业', '产业链'],
        answer: `【产业报告生成】

📝 可为您生成以下产业报告：

1. **产业链诊断报告**
   - 内容：强弱缺链分析、环节覆盖度、发展建议
   - 耗时：约3分钟

2. **精准招商报告**
   - 内容：目标企业画像、招商策略、候选清单
   - 耗时：约5分钟

3. **产业研究报告**
   - 内容：产业现状、发展趋势、竞争格局
   - 耗时：约10分钟

💡 请选择需要生成的报告类型，或输入"生成XXX报告"。`
      },
      {
        keywords: ['企业', '尽调'],
        answer: `【企业尽调报告】

📝 请提供目标企业名称，将为您生成：

**报告内容**
• 企业基本信息与股权结构
• 经营状况与财务分析
• 知识产权与技术实力
• 风险预警与信用评估
• 产业链位置与竞争分析

⏱️ 预计生成时间：5-8分钟

💡 输入企业名称开始生成，如"生成人福医药尽调报告"。`
      },
    ],
    defaultAnswer: `【报告生成中心】

📝 可为您生成以下类型报告：

**产业类**
• 产业链诊断报告
• 精准招商报告
• 产业研究报告

**企业类**
• 企业尽调报告
• 企业画像报告

**人才类**
• 引才建议报告
• 人才供需匹配报告

**融资类**
• 融资对接报告
• 投资机构匹配报告

💡 输入具体报告名称开始生成。`
  },
};

// 智能匹配回复
const getSmartResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();

  // 遍历知识库
  for (const [, data] of Object.entries(knowledgeBase)) {
    // 检查是否匹配该类别的关键词
    const matchedKeyword = data.keywords.some(kw => lowerInput.includes(kw));

    if (matchedKeyword) {
      // 检查是否有更精确的子类匹配
      if (data.responses) {
        for (const response of data.responses) {
          if (response.keywords.some(kw => lowerInput.includes(kw))) {
            return response.answer;
          }
        }
      }
      // 返回默认回答
      return data.defaultAnswer;
    }
  }

  // 通用回复
  if (lowerInput.includes('你好') || lowerInput.includes('在吗') || lowerInput.includes('hi') || lowerInput.includes('hello')) {
    return `您好！我是宜昌产业人才地图AI助手 🤖

我可以帮您：
• 🔍 **查找信息** - 企业、人才、政策、技术
• 📊 **生成报告** - 产业诊断、企业尽调、招商分析
• 🔔 **创建预警** - 政策到期、企业风险、市场变化
• 📋 **管理清单** - 招商候选、引才对象、融资对接

请问有什么可以帮您的？`;
  }

  if (lowerInput.includes('谢谢') || lowerInput.includes('感谢')) {
    return `不客气！很高兴能帮到您 😊

如有其他问题，随时可以询问我：
• 查找企业/人才/政策/技术信息
• 生成各类分析报告
• 了解产业发展态势

祝您使用愉快！`;
  }

  // 默认回复
  return `感谢您的提问！

根据您的问题"${input}"，我为您找到以下相关信息：

📊 **相关数据**
• 匹配企业：${Math.floor(Math.random() * 20) + 5} 家
• 相关政策：${Math.floor(Math.random() * 10) + 2} 项
• 相关人才：${Math.floor(Math.random() * 15) + 3} 位

💡 **建议操作**
1. 点击"找企业"查看详细企业列表
2. 点击"找政策"查看可申报政策
3. 输入更具体的关键词获取精准结果

您也可以尝试询问：
• "宜昌生物医药有哪些龙头企业？"
• "新材料领域有哪些紧缺人才？"
• "最近有哪些可申报的科技政策？"`;
};

function AIFloatButton() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `您好！我是宜昌产业人才地图AI助手 🤖

我可以帮您：
• 🔍 **查找信息** - 企业、人才、政策、技术
• 📊 **生成报告** - 产业诊断、企业尽调、招商分析
• 🔔 **创建预警** - 政策到期、企业风险、市场变化

请问有什么可以帮您的？`,
      timestamp: new Date(),
    }
  ]);

  const quickActions = [
    { icon: <SearchOutlined />, label: '找企业', color: '#2468F2', query: '宜昌有哪些龙头企业？' },
    { icon: <TeamOutlined />, label: '找人才', color: '#52c41a', query: '有哪些紧缺人才方向？' },
    { icon: <FileSearchOutlined />, label: '找政策', color: '#fa8c16', query: '最近有哪些可申报的政策？' },
    { icon: <FileTextOutlined />, label: '生成报告', color: '#722ed1', query: '可以生成哪些报告？' },
    { icon: <BellOutlined />, label: '创建预警', color: '#eb2f96', query: '如何创建预警规则？' },
    { icon: <ExportOutlined />, label: '导出清单', color: '#13c2c2', query: '如何导出数据清单？' },
  ];

  const suggestedQuestions = [
    '宜昌生物医药产业有哪些龙头企业？',
    '最近有哪些可申报的科技政策？',
    '新材料领域有哪些紧缺人才方向？',
    '帮我生成一份产业链诊断报告',
  ];

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const query = text || inputValue;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // 模拟AI思考延迟
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getSmartResponse(query),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleQuickAction = (query: string) => {
    handleSend(query);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 80,
          height: 80,
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #2468F2 0%, #6B8CFF 100%)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(36, 104, 242, 0.4)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(36, 104, 242, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(36, 104, 242, 0.4)';
        }}
        title="AI 智能助手"
      >
        <img
          src="/images/ai-robot.png"
          alt="AI助手"
          style={{
            width: 68,
            height: 68,
            objectFit: 'contain',
            borderRadius: '50%',
          }}
        />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      right: 24,
      bottom: 24,
      width: 400,
      height: 600,
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #2468F2 0%, #6B8CFF 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        flexShrink: 0,
      }}>
        <Space>
          <img src="/images/ai-robot.png" alt="AI助手" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <span>AI 智能助手</span>
        </Space>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setOpen(false)}
          style={{ color: '#fff' }}
        />
      </div>

      {/* 快捷操作 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {quickActions.map((action, index) => (
            <Tag
              key={index}
              icon={action.icon}
              color={action.color}
              style={{ cursor: 'pointer', margin: 0 }}
              onClick={() => handleQuickAction(action.query)}
            >
              {action.label}
            </Tag>
          ))}
        </div>
      </div>

      {/* 消息区域 */}
      <div  style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{
              padding: '8px 0',
              border: 'none',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                display: 'flex',
                gap: 8,
                flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                maxWidth: '85%'
              }}>
                {msg.type === 'ai' ? (
                  <img
                    src="/images/ai-robot.png"
                    alt="AI助手"
                    style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, objectFit: 'contain' }}
                  />
                ) : (
                  <Avatar style={{ backgroundColor: '#87d068', flexShrink: 0 }}>我</Avatar>
                )}
                <div style={{
                  background: msg.type === 'ai' ? '#f5f5f5' : '#2468F2',
                  color: msg.type === 'ai' ? '#333' : '#fff',
                  padding: '10px 14px',
                  borderRadius: 12,
                  whiteSpace: 'pre-wrap',
                  fontSize: 13,
                  lineHeight: 1.6
                }}>
                  {msg.content}
                </div>
              </div>
            </List.Item>
          )}
        />

        {/* AI正在输入提示 */}
        {isTyping && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <img src="/images/ai-robot.png" alt="AI助手" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'contain' }} />
            <div style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: 12 }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>正在思考...</Text>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* 推荐问题 */}
        {messages.length <= 1 && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
              <QuestionCircleOutlined /> 您可能想问：
            </Text>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {suggestedQuestions.map((q, i) => (
                <div
                  key={i}
                  onClick={() => handleSend(q)}
                  style={{
                    padding: '8px 12px',
                    background: '#fafafa',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e6f4ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fafafa';
                  }}
                >
                  {q}
                </div>
              ))}
            </Space>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div  style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入问题或指令..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
            disabled={isTyping}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
          />
        </div>
      </div>
    </div>
  )
}

export default AIFloatButton
