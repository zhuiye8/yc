import { useLocation } from 'react-router-dom'
import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import qrcodeWechat from '@/assets/images/qrcode-wechat.png'
import qrcodeSupport from '@/assets/images/qrcode-support.png'
import qrcodeMiniapp from '@/assets/images/qrcode-miniapp.png'
import styles from './MainLayout.module.scss'

export default function Footer() {
  const location = useLocation()

  if (location.pathname === '/') return null

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <p className={styles.footerSlogan}>助力宜昌产业与人才高质量协同发展的数智化服务平台</p>
            <div className={styles.footerNav}>
              <span>首页</span>
              <span>产业招引</span>
              <span>人才引育</span>
              <span>创新协同</span>
              <span>资金对接</span>
              <span>政策直达</span>
              <span>解决方案</span>
              <span>关于我们</span>
            </div>
            <div className={styles.footerContact}>
              <span className={styles.footerContactItem}>
                <EnvironmentOutlined className={styles.footerContactIcon} />
                湖北省宜昌市伍家岗区沿江大道188号12-13楼
              </span>
              <span className={styles.footerContactItem}>
                <PhoneOutlined className={styles.footerContactIcon} />
                0717-6215798
              </span>
              <span className={styles.footerContactItem}>
                <MailOutlined className={styles.footerContactIcon} />
                service@yc-talent.com
              </span>
            </div>
            <div className={styles.footerCopy}>
              Copyright &copy; 2026 宜昌产业人才地图 All Rights Reserved | 鄂ICP备XXXXXXX号-1
            </div>
          </div>

          <div className={styles.footerQrcodes}>
            <div className={styles.qrItem}>
              <img src={qrcodeWechat} alt="微信公众号" className={styles.qrImage} />
              <p>微信公众号</p>
            </div>
            <div className={styles.qrItem}>
              <img src={qrcodeSupport} alt="技术支持" className={styles.qrImage} />
              <p>技术支持</p>
            </div>
            <div className={styles.qrItem}>
              <img src={qrcodeMiniapp} alt="微信小程序" className={styles.qrImage} />
              <p>微信小程序</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
