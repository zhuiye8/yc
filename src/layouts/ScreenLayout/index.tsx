import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import styles from './ScreenLayout.module.scss'
import '@/pages/Screen/screen-global.css'
import returnImg from '@/assets/images/screen/return.png'

export default function ScreenLayout() {
  const navigate = useNavigate()
  const [time, setTime] = useState(dayjs())

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.clock}>
          <div className={styles.time}>{time.format('HH:mm:ss')}</div>
          <div className={styles.date}>{time.format('YYYY年MM月DD日 dddd')}</div>
        </div>
      </div>

      <Outlet />

      <div className={styles.bottom} onClick={() => navigate('/')}>
        <div className={styles.returnBtn}>
          <img src={returnImg} alt="返回首页" />
        </div>
      </div>
    </div>
  )
}
