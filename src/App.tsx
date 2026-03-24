/**
 * @input { BrowserRouter, Routes, Route } from 'react-router-dom', { ConfigProvider, App } from 'antd', MainLayout, 11 个页面组件
 * @output { App } 根组件：ConfigProvider 全局主题 + BrowserRouter 路由表
 * @position 应用根组件，定义全局主题配置与路由结构
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Industry from './pages/Industry';
import Talent from './pages/Talent';
import Tech from './pages/Tech';
import Funding from './pages/Funding';
import Policy from './pages/Policy';
import About from './pages/About';
import Screen from './pages/Screen';
import ListCenter from './pages/ListCenter';
import ReportCenter from './pages/ReportCenter';
import AlertCenter from './pages/AlertCenter';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2468F2',
          colorInfo: '#2468F2',
          colorSuccess: '#2F8F6B',
          colorWarning: '#D89A2B',
          colorError: '#C94A4A',
          borderRadius: 16,
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans SC", Inter, "Helvetica Neue", Arial, sans-serif',
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="industry" element={<Industry />} />
              <Route path="talent" element={<Talent />} />
              <Route path="tech" element={<Tech />} />
              <Route path="funding" element={<Funding />} />
              <Route path="policy" element={<Policy />} />
              <Route path="about" element={<About />} />
              <Route path="screen/*" element={<Screen />} />
              <Route path="list" element={<ListCenter />} />
              <Route path="reports" element={<ReportCenter />} />
              <Route path="alerts" element={<AlertCenter />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
