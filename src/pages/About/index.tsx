import { ClockCircleOutlined } from '@ant-design/icons'
import aboutBg from '@/assets/images/hero/about-bg.jpg'
import bannerLeft from '@/assets/images/icons/小图标_78.png'
import bannerRight from '@/assets/images/icons/小图标_81.png'
import goalImg1 from '@/assets/images/icons/小图标_131.png'
import goalImg2 from '@/assets/images/icons/小图标_128.png'
import goalImg3 from '@/assets/images/icons/小图标_134.png'
import goalImg4 from '@/assets/images/icons/小图标_125.png'
import styles from './About.module.scss'

const goals = [
  { img: goalImg1, title: '数据层', color: '#2468F2', items: ['海量数据日均更新', '多源数据融合', '数据质量评估与治理闭环'] },
  { img: goalImg2, title: '分析层', color: '#F5A623', items: ['更精细的诊断模型', '可配置指标体系', '对标分析与趋势预测'] },
  { img: goalImg3, title: '应用层', color: '#2BA471', items: ['跨模块日益联动', '任务驱动运营', '多端展示与开放接口'] },
  { img: goalImg4, title: '生态合作', color: '#C94A4A', items: ['数据合作', '工具集成', '联合运营与持续迭代'] },
]

export default function About() {
  return (
    <div className={styles.page}>
      <img src={aboutBg} alt="" className={styles.hero} />

      <div className={styles.content}>
        {/* 平台介绍 */}
        <h1 className={styles.sectionTitle}>
          <span className={styles.blue}>平台</span>介绍
        </h1>
        <div className={styles.sectionSubtitle}>产业人才数智化服务平台，助力区域产业与人才高质量协同发展</div>

        <p className={styles.introText}>
          宜昌产业人才地图是在宜昌市委组织部指导下，由湖北三峡人才集团牵头建设的综合性产业人才数智化服务平台。
          平台深度聚焦宜昌市绿色化工、新能源新材料、生命健康、汽车及装备制造、算力及大数据、文化旅游六大主导产业，
          汇聚全国范围内的产业数据、人才资源、技术成果、政策信息和金融资源，构建起覆盖"产业人才服务生态"。
        </p>

        {/* 两张图片卡片 */}
        <div className={styles.bannerCards}>
          <div className={styles.bannerCard}>
            <img src={bannerLeft} alt="" />
            <div className={styles.bannerContent}>
              <div className={styles.bannerTag}>目 标</div>
              <div className={styles.bannerTitle}>做产业要素的卓越连接者，发展生态的智慧重构者。</div>
              <div className={styles.bannerDesc}>汇聚并高效匹配人才、产业、技术、资金和政策等核心资源，开创精准、可持续的产业人才治理新范式。</div>
            </div>
          </div>
          <div className={styles.bannerCard}>
            <img src={bannerRight} alt="" />
            <div className={styles.bannerContent}>
              <div className={styles.bannerTag}>愿 景</div>
              <div className={styles.bannerTitle}>刻画产业人才图谱，构筑国家新质生产力数字底座。</div>
              <div className={styles.bannerDesc}>致力于成为服务国家发展战略布局、引领区域产业专业迁、赋能企业和人才竞争力的关键基础设施。</div>
            </div>
          </div>
        </div>

        {/* 当前版本 + 已上线能力 */}
        <div className={styles.twoCol}>
          <div className={styles.colItem}>
            <h3>当前<span className={styles.blue}>版本</span></h3>
            <div className={styles.versionTag}>
              <span style={{ background: '#E6F7FF', color: '#2468F2' }}>V1.0</span>
              <span style={{ background: '#F0FFF4', color: '#2BA471' }}>@V36</span>
              <span style={{ color: '#86909C', fontSize: 12 }}>2026年1月发布</span>
            </div>
            <p>
              当前版本已实现产业、人才、技术、资金、政策五大模块的核心功能，
              支持全维度检索、多维画像、清单管理、报告生成、预警订阅等能力。
              平台采用先进的微服务架构，支持高并发访问和弹性扩展，确保系统稳定性和可靠性。
            </p>
            <p>
              系统集成了智能AI助手，可以针对用户的具体需求提供个性化的政策推荐、
              人才匹配、融资方案等建议。同时，平台提供丰富的可视化分析工具，
              帮助用户直观了解产业发展态势、人才分布情况和技术创新趋势。
            </p>
          </div>
          <div className={styles.colItem}>
            <h3>已上线<span className={styles.blue}>能力</span></h3>
            <ul>
              <li>全维度检索（企业/人才/技术/政策/机构）</li>
              <li>多维画像与标签化展示</li>
              <li>自定义清单管理与跟进记录</li>
              <li>一键生成各类分析报告</li>
              <li>预警与提醒订阅服务</li>
              <li>AI智能问答与联动分析</li>
            </ul>
          </div>
        </div>

        {/* 数据更新与治理机制 */}
        <h2 className={styles.sectionTitle}>
          <span className={styles.blue}>数据</span>更新与治理机制
        </h2>
        <div className={styles.sectionSubtitle}>数据来源与质量保障</div>
        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>数据更新频率</div>
            <div className={styles.metricNum}>
              <ClockCircleOutlined className={styles.metricIcon} />
              每周
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>数据源</div>
            <div className={styles.metricNum}>12<span className={styles.metricUnit}>个</span></div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>数据质量</div>
            <div className={styles.metricNum}>98.5<span className={styles.metricUnit}>%</span></div>
          </div>
        </div>

        {/* 未来发展目标 */}
        <h2 className={styles.sectionTitle}>
          <span className={styles.blue}>未来</span>发展目标
        </h2>
        <div className={styles.sectionSubtitle}>数据层 · 分析层 · 应用层 · 生态合作</div>
        <div className={styles.goalCards}>
          {goals.map(g => (
            <div key={g.title} className={styles.goalCard} style={{ borderBottom: `3px solid ${g.color}` }}>
              <img src={g.img} alt="" className={styles.goalBg} />
              <div className={styles.goalTitle} style={{ color: g.color }}>{g.title}</div>
              <div className={styles.goalDesc}>
                {g.items.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            </div>
          ))}
        </div>

        {/* 使用帮助 */}
        <h2 className={styles.sectionTitle}>
          <span className={styles.blue}>使用</span>帮助
        </h2>
        <div className={styles.sectionSubtitle}>操作手册、常见问题与问题反馈</div>
        <div className={styles.helpCards}>
          <div className={styles.helpCard}>📖 操作手册下载</div>
          <div className={styles.helpCard}>❓ 常见问题解答</div>
          <div className={styles.helpCard}>📝 问题反馈</div>
        </div>
        <div className={styles.helpNote}>如有更多问题，请通过左面底部的联系方式与我们取得联系</div>
      </div>
    </div>
  )
}
