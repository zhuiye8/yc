# 宜昌产业人才地图 — 实施进度跟踪

## 当前进度：步骤 1-19 全部已完成 ✅

---

## 历史步骤（1-16）：前端 Demo 开发阶段 — 全部完成

步骤 1-16 为前端 Demo 开发阶段，包含大屏页面开发（步骤 1-10）、首页与图表视觉升级（步骤 11）、创新资源板块（步骤 12-13）、关于我们页面（步骤 14-16）。所有步骤均已完成并通过验证。详细记录已归档，此处不再重复。

---

## 步骤 17：接口数据需求文档编制 ✅

### 概述

前端 Demo 设计已通过甲方验收，进入真实数据对接阶段。系统梳理了前端所有展示数据，编制了完整的接口数据需求文档，供甲方后端团队提供接口。

### 产出文件

- **`接口数据需求文档.md`**（项目根目录，约 1800 行）

### 文档内容

| 章节 | 内容 |
|------|------|
| 1. 总体说明 | 需要甲方提供的 7 项内容、前端技术栈信息、数据量级估算 |
| 2. 各模块接口数据需求 | **63 个接口点**，每个含请求参数和返回字段 JSON 示例 |
| 3. VPN 联调方案 | Vite 代理配置、环境变量切换、渐进式 Mock→真实切换 |
| 4. 接口调用示例 | Axios 封装、拦截器、各模块调用代码 |
| 5. 其他确认事项 | 认证鉴权、数据脱敏、地图 GeoJSON、实时性、文件下载、性能、数据字典、错误码 |
| 附录 | 63 个接口清单汇总表（编号/名称/方法/路径/模块） |

### 接口清单（按模块）

| 模块 | 接口数 | 关键接口 |
|------|--------|---------|
| 首页 | 3 | 总览统计、筛选选项、全局搜索 |
| 产业 | 17 | 图谱、总览、企业列表/详情、创新资源(6个子接口)、预警系数 |
| 人才 | 11 | 关系图谱、列表/详情、宜昌籍、供需缺口、省份分布(柱状图+地图) |
| 创新 | 6 | 趋势、热点、缺口、专利列表、核心主体 |
| 资金 | 4 | 融资工具、投资机构、基金统计、对接清单 |
| 政策 | 4 | 列表、详情、到期预警、订阅配置 |
| 大屏 | 8 | KPI(含强弱缺链)、环形图、柱状图、趋势、地图(省份+城市涟漪)、滚动数据 |
| 清单/报告/预警 | 10 | 四类清单 CRUD、报告列表/预览/生成、预警列表/规则/已读 |

### 文档验证（二轮审核）

对照前端代码逐页逐字段交叉比对后发现并修复：

**修复的遗漏（6 处）：**
1. 产业页创新资源 Tab 下 4 个额外图表（接口 14-B/C/D/E）
2. 产业页图谱侧栏"预警系数"和"本地化率"（接口 14-F）
3. 大屏地图 effectScatter 涟漪城市数据（接口 44-B，需经纬度三元组）
4. 大屏产业链强/弱/缺链统计（补入接口 40 KPI）
5. 企业详情抽屉子数据（接口 8-B，动态监测+科技创新）
6. 人才页柱状图与地图是两套省份数据（拆分接口 22 为 22-A/22-B）

**修复的字段错误（3 处）：**
1. `cooperationCount` → `cooperation`（与实际代码一致）
2. 人才图谱 nodes 删除 `category` 字段（前端 BFS 动态计算）
3. 产业总览 `talentType` 删除 `color` 字段（颜色由前端分配）

---

## 步骤 18：甲方大屏界面替换集成 ✅

### 概述

甲方提供了独立的大屏 Dashboard 项目（`dashboard/` 目录），需替换我方 Demo 中的大屏页面（原 `Screen.tsx`），同时保持其他页面不变。

### 甲方 Dashboard 项目信息

| 项 | 值 |
|----|-----|
| 技术栈 | React 19 + Vite 7 + JavaScript (JSX) + MUI 6.5 + styled-components + SCSS |
| 图表库 | ECharts 6 + echarts-for-react |
| 页面 | 首页（Index）、产业（Industry）、人才（Talent）、创新/资金/政策（Stub） |
| 布局 | 三栏 Grid（1.2fr / 2fr / 1.2fr），全屏暗色主题 |
| 地图 | 支持全国/宜昌聚焦双模式切换，GeoJSON 本地加载 |
| 数据 | 全部硬编码在组件内部，无 API 调用 |

### 集成方案

**核心思路**：将甲方 Dashboard 源码复制到 `src/dashboard/`，作为主项目的子模块，通过 React Router 嵌套路由挂载到 `/screen/*`。

### 改动清单

| 文件/操作 | 改动 |
|-----------|------|
| `npm install` | 新增 6 个依赖：`@emotion/react`、`@emotion/styled`、`@mui/material@6.5.0`、`styled-components`、`sass`、`echarts-china-cities-js` |
| `src/dashboard/` | 新建目录，从 `dashboard/src/` 复制 components、pages、assets、App.scss |
| `tsconfig.app.json` | 添加 `allowJs: true`（允许 JSX 文件与 TSX 共存） |
| `src/App.tsx` | `screen` 路由改为 `screen/*`（支持子路由） |
| `src/layouts/MainLayout.tsx` | `=== '/screen'` 改为 `.startsWith('/screen')`（匹配所有大屏子路径） |
| `src/pages/Screen.tsx` | **完全替换**为新版：渲染甲方 Dashboard 的 3 个页面，外层包 `.dashboard-root` |
| `src/dashboard/App.scss` | 所有样式嵌套在 `.dashboard-root {}` 内，防止泄漏到主站 |
| `src/dashboard/pages/Index/index.jsx` | Tab 导航路径 `/industry` → `/screen/industry` |
| `src/dashboard/pages/industry/industry.jsx` | Tab 路径加 `/screen/` 前缀，"返回首页"→ `/screen` |
| `src/dashboard/pages/talent/talent.jsx` | 同上 |

### 导航逻辑

| 操作 | 跳转目标 |
|------|---------|
| 主站点击"大屏模式"按钮 | → `/screen`（甲方大屏首页） |
| 大屏首页点击"返回" | → `/`（回到主站首页） |
| 大屏首页点击"产业布局" | → `/screen/industry` |
| 大屏首页点击"人才总览" | → `/screen/talent` |
| 大屏产业/人才页点击"返回首页" | → `/screen`（回到大屏首页） |
| 大屏产业/人才页 Tab 切换 | → `/screen/industry` 或 `/screen/talent` |

### 样式隔离方案

- 甲方 `App.scss` 原有 `body { overflow: hidden }` 和 `.container { width: 100vw }` 等全局样式会污染主站
- 解决方案：将整个 SCSS 文件嵌套在 `.dashboard-root { ... }` 选择器内
- `Screen.tsx` 中用 `<div className="dashboard-root">` 包裹 Dashboard 内容
- 甲方的 `industry.scss`、`talent.scss`、`map.scss` 不需要修改（它们的选择器在 `.dashboard-root` 上下文中自然匹配）

### 构建验证

- TypeScript 编译（`tsc -b`）：✅ 无报错
- Vite 开发服务器启动：✅ 正常
- 生产构建（`npm run build`）：✅ 成功（有 chunk 过大警告，可后续优化）

---

## 步骤 19：产业图谱三树聚焦交互模式 ✅

### 概述

产业图谱 Tab 原为 3 棵树共享一个 `ReactECharts` 实例，节点数量大时全展开叠加重叠不可读，且 `roam: true` 对整个画布生效无法单独缩放某一棵树。拆为 3 个独立 `ReactECharts` 实例，实现聚焦交互。

### 修改文件

仅修改 `src/pages/Industry.tsx`

### 改动清单

| 改动 | 说明 |
|------|------|
| 新增 `StreamKey` 类型 | `'upstream' \| 'midstream' \| 'downstream'`，模块级声明 |
| 修改 `toEChartsTree()` | 新增 `maxDepth` 和 `depth` 参数；截断时显示 `⊕` 标记（rich text），省略 children |
| 新增 3 个状态/Ref | `focusedTree: StreamKey \| null`、`popoverStream: StreamKey \| null`、`treeRefs: Record<StreamKey, ReactECharts \| null>` |
| Cascader 切换重置 | `onCascaderChange` 中添加 `setFocusedTree(null)` |
| 删除 `getTreeOption()` | 单个 3-series 图表函数 |
| 新增 `getSingleTreeOption(streamKey)` | 每棵树独立 option，聚焦树 `roam: true` + 全量展开，非聚焦树 `roam: false` + 2 级截断 |
| 删除 `handleTreeClick` | 单一点击处理 |
| 新增 `handleTreeNodeClick(streamKey)` | 柯里化函数；点击非聚焦树切换聚焦（不弹窗），点击聚焦树或叶节点显示弹窗 |
| JSX 布局替换 | 单个 `<ReactECharts>` → 3 个独立实例的 flex 容器，带箭头分隔符 `›` |
| 宽度动画 | 无聚焦各 33.33%；有聚焦时聚焦树 66%、其余各 15%，`transition: flex-basis 0.4s` |
| 列标题 + 收起按钮 | 每棵树上方显示列标题（上游/中游/下游），聚焦树标题旁显示「收起」按钮 |
| `key` 策略 | `${selectedChainKey}-${sk}-${focusedTree === sk}`，切换产业链全部重建，聚焦切换仅受影响树重建 |
| resize useEffect | 聚焦切换 450ms 后调用所有树实例的 `resize()`，适应容器宽度变化 |
| 弹窗移至树容器内 | 每棵树容器内条件渲染弹窗（`popoverStream === sk`），弹窗样式不变 |

### 交互流程

1. **初始**：3 棵树等宽排列，各显示 2 级（根 + 直接子节点），有子节点的二级节点显示 ⊕ 标记
2. **点击某棵树节点**：该树展开全部层级占据 66% 宽度，支持滚轮缩放/拖拽；另两棵树压缩到 15%
3. **点击另一棵树**：前一棵收回 2 级，新树展开
4. **点击「收起」**：回到 3 树等宽 2 级状态
5. **切换 Cascader**：3 树重置，聚焦清除

### 构建验证

- `tsc -b --noEmit`：✅ 无报错
- `npm run build`：✅ 成功
- `eslint src/pages/Industry.tsx`：✅ 无报错

---

## 关键信息（全局，更新至步骤 19）

### 项目配置

- **开发端口**：5175（`npm run dev`）
- **路由结构**：
  - `/` → `Home.tsx`
  - `/industry` → `Industry.tsx`
  - `/talent` → `Talent.tsx`
  - `/tech` → `Tech.tsx`
  - `/funding` → `Funding.tsx`
  - `/policy` → `Policy.tsx`
  - `/about` → `About.tsx`
  - `/screen` → **甲方 Dashboard 首页**（新）
  - `/screen/industry` → **甲方 Dashboard 产业页**（新）
  - `/screen/talent` → **甲方 Dashboard 人才页**（新）
  - `/list` → `ListCenter.tsx`
  - `/reports` → `ReportCenter.tsx`
  - `/alerts` → `AlertCenter.tsx`
- **MainLayout 特殊处理**：
  - `pathname.startsWith('/screen')` 时跳过头部/页脚，直接渲染 `<Outlet />`（**已从 `===` 改为 `startsWith`**）
  - `pathname === '/about'` 时无背景图，纯白 `#ffffff` 背景
  - `pathname === '/'` 时使用 `banner-bg6.png` 背景
  - 其余页面使用 `banner-bg2.png` 背景

### 新增依赖（步骤 18）

| 依赖 | 版本 | 用途 |
|------|------|------|
| `@emotion/react` | ^11.14.0 | MUI 依赖 |
| `@emotion/styled` | ^11.14.1 | MUI 依赖 |
| `@mui/material` | **6.5.0**（固定版本） | 甲方 Dashboard UI 组件（Grid2 等） |
| `styled-components` | ^6.3.11 | 甲方 Dashboard 样式 |
| `sass` | ^1.97.3 | SCSS 编译 |
| `echarts-china-cities-js` | ^0.1.1 | 宜昌市地图数据 |

> **注意**：MUI 必须使用 6.5.0，不能升级到 7.x。甲方代码使用 `Grid2`（v6 API），v7 中已改名为 `Grid`，不兼容。

### 重要文件路径（更新）

| 文件 | 作用 |
|------|------|
| `src/pages/Screen.tsx` | **大屏入口**（新版：渲染甲方 Dashboard，含 `.dashboard-root` 包裹 + 嵌套路由） |
| `src/dashboard/` | **甲方 Dashboard 源码目录**（新增） |
| `src/dashboard/App.scss` | Dashboard 全局样式（嵌套在 `.dashboard-root` 内） |
| `src/dashboard/components/map.jsx` | Dashboard 中国地图组件（全国/宜昌双模式） |
| `src/dashboard/components/header.jsx` | Dashboard 头部（实时时钟） |
| `src/dashboard/components/bottom.jsx` | Dashboard 底部返回按钮 |
| `src/dashboard/pages/Index/index.jsx` | Dashboard 首页 |
| `src/dashboard/pages/industry/industry.jsx` | Dashboard 产业页 |
| `src/dashboard/pages/talent/talent.jsx` | Dashboard 人才页 |
| `src/dashboard/assets/` | Dashboard 静态资源（china.json、yichang.json、imgs/） |
| `接口数据需求文档.md` | 接口数据需求（63 个接口，供甲方后端参考） |
| `src/pages/Home.tsx` | 首页（Hero 左对齐 + 五大模块卡片） |
| `src/pages/Industry.tsx` | 产业页（最复杂，3 棵独立树聚焦交互 + 3D 图表 + 创新资源弧形布局） |
| `src/pages/Talent.tsx` | 人才页（科技风力导向图谱 + BFS + 3D 柱状图） |
| `src/layouts/MainLayout.tsx` | 主布局（头部导航 + 大屏入口 + 背景图条件判断） |
| `src/mock/data.ts` | 唯一 Mock 数据源（1191 行） |
| `CLAUDE.md` | 项目完整技术文档 |
| `PLAN.md` | 实施进度跟踪文档（本文件） |

### TypeScript 配置变更

- `tsconfig.app.json` 新增 `"allowJs": true`，允许 `src/dashboard/` 下的 `.jsx` 文件与主项目 `.tsx` 文件共存
- `noUnusedLocals`/`noUnusedParameters` 仅对 `.ts`/`.tsx` 文件生效，不会检查 `.jsx` 文件

---

## 遗留问题和后续工作

### 待办

1. **接口对接**：等待甲方根据需求文档提供 API 地址和文档后，逐模块替换 Mock 数据为真实接口调用
2. **VPN 联调**：等待甲方提供 VPN 接入凭证后，配置 Vite 代理（`vite.config.ts` 中 `server.proxy`）
3. **甲方大屏剩余页面**：创新资源、资金概览、政策全景三个 Tab 当前为 Stub（空页面），等甲方后续补充

### 已知问题

1. **生产构建 chunk 过大**：单个 JS bundle 较大（含 ECharts + MUI + Ant Design），可通过 `manualChunks` 拆分优化
2. **甲方 Dashboard 数据硬编码**：所有图表数据内联在组件中，接口对接时需逐个替换
3. **MUI 版本锁定**：`@mui/material` 必须为 6.5.0，不可升级到 7.x（`Grid2` API 不兼容）
4. **原 Screen.tsx 已完全替换**：之前开发的大屏页面（MechBorderBox 风格）代码已被覆盖。如需恢复可通过 Git 历史找回
5. **SCSS 编译器新增**：`sass` 是新增的 devDependency，团队成员需要 `npm install` 更新依赖
