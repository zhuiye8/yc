import { useNavigate, useLocation } from 'react-router-dom'
import {
  LogoutOutlined,
  StarOutlined,
  FileTextOutlined,
  BellOutlined,
  HeartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { Badge, Dropdown } from 'antd'
import { logout } from '@/services/auth'
import logo from '@/assets/images/logo.png'
import iconMenu from '@/assets/images/icons/小图标_11.png'
import iconScreen from '@/assets/images/icons/小图标_13.png'
import iconBell from '@/assets/images/icons/小图标_06.png'
import iconUser from '@/assets/images/icons/小图标_08.png'
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
          <Dropdown
            menu={{
              items: [
                {
                  key: '/list',
                  label: '我的清单',
                  icon: <StarOutlined style={{ color: '#1890ff', fontSize: 16 }} />,
                },
                {
                  key: '/reports',
                  label: '报告中心',
                  icon: <FileTextOutlined style={{ color: '#1890ff', fontSize: 16 }} />,
                },
                {
                  key: '/alerts',
                  label: '预警中心',
                  icon: <BellOutlined style={{ color: '#1890ff', fontSize: 16 }} />,
                },
                {
                  key: '/favorites',
                  label: '收藏',
                  icon: <HeartOutlined style={{ color: '#1890ff', fontSize: 16 }} />,
                },
                {
                  key: '/recent',
                  label: '最近访问',
                  icon: <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />,
                },
              ],
              onClick: ({ key }) => navigate(key),
            }}
            placement="bottomRight"
          >
            <div className={styles.headerAction} style={{ cursor: 'pointer' }}>
              <img src={iconMenu} alt="" style={{ width: 16, height: 16 }} />
              <span>快捷菜单 ▼</span>
            </div>
          </Dropdown>

          <div className={styles.headerAction} onClick={() => navigate('/screen')}>
            <img src={iconScreen} alt="" style={{ width: 16, height: 16 }} />
            <span>大屏模式</span>
          </div>

          <div className={styles.headerAction}>
            <Badge count={3} size="small">
              <img src={iconBell} alt="" style={{ width: 16, height: 16 }} />
            </Badge>
            <span>消息</span>
          </div>

          <Dropdown
            menu={{
              items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }],
              onClick: ({ key }) => {
                if (key === 'logout') logout()
              },
            }}
            placement="bottomRight"
          >
            <div className={styles.headerAction} style={{ cursor: 'pointer' }}>
              <img src={iconUser} alt="" style={{ width: 16, height: 16 }} />
              <span>管理员</span>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
