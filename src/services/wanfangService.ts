/**
 * 万方数据接口封装
 * 提供类型化的 API 调用方法，并将返回字段适配为前端所需格式
 */
import { wfGet } from './apiClient';

// ─── 专家/人才 ───────────────────────────────────────────────────────────────

export interface WfExpert {
  ID: string;
  CNAME: string;
  AORG: string;
  ORGTYPE?: string;    // GX=高校 QY=企业 KY=科研院所
  PROVINCE?: string;
  CITY?: string;
  TITLE?: string;
  TITLE_LEVEL?: string;
  H?: number;
  ZHUANLI?: number;
  QIKAN?: number;
  XIANGMU?: number;
  BIAOZHUN?: number;
  CHANXUEYANHZQY?: number;
  TAGS?: Array<{ TAG?: string; VALUE?: string } | string>;
  DIRECTION?: string;
  HORNOR?: string;
}

interface ExpertQueryResponse {
  code: number;
  data?: {
    sources?: Array<{ source?: WfExpert }>;
    total?: number;
  };
}

interface FindExpertResponse {
  code: number;
  data?: {
    expertsRecommend?: WfExpert[];
    total?: number;
  };
}

/** 按技术词检索专家（findExpert-v2） */
export async function findExpertByKey(
  key: string,
  from = 0,
  size = 20,
  city?: string,
  prov?: string,
  orgType?: string,
): Promise<WfExpert[]> {
  const params: Record<string, string | number> = { key, from, size };
  if (city) params.city = city;
  if (prov) params.prov = prov;
  if (orgType) params.orgType = orgType;
  const res = await wfGet<FindExpertResponse>('findExpert-v2', params);
  return res.data?.expertsRecommend ?? [];
}

/** 专家条件检索（getExpertWithQuery） */
export async function queryExperts(opts: {
  name?: string;
  prov?: string;
  city?: string;
  orgType?: string;
  queryString?: string;
  from?: number;
  size?: number;
}): Promise<WfExpert[]> {
  const params: Record<string, string | number> = {
    from: opts.from ?? 0,
    size: opts.size ?? 20,
  };
  if (opts.name) params.name = opts.name;
  if (opts.prov) params.prov = opts.prov;
  if (opts.city) params.city = opts.city;
  if (opts.orgType) params.orgType = opts.orgType;
  if (opts.queryString) params.queryString = opts.queryString;
  const res = await wfGet<ExpertQueryResponse>('getExpertWithQuery', params);
  return (res.data?.sources ?? []).map(s => s.source!).filter(Boolean);
}

/** 专家高级检索，推荐使用（getTalentByQuery-v2） */
export async function queryTalents(opts: {
  queryString: string;
  from?: number;
  size?: number;
  includes?: string;
  sortField?: string;
}): Promise<WfExpert[]> {
  const params: Record<string, string | number> = {
    queryString: opts.queryString,
    from: opts.from ?? 0,
    size: opts.size ?? 20,
    includes: opts.includes ?? 'ID,CNAME,AORG,ORGTYPE,PROVINCE,CITY,TITLE,H,ZHUANLI,QIKAN,XIANGMU,TAGS,DIRECTION',
  };
  if (opts.sortField) params.sortField = opts.sortField;
  const res = await wfGet<ExpertQueryResponse>('getTalentByQuery-v2', params);
  return (res.data?.sources ?? []).map(s => s.source!).filter(Boolean);
}

// ─── 人物关系图谱 ─────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  name: string;
  org?: string;
  class?: string;   // PERSON | ORG
  h?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

interface GraphRelationResponse {
  code: number;
  data?: {
    sources?: {
      nodes?: GraphNode[];
      edges?: GraphEdge[];
    };
  };
}

export async function getPersonRelationGraph(
  expertId: string,
  level = 1,
  nodeCount = 20,
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const res = await wfGet<GraphRelationResponse>('graphSinglePersonRelation', {
    AUID1: expertId,
    Level: level,
    NodeCount: nodeCount,
  });
  return {
    nodes: res.data?.sources?.nodes ?? [],
    edges: res.data?.sources?.edges ?? [],
  };
}

// ─── 机构合作统计 ─────────────────────────────────────────────────────────────

interface CoopOrgResponse {
  code: number;
  data?: {
    aggregations?: {
      orgc?: {
        buckets?: Array<{ key: string; doc_count: number }>;
      };
    };
  };
}

export async function getCooperationOrgs(
  expertId: string,
): Promise<Array<{ name: string; count: number }>> {
  const res = await wfGet<CoopOrgResponse>('cooperationORG', { auid: expertId });
  return (res.data?.aggregations?.orgc?.buckets ?? []).map(b => ({
    name: b.key,
    count: b.doc_count,
  }));
}

// ─── 专家信息汇总 ─────────────────────────────────────────────────────────────

export interface ExpertSummary {
  ID?: string;
  CNAME?: string;
  AORG?: string;
  TITLE?: string;
  DIRECTION?: string;
  ABSTRACT?: string;
  H?: number;
  ZHUANLI?: number;
  QIKAN?: number;
  XIANGMU?: number;
}

export async function getExpertSummary(expertId: string): Promise<ExpertSummary | null> {
  try {
    const res = await wfGet<{ code: number; data?: ExpertSummary }>('getExpertSummary', { id: expertId });
    return res.data ?? null;
  } catch {
    return null;
  }
}

// ─── 文献/专利检索 ─────────────────────────────────────────────────────────────

export interface PatentHit {
  id: string;
  title: string;
  applicant: string;
  date: string;
  type: string;
  ipc: string;
  status: string;
}

interface BasicSearchResponse {
  code: number;
  data?: {
    hits?: {
      total?: number;
      hits?: Array<{
        _id?: string;
        _source?: Record<string, unknown>;
      }>;
    };
    aggregations?: Record<string, { buckets?: Array<{ key: string; doc_count: number }> }>;
  };
}

function parsePatentHit(hit: { _id?: string; _source?: Record<string, unknown> }): PatentHit {
  const s = hit._source ?? {};
  return {
    id: (s.ID as string) || hit._id || '',
    title: (s.TITLE as string) || '',
    applicant: (s.ORGAN as string) || (s.APPLICANT as string) || '',
    date: (s.DATE as string) || '',
    type: (s.TP as string) || '发明',
    ipc: Array.isArray(s.IPC) ? (s.IPC[0] as string) : ((s.IPC as string) || ''),
    status: (s.PATENTLAW as string) || (s.STATUS as string) || '',
  };
}

/** 搜索专利列表 */
export async function searchPatents(opts: {
  keyword?: string;
  province?: string;
  city?: string;
  from?: number;
  size?: number;
}): Promise<{ list: PatentHit[]; total: number }> {
  const musts: string[] = [];
  if (opts.province) musts.push(`PROVINCE:${opts.province}`);
  if (opts.city) musts.push(`CITY:${opts.city}`);
  if (opts.keyword) musts.push(`TITLE:${opts.keyword}`);

  const params: Record<string, string | number> = {
    indexName: '10004',
    from: opts.from ?? 0,
    size: opts.size ?? 20,
    sortField: 'DATE.D',
    includes: 'ID,TITLE,DATE,ORGAN,IPC,TP,PATENTLAW',
  };
  if (musts.length > 0) params.must = musts.join(' AND ');

  const res = await wfGet<BasicSearchResponse>('basicSearch', params);
  const hits = res.data?.hits?.hits ?? [];
  return {
    list: hits.map(parsePatentHit),
    total: (res.data?.hits?.total as number) ?? 0,
  };
}

/** 按年度统计各类文献数量（用于趋势图） */
export async function getYearCountByIndex(opts: {
  indexName: string;
  must?: string;
  yearCount?: number;
}): Promise<Array<{ year: string; count: number }>> {
  const params: Record<string, string | number> = {
    indexName: opts.indexName,
    from: 0,
    size: 0,
    aggFields: 'YEAR',
    aggSize: opts.yearCount ?? 10,
  };
  if (opts.must) params.must = opts.must;
  const res = await wfGet<BasicSearchResponse>('basicSearch', params);
  const buckets = res.data?.aggregations?.YEAR?.buckets ?? [];
  return buckets
    .map(b => ({ year: String(b.key), count: b.doc_count }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

// ─── 技术关键词 ───────────────────────────────────────────────────────────────

export interface CkeyRelated {
  name: string;
  value: number;
}

interface CkeyAboutResponse {
  code: number;
  data?: {
    sources?: Array<{ name?: string; score?: number; count?: number }>;
  };
}

export async function getCkeyRelated(key: string): Promise<CkeyRelated[]> {
  const res = await wfGet<CkeyAboutResponse>('getCkeyAbout', { key, size: 20 });
  return (res.data?.sources ?? []).map(s => ({
    name: s.name ?? '',
    value: s.count ?? s.score ?? 0,
  })).filter(s => s.name);
}

// ─── 专家背景 ─────────────────────────────────────────────────────────────────

export interface ExpertBackground {
  cate?: string[];
  nativeSheng?: string;
  nativeShi?: string;
  email?: string;
  intro?: string;
}

export async function getExpertBackground(auid: string): Promise<ExpertBackground | null> {
  try {
    const res = await wfGet<{ code: number; data?: Array<Record<string, unknown>> }>('talent-background', { auid });
    const d = res.data?.[0];
    if (!d) return null;
    return {
      cate: d.CATE as string[] | undefined,
      nativeSheng: d.NATIVESHENG as string | undefined,
      nativeShi: d.NATIVESHI as string | undefined,
      email: d.EMAIL as string | undefined,
      intro: d.INTRO as string | undefined,
    };
  } catch { return null; }
}

// ─── 专家研究关键词 ───────────────────────────────────────────────────────────

export async function getExpertKeywords(auid: string): Promise<string[]> {
  try {
    const res = await wfGet<{ code: number; data?: string[] }>('talent-keyword', { auid });
    return res.data ?? [];
  } catch { return []; }
}

// ─── 专家关键词年度分布 ───────────────────────────────────────────────────────

export interface KeyYearItem {
  key: string;
  year: Array<{ key: number; count: number }>;
}

export async function getExpertKeyYear(auid: string): Promise<KeyYearItem[]> {
  try {
    const res = await wfGet<{ code: number; data?: KeyYearItem[] }>('talent-keyYear', { auid });
    return res.data ?? [];
  } catch { return []; }
}

// ─── 机构产出指标 ─────────────────────────────────────────────────────────────

export interface OrgOutput {
  patentInvent: number;
  patentUtility: number;
  thesisTotal: number;
  projectTotal: number;
  iarTotal: number;
  meetingTotal: number;
  standardTotal: number;
  cstadTotal: number;
}

export async function getOrgOutput(orgId: string): Promise<OrgOutput | null> {
  try {
    const res = await wfGet<{ hits?: { hits?: Array<{ _source?: Record<string, number> }> } }>('getOrgOutputIndicator', { orgId });
    const s = res.hits?.hits?.[0]?._source;
    if (!s) return null;
    return {
      patentInvent: s.OUTPUT_PATENT_INVENT ?? 0,
      patentUtility: s.OUTPUT_PATENT_UTILITY ?? 0,
      thesisTotal: s.OUTPUT_THESIS_TOTAL ?? 0,
      projectTotal: s.OUTPUT_PROJECT_TOTAL ?? 0,
      iarTotal: s.OUTPUT_INDUSTRY_UNIVERSITY_RESEARCH ?? 0,
      meetingTotal: s.OUTPUT_MEETING_TOTAL ?? 0,
      standardTotal: s.OUTPUT_STANDARD_TOTAL ?? s.OUTPUT_STANDARD_INDUSTRY ?? 0,
      cstadTotal: s.OUTPUT_CSTAD_TOTAL ?? 0,
    };
  } catch { return null; }
}

// ─── 机构核心技术词 ───────────────────────────────────────────────────────────

export async function getOrgTechKeywords(orgId: string, org: string): Promise<CkeyRelated[]> {
  try {
    const res = await wfGet<{ key?: string[]; value?: number[] }>('getOrgRe', { orgID: orgId, org });
    const keys = res.key ?? [];
    const values = res.value ?? [];
    return keys.map((k, i) => ({ name: k, value: values[i] ?? 0 }));
  } catch { return []; }
}

// ─── 机构专利类型分布 ─────────────────────────────────────────────────────────

export async function getOrgPatentTypes(orgId: string, org: string): Promise<{ invention: number; utility: number; design: number }> {
  try {
    const res = await wfGet<{ patt?: Record<string, number> }>('getOrgPatentPie', { orgID: orgId, org });
    const p = res.patt ?? {};
    return {
      invention: p['发明专利'] ?? 0,
      utility: p['实用新型'] ?? 0,
      design: p['外观设计'] ?? 0,
    };
  } catch { return { invention: 0, utility: 0, design: 0 }; }
}

// ─── 技术词相关词（getCkeyAbout 原始格式） ────────────────────────────────────

export async function getCkeyAboutRaw(ckey: string): Promise<{ keys: string[]; values: number[] }> {
  try {
    const res = await wfGet<{ key?: string[]; value?: number[] }>('getCkeyAbout', { ckey });
    return { keys: res.key ?? [], values: res.value ?? [] };
  } catch { return { keys: [], values: [] }; }
}

// ─── 技术产业年度趋势 ─────────────────────────────────────────────────────────

export interface CkeyTrendSeries {
  years: number[];
  counts: number[];
}

export async function getCkeyIndustryTrend(ckey: string): Promise<{ patent: CkeyTrendSeries; standard: CkeyTrendSeries; project: CkeyTrendSeries; achievement: CkeyTrendSeries }> {
  try {
    const res = await wfGet<Record<string, { key?: number[]; count?: (string | number)[] }>>('getCkeyIndustry', { ckey });
    const parse = (k: string): CkeyTrendSeries => {
      const d = res[k];
      return {
        years: d?.key ?? [],
        counts: (d?.count ?? []).map(c => Number(c) || 0),
      };
    };
    return { patent: parse('b'), standard: parse('c'), project: parse('g'), achievement: parse('h') };
  } catch { return { patent: { years: [], counts: [] }, standard: { years: [], counts: [] }, project: { years: [], counts: [] }, achievement: { years: [], counts: [] } }; }
}

// ─── 区域资源统计 ─────────────────────────────────────────────────────────────

export async function getAreaResourceStats(areacode: string): Promise<Record<string, number>> {
  try {
    const res = await wfGet<Record<string, string | number>>('talent-resourceStatistics', { areacode });
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(res)) {
      if (k === 'code' || k === 'message' || k === 'token') continue;
      out[k] = Number(v) || 0;
    }
    return out;
  } catch { return {}; }
}

// ─── 机构名称搜索（获取机构ID） ───────────────────────────────────────────────

export async function findOrgByName(orgName: string): Promise<{ id: string; name: string } | null> {
  try {
    const res = await wfGet<{ hits?: { hits?: Array<{ _source?: { ID?: string; NAME?: string } }> } }>('getOrgByName-v2', { org: orgName, pageNo: 0, pageSize: 1 });
    const hit = res.hits?.hits?.[0]?._source;
    if (!hit?.ID) return null;
    return { id: hit.ID, name: hit.NAME ?? orgName };
  } catch { return null; }
}
