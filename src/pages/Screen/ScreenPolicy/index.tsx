import { useState, useRef, useEffect, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import ScreenMap from '../components/ScreenMap'
import ScreenTabs from '../components/ScreenTabs'

// ========== 政策概览环形图 ==========
function getPolicyDonutOption() {
  const data = [
    { name: '人才政策', value: 564, itemStyle: { color: '#3B82F6' } },
    { name: '产业政策', value: 332, itemStyle: { color: '#10B981' } },
    { name: '创新政策', value: 239, itemStyle: { color: '#F59E0B' } },
    { name: '资金政策', value: 121, itemStyle: { color: '#EF4444' } },
  ]
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}条 ({d}%)' },
    legend: { show: false },
    series: [
      {
        type: 'pie', radius: ['40%', '68%'], padAngle: 3,
        center: ['50%', '50%'],
        label: {
          color: '#B0C4DE', fontSize: 10,
          formatter: (p: { name: string; value: number; percent: number }) =>
            `{name|${p.name}}\n{value|${p.value}条}`,
          rich: {
            name: { fontSize: 10, color: '#B0C4DE', lineHeight: 16 },
            value: { fontSize: 12, color: '#FFD900', fontWeight: 600, lineHeight: 18 },
          },
        },
        labelLine: { length: 8, length2: 12, lineStyle: { color: 'rgba(176,196,222,0.4)' } },
        itemStyle: { borderColor: 'rgba(0,20,40,0.8)', borderWidth: 2 },
        emphasis: {
          scaleSize: 6,
          itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0,198,255,0.5)' },
        },
        data,
      },
      // 内圈装饰
      {
        type: 'pie', radius: ['33%', '37%'], padAngle: 0,
        center: ['50%', '50%'],
        silent: true, label: { show: false },
        data: data.map(d => ({ value: d.value, itemStyle: { color: d.itemStyle.color + '33' } })),
      },
    ],
  }
}

// ========== 宜昌人才政策文本内容 ==========
const policyTextSections = [
  {
    title: '引进类政策：',
    content: '安家费、购房补贴、租房补贴、落户便利、薪酬激励、引才奖励（给用人单位或中介）。',
  },
  {
    title: '保障类政策：',
    subsections: [
      { title: '生活保障：', content: '人才公寓、共有产权房、医疗保障（绿色通道、体检）、子女教育（入学入园）、配偶安置（就业帮助）。' },
      { title: '人才安居：', content: '顶尖人才，奖励一套市属国有企业开发的不低于150平方米的住房。全职引进的A-C类人才，前2年可免费入住人才公寓。' },
    ],
  },
  {
    title: '培育类政策：',
    content: '培训补贴、继续教育支持、访问学者计划、博士后资助、青年人才项目、技能大师工作室、人才研修院。',
  },
]

// ========== 政策列表数据 ==========
const policyHeaders = ['标题', '发布部门', '发布日期', '截止时间', '类型', '标签']
const policyColumnRatios = [0.34, 0.2, 0.12, 0.12, 0.06, 0.16]
const policyRows = [
  { title: '关于进一步加强科技创新引领产业发展的若干措施', dept: '市科技局', pubDate: '2025-03-15', deadline: '2026-03-15', type: '市', label: '科技创新' },
  { title: '宜昌市促进民营经济发展壮大若干措施', dept: '市发改委', pubDate: '2025-02-28', deadline: '2026-02-28', type: '市', label: '惠企政策' },
  { title: '关于支持文化旅游产业高质量发展的实施意见', dept: '市文旅局', pubDate: '2025-01-20', deadline: '2025-12-31', type: '市', label: '文化旅游' },
  { title: '宜昌市电子商务发展专项资金管理办法', dept: '市商务局', pubDate: '2024-12-15', deadline: '2025-12-15', type: '市', label: '电子商务' },
  { title: '关于加快推进知识产权强市建设的若干意见', dept: '市市场监管局', pubDate: '2024-11-30', deadline: '2025-11-30', type: '市', label: '知识产权' },
  { title: '湖北省促进高新技术产业发展条例', dept: '省科技厅', pubDate: '2024-10-25', deadline: '2025-10-25', type: '省', label: '高新技术' },
  { title: '关于深化人才发展体制机制改革的实施意见', dept: '市委组织部', pubDate: '2024-09-18', deadline: '2025-09-18', type: '市', label: '人才政策' },
  { title: '宜昌市绿色化工产业集群发展规划', dept: '市经信局', pubDate: '2024-08-10', deadline: '2025-08-10', type: '市', label: '绿色化工' },
  { title: '关于促进生物医药产业高质量发展的若干政策', dept: '市发改委', pubDate: '2024-07-22', deadline: '2025-07-22', type: '市', label: '生物医药' },
  { title: '宜昌市数字经济发展三年行动方案', dept: '市大数据局', pubDate: '2024-06-15', deadline: '2027-06-15', type: '市', label: '数字经济' },
  { title: '关于支持新能源汽车产业发展的若干措施', dept: '市经信局', pubDate: '2024-05-28', deadline: '2025-05-28', type: '市', label: '新能源' },
  { title: '宜昌市乡村振兴人才支持计划', dept: '市农业农村局', pubDate: '2024-04-20', deadline: '2025-04-20', type: '市', label: '乡村振兴' },
  { title: '关于进一步优化营商环境的实施方案', dept: '市政府办', pubDate: '2024-03-15', deadline: '2025-03-15', type: '市', label: '营商环境' },
  { title: '宜昌市青年人才安居工程实施办法', dept: '市住建局', pubDate: '2024-02-28', deadline: '2025-02-28', type: '市', label: '人才安居' },
  { title: '当阳市招商引资优惠政策', dept: '当阳市政府', pubDate: '2024-01-18', deadline: '2025-01-18', type: '县', label: '招商引资' },
  { title: '关于加快培育专精特新企业的实施意见', dept: '市经信局', pubDate: '2024-12-08', deadline: '2025-12-08', type: '市', label: '专精特新' },
  { title: '宜昌高新区创新创业扶持办法', dept: '高新区管委会', pubDate: '2024-11-15', deadline: '2025-11-15', type: '市', label: '双创扶持' },
  { title: '秭归县文化旅游产业发展奖励办法', dept: '秭归县政府', pubDate: '2024-10-20', deadline: '2025-10-20', type: '县', label: '文化旅游' },
  { title: '湖北省促进科技成果转化若干政策', dept: '省科技厅', pubDate: '2024-09-10', deadline: '2025-09-10', type: '省', label: '成果转化' },
  { title: '关于实施"宜才回归"工程的通知', dept: '市委组织部', pubDate: '2024-08-05', deadline: '2025-08-05', type: '市', label: '人才回归' },
]

export default function ScreenPolicy() {
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  // 自动滚动
  const loopRows = useMemo(() => [...policyRows, ...policyRows], [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const scrollSpeed = 0.5
    const originalHeight = container.scrollHeight / 2

    const tick = () => {
      if (!isPaused && container) {
        container.scrollTop += scrollSpeed
        if (container.scrollTop >= originalHeight) {
          container.scrollTop -= originalHeight
        }
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isPaused])

  return (
    <div className="main-content policy-container">
      {/* 左侧栏 */}
      <div className="left-column">
        {/* 政策概览 */}
        <div className="left-top">
          <div className="left-top-title" />
          <div style={{ padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#B0C4DE' }}>政策总数</span>
              <span style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                1,256
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, padding: '0 8px', marginBottom: 4 }}>
            {[
              { label: '人才政策', value: '564条' },
              { label: '可申报政策', value: '239条' },
              { label: '即将到期', value: '45条' },
            ].map(card => (
              <div key={card.label} style={{ flex: 1, textAlign: 'center', padding: '8px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4, background: 'rgba(0,198,255,0.03)' }}>
                <div style={{ fontSize: 10, color: '#AFABAB', marginBottom: 3 }}>{card.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFD700' }}>{card.value}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 4px' }}>
            <ReactECharts option={getPolicyDonutOption()} style={{ height: '100%' }} notMerge />
          </div>
        </div>

        {/* 宜昌人才政策 */}
        <div className="left-bottom">
          <div className="left-bottom-title" />
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
            {policyTextSections.map((section, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#00ffe4', marginBottom: 4 }}>{section.title}</div>
                {section.content && (
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: '#FFFFFF', paddingLeft: 12 }}>{section.content}</div>
                )}
                {section.subsections?.map((sub, j) => (
                  <div key={j} style={{ paddingLeft: 12, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, color: '#00c6ff', fontWeight: 500 }}>{sub.title}</div>
                    <div style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>{sub.content}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <ScreenTabs />
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap ckey="政策" />
          </div>
        </div>
      </div>

      {/* 右侧栏 — 政策列表 */}
      <div className="right-column">
        <div className="right-top">
          <div className="right-top-title" />
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 4px' }}>
            {/* 表头 */}
            <div style={{ display: 'flex', backgroundColor: '#0d4fa3', flexShrink: 0 }}>
              {policyHeaders.map((h, i) => (
                <div key={i} style={{ flex: policyColumnRatios[i], color: '#00ffe4', fontSize: 11, padding: '6px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h}
                </div>
              ))}
            </div>
            {/* 自动滚动表体 */}
            <div
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{ flex: 1, overflowY: 'hidden' }}
            >
              {loopRows.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex: policyColumnRatios[0], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</div>
                  <div style={{ flex: policyColumnRatios[1], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.dept}</div>
                  <div style={{ flex: policyColumnRatios[2], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.pubDate}</div>
                  <div style={{ flex: policyColumnRatios[3], color: '#B0C4DE', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.deadline}</div>
                  <div style={{ flex: policyColumnRatios[4], color: row.type === '省' ? '#F59E0B' : row.type === '县' ? '#10B981' : '#3B82F6', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.type}</div>
                  <div style={{ flex: policyColumnRatios[5], color: '#00c6ff', fontSize: 11, padding: '5px 4px', textAlign: 'center' }}>{row.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
