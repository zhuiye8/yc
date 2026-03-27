import { useLocation } from 'react-router-dom'
import styles from './MainLayout.module.scss'

export default function Footer() {
  const location = useLocation()

  // 首页自行管理页脚
  if (location.pathname === '/') return null

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <p className={styles.footerSlogan}>
              助力宜昌产业与人才高质量协同发展的数智化服务平台。
            </p>
            <div className={styles.footerNav}>
              <span>首页</span>
              <span>产业服务</span>
              <span>人才服务</span>
              <span>技术创新</span>
              <span>融资对接</span>
              <span>政策申报</span>
              <span>关于我们</span>
            </div>
            <div className={styles.footerContact}>
              <span>📍 湖北省宜昌市伍家岗区沿江大道188号12-13楼</span>
              <span>📞 0717-6215798</span>
              <span>✉ service@yc-talent.com</span>
            </div>
            <div className={styles.footerCopy}>
              Copyright &copy; 2026 宜昌产业人才地图 All Rights Reserved | 鄂ICP备XXXXXXXX号-1
            </div>
          </div>

          <div className={styles.footerQrcodes}>
            <div className={styles.qrItem}>
              <div className={styles.qrPlaceholder} />
              <p>微信公众号</p>
            </div>
            <div className={styles.qrItem}>
              <div className={styles.qrPlaceholder} />
              <p>技术支持</p>
            </div>
            <div className={styles.qrItem}>
              <div className={styles.qrPlaceholder} />
              <p>微信小程序</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
