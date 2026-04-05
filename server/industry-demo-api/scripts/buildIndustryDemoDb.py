import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
import time
from pathlib import Path
from typing import Any, Dict, List
from urllib import error as urlerror
from urllib import parse, request


ROOT_DIR = Path(__file__).resolve().parents[3]
KEYWORDS_FILE = ROOT_DIR / "src" / "data" / "industry-keywords.json"
AUTH_FILE = ROOT_DIR / "src" / "services" / "auth.ts"

BASE_URL = os.environ.get("WF_API_BASE_URL", "http://119.36.242.222:8902")
PAGE_SIZE = int(os.environ.get("INDUSTRY_DB_PAGE_SIZE", "100"))
REQUEST_INTERVAL_MS = int(os.environ.get("INDUSTRY_DB_INTERVAL_MS", "180"))
MAX_RETRIES = int(os.environ.get("INDUSTRY_DB_MAX_RETRIES", "8"))
MAX_RESULT_WINDOW = int(os.environ.get("INDUSTRY_DB_MAX_RESULT_WINDOW", "10000"))
MAX_CACHED_ITEMS_PER_SCOPE = int(os.environ.get("INDUSTRY_DB_MAX_CACHED_ITEMS_PER_SCOPE", "1000"))
CACHE_VERSION = "2026-04-industry-demo-db-v3"

CHAIN_META = [
    {
        "chain_key": "wetchem",
        "chain_label": "湿电子化学品",
        "chain_search_key": "电子化学品 OR 半导体材料 OR 湿电子化学品",
    },
    {
        "chain_key": "newenergy",
        "chain_label": "新能源新材料",
        "chain_search_key": "新能源 OR 新材料 OR 电池 OR 储能",
    },
    {
        "chain_key": "pharma",
        "chain_label": "先进制剂与高端仿制药",
        "chain_search_key": "制药 OR 仿制药 OR 生物医药 OR 药物制剂",
    },
    {
        "chain_key": "yeast",
        "chain_label": "酵母发酵与功能成分制造",
        "chain_search_key": "酵母 OR 发酵 OR 生物工程 OR 功能食品",
    },
    {
        "chain_key": "ship",
        "chain_label": "内河绿色智能船舶制造",
        "chain_search_key": "船舶 OR 造船 OR 航运 OR 智能船舶",
    },
    {
        "chain_key": "ai",
        "chain_label": "人工智能",
        "chain_search_key": "人工智能",
    },
]

SCHEMA_SQL = """
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
  scope_key TEXT NOT NULL,
  PRIMARY KEY (node_id, org_uid, scope_key)
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

CREATE TABLE IF NOT EXISTS node_scope_summary (
  node_id TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  reported_org_total INTEGER NOT NULL DEFAULT 0,
  cached_org_total INTEGER NOT NULL DEFAULT 0,
  org_truncated INTEGER NOT NULL DEFAULT 0,
  reported_expert_total INTEGER NOT NULL DEFAULT 0,
  cached_expert_total INTEGER NOT NULL DEFAULT 0,
  expert_truncated INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (node_id, scope_key)
);

CREATE TABLE IF NOT EXISTS node_scope_fetch_status (
  node_id TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  org_done INTEGER NOT NULL DEFAULT 0,
  expert_done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (node_id, scope_key)
);

CREATE INDEX IF NOT EXISTS idx_nodes_chain ON nodes(chain_key, node_name);
CREATE INDEX IF NOT EXISTS idx_nodes_norm_name ON nodes(norm_node_name);
CREATE INDEX IF NOT EXISTS idx_keywords_norm ON node_keywords(norm_keyword);
CREATE INDEX IF NOT EXISTS idx_org_region ON org_entities(norm_prov, norm_city);
CREATE INDEX IF NOT EXISTS idx_org_name ON org_entities(name);
CREATE INDEX IF NOT EXISTS idx_expert_name ON expert_entities(cname, aorg);
CREATE INDEX IF NOT EXISTS idx_node_org_hits_scope ON node_org_hits(node_id, scope_key, org_uid);
CREATE INDEX IF NOT EXISTS idx_node_expert_hits_scope ON node_expert_hits(node_id, scope_key, expert_uid);
CREATE INDEX IF NOT EXISTS idx_node_expert_hits_region ON node_expert_hits(norm_query_province, norm_query_city, scope_key);
CREATE INDEX IF NOT EXISTS idx_node_scope_summary ON node_scope_summary(node_id, scope_key);
CREATE INDEX IF NOT EXISTS idx_node_scope_fetch_status ON node_scope_fetch_status(node_id, scope_key);
"""

LAST_REQUEST_AT = 0.0
QUERY_CACHE: Dict[str, Dict[str, Any]] = {}
ACCESS_TOKEN: str | None = None


def log(message: str) -> None:
    print(f"[industry-demo-db] {message}")


def strip_suffix(value: str, suffixes: List[str]) -> str:
    text = str(value or "").strip()
    for suffix in suffixes:
        if text.endswith(suffix):
            text = text[: -len(suffix)]
            break
    return text.strip()


def normalize_province_name(value: str) -> str:
    return strip_suffix(
        value,
        ["维吾尔自治区", "壮族自治区", "回族自治区", "特别行政区", "自治区", "省", "市"],
    )


def normalize_city_name(value: str) -> str:
    return strip_suffix(value, ["自治州", "地区", "盟", "市"])


def normalize_search_text(value: str) -> str:
    return re.sub(r"[()\[\]{}<>《》“”\"'‘’、，。；：:,.!?！？\s\-_\/\\|]", "", str(value or "").lower()).strip()


def build_scope_key(province: str, city: str) -> str:
    norm_province = normalize_province_name(province)
    norm_city = normalize_city_name(city)
    if norm_city:
      if norm_province:
          return f"city:{norm_province}|{norm_city}"
      return f"city:|{norm_city}"
    if norm_province:
        return f"province:{norm_province}"
    return "national"


def get_node_id(chain_key: str, node_name: str) -> str:
    return hashlib.sha1(f"{chain_key}:{node_name}".encode("utf-8")).hexdigest()[:12]


def get_org_uid(item: Dict[str, Any]) -> str:
    identifier = str(item.get("ID") or item.get("ORGID") or item.get("UID") or "").strip()
    if identifier:
        return identifier
    return f"name:{str(item.get('NAME') or '').strip()}|{normalize_province_name(item.get('PROV') or '')}|{normalize_city_name(item.get('CITY') or '')}"


def get_expert_uid(item: Dict[str, Any]) -> str:
    identifier = str(item.get("AUID") or item.get("ID") or item.get("UID") or "").strip()
    if identifier:
        return identifier
    return f"name:{str(item.get('CNAME') or '').strip()}|{str(item.get('AORG') or '').strip()}"


def throttle() -> None:
    global LAST_REQUEST_AT
    wait_ms = max(0, LAST_REQUEST_AT + REQUEST_INTERVAL_MS - int(time.time() * 1000))
    if wait_ms > 0:
        time.sleep(wait_ms / 1000)
    LAST_REQUEST_AT = int(time.time() * 1000)


def fetch_json(url: str, method: str = "GET", data: Dict[str, Any] | None = None, headers: Dict[str, str] | None = None, label: str = "request") -> Dict[str, Any]:
    payload = None
    request_headers = {"Content-Type": "application/json"}
    if headers:
        request_headers.update(headers)
    if data is not None:
        payload = json.dumps(data).encode("utf-8")

    last_error: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        throttle()
        try:
            req = request.Request(url, data=payload, method=method, headers=request_headers)
            with request.urlopen(req, timeout=120) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else {}
        except Exception as error:  # noqa: BLE001
            last_error = error
            is_http_error = isinstance(error, urlerror.HTTPError)
            status_code = error.code if is_http_error else None
            if (
                status_code == 401
                and "Authorization" in request_headers
                and not url.endswith("/auth/token")
            ):
                refreshed = get_access_token(force_refresh=True)
                request_headers["Authorization"] = f"Bearer {refreshed}"
                log(f"{label} received HTTP 401, refreshed access token and retrying")
                continue
            if attempt >= MAX_RETRIES:
                break
            retry_delay = REQUEST_INTERVAL_MS * attempt * 3
            if status_code in {429, 500, 502, 503, 504}:
                retry_delay = max(retry_delay, 1500 * attempt)
            reason = f"HTTP {status_code}" if status_code else str(error)
            log(f"{label} failed on attempt {attempt} ({reason}), retrying in {retry_delay}ms")
            time.sleep(retry_delay / 1000)

    raise last_error or RuntimeError(f"{label} failed")


def read_api_credentials() -> tuple[str, str]:
    source = AUTH_FILE.read_text(encoding="utf-8")
    username = re.search(r"const API_USERNAME = '([^']+)'", source)
    secret = re.search(r"const API_SECRET = '([^']+)'", source)
    if not username or not secret:
        raise RuntimeError("Unable to parse API credentials from src/services/auth.ts")
    return username.group(1), secret.group(1)


def get_access_token(force_refresh: bool = False) -> str:
    global ACCESS_TOKEN
    if ACCESS_TOKEN and not force_refresh:
        return ACCESS_TOKEN

    username, secret = read_api_credentials()
    result = fetch_json(
        f"{BASE_URL}/auth/token",
        method="POST",
        data={"username": username, "secret": secret},
        label="auth/token",
    )
    token = result.get("accessToken") or result.get("token")
    if not token:
        raise RuntimeError("Token not found in auth response")
    ACCESS_TOKEN = token
    return token


def build_org_url(query_string: str, start: int, size: int, city: str | None = None) -> str:
    first_keyword = re.split(r"\s+OR\s+", query_string)[0].strip()
    params = {
        "text": first_keyword,
        "queryString": query_string,
        "from": start,
        "recommendOrgSize": size,
        "model": 1,
    }
    if city:
        params["city"] = city
    return f"{BASE_URL}/api/wf/findOrgByModelsDecode-v1?{parse.urlencode(params)}"


def build_expert_url(query_string: str, start: int, size: int, city: str | None = None) -> str:
    params = {"key": query_string, "from": start, "size": size}
    if city:
        params["city"] = city
    return f"{BASE_URL}/api/wf/findExpert-v2?{parse.urlencode(params)}"


def split_query_terms(query_string: str) -> List[str]:
    return [term.strip() for term in re.split(r"\s+OR\s+", query_string) if term.strip()]


def sanitize_org_query_string(query_string: str) -> str | None:
    terms = split_query_terms(query_string)
    if len(terms) <= 1:
        return None
    safe_terms = [term for term in terms if "/" not in term]
    if len(safe_terms) == len(terms) or not safe_terms:
        return None
    return " OR ".join(safe_terms)


def extract_total(result: Dict[str, Any]) -> int:
    return int(((result.get("data") or {}).get("total") or 0))


def extract_org_items(result: Dict[str, Any]) -> List[Dict[str, Any]]:
    items = ((result.get("data") or {}).get("orgRecommend") or [])
    return items if isinstance(items, list) else []


def extract_expert_items(result: Dict[str, Any]) -> List[Dict[str, Any]]:
    items = ((result.get("data") or {}).get("expertsRecommend") or [])
    return items if isinstance(items, list) else []


def fetch_all_pages(url_builder, extractor, label: str) -> Dict[str, Any]:
    first_page = fetch_json(
        url_builder(0),
        headers={"Authorization": f"Bearer {get_access_token()}"},
        label=label,
    )
    total = extract_total(first_page)
    target_total = total
    if MAX_RESULT_WINDOW > 0:
        target_total = min(target_total, MAX_RESULT_WINDOW)
    if MAX_CACHED_ITEMS_PER_SCOPE > 0:
        target_total = min(target_total, MAX_CACHED_ITEMS_PER_SCOPE)
    items = list(extractor(first_page))[:target_total]
    if total > target_total:
        reasons: List[str] = []
        if MAX_RESULT_WINDOW > 0 and total > MAX_RESULT_WINDOW and target_total <= MAX_RESULT_WINDOW:
            reasons.append(f"result window {MAX_RESULT_WINDOW}")
        if MAX_CACHED_ITEMS_PER_SCOPE > 0 and total > MAX_CACHED_ITEMS_PER_SCOPE and target_total <= MAX_CACHED_ITEMS_PER_SCOPE:
            reasons.append(f"cache cap {MAX_CACHED_ITEMS_PER_SCOPE}")
        reason_text = " and ".join(reasons) if reasons else f"target {target_total}"
        log(f"{label} total {total} exceeds {reason_text}, truncating stored items")
    log(f"{label} loaded {len(items)}/{total}")

    current = len(items)
    while current < target_total:
        page = fetch_json(
            url_builder(current),
            headers={"Authorization": f"Bearer {get_access_token()}"},
            label=f"{label}:{current}",
        )
        page_items = extractor(page)
        if not page_items:
            raise RuntimeError(
                f"{label} pagination stalled at {current}/{target_total}: upstream returned 0 items for from={current}. "
                "This usually means the upstream search endpoint has a result-window cap (commonly 10000)."
            )
        items.extend(page_items)
        if len(items) > target_total:
            items = items[:target_total]
        next_current = len(items)
        if next_current <= current:
            raise RuntimeError(
                f"{label} pagination stalled at {current}/{target_total}: no progress after requesting from={current}."
            )
        current = next_current
        log(f"{label} loaded {min(current, total)}/{total}")

    return {
        "reportedTotal": total,
        "cachedTotal": len(items),
        "truncated": total > target_total,
        "items": items[:target_total],
    }


def fetch_org_scope(query_string: str, city: str | None = None) -> Dict[str, Any]:
    scope_label = city or "national"
    try:
        return fetch_all_pages(
            lambda start: build_org_url(query_string, start, PAGE_SIZE, city),
            extract_org_items,
            f"orgs {scope_label} {query_string}",
        )
    except urlerror.HTTPError as error:
        if error.code not in {500, 502, 503, 504}:
            raise
        fallback_query = sanitize_org_query_string(query_string)
        if not fallback_query:
            raise
        log(
            f"orgs {scope_label} {query_string} hit HTTP {error.code}, retrying with sanitized query "
            f"without slash terms: {fallback_query}"
        )
        return fetch_all_pages(
            lambda start: build_org_url(fallback_query, start, PAGE_SIZE, city),
            extract_org_items,
            f"orgs {scope_label} {fallback_query}",
        )


def fetch_node_scopes(query_string: str, local_city: str, include_orgs: bool, include_experts: bool) -> Dict[str, Any]:
    cache_key = f"{query_string}||{local_city}||orgs={int(include_orgs)}||experts={int(include_experts)}"
    if cache_key in QUERY_CACHE:
        return QUERY_CACHE[cache_key]

    result: Dict[str, Any] = {}

    if include_orgs:
        result["national_orgs"] = fetch_org_scope(query_string)
        result["local_orgs"] = fetch_org_scope(query_string, local_city)

    if include_experts:
        result["national_experts"] = fetch_all_pages(
            lambda start: build_expert_url(query_string, start, PAGE_SIZE),
            extract_expert_items,
            f"experts national {query_string}",
        )
        result["local_experts"] = fetch_all_pages(
            lambda start: build_expert_url(query_string, start, PAGE_SIZE, local_city),
            extract_expert_items,
            f"experts {local_city} {query_string}",
        )
    QUERY_CACHE[cache_key] = result
    return result


def to_org_record(item: Dict[str, Any]) -> tuple[Any, ...]:
    industries = item.get("INDUSTRY") if isinstance(item.get("INDUSTRY"), list) else []
    tags = item.get("TAGS") if isinstance(item.get("TAGS"), list) else []
    return (
        get_org_uid(item),
        item.get("ID"),
        item.get("ORGID"),
        str(item.get("NAME") or ""),
        item.get("PROV"),
        item.get("CITY"),
        normalize_province_name(str(item.get("PROV") or "")),
        normalize_city_name(str(item.get("CITY") or "")),
        json.dumps(industries, ensure_ascii=False),
        " ".join(industries),
        json.dumps(tags, ensure_ascii=False),
        " ".join(tags),
        json.dumps(item, ensure_ascii=False),
    )


def to_expert_record(item: Dict[str, Any]) -> tuple[Any, ...]:
    titles = item.get("TITLE") if isinstance(item.get("TITLE"), list) else []
    return (
        get_expert_uid(item),
        item.get("AUID"),
        item.get("ID"),
        str(item.get("CNAME") or ""),
        item.get("AORG"),
        json.dumps(titles, ensure_ascii=False),
        " ".join(titles),
        int(item.get("H") or 0),
        int(item.get("QIKAN") or 0),
        int(item.get("ZHUANLI") or 0),
        int(item.get("CHENGGUO") or 0),
        int(item.get("CHANXUEYANHZ") or 0),
        json.dumps(item, ensure_ascii=False),
    )


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_SQL)
    node_org_hit_columns = {
        row[1]
        for row in conn.execute("PRAGMA table_info(node_org_hits)").fetchall()
    }
    if "scope_key" not in node_org_hit_columns:
        raise RuntimeError(
            "Existing DB schema is outdated for node_org_hits. Rebuild with --force to create the new four-scope structure."
        )


def upsert_meta(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)",
        (key, value),
    )


def get_node_scope_summary(conn: sqlite3.Connection, node_id: str, scope_key: str) -> sqlite3.Row | None:
    return conn.execute(
        """
        SELECT reported_org_total, cached_org_total, org_truncated,
               reported_expert_total, cached_expert_total, expert_truncated
        FROM node_scope_summary
        WHERE node_id = ? AND scope_key = ?
        """,
        (node_id, scope_key),
    ).fetchone()


def merge_node_scope_summary(
    conn: sqlite3.Connection,
    node_id: str,
    scope_key: str,
    org_summary: Dict[str, Any] | None = None,
    expert_summary: Dict[str, Any] | None = None,
) -> None:
    existing = get_node_scope_summary(conn, node_id, scope_key)
    reported_org_total = int(existing["reported_org_total"] if existing else 0)
    cached_org_total = int(existing["cached_org_total"] if existing else 0)
    org_truncated = bool(existing["org_truncated"] if existing else 0)
    reported_expert_total = int(existing["reported_expert_total"] if existing else 0)
    cached_expert_total = int(existing["cached_expert_total"] if existing else 0)
    expert_truncated = bool(existing["expert_truncated"] if existing else 0)

    if org_summary is not None:
        reported_org_total = int(org_summary.get("reported_total") or 0)
        cached_org_total = int(org_summary.get("cached_total") or 0)
        org_truncated = bool(org_summary.get("truncated"))

    if expert_summary is not None:
        reported_expert_total = int(expert_summary.get("reported_total") or 0)
        cached_expert_total = int(expert_summary.get("cached_total") or 0)
        expert_truncated = bool(expert_summary.get("truncated"))

    conn.execute(
        """
        INSERT OR REPLACE INTO node_scope_summary (
          node_id, scope_key, reported_org_total, cached_org_total, org_truncated,
          reported_expert_total, cached_expert_total, expert_truncated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            node_id,
            scope_key,
            int(reported_org_total or 0),
            int(cached_org_total or 0),
            1 if org_truncated else 0,
            int(reported_expert_total or 0),
            int(cached_expert_total or 0),
            1 if expert_truncated else 0,
        ),
    )


def mark_node_scope_fetch_status(
    conn: sqlite3.Connection,
    node_id: str,
    scope_key: str,
    org_done: bool = False,
    expert_done: bool = False,
) -> None:
    existing = conn.execute(
        """
        SELECT org_done, expert_done
        FROM node_scope_fetch_status
        WHERE node_id = ? AND scope_key = ?
        """,
        (node_id, scope_key),
    ).fetchone()
    next_org_done = int(bool(org_done) or bool(existing["org_done"] if existing else 0))
    next_expert_done = int(bool(expert_done) or bool(existing["expert_done"] if existing else 0))
    conn.execute(
        """
        INSERT OR REPLACE INTO node_scope_fetch_status (
          node_id, scope_key, org_done, expert_done
        ) VALUES (?, ?, ?, ?)
        """,
        (node_id, scope_key, next_org_done, next_expert_done),
    )


def has_completed_node_scope(conn: sqlite3.Connection, node_id: str, scope_key: str, kind: str) -> bool:
    column = "org_done" if kind == "orgs" else "expert_done"
    row = conn.execute(
        f"SELECT {column} FROM node_scope_fetch_status WHERE node_id = ? AND scope_key = ? LIMIT 1",
        (node_id, scope_key),
    ).fetchone()
    return bool(row[column] if row else 0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="industry-cache.db")
    parser.add_argument("--chain")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--force", action="store_true")
    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument("--orgs-only", action="store_true")
    mode_group.add_argument("--experts-only", action="store_true")
    args = parser.parse_args()

    output_path = Path(args.out).resolve()
    if output_path.exists():
        if args.force:
            output_path.unlink()
        else:
            log(f"Resuming existing DB: {output_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    local_province = normalize_province_name(os.environ.get("INDUSTRY_LOCAL_PROVINCE", "湖北"))
    local_city = normalize_city_name(os.environ.get("INDUSTRY_LOCAL_CITY", "宜昌"))
    local_scope_key = build_scope_key(local_province, local_city)
    selected_chains = set(args.chain.split(",")) if args.chain else None
    include_orgs = not args.experts_only
    include_experts = not args.orgs_only

    get_access_token()
    keywords_by_chain_label = json.loads(KEYWORDS_FILE.read_text(encoding="utf-8"))

    conn = sqlite3.connect(str(output_path))
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    ensure_schema(conn)

    for chain in CHAIN_META:
        if selected_chains and chain["chain_key"] not in selected_chains:
            continue

        node_mappings = keywords_by_chain_label.get(chain["chain_label"])
        if not node_mappings:
            log(f"Skipping {chain['chain_key']}, node mapping not found")
            continue

        conn.execute(
            "INSERT OR REPLACE INTO chains (chain_key, chain_label, chain_search_key) VALUES (?, ?, ?)",
            (chain["chain_key"], chain["chain_label"], chain["chain_search_key"]),
        )

        entries = list(node_mappings.items())
        if args.limit > 0:
            entries = entries[: args.limit]

        log(f"Processing {chain['chain_key']}, nodes: {len(entries)}")

        for node_name, mapping in entries:
            node_id = get_node_id(chain["chain_key"], node_name)
            conn.execute(
                "INSERT OR REPLACE INTO nodes (node_id, chain_key, node_name, norm_node_name, query_string) VALUES (?, ?, ?, ?, ?)",
                (node_id, chain["chain_key"], node_name, normalize_search_text(node_name), mapping["queryString"]),
            )

            keywords = list(dict.fromkeys([node_name, *mapping.get("keywords", [])]))
            for keyword in keywords:
                conn.execute(
                    "INSERT OR REPLACE INTO node_keywords (node_id, keyword, norm_keyword) VALUES (?, ?, ?)",
                    (node_id, keyword, normalize_search_text(keyword)),
                )

            national_done = (
                (not include_orgs or has_completed_node_scope(conn, node_id, "national", "orgs"))
                and (not include_experts or has_completed_node_scope(conn, node_id, "national", "experts"))
            )
            local_done = (
                (not include_orgs or has_completed_node_scope(conn, node_id, local_scope_key, "orgs"))
                and (not include_experts or has_completed_node_scope(conn, node_id, local_scope_key, "experts"))
            )

            if national_done and local_done:
                log(f"Skipping {chain['chain_key']}/{node_name}, already completed")
                continue

            log(f"Fetching {chain['chain_key']}/{node_name}")
            scopes = fetch_node_scopes(mapping["queryString"], local_city, include_orgs, include_experts)
            national_org_uids = {get_org_uid(org) for org in scopes.get("national_orgs", {}).get("items", [])}
            local_org_uids = {get_org_uid(org) for org in scopes.get("local_orgs", {}).get("items", [])}
            national_expert_uids = {get_expert_uid(expert) for expert in scopes.get("national_experts", {}).get("items", [])}
            local_expert_uids = {get_expert_uid(expert) for expert in scopes.get("local_experts", {}).get("items", [])}

            with conn:
                if include_orgs:
                    for org in scopes["national_orgs"]["items"]:
                        org_record = to_org_record(org)
                        conn.execute(
                            """
                            INSERT OR REPLACE INTO org_entities (
                              org_uid, id, orgid, name, prov, city, norm_prov, norm_city,
                              industry_json, industry_text, tags_json, tags_text, raw_json
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            org_record,
                        )
                        conn.execute(
                            "INSERT OR IGNORE INTO node_org_hits (node_id, org_uid, scope_key) VALUES (?, ?, ?)",
                            (node_id, org_record[0], "national"),
                        )

                    for org in scopes["local_orgs"]["items"]:
                        org_record = to_org_record(org)
                        conn.execute(
                            """
                            INSERT OR REPLACE INTO org_entities (
                              org_uid, id, orgid, name, prov, city, norm_prov, norm_city,
                              industry_json, industry_text, tags_json, tags_text, raw_json
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            org_record,
                        )
                        conn.execute(
                            "INSERT OR IGNORE INTO node_org_hits (node_id, org_uid, scope_key) VALUES (?, ?, ?)",
                            (node_id, org_record[0], local_scope_key),
                        )

                    merge_node_scope_summary(
                        conn,
                        node_id,
                        "national",
                        org_summary={
                            "reported_total": scopes["national_orgs"]["reportedTotal"],
                            "cached_total": len(national_org_uids),
                            "truncated": bool(scopes["national_orgs"]["truncated"]),
                        },
                    )
                    merge_node_scope_summary(
                        conn,
                        node_id,
                        local_scope_key,
                        org_summary={
                            "reported_total": scopes["local_orgs"]["reportedTotal"],
                            "cached_total": len(local_org_uids),
                            "truncated": bool(scopes["local_orgs"]["truncated"]),
                        },
                    )
                    mark_node_scope_fetch_status(conn, node_id, "national", org_done=True)
                    mark_node_scope_fetch_status(conn, node_id, local_scope_key, org_done=True)

                if include_experts:
                    for expert in scopes["national_experts"]["items"]:
                        expert_record = to_expert_record(expert)
                        conn.execute(
                            """
                            INSERT OR REPLACE INTO expert_entities (
                              expert_uid, auid, id, cname, aorg, title_json, title_text,
                              h, qikan, zhuanli, chengguo, chanxueyanhz, raw_json
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            expert_record,
                        )
                        conn.execute(
                            """
                            INSERT OR IGNORE INTO node_expert_hits (
                              node_id, expert_uid, scope_key, query_province, query_city, norm_query_province, norm_query_city
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            """,
                            (node_id, expert_record[0], "national", None, None, None, None),
                        )

                    for expert in scopes["local_experts"]["items"]:
                        expert_record = to_expert_record(expert)
                        conn.execute(
                            """
                            INSERT OR REPLACE INTO expert_entities (
                              expert_uid, auid, id, cname, aorg, title_json, title_text,
                              h, qikan, zhuanli, chengguo, chanxueyanhz, raw_json
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            expert_record,
                        )
                        conn.execute(
                            """
                            INSERT OR IGNORE INTO node_expert_hits (
                              node_id, expert_uid, scope_key, query_province, query_city, norm_query_province, norm_query_city
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                node_id,
                                expert_record[0],
                                local_scope_key,
                                local_province,
                                local_city,
                                local_province,
                                local_city,
                            ),
                        )

                    merge_node_scope_summary(
                        conn,
                        node_id,
                        "national",
                        expert_summary={
                            "reported_total": scopes["national_experts"]["reportedTotal"],
                            "cached_total": len(national_expert_uids),
                            "truncated": bool(scopes["national_experts"]["truncated"]),
                        },
                    )
                    merge_node_scope_summary(
                        conn,
                        node_id,
                        local_scope_key,
                        expert_summary={
                            "reported_total": scopes["local_experts"]["reportedTotal"],
                            "cached_total": len(local_expert_uids),
                            "truncated": bool(scopes["local_experts"]["truncated"]),
                        },
                    )
                    mark_node_scope_fetch_status(conn, node_id, "national", expert_done=True)
                    mark_node_scope_fetch_status(conn, node_id, local_scope_key, expert_done=True)

    built_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    upsert_meta(conn, "version", CACHE_VERSION)
    upsert_meta(conn, "built_at", built_at)
    upsert_meta(conn, "local_province", local_province)
    upsert_meta(conn, "local_city", local_city)
    upsert_meta(conn, "local_scope_key", local_scope_key)
    conn.execute("PRAGMA optimize")
    conn.commit()
    conn.close()

    log(f"Done: {output_path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # noqa: BLE001
        print(error, file=sys.stderr)
        sys.exit(1)
