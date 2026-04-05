export const schemaSql = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chains (
  chain_key TEXT PRIMARY KEY,
  chain_label TEXT NOT NULL,
  chain_search_key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
  node_id TEXT PRIMARY KEY,
  chain_key TEXT NOT NULL,
  node_name TEXT NOT NULL,
  norm_node_name TEXT NOT NULL,
  query_string TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS node_keywords (
  node_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  norm_keyword TEXT NOT NULL,
  PRIMARY KEY (node_id, keyword)
);

CREATE TABLE IF NOT EXISTS org_entities (
  org_uid TEXT PRIMARY KEY,
  id TEXT,
  orgid TEXT,
  name TEXT NOT NULL,
  prov TEXT,
  city TEXT,
  norm_prov TEXT,
  norm_city TEXT,
  industry_json TEXT NOT NULL,
  industry_text TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  tags_text TEXT NOT NULL,
  raw_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expert_entities (
  expert_uid TEXT PRIMARY KEY,
  auid TEXT,
  id TEXT,
  cname TEXT NOT NULL,
  aorg TEXT,
  title_json TEXT NOT NULL,
  title_text TEXT NOT NULL,
  h INTEGER,
  qikan INTEGER,
  zhuanli INTEGER,
  chengguo INTEGER,
  chanxueyanhz INTEGER,
  raw_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS node_org_hits (
  node_id TEXT NOT NULL,
  org_uid TEXT NOT NULL,
  PRIMARY KEY (node_id, org_uid)
);

CREATE TABLE IF NOT EXISTS node_expert_hits (
  node_id TEXT NOT NULL,
  expert_uid TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  query_province TEXT,
  query_city TEXT,
  norm_query_province TEXT,
  norm_query_city TEXT,
  PRIMARY KEY (node_id, expert_uid, scope_key)
);

CREATE INDEX IF NOT EXISTS idx_nodes_chain ON nodes(chain_key, node_name);
CREATE INDEX IF NOT EXISTS idx_nodes_norm_name ON nodes(norm_node_name);
CREATE INDEX IF NOT EXISTS idx_keywords_norm ON node_keywords(norm_keyword);
CREATE INDEX IF NOT EXISTS idx_org_region ON org_entities(norm_prov, norm_city);
CREATE INDEX IF NOT EXISTS idx_org_name ON org_entities(name);
CREATE INDEX IF NOT EXISTS idx_expert_name ON expert_entities(cname, aorg);
CREATE INDEX IF NOT EXISTS idx_node_org_hits_node ON node_org_hits(node_id, org_uid);
CREATE INDEX IF NOT EXISTS idx_node_expert_hits_scope ON node_expert_hits(node_id, scope_key, expert_uid);
CREATE INDEX IF NOT EXISTS idx_node_expert_hits_region ON node_expert_hits(norm_query_province, norm_query_city, scope_key);
`;
