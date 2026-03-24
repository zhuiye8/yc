/**
 * @input { Layout, Menu, Dropdown, Avatar, Badge } from 'antd', { Outlet, useNavigate, useLocation } from 'react-router-dom', AIFloatButton, Footer, Breadcrumb
 * @output { MainLayout } 主布局组件
 * @position 布局层，包裹所有子路由页面：固定头部导航 + 面包屑 + Outlet + 页脚 + AI 浮窗；大屏模式跳过标准布局
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, message, Modal } from 'antd';
import {
  HomeOutlined,
  BankOutlined,
  TeamOutlined,
  ExperimentOutlined,
  DollarOutlined,
  FileTextOutlined,
  InfoCircleOutlined,

  BellOutlined,
  UserOutlined,
  SettingOutlined,
  DesktopOutlined,
  StarOutlined,
  FileSearchOutlined,
  AlertOutlined,
  LogoutOutlined,
  HistoryOutlined,
  HeartOutlined,
  AppstoreOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AIFloatButton from '../components/AIFloatButton';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationVisible, setNotificationVisible] = useState(false);
  const [quickEntryVisible, setQuickEntryVisible] = useState(false);

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/industry', icon: <BankOutlined />, label: '产业' },
    { key: '/talent', icon: <TeamOutlined />, label: '人才' },
    { key: '/tech', icon: <ExperimentOutlined />, label: '创新' },
    { key: '/funding', icon: <DollarOutlined />, label: '资金' },
    { key: '/policy', icon: <FileTextOutlined />, label: '政策' },
    { key: '/about', icon: <InfoCircleOutlined />, label: '关于我们' },
  ];

  const notifications = [
    { id: 1, title: '新政策发布提醒', content: '湖北省科技创新专项资金申报已开始', time: '10分钟前', read: false },
    { id: 2, title: '企业风险预警', content: '关注企业"XX科技"出现经营异常', time: '1小时前', read: false },
    { id: 3, title: '人才匹配通知', content: '3位新材料领域专家符合您的引才需求', time: '2小时前', read: true },
    { id: 4, title: '报告生成完成', content: '产业链诊断报告已生成，可下载查看', time: '昨天', read: true },
    { id: 5, title: '政策到期提醒', content: '2项政策将于7天内截止申报', time: '昨天', read: true },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    { key: 'screen', icon: <DesktopOutlined />, label: '进入大屏模式' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  const quickEntryItems = [
    { key: 'lists', icon: <StarOutlined />, label: '我的清单', path: '/list' },
    { key: 'reports', icon: <FileSearchOutlined />, label: '报告中心', path: '/reports' },
    { key: 'alerts', icon: <AlertOutlined />, label: '预警中心', path: '/alerts' },
    { key: 'favorites', icon: <HeartOutlined />, label: '收藏', path: '/list' },
    { key: 'recent', icon: <HistoryOutlined />, label: '最近访问', path: '/reports' },
  ];

  const quickEntryMenuItems = quickEntryItems.map(({ key, icon, label }) => ({ key, icon, label }));

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        message.info('个人中心功能开发中，敬请期待');
        break;
      case 'settings':
        message.info('系统设置功能开发中，敬请期待');
        break;
      case 'screen':
        navigate('/screen');
        break;
      case 'logout':
        Modal.confirm({
          title: '确认退出',
          content: '确定要退出登录吗？',
          onOk: () => message.success('已退出登录'),
        });
        break;
    }
  };

  const handleQuickEntryMenuClick = ({ key }: { key: string }) => {
    const selected = quickEntryItems.find(item => item.key === key);
    if (selected) navigate(selected.path);
    setQuickEntryVisible(false);
  };

  const isScreenMode = location.pathname.startsWith('/screen');

  if (isScreenMode) {
    return <Outlet />;
  }

  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';

  return (
    <Layout style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: isAboutPage
        ? 'none'
        : isHomePage
          ? `url('/images/banner-bg6.png')`
          : `url('/images/banner-bg2.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      backgroundColor: isAboutPage ? '#ffffff' : isHomePage ? '#f5f7fa' : '#e8f0f8',
    }}>
      {/* 顶部导航 */}
      <Header
        className="header-gradient"
        style={{
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo 和系统名称 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <BankOutlined style={{ fontSize: 28 }} />
            <span>宜昌产业人才地图</span>
          </div>

          {/* 一级导航 */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              borderBottom: 'none',
              marginLeft: 32,
              flex: 1,
            }}
            theme="dark"
          />
        </div>

        {/* 右侧功能区 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 快捷入口 */}
          <Dropdown
            open={quickEntryVisible}
            onOpenChange={setQuickEntryVisible}
            placement="bottomRight"
            trigger={['click']}
            menu={{ items: quickEntryMenuItems, onClick: handleQuickEntryMenuClick }}
            overlayClassName="nav-quick-dropdown"
          >
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              className={`nav-quick-trigger${quickEntryVisible ? ' is-open' : ''}`}
            >
              快捷菜单
              <DownOutlined className="nav-quick-trigger-arrow" style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>

          {/* 通知 */}
          <Dropdown
            open={notificationVisible}
            onOpenChange={setNotificationVisible}
            dropdownRender={() => (
              <div style={{
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                width: 320,
                maxHeight: 400,
                overflow: 'auto',
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  fontWeight: 600,
                }}>
                  消息通知
                </div>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: n.read ? '#fff' : '#f6ffed',
                    }}
                    onClick={() => {
                      message.info(n.content);
                      setNotificationVisible(false);
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {!n.read && <Badge status="processing" />}
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>{n.content}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{n.time}</div>
                  </div>
                ))}
                <div
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    color: '#1890ff',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    message.info('查看全部消息');
                    setNotificationVisible(false);
                  }}
                >
                  查看全部消息
                </div>
              </div>
            )}
            trigger={['click']}
          >
            <Badge count={notifications.filter(n => !n.read).length} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: 'rgba(255,255,255,0.85)' }}
              />
            </Badge>
          </Dropdown>

          {/* 大屏模式按钮 */}
          <Button
            icon={<DesktopOutlined />}
            onClick={() => navigate('/screen')}
            style={{
              background: 'linear-gradient(135deg, #0a1628, #1a2f4d)',
              border: '1px solid rgba(0, 212, 255, 0.5)',
              borderRadius: 24,
              boxShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
              fontWeight: 500,
              height: 32,
              fontSize: 13,
            }}
          >
            大屏模式
          </Button>

          {/* 用户菜单 */}
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2468F2' }} />
              <span style={{ color: '#fff' }}>管理员</span>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* 面包屑导航 */}
      <Breadcrumb />

      {/* 主内容区 */}
      <Content style={{
        flex: 1,
        background: 'transparent',
        padding: isHomePage ? 0 : 16,
      }}>
        <Outlet />
      </Content>

      {/* 页脚 */}
      <Footer />

      {/* AI 浮窗 */}
      <AIFloatButton />
    </Layout>
  );
};

export default MainLayout;
