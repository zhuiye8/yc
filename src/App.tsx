import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Spin } from 'antd'
import MainLayout from '@/layouts/MainLayout'
import ScreenLayout from '@/layouts/ScreenLayout'

// 路由懒加载 — 每个页面独立 chunk，按需下载
const Login = lazy(() => import('@/pages/Login'))
const Home = lazy(() => import('@/pages/Home'))
const Industry = lazy(() => import('@/pages/Industry'))
const EnterpriseDetail = lazy(() => import('@/pages/Industry/EnterpriseDetail'))
const TalentDetail = lazy(() => import('@/pages/Industry/TalentDetail'))
const Talent = lazy(() => import('@/pages/Talent'))
const Innovation = lazy(() => import('@/pages/Innovation'))
const Funding = lazy(() => import('@/pages/Funding'))
const Policy = lazy(() => import('@/pages/Policy'))
const Solutions = lazy(() => import('@/pages/Solutions'))
const About = lazy(() => import('@/pages/About'))
const ListCenter = lazy(() => import('@/pages/ListCenter'))
const ReportCenter = lazy(() => import('@/pages/ReportCenter'))
const AlertCenter = lazy(() => import('@/pages/AlertCenter'))
const ScreenIndustry = lazy(() => import('@/pages/Screen/ScreenIndustry'))
const ScreenTalent = lazy(() => import('@/pages/Screen/ScreenTalent'))
const ScreenInnovationOld = lazy(() => import('@/pages/Screen/ScreenInnovationOld/index.jsx'))
const ScreenFundsOld = lazy(() => import('@/pages/Screen/ScreenFundsOld/index.jsx'))
const ScreenPolicyOld = lazy(() => import('@/pages/Screen/ScreenPolicyOld/index.jsx'))

// 全局 loading fallback
function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spin size="large" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* 登录页 - 独立布局 */}
          <Route path="/login" element={<Login />} />

          {/* 网页版 - MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="industry" element={<Industry />} />
            <Route path="industry/enterprise/:id" element={<EnterpriseDetail />} />
            <Route path="industry/talent/:id" element={<TalentDetail />} />
            <Route path="talent" element={<Talent />} />
            <Route path="innovation" element={<Innovation />} />
            <Route path="funding" element={<Funding />} />
            <Route path="policy" element={<Policy />} />
            <Route path="solutions" element={<Solutions />} />
            <Route path="about" element={<About />} />
            <Route path="list" element={<ListCenter />} />
            <Route path="reports" element={<ReportCenter />} />
            <Route path="alerts" element={<AlertCenter />} />
          </Route>

          {/* 大屏模式 - ScreenLayout */}
          <Route path="/screen" element={<ScreenLayout />}>
            <Route index element={<ScreenIndustry />} />
            <Route path="industry" element={<ScreenIndustry />} />
            <Route path="talent" element={<ScreenTalent />} />
            <Route path="innovation" element={<ScreenInnovationOld />} />
            <Route path="funds" element={<ScreenFundsOld />} />
            <Route path="policy" element={<ScreenPolicyOld />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
