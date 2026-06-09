# 新会话交接文档

更新时间：2026-06-09

## 项目状态

| 项 | 当前值 |
| --- | --- |
| 项目目录 | `C:\work\yichang\yc-new\yc` |
| 当前生产分支 | `new` |
| 当前生产提交 | `c40fca7` |
| 生产服务器 | `root@192.168.9.235` |
| 生产目录 | `/root/work/yc` |
| Nginx 监听 | 服务器本地 `1300` |
| 公网访问 | `http://58.220.229.11:50006/` |
| 研究院接口 | `http://119.36.242.222:19020`，前端走 `/tg-api` |
| WF 接口 | `http://119.36.242.222:8902`，前端走 `/wf-api` |

生产当前也使用 `new` 分支。`main` 是旧分支，已经不代表生产状态。

## 技术栈与命令

- React 19 + TypeScript + Vite
- Ant Design + ECharts + G6
- SCSS Modules
- 2 空格缩进

常用命令：

```bash
npm run dev
npm run lint
npm run build
```

部署构建：

```bash
ssh root@192.168.9.235
cd /root/work/yc
git pull origin new
npm run build
nginx -t
nginx -s reload
```

注意：前端是 Nginx 静态部署，不需要线上跑 `npm run dev`。

## 重要文档

| 文档 | 用途 |
| --- | --- |
| `AGENTS.md` | 项目开发规则 |
| `DATA_SOURCES.md` | 当前数据源与接口边界，优先阅读 |
| `二批次接口需求清单2.md` | 当前仍需后端配合的接口需求 |
| `产业图谱父子关系树.json` | 给后端的产业图谱父子关系数据 |
| `产业图谱父子关系树说明.md` | 产业图谱父子关系数据说明 |
| `docs/reference/data-dictionary/` | 客户数据库表结构 CSV |
| `docs/reference/tg接口字段与数据字典对照.md` | TG 接口字段与数据字典对照 |

## 核心源码入口

### 页面

| 页面 | 文件 |
| --- | --- |
| 首页 | `src/pages/Home/index.tsx` |
| 产业招引 | `src/pages/Industry/index.tsx`、`src/pages/Industry/IndustryGraph.tsx` |
| 创新资源 | `src/pages/Industry/IndustryInnovationResources.tsx`，创新菜单复用该模块 |
| 人才引育 | `src/pages/Talent/index.tsx`、`src/pages/Talent/TalentGraph.tsx` |
| 企业详情 | `src/pages/Industry/EnterpriseDetail.tsx` |
| 人才详情 | `src/pages/Industry/TalentDetail.tsx` |
| 资金对接 | `src/pages/Funding/index.tsx` |
| 政策直达 | `src/pages/Policy/index.tsx` |

### 服务

| 服务 | 说明 |
| --- | --- |
| `src/services/tgAuth.ts` | TG token 获取与自动重试 |
| `src/services/chainOrg.ts` | ChainOrg 企业接口 |
| `src/services/chainTalent.ts` | ChainTalent 人才接口 |
| `src/services/talent.ts` | 普通人才搜索、详情、关系、论文专利接口 |
| `src/services/homeStats.ts` | 首页统计前三项 |
| `src/services/screen.ts` | 少量旧 WF / TG 大屏统计 |
| `src/services/api.ts` | WF 客户端，仍给旧接口使用 |

## 当前数据源重点

1. 产业图谱结构仍由本地文件维护，后端只提供统计和列表。
2. 产业企业数据使用 ChainOrg：
   - `/api/chain-orgs/search`
   - `/api/chain-orgs/province-distribution`
   - `/api/chain-orgs/city-distribution`
   - `/api/chain-orgs/coverage-summary`
   - `/api/chain-orgs/node-org-counts`
3. 产业人才数据使用 ChainTalent：
   - `/api/chain-talents/search`
   - `/api/chain-talents/province-distribution`
   - `/api/chain-talents/city-distribution`
   - `/api/chain-talents/year-trend`
4. 首页企业、人才、技术标准三项使用 `/api/stats/industry-chain-total`。
5. 首页金融产品、申报政策仍是静态值，需要后端补统计接口。
6. 资金页面、清单、报告中心、预警中心、解决方案、关于我们仍以静态展示为主。

## 已知注意事项

- TG 后端偶发 502 / 空响应时，前端页面本身通常没挂，先查 `/tg-api/api/auth/login` 代理和 `119.36.242.222:19020`。
- 首页企业总数由 TG 接口直接返回，前端只格式化，不参与统计。
- 地区参数目前接口更偏好 `湖北`、`宜昌`，而不是 `湖北省`、`宜昌市`。
- `server/industry-demo-api` 是历史开发辅助服务，当前主项目不依赖它。
- `.env.local` 不应再配置 `VITE_INDUSTRY_DATA_SOURCE=demo-api`。

## 新会话建议流程

1. 先读 `AGENTS.md`。
2. 再读 `DATA_SOURCES.md`。
3. 查看 `git status --short --branch`。
4. 具体开发前定位页面与 service，不要按旧 WF/demo 文档推断。
5. 改完跑 `npm run lint` 和 `npm run build`。
