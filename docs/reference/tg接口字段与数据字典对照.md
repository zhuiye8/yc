# TG 接口字段与客户数据字典对照

生成时间：2026-05-11

## 原始字典位置

已将客户提供的 CSV 数据字典复制到：

`docs/reference/data-dictionary/`

共 15 个文件：

| CSV | 覆盖表 |
| --- | --- |
| `widi_institution.csv` | 企业/机构、机构标签、产业、行业、统计、合作机构 |
| `widi_scholar.csv` | 人才、职称、机构、研究方向、标签、学科、籍贯/地区 |
| `widi_scholar_sci.csv` | SCI 人才、合作作者、关键词、机构、学科 |
| `widi_chn_paper.csv` | 论文、作者、机构、关键词、基金、产业、行业 |
| `widi_chn_patent.csv` | 专利、申请人、发明人、分类、关键词、法律状态 |
| `widi_standard.csv` | 标准、起草人、起草机构、关键词、适用地区 |
| `widi_tech_achievements.csv` | 技术成果、作者、机构、区域、产业、项目、奖项 |
| `widi_fund_project.csv` | 科研项目、人员、机构、关键词、项目类型 |
| `widi_industrial_policy.csv` | 政策、政策标签、政策关键词 |
| `widi_industrial_park.csv` | 园区、园区产业、园区标签、关联机构 |
| `widi_journal.csv` | 期刊、学科、卷期、核心收录、奖项 |
| `widi_literature_org_coop.csv` | 文献机构合作、合作作者、合作机构、合作关键词 |
| `widi_scientific_research_institute.csv` | 科研院所、资质、成果转化、专利、项目、标签 |
| `widi_think_tank.csv` | 智库、作者、专家关联、区域、主题 |
| `widi_university.csv` | 高校、别名、曾用名、区域、标签 |

## 对照结论

当前前端正在使用的 TG 接口返回字段，整体可以分成三类：

1. **底表/ES 原始字段**：能在 CSV 的 `column_name` 或 `column_comment` 中找到来源。
2. **接口聚合字段**：例如 `total/page/pageSize/items`、`enterpriseTotal/talentTotal/standardTotal`、`coverageRate`、`coveredNodes`，这些不是底表字段，是后端接口计算结果。
3. **产业链匹配元数据**：例如 `matched_keywords`、`matched_leaf_nodes`、`matched_query_strings`、`root_chain_name`，这些不是业务底表字段，是后端按产业链关键词匹配时生成的索引/解释字段。

因此：**实体字段来源基本明确；并非所有接口字段都是底表字段，但非底表字段也有明确的接口计算或匹配语义。**

## 主要接口字段来源

### `/api/chain-orgs/search`

企业列表核心字段基本来自 `widi_institution.csv`：

| 接口字段 | 字典来源/含义 |
| --- | --- |
| `ID` | `institution.id` / ES `_source.ID` |
| `NAME` | `institution.name` / ES `_source.NAME` |
| `PROV`、`CITY`、`XIAN`、`AREACODE` | 企业区域字段 |
| `ADDR` | 企业地址 |
| `CREDITCODE` | 统一社会信用代码 |
| `COMPANYTYPE` | 企业类型 |
| `LEGALPERSON` | 法定代表人 |
| `STATUS` | 企业状态 |
| `INDUSTRY`、`INDUSTRY_CODE`、`INDUSTRY_LEVEL` | 机构产业归属 |
| `TAGS`、`TAGLARG` | 机构标签 |
| `TRADE`、`TRADE_CODE` | 行业/经济行业分类 |
| `INTRO`、`ABSTRACT` | 简介/摘要 |

需要后端确认口径的字段：

| 字段 | 原因 |
| --- | --- |
| `QIKAN` | 前端按论文/期刊产出数量使用，字典中更接近 `paper_count`、`total_journal_articles` 等统计字段 |
| `ZHUANLI` | 前端按专利数量使用，字典中更接近 `patent_count` |
| `CHENGGUO` | 前端按成果数量使用，字典中更接近 `achievement_count` |
| `doc_id`、`match_count`、`matched_*`、`root_chain_name`、`updated_at` | 产业链匹配/索引元数据，不是底表业务字段 |

### `/api/chain-talents/search`、`/api/talents/search`

人才列表核心字段主要来自 `widi_scholar.csv`：

| 接口字段 | 字典来源/含义 |
| --- | --- |
| `ID` | `scholar.id` / ES `_source.ID` |
| `CNAME` | `scholar.name_zh` / ES 人才中文名 |
| `AORG` | 人才所属机构 |
| `ORGTYPE` | 机构类型 |
| `PROVINCE`、`CITY` | 人才所在地区 |
| `DIRECTION` | 研究方向 |
| `TITLE` | 职称/头衔，需后端确认具体映射到 `scholar_job_title.title_name` |
| `TAGLARG` | 人才标签 |
| `PHOTOPATH` | 照片 |
| `H` | H 指数 |

同样需要后端确认统计口径：

| 字段 | 原因 |
| --- | --- |
| `QIKAN` | 人才论文/期刊产出统计 |
| `ZHUANLI` | 人才专利产出统计 |
| `CHENGGUO` | 人才成果产出统计 |

### `/api/talents/{id}/graph`

该接口返回图谱结构字段：

| 接口字段 | 来源说明 |
| --- | --- |
| `nodes.id`、`nodes.name`、`nodes.org` | 来自人才、机构、技术、产业链节点等实体字段 |
| `nodes.class` | 图谱节点类型包装字段，例如 `PERSON/ORG/TECH/CHAIN` |
| `relations.startid`、`relations.endid`、`relations.type` | 图谱关系包装字段 |

这些字段属于图谱接口结构，不是单一业务底表字段。

### `/api/papers/list`

主要对应 `widi_chn_paper.csv`：

| 接口字段 | 字典来源/含义 |
| --- | --- |
| `id` | 论文 ID |
| `title` | 论文标题 |
| `doi` | DOI |
| `journal` | 期刊名称 |
| `publishYear` | 发表年份 |
| `authors` | 论文作者聚合 |

### `/api/patents/list`

主要对应 `widi_chn_patent.csv`：

| 接口字段 | 字典来源/含义 |
| --- | --- |
| `id` | 专利 ID |
| `title` | 专利标题 |
| `patentNo` | 专利号 |
| `patentType` | 专利类型 |
| `status` | 法律状态/状态 |
| `applyDate` | 申请日 |

### 聚合统计接口

这些接口字段不是底表字段，而是后端聚合结果：

| 接口 | 字段 |
| --- | --- |
| `/api/stats/industry-chain-total` | `enterpriseTotal`、`talentTotal`、`standardTotal` |
| `/api/chain-orgs/province-distribution` | `province`、`total` |
| `/api/chain-orgs/city-distribution` | `city/name`、`total/value` |
| `/api/chain-orgs/coverage-summary` | `totalNodes`、`coveredNodes`、`coverageRate`、`orgTotal` |
| `/api/chain-orgs/node-org-counts` | `name`、`total`、`children` |
| `/api/chain-talents/province-distribution` | `name/province`、`value/total` |
| `/api/chain-talents/city-distribution` | `name/city`、`value/total` |
| `/api/chain-talents/year-trend` | `years`、`papers`、`patents`、`standards` |

## 当前可用于和后端沟通的点

1. 企业标签筛选 `tags`：字段来源明确，对应机构标签，客户口径里可以按 `TAGS/TAGLARG` 或标签表去重值筛选。
2. 人才地区筛选：不要再用籍贯，应该使用 `PROVINCE/CITY` 这类当前所在地字段。
3. 产出统计字段：`QIKAN/ZHUANLI/CHENGGUO` 在接口里是旧 ES 风格展示名，建议后端明确返回含义，最好在接口文档里标注分别对应论文数、专利数、成果数。
4. 产业链匹配字段：`matched_*` 属于接口解释字段，适合前端展示匹配依据，但不能要求在客户业务表中存在同名字段。

## 本次接口样本检查备注

已用 TG 登录后临时请求代表接口，只记录字段名不保存 token。

样本请求中，`/api/chain-orgs/search`、`/api/chain-talents/search`、人才图谱、论文列表、专利列表、首页统计均能正常返回字段。

`/api/chain-orgs/coverage-summary?chain=人工智能` 和 `/api/chain-orgs/node-org-counts?chain=人工智能` 本次直接请求返回 500；该问题更像是后端当前索引/参数口径问题，不影响字段来源判断，但需要后端继续确认可用链名称和索引状态。
