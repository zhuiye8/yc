# 会话交接文档

> 生成时间: 2026-04-01
> 项目目录: C:\Files\work\yc\.claude\worktrees\elastic-knuth
> Git分支: new
> 远程仓库: https://github.com/zhuiye8/yc.git
> 生产地址: http://101.132.130.146:3001
> 开发端口: 5175

---

## 一、项目概述

**宜昌产业人才地图** — 政务产业人才数智化服务平台，基于 React 19 + TypeScript + Vite 7 + Ant Design 5 + ECharts 6。

技术栈：
- 框架: React 19.2 + TypeScript 5.9 + Vite 7.3
- UI: Ant Design 5.29 + SCSS Modules
- 图表: ECharts 6 (echarts-for-react)
- 路由: react-router-dom 7.12
- 样式: SCSS 变量体系 (src/styles/variables.scss)

---

## 二、当前正在进行的工作

### 客户修改意见（来自：产业人才地图修改建议文档.xlsx）

**已完成的修改：**
- ✅ 所有页面背景色 → #f2f6fe
- ✅ 搜索框渐变 #dae5fc→#fff + 与内容同宽
- ✅ Tab样式: 方形圆弧6px，蓝色#3194fd + 橙色渐变#fe896f→#ff5a36
- ✅ 导航抬头文字: 产业/人才/技术/资金/政策/解决方案/关于我们
- ✅ 页脚: 二维码替换(3张真实图) + 文案更新 + 彩色图标(地址红/电话绿/邮箱蓝)
- ✅ 顶部海报 min-height: 480px
- ✅ 各页面顶部文案覆盖（HeroSection titleLine1/titleLine2 props）
- ✅ 首页: 统计卡片背景#f2f6fe + 数字颜色(5色) + 点击跳转 + 金融产品257款
- ✅ 首页导航: 半透明背景 + backdrop-filter
- ✅ 登录页: 按钮渐变 + 标签渐变
- ✅ 预警系数: 渐变#ffbf17→#fa5319
- ✅ 人才柱状图颜色: #2873ff/#25bcb0/#fe4e4e/#fe9f4d/#4db9fe
- ✅ 政策滚动新闻: 蓝色背景#3194fd + 白色文字
- ✅ 解决方案: 数据维度6卡片背景色 + 标题蓝黑配色
- ✅ 关于我们: 行距增大 + 帮助蓝色边框 + 目标4色 + 间距加大
- ✅ 快捷菜单3页面: 我的清单(/list) + 报告中心(/reports) + 预警中心(/alerts)
- ✅ 报告模板: 3个docx在public/templates/ + 下载按钮
- ✅ 新图标: 19个图标复制到src/assets/images/icons/
- ✅ 缺链逻辑统一: getEffectiveStatus模糊匹配

**标黄的（客户说先不管）：**
- 产业链筛选统一处理
- 快捷菜单/消息/管理员点击无反应
- 首页搜索
- 各种数据不一致问题（预警系数联动、人才总数不匹配等）
- 供需匹配深度功能
- 创新资源点击跳转详细页

**可能还需要调整的样式问题（对照效果图）：**
- 产业页: 上中下游样式、批量加入清单按钮方形圆弧
- 人才图谱: 展示样式对照效果图
- 技术/资金/政策页: 整体样式对照效果图
- 解决方案: 典型应用场景背景+标题框
- 首页: 文案"一站式产业人才创新服务平台" + 副标题

---

## 三、关键文件清单

### 样式体系
- `src/styles/variables.scss` — 全局变量(颜色/字体/间距/圆角/阴影)
- `src/styles/global.scss` — Ant Design覆盖 + 全局reset
- `src/components/HeroSection/HeroSection.module.scss` — 通用Hero+搜索框

### 页面组件
| 路由 | 文件 | 说明 |
|------|------|------|
| / | src/pages/Home/index.tsx | 首页(一屏) |
| /industry | src/pages/Industry/index.tsx + IndustryGraph.tsx + IndustryReport.tsx | 产业招引 |
| /talent | src/pages/Talent/index.tsx + TalentGraph.tsx + TalentReport.tsx + YichangTalents.tsx + SupplyDemand.tsx | 人才引育 |
| /innovation | src/pages/Innovation/index.tsx + ResourceHeatMap.tsx + RegionPicker.tsx | 创新协同 |
| /funding | src/pages/Funding/index.tsx | 资金对接 |
| /policy | src/pages/Policy/index.tsx | 政策直达 |
| /solutions | src/pages/Solutions/index.tsx | 解决方案 |
| /about | src/pages/About/index.tsx | 关于我们 |
| /list | src/pages/ListCenter/index.tsx | 我的清单(快捷菜单) |
| /reports | src/pages/ReportCenter/index.tsx | 报告中心(快捷菜单) |
| /alerts | src/pages/AlertCenter/index.tsx | 预警中心(快捷菜单) |
| /login | src/pages/Login/index.tsx | 登录页 |
| /screen/* | src/pages/Screen/ | 大屏模式(ScreenHome/Industry/Talent) |

### 布局
- `src/layouts/MainLayout/` — Header.tsx + Footer.tsx + index.tsx
- `src/layouts/ScreenLayout/` — 大屏布局(时钟+返回按钮)

### 核心组件
- `src/components/HeroSection/` — 通用Hero(背景图+标题覆盖+搜索框+热门标签)
- `src/components/IndustryTree/` — 产业链树形图(CSS+React)
- `src/components/ReportPanel/` — 报告面板(左菜单+右内容+模板下载)
- `src/components/AIFloatButton/` — AI浮窗(右下角)
- `src/components/IndustryDrawerColumns.tsx` — 抽屉列表列定义

### API服务层
- `src/services/api.ts` — 基础fetch封装, BASE_URL=/wf-api
- `src/services/auth.ts` — 两层登录(前端硬编码校验+真实token获取)
- `src/services/industry.ts` — searchOrgs(findOrgByModelsDecode-v1)
- `src/services/talent.ts` — searchExperts/getTalentGraph/getExpertSummary等
- `src/services/screen.ts` — getCkeyMap/getAreaStatistics/getCkeyIndustry
- `src/services/coverageCache.ts` — 节点覆盖率批量查询+缓存+强弱缺链判定

### 数据文件
- `src/data/industry-keywords.json` — 546个末端节点→关键词映射(143KB)
- `src/data/talent-gap.json` — 宜昌岗位需求→产业链缺口
- `src/mock/data.ts` — 静态mock数据
- `src/mock/industryChainGraphData.ts` — 6条产业链树形结构
- `src/mock/yichang-talents.json` — 24970条宜昌技能人才(7.7MB)
- `src/mock/yichang-jobs.json` — 188条岗位需求

### 静态资源
- `public/geo/` — 全国省市GeoJSON(375文件, 约26MB)
- `public/geo/area-tree.json` — 省市区精简列表(144KB)
- `public/templates/` — 3个报告模板docx
- `src/assets/images/hero/` — 各页面Hero背景图
- `src/assets/images/icons/` — 小图标(含客户新提供的19个)
- `src/assets/images/screen/` — 大屏素材(33个PNG)
- `src/assets/images/logo.png` — Logo
- `src/assets/images/qrcode-*.png` — 3张二维码

---

## 四、API接口状态

详见 `docs/API-INTEGRATION-STATUS.md`

**已对接(10个):** auth/token, findOrgByModelsDecode-v1, findExpert-v2, graphSinglePersonRelation, getExpertSummary, talent-background, talent-coopTalentList, getCkeyIndustry, getCkeyMap, talent-resourceStatistics

**关键参数:**
- 认证: POST /auth/token → Bearer {accessToken}
- 企业查询: GET /api/wf/findOrgByModelsDecode-v1?text={首词}&queryString={OR关联}&city={可选}
- 人才查询: GET /api/wf/findExpert-v2?key={OR关联}&city={可选}
- 区域统计: GET /api/wf/talent-resourceStatistics?queryString=(AREACODE:4205*)
- Vite代理: /wf-api → http://119.36.242.222:8902
- 生产Nginx: location /wf-api/ { proxy_pass http://119.36.242.222:8902/; }

**登录凭证:**
- 前端展示: yc_vx274 / T9#qL2@pW7!mR4
- 真实API: i3dev / woeuty#WHU!027

---

## 五、客户提供的参考文件

- 设计稿: C:\Files\work\yc\设计稿3.17-网页版\产业人才地图设计稿3.17\ (14张PNG/JPG)
- 大屏设计: C:\Files\work\yc\大屏模式\dashboard\ (独立Vue项目)
- 产业链MD: C:\Files\work\yc\.claude\worktrees\elastic-knuth\宜昌产业链六条\
- 企业放入逻辑Excel: 产业链全环节企业放入逻辑\ (6个Excel总表)
- 修改意见: 产业人才地图修改建议文档.xlsx
- 报告模板: 人才库报告.docx / 企业库报告.docx / 技术库报告.docx
- 快捷菜单设计: 新增快捷菜单\ (3张截图)
- 新图标: images\ (19个PNG)
- 宜昌数据: 宜昌提供本地特色数据\ (政策Excel+岗位Excel+人才Excel+企业Excel)

---

## 六、开发命令

```bash
npm run dev        # 启动开发(5175端口)
npm run build      # tsc -b + vite build
npm run lint       # ESLint检查

# 生产部署(阿里云服务器)
ssh root@101.132.130.146
cd ~/work/yc-new && git pull origin new && NODE_OPTIONS="--max-old-space-size=4096" pnpm build && sudo nginx -s reload
```

---

## 七、已知问题/注意事项

1. **接口限流**: 429错误, 批量查询需间隔, 并发≤10/s
2. **token过期**: 7200秒, 401自动跳登录
3. **大屏GeoJSON**: 阿里云CDN对服务器返回403, 已全量下载到public/geo/
4. **产业链节点名不一致**: MD文件树结构(浅层) vs Excel总表末端节点(深层), 125个节点只在Excel有, 6个中间节点只在图谱有, 已用模糊匹配缓解
5. **覆盖率计算耗时**: 146节点×1s/5个=约30秒, 有进度显示和缓存
6. **findExpert-v2双结构**: 搜人名→data.sources, 搜关键词→data.expertsRecommend
7. **宜昌数据稀疏**: 部分产业链在宜昌企业数极少(如GPU领域只有1家)
8. **React StrictMode**: 开发环境useEffect双重执行(生产正常)
