<!-- FORMAT-DOC: Update when files in this folder change -->

# mock

Mock 数据层，提供所有业务数据与 TypeScript 接口定义。无异步请求，各页面通过 import 直接引用。

## Files

| File | Role | Responsibilities |
|---|---|---|
| data.ts | Schema | 全平台业务数据：产业链、企业、人才、技术、融资、政策等数据集 + TypeScript 接口定义（IndustryGraphNode 等） |
| industryChainGraphData.ts | Schema | 各产业链上中下游树形图谱数据（由 parseChainMd.ts 脚本自动生成） |
