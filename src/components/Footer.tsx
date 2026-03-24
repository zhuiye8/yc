/**
 * @input { Space, Typography, Divider } from 'antd', { useNavigate } from 'react-router-dom', @ant-design/icons
 * @output { Footer } 页脚组件
 * @position 共享 UI 组件，由 MainLayout 渲染，三栏布局：品牌信息 + 快速链接 + 二维码
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React from 'react';
import { Space, Typography, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const quickLinksLeft = [
    { name: '首页', path: '/' },
    { name: '产业服务', path: '/industry' },
    { name: '人才服务', path: '/talent' },
    { name: '技术创新', path: '/tech' },
  ];

  const quickLinksRight = [
    { name: '融资对接', path: '/funding' },
    { name: '政策申报', path: '/policy' },
    { name: '关于我们', path: '/about' },
  ];

  const handleLinkClick = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.3s ease',
  };

  const qrcodeItems = [
    { label: '微信公众号', alt: '微信公众号' },
    { label: '技术支持', alt: '技术支持' },
    { label: '微信小程序', alt: '微信小程序' },
  ];

  return (
    <footer style={{
      background: '#2468F2',
      borderTop: 'none',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      padding: '32px 0 20px',
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
        {/* 三栏布局 */}
        <div className="footer-grid">
          {/* 左侧：品牌信息 */}
          <div style={{ maxWidth: 400 }}>
            <div style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 8,
            }}>
              宜昌产业人才地图
            </div>
            <div style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
              marginBottom: 12,
            }}>
              助力宜昌产业与人才高质量协同发展的数智化服务平台
            </div>
            <Space direction="vertical" size={4}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <EnvironmentOutlined style={{ color: 'rgba(255,255,255,0.8)', marginTop: 3, fontSize: 14 }} />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  湖北省宜昌市伍家岗区沿江大道188号12-13楼
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }} />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  0717-6215798
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }} />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  service@yc-talent.com
                </Text>
              </div>
            </Space>
          </div>

          {/* 中间：快速链接（两列） */}
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 10,
            }}>
              快速链接
            </div>
            <div style={{ display: 'flex', gap: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quickLinksLeft.map((item) => (
                  <a
                    key={item.name}
                    onClick={() => handleLinkClick(item.path)}
                    style={linkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quickLinksRight.map((item) => (
                  <a
                    key={item.name}
                    onClick={() => handleLinkClick(item.path)}
                    style={linkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：关注我们（三个二维码） */}
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 10,
            }}>
              关注我们
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {qrcodeItems.map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <img
                    src="/images/qrcode.png"
                    alt={item.alt}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 8,
                      objectFit: 'contain',
                      background: '#fff',
                      padding: 4,
                    }}
                  />
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <Divider style={{ borderColor: 'rgba(255,255,255,0.25)', margin: '20px 0 12px' }} />
        <div style={{
          textAlign: 'center',
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
        }}>
          Copyright © 2026 宜昌产业人才地图 All Rights Reserved | 鄂ICP备XXXXXXXX号-1
        </div>
      </div>
    </footer>
  );
};

export default Footer;
