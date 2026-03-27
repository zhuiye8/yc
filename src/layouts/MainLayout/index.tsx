import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AIFloatButton from '@/components/AIFloatButton'
import styles from './MainLayout.module.scss'

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
      <AIFloatButton />
    </div>
  )
}
