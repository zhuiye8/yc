# API 接口对接清单与状态追踪

> 最后更新: 2026-03-29
> 基础地址: `http://119.36.242.222:8902`
> 前端代理: Vite proxy `/wf-api` → `http://119.36.242.222:8902`
> 认证方式: `POST /auth/token` → `Authorization: Bearer {accessToken}`

---

## 一、接口总览

### 已对接 ✅ (10个接口)

| # | 接口名称 | 调用名称 | 用途 | 对接页面 |
|---|---------|---------|------|---------|
| 1 | 登录认证 | `POST /auth/token` | 获取 accessToken | 全局 |
| 2 | 机构推荐(v1) | `GET /api/wf/findOrgByModelsDecode-v1` | 查企业(支持city) | 产业招引+大屏产业布局 |
| 3 | 专家检索(v2) | `GET /api/wf/findExpert-v2` | 查人才(支持city) | 产业招引+人才引育+大屏产业布局 |
| 4 | 人才关系图 | `GET /api/wf/graphSinglePersonRelation` | 合作关系网络 | 人才引育-力导向图谱 |
| 5 | 人才详情(产出) | `GET /api/wf/getExpertSummary` | 论文/专利/成果总数 | 人才引育-当前人才卡片 |
| 6 | 人才详情(背景) | `GET /api/wf/talent-background` | 学历/任职/奖项 | 人才引育-当前人才卡片 |
| 7 | 合作人才列表 | `GET /api/wf/talent-coopTalentList` | 合作者列表 | 人才引育-合作人才面板 |
| 8 | 关键词年度趋势 | `GET /api/wf/getCkeyIndustry` | 论文/专利/标准趋势 | 人才引育-研究方向趋势图 |
| 9 | 各省分布地图 | `GET /api/wf/getCkeyMap` | 各省数量分布 | 大屏-地图着色+人才总览柱状图 |
| 10 | 区域资源统计 | `GET /api/wf/talent-resourceStatistics` | 宜昌资源总数 | 大屏-首页KPI+人才总数 |

### 已对接功能清单

**产业招引页** ✅:
- 产业图谱节点浮窗: 并行4请求(全国企业/本地企业/全国人才/本地人才)
- 节点抽屉: "查看相关企业/人才"→860px抽屉+Cascader地区筛选+分页
- 链上企业/人才: 默认展示本地(跟随地区选择器city), "查看全部"→独立抽屉
- 本地化率: localOrgTotal / orgTotal 实时计算
- 地区联动: Cascader→IndustryGraph→IndustryTree→抽屉默认地区同步

**人才引育页** ✅:
- 搜索: HeroSection搜索框+热门标签→findExpert-v2→更新全部面板
- 图谱: graphSinglePersonRelation→BFS分层→深色力导向图(无数据时保底单节点)
- 当前人才: 四宫格指标(H指数/论文/专利/成果)+研究方向
- 合作人才: talent-coopTalentList→淡绿色列表
- 高端人才榜: 搜索结果按H指数排序→6人+等级标签
- 研究方向分布: 从搜索结果KEYWORDS聚合→柱状图(高的在上)
- 研究方向趋势: getCkeyIndustry→论文/专利/标准折线图(2020至今)
- 响应兼容: findExpert-v2 搜人名(data.sources) vs 搜关键词(data.expertsRecommend)

**大屏-产业布局** ✅:
- 6条产业链选择网格(可点击切换, 高亮选中)
- 产业链综合指标: 缺链数/强链数/产业链数/企业总数/人才总数
- 链上企业列表: searchOrgs(产业链名, city?) → 全国/宜昌切换
- 链上人才列表: searchExperts(产业链名, city?) → 全国/宜昌切换
- 企业类型分布: 从200条样本TAGS统计(上市/专精特新/科技型中小/全量) → 柱+线图
- 地图: getCkeyMap(产业链名) → 各省着色+tooltip
- 全国/宜昌视图: 点击宜昌聚焦→列表数据加city=宜昌, 点击全国视图→去掉city
- 独立loading: 企业和人才各自独立加载, 先到先显示
- 竞态防护: loadIdRef 防止旧请求覆盖新数据
- Tab高亮: 共享ScreenTabs组件, 基于useLocation自动高亮当前路由
- 默认入口: /screen 默认进入产业布局

**大屏-人才总览** ✅:
- 全国人才分布柱状图: getCkeyMap('人才') Top11省份
- 宜昌籍人才分布柱状图: getCkeyMap('宜昌') Top11省份
- 人才分类玫瑰图: 领军/技能/创新(暂mock)
- 人才总数+等级横向柱状图: getAreaStatistics('420500')
- 产业链人才环形图: 并行6次getCkeyMap每条产业链取总数
- 人才缺口柱+线图: 基于产业链人才数估算
- 地图: getCkeyMap('人才') 着色

### 待对接 — P1 人才引育扩展 🔲

| # | 接口名称 | 调用名称 | 用途 |
|---|---------|---------|------|
| 11 | 人才详情(指标) | `GET /api/wf/getOutputIndicator` | H指数/引用/合作详细 |
| 12 | 人才合作者统计 | `GET /api/wf/talent-coopTalentTitle` | 合作者汇总数据 |
| 13 | 人才合作机构 | `GET /api/wf/talent-coopOrgList` | 合作机构列表 |

### 待对接 — P2 搜索框+创新页 🔲

| # | 接口名称 | 调用名称 | 用途 |
|---|---------|---------|------|
| 14 | 企业搜索(机构名) | `GET /api/wf/getOrgByJGName` | 产业招引搜索框 |
| 15 | 企业搜索(文本) | `GET /api/wf/findOrgByText` | 产业招引搜索框备用 |
| 16 | 相关成果列表 | `GET /api/wf/getCkeyAchievement` | 创新协同专利列表 |
| 17 | 学科分布 | `GET /api/wf/getCkeySubject` | 创新协同热度分布 |

### 已废弃 ~~🚫~~

| 接口 | 原因 |
|------|------|
| industryNode-queryById | 产业链用本地数据 |
| industryNode-resources | 改用findOrgByModelsDecode-v1 |
| industry-getOrgDistribution | city参数不生效, 改用TAGS统计 |
| industry-getTalentDistribution | 改用findExpert-v2 |
| talent-keyword | findExpert-v2已返回KEYWORDS字段 |

### 无匹配接口 🔴

| 数据需求 | 位置 | 当前方案 |
|---------|------|---------|
| 人才分类(领军/技能/创新) | 大屏人才总览-玫瑰图 | 暂mock, 需客户提供 |
| 宜昌籍人才精确分布 | 大屏人才总览-右上柱状图 | 用getCkeyMap('宜昌')近似 |
| 人才缺口精确数据 | 大屏人才总览-右下图 | 用产业链人才数估算 |
| 预警系数 | 产业招引-右侧面板 | 暂mock |

---

## 二、地区筛选总结

| 接口 | prov | city | 方案 |
|------|------|------|------|
| findOrgByModelsDecode-v1 | ❌返回0 | ✅有效 | 只用city |
| findExpert-v2 | 无参数 | ✅有效 | 只用city |
| industry-getOrgDistribution | ❌不生效 | ❌不生效 | 改用TAGS统计 |

---

## 三、注意事项

1. **频率限制**: 429限流, 防抖500ms, 独立请求先到先显示
2. **竞态防护**: loadIdRef 防止旧请求覆盖新数据
3. **Token过期**: 7200秒(2h), 401自动跳登录
4. **text必填**: findOrgByModelsDecode-v1的text不能省略否则502
5. **talent-微服务不稳定**: talent-background/coopTalentList等偶尔502
6. **KEYWORDS字段**: findExpert-v2返回100个关键词+频次, 可替代talent-keyword
7. **响应双结构**: findExpert-v2搜人名→data.sources, 搜关键词→data.expertsRecommend
8. **图谱保底**: graphSinglePersonRelation返回空时构造单节点
9. **图片路径**: 大屏素材在public/images/screen/, CSS用/images/screen/引用
10. **React StrictMode**: 开发环境useEffect双重执行, 生产环境正常
