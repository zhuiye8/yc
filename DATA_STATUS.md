# 宜昌产业人才地图 — 数据接入状态清单

> 更新时间：2026-03-27

---

## 一、各页面数据来源总览

| 页面 | 真实API | 本地Excel | Mock假数据 | 状态 |
|------|--------|----------|-----------|------|
| 首页 Home | ❌ | ❌ | ✅ 全部内联 | 保持Mock |
| **产业 Industry** | ✅ 万方API | ✅ 企业表 | 部分Mock | **已接入** |
| **人才 Talent** | ✅ 万方API | ✅ 技能人才表 | 部分Mock | **已接入** |
| 创新 Tech | ❌ | ❌ | ✅ 全部内联 | 保持Mock |
| 资金 Funding | ❌ | ❌ | ✅ 全部Mock | 保持Mock（客户要求暂不做） |
| **政策 Policy** | ❌ | ✅ 政策表 | 部分Mock | **已挂本地数据** |
| **大屏 Screen** | ❌ | ✅ 企业表+技能人才表聚合 | 部分Mock | **已接入本地数据** |
| 清单中心 | ❌ | ❌ | ✅ 全部内联 | 保持Mock |
| 报告中心 | ❌ | ❌ | ✅ 全部内联 | 保持Mock |
| 预警中心 | ❌ | ❌ | ✅ 全部内联 | 保持Mock |
| 关于我们 | ❌ | ❌ | ✅ 全部内联 | 保持Mock |

---

## 二、产业页（Industry）详细数据来源

| 区域 | 数据来源 | 调用方式 | 状态 |
|------|--------|---------|------|
| 产业链图谱（上中下游树） | Mock | `industryChainGraphData.ts`（6条产业链MD生成） | ⚪ Mock但数据真实（来自客户MD文件） |
| 企业列表表格 | **本地Excel** | `fetch('/data/enterprises.json')` 12,269条 | ✅ 真实 |
| 企业详情-产出指标 | **万方API** | `getOrgOutput(orgName)` | ✅ 真实 |
| 企业详情-技术关键词 | **万方API** | `getOrgTechKeywords(orgName)` | ✅ 真实 |
| 链上人才列表 | **万方API** | `findExpertByKey(keyword, 0, 8, undefined, '湖北')` | ✅ 真实 |
| 年度趋势图（专利/标准/项目/成果） | **万方API** | `getYearCountByIndex({indexName, must, yearCount})` | ✅ 真实 |
| 产业关键技术词 | **万方API** | `getCkeyAboutRaw(keyword)` | ✅ 真实 |
| 创新资源弧形布局-省份数据 | Mock | `innovationDataByProvince` 内联对象 | ⚪ Mock |
| 3D金字塔（机构类型） | Mock | `industryOverviewDataMap` | ⚪ Mock |
| 3D柱状图（省份企业） | Mock | `industryOverviewDataMap` | ⚪ Mock |
| 3D环形图（人才类型） | Mock | `industryOverviewDataMap` | ⚪ Mock |
| 中国地图（人才分布） | Mock | `industryOverviewDataMap` | ⚪ Mock |
| 企业合作关系图 | Mock | 内联节点/边数据 | ⚪ Mock |
| 预警系数/本地化率 | Mock | 硬编码 72.5 / 46.8% | ⚪ Mock |

---

## 三、人才页（Talent）详细数据来源

| 区域 | 数据来源 | 调用方式 | 状态 |
|------|--------|---------|------|
| 高端人才榜（Top4卡片） | **万方API** | `findExpertByKey('生物医药', 0, 4, undefined, '湖北')` | ✅ 真实 |
| 人才关系力导向图（默认） | **万方API** | `getPersonRelationGraph(expertId, 2, 20)` | ✅ 真实 |
| 人才关系图-搜索 | **万方API** | `queryTalents()` → `getPersonRelationGraph()` | ✅ 真实 |
| 人才研究方向柱状图 | **万方API** | `getExpertKeywords(auid)` | ✅ 真实 |
| 人才关键词年度分布 | **万方API** | `getExpertKeyYear(auid)` | ✅ 真实 |
| **技能人才列表** | **本地Excel** | `fetch('/data/skill-talents.json')` 24,970条 | ✅ 真实 |
| 人才总览-3D金字塔 | **本地聚合** | `localAggregations.ts` 按Level聚合 | ✅ 真实 |
| 人才总览-省份柱状图 | Mock | `industryOverviewDataMap` | ⚪ Mock |
| 人才总览-中国地图 | Mock | 硬编码省份数据 | ⚪ Mock |
| 合作机构列表 | **万方API** | `getCooperationOrgs(expertId)` | ✅ 真实 |
| 宜昌籍人才统计 | Mock | `yichangTalentStats` | ⚪ Mock |
| 研究方向分布（默认） | Mock | 内联数据 | ⚪ Mock |
| 趋势折线图（默认） | Mock | 内联数据 | ⚪ Mock |

---

## 四、大屏页（Screen）详细数据来源

| 区域 | 数据来源 | 说明 | 状态 |
|------|--------|------|------|
| 企业总数 KPI | **本地聚合** | `aggregations.totalEnterprises` = 12,269 | ✅ 真实 |
| 人才总数 KPI | **本地聚合** | `aggregations.totalTalents` = 24,970 | ✅ 真实 |
| 政策总数 KPI | **本地聚合** | `aggregations.totalPolicies` = 38 | ✅ 真实 |
| 产业链数 KPI | Mock | 硬编码 6 | ⚪ Mock |
| 专利总数/创新总数 KPI | Mock | 硬编码 | ⚪ Mock |
| 企业列表 Table | **本地Excel** | `fetch('/data/enterprises.json')` | ✅ 真实 |
| 链上人才 Table | **本地Excel** | `fetch('/data/skill-talents.json')` | ✅ 真实 |
| 企业类型分布柱状图 | **本地聚合** | 按 entity_type 聚合 | ✅ 真实 |
| 产业链环形图 | Mock | `industryChains` | ⚪ Mock |
| 区域企业分布柱状图 | Mock | 硬编码区域数据 | ⚪ Mock |
| 发展趋势折线图 | Mock | 硬编码年度数据 | ⚪ Mock |
| 中国人才热力地图 | Mock | 硬编码省份数据 | ⚪ Mock |
| 企业动态滚动 | Mock | 硬编码新闻 | ⚪ Mock |
| 政策预警滚动 | Mock | 硬编码预警 | ⚪ Mock |

---

## 五、政策页（Policy）数据来源

| 区域 | 数据来源 | 说明 | 状态 |
|------|--------|------|------|
| **政策列表** | **本地Excel** | `localPolicies.ts`（从"宜昌政策收集3.5.xlsx"生成，38条） | ✅ 真实 |
| 政策搜索/筛选 | 本地数据 | 前端筛选 | ✅ |
| 到期预警 | 本地数据派生 | 自动计算到期时间 | ✅ |
| 订阅开关/本周更新 | Mock | 硬编码 | ⚪ Mock |

---

## 六、万方API接口可用性

### ✅ 可用接口（已集成或可集成）

| 接口调用名 | 方法 | 用途 | 已集成页面 |
|-----------|------|------|-----------|
| `getTalentByQuery-v2` | GET | 专家高级检索 | Talent |
| `findExpert-v2` | GET | 按关键词找专家 | Industry, Talent |
| `basicSearch` | GET | 文献/专利/标准搜索+聚合 | Industry, Talent |
| `graphSinglePersonRelation` | GET | 人物关系图谱 | Talent |
| `cooperationORG` | GET | 专家合作机构 | Industry, Talent |
| `getOrgOutputIndicator` | GET | 机构产出指标 | Industry |
| `getOrgRe` | GET | 机构技术关键词 | Industry |
| `getCkeyAbout` | GET | 技术词相关词 | Industry |
| `talent-background` | GET | 专家背景摘要 | Talent |
| `talent-keyword` | GET | 专家研究方向 | Talent |
| `talent-keyYear` | GET | 专家方向年度分布 | Talent |
| `talent-resourceStatistics` | GET | 区域资源统计 | 预留（未使用） |
| `findOrgByName` | GET | 按名称查机构 | Industry |
| `getOrgWithQuery` | GET | 机构高级检索 | 未使用 |

### ⚠️ 有问题的接口

| 接口 | 问题 | 说明 |
|------|------|------|
| `getTalentByQuery`（v1） | 返回 code:205 错误 | 用 v2 替代 |
| `getYearCountByCKey` | POST 415/400 | 代理层不支持POST |
| `getFundByCkey` | POST 415/400 | 代理层不支持POST |
| `getProjectByCkey` | POST 415/400 | 代理层不支持POST |
| `getAchByCkey` | POST 415/400 | 代理层不支持POST |
| `getStdByCkey` | POST 415/400 | 代理层不支持POST |
| `getPatentByCkey` | POST 415/400 | 代理层不支持POST |

### ❌ 不可用接口（代理未配置）

| 接口 | 说明 |
|------|------|
| `cstservice.cn` 系列（10个） | 外部域名，代理层未配置转发 |
| `getIndustryChain` | 返回空数据 |

---

## 七、本地数据文件清单

| 文件 | 来源 | 记录数 | 用途 |
|------|------|--------|------|
| `public/data/enterprises.json` | Organization_yichang（企业表）-3.16.xlsx | 12,269 | 企业列表 |
| `public/data/skill-talents.json` | yichang_local_personnel（技能人才）3.16.xlsx | 24,970 | 技能人才库 |
| `src/mock/localPolicies.ts` | 宜昌政策收集3.5.xlsx | 38 | 政策列表 |
| `src/mock/localAggregations.ts` | 上述Excel聚合 | — | 统计数据 |
| `src/mock/industryChainGraphData.ts` | 宜昌产业链六条/\*.md | 6条链 | 产业图谱 |
| `public/data/jobs.json` | JobPosition_最近12个月（岗位表）-3.16.xlsx | — | 岗位数据（预留） |

---

## 八、待办事项

1. **资金页**：客户要求等UI改完后再加跳转到 `https://www.threegorges-financial.com/`，现在不动
2. **创新页（Tech）**：客户没要求接数据，保持Mock
3. **大屏页**：链上人才已接本地Excel，可进一步接万方API获取全国人才分布
4. **产业图谱**：已用React组件重构，替代ECharts tree，解决文字截断问题
5. **首页/清单/报告/预警/关于**：客户说"放个假的就可以"，保持Mock

---

## 九、认证信息

- **Token获取**：`POST http://119.36.242.222:8902/auth/token`
- **请求体**：`{"username":"i3dev","secret":"woeuty#WHU!027"}`
- **鉴权方式**：`Authorization: Bearer <accessToken>`（非PDF文档中的X-Access-Token）
- **API基地址**：`http://119.36.242.222:8902/api/wf/<接口名>`
- **限流**：请求间隔 ≥ 1秒，否则 429
