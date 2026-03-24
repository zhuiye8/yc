/**
 * @input { Routes, Route } from 'react-router-dom', dashboard 子应用页面组件（DashboardHome, DashboardIndustry, DashboardTalent）
 * @output { Screen } 大屏入口组件
 * @position 业务页面，嵌套路由桥接主应用与 dashboard 大屏子应用
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import { Routes, Route } from 'react-router-dom';
import DashboardHome from '../dashboard/pages/Index/index';
import DashboardIndustry from '../dashboard/pages/industry/industry';
import DashboardTalent from '../dashboard/pages/talent/talent';
import '../dashboard/App.scss';

const Screen: React.FC = () => {
  return (
    <div className="dashboard-root">
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="industry" element={<DashboardIndustry />} />
        <Route path="talent" element={<DashboardTalent />} />
      </Routes>
    </div>
  );
};

export default Screen;
