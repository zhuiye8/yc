# CLAUDE.md

本文档为宜昌产业人才地图项目的全面技术分析文档，为 Claude Code 提供项目上下文。

---

## 1. 项目整体概述

### 项目名称与定位

**宜昌产业人才地图**（industrial-platform）—— 一个面向政府部门和产业机构的产业人才数智化服务平台。在宜昌市委组织部指导下，由湖北三峡人才集团牵头建设。

### 业务背景

平台聚焦宜昌市六大主导产业（绿色化工、新能源新材料、生命健康、汽车及装备制造、算力及大数据、文化旅游），提供"产业-人才-创新-资金-政策"五链融合的数据可视化与业务闭环服务。核心场景包括：产业链诊断、精准招商、人才引育、技术洞察、融资对接、政策申报。

### 技术栈完整列表

| 分类 | 技术/库 | 版本 |
|------|--------|------|
| 框架 | React | 19.2 |
| 语言 | TypeScript | ~5.9.3 |
| 构建工具 | Vite | 7.2 |
| UI 组件库 | Ant Design | 5.29 |
| Pro 组件 | @ant-design/pro-components | 2.8 |
| 图标 | @ant-design/icons | 6.1 |
| 图表 | ECharts | 6.0 |
| 图表封装 | echarts-for-react | 3.0.5 |
| 路由 | react-router-dom | 7.12 |
| 日期处理 | dayjs | 1.11 |
| 代码检查 | ESLint | 9.39 |
| React 插件 | @vitejs/plugin-react | 5.1 |

### 项目运行方式

```bash
npm run dev        # 启动开发服务器（端口 5175）
npm run build      # TypeScript 编译 (tsc -b) + Vite 打包
npm run lint       # ESLint 代码检查
npm run preview    # 预览生产构建
```

当前无测试框架配置，无单元测试命令。

---

## 2. 完整文件结构

```
src/
├── App.tsx                    # 根组件：ConfigProvider 主题 + BrowserRouter + 嵌套路由表
├── main.tsx                   # 应用入口：StrictMode + createRoot 挂载
├── index.css                  # 基础全局样式：reset + body 字体/背景
├── styles/
│   └── global.css             # 设计系统：CSS 变量、Ant Design 组件覆盖、响应式断点（~1200行）
├── layouts/
│   └── MainLayout.tsx         # 主布局：固定头部导航 + 面包屑 + Outlet + 页脚 + AI 浮窗
├── components/
│   ├── AIFloatButton.tsx      # AI 智能助手浮窗组件（关键词匹配问答，非 LLM）
│   ├── Breadcrumb.tsx         # 面包屑导航组件（基于 useLocation 自动生成）
│   ├── Footer.tsx             # 页脚组件（品牌信息 + 快速链接 + 二维码）
│   └── MechBorderBox.tsx      # 大屏专用机械感蓝色边框容器（四角 L 形装饰 + 扫描线动画）
├── pages/
│   ├── Home.tsx               # 首页：Hero 左对齐布局 + 全局筛选条 + 五大模块卡片总览
│   ├── Industry.tsx           # 产业页：产业链图谱 + 3D 金字塔/柱状图/环形图 + 企业列表 + 中国地图 + 创新资源（最复杂）
│   ├── Talent.tsx             # 人才页：科技风力导向图谱（BFS 动态层级）+ 3D 柱状图 + 列表 + 地图 + 合作机构
│   ├── Tech.tsx               # 创新页：趋势洞察 + 热点主题 + 缺口对标 + 专利列表（511行）
│   ├── Funding.tsx            # 资金页：融资工具库 + 投资机构库 + 对接清单（531行）
│   ├── Policy.tsx             # 政策页：政策搜索 + 列表 + 预警订阅 + 到期提醒（482行）
│   ├── Screen.tsx             # 大屏页：全屏暗色模式 + KPI + 图表 + 脱敏设置（435行）
│   ├── ListCenter.tsx         # 清单中心：招商/引才/融资/申报四类清单管理（~310行）
│   ├── ReportCenter.tsx       # 报告中心：六类报告管理 + 预览/下载/删除（279行）
│   ├── AlertCenter.tsx        # 预警中心：多维预警 + 规则管理 + 已读/未读（~320行）
│   └── About.tsx              # 关于页：平台介绍 + 核心能力 + 数据维度 + 未来目标（359行）
├── mock/
│   └── data.ts                # 唯一数据源（1187行）：所有业务数据 + TypeScript 接口定义
└── utils/
    └── chartColors.ts         # ECharts 统一调色板（项目中未实际引用，但保留）
```

### 静态资源结构

```
public/
├── china-map.json             # 中国地图 GeoJSON（echarts.registerMap 用）
├── images/
│   ├── ai-robot.png           # AI 助手头像
│   ├── qrcode.png             # 二维码图片
│   ├── banner-bg1~8.png       # 各页面背景/装饰图（8张）
│   └── icons/
│       ├── icon-industry.png  # 产业模块图标
│       ├── icon-talent.png    # 人才模块图标
│       ├── icon-innovation.png # 创新模块图标
│       ├── icon-funding.png   # 资金模块图标
│       └── icon-policy.png    # 政策模块图标
```

---

## 3. 核心模块详解

### 3.1 layouts/ — 布局模块

**MainLayout.tsx** 是所有页面的外壳容器：
- **固定头部**：Logo + 一级水平导航（7 项）+ 快捷菜单下拉 + 通知面板 + 用户菜单
- **面包屑**：通过 `<Breadcrumb />` 组件渲染，首页和大屏不显示
- **内容区**：`<Outlet />` 渲染子路由页面
- **页脚**：`<Footer />` 组件
- **AI 浮窗**：`<AIFloatButton />` 固定在右下角
- **大屏特殊处理**：当 `location.pathname === '/screen'` 时，跳过标准布局，直接渲染 `<Outlet />`
- **背景图差异**：首页用 `banner-bg6.png`，其他页面用 `banner-bg2.png`

### 3.2 components/ — 共享组件

| 组件 | 行数 | 职责 |
|------|------|------|
| `AIFloatButton.tsx` | 742 | AI 智能助手。内置关键词匹配知识库（6 大主题：企业/人才/政策/融资/技术/报告），每个主题含多个子分类回答。非 LLM 调用，纯前端模拟延迟 800~1500ms 后返回预设回复。支持快捷操作标签、推荐问题、消息列表 |
| `Breadcrumb.tsx` | 86 | 面包屑导航。维护 `routeNameMap` 映射表，支持 `extra` prop 传入额外层级（如产业链→环节→企业）。首页和大屏页不渲染 |
| `Footer.tsx` | 185 | 页脚。三栏布局：品牌信息（地址/电话/邮箱）+ 快速链接（两列 7 项）+ 关注我们（3 个二维码）+ 版权信息 |
| `MechBorderBox.tsx` | ~45 | 大屏专用机械感边框容器。Props: `title?`, `children`, `style?`, `headerVariant?`, `className?`。四角 L 形装饰 + cornerGlow 呼吸动画 + 可选扫描线 |

### 3.3 pages/ — 页面组件

**Home（首页）**：Hero 区域左对齐布局（标题 56px + 灰色副标题 18px + 搜索框，`padding-left: 180px`）+ 全局筛选（区域三级联动 + 时间窗 + 产业链二级联动）+ 五大模块总览卡片（产业/人才/创新/资金/政策），上 2 下 3 网格布局。无 ECharts 图表。

**Industry（产业）**：项目最复杂页面，包含：
- 产业链 ECharts Tree 图谱（上中下游三棵树）
- 产业总览统计：3D 立体金字塔图（graphic API 三面绘制）、3D 立体柱状图（custom series 三面绘制）、3D 双层环形图（双 pie 模拟厚度）、中国地图、趋势折线图、企业合作关系图
- 企业列表与详情抽屉
- 创新资源中心：弧形 Flex 三列布局（左 5 指标卡 + 中央地图 + 右 5 指标卡），弧形偏移 `[24,8,0,8,24]`，极简半透明卡片（无图标背景，固定宽度 270px），`useInnovationCountUp` 数字动画，省份点击切换数据 + 脉冲动画，`InnovationCard` 内联子组件，默认选中湖北省。省份高亮通过 `geo.regions` 实现（不依赖 ECharts select 状态）
- 产业报告生成入口

**Talent（人才）**：
- **人才关系力导向图（Graph）**：深色科技风画布（`#050e1f` 渐变背景），四级节点分层（搜索人才/紧密合作/间接合作/领域相关），BFS 动态计算层级，搜索人才自动居中（`fixed: true`），`focus: 'adjacency'` 聚焦高亮，暗色毛玻璃弹出卡片，搜索框置于图谱内部左上角
- 人才列表（含详情弹窗/抽屉、筛选）
- 研究方向分布普通横向柱状图 + 趋势折线图
- 人才层级 3D 立体金字塔（graphic API 三面绘制）+ 3D 立体柱状图（custom series）+ 中国地图
- 合作机构/人才列表

**Tech（创新）**：
- 年度趋势折线图（专利/标准/项目）
- 热点主题矩形树图
- 技术缺口对标表格 + 攻关建议弹窗
- 专利证据列表 + 核心主体列表

**Funding（资金）**：融资工具库/投资机构库表格 + 基金类型统计卡片 + 对接清单 + 跟进记录 + 详情抽屉

**Policy（政策）**：政策列表（可展开摘要）+ 到期预警 + 预警订阅开关 + 闭环输出入口

**Screen（大屏）**：
- 1920×1080 固定布局，`transform: scale()` 等比缩放适配，全屏暗色主题，独立于 MainLayout
- MechBorderBox 机械感边框容器（四角 L 形装饰 + 呼吸动画）
- KPI 大数字区（6 项，useCountUp 数字跳动 + 60s 周期刷新 ±1.5%）
- 产业链 3D 双层环形图 + 中国人才热力地图（effectScatter 涟漪）+ 区域企业分布柱状图 + 发展趋势折线图
- 企业动态/政策预警纵向滚动 + 底部新闻横向滚动（CSS marqueeScroll）

**ListCenter（清单中心）**：四类 Tab（招商/引才/融资/申报），每类独立表格 + 详情抽屉 + 跟进记录

**ReportCenter（报告中心）**：六类报告（产业/企业/人才/技术/融资/政策），统一表格 + 预览抽屉

**AlertCenter（预警中心）**：多维预警（政策/企业/产业/人才/技术），预警规则管理（启用/禁用），已读/未读筛选

**About（关于我们）**：平台介绍、核心能力、已上线功能、数据维度（5 维 + 可追溯）、典型应用场景、未来目标

### 3.4 mock/ — 数据层

`data.ts` 是唯一数据源文件（1187 行），包含所有业务数据和 TypeScript 接口定义，详见第 4 节。

---

## 4. 数据流与数据结构

### 4.1 数据源位置

所有数据来自 `src/mock/data.ts`，通过 `import` 直接引用，无异步请求（地图 GeoJSON 除外，通过 `fetch('/china-map.json')` 加载）。

### 4.2 导出的数据集

| 导出名 | 类型 | 用途 | 使用页面 |
|--------|------|------|----------|
| `industryChains` | 数组 | 五大产业链基础数据（企业数、强弱缺链） | Screen |
| `industryChainColorConfig` | 对象 | 产业链统一配色（蓝色系 + 断链灰） | Industry |
| `enterprises` | 数组 | 8 家重点企业数据 | Industry |
| `talents` | 数组 | 6 位核心人才数据 | Talent |
| `blueCollarTalents` | 数组 | 12 位蓝领人才数据 | Talent |
| `yichangTalents` | 数组 | 宜昌籍人才数据 | Talent |
| `yichangTalentStats` | 对象 | 宜昌籍人才统计 | Talent |
| `technologies` | 数组 | 技术数据 | Tech |
| `fundingProducts` | 数组 | 融资工具产品列表 | Funding |
| `investmentInstitutions` | 数组 | 投资机构列表 | Funding |
| `fundTypeStats` | 数组 | 基金类型统计 | Funding |
| `policies` | 数组 | 政策列表（含标题/部门/日期/类型/标签/摘要） | Policy |
| `industryGraphDataMap` | Record | 各产业链的上中下游树形图谱数据 | Industry |
| `industryOverviewDataMap` | Record | 各产业链总览数据（金字塔/省份/人才/趋势） | Industry |
| `enterpriseList` | 数组 | 企业列表扩展数据 | Industry |
| `enterpriseNews` | 数组 | 企业动态新闻 | Industry |
| `keyTechnologies` | 数组 | 关键技术列表 | Industry |
| `coreTalents` | 数组 | 核心人才列表 | Industry |
| `patentLayout` | 数组 | 专利布局数据 | Industry |
| `cooperativeOrgs` | 数组 | 合作机构列表 | Industry |
| `dashboardStats` | 对象 | 仪表盘统计数据 | — |
| `announcements` | 数组 | 公告数据 | — |
| `workbench` | 对象 | 工作台数据 | — |

### 4.3 TypeScript 接口定义

```typescript
// src/mock/data.ts 中定义的接口

export interface IndustryGraphNode {
  name: string;
  status: 'strong' | 'weak' | 'missing';
  children?: IndustryGraphNode[];
}

export interface IndustryGraphColumn {
  root: IndustryGraphNode;
}

export interface IndustryGraphSet {
  upstream: IndustryGraphColumn;
  midstream: IndustryGraphColumn;
  downstream: IndustryGraphColumn;
}
```

### 4.4 数据流向

```
src/mock/data.ts
    ├── import ──→ Industry.tsx （enterprises, industryGraphDataMap, industryOverviewDataMap, enterpriseList, ...）
    ├── import ──→ Talent.tsx   （talents）
    ├── import ──→ Tech.tsx     （technologies）
    ├── import ──→ Funding.tsx  （fundingProducts, investmentInstitutions, fundTypeStats）
    ├── import ──→ Policy.tsx   （policies）
    └── import ──→ Screen.tsx   （industryChains）
```

注意：Home.tsx、ListCenter.tsx、ReportCenter.tsx、AlertCenter.tsx、About.tsx 的数据全部内联在组件内部，不从 data.ts 导入。

---

## 5. 页面与路由结构

### 5.1 路由配置

路由在 `src/App.tsx` 中配置，使用 `BrowserRouter` + 嵌套 `Routes`：

```tsx
<Route path="/" element={<MainLayout />}>
  <Route index element={<Home />} />
  <Route path="industry" element={<Industry />} />
  <Route path="talent" element={<Talent />} />
  <Route path="tech" element={<Tech />} />
  <Route path="funding" element={<Funding />} />
  <Route path="policy" element={<Policy />} />
  <Route path="about" element={<About />} />
  <Route path="screen" element={<Screen />} />
  <Route path="list" element={<ListCenter />} />
  <Route path="reports" element={<ReportCenter />} />
  <Route path="alerts" element={<AlertCenter />} />
</Route>
```

### 5.2 页面路由表

| 路由 | 组件 | 导航入口 | 说明 |
|------|------|----------|------|
| `/` | Home | 顶部导航「首页」 | 首页搜索与五大模块总览 |
| `/industry` | Industry | 顶部导航「产业」 | 产业链图谱与分析（最复杂页面） |
| `/talent` | Talent | 顶部导航「人才」 | 人才图谱与资源管理 |
| `/tech` | Tech | 顶部导航「创新」 | 技术创新趋势与缺口分析 |
| `/funding` | Funding | 顶部导航「资金」 | 融资工具库与投资机构对接 |
| `/policy` | Policy | 顶部导航「政策」 | 政策搜索与申报管理 |
| `/about` | About | 顶部导航「关于我们」 | 平台介绍与能力展示 |
| `/screen` | Screen | 用户菜单「进入大屏模式」 | 全屏暗色大屏展示（无头部/页脚） |
| `/list` | ListCenter | 快捷菜单「我的清单」 | 招商/引才/融资/申报四类清单 |
| `/reports` | ReportCenter | 快捷菜单「报告中心」 | 各类分析报告管理 |
| `/alerts` | AlertCenter | 快捷菜单「预警中心」 | 多维预警与规则管理 |

### 5.3 导航结构

- **一级导航**（Header 水平菜单，7 项）：首页、产业、人才、创新、资金、政策、关于我们
- **快捷菜单**（右上角 Dropdown，5 项）：我的清单、报告中心、预警中心、收藏、最近访问
- **用户菜单**（右上角头像 Dropdown）：个人中心、系统设置、进入大屏模式、退出登录

---

## 6. 图表使用情况（重点）

项目使用 `echarts-for-react` 的 `<ReactECharts>` 组件渲染 ECharts 图表。以下是所有图表的完整清单：

### 6.1 Industry.tsx（产业页，图表最密集）

| 图表类型 | 函数名 | 说明 | 行号范围 |
|---------|--------|------|----------|
| **tree**（树图 ×3） | `getTreeOption()` | 产业链上中下游三棵树形图谱，强/弱/缺链节点着色 | 184-249 |
| **graphic**（3D 金字塔） | `getPyramidOption()` | 企业层级金字塔（上市/专精特新/科技型中小/全量），三面立体绘制（正面+左侧高光+底面阴影） | 266-318 |
| **custom**（3D 柱状图） | `getProvinceBarOption()` | 省份企业数量 3D 立体柱状图（正面+顶面高光+右侧阴影） | 321-355 |
| **pie ×2**（3D 环形图） | `getTalentPieOption()` | 人才层级分布 3D 双层环形图（底层暗色阴影环+上层主环） | 356-390 |
| **map**（中国地图） | `getChinaMapOption()` | 全国人才分布热力地图 | 351-381 |
| **line**（折线图） | `getTrendOption()` | 专利/标准/项目/成果年度趋势 | 383-394 |
| **graph**（关系图） | `getNetworkOption()` | 企业-高校合作关系力导向图 | 396-421 |
| **map**（中国地图） | `getInnovationMapOption()` | 创新资源中心地图（阴影增强 + 省份点击切换数据），弧形布局中央位置 | 605-637 |

### 6.2 Talent.tsx（人才页）

| 图表类型 | 函数名 | 说明 | 行号范围 |
|---------|--------|------|----------|
| **graph**（科技风力导向图） | `getTalentGraphOption()` | 深色背景人才关系图谱，BFS 动态四级分层，径向渐变节点，搜索节点居中（fixed），聚焦高亮交互 | 178-320 |
| **bar**（横向柱状图） | `getFieldDistributionOption()` | 研究方向分布（普通柱状图） | 358-383 |
| **line**（折线图） | `getFieldTrendOption()` | 论文/专利/项目合作年度趋势 | 385-400 |
| **graphic**（3D 金字塔） | `getPyramidOption()` | 人才层级金字塔，三面立体绘制（正面+左侧高光+底面阴影） | 414-466 |
| **custom**（3D 柱状图） | `getProvinceBarOption()` | 省份人才分布 3D 立体柱状图（正面+顶面高光+右侧阴影） | 468-506 |
| **map**（中国地图） | `getChinaMapOption()` | 全国人才分布热力地图 | ~974 |

### 6.3 Tech.tsx（创新页）

| 图表类型 | 函数名 | 说明 | 行号范围 |
|---------|--------|------|----------|
| **line**（折线图） | `getTrendOption()` | 专利申请/授权、标准发布、科研项目年度趋势 | 30-42 |
| **treemap**（矩形树图） | `getHotTopicOption()` | 技术热点主题分布 | 45-66 |

### 6.4 Screen.tsx（大屏页）

| 图表类型 | 函数名 | 说明 | 行号范围 |
|---------|--------|------|----------|
| **pie**（环形图） | `getChainChartOption()` | 产业链结构分布 | 49-71 |
| **bar**（柱状图） | `getRegionChartOption()` | 区域企业分布 | 74-104 |
| **line**（折线图） | `getTrendChartOption()` | 企业/专利/人才数发展趋势 | 107-129 |

### 6.5 图表配置方式

- 所有图表的 option 均以 `getXxxOption()` 函数形式定义在组件内部
- 通过 `<ReactECharts option={getXxxOption()} style={{ height: xxx }} />` 渲染
- 中国地图通过 `fetch('/china-map.json')` 加载后用 `echarts.registerMap('chinaFiltered', json)` 注册，注册前会过滤南海诸岛和九段线/十段线 features
- 部分图表使用 `notMerge` prop 防止数据切换时合并旧数据
- 部分图表使用 `ref` 获取实例（如地图点击事件需要坐标转换）
- 人才图谱使用 `key={graphSearchedTalent || 'default'}` 搜索时强制重建图表
- 3D 立体柱状图使用 `custom` series + `renderItem`，数据必须为 `[categoryIndex, value]` 二维数组格式
- 3D 金字塔使用 `graphic` API 的 `group` + `polygon` 绘制三面，通过 `left: '38%'` 定位
- 3D 环形图使用双 `pie` series，底层偏移 + 暗色模拟厚度

### 6.6 ECharts 图表类型汇总

| 图表类型 | 使用次数 | 使用页面 |
|---------|---------|----------|
| line（折线图） | 4 | Industry, Talent, Tech, Screen |
| custom（3D 立体柱状图） | 2 | Industry, Talent |
| bar（普通柱状图） | 2 | Talent（研究方向）, Screen |
| map（中国地图） | 3 | Industry ×2（产业总览 + 创新资源弧形布局）, Talent |
| tree（树图） | 3 | Industry（上中下游） |
| graph（力导向关系图） | 2 | Industry, Talent（科技风深色主题） |
| pie（3D 双层环形图） | 2 | Industry（2 series）, Screen（2 series） |
| treemap（矩形树图） | 1 | Tech |
| graphic（3D 金字塔） | 2 | Industry, Talent（三面立体绘制） |

---

## 7. 组件依赖关系

### 7.1 组件树

```
App (ConfigProvider + BrowserRouter)
└── MainLayout
    ├── Header (Menu + Dropdown + Badge + Avatar)
    ├── Breadcrumb
    ├── Outlet → 各页面组件
    │   ├── Home
    │   ├── Industry (ReactECharts × 多个)
    │   ├── Talent (ReactECharts × 多个)
    │   ├── Tech (ReactECharts × 2)
    │   ├── Funding
    │   ├── Policy
    │   ├── Screen (ReactECharts × 3, 跳过 MainLayout 布局)
    │   ├── ListCenter
    │   ├── ReportCenter
    │   ├── AlertCenter
    │   └── About
    ├── Footer
    └── AIFloatButton
```

### 7.2 共享/复用组件

- **AIFloatButton**：所有页面共享（MainLayout 中渲染）
- **Breadcrumb**：所有页面共享（首页和大屏页自动隐藏）
- **Footer**：所有页面共享（大屏页不渲染）
- **MechBorderBox**：大屏页面专用的机械感蓝色边框容器组件
- 其余页面内的 UI 均为 Ant Design 组件 + 内联样式直接组合

### 7.3 Ant Design 组件使用情况

高频使用组件：

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| `Card` | 内容卡片容器 | 全部页面 |
| `Table` | 数据表格 | Industry, Talent, Tech, Funding, Policy, ListCenter, ReportCenter, AlertCenter |
| `Tabs / TabPane` | 选项卡切换 | Industry, Talent, Tech, Funding, ListCenter, ReportCenter, AlertCenter |
| `Drawer` | 侧边详情面板 | Industry, Talent, Funding, Policy, ListCenter, ReportCenter, AlertCenter |
| `Tag` | 标签（状态/分类） | 全部页面 |
| `Button` | 操作按钮 | 全部页面 |
| `Input.Search` | 搜索框 | Home, Industry, Talent, Tech, Funding, Policy |
| `Cascader` | 级联选择（区域/产业链） | Home, Industry, Talent, Tech, Funding, Policy |
| `Space` | 间距容器 | 全部页面 |
| `Row / Col` | 栅格布局 | 全部页面 |
| `Badge` | 徽标（数量/状态） | MainLayout, ListCenter, ReportCenter, AlertCenter |
| `Descriptions` | 描述列表 | Industry, Talent, Funding, ListCenter |
| `List` | 列表 | AIFloatButton, Footer, Funding, Policy, About, ListCenter |
| `Timeline` | 时间线 | Industry, Policy |
| `Statistic` | 统计数值 | Tech, ReportCenter, About |
| `Modal` | 对话框 | MainLayout, Tech, AlertCenter, Screen |
| `Alert` | 警告提示 | Policy |
| `Switch` | 开关 | Policy, AlertCenter |
| `Select` | 下拉选择 | Home, Screen, ListCenter, ReportCenter, AlertCenter |
| `Avatar` | 头像 | MainLayout, AIFloatButton, Talent, ListCenter, About |
| `Rate` | 评分 | Talent |
| `Progress` | 进度条 | Industry |
| `QRCode` | 二维码 | Screen |
| `Collapse` | 折叠面板 | Policy |
| `Dropdown` | 下拉菜单 | MainLayout, Screen |
| `Divider` | 分割线 | 多个页面 |
| `App.useApp()` | message/modal 获取 | 所有含操作反馈的页面 |
| `ConfigProvider` | 全局主题配置 | App.tsx |

---

## 8. 样式方案

### 8.1 样式文件组织

| 文件 | 行数 | 职责 |
|------|------|------|
| `src/index.css` | 17 | 全局 reset（margin/padding/box-sizing）+ body 字体和背景色 |
| `src/styles/global.css` | ~1420 | 设计系统核心：CSS 变量 + Ant Design 组件覆盖 + 自定义类名 + 响应式 + 大屏样式 + 动画（`fadeInScale`/`cornerGlow`/`scanLine`/`kpiPulse`/`marqueeScroll`/`innovationPulse`） |

### 8.2 设计系统（CSS 变量）

定义在 `src/styles/global.css` 的 `:root` 中：

```css
/* 主色 - 政务蓝阶梯 */
--primary-500: #2468F2;    /* 主蓝色 */
--primary-700: #1E4D8C;    /* 深蓝 */
--primary-100: #E8F1FF;    /* 浅蓝背景 */

/* 辅助色 */
--success: #2F8F6B;
--warning: #D89A2B;
--error: #C94A4A;

/* 中性色 */
--gray-900: #1D2129;       /* 主文字 */
--gray-700: #4E5969;       /* 次文字 */
--gray-500: #86909C;       /* 辅助文字 */

/* 间距系统 */
--space-xs: 4px 到 --space-4xl: 96px;

/* 阴影 */
--shadow-card: 0 4px 20px rgba(0,0,0,0.05);
--shadow-card-hover: 0 12px 40px rgba(0,0,0,0.1);
```

### 8.3 样式约定

- **主要方式**：内联样式 `style={{}}` 为主
- **全局覆盖**：`global.css` 中通过 `.ant-xxx` 类名覆盖 Ant Design 默认样式
- **不使用 CSS Modules**
- **不使用 CSS-in-JS 库**（无 styled-components / emotion）
- **毛玻璃效果**：多个页面定义 `glassCardStyle` 内联样式对象（`backdrop-filter: blur(12px)`）
- **ConfigProvider 全局设置**：`borderRadius: 16`、`colorPrimary: '#2468F2'`、中文 locale `zh_CN`
- **按钮统一胶囊化**：`.ant-btn { border-radius: 24px }`
- **卡片统一大圆角**：`.ant-card { border-radius: 16px }`
- **Tab 胶囊容器**：`.ant-tabs-nav-list` 使用灰色背景 + 圆角，隐藏下划线指示器

### 8.4 响应式断点

```css
@media (max-width: 1400px) { ... }  /* 大屏调整 */
@media (max-width: 1200px) { ... }  /* 中屏调整 */
@media (max-width: 768px)  { ... }  /* 移动端调整 */
```

### 8.5 字体

```css
font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB",
             "Noto Sans SC", Inter, "Helvetica Neue", Arial, sans-serif;
```

基础字号 `15px`，卡片标题 `17px`，统计数值 `28px`。

---

## 9. 配置文件说明

### 9.1 vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],       // 使用 @vitejs/plugin-react（基于 Babel 的 React 插件）
  server: {
    port: 5175,             // 开发服务器端口（非默认 5173）
  },
});
```

配置极简，无路径别名、无代理、无构建优化。

### 9.2 tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

使用 TypeScript 项目引用（Project References），将应用代码和 Node 端配置分离。

### 9.3 tsconfig.app.json（应用代码）

关键配置：
- `target: "ES2022"` — 编译目标
- `module: "ESNext"` — ESM 模块系统
- `moduleResolution: "bundler"` — Vite bundler 模式解析
- `jsx: "react-jsx"` — React 17+ JSX 转换
- `strict: true` — 严格模式
- `noUnusedLocals: true` — 禁止未使用的本地变量
- `noUnusedParameters: true` — 禁止未使用的参数
- `noEmit: true` — 不输出编译结果（由 Vite 处理）
- `verbatimModuleSyntax: true` — import type 必须显式标注
- `erasableSyntaxOnly: true` — 仅允许可擦除的 TS 语法
- `include: ["src"]` — 仅编译 src 目录

### 9.4 tsconfig.node.json（Node 端配置）

- `target: "ES2023"` — 更高的编译目标
- `types: ["node"]` — 包含 Node 类型
- `include: ["vite.config.ts"]` — 仅包含 Vite 配置文件

### 9.5 eslint.config.js

```javascript
export default defineConfig([
  globalIgnores(['dist']),           // 忽略 dist 目录
  {
    files: ['**/*.{ts,tsx}'],        // 仅检查 TS/TSX 文件
    extends: [
      js.configs.recommended,        // ESLint 推荐规则
      tseslint.configs.recommended,  // typescript-eslint 推荐规则
      reactHooks.configs.flat.recommended,  // React Hooks 规则
      reactRefresh.configs.vite,     // React Refresh（HMR）规则
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,      // 浏览器全局变量
    },
  },
]);
```

使用 ESLint v9 flat config 格式，无自定义规则覆盖。

---

## 10. 开发注意事项

### 10.1 代码规范和约定

- **TypeScript 严格模式**：`noUnusedLocals` + `noUnusedParameters` 开启，未使用的变量/参数会导致编译失败
- **`verbatimModuleSyntax`**：type-only import 必须使用 `import type { Xxx }` 语法
- **样式以内联为主**：新增样式优先使用 `style={{}}` 内联，除非需要全局覆盖或伪类/动画
- **数据全部 mock**：无真实 API 调用，所有数据在 `mock/data.ts` 中静态定义
- **Ant Design `App.useApp()`**：页面中使用 `message` / `modal` 时，需通过 `const { message, modal } = App.useApp()` 获取，而非直接 `import { message } from 'antd'`
- **ECharts option 函数命名**：统一使用 `getXxxOption()` 格式
- **中文注释**：项目注释和 UI 文案均使用中文

### 10.2 添加新页面的标准步骤

1. 在 `src/pages/` 下创建新页面组件 `XxxPage.tsx`
2. 在 `src/App.tsx` 的 `<Route>` 中添加路由：`<Route path="xxx" element={<XxxPage />} />`
3. 如需在顶部导航显示，在 `src/layouts/MainLayout.tsx` 的 `menuItems` 数组中添加
4. 如需面包屑显示，在 `src/components/Breadcrumb.tsx` 的 `routeNameMap` 中添加映射
5. 页面内使用 `App.useApp()` 获取 `message` / `modal`
6. 使用毛玻璃卡片样式：定义 `glassCardStyle` 对象并应用于 `<Card>` 的 `style` prop

### 10.3 添加新图表的标准步骤

1. 在页面组件中 `import ReactECharts from 'echarts-for-react'`
2. 如需中国地图，还需 `import * as echarts from 'echarts'` 并在 `useEffect` 中注册地图
3. 定义 `getXxxOption()` 函数返回 ECharts option 对象
4. 渲染：`<ReactECharts option={getXxxOption()} style={{ height: 320 }} />`
5. 如数据会动态切换，添加 `notMerge` prop 和 `key` prop 防止数据残留
6. 如需交互事件，使用 `ref` 获取实例并通过 `onEvents` prop 绑定

### 10.4 常见的坑和注意点

1. **地图加载**：中国地图 GeoJSON 通过 `fetch('/china-map.json')` 异步加载，需在 `useEffect` 中注册，且需过滤南海诸岛和九段线/十段线 features。注册后需设置 `chinaMapRegistered` 状态控制渲染时机
2. **大屏页面布局**：`/screen` 路由在 `MainLayout` 中通过 `if (isScreenMode) return <Outlet />` 提前返回，跳过头部/页脚/面包屑
3. **TabPane 已废弃**：部分页面（Tech, Funding）仍使用 `<TabPane>`（Ant Design 已标记废弃），新代码应使用 `items` prop
4. **TypeScript 类型断言**：Funding.tsx 中大量使用 `as typeof xxx[0]` 类型断言处理联合类型，较为冗长
5. **ListCenter/AlertCenter 中的 `any`**：这两个页面使用了 `any` 类型，如有修改建议改为具体类型
6. **毛玻璃效果兼容性**：`backdrop-filter` 需要 `-webkit-` 前缀，项目中已处理（`WebkitBackdropFilter`）
7. **首页背景图差异**：`MainLayout` 中根据 `isHomePage` 切换不同的 `backgroundImage`，修改首页时需注意
8. **ECharts 3D 图表实现模式**：
   - **3D 金字塔**（Industry/Talent）：ECharts `graphic` API 绘制三面多边形（正面梯形 + 左侧面高光 + 底面阴影），需理解坐标计算逻辑
   - **3D 柱状图**（Industry/Talent）：ECharts `custom` series + `renderItem` 绘制三面（正面 + 顶面高光 + 右侧阴影），数据格式须为 `[categoryIndex, value]` 二维数组，通过 `api.value(0/1)` 读取
   - **3D 环形图**（Industry/Screen）：双 `pie` series，底层偏移 3% 暗色模拟厚度，上层主色 + `shadowBlur`
   - **人才力导向图**（Talent）：深色科技风（`#050e1f` 背景），BFS 动态计算四级层级，搜索节点 `fixed: true` 居中，`key` prop 强制重建，`focus: 'adjacency'` 聚焦高亮
9. **CSS 变量向后兼容**：`global.css` 中保留了旧变量名（如 `--primary-color`）作为新变量的别名，避免同时修改两处
10. **无路径别名**：项目未配置 `@/` 路径别名，所有 import 使用相对路径（如 `../mock/data`）
11. **创新资源弧形布局**（Industry.tsx）：`InnovationCard` 是页面内定义的子组件（非独立文件），`useInnovationCountUp` 是自定义 Hook。左右卡片内容布局镜像对称（左卡数字→单位→标签，右卡标签→单位→数字），左右卡片统一固定宽度 270px。弧形效果通过 `innovationArcOffsets = [24,8,0,8,24]` 的 margin 实现（左卡用 `marginRight`，右卡用 `marginLeft`，均向地图方向推）。左列 `alignItems: flex-end`，右列 `alignItems: flex-start`，确保地图居中。省份数据 `innovationDataByProvince` 为内联对象（34 省/区/市全覆盖）。默认选中湖北省（`selectedProvince` 初始值 `'湖北省'`）
12. **创新资源地图省份高亮**：不使用 ECharts 内置 `select` 状态（`selectedMode: false`），改为通过 `geo.regions` 数组对选中省份强制着色，由 React 状态驱动，避免 `notMerge` 重渲染时高亮丢失
