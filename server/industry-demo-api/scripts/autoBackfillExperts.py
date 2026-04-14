import argparse
import os
import subprocess
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
SERVICE_DIR = SCRIPT_DIR.parent
REPO_ROOT = SERVICE_DIR.parent.parent
BUILD_SCRIPT = SCRIPT_DIR / "buildIndustryDemoDb.py"
LOCK_FILE = Path(os.environ.get("INDUSTRY_EXPERT_BACKFILL_LOCK", "/tmp/yc-industry-expert-backfill.lock"))


def log(message: str) -> None:
    print(f"[industry-expert-backfill] {message}")


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


def probe_expert_api(probe_query: str, probe_city: str | None) -> bool:
    from buildIndustryDemoDb import build_expert_url, extract_total, fetch_json, get_access_token

    url = build_expert_url(probe_query, 0, 1, probe_city)
    result = fetch_json(
        url,
        headers={"Authorization": f"Bearer {get_access_token()}"},
        label=f"probe experts {probe_city or 'national'} {probe_query}",
    )
    total = extract_total(result)
    log(f"probe ok, query={probe_query}, city={probe_city or '-'}, total={total}")
    return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", default=".env.backfill.local")
    args = parser.parse_args()

    env_values = load_env_file(Path(args.env_file))
    merged_env = os.environ.copy()
    merged_env.update(env_values)

    db_path = merged_env.get("DB_PATH", str((REPO_ROOT / "industry-cache.db").resolve()))
    probe_query = merged_env.get("INDUSTRY_TALENT_PROBE_QUERY", "人工智能")
    probe_city = merged_env.get("INDUSTRY_TALENT_PROBE_CITY", "")

    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LOCK_FILE.open("w", encoding="utf-8") as lock_handle:
        try:
            import fcntl

            fcntl.flock(lock_handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            log("another expert backfill process is already running, skipping")
            return

        try:
            if not Path(db_path).exists():
                log(f"db not found: {db_path}")
                sys.exit(1)

            try:
                probe_expert_api(probe_query, probe_city or None)
            except Exception as error:  # noqa: BLE001
                log(f"probe failed: {error}")
                return

            command = [
                sys.executable,
                str(BUILD_SCRIPT),
                "--experts-only",
                "--out",
                db_path,
            ]
            log(f"starting experts-only backfill for {db_path}")
            completed = subprocess.run(
                command,
                cwd=str(REPO_ROOT),
                env=merged_env,
                check=False,
            )
            if completed.returncode != 0:
                log(f"experts-only backfill failed with exit code {completed.returncode}")
                sys.exit(completed.returncode)
            log("experts-only backfill finished")
        finally:
            try:
                fcntl.flock(lock_handle.fileno(), fcntl.LOCK_UN)
            except Exception:  # noqa: BLE001
                pass


if __name__ == "__main__":
    main()
