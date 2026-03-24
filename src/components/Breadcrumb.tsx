/**
 * @input { Breadcrumb } from 'antd', { useLocation, Link } from 'react-router-dom'
 * @output { Breadcrumb } 面包屑导航组件，支持 extra 额外层级
 * @position 共享 UI 组件，由 MainLayout 渲染，基于 useLocation 自动生成路径层级
 * @doc-sync Update this header and folder INDEX.md when this file changes.
 */
import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';

// 路由与面包屑映射
const routeNameMap: Record<string, string> = {
  '/': '首页',
  '/industry': '产业',
  '/talent': '人才',
  '/tech': '技术',
  '/funding': '资金',
  '/policy': '政策',
  '/about': '关于我们',
  '/screen': '大屏模式',
};

interface BreadcrumbProps {
  extra?: { key: string; name: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ extra }) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  // 首页不显示面包屑
  if (location.pathname === '/' || location.pathname === '/screen') {
    return null;
  }

  const breadcrumbItems = [
    {
      key: 'home',
      title: (
        <Link to="/">
          <HomeOutlined /> 首页
        </Link>
      ),
    },
  ];

  // 构建路径
  let currentPath = '';
  pathSnippets.forEach((snippet, index) => {
    currentPath += `/${snippet}`;
    const name = routeNameMap[currentPath];

    if (name) {
      breadcrumbItems.push({
        key: currentPath,
        title: index === pathSnippets.length - 1 && !extra ? (
          <span>{name}</span>
        ) : (
          <Link to={currentPath}>{name}</Link>
        ),
      });
    }
  });

  // 添加额外的层级（如产业链→环节→企业）
  if (extra) {
    extra.forEach((item, index) => {
      breadcrumbItems.push({
        key: item.key,
        title: index === extra.length - 1 ? (
          <span>{item.name}</span>
        ) : (
          <a onClick={() => {}}>{item.name}</a>
        ),
      });
    });
  }

  return (
    <div style={{
      padding: '12px 24px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <AntBreadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default Breadcrumb;
