# 宜昌产业人才地图数据源说明

更新时间：2026-06-09  
当前生产分支：`new`  
当前生产提交：`c40fca7`

本文档是当前项目的数据源事实口径。旧版 `demo-api / WF / TG` 多套兜底说明已经过期，以本文档为准。

## 环境与代理

| 环境 | 地址 / 路径 | 说明 |
| --- | --- | --- |
| 本地开发 | `npm run dev`，默认 `5175` | Vite 代理 `/tg-api`、`/wf-api` |
| 生产服务器 | `root@192.168.9.235:/root/work/yc` | Nginx 静态部署 `dist` |
| 生产监听 | 服务器本地 `1300` | 公网 `58.220.229.11:50006` 映射到该端口 |
| 研究院接口 TG | `/tg-api` -> `http://119.36.242.222:19020` | 当前主数据源 |
| WF 接口 | `/wf-api` -> `http://119.36.242.222:8902` | 仅少量旧模块仍使用 |

`.env.local` 目前不再配置 `VITE_INDUSTRY_DATA_SOURCE=demo-api`。产业链企业、人才数据主链路已经切到研究院 TG 的 ChainOrg / ChainTalent 接口。

## 数据源分类

| 类型 | 说明 | 当前用途 |
| --- | --- | --- |
| TG 研究院接口 | `/tg-api/api/*`，登录后 Bearer token | 首页前三项统计、产业链企业/人才、人才详情、人才图谱、创新资源部分图表 |
| WF 接口 | `/wf-api/api/wf/*`，登录后 Bearer token | 旧创新热力/资源统计、部分大屏旧数据 |
| 本地 JSON/TS | `src/data`、`src/mock`、`public/data`、`public/geo` | 产业图谱结构、节点介绍、地区数据、政策本地数据、静态展示 |
| 静态 Mock | 页面内数组或 `src/mock/data.ts` | 资金、报告、清单、预警、部分展示型页面 |

## 核心接口

### 首页

| 数据 | 来源 | 备注 |
| --- | --- | --- |
| 企业总数 | `GET /api/stats/industry-chain-total` | TG 返回 `enterpriseTotal`，前端只格式化 |
| 人才总数 | `GET /api/stats/industry-chain-total` | TG 返回 `talentTotal` |
| 技术标准 | `GET /api/stats/industry-chain-total` | TG 返回 `standardTotal` |
| 金融产品 | 前端静态值 | 等后端提供真实口径 |
| 申报政策 | 前端静态值 | 等后端提供真实口径 |

注意：`/api/stats/industry-chain-total` 当前地区参数口径使用 `湖北`、`宜昌`，不是 `湖北省`、`宜昌市`。

### 产业招引

| 场景 | 当前来源 |
| --- | --- |
| 产业图谱父子结构 | `src/mock/industryChainGraphData.ts`，由产业链 Excel 解析生成 |
| 节点关键词 | `src/data/industry-keywords.json` |
| 节点介绍 | `src/data/industry-node-profiles.json` |
| 链上企业列表 | `GET /api/chain-orgs/search` |
| 链上企业省份柱状图 | `GET /api/chain-orgs/province-distribution` |
| 链上企业城市分布 | `GET /api/chain-orgs/city-distribution` |
| 覆盖统计卡片 | `GET /api/chain-orgs/coverage-summary` |
| 节点企业数量 | `GET /api/chain-orgs/node-org-counts` |
| 链上人才列表 | `GET /api/chain-talents/search` |
| 链上人才省份 / 城市分布 | `GET /api/chain-talents/province-distribution`、`GET /api/chain-talents/city-distribution` |
| 链上人才趋势 | `GET /api/chain-talents/year-trend` |

产业模块不再依赖本地 `demo-api` 作为主链路。`server/industry-demo-api` 只是历史开发辅助服务，生产可以不启动。

### 人才引育

| 场景 | 当前来源 |
| --- | --- |
| 人才搜索 | `GET /api/talents/search` |
| 人才详情 | `GET /api/talents/{id}` |
| 人才关系图 | `GET /api/talents/{id}/graph` |
| 合作机构 / 合作人才 | `GET /api/talents/{id}/cooperate-orgs`、`GET /api/talents/{id}/coauthors` |
| 论文 / 专利列表 | `GET /api/papers/list`、`GET /api/patents/list` |
| 宜昌人才 | `public/data/yichang-talents.json` |
| 供需匹配 | `src/mock/yichang-jobs.json` |

人才图谱当前有 `mockTalentPreview.ts` 作为图谱侧卡片预览辅助数据，但主搜索和详情来自 TG。

### 创新协同

创新菜单已复用产业模块中的“创新资源”能力。

| 场景 | 当前来源 |
| --- | --- |
| 创新人才、人才分布、趋势 | ChainTalent 接口 |
| 创新机构列表 / 城市分布 | ChainOrg 接口 |
| 资源统计卡片 | 部分仍走 WF `talent-resourceStatistics` |
| 技术热点、部分资源列表 | 本地静态数据 |

### 资金、政策、清单、报告、预警

| 页面 | 当前来源 |
| --- | --- |
| 资金对接 | `src/mock/data.ts` 中 `fundingProducts`、`investmentInstitutions` |
| 政策直达 | `src/mock/localPolicies.ts`，宜昌本地政策静态数据 |
| 我的清单 | 页面静态数据 |
| 报告中心 | 页面静态数据 |
| 预警中心 | 页面静态数据 |
| 解决方案 / 关于我们 | 静态展示内容 |

## 本地数据与参考资料

| 文件 / 目录 | 用途 |
| --- | --- |
| `src/data/industry-keywords.json` | 产业链叶子节点与关键词映射 |
| `src/data/industry-node-profiles.json` | 图谱节点一句话介绍 |
| `产业图谱父子关系树.json` | 给后端的产业图谱父子关系数据 |
| `docs/reference/data-dictionary/` | 客户数据库表结构 CSV 参考 |
| `docs/reference/tg接口字段与数据字典对照.md` | TG 接口字段与数据库表结构对照 |

## 当前仍需后端确认

1. 首页 `金融产品`、`申报政策` 的真实统计接口与统计口径。
2. TG 统计接口地区参数是否兼容 `湖北省/湖北`、`宜昌市/宜昌`。
3. 政策、金融产品是否需要专门列表接口，避免继续使用静态数据。
4. 人才图谱关系接口是否补充技术节点、产业链节点、关联企业节点等明确关系类型。
