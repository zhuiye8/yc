# 万方产品接口集成文档（宜昌产业人才地图）

> 整理日期：2026-03-27
> 测试环境：`http://119.36.242.222:8902`
> 数据来源：接口mapping.xlsx + 万方产品接口集成标准文档_武汉大学_20250307.pdf + 实测验证

---

## 0. 认证方式

### 获取 Token

```
POST http://119.36.242.222:8902/auth/token
Content-Type: application/json

{"username":"i3dev","secret":"woeuty#WHU!027"}
```

**响应示例：**
```json
{
  "accessToken": "sBsYrPFtyJfaR50a8O-zVy1lCfVTM32dMtkQS7z8PW8",
  "tokenType": "Bearer",
  "expiresIn": 7200
}
```

### 使用方式（重要！）

> **实测发现**：代理层要求使用 `Authorization: Bearer` 头，而不是文档中提到的 `X-Access-Token`。

```http
Authorization: Bearer <accessToken>
```

- Token 有效期 **7200 秒（2小时）**，过期后需重新获取
- 所有接口的 **Base URL** 为：`http://119.36.242.222:8902/api/wf/`

---

## 1. 接口总览与测试结果

| # | 调用名称 | 方法 | 状态 | 说明 |
|---|---------|------|------|------|
| 1 | preciseSearchWithin | GET | ✅ 可用 | 需提供有效indexName，否则返回201 |
| 2 | basicSearch | GET | ✅ 可用 | 文献基础检索 |
| 3 | findExpert-v1 | GET | ✅ 可用 | 同 findExpert-v2 |
| 4 | getOrgByName-v1 | GET | ✅ 可用 | 同 getOrgByName-v2 |
| 5 | findOrgByModelsDecode-v1 | GET | ⚠️ 500错误 | 后端服务异常 |
| 6 | getOutputIndicator | GET | ✅ 可用 | 仅科研机构类型有效 |
| 7 | getOrgIndicator | GET | ✅ 可用 | 企业评价指标 |
| 8 | getOrgOutputIndicator | GET | ✅ 可用 | 科研机构产出指标 |
| 9 | getTalentByQuery-v1 | GET | ⚠️ 205错误 | 参数格式异常，推荐用v2 |
| 10 | getExpertWithQuery | GET | ✅ 可用 | 专家条件检索 |
| 11 | getOrgWithQuery | GET | ✅ 可用 | 机构条件检索 |
| 12 | findExpertByModel | GET | ✅ 可用 | 需传 type（整数）参数 |
| 13 | findOrgByModelsDecode-v2 | GET | ⚠️ 500错误 | 后端服务异常 |
| 14 | findExpert-v2 | GET | ✅ 可用 | 技术词推荐专家 |
| 15 | getOrgByName-v2 | GET | ✅ 可用 | 机构名称检索 |
| 16 | graphSinglePersonRelation | GET | ✅ 可用 | 人物关系图谱 |
| 17 | cooperationORG | GET | ✅ 可用 | 专家合作机构统计 |
| 18 | getOrgRe | GET | ✅ 可用 | 机构关键技术相关度 |
| 19 | getTalentByQuery-v2 | GET | ✅ 可用 | 专家高级检索 |
| 20 | getCooperatePie | GET | ✅ 可用 | 科研合作统计 |
| 21 | findOrgByPost | GET | ✅ 可用 | 实为GET，机构推荐 |
| 22 | getOrgByJGName | GET | ✅ 可用 | 需传 pageNo+pageSize |
| 23 | resourceMapByTypeAreacode | GET | ⚠️ 需整数type | 区域创新热点分布 |
| 24 | iarStatistics | GET | ✅ 可用 | 产学研统计 |
| 25 | idsSearch | POST | ✅ 可用 | 参数放URL中而非Body |
| 26 | getCkeyInfo | GET | ✅ 可用 | 技术词简介 |
| 27 | getCkeyIndustry | GET | ✅ 可用 | 技术产业发展趋势 |
| 28 | getCkeyMap | GET | ✅ 可用 | 技术热点区域统计 |
| 29 | getCkeyMapInfo | GET | ✅ 可用 | 技术区域发展列表 |
| 30 | getCkeySubject | GET | ✅ 可用 | 科学渗透性 |
| 31 | getCkeyAbout | GET | ✅ 可用 | 技术相关度 |
| 32 | getjgInfoByID | GET | ✅ 可用 | 机构基础详情 |
| 33 | getOrgSummary | GET | ✅ 可用 | 机构信息汇总 |
| 34 | getPatentIPC | GET | ✅ 可用 | 专利IPC统计 |
| 35 | getOrgPatentPie | GET | ✅ 可用 | 专利类型分布 |
| 36 | getOrgPatentLine | GET | ✅ 可用 | 需传top参数（整数） |
| 37 | getExpertSummaryByKey | GET | ✅ 可用 | 专家技术词相关信息汇总 |
| 38 | getExpertSummary | GET | ✅ 可用 | 专家信息汇总 |
| 39 | talent-background | GET | ✅ 可用 | 专家人物背景 |
| 40 | talent-keyword | GET | ✅ 可用 | 专家研究方向 |
| 41 | talent-keyYear | GET | ✅ 可用 | 专家研究方向分布 |
| 42 | getExpertActive | GET | ✅ 可用 | 专家科研活跃度 |
| 43 | getExpertEffect | GET | ⚠️ 后端错误 | 部分情况500 |
| 44 | industryNode-queryById | GET | ✅ 可用 | 产业链节点详情 |
| 45 | industryNode-resources | POST | ⚠️ 需调查 | 参数传递问题 |
| 46 | industry-getOrgDistribution | POST | ❌ 404 | 代理未配置 |
| 47 | industry-getTalentDistribution | POST | ❌ 404 | 代理未配置 |
| 48 | talent-resourceStatistics | GET | ✅ 可用 | 区域资源统计 |
| 49 | nlp-wfrecognize | GET | ✅ 可用 | NLP文本识别 |
| 50 | widi-chat | GET | ✅ 可用 | AI问答 |
| 51 | neo4j-getDataByQuery | GET | ✅ 可用 | 知识图谱查询 |
| 52 | findOrgByText | GET | ✅ 可用 | 文本推荐机构 |
| 53 | getCkeyAchievement | GET | ✅ 可用 | 技术相关科技项目 |
| 54 | getYearCountByCKey | POST | ❌ 400 | 代理不支持此格式 |
| 55 | getOrgDistributionByCkey | POST | ❌ 400 | 代理不支持此格式 |
| 56 | widi-postChat | POST | ❌ 400 | 代理不支持此格式 |
| 57 | getFundByCkey | POST | ❌ 400 | 代理不支持此格式 |
| 58 | highValuePatentByCkey | POST | ❌ 400 | 代理不支持此格式 |
| 59 | excellentPaperByCkey | POST | ❌ 400 | 代理不支持此格式 |
| 60 | sciAchievementsList | GET | ✅ 可用 | 科技成果列表 |
| 61 | talent-techTree | GET | ✅ 可用 | 技术领域分类 |
| 62 | talent-locationRelationList | GET | ✅ 可用 | 科技乡贤列表 |
| 63 | talent-industryRelationTitle | GET | ❌ 400 | 代理未配置 |
| 64 | talent-industryRelationList | GET | ✅ 可用 | 业缘列表 |
| 65 | talent-industryRelationClue | GET | ✅ 可用 | 业缘线索 |
| 66 | talent-eduRelationTitle | GET | ❌ 400 | 代理未配置 |
| 67 | talent-eduRelationList | GET | ❌ 400 | 代理未配置 |
| 68 | talent-eduRelationClue | GET | ✅ 可用 | 学缘线索 |
| 69 | talent-coopOrgTitle | GET | ❌ 400 | 代理未配置 |
| 70 | talent-coopOrgList | GET | ❌ 400 | 代理未配置 |
| 71 | talent-coopOrgRule | GET | ❌ 400 | 代理未配置 |
| 72 | talent-coopTalentTitle | GET | ❌ 400 | 代理未配置 |
| 73 | talent-coopTalentList | GET | ❌ 400 | 代理未配置 |
| 74 | talent-coopTalentClue | GET | ✅ 可用 | 合作专家线索 |

---

## 2. 接口详细说明

### 2.1 文献/成果检索类

---

#### `basicSearch` — 文献基础检索
```
GET http://119.36.242.222:8902/api/wf/basicSearch
```
| 参数 | 必须 | 说明 |
|------|------|------|
| indexName | 是 | 索引库编码，如 `10001,10002,10003,10004` |
| from | 是 | 起始位置，从0开始 |
| size | 是 | 返回条数 |
| must | 否 | 必须匹配，如 `TITLE:人工智能` |
| should | 否 | 可能匹配（OR逻辑） |
| mustNot | 否 | 必须不匹配 |
| queryString | 否 | 检索式（含逻辑运算符） |
| range | 否 | 范围查询，如 `{"DATE":{"gte":"2024-1-1","lte":"2025-1-1"}}` |
| filter | 否 | 过滤字段 |
| aggFields | 否 | 聚合字段 |
| aggSize | 否 | 聚合数量 |
| includes | 否 | 返回字段（逗号分隔） |
| excludes | 否 | 排除字段 |
| sortField | 否 | 排序字段，如 `DATE.D`（降序） |

**索引库编码对照：**
| 编码 | 内容 |
|------|------|
| 10001 | 中文期刊 |
| 10002 | 会议论文 |
| 10003 | 学位论文 |
| 10004 | 中文专利 |
| 10005 | 技术标准 |
| 10006 | 科技成果 |
| 10015 | 科研项目 |
| 10016 | 国际专利 |
| 10082 | 产学研合作 |
| 10100 | 产业园区 |
| 10101 | 双创载体 |
| 10109 | 创新平台 |
| 100681 | 企业（机构） |
| 100682 | 高校院所 |
| 90003 | 专家人才 |

**请求示例：**
```
from=0&size=10&sortField=DATE.D&indexName=10001,10002,10003,10004&must=TITLE:人工智能&range={"DATE":{"gte":"2024-1-1","lte":"2025-1-1"}}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "SUCCESS",
  "data": {
    "_shards": {"total":59, "failed":0, "successful":59},
    "hits": {
      "total": 309,
      "hits": [{"_index":"wf_mds_chn_qikan_v20240223","_source":{...}}]
    },
    "took": 1924
  }
}
```

---

#### `idsSearch` — 根据ID查询文献
```
POST http://119.36.242.222:8902/api/wf/idsSearch
```
> ⚠️ 实测需要用 GET 请求（proxy层问题），参数放URL中

| 参数 | 必须 | 说明 |
|------|------|------|
| ids | 否 | 文献ID，多个逗号分隔 |
| indexName | 否 | 索引库编码 |
| includes | 否 | 返回字段 |

**请求示例：**
```
GET /idsSearch?ids=QKC20242024102800028892&indexName=10001,10002,10003
```

---

#### `preciseSearchWithin` — 精准检索
```
GET http://119.36.242.222:8902/api/wf/preciseSearchWithin
```
> ⚠️ 不传 indexName 时返回 code:201"找不到有效的索引名"；需指定有效索引

| 参数 | 必须 | 说明 |
|------|------|------|
| key | 是 | 关键词 |
| indexName | 否 | 索引库编码 |
| from | 否 | 起始位置 |
| size | 否 | 返回条数 |

---

### 2.2 专家/人才检索类

---

#### `findExpert-v1` / `findExpert-v2` — 技术词推荐专家
```
GET http://119.36.242.222:8902/api/wf/findExpert-v1
GET http://119.36.242.222:8902/api/wf/findExpert-v2
```
两个接口相同，推荐使用 `findExpert-v2`。

| 参数 | 必须 | 说明 |
|------|------|------|
| key | 是 | 关键词（技术词/专家名） |
| from | 是 | 起始位置，从0开始 |
| size | 是 | 返回条数 |
| type | 否 | 检索类型：0（默认TITLE+KEYWORD），1（TITLE），2（KEYWORD），3（ABSTRACT） |
| queryString | 否 | 检索式，如 `ORGID:XXX` 限定机构 |
| prov | 否 | 省份 |
| city | 否 | 城市 |
| orgType | 否 | 机构类型：QY（企业）、GX（高校）、KY（科研机构） |
| sort | 否 | 排序字段 |

**响应示例：**
```json
{
  "took": 0,
  "ckey": "\"无人机\"",
  "code": 200,
  "data": {
    "expertsRecommend": [{
      "CNAME": "陈建伟",
      "ID": "L47000667",
      "AORG": "广东容祺智能科技有限公司",
      "ZHUANLI": 307,
      "QIKAN": 2,
      "CHANXUEYANHZQY": 289,
      "score": 1281.0,
      "KEYWORDS": [{"NUM":161,"KEYWORD":"无人机"}],
      "TAGS": [],
      "TITLE": []
    }],
    "total": 100718,
    "took": 838
  },
  "message": "SUCCESS",
  "type": "ckey"
}
```

---

#### `findExpertByModel` — 根据技术词推荐专家（精品模型）
```
GET http://119.36.242.222:8902/api/wf/findExpertByModel
```
> ⚠️ `type` 参数必传且为整数（不传会报错）

| 参数 | 必须 | 说明 |
|------|------|------|
| key | 否 | 关键词 |
| type | 是 | 整数，0=默认 |
| from | 否 | 起始位置 |
| size | 否 | 返回条数 |
| prov | 否 | 省份 |
| city | 否 | 城市 |
| orgType | 否 | 机构类型 |
| queryString | 否 | 检索式 |

---

#### `getExpertWithQuery` — 专家条件检索
```
GET http://119.36.242.222:8902/api/wf/getExpertWithQuery
```

| 参数 | 必须 | 说明 |
|------|------|------|
| name | 否 | 专家姓名 |
| areacode | 否 | 区域代码，如 `110000` |
| prov | 否 | 省份简称 |
| city | 否 | 城市简称 |
| orgType | 否 | 机构类型 GX / QY / KY |
| queryString | 否 | 检索式（如 `PROVINCE:湖北` 等） |
| includes | 否 | 返回字段 |
| from | 否 | 起始位置 |
| size | 否 | 返回条数 |
| sort | 否 | 排序字段 |

**响应示例：**
```json
{
  "code": 200,
  "message": "SUCCESS",
  "data": {
    "sources": [{
      "indexId": 90003,
      "source": {
        "CNAME": "李伟",
        "ID": "L05672258",
        "AORG": "中国科学院",
        "PROVINCE": "北京",
        "CITY": "北京",
        "ORGTYPE": "KY",
        "DIRECTION": "遥感图像处理、模式识别、机器学习等",
        "H": 6,
        "ZHUANLI": 696,
        "QIKAN": 855
      }
    }],
    "total": 160,
    "took": 206
  }
}
```

---

#### `getTalentByQuery-v2` — 专家高级检索（推荐）
```
GET http://119.36.242.222:8902/api/wf/getTalentByQuery-v2
```
> ✅ 推荐使用此版本（v1版本存在参数异常）

| 参数 | 必须 | 说明 |
|------|------|------|
| queryString | 是 | 检索式，如 `PROVINCE:湖北`、`CNAME:张三`、`AREACODE:42*` |
| from | 是 | 起始位置 |
| size | 是 | 返回条数 |
| includes | 是 | 返回字段，多个逗号分隔，如 `ID,CNAME,AORG,PROVINCE,TITLE` |
| sortField | 否 | 排序字段，如 `CNT.D`（活跃度降序） |

**常用字段说明：**
- `ID`: 专家ID（用于其他接口查询）
- `CNAME`: 中文姓名
- `AORG`: 所属机构
- `PROVINCE`: 省份
- `CITY`: 城市
- `ORGTYPE`: 机构类型
- `TITLE`: 职称
- `TITLE_LEVEL`: 职称级别（正高级/副高级等）
- `ZHUANLI`: 专利数
- `QIKAN`: 期刊数
- `XIANGMU`: 项目数
- `BIAOZHUN`: 标准数
- `CHANXUEYANHZQY`: 产学研合作（企业）
- `TAGS`: 标签（如硕博导师、领军人才等）
- `HORNOR`: 荣誉

---

#### `graphSinglePersonRelation` — 人物关系图谱
```
GET http://119.36.242.222:8902/api/wf/graphSinglePersonRelation
```
> ⚠️ 参数名区分大小写

| 参数 | 必须 | 说明 |
|------|------|------|
| AUID1 | 是 | 专家ID，如 `L21446958` |
| Level | 是 | 层级数，如 `1` |
| NodeCount | 是 | 返回节点数，如 `20` |

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "sources": {
      "nodes": [
        {"id":"L21446958","name":"郑胜","org":"武汉大学","class":"PERSON","type":"NODE","h":4},
        {"id":"EI026670","name":"武汉大学电子信息学院","class":"ORG","type":"NODE","attr":"EI"}
      ],
      "edges": [...]
    }
  }
}
```

---

#### `cooperationORG` — 专家合作机构统计
```
GET http://119.36.242.222:8902/api/wf/cooperationORG
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auid | 否 | 专家ID |
| name | 否 | 专家姓名 |
| org | 否 | 机构名称 |
| ckey | 否 | 技术词 |

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "aggregations": {
      "orgc": {
        "buckets": [
          {"key":"南京航空航天大学","doc_count":90378}
        ]
      }
    }
  }
}
```

---

### 2.3 机构检索类

---

#### `getOrgByName-v1` / `getOrgByName-v2` — 机构名称检索
```
GET http://119.36.242.222:8902/api/wf/getOrgByName-v1
GET http://119.36.242.222:8902/api/wf/getOrgByName-v2
```

| 参数 | 必须 | 说明 |
|------|------|------|
| org | 是 | 机构名称 |
| pageNo | 是 | 页码（从1开始） |
| pageSize | 是 | 每页数量 |
| prov | 否 | 省份 |
| city | 否 | 城市 |
| orgType | 否 | 机构类型 QY/GX/KY |
| sort | 否 | 排序字段 |

**响应示例：**
```json
{
  "took": 353,
  "hits": {
    "total": 94,
    "hits": [{
      "_source": {
        "id": "N00730",
        "name": "武汉大学测试中心",
        "orgtype": "高校",
        "prov": "湖北",
        "city": "武汉",
        "mark": 108
      }
    }]
  }
}
```

---

#### `getOrgWithQuery` — 机构条件检索
```
GET http://119.36.242.222:8902/api/wf/getOrgWithQuery
```

| 参数 | 必须 | 说明 |
|------|------|------|
| name | 否 | 机构名称 |
| orgType | 否 | 机构类型 |
| prov | 否 | 省份 |
| city | 否 | 城市 |
| areacode | 否 | 区域代码 |
| queryString | 否 | 检索式，支持：STATUS:(存续 OR 在业)、YEAR:[2020 TO 2025]、TAGLARG:荣誉_世界500强 |
| from | 否 | 起始位置 |
| size | 否 | 返回条数 |
| sort | 否 | 排序字段 |

---

#### `getOrgByJGName` — 根据名称精确查找机构（精品库）
```
GET http://119.36.242.222:8902/api/wf/getOrgByJGName
```
> ⚠️ `pageNo` 和 `pageSize` 必须传入

| 参数 | 必须 | 说明 |
|------|------|------|
| jgName | 否 | 机构名称 |
| pageNo | 是 | 页码（整数） |
| pageSize | 是 | 每页数量（整数） |
| prov | 否 | 省份 |
| city | 否 | 城市 |
| orgType | 否 | 机构类型 |
| industry | 否 | 所属行业 |
| sort | 否 | 排序字段 |

---

#### `findOrgByText` — 文本推荐机构
```
GET http://119.36.242.222:8902/api/wf/findOrgByText
```

| 参数 | 必须 | 说明 |
|------|------|------|
| text | 否 | 文本内容 |
| from | 否 | 起始位置 |
| size | 否 | 返回条数 |

---

#### `findOrgByPost` — 机构推荐（通用模型）
```
GET http://119.36.242.222:8902/api/wf/findOrgByPost
```
> ⚠️ 文档标注为POST，但实测 GET 方式参数放URL才能正常工作

| 参数 | 必须 | 说明 |
|------|------|------|
| text | 否 | 关键词文本 |
| queryString | 否 | 检索式，如 `ORGTYPE:QY` |
| from | 否 | 起始位置 |
| recommendOrgSize | 否 | 推荐机构数量 |
| model | 否 | 模型编号，0=默认 |
| type | 否 | 类型，0=默认 |
| sort | 否 | 排序 |

---

#### `getjgInfoByID` — 根据ID查机构
```
GET http://119.36.242.222:8902/api/wf/getjgInfoByID
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgID | 否 | 机构ID，如 `LN463142` |

**响应示例：**
```json
{
  "hits": {
    "hits": [{
      "_source": {
        "ORGID": "LN463142",
        "NAME": "彩虹无人机科技有限公司",
        "ORGTYPE": "QY",
        "PROV": "浙江",
        "STATUS": "存续",
        "INDUSTRY": ["航空装备产业","人工智能"],
        "TAGS": ["国家高新技术企业"],
        "rating_level": "AA",
        "MARK": 1936.8,
        "FUND": "100272.41万人民币"
      }
    }]
  }
}
```

---

#### `getOrgSummary` — 机构信息汇总（科研统计）
```
GET http://119.36.242.222:8902/api/wf/getOrgSummary
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgID | 否 | 机构ID |
| org | 否 | 机构名称 |
| ckeys | 否 | 技术词 |
| type | 否 | 叠加检索类型：1=TITLE，2=KEYWORD，3=ABSTRACT |

**响应示例：**
```json
{
  "科技成果All": 0,
  "基金项目All": 0,
  "专利All": 428,
  "科技论文All": 112,
  "技术骨干All": 195
}
```

---

#### `getOrgIndicator` — 企业评价指标
```
GET http://119.36.242.222:8902/api/wf/getOrgIndicator
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgId | 是 | 机构ID（企业类型） |

**响应：** 返回企业综合评分、研发实力、市场竞争力等多维指标。

---

#### `getOrgOutputIndicator` — 科研机构产出指标
```
GET http://119.36.242.222:8902/api/wf/getOrgOutputIndicator
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgId | 是 | 机构ID（高校/科研机构类型） |

**主要返回字段：**
- `OUTPUT_PATENT_INVENT`: 发明专利数
- `OUTPUT_JOURNAL_TOTAL`: 期刊论文总数
- `OUTPUT_JOURNAL_CORE`: 核心期刊数
- `OUTPUT_MEETING_TOTAL`: 会议论文数
- `OUTPUT_STANDARD_TOTAL`: 标准总数
- `OUTPUT_STANDARD_NATION`: 国家标准数
- `OUTPUT_PROJECT_TOTAL`: 项目总数
- `OUTPUT_INDUSTRY_UNIVERSITY_RESEARCH`: 产学研合作数
- `OUTPUT_CSTAD_TOTAL`: 科技成果数
- `MARK`: 创新指数

---

#### `getPatentIPC` — 专利IPC分类统计
```
GET http://119.36.242.222:8902/api/wf/getPatentIPC
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgID | 否 | 机构ID |
| org | 否 | 机构名称 |
| ckeys | 否 | 技术词 |
| type | 否 | 叠加检索类型 |

**响应示例：**
```json
{
  "key": ["计算；推算；计数","控制；调节","飞行器；航空；宇宙航行"],
  "value": [19, 41, 198]
}
```

---

#### `getOrgPatentPie` — 专利类型分布
```
GET http://119.36.242.222:8902/api/wf/getOrgPatentPie
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgID | 否 | 机构ID |
| org | 否 | 机构名称 |
| ckeys | 否 | 技术词 |
| type | 否 | 叠加检索类型 |

**响应示例：**
```json
{"patt": {"发明专利": 246, "实用新型": 180, "外观设计": 2}}
```

---

#### `getOrgPatentLine` — 机构专利年度分布
```
GET http://119.36.242.222:8902/api/wf/getOrgPatentLine
```
> ⚠️ `top` 参数必传（整数），不传会报错

| 参数 | 必须 | 说明 |
|------|------|------|
| orgID | 否 | 机构ID |
| org | 否 | 机构名称 |
| top | 是 | 返回近N年，整数，如 `10` |
| ckeys | 否 | 技术词 |
| type | 否 | 叠加检索类型 |

**响应示例：**
```json
{"year": {"2024":75,"2023":59,"2022":59,"2021":85,"2020":60}}
```

---

#### `getOrgRe` — 机构关键技术相关度
```
GET http://119.36.242.222:8902/api/wf/getOrgRe
```

| 参数 | 必须 | 说明 |
|------|------|------|
| orgID | 否 | 机构ID |
| org | 否 | 机构名称 |
| ckeys | 否 | 技术词 |
| type | 否 | 检索类型 |

**响应示例：**
```json
{
  "key": ["无人机","发动机","飞行器","控制器"],
  "value": [1770, 400, 190, 70]
}
```

---

#### `getCooperatePie` — 科研合作机构统计
```
GET http://119.36.242.222:8902/api/wf/getCooperatePie
```

| 参数 | 必须 | 说明 |
|------|------|------|
| org | 否 | 机构名称 |
| orgID | 否 | 机构ID |
| ckeys | 否 | 技术词 |
| type | 否 | 检索类型 |

**响应示例：**
```json
{
  "orgc": {
    "南京航空航天大学": 90378,
    "浙江大学医学院": 28127
  },
  "total": 99
}
```

---

#### `iarStatistics` — 产学研统计
```
GET http://119.36.242.222:8902/api/wf/iarStatistics
```

| 参数 | 必须 | 说明 |
|------|------|------|
| areacode | 否 | 区域代码，如 `440000`（广东），支持通配符 `44*` |
| queryString | 否 | 检索式 |
| facetField | 否 | 聚合字段 |
| aggSize | 否 | 聚合数量 |

---

#### `resourceMapByTypeAreacode` — 区域创新热点分布
```
GET http://119.36.242.222:8902/api/wf/resourceMapByTypeAreacode
```
> ⚠️ `type` 参数必须为整数（如6），不能为字符串

| 参数 | 必须 | 说明 |
|------|------|------|
| areacode | 否 | 区域代码，支持通配符 `44*` |
| type | 是 | 整数类型，如 `6` |
| facetField | 否 | 聚合字段，如 `ORGCITY` |
| field | 否 | 字段，如 `CITY` |
| aggSize | 否 | 聚合数量 |

---

### 2.4 专家详情类

---

#### `getExpertSummary` — 专家信息汇总
```
GET http://119.36.242.222:8902/api/wf/getExpertSummary
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auid | 否 | 专家ID |

**响应示例：**
```json
{
  "专利All": 15,
  "科技论文All": 90,
  "基金项目All": 1,
  "基金项目金额All": 3500,
  "科技成果All": 0,
  "产学研合作All": 27
}
```

---

#### `getExpertSummaryByKey` — 专家+技术词相关信息汇总
```
GET http://119.36.242.222:8902/api/wf/getExpertSummaryByKey
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auid | 否 | 专家ID |
| name | 否 | 专家姓名 |
| ckey | 否 | 技术词 |
| org | 否 | 机构名称 |
| type | 否 | 类型 |

**响应示例：**
```json
{"科技成果": 4, "基金项目": 0, "科技论文": 17, "专利": 43}
```

---

#### `talent-background` — 专家人物背景
```
GET http://119.36.242.222:8902/api/wf/talent-background
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auid | 否 | 专家ID |

**响应字段：**
- `CATE`: 学科分类
- `INTRO`: 简介
- `EDU`: 教育背景
- `HORNORS`: 荣誉称号
- `EMAIL`: 联系邮箱
- `NATIVESHENG`: 籍贯省份

---

#### `talent-keyword` — 专家研究方向列表
```
GET http://119.36.242.222:8902/api/wf/talent-keyword
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auid | 否 | 专家ID |

**响应示例：**
```json
{
  "code": 200,
  "data": ["机器人","工业机器人","移动机器人","DSP"]
}
```

---

#### `talent-keyYear` — 专家研究方向年度分布
```
GET http://119.36.242.222:8902/api/wf/talent-keyYear
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auid | 否 | 专家ID |

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {"key":"机器人","year":[{"key":2006,"count":4},{"key":2000,"count":4}]},
    {"key":"工业机器人","year":[{"key":2007,"count":1}]}
  ]
}
```

---

#### `getExpertActive` — 专家科研活跃度
```
GET http://119.36.242.222:8902/api/wf/getExpertActive
```

| 参数 | 必须 | 说明 |
|------|------|------|
| auIds | 否 | 专家ID（多个逗号分隔） |
| name | 否 | 专家姓名 |
| ckeys | 否 | 关键词 |
| org | 否 | 机构 |
| type | 否 | 类型 |

**响应示例：**
```json
{
  "key": ["1985","1990","2000","2010","2020","2024"],
  "count": [1,3,8,72,31,13]
}
```

---

### 2.5 技术词（ckey）分析类

---

#### `getCkeyInfo` — 技术词基础简介
```
GET http://119.36.242.222:8902/api/wf/getCkeyInfo
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词，如 `人工智能` |

**响应示例：**
```json
{
  "result": [{
    "id": "BaiKeBd201302260000679564",
    "cn": "人工智能",
    "dt": "基本简介人工智能..."
  }]
}
```

---

#### `getCkeyIndustry` — 技术产业发展趋势
```
GET http://119.36.242.222:8902/api/wf/getCkeyIndustry
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词 |

**响应说明：** 返回 `g`（专利）、`h`（标准）、`b`（成果）三类数据的年度趋势。

---

#### `getCkeyMap` — 技术热点区域统计
```
GET http://119.36.242.222:8902/api/wf/getCkeyMap
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词 |

**响应示例：**
```json
[
  {"name": "北京", "value": 3723},
  {"name": "江苏", "value": 3139}
]
```

---

#### `getCkeyMapInfo` — 技术区域详情列表
```
GET http://119.36.242.222:8902/api/wf/getCkeyMapInfo
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词 |

**响应示例：**
```json
{
  "result": [
    {"name":"北京","count":3723,"patent":29807,"money":0,"base":42782}
  ]
}
```

---

#### `getCkeySubject` — 科学渗透性
```
GET http://119.36.242.222:8902/api/wf/getCkeySubject
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词 |

**响应示例：**
```json
{
  "key": ["r","d","f","g","t"],
  "value": [176330, 179610, 600630, 841210, 1168340]
}
```

---

#### `getCkeyAbout` — 技术相关度
```
GET http://119.36.242.222:8902/api/wf/getCkeyAbout
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词 |

**响应示例：**
```json
{
  "key": ["人工智能技术","大数据","深度学习","机器学习"],
  "value": [171750, 93020, 68260, 61100]
}
```

---

#### `getCkeyAchievement` — 技术相关科技项目列表
```
GET http://119.36.242.222:8902/api/wf/getCkeyAchievement
```

| 参数 | 必须 | 说明 |
|------|------|------|
| ckey | 是 | 技术词 |
| pageNo | 是 | 页码（整数） |
| pageSize | 是 | 每页数量（整数） |
| prov | 否 | 省份 |
| city | 否 | 城市 |
| orgType | 否 | 机构类型 |
| sort | 否 | 排序 |

---

### 2.6 产业链类

---

#### `industryNode-queryById` — 查询产业链节点详情
```
GET http://119.36.242.222:8902/api/wf/industryNode-queryById
```

| 参数 | 必须 | 说明 |
|------|------|------|
| id | 是 | 产业链节点ID，如 `1846393924538863618` |

**响应示例：**
```json
{
  "success": true,
  "code": 200,
  "result": {
    "id": "1846393924538863618",
    "name": "乙烯",
    "pid": "1846392767049371650",
    "hasChild": "1",
    "type": 2,
    "levelId": "001021001",
    "description": "乙烯产业链从原油或天然气中提取...",
    "queryString": "",
    "wireframeData": "..."
  }
}
```

---

#### `industryNode-resources` — 产业链资源列表
```
POST http://119.36.242.222:8902/api/wf/industryNode-resources
```
> ⚠️ 实测 POST 请求参数传递存在问题，建议联系运维排查代理配置

**参数（需在URL中或Body中传递）：**
| 参数 | 必须 | 说明 |
|------|------|------|
| indexCode | 是 | 索引库编码：100681企业、100682高校、90003专家、10015项目、10006成果、10004专利 |
| industryId | 否 | 产业链ID（与nodeId二选一） |
| nodeId | 否 | 节点ID |
| nodeName | 否 | 节点名称 |
| pageNo | 否 | 页码，默认1 |
| pageSize | 否 | 每页数量，默认10 |
| dataRange | 否 | 数据范围：1=上链已发布，2=重点数据，3=全部 |
| filter | 否 | 筛选条件，如 `ORGTYPE:GX`（仅高校） |

---

### 2.7 区域资源统计类

---

#### `talent-resourceStatistics` — 区域资源统计
```
GET http://119.36.242.222:8902/api/wf/talent-resourceStatistics
```

| 参数 | 必须 | 说明 |
|------|------|------|
| queryString | 否 | 检索式，如 `AREACODE:42*`（湖北省） |

**响应示例：**
```json
{
  "创新机构": 115526,
  "科技成果": 63584,
  "科技文献": 2424705,
  "创新载体": 346,
  "科研项目": 97386,
  "产业园区": 8073,
  "创新人才": 1133801,
  "知识产权": 2658543,
  "技术标准": 19751
}
```

---

#### `talent-locationRelationList` — 科技乡贤列表
```
GET http://119.36.242.222:8902/api/wf/talent-locationRelationList
```

| 参数 | 必须 | 说明 |
|------|------|------|
| areaStr | 否 | 地区名称，如 `宜昌市` |
| queryString | 否 | 检索式 |
| pageNo | 否 | 页码 |
| pageSize | 否 | 每页数量 |

---

#### `talent-industryRelationList` — 业缘人才列表（按工作地区）
```
GET http://119.36.242.222:8902/api/wf/talent-industryRelationList
```

| 参数 | 必须 | 说明 |
|------|------|------|
| areaStr | 否 | 地区名称 |
| queryString | 否 | 检索式（如机构名称） |
| nested | 否 | 嵌套检索 |
| pageNo | 否 | 页码 |
| pageSize | 否 | 每页数量 |

---

#### `talent-industryRelationClue` — 业缘线索
```
GET http://119.36.242.222:8902/api/wf/talent-industryRelationClue
```

| 参数 | 必须 | 说明 |
|------|------|------|
| id | 否 | 学者ID |
| areaStr | 否 | 区域 |

---

#### `talent-eduRelationClue` — 学缘线索
```
GET http://119.36.242.222:8902/api/wf/talent-eduRelationClue
```

| 参数 | 必须 | 说明 |
|------|------|------|
| id | 否 | 学者ID |
| areaStr | 否 | 区域 |

---

#### `talent-coopTalentClue` — 合作专家线索
```
GET http://119.36.242.222:8902/api/wf/talent-coopTalentClue
```

| 参数 | 必须 | 说明 |
|------|------|------|
| id | 否 | 学者ID |
| areaStr | 否 | 区域 |

---

### 2.8 AI/知识图谱类

---

#### `widi-chat` — AI 问答（单次）
```
GET http://119.36.242.222:8902/api/wf/widi-chat
```
> ⚠️ 实测为GET，文档标注为POST，参数放URL中

| 参数 | 必须 | 说明 |
|------|------|------|
| text | 否 | 问题文本，如 `宜昌绿色化工产业发展现状` |

**响应示例：**
```json
{
  "success": true,
  "code": 200,
  "result": "{\"技术成果价值\": [\"推动区域产业数字化转型\"]}"
}
```

---

#### `neo4j-getDataByQuery` — 知识图谱查询
```
GET http://119.36.242.222:8902/api/wf/neo4j-getDataByQuery
```

| 参数 | 必须 | 说明 |
|------|------|------|
| query | 否 | 查询文本，如 `人工智能` |
| limit | 是 | 返回数量（整数），不传会报错 |

**响应示例：**
```json
{
  "success": true,
  "code": 200,
  "result": {
    "expert": [
      {"score": 1740.8, "CNAME": "陈庆", "ID": "L04140481"}
    ]
  }
}
```

---

#### `nlp-wfrecognize` — NLP实体识别
```
GET http://119.36.242.222:8902/api/wf/nlp-wfrecognize
```

| 参数 | 必须 | 说明 |
|------|------|------|
| text | 否 | 待识别文本 |

**响应示例：**
```json
{
  "author": [],
  "organization": [],
  "keyword": ["新能源技术"]
}
```

---

### 2.9 科技成果/技术树类

---

#### `sciAchievementsList` — 科技成果列表
```
GET http://119.36.242.222:8902/api/wf/sciAchievementsList
```

| 参数 | 必须 | 说明 |
|------|------|------|
| areacode | 否 | 区域代码 |
| pageNo | 否 | 页码 |
| pageSize | 否 | 每页数量 |
| queryString | 否 | 检索式 |

---

#### `talent-techTree` — 技术领域分类树
```
GET http://119.36.242.222:8902/api/wf/talent-techTree
```

| 参数 | 必须 | 说明 |
|------|------|------|
| queryString | 否 | 检索式 |

---

## 3. 代理层已知问题（❌ 400/404接口）

以下接口在代理层（`http://119.36.242.222:8902`）存在配置问题，无法直接调用：

| 接口 | 原始路径 | 问题描述 |
|------|---------|---------|
| getYearCountByCKey | POST /ckey/getYearCountByCKey | 代理不支持此POST格式，返回400 |
| getOrgDistributionByCkey | POST /ckey/getOrgDistributionByCkey | 同上 |
| getFundByCkey | POST /ckey/getFundByCkey | 同上 |
| highValuePatentByCkey | POST /ckey/highValuePatentByCkey | 同上 |
| excellentPaperByCkey | POST /ckey/excellentPaperByCkey | 同上 |
| widi-postChat | POST /third/ali/stream/postChat | 同上 |
| industry-getOrgDistribution | POST /industry/getOrgDistribution | 代理未配置路由，返回404 |
| industry-getTalentDistribution | POST /industry/getTalentDistribution | 同上 |
| talent-industryRelationTitle | GET /talent/industryRelationTitle | 代理路由问题，返回400 |
| talent-eduRelationTitle | GET /talent/eduRelationTitle | 同上 |
| talent-eduRelationList | GET /talent/eduRelationList | 同上 |
| talent-coopOrgTitle | GET /talent/coopOrgTitle | 同上 |
| talent-coopOrgList | GET /talent/coopOrgList | 同上 |
| talent-coopOrgRule | GET /talent/coopOrgRule | 同上 |
| talent-coopTalentTitle | GET /talent/coopTalentTitle | 同上 |
| talent-coopTalentList | GET /talent/coopTalentList | 同上 |

**建议：** 与万方技术支持联系，修复代理层路由配置。对于这些接口，可以考虑绕过代理直接调用原始服务地址（需要X-Access-Token方式鉴权）。

---

## 4. 外部接口（cstservice.cn）

以下接口来自 `www.cstservice.cn`，使用不同的鉴权和协议，需单独处理：

| 接口名称 | URL |
|---------|-----|
| ckeyController-toCkeyParam | https://webstads.sciinfo.cn/ckeyController.do?toCkeyParam |
| industrialChain-personOne | https://www.cstservice.cn/Chain/IndustrialChain/PersonOne |
| cxyCooperate | https://www.cstservice.cn/area/cxyCooperate |
| personMap | https://www.cstservice.cn/person/PersonMap |
| expert | https://www.cstservice.cn/report/expert |
| information | https://www.cstservice.cn/company/information |
| provMap | https://www.cstservice.cn/resource/provMap |
| skillAgent-searchInfo | https://www.cstservice.cn/skillAgent/searchInfo |
| expertBack | https://www.cstservice.cn/expertBack |
| starEnterprise | https://www.cstservice.cn/database/starEnterprise |

> 这些接口的具体鉴权方式、参数格式尚未确认，需要单独对接。

---

## 5. 关键发现与对接建议

### 5.1 鉴权差异（重要！）
- 原始万方文档要求 `X-Access-Token` 头
- 代理层（8902端口）**实际要求** `Authorization: Bearer <token>`
- 直接调用万方原始服务可能需要 `X-Access-Token`

### 5.2 POST接口的特殊情况
- `findOrgByPost`：文档标POST，实际GET可用
- `idsSearch`：文档标POST，实际需要参数在URL而非Body
- `getYearCountByCKey` 等 POST 接口：代理层不支持，需修复

### 5.3 必须传整数的参数
| 接口 | 参数 | 说明 |
|------|------|------|
| findExpertByModel | type | 必须整数，如 0 |
| getOrgPatentLine | top | 必须整数，如 10 |
| resourceMapByTypeAreacode | type | 必须整数，如 6 |
| neo4j-getDataByQuery | limit | 必须整数，如 5 |
| getOrgByJGName | pageNo, pageSize | 必须整数 |

### 5.4 速率限制
接口存在限流，连续快速请求会返回 **429 Too Many Requests**，建议请求间隔 1 秒以上。

### 5.5 区域代码说明
- 宜昌市：`420500`
- 湖北省：`42*` 或 `420000`
- 使用 `AREACODE:42*` 可匹配整个湖北省

---

## 6. 快速接入示例

### 获取Token并查询湖北省专家
```javascript
// 1. 获取Token
const tokenRes = await fetch('http://119.36.242.222:8902/auth/token', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'i3dev', secret: 'woeuty#WHU!027'})
});
const {accessToken} = await tokenRes.json();

// 2. 查询湖北省专家
const headers = {Authorization: `Bearer ${accessToken}`};
const params = new URLSearchParams({
  queryString: 'AREACODE:42*',
  from: '0',
  size: '10',
  includes: 'ID,CNAME,AORG,PROVINCE,TITLE,TAGS',
  sortField: 'CNT.D'
});
const res = await fetch(
  `http://119.36.242.222:8902/api/wf/getTalentByQuery-v2?${params}`,
  {headers}
);
const data = await res.json();
```

### 查询技术词分析（人工智能）
```javascript
const ckey = encodeURIComponent('人工智能');
// 技术简介
fetch(`/api/wf/getCkeyInfo?ckey=${ckey}`, {headers});
// 技术热点区域
fetch(`/api/wf/getCkeyMap?ckey=${ckey}`, {headers});
// 相关技术
fetch(`/api/wf/getCkeyAbout?ckey=${ckey}`, {headers});
// 产业发展趋势
fetch(`/api/wf/getCkeyIndustry?ckey=${ckey}`, {headers});
```
