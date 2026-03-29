import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppstoreOutlined,
  DesktopOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Badge, Dropdown } from 'antd'
import { logout } from '@/services/auth'
import logo from '@/assets/images/logo.png'
import styles from './MainLayout.module.scss'

const menuItems = [
  { key: '/', label: '首页' },
  { key: '/industry', label: '产业招引' },
  { key: '/talent', label: '人才引育' },
  { key: '/innovation', label: '创新协同' },
  { key: '/funding', label: '资金对接' },
  { key: '/policy', label: '政策直达' },
  { key: '/solutions', label: '解决方案' },
  { key: '/about', label: '关于我们' },
]

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logoArea} onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" />
          <span>宜昌产业人才地图</span>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`${styles.navItem} ${location.pathname === item.key ? styles.active : ''}`}
              onClick={() => navigate(item.key)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.headerAction}>
            <AppstoreOutlined />
            <span>快捷菜单</span>
          </div>
          <div className={styles.headerAction} onClick={() => navigate('/screen')}>
            <DesktopOutlined />
            <span>大屏模式</span>
          </div>
          <div className={styles.headerAction}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 16 }} />
            </Badge>
          </div>
          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
              ],
              onClick: ({ key }) => { if (key === 'logout') logout() },
            }}
            placement="bottomRight"
          >
            <div className={styles.headerAction} style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <span>管理员</span>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
