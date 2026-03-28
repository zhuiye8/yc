import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { name: '产业布局', url: '/screen/industry' },
  { name: '人才总览', url: '/screen/talent' },
  { name: '创新资源', url: '/screen/innovation' },
  { name: '资金概览', url: '/screen/funds' },
  { name: '政策全景', url: '/screen/policy' },
]

export default function ScreenTabs() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="middle-top">
      {tabs.map(t => {
        const isActive = location.pathname === t.url
          || (t.url === '/screen/industry' && location.pathname === '/screen')
        return (
          <span
            key={t.name}
            className={`tab-item ${isActive ? 'tab-active' : ''}`}
            onClick={() => navigate(t.url)}
          >
            {t.name}
          </span>
        )
      })}
    </div>
  )
}
