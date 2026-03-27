import { useNavigate } from 'react-router-dom'
import ScreenMap from '../components/ScreenMap'

const tabs = [
  { name: '产业布局', url: '/screen/industry' },
  { name: '人才总览', url: '/screen/talent' },
  { name: '创新资源', url: '/screen' },
  { name: '资金概览', url: '/screen' },
  { name: '政策全景', url: '/screen' },
]

const industries = ['湿电子化学品', '新能源电池', '化学制药', '合成生物', '船舶制造', '人工智能']

const indicators = [
  { label: '缺链数', value: '4' },
  { label: '强链数', value: '10' },
  { label: '产业链数', value: '6' },
  { label: '企业总数', value: '20944' },
  { label: '人才总数', value: '419039' },
]

const enterpriseList = [
  { name: '兴发集团股份有限公司', industry: '化学原料' },
  { name: '安琪酵母股份有限公司', industry: '食品制造' },
  { name: '宜化集团有限责任公司', industry: '化学原料' },
  { name: '人福医药集团股份公司', industry: '医药制造' },
  { name: '三峡新材股份有限公司', industry: '非金属矿物' },
  { name: '华中科技大学', industry: '科学研究' },
  { name: '三峡集团', industry: '电力生产' },
  { name: '中船重工710研究所', industry: '科学研究' },
  { name: '湖北三峡实验室', industry: '科学研究' },
]

const talentList = [
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
  { name: '王某某', title: '部门经理', field: '深圳市大数据智慧创新部门' },
]

export default function ScreenIndustry() {
  const navigate = useNavigate()

  return (
    <div className="main-content" style={{ /* industry-container class applied via wrapper */ }}>
      {/* 左侧栏 */}
      <div className="left-column" style={{ /* override flex ratios for industry */ }}>
        {/* 产业选择网格 */}
        <div style={{ flex: 1, padding: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', height: '100%' }}>
            {industries.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4, cursor: 'pointer', transition: 'all 0.3s',
                backgroundImage: `url(/src/assets/images/screen/industry-bg.png)`,
                backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                fontSize: 14, color: i === 5 ? '#00ffc0' : '#00c6ff',
              }}>{item}</div>
            ))}
          </div>
        </div>

        {/* 产业链综合指标 */}
        <div className="left-middle" style={{ flex: 2 }}>
          <div className="left-middle-title" style={{ backgroundImage: `url(/src/assets/images/screen/indicator-title.png)` }} />
          <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {indicators.slice(0, 2).map(ind => (
              <div key={ind.label} style={{ flex: 1, textAlign: 'center', padding: '8px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: '#AFABAB' }}>{ind.label}</div>
                <div style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{ind.value}</div>
              </div>
            ))}
            <div style={{ width: '100%' }} />
            {indicators.slice(2).map(ind => (
              <div key={ind.label} style={{ flex: 1, textAlign: 'center', padding: '8px 0', border: '1px solid rgba(0,198,255,0.15)', borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: '#AFABAB' }}>{ind.label}</div>
                <div style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)', fontWeight: 700, background: 'linear-gradient(135deg, #f8d06b 0%, #FF8A00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{ind.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 链上企业 */}
        <div className="left-bottom" style={{ flex: 2 }}>
          <div className="left-bottom-title" style={{ backgroundImage: `url(/src/assets/images/screen/enterprise-title.png)` }} />
          <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#7a8ba8' }}>
              <span style={{ flex: 1 }}>企业名</span>
              <span style={{ width: 100, textAlign: 'right' }}>所属行业</span>
            </div>
            {enterpriseList.map((e, i) => (
              <div key={i} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#B0C4DE' }}>
                <span style={{ flex: 1 }}>{e.name}</span>
                <span style={{ width: 100, textAlign: 'right', color: '#00c6ff' }}>{e.industry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 中间栏 */}
      <div className="middle-column">
        <div className="middle-top">
          {tabs.map(t => (
            <span key={t.name} className="tab-item" onClick={() => navigate(t.url)}>{t.name}</span>
          ))}
        </div>
        <div className="middle-center">
          <div className="map-container">
            <ScreenMap />
          </div>
        </div>
      </div>

      {/* 右侧栏 */}
      <div className="right-column">
        <div className="right-middle" style={{ flex: 2 }}>
          <div className="right-middle-title" style={{ backgroundImage: `url(/src/assets/images/screen/industry-talent-title.png)` }} />
          <div style={{ padding: '0 12px', overflow: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#7a8ba8' }}>
              <span style={{ width: 70 }}>人才名</span>
              <span style={{ flex: 1 }}>职称</span>
              <span style={{ flex: 1, textAlign: 'right' }}>领域</span>
            </div>
            {talentList.map((t, i) => (
              <div key={i} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#B0C4DE' }}>
                <span style={{ width: 70 }}>{t.name}</span>
                <span style={{ flex: 1, color: '#00c6ff' }}>{t.title}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t.field}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="right-bottom" style={{ flex: 2 }}>
          <div className="right-bottom-title" style={{ backgroundImage: `url(/src/assets/images/screen/distribution-title.png)` }} />
          <div style={{ flex: 1, minHeight: 0, padding: '0 8px' }}>
            {/* 企业类型分布可以放图表，暂用指标 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
              {[{ label: '上市公司', value: '12', color: '#3B82F6' }, { label: '专精特新', value: '45', color: '#10B981' }, { label: '科技型中小', value: '89', color: '#F59E0B' }, { label: '全量科技', value: '1662', color: '#EF4444' }].map(d => (
                <div key={d.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 700, color: d.color }}>{d.value}</div>
                  <div style={{ fontSize: 10, color: '#AFABAB' }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
