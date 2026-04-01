import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import ScreenLayout from '@/layouts/ScreenLayout'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Industry from '@/pages/Industry'
import Talent from '@/pages/Talent'
import Innovation from '@/pages/Innovation'
import Funding from '@/pages/Funding'
import Policy from '@/pages/Policy'
import Solutions from '@/pages/Solutions'
import About from '@/pages/About'
import ListCenter from '@/pages/ListCenter'
import ReportCenter from '@/pages/ReportCenter'
import AlertCenter from '@/pages/AlertCenter'
import ScreenIndustry from '@/pages/Screen/ScreenIndustry'
import ScreenTalent from '@/pages/Screen/ScreenTalent'
import ScreenInnovationOld from '@/pages/Screen/ScreenInnovationOld/index.jsx'
import ScreenFundsOld from '@/pages/Screen/ScreenFundsOld/index.jsx'
import ScreenPolicyOld from '@/pages/Screen/ScreenPolicyOld/index.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 - 独立布局 */}
        <Route path="/login" element={<Login />} />

        {/* 网页版 - MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="industry" element={<Industry />} />
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
    </BrowserRouter>
  )
}
