<!-- FORMAT-DOC: Update when files in this folder change -->

# pages

业务页面组件，每个文件对应一个路由，由 App.tsx 注册、MainLayout Outlet 渲染。

## Files

| File | Role | Responsibilities |
|---|---|---|
| Home.tsx | Page | 首页：Hero 布局 + 全局筛选条 + 五大模块卡片总览 |
| Industry.tsx | Page | 产业页：产业链树图谱 + 3D 金字塔/柱状图/环形图 + 企业列表 + 中国地图 + 创新资源弧形布局（最复杂页面） |
| Talent.tsx | Page | 人才页：科技风力导向图谱（BFS 四级分层）+ 3D 柱状图 + 人才列表 + 地图 + 合作机构 |
| Tech.tsx | Page | 创新页：年度趋势折线图 + 热点主题矩形树图 + 技术缺口对标 + 专利列表 |
| Funding.tsx | Page | 资金页：融资工具库 + 投资机构库表格 + 基金类型统计 + 对接清单 |
| Policy.tsx | Page | 政策页：政策搜索列表 + 到期预警 + 订阅开关 + 闭环输出入口 |
| About.tsx | Page | 关于页：平台介绍 + 核心能力 + 数据维度 + 未来目标 |
| Screen.tsx | Page | 大屏入口：嵌套路由加载 dashboard 子应用（首页/产业/人才） |
| ListCenter.tsx | Page | 清单中心：招商/引才/融资/申报四类清单 Tab 管理 |
| ReportCenter.tsx | Page | 报告中心：六类报告管理 + 预览/下载/删除 |
| AlertCenter.tsx | Page | 预警中心：多维预警 + 规则管理 + 已读/未读筛选 |
