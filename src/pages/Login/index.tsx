import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '@/services/auth'
import logo from '@/assets/images/logo.png'
import styles from './Login.module.scss'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('i3dev')
  const [secret, setSecret] = useState('woeuty#WHU!027')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!username || !secret) {
      setError('请输入账号和密码')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login({ username, secret })
      navigate('/')
    } catch {
      setError('登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 左侧品牌区 */}
        <div className={styles.brandSide}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h1 className={styles.brandTitle}>宜昌产业人才地图</h1>
          <p className={styles.brandDesc}>
            以"产业·人才·创新·资金·政策"五链深度融合为基础
            <br />
            构建"人才+"创新发展模式，打造中国产业人才创新服务大平台。
          </p>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.blue}`}>产业招引</span>
            <span className={`${styles.tag} ${styles.blue}`}>人才匹配</span>
            <span className={`${styles.tag} ${styles.cyan}`}>创新协同</span>
            <span className={`${styles.tag} ${styles.orange}`}>资金对接</span>
            <span className={`${styles.tag} ${styles.red}`}>政策直达</span>
          </div>
        </div>

        {/* 右侧登录面板 */}
        <div className={styles.loginPanel}>
          <h2 className={styles.panelTitle}>欢迎使用</h2>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <UserOutlined className={styles.inputIcon} />
              <input
                type="text"
                placeholder="请输入您的账号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <LockOutlined className={styles.inputIcon} />
              <input
                type="password"
                placeholder="请输入密码"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <button
            className={styles.loginBtn}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登录中...' : '登 录'}
          </button>

          <div className={styles.panelFooter}>
            <a>验证码登录</a>
            <a>微信登录</a>
            <a>忘记密码</a>
          </div>
        </div>
      </div>
    </div>
  )
}
