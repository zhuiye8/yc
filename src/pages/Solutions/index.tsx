import {
  TeamOutlined, BankOutlined, ExperimentOutlined,
  DollarOutlined, FileProtectOutlined, SearchOutlined,
  GlobalOutlined, DesktopOutlined, SyncOutlined,
} from '@ant-design/icons'
import solutionsBg from '@/assets/images/hero/solutions-bg.jpg'
import styles from './Solutions.module.scss'

const capabilities = [
  { icon: <TeamOutlined />, bg: '#E6F7FF', color: '#2468F2', title: '人才引育', desc: '人才画像与供需匹配' },
  { icon: <BankOutlined />, bg: '#F0FFF4', color: '#2BA471', title: '产业链诊断', desc: '全景图谱与强/弱/缺链分析' },
  { icon: <SearchOutlined />, bg: '#FFF7E6', color: '#F5A623', title: '招商引资', desc: '精准引路与精选企业推荐' },
  { icon: <ExperimentOutlined />, bg: '#F3F0FF', color: '#7B61FF', title: '技术洞察', desc: '专利/标准/项目趋势分析' },
  { icon: <FileProtectOutlined />, bg: '#FFF1F0', color: '#F26B4A', title: '政策申报', desc: '政策匹配与申报任务管理' },
  { icon: <DollarOutlined />, bg: '#E6FFFB', color: '#00B8D9', title: '投融资对接', desc: '融资工具与机构精准匹配' },
]

const scenarios = [
  { icon: <GlobalOutlined />, title: '对内治理', desc: '人才引育、产业分析、招商引资' },
  { icon: <DesktopOutlined />, title: '对外展示', desc: '大屏展示、路演支撑、招商推介' },
  { icon: <SyncOutlined />, title: '循环运营', desc: '清单管理、任务跟进、报告生成' },
]

const matrixRows = [
  { level: '政府场景', items: ['产业链图谱导航\n投资强链补链目标', '人才全景画像\n预判流动趋势', '产学研动态监测\n引导资源集聚', '基金投向跟踪\n重大项目评估', '政策仿真监管\n兑现全程数字化'] },
  { level: '企业场景', items: ['拓展上下游商机\n融入产业生态', '急需人才智能推荐\n柔性引才不死板', '技术难题精准传导\n成果一键对接', '多元金融产品匹配\n实现"以技定贷"', '政策自动筛算\n申报集中即享'] },
  { level: '个人场景', items: ['全国产业布局透视\n锚定落地热土', '岗位匹配项目推送\n合作机会精准触达', '企业技术需求对接\n打通转化通道', '人才专项基金直通\n成果转化有保障', '人才补贴一键计算\n政策红利尽享'] },
]

const dataCards = [
  { label: '产业维度', num: '1330', numColor: '#2468F2', unit: '家企业', sub: '5大产业链全覆盖', listL: ['5大主导产业链', '128个细分环节', '1330家链上企业', '强/弱/缺链状态诊断'], listR: ['产业聚落分析', '区域对标研究', '招商项目库管理', ''] },
  { label: '人才维度', num: '1330', numColor: '#2BA471', unit: '名人才', sub: '覆盖五大领域', listL: ['2856名专家人才', '分地区/领域管理', '供需匹配分析', '雷达人才对接'], listR: ['1256名直属高端人才', '人才画像标签', '引才意向跟踪', ''] },
  { label: '技术维度', num: '1330', numColor: '#7B61FF', unit: '件专利', sub: '23项关键技术缺口', listL: ['4526件专利数据', '128项技术标准', '186个在研项目', '23项技术缺口'], listR: ['IPC分类趋势', '技术成熟度评估', '产学研对接', ''] },
  { label: '资金维度', num: '1330', numColor: '#F26B4A', unit: '家机构', sub: '12.5亿累计对接', listL: ['28款融资工具', '156家投资机构', '对接全流程管理', '12.5亿累计对接'], listR: ['6大基金覆盖', '智能产品推荐', '融资进度追踪', ''] },
  { label: '政策维度', num: '1330', numColor: '#F5A623', unit: '项政策', sub: '智能精准匹配', listL: ['863项有效政策', '智能匹配推荐', '申报任务管理', '到期预警监控'], listR: ['政策解读分析', '中标成功率统计', '历年政策白皮书', ''] },
  { label: '可解释与可追溯', num: '100%', numColor: '#00B8D9', unit: '可追溯', sub: '数据透明所有数据可查', listL: ['来源标注跟踪展示', '数据可追溯预测', '快速整理能力', '审计日志留存'], listR: ['更新时间记录', '版本变更追踪', ''] },
]

export default function Solutions() {
  return (
    <div className={styles.page}>
      <img src={solutionsBg} alt="" className={styles.hero} />

      <div className={styles.content}>
        <h1 className={styles.sectionTitle}><span className={styles.blue}>解决</span>方案</h1>
        <p className={styles.sectionDesc}>
          平台致力于为政府部门、产业园区、企业、投资机构等提供覆盖产业人才全生命周期的数智化服务解决方案。
          我们通过智能分析与精准匹配，高效链接人才、企业、技术、资金及政策多维资源，在产业分析、人才引育、招商对接、
          技术洞察、融资支持与政策申报等关键环节提供决策支撑与流程赋能，切实增强发展动能，提升区域产业核心竞争力。
        </p>

        {/* 核心能力 */}
        <h2 className={styles.sectionTitle} style={{ fontSize: 20 }}><span className={styles.blue}>核心</span>能力</h2>
        <div className={styles.capGrid}>
          {capabilities.map(c => (
            <div key={c.title} className={styles.capCard}>
              <div className={styles.capIcon} style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <div className={styles.capText}>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 典型应用场景 */}
        <h2 className={styles.sectionTitle} style={{ fontSize: 20, marginBottom: 24 }}>
          <span className={styles.blue}>典型</span>应用<span className={styles.blue}>场景</span>
        </h2>
        <div className={styles.scenarioCards}>
          {scenarios.map(s => (
            <div key={s.title} className={styles.scenarioCard}>
              <div className={styles.scenarioIcon}>{s.icon}</div>
              <div className={styles.scenarioTitle}>{s.title}</div>
              <div className={styles.scenarioDesc}>{s.desc}</div>
            </div>
          ))}
        </div>

        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th style={{ width: 90 }}>角色</th>
              <th>产业招引</th>
              <th>人才引育</th>
              <th>创新协同</th>
              <th>融资对接</th>
              <th>政策匹配</th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.map(row => (
              <tr key={row.level}>
                <td>{row.level}</td>
                {row.items.map((item, i) => (
                  <td key={i} style={{ whiteSpace: 'pre-line' }}>{item}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 数据维度与深度 */}
        <h2 className={styles.sectionTitle} style={{ fontSize: 20, marginBottom: 24 }}>
          数据<span className={styles.blue}>维度与深度</span>
        </h2>
        <div className={styles.dataGrid}>
          {dataCards.map(c => (
            <div key={c.label} className={styles.dataCard}>
              <div className={styles.dataCardHeader}>
                <div className={styles.dataLabel}>{c.label}</div>
                <div className={styles.dataNum} style={{ color: c.numColor }}>
                  {c.num} <span className={styles.dataUnit}>{c.unit}</span>
                </div>
                <div className={styles.dataSubLabel}>{c.sub}</div>
              </div>
              <div className={styles.dataBody}>
                <div>{c.listL.filter(Boolean).map((item, i) => <div key={i}>· {item}</div>)}</div>
                <div>{c.listR.filter(Boolean).map((item, i) => <div key={i}>· {item}</div>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
