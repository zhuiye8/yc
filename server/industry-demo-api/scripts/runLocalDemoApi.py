import argparse
import json
import sqlite3
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse


def load_env_file(env_path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not env_path.exists():
        return values

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def normalize_province_name(value: str | None) -> str:
    text = str(value or "").strip()
    for suffix in ["维吾尔自治区", "壮族自治区", "回族自治区", "特别行政区", "自治区", "省", "市"]:
        if text.endswith(suffix):
            text = text[: -len(suffix)]
            break
    return text.strip()


def normalize_city_name(value: str | None) -> str:
    text = str(value or "").strip()
    for suffix in ["自治州", "地区", "盟", "市"]:
        if text.endswith(suffix):
            text = text[: -len(suffix)]
            break
    return text.strip()


def normalize_search_text(value: str | None) -> str:
    text = str(value or "").lower()
    for char in ['(', ')', '[', ']', '{', '}', '<', '>', '《', '》', '“', '”', '"', "'", '‘', '’',
                 '、', '，', '。', '；', '：', ':', ',', '.', '!', '?', '！', '？', ' ', '-', '_', '/', '\\', '|']:
        text = text.replace(char, "")
    return text.strip()


@dataclass
class Scope:
    scope_key: str
    province: str | None
    city: str | None
    is_national: bool
    is_province: bool
    is_city: bool


def resolve_scope(province: str | None, city: str | None) -> Scope:
    norm_province = normalize_province_name(province)
    norm_city = normalize_city_name(city)

    if norm_city:
        scope_key = f"city:{norm_province}|{norm_city}" if norm_province else f"city:|{norm_city}"
    elif norm_province:
        scope_key = f"province:{norm_province}"
    else:
        scope_key = "national"

    return Scope(
        scope_key=scope_key,
        province=norm_province or None,
        city=norm_city or None,
        is_national=scope_key == "national",
        is_province=scope_key.startswith("province:"),
        is_city=scope_key.startswith("city:"),
    )


def parse_items(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [json.loads(row["raw_json"]) for row in rows]


class DemoApi:
    def __init__(self, db_path: Path):
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row

    def get_health(self) -> dict[str, Any]:
        version = self.conn.execute("select value from meta where key='version'").fetchone()
        built_at = self.conn.execute("select value from meta where key='built_at'").fetchone()
        return {
            "ok": True,
            "version": version["value"] if version else None,
            "builtAt": built_at["value"] if built_at else None,
        }

    def build_org_filter(self, scope: Scope, alias: str = "o") -> tuple[str, list[str]]:
        if scope.is_city:
            return f" AND {alias}.norm_prov = ? AND {alias}.norm_city = ?", [scope.province or "", scope.city or ""]
        if scope.is_province:
            return f" AND {alias}.norm_prov = ?", [scope.province or ""]
        return "", []

    def get_node_scope_totals(self, node_id: str, scope_key: str) -> dict[str, Any]:
        row = self.conn.execute(
            """
            SELECT reported_org_total, cached_org_total, org_truncated,
                   reported_expert_total, cached_expert_total, expert_truncated
            FROM node_scope_summary
            WHERE node_id = ? AND scope_key = ?
            """,
            (node_id, scope_key),
        ).fetchone()
        return {
            "reported_org_total": int((row["reported_org_total"] if row else 0) or 0),
            "cached_org_total": int((row["cached_org_total"] if row else 0) or 0),
            "org_truncated": bool((row["org_truncated"] if row else 0) or 0),
            "reported_expert_total": int((row["reported_expert_total"] if row else 0) or 0),
            "cached_expert_total": int((row["cached_expert_total"] if row else 0) or 0),
            "expert_truncated": bool((row["expert_truncated"] if row else 0) or 0),
        }

    def get_reported_totals_for_nodes(self, node_ids: list[str], scope_key: str) -> dict[str, int]:
        if not node_ids:
            return {"org_total": 0, "expert_total": 0}
        placeholders = ",".join(["?"] * len(node_ids))
        row = self.conn.execute(
            f"""
            SELECT
              COALESCE(SUM(reported_org_total), 0) AS org_total,
              COALESCE(SUM(reported_expert_total), 0) AS expert_total
            FROM node_scope_summary
            WHERE node_id IN ({placeholders}) AND scope_key = ?
            """,
            (*node_ids, scope_key),
        ).fetchone()
        return {
            "org_total": int((row["org_total"] if row else 0) or 0),
            "expert_total": int((row["expert_total"] if row else 0) or 0),
        }

    def get_chain_summary(self, chain_key: str, province: str | None, city: str | None) -> dict[str, Any]:
        scope = resolve_scope(province, city)
        rows = self.conn.execute(
            """
            SELECT n.node_name, COALESCE(s.reported_org_total, 0) AS org_total
            FROM nodes n
            LEFT JOIN node_scope_summary s ON s.node_id = n.node_id AND s.scope_key = ?
            WHERE n.chain_key = ?
            ORDER BY n.node_name ASC
            """,
            (scope.scope_key, chain_key),
        ).fetchall()
        totals = self.get_reported_totals_for_nodes(
            [row["node_id"] for row in self.conn.execute("SELECT node_id FROM nodes WHERE chain_key = ?", (chain_key,)).fetchall()],
            scope.scope_key,
        )

        node_org_counts = {row["node_name"]: int(row["org_total"] or 0) for row in rows}
        total = len(rows)
        covered = sum(1 for count in node_org_counts.values() if count > 0)
        rate = (covered / total * 100) if total else 0
        chain_org_total = totals["org_total"]
        chain_expert_total = totals["expert_total"]
        chain_status = "missing" if chain_org_total == 0 else ("weak" if chain_org_total <= 20 else "strong")

        return {
            "scopeKey": scope.scope_key,
            "covered": covered,
            "total": total,
            "rate": rate,
            "chainStatus": chain_status,
            "chainOrgTotal": int(chain_org_total or 0),
            "chainExpertTotal": int(chain_expert_total or 0),
            "nodeOrgCounts": node_org_counts,
        }

    def get_aggregated_items(self, node_ids: list[str], entity_type: str, scope: Scope, page: int, page_size: int) -> dict[str, Any]:
        placeholders = ",".join(["?"] * len(node_ids))
        offset = (page - 1) * page_size

        if entity_type == "orgs":
            filter_sql, filter_params = self.build_org_filter(scope)
            hit_scope_key = scope.scope_key if scope.is_national else "national"
            total_row = self.conn.execute(
                f"""
                SELECT COUNT(DISTINCT o.org_uid) AS total
                FROM node_org_hits h
                JOIN org_entities o ON o.org_uid = h.org_uid
                WHERE h.node_id IN ({placeholders}) AND h.scope_key = ?{filter_sql}
                """,
                (*node_ids, hit_scope_key, *filter_params),
            ).fetchone()
            rows = self.conn.execute(
                f"""
                SELECT o.raw_json
                FROM node_org_hits h
                JOIN org_entities o ON o.org_uid = h.org_uid
                WHERE h.node_id IN ({placeholders}) AND h.scope_key = ?{filter_sql}
                GROUP BY o.org_uid
                ORDER BY o.name ASC
                LIMIT ? OFFSET ?
                """,
                (*node_ids, hit_scope_key, *filter_params, page_size, offset),
            ).fetchall()
            return {"total": int(total_row["total"] or 0), "items": parse_items(rows)}

        total_row = self.conn.execute(
            f"""
            SELECT COUNT(DISTINCT e.expert_uid) AS total
            FROM node_expert_hits h
            JOIN expert_entities e ON e.expert_uid = h.expert_uid
            WHERE h.node_id IN ({placeholders}) AND h.scope_key = ?
            """,
            (*node_ids, scope.scope_key),
        ).fetchone()
        rows = self.conn.execute(
            f"""
            SELECT e.raw_json
            FROM node_expert_hits h
            JOIN expert_entities e ON e.expert_uid = h.expert_uid
            WHERE h.node_id IN ({placeholders}) AND h.scope_key = ?
            GROUP BY e.expert_uid
            ORDER BY COALESCE(e.h, 0) DESC, COALESCE(e.qikan, 0) DESC, e.cname ASC
            LIMIT ? OFFSET ?
            """,
            (*node_ids, scope.scope_key, page_size, offset),
        ).fetchall()
        return {"total": int(total_row["total"] or 0), "items": parse_items(rows)}

    def get_chain_city_distribution(self, chain_key: str, province: str | None) -> list[dict[str, Any]]:
        """获取产业链在指定省份内各城市的机构分布（去重计数，按机构数降序）"""
        norm_prov = normalize_province_name(province)
        if not norm_prov:
            return []

        rows = self.conn.execute(
            """
            SELECT o.norm_city AS city, COUNT(DISTINCT o.org_uid) AS total
            FROM node_org_hits h
            JOIN org_entities o ON o.org_uid = h.org_uid
            JOIN nodes n ON n.node_id = h.node_id
            WHERE n.chain_key = ?
              AND o.norm_prov = ?
              AND o.norm_city IS NOT NULL
              AND o.norm_city != ''
            GROUP BY o.norm_city
            ORDER BY total DESC
            """,
            (chain_key, norm_prov),
        ).fetchall()
        return [{"city": str(row["city"]), "total": int(row["total"] or 0)} for row in rows]

    def get_chain_province_distribution(self, chain_key: str) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            """
            SELECT o.norm_prov AS province, COUNT(DISTINCT o.org_uid) AS total
            FROM node_org_hits h
            JOIN org_entities o ON o.org_uid = h.org_uid
            JOIN nodes n ON n.node_id = h.node_id
            WHERE n.chain_key = ?
              AND o.norm_prov IS NOT NULL
              AND o.norm_prov != ''
            GROUP BY o.norm_prov
            ORDER BY total DESC
            """,
            (chain_key,),
        ).fetchall()
        return [{"province": str(row["province"]), "total": int(row["total"] or 0)} for row in rows]

    def get_chain_aggregate(self, chain_key: str, entity_type: str, province: str | None, city: str | None, page: int, page_size: int) -> dict[str, Any]:
        node_ids = [row["node_id"] for row in self.conn.execute("select node_id from nodes where chain_key = ? order by node_name asc", (chain_key,)).fetchall()]
        if not node_ids:
            return {"total": 0, "items": []}
        return self.get_aggregated_items(node_ids, entity_type, resolve_scope(province, city), page, page_size)

    def get_node_stats(self, chain_key: str, node_name: str, province: str | None, city: str | None) -> dict[str, Any] | None:
        node = self.conn.execute(
            "select node_id, query_string from nodes where chain_key = ? and node_name = ? limit 1",
            (chain_key, node_name),
        ).fetchone()
        if not node:
            return None

        scope = resolve_scope(province, city)
        national_summary = self.get_node_scope_totals(node["node_id"], "national")
        scoped_summary = national_summary if scope.is_national else self.get_node_scope_totals(node["node_id"], scope.scope_key)
        org_total = national_summary["reported_org_total"]
        expert_total = national_summary["reported_expert_total"]
        local_org_total = scoped_summary["reported_org_total"]
        local_expert_total = scoped_summary["reported_expert_total"]

        return {
            "queryString": node["query_string"],
            "orgTotal": org_total,
            "localOrgTotal": local_org_total,
            "expertTotal": expert_total,
            "localExpertTotal": local_expert_total,
            "scopeKey": scope.scope_key,
            "orgCachedTotal": scoped_summary["cached_org_total"],
            "expertCachedTotal": scoped_summary["cached_expert_total"],
            "orgTruncated": scoped_summary["org_truncated"],
            "expertTruncated": scoped_summary["expert_truncated"],
        }

    def get_node_items(self, chain_key: str, node_name: str, entity_type: str, province: str | None, city: str | None, page: int, page_size: int) -> dict[str, Any]:
        node = self.conn.execute(
            "select node_id from nodes where chain_key = ? and node_name = ? limit 1",
            (chain_key, node_name),
        ).fetchone()
        if not node:
            return {"total": 0, "items": []}
        return self.get_aggregated_items([node["node_id"]], entity_type, resolve_scope(province, city), page, page_size)

    def search_entities(self, entity_type: str, scope: Scope, keyword: str, limit: int) -> dict[str, Any]:
        like = f"%{keyword}%"
        if entity_type == "orgs":
            filter_sql, params = self.build_org_filter(scope)
            total_row = self.conn.execute(
                f"""
                SELECT COUNT(DISTINCT o.org_uid) AS total
                FROM org_entities o
                WHERE (o.name LIKE ? OR o.industry_text LIKE ? OR o.tags_text LIKE ?){filter_sql}
                """,
                (like, like, like, *params),
            ).fetchone()
            rows = self.conn.execute(
                f"""
                SELECT o.raw_json
                FROM org_entities o
                WHERE (o.name LIKE ? OR o.industry_text LIKE ? OR o.tags_text LIKE ?){filter_sql}
                ORDER BY o.name ASC
                LIMIT ?
                """,
                (like, like, like, *params, limit),
            ).fetchall()
            return {"total": int(total_row["total"] or 0), "items": parse_items(rows)}

        total_row = self.conn.execute(
            """
            SELECT COUNT(DISTINCT e.expert_uid) AS total
            FROM node_expert_hits h
            JOIN expert_entities e ON e.expert_uid = h.expert_uid
            WHERE h.scope_key = ? AND (e.cname LIKE ? OR e.aorg LIKE ? OR e.title_text LIKE ?)
            """,
            (scope.scope_key, like, like, like),
        ).fetchone()
        rows = self.conn.execute(
            """
            SELECT e.raw_json
            FROM node_expert_hits h
            JOIN expert_entities e ON e.expert_uid = h.expert_uid
            WHERE h.scope_key = ? AND (e.cname LIKE ? OR e.aorg LIKE ? OR e.title_text LIKE ?)
            GROUP BY e.expert_uid
            ORDER BY COALESCE(e.h, 0) DESC, COALESCE(e.qikan, 0) DESC, e.cname ASC
            LIMIT ?
            """,
            (scope.scope_key, like, like, like, limit),
        ).fetchall()
        return {"total": int(total_row["total"] or 0), "items": parse_items(rows)}

    def search_industry(self, keyword: str, province: str | None, city: str | None, limit: int) -> dict[str, Any]:
        normalized = normalize_search_text(keyword)
        if not normalized:
            return {"mode": "empty", "matchedLabels": [], "orgs": [], "orgTotal": 0, "experts": [], "expertTotal": 0}

        match_rows = self.conn.execute(
            """
            SELECT DISTINCT n.node_id, n.node_name
            FROM nodes n
            LEFT JOIN node_keywords k ON k.node_id = n.node_id
            WHERE n.norm_node_name LIKE ? OR k.norm_keyword LIKE ?
            ORDER BY n.node_name ASC
            LIMIT 24
            """,
            (f"%{normalized}%", f"%{normalized}%"),
        ).fetchall()

        scope = resolve_scope(province, city)
        if match_rows:
            node_ids = [row["node_id"] for row in match_rows]
            org_result = self.get_aggregated_items(node_ids, "orgs", scope, 1, limit)
            expert_result = self.get_aggregated_items(node_ids, "experts", scope, 1, limit)
            totals = self.get_reported_totals_for_nodes(node_ids, scope.scope_key)
            return {
                "mode": "node-match",
                "matchedLabels": [row["node_name"] for row in match_rows],
                "orgs": org_result["items"],
                "orgTotal": totals["org_total"],
                "experts": expert_result["items"],
                "expertTotal": totals["expert_total"],
            }

        org_result = self.search_entities("orgs", scope, keyword, limit)
        expert_result = self.search_entities("experts", scope, keyword, limit)
        return {
            "mode": "fallback",
            "matchedLabels": [],
            "orgs": org_result["items"],
            "orgTotal": org_result["total"],
            "experts": expert_result["items"],
            "expertTotal": expert_result["total"],
        }


def get_first(params: dict[str, list[str]], key: str, default: str | None = None) -> str | None:
    values = params.get(key)
    if not values:
        return default
    return values[0]


def build_handler(api: DemoApi):
    class Handler(BaseHTTPRequestHandler):
        def _send_json(self, status: int, payload: dict[str, Any]) -> None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:  # noqa: N802
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)

            try:
                if parsed.path == "/health":
                    self._send_json(200, api.get_health())
                    return

                if parsed.path.startswith("/industry/chains/") and parsed.path.endswith("/summary"):
                    chain_key = parsed.path.split("/")[3]
                    self._send_json(200, api.get_chain_summary(chain_key, get_first(params, "province"), get_first(params, "city")))
                    return

                if parsed.path.startswith("/industry/chains/") and parsed.path.endswith("/city-distribution"):
                    chain_key = parsed.path.split("/")[3]
                    province = get_first(params, "province")
                    if not province:
                        self._send_json(400, {"error": "province is required"})
                        return
                    self._send_json(200, api.get_chain_city_distribution(chain_key, province))
                    return

                if parsed.path.startswith("/industry/chains/") and parsed.path.endswith("/province-distribution"):
                    chain_key = parsed.path.split("/")[3]
                    self._send_json(200, api.get_chain_province_distribution(chain_key))
                    return

                if parsed.path.startswith("/industry/chains/") and "/aggregate/" in parsed.path:
                    parts = parsed.path.split("/")
                    chain_key = parts[3]
                    entity_type = parts[5]
                    self._send_json(
                        200,
                        api.get_chain_aggregate(
                            chain_key,
                            entity_type,
                            get_first(params, "province"),
                            get_first(params, "city"),
                            int(get_first(params, "page", "1") or 1),
                            int(get_first(params, "pageSize", "10") or 10),
                        ),
                    )
                    return

                if parsed.path == "/industry/nodes/stats":
                    chain_key = get_first(params, "chainKey")
                    node_name = get_first(params, "nodeName")
                    if not chain_key or not node_name:
                        self._send_json(400, {"error": "chainKey and nodeName are required"})
                        return
                    result = api.get_node_stats(chain_key, node_name, get_first(params, "province"), get_first(params, "city"))
                    if result is None:
                        self._send_json(404, {"error": "node not found"})
                        return
                    self._send_json(200, result)
                    return

                if parsed.path == "/industry/nodes/items":
                    chain_key = get_first(params, "chainKey")
                    node_name = get_first(params, "nodeName")
                    entity_type = get_first(params, "type")
                    if not chain_key or not node_name or not entity_type:
                        self._send_json(400, {"error": "chainKey, nodeName and type are required"})
                        return
                    self._send_json(
                        200,
                        api.get_node_items(
                            chain_key,
                            node_name,
                            entity_type,
                            get_first(params, "province"),
                            get_first(params, "city"),
                            int(get_first(params, "page", "1") or 1),
                            int(get_first(params, "pageSize", "10") or 10),
                        ),
                    )
                    return

                if parsed.path == "/industry/search":
                    self._send_json(
                        200,
                        api.search_industry(
                            get_first(params, "q", "") or "",
                            get_first(params, "province"),
                            get_first(params, "city"),
                            int(get_first(params, "limit", "50") or 50),
                        ),
                    )
                    return

                self._send_json(404, {"error": "not_found"})
            except Exception as error:  # noqa: BLE001
                self._send_json(500, {"error": "internal_error", "message": str(error)})

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
            return

    return Handler


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", default=".env.local")
    args = parser.parse_args()

    env_values = load_env_file(Path(args.env_file))
    host = env_values.get("HOST", "127.0.0.1")
    port = int(env_values.get("PORT", "38071"))
    db_path = Path(env_values.get("DB_PATH", "./industry-cache.db"))
    if not db_path.is_absolute():
        db_path = (Path.cwd() / db_path).resolve()

    api = DemoApi(db_path)
    server = ThreadingHTTPServer((host, port), build_handler(api))
    print(f"[industry-demo-api:py] listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
