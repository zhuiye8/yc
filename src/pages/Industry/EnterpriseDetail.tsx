import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FloatButton, Tag } from 'antd'
import {
  BankOutlined,
  EnvironmentOutlined,
  LeftOutlined,
} from '@ant-design/icons'
import enterpriseDetailBanner from '@/assets/images/hero/enterprise-detail-banner.jpg'
import styles from './EnterpriseDetail.module.scss'

type SectionKey = 'basic' | 'competition' | 'backbone' | 'monitor' | 'innovation'
type ResourceType = '论文' | '专利' | '科技成果' | '科研项目' | '技术标准'

interface CapabilityMetric {
  label: string
  value: number
}

interface CapabilityCard {
  title: string
  score: number
  description: string
  metrics: CapabilityMetric[]
}

interface CompetitorItem {
  id: string
  name: string
  relationCount: number
}

interface BackboneItem {
  id: string
  name: string
  organization: string
  tags: string[]
  major: string
  achievements: number
  papers: number
  patents: number
}

interface MonitorItem {
  id: string
  type: ResourceType
  title: string
  subtitle: string
  summary: string
  tags: string[]
  date: string
  source: string
}

interface StandardRow {
  id: string
  name: string
  standardNo: string
  level: string
  status: string
  year: string
}

interface PlatformRow {
  id: string
  name: string
  carrier: string
  level: string
  authority: string
  year: string
}

interface AwardRow {
  id: string
  name: string
  finishers: string
  org: string
  level: string
  awardName: string
  year: string
}

interface ReportRow {
  id: string
  name: string
  author: string
  org: string
  stage: string
  projectName: string
  year: string
}

const SECTION_TABS: Array<{ key: SectionKey; label: string }> = [
  { key: 'basic', label: '基本信息' },
  { key: 'competition', label: '竞合机构' },
  { key: 'backbone', label: '技术骨干' },
  { key: 'monitor', label: '动态监测' },
  { key: 'innovation', label: '科技创新' },
]

const capabilitySummary: CapabilityMetric[] = [
  { label: '市场竞争力', value: 97.68 },
  { label: '研发生产力', value: 99.88 },
  { label: '行业影响力', value: 99.81 },
  { label: '发烧潜力', value: 94.21 },
]

const capabilityCards: CapabilityCard[] = [
  {
    title: '市场竞争力',
    score: 97.68,
    description: '市场竞争力是企业对现有核心资源、主竞争线和行业认知、议价效率、交付与运营水平的综合性评价。',
    metrics: [
      { label: '技术团队', value: 99.94 },
      { label: '研发效率', value: 93.67 },
      { label: '运营认知', value: 99.0 },
    ],
  },
  {
    title: '研发实力',
    score: 99.88,
    description: '研发实力来自核心创新指标、成果延展能力、知识产权与技术体系沉淀的综合评价。',
    metrics: [
      { label: '研发效能', value: 99.86 },
      { label: '研发自主率', value: 99.95 },
      { label: '持续投入', value: 99.72 },
    ],
  },
  {
    title: '行业影响力',
    score: 99.81,
    description: '影响力来自企业在行业内的奖项权威、品牌声量、工艺示范与生态协作等多维评价。',
    metrics: [
      { label: '成果转化', value: 99.5 },
      { label: '专利影响力', value: 99.96 },
      { label: '标准沉淀', value: 99.83 },
    ],
  },
  {
    title: '发烧潜力',
    score: 94.21,
    description: '发展潜力来自企业持续投资强度、主业务延展能力、团队梯队和下游市场机会等综合评价。',
    metrics: [
      { label: '研发持续性', value: 99.95 },
      { label: '团队梯队性', value: 80.82 },
      { label: '市场空间', value: 91.84 },
    ],
  },
]

const competitors: CompetitorItem[] = [
  { id: 'c1', name: '南京大学', relationCount: 21 },
  { id: 'c2', name: '光伏科学与技术国家重点实验室', relationCount: 9 },
  { id: 'c3', name: '润海光伏科技股份有限公司', relationCount: 3 },
  { id: 'c4', name: '浙江利通科技有限公司', relationCount: 6 },
  { id: 'c5', name: '澳大利亚国立大学', relationCount: 3 },
  { id: 'c6', name: '协鑫集成科技股份有限公司', relationCount: 4 },
  { id: 'c7', name: '天合新能源（义乌）科技有限公司', relationCount: 13 },
  { id: 'c8', name: '常州天合光能有限公司光伏科学与技术国家重点实验室', relationCount: 10 },
  { id: 'c9', name: '苏州施辰原材料有限公司', relationCount: 3 },
  { id: 'c10', name: '北京清达能源集团有限公司', relationCount: 4 },
]

const backboneTalents: BackboneItem[] = [
  { id: 't1', name: '冯志强', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、化学', achievements: 252, papers: 2, patents: 249 },
  { id: 't2', name: '陈红', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、材料科学与工程', achievements: 212, papers: 0, patents: 212 },
  { id: 't3', name: '王子君', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、材料科学与工程', achievements: 136, papers: 0, patents: 136 },
  { id: 't4', name: '夏乾', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、材料科学与工程', achievements: 129, papers: 0, patents: 128 },
  { id: 't5', name: '丁志武', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、材料科学与工程', achievements: 120, papers: 1, patents: 119 },
  { id: 't6', name: '许爽军', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、材料科学与工程', achievements: 101, papers: 1, patents: 100 },
  { id: 't7', name: '郭扬', organization: '天合光能股份有限公司', tags: ['研究领域'], major: '电子科学与技术、材料科学与工程', achievements: 97, papers: 0, patents: 97 },
]

const monitorData: Record<ResourceType, MonitorItem[]> = {
  论文: [
    {
      id: 'p1',
      type: '论文',
      title: '数字卫星概念研究',
      subtitle: '董正峰 李曾 +1',
      summary: '基于领域知识图谱设计可解释监测模型，支撑光伏组件运行状态感知与异常机理诊断。',
      tags: ['系统工程', '数字孪生', '+2'],
      date: '2021-02-25',
      source: '上海航天（中文）',
    },
    {
      id: 'p2',
      type: '论文',
      title: '引入分系统优化的协同优化方法及其应用研究',
      subtitle: '卫灿然 张彩霞',
      summary: '围绕多目标协同优化与约束传播，提出适配复杂工业系统的联合求解方法与应用流程。',
      tags: ['多目标优化', '协同优化', '+12'],
      date: '2018-05-17',
      source: '空间防务',
    },
    {
      id: 'p3',
      type: '论文',
      title: '电磁航天器等离子位置感应自适应协同控制',
      subtitle: '郭向阳 崔金峰',
      summary: '构建复杂轨迹跟踪的控制框架，并验证模型在动态扰动环境下的适配性能。',
      tags: ['电磁航天器', '队形飞行', '+8'],
      date: '2017-10-13',
      source: '北京航空航天大学学报',
    },
    {
      id: 'p4',
      type: '论文',
      title: '空间硬件产品可飞行控制方法',
      subtitle: '董正峰 李淑云',
      summary: '针对复杂装备的可靠性控制提出数据驱动优化方法，适用于产业化试验流程。',
      tags: ['空间硬件', '可飞行控制', '+12'],
      date: '2017-10-15',
      source: '航天加工',
    },
    {
      id: 'p5',
      type: '论文',
      title: '卫星故障诊断系统智能解析技术研究',
      subtitle: '李洪志 董正峰',
      summary: '面向高复杂度工业系统的故障推演流程，构建多源融合的异常定位模型。',
      tags: ['卫星', '故障诊断', '+16'],
      date: '2017-06-19',
      source: '上海航天',
    },
  ],
  专利: [
    {
      id: 'z1',
      type: '专利',
      title: '一种数字飞行器源代码构造决策知识提取归集方法',
      subtitle: '董正峰 孙岳',
      summary: '本发明公开了一种数字飞行器源代码构造决策知识提取归集方法，适用于工程软件平台管理。',
      tags: ['数字飞行器', '决策知识', '+13'],
      date: '2021-11-26',
      source: '发明专利',
    },
    {
      id: 'z2',
      type: '专利',
      title: '基于语法分析特征的数字卫星源代码书写决策分析方法',
      subtitle: '董正峰 李松',
      summary: '通过语法分析和规则匹配对数字卫星源代码进行工程化审校，提高研发效率。',
      tags: ['代码分析特征', '数字卫星源代码', '+11'],
      date: '2021-11-26',
      source: '发明专利',
    },
    {
      id: 'z3',
      type: '专利',
      title: '数字飞行器仿真结果人工智能比对与检验方法',
      subtitle: '董正峰 李松',
      summary: '针对仿真结果一致性比对与偏差校验构建自动化检验链路，适用于工程研制场景。',
      tags: ['数字飞行器', '仿真结果人工检验', '+7'],
      date: '2019-02-26',
      source: '发明专利',
    },
    {
      id: 'z4',
      type: '专利',
      title: '混动卫星效能人工智能统计方法',
      subtitle: '董正峰 孙岳',
      summary: '将多维运行日志转换为可视化效能指标，用于复杂系统状态分析。',
      tags: ['混动卫星效能', '数据压缩', '+3'],
      date: '2019-02-15',
      source: '发明专利',
    },
    {
      id: 'z5',
      type: '专利',
      title: '加热装置',
      subtitle: '谢艺军 周宗胜',
      summary: '发明提供一种加热装置，可满足复杂工况下的安全供热与结构耐久需求。',
      tags: ['光伏焊接', '加热装置', '+1'],
      date: '2025-11-21',
      source: '实用新型',
    },
  ],
  科技成果: [
    {
      id: 'c1',
      type: '科技成果',
      title: '光储微电网灵活高效自主运行关键技术与装备',
      subtitle: '财政部 王伟 +9',
      summary: '围绕光储协同与微电网稳定运行，突破关键控制技术与成套装备工程化应用。',
      tags: ['光储微电网', '新型电力系统', '+1'],
      date: '2019-06-01',
      source: '科技成果',
    },
    {
      id: 'c2',
      type: '科技成果',
      title: '高效高可靠智能光伏太阳能组件与系统关键技术及应用',
      subtitle: '陈强 金磊 +9',
      summary: '聚焦组件高效化与系统可靠性，形成完整的关键技术路线与示范应用。',
      tags: ['智能光伏系统', '高效组件', '+1'],
      date: '2018-12-01',
      source: '科技成果',
    },
    {
      id: 'c3',
      type: '科技成果',
      title: '高渗透率有源配电网知识自动化调控技术及其成套装备',
      subtitle: '余涛 唐文 +9',
      summary: '通过智能感知与知识驱动调控提升大规模新能源接入条件下的电网稳定性。',
      tags: ['配电网调控系统', '机器学习', '+1'],
      date: '2018-07-01',
      source: '科技成果',
    },
    {
      id: 'c4',
      type: '科技成果',
      title: '低成本高效高可靠晶体硅双玻组件研发及产业化',
      subtitle: '崔晓月 张利强 +9',
      summary: '形成低成本双玻组件材料体系与工艺方案，推动量产和工程化应用。',
      tags: ['晶体硅双玻组件', '太阳能电池组件', '+1'],
      date: '2018-07-01',
      source: '科技成果',
    },
  ],
  科研项目: [
    {
      id: 'k1',
      type: '科研项目',
      title: '电子科学与技术-补修类',
      subtitle: '曹文',
      summary: '聚焦电子科学与技术方向的工程研制实践，形成面向企业应用的项目沉淀。',
      tags: ['天合光能股份有限公司'],
      date: '2023-07-01',
      source: 'China Postdoctoral Science Foundation',
    },
    {
      id: 'k2',
      type: '科研项目',
      title: '电子科学与技术-复试',
      subtitle: '曹文',
      summary: '面向电子科学与技术领域的能力验证和研发应用协同。',
      tags: ['天合光能股份有限公司'],
      date: '2022-06-30',
      source: 'China Postdoctoral Science Foundation',
    },
  ],
  技术标准: [
    {
      id: 'b1',
      type: '技术标准',
      title: '光伏组件用玻璃 第2部分：双玻组件背面玻璃规范',
      subtitle: '标准编号 T/CPIA 0028.2-2021',
      summary: '形成双玻组件背面玻璃规范标准，用于提升组件可靠性和量产一致性。',
      tags: ['团体标准', '现行'],
      date: '2021',
      source: '技术标准',
    },
    {
      id: 'b2',
      type: '技术标准',
      title: '光伏产品碳中和评价要求',
      subtitle: '标准编号 T/CSTM 00694-2022',
      summary: '围绕光伏产品全生命周期碳排放评价提出统一方法。',
      tags: ['团体标准', '现行'],
      date: '2022',
      source: '技术标准',
    },
    {
      id: 'b3',
      type: '技术标准',
      title: '光伏组件可用寿命评估方法',
      subtitle: '标准编号 T/CESA 1209-2022',
      summary: '建立可用寿命评估方法，支撑组件可靠性和运维决策。',
      tags: ['团体标准', '现行'],
      date: '2022',
      source: '技术标准',
    },
  ],
}

const standardRows: StandardRow[] = [
  { id: 's1', name: '光伏组件用玻璃 第2部分：双玻组件背面玻璃规范', standardNo: 'T/CPIA 0028.2-2021', level: '团体标准', status: '现行', year: '2021' },
  { id: 's2', name: '光伏产品碳中和评价要求', standardNo: 'T/CSTM 00694-2022', level: '团体标准', status: '现行', year: '2022' },
  { id: 's3', name: '光伏组件可用寿命评估方法', standardNo: 'T/CESA 1209-2022', level: '团体标准', status: '现行', year: '2022' },
  { id: 's4', name: '光伏片切割用电极绝缘系统', standardNo: 'T/CPIA 0038-2022', level: '团体标准', status: '现行', year: '2022' },
  { id: 's5', name: '平板晶硅太阳能光伏发电电站打磨件 第1部分：同质硅晶体硅光伏电池', standardNo: 'T/CPIA 0048.1-2022', level: '团体标准', status: '现行', year: '2022' },
  { id: 's6', name: '晶体硅光伏电池组件出厂测试方法及调节筛选', standardNo: 'T/CSTM 00587-2023', level: '团体标准', status: '现行', year: '2023' },
  { id: 's7', name: '光伏组件发电单元用 EVA 胶膜性能试验方法', standardNo: 'GB/T 29486-2013', level: '国家标准', status: '现行', year: '2013' },
  { id: 's8', name: '光伏组件绝缘膜粘接接头剪切·粘接性能', standardNo: 'T/CPIA 0029.2-2021', level: '团体标准', status: '现行', year: '2021' },
]

const platformRows: PlatformRow[] = [
  { id: 'p1', name: '江苏省新型电力储能工程研究中心', carrier: '天合光能股份有限公司', level: '省级', authority: '省发改委', year: '2020' },
  { id: 'p2', name: '天合光能股份有限公司技术中心', carrier: '天合光能股份有限公司', level: '国家级', authority: '国家发改委', year: '2020' },
  { id: 'p3', name: '江苏省光伏并网一体化工程技术研究中心', carrier: '天合光能股份有限公司', level: '省级', authority: '省科技厅', year: '2019' },
  { id: 'p4', name: '天合光能股份有限公司研究站', carrier: '天合光能股份有限公司', level: '国家级', authority: '工信部', year: '2020' },
  { id: 'p5', name: '光伏科学与技术全国重点实验室', carrier: '常州天合光能有限公司', level: '国家级', authority: '江苏省科学技术厅', year: '2019' },
]

const awardRows: AwardRow[] = [
  { id: 'a1', name: '高效晶体硅太阳能电池低成本制备关键技术及产业化', finishers: '董正峰 王伟', org: '常州大学、常州维旺创新科技有限公司', level: '其它', awardName: '高等学校科技奖', year: '2019' },
  { id: 'a2', name: '单晶硅双面太阳电池及其制备方法', finishers: '董正峰', org: '天合光能股份有限公司', level: '省级', awardName: '中国专利奖', year: '2009' },
  { id: 'a3', name: '高效太阳电池关键应用技术', finishers: '高飞、徐绍龙、徐赫强', org: '天合光能股份有限公司', level: '省级', awardName: '江苏省科学技术奖', year: '2019' },
  { id: 'a4', name: '晶体太阳电池的背面钝化与高效制备技术', finishers: '丁建平', org: '常州大学、常州维旺创新科技有限公司', level: '省级', awardName: '中国专利奖', year: '2007' },
  { id: 'a5', name: '全自动大面积硅电池生产方法', finishers: '陈海英、王伟、王彬', org: '常州维旺创新科技有限公司', level: '国家级', awardName: '国家科学技术奖', year: '2006' },
]

const reportRows: ReportRow[] = [
  { id: 'r1', name: 'MW级薄膜太阳能光伏站大规模电站工程化研究', author: '包捷、王晓燕', org: '常州天合光能有限公司', stage: '最终报告', projectName: '国家高技术', year: '2012' },
  { id: 'r2', name: 'MW级薄膜太阳能光伏站大规模电站工程化研究', author: '包捷、王晓燕', org: '常州天合光能有限公司', stage: '进展报告', projectName: '国家高技术', year: '2012' },
  { id: 'r3', name: '光伏并网电站长期运行可靠性分析与测试评价', author: '潘海艳、黄培仁', org: '北京鉴衡认证中心有限公司', stage: '中期报告', projectName: '国家高技术', year: '2015' },
  { id: 'r4', name: '21kW山合金异质结组件光伏电站大电流研究', author: '张伟、杨磊', org: '天合光能股份有限公司', stage: '最终报告', projectName: '江苏省科技成果转化', year: '2015' },
  { id: 'r5', name: '晶体PERC光伏组件封装技术关键研发项目', author: '陈志强', org: '江苏通威光伏有限公司', stage: '最终报告', projectName: '江苏省科技成果转化', year: '2015' },
]

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.sectionHeading}>
      <div className={styles.sectionHeadingTitle}>{title}</div>
      <div className={styles.sectionHeadingSubtitle}>{subtitle}</div>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  )
}

function renderCardTitle(title: string) {
  const prefix = title.slice(0, 2)
  const rest = title.slice(2)
  return (
    <div className={styles.cardTitle}>
      <span className={styles.cardTitleAccent} />
      <span className={styles.cardTitlePrefix}>{prefix}</span>
      <span>{rest}</span>
    </div>
  )
}

function MonitorCard({
  title,
  items,
  colorClass,
}: {
  title: string
  items: MonitorItem[]
  colorClass: string
}) {
  return (
    <section className={styles.dataCard}>
      <div className={styles.dataCardHeader}>
        {renderCardTitle(title)}
      </div>
      <div className={styles.filterBar}>
        <div className={styles.fakeSelect}>时间区间</div>
        <div className={styles.fakeSelect}>开始时间</div>
        <div className={styles.fakeSelect}>结束时间</div>
        <div className={styles.fakeInput}>关键字</div>
      </div>
      <div className={styles.monitorList}>
        {items.map((item) => (
          <div key={item.id} className={styles.monitorItem}>
            <div className={`${styles.monitorBadge} ${styles[colorClass]}`}>{item.type}</div>
            <div className={styles.monitorBody}>
              <div className={styles.monitorTopRow}>
                <div>
                  <div className={styles.monitorTitle}>{item.title}</div>
                  <div className={styles.monitorMeta}>{item.subtitle}</div>
                </div>
                <div className={styles.monitorDate}>{item.date}</div>
              </div>
              <div className={styles.monitorSummary}>{item.summary}</div>
              <div className={styles.monitorTags}>
                {item.tags.map((tag) => (
                  <span key={tag} className={styles.monitorTag}>{tag}</span>
                ))}
              </div>
              <div className={styles.monitorSource}>{item.source}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.tableFooter}>共计 <strong>{items.length}</strong> 条</div>
    </section>
  )
}

function DataTableCard<T extends { id: string }>({
  title,
  note,
  filters,
  columns,
  rows,
}: {
  title: string
  note?: string
  filters?: string[]
  columns: string[]
  rows: Array<T & Record<string, string>>
}) {
  return (
    <section className={styles.dataCard}>
      <div className={styles.dataCardHeader}>
        {renderCardTitle(title)}
      </div>
      {note && <div className={styles.dataCardNote}>{note}</div>}
      {filters && (
        <div className={styles.filterBar}>
          {filters.map((filter) => (
            <div key={filter} className={styles.fakeSelect}>{filter}</div>
          ))}
        </div>
      )}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{String(index + 1)}</td>
                {Object.entries(row)
                  .filter(([key]) => key !== 'id')
                  .map(([key, value]) => (
                    <td key={key}>{value}</td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.tableFooter}>共计 <strong>{rows.length}</strong> 条</div>
    </section>
  )
}

export default function EnterpriseDetail() {
  useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SectionKey>('basic')

  const name = searchParams.get('name') ?? '天合光能股份有限公司'
  const trade = searchParams.get('trade') ?? '光伏组件'
  const region = searchParams.get('region') ?? '常州市新北区天合光伏产业园'
  const tagsRaw = searchParams.get('tags') ?? '上市公司,中国民营企业500强,新质技术企业,国家级企业技术中心,中国500强'
  const tags = tagsRaw.split(',').filter(Boolean)
  const backTarget = searchParams.get('back') || '/industry?tab=innovation'

  const infoRows = useMemo(
    () => [
      { icon: '📍', label: '运营状态', value: '在业' },
      { icon: '✉️', label: 'email', value: 'jingyuan.li@trinasolar.com' },
      { icon: '🌐', label: '官网', value: 'https://www.trinasolar.com/us' },
      { icon: '🏢', label: '成立时间', value: '1997-12-26' },
      { icon: '☎️', label: '统一社会信用代码', value: '91320411608131455L' },
      { icon: '📞', label: '电话', value: '15206116363' },
      { icon: '🏭', label: '国民经济行业', value: '电气机械和器材制造业' },
      { icon: '📌', label: '地址', value: '常州市新北区天合光伏产业园天合路2号' },
    ],
    [],
  )

  const basicSummary = `${name}（曾用名：常州天合光能有限公司），成立于1997年，注册地位于江苏省常州市。法定代表人为高纪凡，是一家以从事电气机械和器材制造业为主的企业。企业注册资本为217356.0162万元人民币，实缴资本138382.8272万人民币。经营范围涵盖太阳能光伏电站设备及系统装置安装；多晶硅棒、硅片、太阳能电池片、光伏组件的制造；太阳能光伏发电技术开发；销售自产产品；从事多晶硅、机械设备、太阳能光伏电站设备及系统集成等。`

  const handleSectionChange = (section: SectionKey) => {
    setActiveSection(section)
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg}>
          <img src={enterpriseDetailBanner} alt="" />
        </div>
      <div className={styles.heroInner}>
        <div className={styles.heroBreadcrumb} onClick={() => navigate(backTarget)}>
          <LeftOutlined />
          返回上一级
        </div>
          <div className={styles.heroBody}>
            <div className={styles.heroCard}>
            <div className={styles.heroImage}>
              <div className={styles.heroImagePanel}>
                <BankOutlined />
              </div>
            </div>
            <div className={styles.heroContent}>
              <div className={styles.heroTitleRow}>
                <div className={styles.heroTitle}>{name}</div>
                <div className={styles.heroTagRow}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.heroTag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className={styles.heroMeta}>
                <span><EnvironmentOutlined /> 企业地址：{region}</span>
              </div>
              <div className={styles.heroSummary}>{basicSummary}</div>
              <div className={styles.heroTradePill}>{trade}</div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.anchorBar}>
        <div className={styles.anchorBarInner}>
          {SECTION_TABS.map((section) => (
            <button
              key={section.key}
              type="button"
              className={`${styles.anchorTab} ${activeSection === section.key ? styles.anchorTabActive : ''}`}
              onClick={() => handleSectionChange(section.key)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <section id="basic" className={styles.sectionBlock}>
          <SectionHeading title="基本信息" subtitle="BASIC INFORMATION" />
          <div className={styles.profileCard}>
            {renderCardTitle('机构简介')}
            <div className={styles.profileGrid}>
              {infoRows.map((row) => (
                <div key={row.label} className={styles.profileItem}>
                  <span className={styles.profileIcon}>{row.icon}</span>
                  <span className={styles.profileLabel}>{row.label}：</span>
                  <span className={styles.profileValue}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.profileSummary}>{basicSummary}</div>
          </div>

          <div className={styles.capabilityCard}>
            {renderCardTitle('科创能力')}
            <div className={styles.capabilityTop}>
              <div className={styles.capabilityLead}>
                <div className={styles.capabilityPlaceholder}>
                  <div className={styles.capabilityAura} />
                </div>
              </div>
              <div className={styles.capabilitySummaryList}>
                {capabilitySummary.map((metric) => (
                  <div key={metric.label} className={styles.capabilitySummaryItem}>
                    <div className={styles.capabilitySummaryLabel}>
                      <span>{metric.label}：</span>
                      <strong>{metric.value.toFixed(2)}分</strong>
                    </div>
                    <div className={styles.capabilitySummaryBarRow}>
                      <ProgressBar value={metric.value} />
                      <span className={styles.capabilitySummaryMax}>100分</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.capabilityGrid}>
              {capabilityCards.map((card) => (
                <div key={card.title} className={styles.capabilityItemCard}>
                  <div className={styles.capabilityItemHeader}>
                    <div className={styles.capabilityItemTitle}>{card.title}</div>
                    <div className={styles.capabilityItemScore}>{card.score.toFixed(2)}<span>/100分</span></div>
                  </div>
                  <div className={styles.capabilityDescription}>{card.description}</div>
                  <div className={styles.capabilityMetricList}>
                    {card.metrics.map((metric) => (
                      <div key={metric.label} className={styles.capabilityMetric}>
                        <span>{metric.label}</span>
                        <div className={styles.capabilityMetricBar}>
                          <ProgressBar value={metric.value} />
                        </div>
                        <strong>{metric.value.toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="competition" className={styles.sectionBlock}>
          <SectionHeading title="竞合机构" subtitle="COMPETING INSTITUTIONS" />
          <div className={styles.listCard}>
            <div className={styles.listToolbar}>
              <div className={styles.fakeInputWide}>请输入关键词查询</div>
            </div>
            <div className={styles.competitionList}>
              {competitors.map((item) => (
                <div key={item.id} className={styles.competitionRow}>
                  <div className={styles.competitionRowMain}>
                    <div className={styles.competitionIcon}><BankOutlined /></div>
                    <div className={styles.competitionName}>{item.name}</div>
                    <div className={styles.competitionMeta}>合作次数：{item.relationCount}</div>
                  </div>
                  <div className={styles.competitionExpand}>⌄</div>
                </div>
              ))}
            </div>
            <div className={styles.paginationBar}>共计 <strong>96</strong> 条</div>
          </div>
        </section>

        <section id="backbone" className={styles.sectionBlock}>
          <SectionHeading title="技术骨干" subtitle="TECHNICAL BACKBONE" />
          <div className={styles.listCard}>
            <div className={styles.listToolbar}>
              <div className={styles.fakeInputWide}>请输入关键词查询</div>
            </div>
            <div className={styles.backboneList}>
              {backboneTalents.map((item) => (
                <div key={item.id} className={styles.backboneRow}>
                  <div className={styles.backboneAvatar} />
                  <div className={styles.backboneMain}>
                    <div className={styles.backboneName}>{item.name}</div>
                    <div className={styles.backboneOrg}>{item.organization}</div>
                    <div className={styles.backboneTags}>
                      {item.tags.map((tag) => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                      ))}
                      <span className={styles.backboneMajor}>{item.major}</span>
                    </div>
                  </div>
                  <div className={styles.backboneStats}>
                    <div className={styles.backboneStat}>
                      <strong>{item.achievements}</strong>
                      <span>总学术成果</span>
                    </div>
                    <div className={styles.backboneStat}>
                      <strong>{item.papers}</strong>
                      <span>论文</span>
                    </div>
                    <div className={styles.backboneStat}>
                      <strong>{item.patents}</strong>
                      <span>专利</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.paginationBar}>共计 <strong>1087</strong> 条</div>
          </div>
        </section>

        <section id="monitor" className={styles.sectionBlock}>
          <SectionHeading title="动态监测" subtitle="DYNAMIC MONITORING" />
          <MonitorCard title="论文" items={monitorData.论文} colorClass="badgePaper" />
          <MonitorCard title="专利" items={monitorData.专利} colorClass="badgePatent" />
          <MonitorCard title="科技成果" items={monitorData.科技成果} colorClass="badgeOutcome" />
          <MonitorCard title="科研项目" items={monitorData.科研项目} colorClass="badgeProject" />
          <DataTableCard
            title="技术标准"
            note="该机构累计发表 67 份标准文件，其中包含 16 份国家标准、2 份地方标准、47 份团体标准。"
            filters={['标准类别', '标准状态', '发布日期', '输入名称、关键词筛选']}
            columns={['序号', '名称', '标准编号', '标准级别', '标准状态', '发布日期']}
            rows={standardRows.map((row) => ({
              id: row.id,
              name: row.name,
              standardNo: row.standardNo,
              level: row.level,
              status: row.status,
              year: row.year,
            }))}
          />
        </section>

        <section id="innovation" className={styles.sectionBlock}>
          <SectionHeading title="科技创新" subtitle="TECHNOLOGICAL INNOVATION" />
          <DataTableCard
            title="创新平台"
            note="参与建设 5 个创新平台，其中 3 个国家级、2 个省级。"
            filters={['平台级别', '商新技术领域', '认定时间', '输入名称、关键词筛选']}
            columns={['序号', '名称', '依托单位', '平台级别', '认定单位', '认定时间']}
            rows={platformRows.map((row) => ({
              id: row.id,
              name: row.name,
              carrier: row.carrier,
              level: row.level,
              authority: row.authority,
              year: row.year,
            }))}
          />
          <DataTableCard
            title="科技奖励"
            note="获奖成果奖项 8 项科技奖励，6 个省级奖。"
            filters={['奖励级别', '获奖时间', '输入名称、关键词筛选', '导出']}
            columns={['序号', '名称', '完成人', '完成单位', '奖励级别', '获奖奖项', '获奖时间']}
            rows={awardRows.map((row) => ({
              id: row.id,
              name: row.name,
              finishers: row.finishers,
              org: row.org,
              level: row.level,
              awardName: row.awardName,
              year: row.year,
            }))}
          />
          <DataTableCard
            title="科技报告"
            note="依托项目共撰写 23 篇科技报告。"
            filters={['报告类型', '立项时间', '输入名称、关键词筛选']}
            columns={['序号', '名称', '作者', '作者单位', '报告类型', '对应项目', '立项时间']}
            rows={reportRows.map((row) => ({
              id: row.id,
              name: row.name,
              author: row.author,
              org: row.org,
              stage: row.stage,
              projectName: row.projectName,
              year: row.year,
            }))}
          />
        </section>
      </div>
      <FloatButton.BackTop visibilityHeight={260} style={{ insetInlineEnd: 28, bottom: 132 }} />
    </div>
  )
}
