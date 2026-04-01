import type { GraphLink, GraphNode } from '@/services/talent'

export interface MockTrendData {
  years: string[]
  papers: number[]
  patents: number[]
  standards: number[]
}

export interface MockTalentInfo {
  auid: string
  name: string
  org: string
  field: string
  hIndex: number
  papers: number
  patents: number
  achievements: number
  direction: string
  title: string
  background: string
  keywords: string[]
}

export interface MockCoopTalent {
  name: string
  org: string
  field: string
}

export interface MockTalentPreview {
  currentTalent: MockTalentInfo
  coopTalents: MockCoopTalent[]
  fieldData: { name: string; value: number }[]
  trendData: MockTrendData
}

type MockExpert = Record<string, unknown>

export const MOCK_TALENT_GRAPH_ENABLED = false

export const MOCK_TALENT_EXPERTS: MockExpert[] = [
  {
    ID: 'talent-1',
    CNAME: '王建国',
    AORG: '中国科学院',
    CATE: ['生物医药'],
    H: 68,
    QIKAN: 126,
    ZHUANLI: 38,
    CHENGGUO: 15,
    DIRECTION: '生物医药、合成生物与产业转化',
    TITLE: ['教授'],
    KEYWORDS: [{ KEYWORD: '生物医药', NUM: 28 }, { KEYWORD: '合成生物', NUM: 23 }, { KEYWORD: '药物筛选', NUM: 17 }],
  },
  {
    ID: 'talent-2',
    CNAME: '周建华',
    AORG: '中国工程院',
    CATE: ['生物制药'],
    H: 16,
    QIKAN: 112,
    ZHUANLI: 41,
    CHENGGUO: 13,
    DIRECTION: '绿色化工工艺优化与材料应用',
    TITLE: ['副教授'],
    KEYWORDS: [{ KEYWORD: '生物制药', NUM: 26 }, { KEYWORD: '催化材料', NUM: 18 }],
  },
  {
    ID: 'talent-3',
    CNAME: '陈志明',
    AORG: '武汉大学',
    CATE: ['人工智能'],
    H: 14,
    QIKAN: 95,
    ZHUANLI: 27,
    CHENGGUO: 11,
    DIRECTION: 'AI 制药与智能筛选算法',
    TITLE: ['研究员'],
    KEYWORDS: [{ KEYWORD: '人工智能', NUM: 24 }, { KEYWORD: 'AI制药', NUM: 18 }],
  },
  {
    ID: 'talent-4',
    CNAME: '吴婷婷',
    AORG: '安琪酵母',
    CATE: ['生物发酵'],
    H: 13,
    QIKAN: 88,
    ZHUANLI: 24,
    CHENGGUO: 10,
    DIRECTION: '生物制造与发酵工艺优化',
    TITLE: ['教授'],
    KEYWORDS: [{ KEYWORD: '生物制造', NUM: 20 }, { KEYWORD: '发酵工程', NUM: 16 }],
  },
  {
    ID: 'talent-5',
    CNAME: '赵丽娜',
    AORG: '三峡大学',
    CATE: ['生物医药'],
    H: 11,
    QIKAN: 73,
    ZHUANLI: 19,
    CHENGGUO: 9,
    DIRECTION: '先进功能材料与应用开发',
    TITLE: ['博士后'],
    KEYWORDS: [{ KEYWORD: '新材料', NUM: 18 }, { KEYWORD: '功能材料', NUM: 14 }],
  },
  {
    ID: 'talent-6',
    CNAME: '程雅雯',
    AORG: '中科院上海',
    CATE: ['抗体工程'],
    H: 9,
    QIKAN: 61,
    ZHUANLI: 16,
    CHENGGUO: 8,
    DIRECTION: '抗体工程与工程技术应用',
    TITLE: ['工程师'],
    KEYWORDS: [{ KEYWORD: '抗体工程', NUM: 15 }, { KEYWORD: '装备制造', NUM: 13 }],
  },
  {
    ID: 'talent-13',
    CNAME: '王建国',
    AORG: '三峡大学',
    CATE: ['生物医药'],
    H: 31,
    QIKAN: 88,
    ZHUANLI: 19,
    CHENGGUO: 9,
    DIRECTION: '抗体工程与药物化学',
    TITLE: ['研究员'],
    KEYWORDS: [{ KEYWORD: '抗体工程', NUM: 18 }, { KEYWORD: '药物化学', NUM: 14 }],
  },
  {
    ID: 'talent-14',
    CNAME: '王建国',
    AORG: '武汉大学',
    CATE: ['人工智能'],
    H: 24,
    QIKAN: 74,
    ZHUANLI: 16,
    CHENGGUO: 7,
    DIRECTION: 'AI 制药与知识图谱',
    TITLE: ['副教授'],
    KEYWORDS: [{ KEYWORD: 'AI制药', NUM: 16 }, { KEYWORD: '知识图谱', NUM: 12 }],
  },
]

const MOCK_RELATION_PEOPLE: GraphNode[] = [
  ...MOCK_TALENT_EXPERTS.map((item) => ({
    id: String(item.ID),
    name: String(item.CNAME),
    org: String(item.AORG),
    h: Number(item.H || 0),
    class: 'PERSON' as const,
  })),
  { id: 'talent-7', name: '李宇辰', org: '华中科技大学', h: 12, class: 'PERSON' },
  { id: 'talent-8', name: '唐思齐', org: '武汉理工大学', h: 10, class: 'PERSON' },
  { id: 'talent-9', name: '吴嘉衡', org: '中南大学', h: 8, class: 'PERSON' },
  { id: 'talent-10', name: '许沐阳', org: '中国科学院过程工程所', h: 9, class: 'PERSON' },
  { id: 'talent-11', name: '何清妍', org: '中国药科大学', h: 7, class: 'PERSON' },
  { id: 'talent-12', name: '顾承泽', org: '清华大学', h: 6, class: 'PERSON' },
]

export const MOCK_TALENT_GRAPH_NODES: GraphNode[] = MOCK_RELATION_PEOPLE

export const MOCK_TALENT_GRAPH_LINKS: GraphLink[] = [
  { source: 'talent-1', target: 'talent-2', value: 5 },
  { source: 'talent-1', target: 'talent-3', value: 6 },
  { source: 'talent-1', target: 'talent-4', value: 4 },
  { source: 'talent-1', target: 'talent-7', value: 3 },
  { source: 'talent-1', target: 'talent-8', value: 2 },
  { source: 'talent-1', target: 'talent-13', value: 3 },
  { source: 'talent-1', target: 'talent-14', value: 2 },
  { source: 'talent-2', target: 'talent-5', value: 3 },
  { source: 'talent-2', target: 'talent-6', value: 2 },
  { source: 'talent-2', target: 'talent-9', value: 2 },
  { source: 'talent-3', target: 'talent-7', value: 3 },
  { source: 'talent-3', target: 'talent-10', value: 3 },
  { source: 'talent-3', target: 'talent-11', value: 2 },
  { source: 'talent-3', target: 'talent-14', value: 2 },
  { source: 'talent-4', target: 'talent-8', value: 2 },
  { source: 'talent-4', target: 'talent-12', value: 2 },
  { source: 'talent-5', target: 'talent-6', value: 2 },
  { source: 'talent-7', target: 'talent-10', value: 1 },
  { source: 'talent-8', target: 'talent-9', value: 1 },
  { source: 'talent-9', target: 'talent-12', value: 1 },
]

const MOCK_TALENT_PREVIEWS: Record<string, MockTalentPreview> = {
  'talent-1': {
    currentTalent: {
      auid: 'talent-1',
      name: '王建国',
      org: '中国科学院',
      field: '生物医药',
      hIndex: 68,
      papers: 126,
      patents: 38,
      achievements: 15,
      direction: '生物医药、合成生物与成果转化研究',
      title: '教授',
      background: '长期从事生物医药与智能筛选交叉研究，主持多项省部级项目，具备产业化转化经验。',
      keywords: ['生物医药', '合成生物', '药物筛选'],
    },
    coopTalents: [
      { name: '周建华', org: '中国工程院', field: '生物制药' },
      { name: '赵丽娜', org: '三峡大学', field: '生物医药' },
      { name: '吴婷婷', org: '安琪酵母', field: '生物发酵' },
      { name: '陈志明', org: '武汉大学', field: '药物化学' },
      { name: '程雅雯', org: '中科院上海', field: '抗体工程' },
    ],
    fieldData: [
      { name: '生物医药', value: 35 },
      { name: '合成生物', value: 29 },
      { name: '智能筛选', value: 23 },
      { name: '药物评价', value: 18 },
      { name: '绿色化工', value: 15 },
      { name: '生物制造', value: 12 },
    ],
    trendData: {
      years: ['2021', '2022', '2023', '2024', '2025'],
      papers: [12, 16, 21, 25, 23],
      patents: [4, 7, 9, 12, 15],
      standards: [1, 2, 3, 4, 5],
    },
  },
  'talent-2': {
    currentTalent: {
      auid: 'talent-2',
      name: '周建华',
      org: '中国工程院',
      field: '生物制药',
      hIndex: 16,
      papers: 112,
      patents: 41,
      achievements: 13,
      direction: '绿色化工工艺优化与高分子材料应用',
      title: '副教授',
      background: '深耕绿色化工过程强化、工艺降耗与产业落地，参与多项企业联合攻关项目。',
      keywords: ['生物制药', '催化材料', '工艺优化'],
    },
    coopTalents: [
      { name: '王建国', org: '中国科学院', field: '生物医药' },
      { name: '林若溪', org: '三峡实验室', field: '新材料' },
      { name: '杨绍安', org: '湖北三宁化工', field: '高端工程师' },
      { name: '吴嘉衡', org: '中南大学', field: '绿色化工' },
      { name: '何清妍', org: '中国药科大学', field: '催化材料' },
      { name: '吴婷婷', org: '安琪酵母', field: '生物制造' },
    ],
    fieldData: [
      { name: '绿色化工', value: 33 },
      { name: '催化材料', value: 27 },
      { name: '工艺优化', value: 22 },
      { name: '精细化工', value: 16 },
      { name: '新材料', value: 14 },
      { name: '低碳技术', value: 11 },
    ],
    trendData: {
      years: ['2021', '2022', '2023', '2024', '2025'],
      papers: [10, 14, 18, 21, 24],
      patents: [3, 5, 7, 10, 12],
      standards: [1, 1, 2, 3, 4],
    },
  },
  'talent-3': {
    currentTalent: {
      auid: 'talent-3',
      name: '陈志明',
      org: '武汉大学',
      field: '人工智能',
      hIndex: 14,
      papers: 95,
      patents: 27,
      achievements: 11,
      direction: 'AI 制药、智能筛选与知识图谱应用',
      title: '研究员',
      background: '聚焦 AI 制药和知识图谱建模，主导过多个企业研发智能化项目。',
      keywords: ['人工智能', 'AI制药', '知识图谱'],
    },
    coopTalents: [
      { name: '王建国', org: '中国科学院', field: '生物医药' },
      { name: '李宇辰', org: '华中科技大学', field: '人工智能' },
      { name: '许沐阳', org: '中国科学院过程工程所', field: '智能制造' },
      { name: '何清妍', org: '中国药科大学', field: 'AI 制药' },
      { name: '顾承泽', org: '清华大学', field: '知识图谱' },
      { name: '周建华', org: '中国工程院', field: '绿色化工' },
    ],
    fieldData: [
      { name: '人工智能', value: 31 },
      { name: 'AI制药', value: 26 },
      { name: '知识图谱', value: 20 },
      { name: '智能筛选', value: 18 },
      { name: '大模型', value: 13 },
      { name: '生物医药', value: 9 },
    ],
    trendData: {
      years: ['2021', '2022', '2023', '2024', '2025'],
      papers: [8, 12, 17, 22, 26],
      patents: [2, 4, 6, 8, 11],
      standards: [0, 1, 2, 3, 4],
    },
  },
  'talent-13': {
    currentTalent: {
      auid: 'talent-13',
      name: '王建国',
      org: '三峡大学',
      field: '生物医药',
      hIndex: 31,
      papers: 88,
      patents: 19,
      achievements: 9,
      direction: '抗体工程、药物化学与临床转化',
      title: '研究员',
      background: '长期从事抗体工程与药物化学研究，具备高校与企业联合项目经验。',
      keywords: ['抗体工程', '药物化学', '临床转化'],
    },
    coopTalents: [
      { name: '周建华', org: '中国工程院', field: '生物制药' },
      { name: '赵丽娜', org: '三峡大学', field: '生物医药' },
      { name: '吴婷婷', org: '安琪酵母', field: '生物发酵' },
      { name: '陈志明', org: '武汉大学', field: '药物化学' },
      { name: '程雅雯', org: '中科院上海', field: '抗体工程' },
    ],
    fieldData: [
      { name: '抗体工程', value: 32 },
      { name: '药物化学', value: 26 },
      { name: '生物医药', value: 21 },
      { name: '临床转化', value: 15 },
      { name: '蛋白工程', value: 11 },
    ],
    trendData: {
      years: ['2021', '2022', '2023', '2024', '2025'],
      papers: [9, 13, 17, 20, 22],
      patents: [2, 4, 6, 8, 9],
      standards: [0, 1, 1, 2, 3],
    },
  },
  'talent-14': {
    currentTalent: {
      auid: 'talent-14',
      name: '王建国',
      org: '武汉大学',
      field: '人工智能',
      hIndex: 24,
      papers: 74,
      patents: 16,
      achievements: 7,
      direction: 'AI 制药、知识图谱与智能筛选',
      title: '副教授',
      background: '专注 AI 制药与知识图谱建模，在医工交叉方向有持续合作成果。',
      keywords: ['AI制药', '知识图谱', '智能筛选'],
    },
    coopTalents: [
      { name: '王建国', org: '中国科学院', field: '生物医药' },
      { name: '陈志明', org: '武汉大学', field: '人工智能' },
      { name: '顾承泽', org: '清华大学', field: '知识图谱' },
      { name: '何清妍', org: '中国药科大学', field: 'AI 制药' },
      { name: '许沐阳', org: '中国科学院过程工程所', field: '智能制造' },
    ],
    fieldData: [
      { name: 'AI制药', value: 29 },
      { name: '知识图谱', value: 24 },
      { name: '智能筛选', value: 19 },
      { name: '人工智能', value: 17 },
      { name: '生物医药', value: 10 },
    ],
    trendData: {
      years: ['2021', '2022', '2023', '2024', '2025'],
      papers: [7, 10, 14, 18, 20],
      patents: [1, 3, 5, 7, 8],
      standards: [0, 1, 2, 2, 3],
    },
  },
}

export function getMockTalentPreview(auid: string): MockTalentPreview {
  return MOCK_TALENT_PREVIEWS[auid] || MOCK_TALENT_PREVIEWS['talent-1']
}
