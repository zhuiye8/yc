/**
 * @input { industryChainGraphData } from './industryChainGraphData'
 * @output 全平台业务数据集（industryChains, enterprises, talents, technologies, policies 等 20+ 导出）+ TypeScript 接口定义
 * @position Mock 数据层核心文件，唯一数据源，各页面通过 import 直接引用
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
// 模拟数据 - 产业服务平台
import { industryChainGraphData } from './industryChainGraphData';

// 产业链数据
export const industryChains = [
  {
    id: '1',
    name: '生物医药',
    code: 'bio-pharma',
    enterprises: 328,
    strongLinks: 12,
    weakLinks: 8,
    missingLinks: 5,
    trend: 'up',
    trendValue: 12.5,
    children: [
      { id: '1-1', name: '原料药', status: 'strong', count: 45 },
      { id: '1-2', name: '制剂生产', status: 'strong', count: 89 },
      { id: '1-3', name: '医疗器械', status: 'weak', count: 34 },
      { id: '1-4', name: '生物制品', status: 'missing', count: 12 },
      { id: '1-5', name: '中药材', status: 'strong', count: 67 },
    ]
  },
  {
    id: '2',
    name: '新材料',
    code: 'new-materials',
    enterprises: 256,
    strongLinks: 15,
    weakLinks: 6,
    missingLinks: 3,
    trend: 'up',
    trendValue: 8.3,
    children: [
      { id: '2-1', name: '高性能纤维', status: 'strong', count: 38 },
      { id: '2-2', name: '电子化学品', status: 'weak', count: 28 },
      { id: '2-3', name: '新能源材料', status: 'strong', count: 56 },
      { id: '2-4', name: '功能陶瓷', status: 'missing', count: 8 },
    ]
  },
  {
    id: '3',
    name: '装备制造',
    code: 'equipment',
    enterprises: 412,
    strongLinks: 18,
    weakLinks: 9,
    missingLinks: 4,
    trend: 'stable',
    trendValue: 2.1,
    children: [
      { id: '3-1', name: '工业机器人', status: 'weak', count: 23 },
      { id: '3-2', name: '数控机床', status: 'strong', count: 67 },
      { id: '3-3', name: '智能传感器', status: 'missing', count: 15 },
      { id: '3-4', name: '精密仪器', status: 'weak', count: 31 },
    ]
  },
  {
    id: '4',
    name: '绿色化工',
    code: 'green-chem',
    enterprises: 189,
    strongLinks: 10,
    weakLinks: 7,
    missingLinks: 6,
    trend: 'down',
    trendValue: -3.2,
    children: [
      { id: '4-1', name: '精细化工', status: 'strong', count: 45 },
      { id: '4-2', name: '新型肥料', status: 'weak', count: 28 },
      { id: '4-3', name: '高端涂料', status: 'missing', count: 11 },
    ]
  },
  {
    id: '5',
    name: '清洁能源',
    code: 'clean-energy',
    enterprises: 145,
    strongLinks: 8,
    weakLinks: 5,
    missingLinks: 7,
    trend: 'up',
    trendValue: 23.6,
    children: [
      { id: '5-1', name: '光伏发电', status: 'strong', count: 34 },
      { id: '5-2', name: '储能系统', status: 'weak', count: 19 },
      { id: '5-3', name: '氢能装备', status: 'missing', count: 8 },
      { id: '5-4', name: '智能电网', status: 'missing', count: 6 },
    ]
  },
];

// 产业链统一配色（任务3：统一蓝色系 + 断链灰）
export const industryChainColorConfig = {
  status: {
    strong: '#2468F2',
    weak: '#7BA3FA',
    missing: '#BFC8D6',
  },
  stream: {
    upstream: { badge: '#1E4D8C', line: '#4B83F7', shadow: 'rgba(30,77,140,0.28)' },
    midstream: { badge: '#2468F2', line: '#6D96F8', shadow: 'rgba(36,104,242,0.26)' },
    downstream: { badge: '#4B83F7', line: '#8FB0FA', shadow: 'rgba(75,131,247,0.24)' },
  },
};

// 企业数据
export const enterprises = [
  { id: 'e1', name: '宜昌人福药业有限公司', industry: '生物医药', scale: '大型', area: '宜昌市', innovationScore: 92, revenue: '58.6亿', employees: 3200, patents: 156 },
  { id: 'e2', name: '安琪酵母股份有限公司', industry: '生物医药', scale: '大型', area: '宜昌市', innovationScore: 88, revenue: '112.3亿', employees: 8500, patents: 289 },
  { id: 'e3', name: '宜化集团', industry: '绿色化工', scale: '大型', area: '宜昌市', innovationScore: 75, revenue: '86.2亿', employees: 12000, patents: 98 },
  { id: 'e4', name: '三峡新材股份有限公司', industry: '新材料', scale: '中型', area: '宜昌市', innovationScore: 82, revenue: '23.5亿', employees: 1800, patents: 67 },
  { id: 'e5', name: '宜昌南玻硅材料有限公司', industry: '新材料', scale: '中型', area: '宜昌市', innovationScore: 85, revenue: '18.9亿', employees: 950, patents: 45 },
  { id: 'e6', name: '湖北三峡实验室', industry: '装备制造', scale: '中型', area: '宜昌市', innovationScore: 95, revenue: '-', employees: 320, patents: 178 },
  { id: 'e7', name: '中船重工710研究所', industry: '装备制造', scale: '大型', area: '宜昌市', innovationScore: 94, revenue: '-', employees: 2100, patents: 342 },
  { id: 'e8', name: '三峡集团', industry: '清洁能源', scale: '特大型', area: '宜昌市', innovationScore: 91, revenue: '1089亿', employees: 45000, patents: 1256 },
];

// 人才数据
export const talents = [
  { id: 't1', name: '王建国', title: '院士', field: '生物医药', institution: '中国科学院', level: '顶尖', papers: 256, citations: 18900, hIndex: 68 },
  { id: 't2', name: '李明华', title: '教授', field: '新材料', institution: '武汉大学', level: '高端', papers: 189, citations: 8700, hIndex: 45 },
  { id: 't3', name: '张晓峰', title: '研究员', field: '装备制造', institution: '华中科技大学', level: '高端', papers: 145, citations: 6200, hIndex: 38 },
  { id: 't4', name: '刘芳', title: '教授', field: '绿色化工', institution: '三峡大学', level: '骨干', papers: 98, citations: 3400, hIndex: 28 },
  { id: 't5', name: '陈伟', title: '高级工程师', field: '清洁能源', institution: '三峡集团', level: '骨干', papers: 67, citations: 2100, hIndex: 22 },
  { id: 't6', name: '赵丽娜', title: '副教授', field: '生物医药', institution: '三峡大学', level: '中坚', papers: 56, citations: 1800, hIndex: 18 },
];

// 蓝领人才数据
export const blueCollarTalents = [
  { id: 'b1', name: '张师傅', skill: '数控加工', age: 35, experience: '12年', certificate: '高级技师', available: '即可到岗', area: '宜昌' },
  { id: 'b2', name: '李师傅', skill: '焊接工艺', age: 42, experience: '18年', certificate: '技师', available: '即可到岗', area: '宜昌' },
  { id: 'b3', name: '王师傅', skill: '电气维修', age: 38, experience: '15年', certificate: '高级技师', available: '一周内', area: '宜昌' },
  { id: 'b4', name: '刘师傅', skill: '机械装配', age: 40, experience: '16年', certificate: '高级技师', available: '即可到岗', area: '宜昌' },
  { id: 'b5', name: '陈师傅', skill: '模具制造', age: 45, experience: '20年', certificate: '高级技师', available: '两周内', area: '宜昌' },
  { id: 'b6', name: '赵师傅', skill: 'PLC编程', age: 33, experience: '10年', certificate: '技师', available: '即可到岗', area: '宜昌' },
  { id: 'b7', name: '周师傅', skill: '钳工', age: 48, experience: '25年', certificate: '高级技师', available: '即可到岗', area: '宜昌' },
  { id: 'b8', name: '吴师傅', skill: '化工操作', age: 36, experience: '13年', certificate: '技师', available: '一周内', area: '宜昌' },
  { id: 'b9', name: '郑师傅', skill: '仪表维护', age: 39, experience: '14年', certificate: '高级技师', available: '即可到岗', area: '宜昌' },
  { id: 'b10', name: '孙师傅', skill: '起重作业', age: 44, experience: '19年', certificate: '技师', available: '两周内', area: '宜昌' },
  { id: 'b11', name: '杨师傅', skill: '质量检测', age: 37, experience: '12年', certificate: '高级技师', available: '即可到岗', area: '宜昌' },
  { id: 'b12', name: '黄师傅', skill: '设备维保', age: 41, experience: '17年', certificate: '技师', available: '一周内', area: '宜昌' },
];

// 宜昌籍人才数据
export const yichangTalents = [
  {
    id: 'yc1',
    name: '陈志远',
    title: '教授/博导',
    birthplace: '宜昌市西陵区',
    currentCity: '北京',
    institution: '清华大学',
    field: '生物医药',
    researchDirection: ['基因治疗', '靶向药物递送', '纳米医学'],
    level: '顶尖',
    achievements: {
      papers: 186,
      citations: 15600,
      hIndex: 58,
      patents: 34,
      awards: ['国家自然科学二等奖', '长江学者特聘教授']
    },
    team: {
      name: '生物医药创新研究团队',
      members: 28,
      professors: 5,
      phds: 12,
      masters: 11
    },
    projects: [
      { name: '新型mRNA疫苗递送系统研发', type: '国家重点研发计划', funding: '2800万', status: '进行中' },
      { name: '肿瘤靶向纳米药物研究', type: '国家自然科学基金重点项目', funding: '320万', status: '进行中' },
    ],
    returnWillingness: '有意向',
    contact: { hasContact: true, lastContact: '2025-12' }
  },
  {
    id: 'yc2',
    name: '刘明辉',
    title: '研究员',
    birthplace: '宜昌市夷陵区',
    currentCity: '上海',
    institution: '中国科学院上海有机化学研究所',
    field: '新材料',
    researchDirection: ['高性能聚合物', '功能性碳材料', '电子化学品'],
    level: '高端',
    achievements: {
      papers: 145,
      citations: 9800,
      hIndex: 42,
      patents: 56,
      awards: ['中科院杰出科技成就奖', '上海市科技进步一等奖']
    },
    team: {
      name: '先进材料研究组',
      members: 22,
      professors: 3,
      phds: 10,
      masters: 9
    },
    projects: [
      { name: '新型锂电池隔膜材料开发', type: '国家重点研发计划', funding: '1500万', status: '进行中' },
      { name: '高导热碳纤维复合材料', type: '企业横向合作', funding: '800万', status: '已完成' },
    ],
    returnWillingness: '考虑中',
    contact: { hasContact: true, lastContact: '2026-01' }
  },
  {
    id: 'yc3',
    name: '王海燕',
    title: '教授',
    birthplace: '宜昌市当阳市',
    currentCity: '武汉',
    institution: '华中科技大学',
    field: '装备制造',
    researchDirection: ['智能传感器', '工业物联网', '数字孪生'],
    level: '高端',
    achievements: {
      papers: 128,
      citations: 7200,
      hIndex: 35,
      patents: 28,
      awards: ['湖北省科技进步一等奖', '教育部新世纪优秀人才']
    },
    team: {
      name: '智能制造实验室',
      members: 18,
      professors: 2,
      phds: 8,
      masters: 8
    },
    projects: [
      { name: '高精度MEMS传感器研发', type: '国家自然科学基金', funding: '280万', status: '进行中' },
      { name: '智能工厂数字孪生平台', type: '省重点研发计划', funding: '500万', status: '进行中' },
    ],
    returnWillingness: '有意向',
    contact: { hasContact: true, lastContact: '2025-11' }
  },
  {
    id: 'yc4',
    name: '张伟杰',
    title: '副教授',
    birthplace: '宜昌市枝江市',
    currentCity: '深圳',
    institution: '南方科技大学',
    field: '清洁能源',
    researchDirection: ['固态电池', '氢燃料电池', '能源存储'],
    level: '骨干',
    achievements: {
      papers: 78,
      citations: 4500,
      hIndex: 28,
      patents: 18,
      awards: ['深圳市孔雀计划人才']
    },
    team: {
      name: '新能源材料课题组',
      members: 12,
      professors: 1,
      phds: 5,
      masters: 6
    },
    projects: [
      { name: '全固态锂电池关键技术', type: '国家自然科学基金', funding: '85万', status: '进行中' },
      { name: '氢燃料电池膜电极开发', type: '企业合作', funding: '300万', status: '进行中' },
    ],
    returnWillingness: '暂无意向',
    contact: { hasContact: false, lastContact: '' }
  },
  {
    id: 'yc5',
    name: '李雪梅',
    title: '研究员',
    birthplace: '宜昌市点军区',
    currentCity: '杭州',
    institution: '浙江大学',
    field: '绿色化工',
    researchDirection: ['绿色催化', '生物基材料', '碳中和技术'],
    level: '高端',
    achievements: {
      papers: 112,
      citations: 6800,
      hIndex: 32,
      patents: 42,
      awards: ['浙江省杰出青年基金', '中国化学会青年化学奖']
    },
    team: {
      name: '绿色化学研究中心',
      members: 20,
      professors: 3,
      phds: 9,
      masters: 8
    },
    projects: [
      { name: '生物质高值化利用技术', type: '国家重点研发计划', funding: '1200万', status: '进行中' },
      { name: 'CO2催化转化制高值化学品', type: '省重大科技专项', funding: '600万', status: '进行中' },
    ],
    returnWillingness: '有意向',
    contact: { hasContact: true, lastContact: '2026-01' }
  },
  {
    id: 'yc6',
    name: '周建华',
    title: '院士',
    birthplace: '宜昌市伍家岗区',
    currentCity: '北京',
    institution: '中国工程院',
    field: '生物医药',
    researchDirection: ['生物制药', '疫苗研发', '免疫治疗'],
    level: '顶尖',
    achievements: {
      papers: 320,
      citations: 28000,
      hIndex: 75,
      patents: 68,
      awards: ['国家科技进步一等奖', '何梁何利基金科学与技术进步奖']
    },
    team: {
      name: '生物制药国家重点实验室',
      members: 65,
      professors: 12,
      phds: 28,
      masters: 25
    },
    projects: [
      { name: '新型重组蛋白疫苗平台', type: '国家科技重大专项', funding: '8000万', status: '进行中' },
      { name: '创新抗体药物研发', type: '国家重点研发计划', funding: '3500万', status: '进行中' },
    ],
    returnWillingness: '有意向',
    contact: { hasContact: true, lastContact: '2025-12' }
  },
];

// 宜昌籍人才统计
export const yichangTalentStats = {
  total: 1256,
  distribution: {
    topLevel: 8,
    highLevel: 89,
    middleLevel: 356,
    basicLevel: 803
  },
  cityDistribution: [
    { city: '北京', count: 245 },
    { city: '上海', count: 198 },
    { city: '深圳', count: 156 },
    { city: '武汉', count: 312 },
    { city: '杭州', count: 89 },
    { city: '广州', count: 78 },
    { city: '其他', count: 178 },
  ],
  fieldDistribution: [
    { field: '生物医药', count: 286 },
    { field: '新材料', count: 234 },
    { field: '装备制造', count: 312 },
    { field: '绿色化工', count: 198 },
    { field: '清洁能源', count: 156 },
    { field: '其他', count: 70 },
  ],
  returnWillingness: {
    willing: 156,
    considering: 289,
    notWilling: 456,
    unknown: 355
  }
};

// 技术数据
export const technologies = [
  { id: 'tech1', name: '基因编辑技术', field: '生物医药', patents: 234, standards: 12, projects: 45, trend: 'hot', growthRate: 35.6 },
  { id: 'tech2', name: '高性能碳纤维', field: '新材料', patents: 189, standards: 8, projects: 28, trend: 'hot', growthRate: 28.3 },
  { id: 'tech3', name: '智能传感器', field: '装备制造', patents: 312, standards: 15, projects: 56, trend: 'stable', growthRate: 12.5 },
  { id: 'tech4', name: '绿色催化工艺', field: '绿色化工', patents: 145, standards: 6, projects: 22, trend: 'growing', growthRate: 18.9 },
  { id: 'tech5', name: '固态电池技术', field: '清洁能源', patents: 278, standards: 4, projects: 34, trend: 'hot', growthRate: 45.2 },
];

// 资金/融资数据
export const fundingProducts = [
  { id: 'f1', name: '科技成果转化贷', type: '信贷', institution: '宜昌农商银行', maxAmount: '1000万', rate: '3.85%', term: '3年', applicable: '科技型企业' },
  { id: 'f2', name: '绿色信贷', type: '信贷', institution: '兴业银行宜昌分行', maxAmount: '5000万', rate: '3.65%', term: '5年', applicable: '绿色环保企业' },
  { id: 'f3', name: '知识产权质押融资', type: '担保', institution: '湖北担保集团', maxAmount: '2000万', rate: '4.25%', term: '2年', applicable: '拥有核心专利企业' },
  { id: 'f4', name: '贴息贷款', type: '贴息', institution: '宜昌市财政局', maxAmount: '500万', rate: '50%贴息', term: '2年', applicable: '中小微企业' },
  { id: 'f5', name: '专精特新企业贷', type: '信贷', institution: '工商银行宜昌分行', maxAmount: '3000万', rate: '3.75%', term: '3年', applicable: '专精特新企业' },
  { id: 'f6', name: '供应链金融', type: '信贷', institution: '建设银行宜昌分行', maxAmount: '2000万', rate: '4.05%', term: '1年', applicable: '核心企业上下游' },
  { id: 'f7', name: '设备融资租赁', type: '租赁', institution: '三峡融资租赁', maxAmount: '5000万', rate: '4.50%', term: '5年', applicable: '制造业企业' },
  { id: 'f8', name: '创业担保贷款', type: '担保', institution: '宜昌市人社局', maxAmount: '300万', rate: '政府贴息', term: '3年', applicable: '创业企业/个人' },
];

export const investmentInstitutions = [
  // VC/PE
  { id: 'i1', name: '深创投', type: 'VC', focus: ['生物医药', '新材料'], stage: '早期/成长期', cases: 156, fundSize: '150亿', description: '国内领先的创投机构，专注科技创新领域' },
  { id: 'i2', name: '红杉中国', type: 'VC', focus: ['清洁能源', '智能制造'], stage: '成长期', cases: 234, fundSize: '200亿', description: '全球顶级风投，重点布局新能源赛道' },
  { id: 'i3', name: '湖北高投', type: 'PE', focus: ['装备制造', '绿色化工'], stage: '成长期/成熟期', cases: 89, fundSize: '80亿', description: '湖北省属国有创投平台' },
  { id: 'i4', name: '达晨财智', type: 'VC', focus: ['生物医药', '新材料'], stage: '成长期', cases: 178, fundSize: '120亿', description: '专注本土创新企业投资' },
  // 引导基金
  { id: 'i5', name: '宜昌市政府引导基金', type: '引导基金', focus: ['生物医药', '新材料', '清洁能源', '装备制造', '绿色化工'], stage: '各阶段', cases: 68, fundSize: '100亿', description: '市级政府引导基金，撬动社会资本支持产业发展' },
  { id: 'i6', name: '湖北省科技创新引导基金', type: '引导基金', focus: ['生物医药', '新材料', '智能制造'], stage: '早期/成长期', cases: 125, fundSize: '200亿', description: '省级科技引导基金，支持科技成果转化' },
  { id: 'i7', name: '长江经济带产业引导基金', type: '引导基金', focus: ['清洁能源', '绿色化工', '装备制造'], stage: '成长期/成熟期', cases: 89, fundSize: '500亿', description: '国家级引导基金，推动长江经济带高质量发展' },
  // 天使基金
  { id: 'i8', name: '宜昌天使投资基金', type: '天使基金', focus: ['生物医药', '新材料', '智能制造'], stage: '种子期/天使轮', cases: 42, fundSize: '5亿', description: '专注早期科创项目，单笔投资100-500万' },
  { id: 'i9', name: '湖北省天使投资引导基金', type: '天使基金', focus: ['生物医药', '清洁能源', '新材料'], stage: '种子期/天使轮', cases: 156, fundSize: '20亿', description: '省级天使基金，支持初创期科技企业' },
  { id: 'i10', name: '三峡创新天使基金', type: '天使基金', focus: ['清洁能源', '新材料'], stage: '种子期/天使轮', cases: 28, fundSize: '3亿', description: '三峡集团旗下天使基金，聚焦新能源技术' },
  // 产业基金
  { id: 'i11', name: '宜昌产业发展基金', type: '产业基金', focus: ['生物医药', '新材料', '清洁能源'], stage: '各阶段', cases: 45, fundSize: '50亿', description: '市属产业基金，支持重点产业发展' },
  { id: 'i12', name: '宜昌生物医药产业基金', type: '产业基金', focus: ['生物医药'], stage: '成长期/成熟期', cases: 23, fundSize: '30亿', description: '专项产业基金，支持生物医药龙头企业' },
  { id: 'i13', name: '三峡绿色产业基金', type: '产业基金', focus: ['清洁能源', '绿色化工'], stage: '成长期', cases: 35, fundSize: '80亿', description: '聚焦绿色低碳产业投资' },
  // 母基金
  { id: 'i14', name: '湖北省母基金', type: '母基金', focus: ['生物医药', '新材料', '装备制造', '清洁能源', '绿色化工'], stage: '各阶段', cases: 58, fundSize: '300亿', description: '省级母基金，通过子基金投资优质项目' },
  { id: 'i15', name: '国家中小企业发展基金', type: '母基金', focus: ['智能制造', '新材料', '生物医药'], stage: '成长期', cases: 245, fundSize: '600亿', description: '国家级母基金，支持中小企业发展' },
];

// 基金类型统计
export const fundTypeStats = [
  { type: 'VC', count: 45, totalSize: '580亿', avgDeal: '2000-8000万' },
  { type: 'PE', count: 28, totalSize: '420亿', avgDeal: '5000万-2亿' },
  { type: '引导基金', count: 15, totalSize: '1200亿', avgDeal: '配套社会资本' },
  { type: '天使基金', count: 22, totalSize: '35亿', avgDeal: '100-500万' },
  { type: '产业基金', count: 18, totalSize: '280亿', avgDeal: '3000万-1亿' },
  { type: '母基金', count: 8, totalSize: '1500亿', avgDeal: '通过子基金投资' },
];

// 政策数据
export const policies = [
  {
    id: 'p1',
    title: '宜昌市促进生物医药产业发展若干政策',
    department: '宜昌市人民政府',
    publishDate: '2025-12-15',
    deadline: '2026-06-30',
    type: '产业',
    tags: ['生物医药', '研发补贴', '人才引进'],
    summary: '对新落户的生物医药企业给予最高2000万元落户奖励，研发投入按10%给予补贴...',
    status: 'active'
  },
  {
    id: 'p2',
    title: '关于支持科技创新的若干措施',
    department: '宜昌市科技局',
    publishDate: '2025-11-20',
    deadline: '2026-03-31',
    type: '技术',
    tags: ['研发补贴', '专利奖励', '科技成果'],
    summary: '对获得发明专利的企业给予5万元/件奖励，省级以上科技奖励配套50%...',
    status: 'active'
  },
  {
    id: 'p3',
    title: '宜昌市高层次人才引进计划',
    department: '宜昌市人社局',
    publishDate: '2025-10-08',
    deadline: '长期有效',
    type: '人才',
    tags: ['人才引进', '安家补贴', '项目资助'],
    summary: '对引进的院士给予500万元安家补贴，国家级人才100万元，省级人才50万元...',
    status: 'active'
  },
  {
    id: 'p4',
    title: '绿色金融支持实体经济发展意见',
    department: '宜昌市金融办',
    publishDate: '2025-09-25',
    deadline: '2026-12-31',
    type: '资金',
    tags: ['绿色信贷', '贴息', '担保'],
    summary: '对绿色产业项目贷款给予50%贴息支持，最高补贴100万元...',
    status: 'active'
  },
  {
    id: 'p5',
    title: '宜昌市新材料产业发展专项扶持政策',
    department: '宜昌市工信局',
    publishDate: '2025-11-05',
    deadline: '2026-05-31',
    type: '产业',
    tags: ['新材料', '技改补贴', '首台套'],
    summary: '对新材料企业技改项目按投资额15%给予补贴，最高500万元；首台套产品按销售额10%奖励...',
    status: 'active'
  },
  {
    id: 'p6',
    title: '关于加快装备制造业转型升级的实施意见',
    department: '宜昌市发改委',
    publishDate: '2025-10-18',
    deadline: '2026-10-31',
    type: '产业',
    tags: ['装备制造', '智能化', '数字化'],
    summary: '支持装备制造企业智能化改造，对数字化车间给予100万元奖励，智能工厂200万元奖励...',
    status: 'active'
  },
  {
    id: 'p7',
    title: '宜昌市博士后工作站建设管理办法',
    department: '宜昌市人社局',
    publishDate: '2025-08-20',
    deadline: '长期有效',
    type: '人才',
    tags: ['博士后', '科研补贴', '平台建设'],
    summary: '新设立博士后工作站给予50万元建站资助，在站博士后每人每年15万元生活补贴...',
    status: 'active'
  },
  {
    id: 'p8',
    title: '促进清洁能源产业高质量发展若干措施',
    department: '宜昌市发改委',
    publishDate: '2025-12-01',
    deadline: '2026-11-30',
    type: '产业',
    tags: ['清洁能源', '光伏', '储能'],
    summary: '对新建光伏、储能项目按装机容量给予补贴，分布式光伏0.1元/瓦，集中式储能200元/千瓦时...',
    status: 'active'
  },
  {
    id: 'p9',
    title: '宜昌市科技型中小企业培育计划',
    department: '宜昌市科技局',
    publishDate: '2025-09-10',
    deadline: '2026-09-30',
    type: '技术',
    tags: ['科技型企业', '高企培育', '研发奖励'],
    summary: '首次认定为高新技术企业奖励30万元，科技型中小企业入库奖励5万元，研发费用加计扣除...',
    status: 'active'
  },
  {
    id: 'p10',
    title: '关于支持企业上市挂牌的若干政策',
    department: '宜昌市金融办',
    publishDate: '2025-07-15',
    deadline: '长期有效',
    type: '资金',
    tags: ['上市奖励', 'IPO', '新三板'],
    summary: '企业成功上市奖励500万元，新三板挂牌奖励100万元，北交所上市奖励300万元...',
    status: 'active'
  },
  {
    id: 'p11',
    title: '宜昌市技能人才培养激励办法',
    department: '宜昌市人社局',
    publishDate: '2025-11-28',
    deadline: '2026-12-31',
    type: '人才',
    tags: ['技能人才', '职业培训', '技能竞赛'],
    summary: '获得全国技能大赛金牌奖励50万元，银牌30万元；新建技能大师工作室资助20万元...',
    status: 'active'
  },
  {
    id: 'p12',
    title: '绿色化工产业园区企业入驻优惠政策',
    department: '宜昌高新区管委会',
    publishDate: '2025-10-25',
    deadline: '2026-04-30',
    type: '产业',
    tags: ['绿色化工', '园区入驻', '租金减免'],
    summary: '入驻企业前三年租金全免，后两年减半；固定资产投资超1亿元的项目给予500万元落户奖励...',
    status: 'active'
  },
  {
    id: 'p13',
    title: '宜昌市专精特新企业培育行动方案',
    department: '宜昌市工信局',
    publishDate: '2025-12-10',
    deadline: '2026-08-31',
    type: '产业',
    tags: ['专精特新', '小巨人', '创新补贴'],
    summary: '对首次认定为国家级专精特新"小巨人"企业奖励100万元，省级专精特新企业奖励30万元...',
    status: 'active'
  },
  {
    id: 'p14',
    title: '关于促进算力及大数据产业发展的若干政策',
    department: '宜昌市发改委',
    publishDate: '2025-11-15',
    deadline: '2026-11-30',
    type: '技术',
    tags: ['大数据', '算力中心', '数字经济'],
    summary: '对新建大型数据中心项目按投资额8%给予补贴，最高1000万元；引进算力企业给予三年办公用房补贴...',
    status: 'active'
  },
  {
    id: 'p15',
    title: '宜昌市文化旅游产业高质量发展扶持办法',
    department: '宜昌市文旅局',
    publishDate: '2025-09-20',
    deadline: '2026-09-30',
    type: '产业',
    tags: ['文化旅游', '景区提升', '文创扶持'],
    summary: '对创建为5A级景区的给予500万元奖励，4A级200万元；文创产品研发按投入30%给予补贴...',
    status: 'active'
  },
  {
    id: 'p16',
    title: '宜昌市创业担保贷款实施细则',
    department: '宜昌市人社局',
    publishDate: '2025-08-05',
    deadline: '长期有效',
    type: '资金',
    tags: ['创业贷款', '贴息', '担保'],
    summary: '个人创业担保贷款最高30万元，小微企业最高400万元，贷款利率LPR以内部分由财政全额贴息...',
    status: 'active'
  },
  {
    id: 'p17',
    title: '关于加快新能源汽车产业链建设的实施意见',
    department: '宜昌市工信局',
    publishDate: '2025-12-20',
    deadline: '2026-12-31',
    type: '产业',
    tags: ['新能源汽车', '零部件', '充电设施'],
    summary: '对新引进新能源汽车整车项目按固定资产投资额5%给予补贴；零部件企业配套本地整车厂奖励50万元...',
    status: 'active'
  },
];

// 产业图谱节点数据 - 每列为树状结构（父→子关系）
export interface IndustryGraphNode {
  id: string;
  name: string;
  status: 'strong' | 'weak' | 'missing';
  enterprises: number;
  talents: number;
  localEnterprises: number;
  localTalents: number;
  children?: IndustryGraphNode[];
}

export interface IndustryGraphColumn {
  label: string;
  root: IndustryGraphNode;
}

export interface IndustryGraphSet {
  upstream: IndustryGraphColumn;
  midstream: IndustryGraphColumn;
  downstream: IndustryGraphColumn;
}

// 6条产业链的图谱数据（从 industryChainGraphData.ts 导入）
// import 已移至文件顶部
export const industryGraphDataMap: Record<string, IndustryGraphSet> = industryChainGraphData;

// 各产业链的总览统计数据
export const industryOverviewDataMap: Record<string, {
  chainCount: number; strong: number; weak: number; missing: number; enterprises: number; talents: number;
  institutionType: Array<{ name: string; value: number }>;
  provinceEnterprise: Array<{ name: string; value: number }>;
  provinceTalent: Array<{ name: string; value: number }>;
  talentType: Array<{ name: string; value: number; itemStyle: { color: string } }>;
}> = {
  chemical: {
    chainCount: 8, strong: 10, weak: 7, missing: 6, enterprises: 1890, talents: 3200,
    institutionType: [
      { name: '上市公司', value: 12 }, { name: '专精特新企业', value: 86 }, { name: '科技型中小企业', value: 420 }, { name: '全量科技企业', value: 1890 },
    ],
    provinceEnterprise: [
      { name: '湖北', value: 580 }, { name: '江苏', value: 320 }, { name: '山东', value: 280 }, { name: '浙江', value: 210 }, { name: '广东', value: 165 }, { name: '安徽', value: 130 }, { name: '河南', value: 95 }, { name: '四川', value: 78 },
    ],
    provinceTalent: [
      { name: '湖北', value: 480 }, { name: '江苏', value: 356 }, { name: '山东', value: 298 }, { name: '浙江', value: 245 }, { name: '广东', value: 210 }, { name: '北京', value: 195 }, { name: '上海', value: 168 }, { name: '安徽', value: 132 }, { name: '四川', value: 105 }, { name: '河南', value: 95 }, { name: '湖南', value: 78 }, { name: '河北', value: 65 }, { name: '辽宁', value: 52 }, { name: '陕西', value: 45 }, { name: '重庆', value: 38 }, { name: '福建', value: 32 }, { name: '天津', value: 28 }, { name: '吉林', value: 22 }, { name: '江西', value: 18 }, { name: '山西', value: 15 }, { name: '黑龙江', value: 12 }, { name: '云南', value: 10 }, { name: '广西', value: 8 }, { name: '贵州', value: 6 }, { name: '甘肃', value: 5 }, { name: '内蒙古', value: 4 }, { name: '新疆', value: 3 }, { name: '海南', value: 2 }, { name: '宁夏', value: 2 }, { name: '青海', value: 1 }, { name: '台湾', value: 15 },
    ],
    talentType: [
      { name: '院士', value: 12, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 98, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 856, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 2234, itemStyle: { color: '#52c41a' } },
    ],
  },
  energy: {
    chainCount: 6, strong: 8, weak: 5, missing: 7, enterprises: 1450, talents: 2800,
    institutionType: [
      { name: '上市公司', value: 18 }, { name: '专精特新企业', value: 125 }, { name: '科技型中小企业', value: 560 }, { name: '全量科技企业', value: 1450 },
    ],
    provinceEnterprise: [
      { name: '广东', value: 420 }, { name: '江苏', value: 380 }, { name: '浙江', value: 265 }, { name: '湖北', value: 180 }, { name: '安徽', value: 155 }, { name: '上海', value: 120 }, { name: '四川', value: 88 }, { name: '北京', value: 72 },
    ],
    provinceTalent: [
      { name: '广东', value: 420 }, { name: '江苏', value: 380 }, { name: '浙江', value: 295 }, { name: '北京', value: 265 }, { name: '上海', value: 230 }, { name: '湖北', value: 195 }, { name: '安徽', value: 155 }, { name: '四川', value: 118 }, { name: '湖南', value: 95 }, { name: '陕西', value: 82 }, { name: '山东', value: 68 }, { name: '河南', value: 55 }, { name: '福建', value: 48 }, { name: '重庆', value: 42 }, { name: '天津', value: 35 }, { name: '辽宁', value: 28 }, { name: '吉林', value: 22 }, { name: '黑龙江', value: 18 }, { name: '江西', value: 15 }, { name: '河北', value: 45 }, { name: '山西', value: 12 }, { name: '云南', value: 10 }, { name: '广西', value: 8 }, { name: '贵州', value: 6 }, { name: '甘肃', value: 5 }, { name: '内蒙古', value: 8 }, { name: '新疆', value: 5 }, { name: '海南', value: 3 }, { name: '宁夏', value: 2 }, { name: '青海', value: 2 }, { name: '台湾', value: 22 },
    ],
    talentType: [
      { name: '院士', value: 8, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 115, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 920, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 1757, itemStyle: { color: '#52c41a' } },
    ],
  },
  bio: {
    chainCount: 7, strong: 12, weak: 8, missing: 5, enterprises: 1680, talents: 3500,
    institutionType: [
      { name: '上市公司', value: 28 }, { name: '专精特新企业', value: 156 }, { name: '科技型中小企业', value: 650 }, { name: '全量科技企业', value: 1680 },
    ],
    provinceEnterprise: [
      { name: '湖北', value: 480 }, { name: '广东', value: 350 }, { name: '江苏', value: 290 }, { name: '上海', value: 245 }, { name: '北京', value: 210 }, { name: '浙江', value: 178 }, { name: '山东', value: 125 }, { name: '四川', value: 98 },
    ],
    provinceTalent: [
      { name: '北京', value: 456 }, { name: '上海', value: 398 }, { name: '湖北', value: 380 }, { name: '广东', value: 335 }, { name: '江苏', value: 285 }, { name: '浙江', value: 228 }, { name: '四川', value: 165 }, { name: '山东', value: 138 }, { name: '陕西', value: 112 }, { name: '安徽', value: 95 }, { name: '湖南', value: 82 }, { name: '河南', value: 68 }, { name: '辽宁', value: 55 }, { name: '重庆', value: 48 }, { name: '天津', value: 42 }, { name: '福建', value: 35 }, { name: '吉林', value: 28 }, { name: '黑龙江', value: 25 }, { name: '江西', value: 22 }, { name: '河北', value: 52 }, { name: '山西', value: 18 }, { name: '云南', value: 15 }, { name: '广西', value: 12 }, { name: '贵州', value: 10 }, { name: '甘肃', value: 8 }, { name: '内蒙古', value: 5 }, { name: '新疆', value: 4 }, { name: '海南', value: 8 }, { name: '宁夏', value: 3 }, { name: '青海', value: 2 }, { name: '台湾', value: 28 },
    ],
    talentType: [
      { name: '院士', value: 18, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 145, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 1200, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 2137, itemStyle: { color: '#52c41a' } },
    ],
  },
  auto: {
    chainCount: 9, strong: 18, weak: 9, missing: 4, enterprises: 2100, talents: 4200,
    institutionType: [
      { name: '上市公司', value: 35 }, { name: '专精特新企业', value: 210 }, { name: '科技型中小企业', value: 780 }, { name: '全量科技企业', value: 2100 },
    ],
    provinceEnterprise: [
      { name: '湖北', value: 520 }, { name: '广东', value: 410 }, { name: '江苏', value: 340 }, { name: '浙江', value: 260 }, { name: '上海', value: 220 }, { name: '山东', value: 185 }, { name: '安徽', value: 155 }, { name: '重庆', value: 120 },
    ],
    provinceTalent: [
      { name: '湖北', value: 520 }, { name: '广东', value: 450 }, { name: '江苏', value: 385 }, { name: '上海', value: 340 }, { name: '北京', value: 310 }, { name: '浙江', value: 268 }, { name: '安徽', value: 215 }, { name: '重庆', value: 178 }, { name: '四川', value: 148 }, { name: '山东', value: 195 }, { name: '湖南', value: 125 }, { name: '河南', value: 108 }, { name: '辽宁', value: 95 }, { name: '吉林', value: 82 }, { name: '河北', value: 75 }, { name: '天津', value: 65 }, { name: '陕西', value: 58 }, { name: '黑龙江', value: 45 }, { name: '福建', value: 42 }, { name: '江西', value: 35 }, { name: '山西', value: 28 }, { name: '云南', value: 18 }, { name: '广西', value: 15 }, { name: '贵州', value: 12 }, { name: '甘肃', value: 8 }, { name: '内蒙古', value: 6 }, { name: '新疆', value: 5 }, { name: '海南', value: 4 }, { name: '宁夏', value: 3 }, { name: '青海', value: 2 }, { name: '台湾', value: 18 },
    ],
    talentType: [
      { name: '院士', value: 22, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 180, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 1450, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 2548, itemStyle: { color: '#52c41a' } },
    ],
  },
  bigdata: {
    chainCount: 5, strong: 3, weak: 8, missing: 9, enterprises: 680, talents: 1800,
    institutionType: [
      { name: '上市公司', value: 5 }, { name: '专精特新企业', value: 42 }, { name: '科技型中小企业', value: 220 }, { name: '全量科技企业', value: 680 },
    ],
    provinceEnterprise: [
      { name: '北京', value: 280 }, { name: '广东', value: 220 }, { name: '上海', value: 185 }, { name: '浙江', value: 150 }, { name: '江苏', value: 120 }, { name: '湖北', value: 65 }, { name: '四川', value: 55 }, { name: '福建', value: 42 },
    ],
    provinceTalent: [
      { name: '北京', value: 380 }, { name: '广东', value: 310 }, { name: '上海', value: 265 }, { name: '浙江', value: 215 }, { name: '江苏', value: 178 }, { name: '四川', value: 98 }, { name: '湖北', value: 85 }, { name: '陕西', value: 62 }, { name: '湖南', value: 48 }, { name: '安徽', value: 42 }, { name: '山东', value: 35 }, { name: '福建', value: 32 }, { name: '重庆', value: 28 }, { name: '天津', value: 25 }, { name: '辽宁', value: 18 }, { name: '河南', value: 15 }, { name: '吉林', value: 12 }, { name: '黑龙江', value: 10 }, { name: '河北', value: 18 }, { name: '江西', value: 8 }, { name: '山西', value: 6 }, { name: '云南', value: 5 }, { name: '广西', value: 4 }, { name: '贵州', value: 8 }, { name: '甘肃', value: 3 }, { name: '内蒙古', value: 2 }, { name: '新疆', value: 2 }, { name: '海南', value: 5 }, { name: '宁夏', value: 1 }, { name: '青海', value: 1 }, { name: '台湾', value: 12 },
    ],
    talentType: [
      { name: '院士', value: 5, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 65, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 580, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 1150, itemStyle: { color: '#52c41a' } },
    ],
  },
  // ===== 新增 6 条产业链总览数据 =====
  ai: {
    chainCount: 12, strong: 45, weak: 28, missing: 15, enterprises: 2450, talents: 5800,
    institutionType: [
      { name: '上市公司', value: 42 }, { name: '专精特新企业', value: 186 }, { name: '科技型中小企业', value: 720 }, { name: '全量科技企业', value: 2450 },
    ],
    provinceEnterprise: [
      { name: '北京', value: 680 }, { name: '广东', value: 520 }, { name: '上海', value: 410 }, { name: '浙江', value: 320 }, { name: '江苏', value: 280 }, { name: '湖北', value: 95 }, { name: '四川', value: 78 }, { name: '山东', value: 55 },
    ],
    provinceTalent: [
      { name: '北京', value: 1250 }, { name: '上海', value: 850 }, { name: '广东', value: 780 }, { name: '浙江', value: 520 }, { name: '江苏', value: 450 }, { name: '湖北', value: 180 }, { name: '四川', value: 165 }, { name: '陕西', value: 120 }, { name: '安徽', value: 95 }, { name: '湖南', value: 75 }, { name: '山东', value: 68 }, { name: '天津', value: 55 }, { name: '重庆', value: 48 }, { name: '辽宁', value: 42 }, { name: '福建', value: 38 }, { name: '河南', value: 32 }, { name: '吉林', value: 25 }, { name: '黑龙江', value: 22 }, { name: '河北', value: 35 }, { name: '江西', value: 18 }, { name: '山西', value: 12 }, { name: '云南', value: 10 }, { name: '广西', value: 8 }, { name: '贵州', value: 6 }, { name: '甘肃', value: 5 }, { name: '内蒙古', value: 4 }, { name: '新疆', value: 3 }, { name: '海南', value: 8 }, { name: '宁夏', value: 2 }, { name: '青海', value: 1 }, { name: '台湾', value: 28 },
    ],
    talentType: [
      { name: '院士', value: 28, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 210, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 1850, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 3712, itemStyle: { color: '#52c41a' } },
    ],
  },
  newenergy: {
    chainCount: 15, strong: 52, weak: 35, missing: 18, enterprises: 3200, talents: 6500,
    institutionType: [
      { name: '上市公司', value: 58 }, { name: '专精特新企业', value: 245 }, { name: '科技型中小企业', value: 980 }, { name: '全量科技企业', value: 3200 },
    ],
    provinceEnterprise: [
      { name: '广东', value: 720 }, { name: '江苏', value: 580 }, { name: '浙江', value: 420 }, { name: '湖北', value: 310 }, { name: '安徽', value: 255 }, { name: '上海', value: 198 }, { name: '四川', value: 145 }, { name: '北京', value: 120 },
    ],
    provinceTalent: [
      { name: '广东', value: 820 }, { name: '江苏', value: 680 }, { name: '浙江', value: 520 }, { name: '北京', value: 480 }, { name: '上海', value: 410 }, { name: '湖北', value: 350 }, { name: '安徽', value: 285 }, { name: '四川', value: 215 }, { name: '湖南', value: 165 }, { name: '陕西', value: 135 }, { name: '山东', value: 118 }, { name: '河南', value: 95 }, { name: '福建', value: 82 }, { name: '重庆', value: 68 }, { name: '天津', value: 55 }, { name: '辽宁', value: 48 }, { name: '吉林', value: 35 }, { name: '黑龙江', value: 28 }, { name: '江西', value: 25 }, { name: '河北', value: 72 }, { name: '山西', value: 22 }, { name: '云南', value: 18 }, { name: '广西', value: 15 }, { name: '贵州', value: 12 }, { name: '甘肃', value: 8 }, { name: '内蒙古', value: 15 }, { name: '新疆', value: 8 }, { name: '海南', value: 5 }, { name: '宁夏', value: 3 }, { name: '青海', value: 3 }, { name: '台湾', value: 35 },
    ],
    talentType: [
      { name: '院士', value: 15, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 185, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 2100, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 4200, itemStyle: { color: '#52c41a' } },
    ],
  },
  yeast: {
    chainCount: 8, strong: 28, weak: 18, missing: 8, enterprises: 860, talents: 1950,
    institutionType: [
      { name: '上市公司', value: 8 }, { name: '专精特新企业', value: 65 }, { name: '科技型中小企业', value: 285 }, { name: '全量科技企业', value: 860 },
    ],
    provinceEnterprise: [
      { name: '湖北', value: 280 }, { name: '广东', value: 145 }, { name: '山东', value: 120 }, { name: '江苏', value: 98 }, { name: '河南', value: 72 }, { name: '内蒙古', value: 55 }, { name: '安徽', value: 48 }, { name: '上海', value: 35 },
    ],
    provinceTalent: [
      { name: '湖北', value: 380 }, { name: '北京', value: 210 }, { name: '上海', value: 185 }, { name: '广东', value: 165 }, { name: '山东', value: 145 }, { name: '江苏', value: 128 }, { name: '河南', value: 85 }, { name: '浙江', value: 72 }, { name: '安徽', value: 58 }, { name: '四川', value: 48 }, { name: '内蒙古', value: 42 }, { name: '湖南', value: 38 }, { name: '陕西', value: 32 }, { name: '福建', value: 28 }, { name: '重庆', value: 22 }, { name: '天津', value: 18 }, { name: '辽宁', value: 15 }, { name: '黑龙江', value: 12 }, { name: '吉林', value: 10 }, { name: '河北', value: 28 }, { name: '江西', value: 8 }, { name: '山西', value: 6 }, { name: '云南', value: 5 }, { name: '广西', value: 4 }, { name: '贵州', value: 3 }, { name: '甘肃', value: 2 }, { name: '新疆', value: 2 }, { name: '海南', value: 2 }, { name: '宁夏', value: 1 }, { name: '青海', value: 1 }, { name: '台湾', value: 8 },
    ],
    talentType: [
      { name: '院士', value: 6, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 72, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 620, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 1252, itemStyle: { color: '#52c41a' } },
    ],
  },
  pharma: {
    chainCount: 10, strong: 32, weak: 22, missing: 12, enterprises: 1580, talents: 3800,
    institutionType: [
      { name: '上市公司', value: 32 }, { name: '专精特新企业', value: 168 }, { name: '科技型中小企业', value: 620 }, { name: '全量科技企业', value: 1580 },
    ],
    provinceEnterprise: [
      { name: '湖北', value: 420 }, { name: '江苏', value: 310 }, { name: '广东', value: 265 }, { name: '浙江', value: 195 }, { name: '上海', value: 168 }, { name: '山东', value: 125 }, { name: '北京', value: 98 }, { name: '四川', value: 75 },
    ],
    provinceTalent: [
      { name: '北京', value: 520 }, { name: '上海', value: 450 }, { name: '湖北', value: 420 }, { name: '江苏', value: 380 }, { name: '广东', value: 328 }, { name: '浙江', value: 265 }, { name: '四川', value: 185 }, { name: '山东', value: 155 }, { name: '陕西', value: 118 }, { name: '安徽', value: 95 }, { name: '湖南', value: 85 }, { name: '河南', value: 72 }, { name: '辽宁', value: 58 }, { name: '重庆', value: 52 }, { name: '天津', value: 45 }, { name: '福建', value: 38 }, { name: '吉林', value: 32 }, { name: '黑龙江', value: 28 }, { name: '江西', value: 25 }, { name: '河北', value: 55 }, { name: '山西', value: 20 }, { name: '云南', value: 16 }, { name: '广西', value: 12 }, { name: '贵州', value: 10 }, { name: '甘肃', value: 8 }, { name: '内蒙古', value: 5 }, { name: '新疆', value: 4 }, { name: '海南', value: 10 }, { name: '宁夏', value: 3 }, { name: '青海', value: 2 }, { name: '台湾', value: 32 },
    ],
    talentType: [
      { name: '院士', value: 22, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 165, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 1350, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 2263, itemStyle: { color: '#52c41a' } },
    ],
  },
  ship: {
    chainCount: 9, strong: 35, weak: 25, missing: 10, enterprises: 1120, talents: 2650,
    institutionType: [
      { name: '上市公司', value: 15 }, { name: '专精特新企业', value: 98 }, { name: '科技型中小企业', value: 420 }, { name: '全量科技企业', value: 1120 },
    ],
    provinceEnterprise: [
      { name: '湖北', value: 320 }, { name: '江苏', value: 210 }, { name: '广东', value: 168 }, { name: '上海', value: 145 }, { name: '浙江', value: 112 }, { name: '山东', value: 85 }, { name: '辽宁', value: 65 }, { name: '福建', value: 48 },
    ],
    provinceTalent: [
      { name: '湖北', value: 420 }, { name: '上海', value: 350 }, { name: '江苏', value: 285 }, { name: '广东', value: 245 }, { name: '浙江', value: 195 }, { name: '北京', value: 168 }, { name: '辽宁', value: 135 }, { name: '山东', value: 112 }, { name: '四川', value: 85 }, { name: '天津', value: 72 }, { name: '福建', value: 65 }, { name: '湖南', value: 55 }, { name: '安徽', value: 48 }, { name: '河南', value: 38 }, { name: '重庆', value: 35 }, { name: '陕西', value: 28 }, { name: '河北', value: 42 }, { name: '吉林', value: 22 }, { name: '黑龙江', value: 18 }, { name: '江西', value: 15 }, { name: '山西', value: 10 }, { name: '云南', value: 8 }, { name: '广西', value: 6 }, { name: '贵州', value: 5 }, { name: '甘肃', value: 3 }, { name: '内蒙古', value: 3 }, { name: '新疆', value: 2 }, { name: '海南', value: 4 }, { name: '宁夏', value: 2 }, { name: '青海', value: 1 }, { name: '台湾', value: 15 },
    ],
    talentType: [
      { name: '院士', value: 12, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 98, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 850, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 1690, itemStyle: { color: '#52c41a' } },
    ],
  },
  wetchem: {
    chainCount: 7, strong: 22, weak: 18, missing: 14, enterprises: 680, talents: 1620,
    institutionType: [
      { name: '上市公司', value: 10 }, { name: '专精特新企业', value: 55 }, { name: '科技型中小企业', value: 235 }, { name: '全量科技企业', value: 680 },
    ],
    provinceEnterprise: [
      { name: '江苏', value: 185 }, { name: '广东', value: 142 }, { name: '上海', value: 108 }, { name: '浙江', value: 85 }, { name: '湖北', value: 65 }, { name: '北京', value: 42 }, { name: '安徽', value: 35 }, { name: '山东', value: 28 },
    ],
    provinceTalent: [
      { name: '江苏', value: 285 }, { name: '上海', value: 248 }, { name: '广东', value: 215 }, { name: '北京', value: 195 }, { name: '浙江', value: 145 }, { name: '湖北', value: 108 }, { name: '安徽', value: 72 }, { name: '四川', value: 55 }, { name: '陕西', value: 48 }, { name: '天津', value: 42 }, { name: '山东', value: 38 }, { name: '辽宁', value: 32 }, { name: '湖南', value: 28 }, { name: '福建', value: 25 }, { name: '重庆', value: 18 }, { name: '河南', value: 15 }, { name: '吉林', value: 10 }, { name: '黑龙江', value: 8 }, { name: '河北', value: 22 }, { name: '江西', value: 6 }, { name: '山西', value: 5 }, { name: '云南', value: 3 }, { name: '广西', value: 3 }, { name: '贵州', value: 2 }, { name: '甘肃', value: 2 }, { name: '内蒙古', value: 1 }, { name: '新疆', value: 1 }, { name: '海南', value: 2 }, { name: '宁夏', value: 1 }, { name: '青海', value: 1 }, { name: '台湾', value: 18 },
    ],
    talentType: [
      { name: '院士', value: 8, itemStyle: { color: '#ff4d4f' } }, { name: '领军人才', value: 58, itemStyle: { color: '#faad14' } }, { name: '骨干人才', value: 520, itemStyle: { color: '#2468F2' } }, { name: '基础人才', value: 1034, itemStyle: { color: '#52c41a' } },
    ],
  },
};

// 产业机构类型（漏斗图数据）
export const institutionTypeData = [
  { name: '上市公司', value: 28 },
  { name: '专精特新', value: 156 },
  { name: '科技型中小企业', value: 489 },
  { name: '全量科技企业', value: 1330 },
];

// 省份企业分布
export const provinceEnterpriseData = [
  { name: '湖北', value: 580 },
  { name: '广东', value: 320 },
  { name: '江苏', value: 280 },
  { name: '浙江', value: 245 },
  { name: '上海', value: 198 },
  { name: '北京', value: 185 },
  { name: '山东', value: 165 },
  { name: '四川', value: 142 },
  { name: '河南', value: 128 },
  { name: '安徽', value: 115 },
];

// 省份人才分布（地图数据）
export const provinceTalentData = [
  { name: '湖北省', value: 480 },
  { name: '北京市', value: 356 },
  { name: '上海市', value: 298 },
  { name: '广东省', value: 275 },
  { name: '江苏省', value: 245 },
  { name: '浙江省', value: 210 },
  { name: '四川省', value: 168 },
  { name: '山东省', value: 145 },
  { name: '陕西省', value: 132 },
  { name: '安徽省', value: 118 },
  { name: '湖南省', value: 105 },
  { name: '河南省', value: 95 },
  { name: '辽宁省', value: 88 },
  { name: '重庆市', value: 78 },
  { name: '天津市', value: 72 },
  { name: '福建省', value: 65 },
  { name: '吉林省', value: 52 },
  { name: '黑龙江省', value: 48 },
  { name: '江西省', value: 45 },
  { name: '河北省', value: 42 },
  { name: '山西省', value: 38 },
  { name: '云南省', value: 35 },
  { name: '广西壮族自治区', value: 30 },
  { name: '贵州省', value: 28 },
  { name: '甘肃省', value: 22 },
  { name: '内蒙古自治区', value: 18 },
  { name: '新疆维吾尔自治区', value: 15 },
  { name: '海南省', value: 12 },
  { name: '宁夏回族自治区', value: 10 },
  { name: '青海省', value: 8 },
  { name: '西藏自治区', value: 5 },
  { name: '台湾省', value: 3 },
  { name: '香港特别行政区', value: 6 },
  { name: '澳门特别行政区', value: 2 },
];

// 人才类型分布
export const talentTypeData = [
  { name: '院士', value: 45, itemStyle: { color: '#ff4d4f' } },
  { name: '领军人才', value: 328, itemStyle: { color: '#faad14' } },
  { name: '骨干人才', value: 1245, itemStyle: { color: '#2468F2' } },
  { name: '基础人才', value: 1238, itemStyle: { color: '#52c41a' } },
];

// 首页统计数据
export const dashboardStats = {
  industry: {
    totalEnterprises: 1330,
    strongLinks: 63,
    weakLinks: 35,
    missingLinks: 25,
    weeklyNew: 12,
    topShortage: ['智能传感器', '生物制品', '氢能装备']
  },
  talent: {
    totalTalents: 2856,
    topLevel: 45,
    highLevel: 328,
    middleLevel: 1245,
    shortage: ['生物医药研发', 'AI算法', '新能源技术'],
    weeklyNew: 8
  },
  tech: {
    hotTopics: 15,
    keyPatents: 4526,
    techGaps: 23,
    trendingIPC: ['A61K', 'C08L', 'H01M']
  },
  funding: {
    products: 28,
    institutions: 156,
    weeklyMatched: 34,
    totalAmount: '12.5亿'
  },
  policy: {
    activeCount: 86,
    thisWeekNew: 5,
    matchable: 42,
    nearDeadline: 8
  }
};

// 通知公告数据
export const announcements = [
  { id: 'a1', title: '关于2026年度高新技术企业认定工作的通知', date: '2026-01-10', type: 'notice', isNew: true },
  { id: 'a2', title: '宜昌市生物医药产业发展规划发布', date: '2026-01-08', type: 'news', isNew: true },
  { id: 'a3', title: '第三批专精特新企业申报即将截止', date: '2026-01-05', type: 'warning', isNew: false },
  { id: 'a4', title: '2025年度科技成果转化项目评审结果公示', date: '2026-01-03', type: 'notice', isNew: false },
];

// 工作台数据
export const workbench = {
  myLists: [
    { id: 'l1', name: '招商候选清单', count: 28, lastUpdate: '2026-01-10' },
    { id: 'l2', name: '引才对象清单', count: 15, lastUpdate: '2026-01-09' },
    { id: 'l3', name: '融资对接清单', count: 12, lastUpdate: '2026-01-08' },
    { id: 'l4', name: '申报对象清单', count: 8, lastUpdate: '2026-01-07' },
  ],
  alerts: [
    { id: 'al1', type: 'policy', message: '3项政策将于本周到期', level: 'warning' },
    { id: 'al2', type: 'enterprise', message: '重点关注企业"宜化集团"有新动态', level: 'info' },
    { id: 'al3', type: 'industry', message: '生物制品环节缺链程度加深', level: 'danger' },
  ],
  recentReports: [
    { id: 'r1', name: '生物医药产业研究报告', type: '产业研究', date: '2026-01-08' },
    { id: 'r2', name: '某生物科技企业尽调报告', type: '尽调报告', date: '2026-01-05' },
    { id: 'r3', name: '2025Q4融资对接清单', type: '融资对接', date: '2025-12-28' },
  ]
};

// 企业列表详细数据
export const enterpriseList = [
  { id: 'el1', name: '兴发集团股份有限公司', legalPerson: '李国璋', status: '存续', industry: '化学原料', region: '湖北省·宜昌市·猇亭区', industryChain: '精细化工', type: '高新技术企业', logo: '', introduction: '兴发集团是中国最大的精细磷化工企业，拥有完整的磷化工产业链，主营业务包括磷矿采选、磷酸及磷酸盐、有机硅等产品的生产和销售。公司拥有国家级企业技术中心，建有博士后科研工作站。', foundDate: '1994-12-01', registeredCapital: '29.8亿元', address: '湖北省宜昌市猇亭区兴发大道1号' },
  { id: 'el2', name: '安琪酵母股份有限公司', legalPerson: '熊涛', status: '存续', industry: '食品制造', region: '湖北省·宜昌市·伍家岗区', industryChain: '生物制药', type: '上市公司', logo: '', introduction: '安琪酵母是亚洲第一、全球第二大酵母公司，专业从事酵母、酵母衍生物及相关生物制品的生产、经营和技术服务。公司是国内酵母行业首家上市企业，产品远销全球150多个国家和地区。', foundDate: '1986-03-15', registeredCapital: '8.65亿元', address: '湖北省宜昌市城东大道168号' },
  { id: 'el3', name: '宜化集团有限责任公司', legalPerson: '胡智军', status: '存续', industry: '化学原料', region: '湖北省·宜昌市·西陵区', industryChain: '精细化工', type: '国有企业', logo: '', introduction: '宜化集团是中国化工百强企业，主要从事化肥、化工产品的生产和销售，拥有尿素、磷酸二铵、聚氯乙烯等多条产品线。公司致力于绿色化工转型，积极发展新材料、新能源产业。', foundDate: '1977-05-01', registeredCapital: '45.2亿元', address: '湖北省宜昌市西陵区发展大道49号' },
  { id: 'el4', name: '人福医药集团股份公司', legalPerson: '王学海', status: '存续', industry: '医药制造', region: '湖北省·武汉市·东湖新技术开发区', industryChain: '生物制药', type: '上市公司', logo: '', introduction: '人福医药是中国医药工业百强企业，主要从事医药产品的研发、生产和销售，在麻醉药品、生育调节药品等领域处于国内领先地位。公司拥有完整的医药产业链和强大的研发能力。', foundDate: '1993-08-18', registeredCapital: '19.8亿元', address: '武汉市东湖新技术开发区光谷大道62号' },
  { id: 'el5', name: '三峡新材股份有限公司', legalPerson: '刘志明', status: '存续', industry: '非金属矿物', region: '湖北省·宜昌市·当阳市', industryChain: '新材料', type: '高新技术企业', logo: '', introduction: '三峡新材是国内领先的玻璃及新材料生产企业，主要产品包括浮法玻璃、光伏玻璃、电子玻璃等。公司拥有先进的生产工艺和技术研发能力，产品广泛应用于建筑、汽车、光伏等领域。', foundDate: '1992-11-08', registeredCapital: '6.8亿元', address: '湖北省当阳市玉泉路8号' },
  { id: 'el6', name: '华中科技大学', legalPerson: '尤政', status: '存续', industry: '科学研究', region: '湖北省·武汉市·洪山区', industryChain: '装备制造', type: '科研院所', logo: '', introduction: '华中科技大学是国家"双一流"建设高校，拥有光电、机械、材料、生命等优势学科。学校在激光技术、数控系统、医疗器械等领域具有国际领先水平，与众多企业建立了产学研合作关系。', foundDate: '1952-10-01', registeredCapital: '-', address: '湖北省武汉市洪山区珞喻路1037号' },
  { id: 'el7', name: '三峡集团', legalPerson: '雷鸣山', status: '存续', industry: '电力生产', region: '湖北省·宜昌市·西陵区', industryChain: '清洁能源', type: '央企', logo: '', introduction: '三峡集团是全球最大的水电开发企业和中国最大的清洁能源集团，负责三峡工程的建设运营，业务涵盖水电、风电、光伏、储能等清洁能源领域，致力于打造世界一流清洁能源集团。', foundDate: '1993-09-27', registeredCapital: '2368亿元', address: '湖北省宜昌市西陵区建设路1号' },
  { id: 'el8', name: '中船重工710研究所', legalPerson: '周明', status: '存续', industry: '科学研究', region: '湖北省·宜昌市·西陵区', industryChain: '装备制造', type: '科研院所', logo: '', introduction: '中船重工710研究所是中国船舶重工集团公司直属研究所，专业从事船舶动力系统、特种装备的研发和制造，在舰船电力推进、综合电力系统等领域具有核心技术优势。', foundDate: '1965-03-01', registeredCapital: '-', address: '湖北省宜昌市西陵区城东大道100号' },
  { id: 'el9', name: '湖北三峡实验室', legalPerson: '王焰新', status: '存续', industry: '科学研究', region: '湖北省·宜昌市·西陵区', industryChain: '绿色化工', type: '科研院所', logo: '', introduction: '湖北三峡实验室是湖北省重点打造的科技创新平台，聚焦绿色化工、新能源、新材料等领域，汇聚了一批院士专家和高层次人才，致力于攻克产业关键核心技术。', foundDate: '2021-11-01', registeredCapital: '-', address: '湖北省宜昌市西陵区大学路8号' },
  { id: 'el10', name: '南玻硅材料有限公司', legalPerson: '陈琳', status: '存续', industry: '非金属矿物', region: '湖北省·宜昌市·枝江市', industryChain: '新材料', type: '高新技术企业', logo: '', introduction: '南玻硅材料是国内领先的高纯硅材料生产企业，主要生产多晶硅、单晶硅等光伏材料。公司拥有自主知识产权的核心技术，产品质量达到国际先进水平。', foundDate: '2008-06-18', registeredCapital: '12.5亿元', address: '湖北省枝江市仙女工业园区' },
];

// 企业动态数据
export const enterpriseNews = [
  { id: 'n1', title: '基于大数据驱动的化工安全生产过程智能监管方法研究', source: '宜昌科技局', date: '2026-01-15', type: '科研动态' },
  { id: 'n2', title: '湖北某磷矿浮选工艺优化模拟仿真研究', source: '三峡实验室', date: '2026-01-12', type: '科研动态' },
  { id: 'n3', title: '基于风险导向理念的化工企业安全预防策略研究', source: '应急管理部', date: '2025-07-12', type: '政策动态' },
  { id: 'n4', title: '木质素基抗菌失控制材料的研究进展', source: '新材料研究院', date: '2025-07-10', type: '技术动态' },
  { id: 'n5', title: '植物纤维自支撑MnO₂/活性炭电极的绿色制备及...', source: '华中科技大学', date: '2025-06-01', type: '科研动态' },
];

// 关键技术词云数据
export const keyTechnologies = [
  { name: '合成氨', value: 95 }, { name: '分析仪', value: 88 }, { name: '交换器', value: 85 },
  { name: '分布器', value: 82 }, { name: '池东煤化工废水', value: 78 }, { name: '加氢反应器', value: 75 },
  { name: '反应釜', value: 72 }, { name: '劳动强度', value: 70 }, { name: '气气氨分燃烧控管', value: 68 },
  { name: '含水量', value: 65 }, { name: '换热器', value: 88 }, { name: '二氧化碳', value: 85 },
  { name: '三聚氰胺', value: 80 }, { name: '三聚氨酸冻溶系统', value: 75 }, { name: '冷凝器', value: 72 },
  { name: '并行气气', value: 68 }, { name: '化工废水', value: 82 }, { name: '分离器', value: 78 },
  { name: '化肥生产废水', value: 70 }, { name: '三羟甲基丙烷', value: 65 },
];

// 核心人才数据
export const coreTalents = [
  { id: 'ct1', name: '王建国', title: '院士', institution: '中国地质大学（武汉）', field: '矿产资源', avatar: '' },
  { id: 'ct2', name: '李国璋', title: '教授级高工', institution: '国家万人清洁源头陕有限公司', field: '精细化工', avatar: '' },
  { id: 'ct3', name: '张志刚', title: '研究员', institution: '湖北洋丰石磷复合材料有限公司', field: '新材料', avatar: '' },
  { id: 'ct4', name: '陈明辉', title: '高级工程师', institution: '上海化学工业区发展有限公司', field: '化工工程', avatar: '' },
  { id: 'ct5', name: '刘伟', title: '教授', institution: '武汉纺织大学', field: '纺织材料', avatar: '' },
  { id: 'ct6', name: '赵晓东', title: '研究员', institution: '湖北宜化集团', field: '化肥工艺', avatar: '' },
];

// 专利布局数据
export const patentLayout = [
  { name: '化工工艺', value: 856, color: '#1E4D8C' },
  { name: '新材料', value: 623, color: '#2057AA' },
  { name: '环保技术', value: 445, color: '#2468F2' },
  { name: '装备制造', value: 378, color: '#4B83F7' },
  { name: '生物医药', value: 312, color: '#7BA3FA' },
  { name: '能源技术', value: 256, color: '#A2C0FC' },
];

// 竞合机构数据
export const cooperativeOrgs = [
  { id: 'co1', name: '中国地质大学（武汉）', type: '高校', cooperation: 28, avatar: '' },
  { id: 'co2', name: '国家万力清洁源环保有限公司', type: '企业', cooperation: 23, avatar: '' },
  { id: 'co3', name: '湖北洋丰石磷复合材料有限公司', type: '企业', cooperation: 19, avatar: '' },
  { id: 'co4', name: '上海化学工业区发展有限公司', type: '企业', cooperation: 17, avatar: '' },
  { id: 'co5', name: '武汉纺织大学', type: '高校', cooperation: 15, avatar: '' },
  { id: 'co6', name: '中科院武汉分院', type: '科研院所', cooperation: 14, avatar: '' },
];
