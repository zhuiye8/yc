<!-- FORMAT-DOC: Update when project structure or architecture changes -->

# Architecture

宜昌产业人才地图 — React 19 + TypeScript + Vite 单页应用。
采用 Ant Design 组件库 + ECharts 数据可视化，全量 Mock 数据驱动（无后端 API）。
路由由 react-router-dom 管理，MainLayout 包裹所有子页面（大屏页例外）。
大屏模块 (dashboard) 使用 MUI + 原生 ECharts（JSX），通过 Screen.tsx 嵌套路由接入主应用。

## Modules

- [components](components/INDEX.md) - 全局共享 UI 组件（AI 助手、面包屑、页脚、大屏边框）
- [layouts](layouts/INDEX.md) - 主布局容器（Header + Breadcrumb + Outlet + Footer）
- [pages](pages/INDEX.md) - 业务页面（首页、产业、人才、创新、资金、政策、大屏等 11 个路由页面）
- [mock](mock/INDEX.md) - Mock 数据层与 TypeScript 接口定义
- [dashboard](dashboard/INDEX.md) - 大屏可视化子应用（MUI + 原生 ECharts，JSX）
