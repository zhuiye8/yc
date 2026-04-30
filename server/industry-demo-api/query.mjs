import { getDb } from './db.mjs';
import { normalizeProvinceName, normalizeSearchText, parseJsonText, resolveScope } from './shared.mjs';

function getNodeStatus(orgCount) {
  if (orgCount === 0) return 'missing';
  if (orgCount <= 20) return 'weak';
  return 'strong';
}

function buildOrgRegionFilter(scope, alias = 'o') {
  if (scope.isCity) {
    return {
      sql: ` AND ${alias}.norm_prov = ? AND ${alias}.norm_city = ?`,
      params: [scope.province ?? '', scope.city ?? ''],
    };
  }

  if (scope.isProvince) {
    return {
      sql: ` AND ${alias}.norm_prov = ?`,
      params: [scope.province ?? ''],
    };
  }

  return { sql: '', params: [] };
}

function parseItems(rows) {
  return rows.map((row) => JSON.parse(row.raw_json));
}

function getNodeScopeSummary(nodeId, scopeKey) {
  const db = getDb();
  return db
    .prepare(
      `SELECT reported_org_total, cached_org_total, org_truncated,
              reported_expert_total, cached_expert_total, expert_truncated
       FROM node_scope_summary
       WHERE node_id = ? AND scope_key = ?`,
    )
    .get(nodeId, scopeKey);
}

function getNodeScopeTotals(nodeId, scopeKey) {
  const row = getNodeScopeSummary(nodeId, scopeKey);
  return {
    reportedOrgTotal: Number(row?.reported_org_total ?? 0),
    cachedOrgTotal: Number(row?.cached_org_total ?? 0),
    orgTruncated: Boolean(row?.org_truncated ?? 0),
    reportedExpertTotal: Number(row?.reported_expert_total ?? 0),
    cachedExpertTotal: Number(row?.cached_expert_total ?? 0),
    expertTruncated: Boolean(row?.expert_truncated ?? 0),
  };
}

function getNodeRecord(chainKey, nodeName) {
  const db = getDb();
  return db
    .prepare('SELECT node_id, node_name, query_string FROM nodes WHERE chain_key = ? AND node_name = ? LIMIT 1')
    .get(chainKey, nodeName);
}

function getNodeOrgTotal(nodeId, scope) {
  const summary = getNodeScopeSummary(nodeId, scope.scopeKey);
  if (summary) {
    return Number(summary.reported_org_total ?? 0);
  }

  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT org_uid) AS total
       FROM node_org_hits
       WHERE node_id = ? AND scope_key = ?`,
    )
    .get(nodeId, scope.scopeKey);

  return Number(row?.total ?? 0);
}

function getNodeExpertTotal(nodeId, scopeKey) {
  const summary = getNodeScopeSummary(nodeId, scopeKey);
  if (summary) {
    return Number(summary.reported_expert_total ?? 0);
  }

  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT expert_uid) AS total
       FROM node_expert_hits
       WHERE node_id = ? AND scope_key = ?`,
    )
    .get(nodeId, scopeKey);

  return Number(row?.total ?? 0);
}

function getChainOrgTotal(chainKey, scope) {
  const db = getDb();
  const summaryRow = db
    .prepare(
      `SELECT COALESCE(SUM(s.reported_org_total), 0) AS total
       FROM nodes n
       JOIN node_scope_summary s ON s.node_id = n.node_id
       WHERE n.chain_key = ? AND s.scope_key = ?`,
    )
    .get(chainKey, scope.scopeKey);

  return Number(summaryRow?.total ?? 0);
}

function getChainExpertTotal(chainKey, scopeKey) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(s.reported_expert_total), 0) AS total
       FROM nodes n
       JOIN node_scope_summary s ON s.node_id = n.node_id
       WHERE n.chain_key = ? AND s.scope_key = ?`,
    )
    .get(chainKey, scopeKey);

  return Number(row?.total ?? 0);
}

function getNodeOrgCounts(chainKey, scope) {
  const db = getDb();
  return db
    .prepare(
      `SELECT n.node_name, COALESCE(s.reported_org_total, 0) AS org_total
       FROM nodes n
       LEFT JOIN node_scope_summary s ON s.node_id = n.node_id AND s.scope_key = ?
       WHERE n.chain_key = ?
       ORDER BY n.node_name ASC`,
    )
    .all(scope.scopeKey, chainKey);
}

function getEntityOrderSql(type, alias) {
  if (type === 'experts') {
    return `ORDER BY COALESCE(${alias}.h, 0) DESC, COALESCE(${alias}.qikan, 0) DESC, ${alias}.cname ASC`;
  }

  return `ORDER BY ${alias}.name ASC`;
}

function getOrgHitScopeForList(scope) {
  return scope.isNational ? scope.scopeKey : 'national';
}

function getAggregatedNodeItems(nodeIds, type, scope, page, pageSize) {
  const db = getDb();
  const placeholders = nodeIds.map(() => '?').join(', ');
  const offset = (page - 1) * pageSize;

  if (type === 'orgs') {
    const regionFilter = buildOrgRegionFilter(scope, 'o');
    const hitScopeKey = getOrgHitScopeForList(scope);
    const totalRow = db
      .prepare(
        `SELECT COUNT(DISTINCT o.org_uid) AS total
         FROM node_org_hits h
         JOIN org_entities o ON o.org_uid = h.org_uid
         WHERE h.node_id IN (${placeholders}) AND h.scope_key = ?${regionFilter.sql}`,
      )
      .get(...nodeIds, hitScopeKey, ...regionFilter.params);

    const rows = db
      .prepare(
        `SELECT o.raw_json
         FROM node_org_hits h
         JOIN org_entities o ON o.org_uid = h.org_uid
         WHERE h.node_id IN (${placeholders}) AND h.scope_key = ?${regionFilter.sql}
         GROUP BY o.org_uid
         ${getEntityOrderSql('orgs', 'o')}
         LIMIT ? OFFSET ?`,
      )
      .all(...nodeIds, hitScopeKey, ...regionFilter.params, pageSize, offset);

    return { total: Number(totalRow?.total ?? 0), items: parseItems(rows) };
  }

  const totalRow = db
    .prepare(
      `SELECT COUNT(DISTINCT e.expert_uid) AS total
       FROM node_expert_hits h
       JOIN expert_entities e ON e.expert_uid = h.expert_uid
       WHERE h.node_id IN (${placeholders}) AND h.scope_key = ?`,
    )
    .get(...nodeIds, scope.scopeKey);

  const rows = db
    .prepare(
      `SELECT e.raw_json
       FROM node_expert_hits h
       JOIN expert_entities e ON e.expert_uid = h.expert_uid
       WHERE h.node_id IN (${placeholders}) AND h.scope_key = ?
       GROUP BY e.expert_uid
       ${getEntityOrderSql('experts', 'e')}
       LIMIT ? OFFSET ?`,
    )
    .all(...nodeIds, scope.scopeKey, pageSize, offset);

  return { total: Number(totalRow?.total ?? 0), items: parseItems(rows) };
}

function getReportedTotalsForNodes(nodeIds, scopeKey) {
  if (nodeIds.length === 0) {
    return {
      orgTotal: 0,
      expertTotal: 0,
    };
  }

  const db = getDb();
  const placeholders = nodeIds.map(() => '?').join(', ');
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(reported_org_total), 0) AS org_total,
         COALESCE(SUM(reported_expert_total), 0) AS expert_total
       FROM node_scope_summary
       WHERE node_id IN (${placeholders}) AND scope_key = ?`,
    )
    .get(...nodeIds, scopeKey);

  return {
    orgTotal: Number(row?.org_total ?? 0),
    expertTotal: Number(row?.expert_total ?? 0),
  };
}

function searchEntitiesByKeyword(type, scope, keyword, limit) {
  const db = getDb();
  const like = `%${keyword}%`;

  if (type === 'orgs') {
    const filter = buildOrgRegionFilter(scope);
    const totalRow = db
      .prepare(
        `SELECT COUNT(DISTINCT o.org_uid) AS total
         FROM org_entities o
         WHERE (o.name LIKE ? OR o.industry_text LIKE ? OR o.tags_text LIKE ?)${filter.sql}`,
      )
      .get(like, like, like, ...filter.params);

    const rows = db
      .prepare(
        `SELECT o.raw_json
         FROM org_entities o
         WHERE (o.name LIKE ? OR o.industry_text LIKE ? OR o.tags_text LIKE ?)${filter.sql}
         ${getEntityOrderSql('orgs', 'o')}
         LIMIT ?`,
      )
      .all(like, like, like, ...filter.params, limit);

    return { total: Number(totalRow?.total ?? 0), items: parseItems(rows) };
  }

  const totalRow = db
    .prepare(
      `SELECT COUNT(DISTINCT e.expert_uid) AS total
       FROM node_expert_hits h
       JOIN expert_entities e ON e.expert_uid = h.expert_uid
       WHERE h.scope_key = ? AND (e.cname LIKE ? OR e.aorg LIKE ? OR e.title_text LIKE ?)`,
    )
    .get(scope.scopeKey, like, like, like);

  const rows = db
    .prepare(
      `SELECT e.raw_json
       FROM node_expert_hits h
       JOIN expert_entities e ON e.expert_uid = h.expert_uid
       WHERE h.scope_key = ? AND (e.cname LIKE ? OR e.aorg LIKE ? OR e.title_text LIKE ?)
       GROUP BY e.expert_uid
       ${getEntityOrderSql('experts', 'e')}
       LIMIT ?`,
    )
    .all(scope.scopeKey, like, like, like, limit);

  return { total: Number(totalRow?.total ?? 0), items: parseItems(rows) };
}

export function getHealth() {
  const db = getDb();
  const versionRow = db.prepare('SELECT value FROM meta WHERE key = ?').get('version');
  const builtAtRow = db.prepare('SELECT value FROM meta WHERE key = ?').get('built_at');
  return {
    ok: true,
    version: versionRow?.value ?? null,
    builtAt: builtAtRow?.value ?? null,
  };
}

export function getChainSummary(chainKey, province, city) {
  const scope = resolveScope(province, city);
  const nodeRows = getNodeOrgCounts(chainKey, scope);
  const nodeOrgCounts = Object.fromEntries(
    nodeRows.map((row) => [row.node_name, Number(row.org_total ?? 0)]),
  );

  const total = nodeRows.length;
  const covered = Object.values(nodeOrgCounts).filter((count) => Number(count) > 0).length;
  const rate = total > 0 ? (covered / total) * 100 : 0;
  const chainOrgTotal = getChainOrgTotal(chainKey, scope);
  const chainExpertTotal = getChainExpertTotal(chainKey, scope.scopeKey);

  return {
    scopeKey: scope.scopeKey,
    covered,
    total,
    rate,
    chainStatus: getNodeStatus(chainOrgTotal),
    chainOrgTotal,
    chainExpertTotal,
    nodeOrgCounts,
  };
}

export function getChainAggregate(chainKey, type, province, city, page = 1, pageSize = 10) {
  const db = getDb();
  const scope = resolveScope(province, city);
  const nodeIds = db
    .prepare('SELECT node_id FROM nodes WHERE chain_key = ? ORDER BY node_name ASC')
    .all(chainKey)
    .map((row) => row.node_id);

  if (nodeIds.length === 0) {
    return { total: 0, items: [] };
  }

  return getAggregatedNodeItems(nodeIds, type, scope, page, pageSize);
}

export function getNodeStats(chainKey, nodeName, province, city) {
  const scope = resolveScope(province, city);
  const node = getNodeRecord(chainKey, nodeName);

  if (!node) {
    return null;
  }

  const orgTotal = getNodeOrgTotal(node.node_id, resolveScope());
  const expertTotal = getNodeExpertTotal(node.node_id, 'national');
  const scopedOrgTotal = scope.isNational ? orgTotal : getNodeOrgTotal(node.node_id, scope);
  const scopedExpertTotal = scope.isNational ? expertTotal : getNodeExpertTotal(node.node_id, scope.scopeKey);
  const nationalSummary = getNodeScopeTotals(node.node_id, 'national');
  const scopedSummary = scope.isNational ? nationalSummary : getNodeScopeTotals(node.node_id, scope.scopeKey);

  return {
    queryString: node.query_string,
    orgTotal,
    localOrgTotal: scopedOrgTotal,
    expertTotal,
    localExpertTotal: scopedExpertTotal,
    scopeKey: scope.scopeKey,
    orgCachedTotal: scopedSummary.cachedOrgTotal,
    expertCachedTotal: scopedSummary.cachedExpertTotal,
    orgTruncated: scopedSummary.orgTruncated,
    expertTruncated: scopedSummary.expertTruncated,
  };
}

export function getNodeItems(chainKey, nodeName, type, province, city, page = 1, pageSize = 10) {
  const scope = resolveScope(province, city);
  const node = getNodeRecord(chainKey, nodeName);

  if (!node) {
    return { total: 0, items: [] };
  }

  return getAggregatedNodeItems([node.node_id], type, scope, page, pageSize);
}

/**
 * 获取某产业链在指定省份内各城市的机构分布
 * - 按 org_uid 去重（一家企业命中多节点只计一次）
 * - 只返回 norm_city 非空的记录
 * - 按机构数从多到少排序
 *
 * @param {string} chainKey
 * @param {string} province - 省份名（会自动 normalize，如 "湖北省" → "湖北"）
 * @returns {Array<{ city: string, total: number }>}
 */
export function getChainCityDistribution(chainKey, province) {
  const normProv = normalizeProvinceName(province);
  if (!normProv) {
    return [];
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT o.norm_city AS city, COUNT(DISTINCT o.org_uid) AS total
       FROM node_org_hits h
       JOIN org_entities o ON o.org_uid = h.org_uid
       JOIN nodes n ON n.node_id = h.node_id
       WHERE n.chain_key = ?
         AND o.norm_prov = ?
         AND o.norm_city IS NOT NULL
         AND o.norm_city != ''
       GROUP BY o.norm_city
       ORDER BY total DESC`,
    )
    .all(chainKey, normProv);

  return rows.map((row) => ({
    city: String(row.city),
    total: Number(row.total ?? 0),
  }));
}

export function getChainProvinceDistribution(chainKey) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT o.norm_prov AS province, COUNT(DISTINCT o.org_uid) AS total
       FROM node_org_hits h
       JOIN org_entities o ON o.org_uid = h.org_uid
       JOIN nodes n ON n.node_id = h.node_id
       WHERE n.chain_key = ?
         AND o.norm_prov IS NOT NULL
         AND o.norm_prov != ''
       GROUP BY o.norm_prov
       ORDER BY total DESC`,
    )
    .all(chainKey);

  return rows.map((row) => ({
    province: String(row.province),
    total: Number(row.total ?? 0),
  }));
}

export function searchIndustry(keyword, province, city, limit = 50) {
  const db = getDb();
  const scope = resolveScope(province, city);
  const normalized = normalizeSearchText(keyword);

  if (!normalized) {
    return {
      mode: 'empty',
      matchedLabels: [],
      orgs: [],
      orgTotal: 0,
      experts: [],
      expertTotal: 0,
    };
  }

  const matchRows = db
    .prepare(
      `SELECT DISTINCT n.node_id, n.node_name
       FROM nodes n
       LEFT JOIN node_keywords k ON k.node_id = n.node_id
       WHERE n.norm_node_name LIKE ? OR k.norm_keyword LIKE ?
       ORDER BY n.node_name ASC
       LIMIT 24`,
    )
    .all(`%${normalized}%`, `%${normalized}%`);

  if (matchRows.length > 0) {
    const nodeIds = matchRows.map((row) => row.node_id);
    const orgResult = getAggregatedNodeItems(nodeIds, 'orgs', scope, 1, limit);
    const expertResult = getAggregatedNodeItems(nodeIds, 'experts', scope, 1, limit);
    const totals = getReportedTotalsForNodes(nodeIds, scope.scopeKey);

    return {
      mode: 'node-match',
      matchedLabels: matchRows.map((row) => row.node_name),
      orgs: orgResult.items,
      orgTotal: totals.orgTotal,
      experts: expertResult.items,
      expertTotal: totals.expertTotal,
    };
  }

  const orgResult = searchEntitiesByKeyword('orgs', scope, keyword, limit);
  const expertResult = searchEntitiesByKeyword('experts', scope, keyword, limit);

  return {
    mode: 'fallback',
    matchedLabels: [],
    orgs: orgResult.items,
    orgTotal: orgResult.total,
    experts: expertResult.items,
    expertTotal: expertResult.total,
  };
}
