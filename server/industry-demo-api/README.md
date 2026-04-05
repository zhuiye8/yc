# Industry Demo API

This service is the read-only data source for the `/industry` demo mode.

## What lives here

- `index.mjs`: Express entry for `/demo-api/*`
- `query.mjs`: SQLite query layer
- `db.mjs`: read-only database bootstrap
- `shared.mjs`: chain metadata and region normalization helpers
- `scripts/buildIndustryDemoDb.py`: local SQLite builder

## Local database build

Run from the repo root:

```bash
npm run build:industry-demo-db -- --force --out=./industry-cache.db
```

Build with a per-node cache cap of `1000` items while preserving the upstream reported totals:

```bash
INDUSTRY_DB_MAX_CACHED_ITEMS_PER_SCOPE=1000 npm run build:industry-demo-db -- --force --out=./industry-cache.db
```

Build orgs only:

```bash
INDUSTRY_DB_MAX_CACHED_ITEMS_PER_SCOPE=1000 npm run build:industry-demo-db -- --orgs-only --force --out=./industry-cache.db
```

Backfill experts only:

```bash
INDUSTRY_DB_MAX_CACHED_ITEMS_PER_SCOPE=1000 npm run build:industry-demo-db -- --experts-only --out=./industry-cache.db
```

The current schema stores four scopes per node:

- national orgs
- local-city orgs
- national experts
- local-city experts

If you built an older DB before this four-scope change, rebuild with `--force`.

Sample build:

```bash
npm run build:industry-demo-db -- --chain=ai --limit=1 --force --out=.research/industry-demo-sample.db
```

Optional environment variables:

- `WF_API_BASE_URL`
- `INDUSTRY_DB_PAGE_SIZE`
- `INDUSTRY_DB_INTERVAL_MS`
- `INDUSTRY_DB_MAX_RETRIES`
- `INDUSTRY_DB_MAX_RESULT_WINDOW`
- `INDUSTRY_DB_MAX_CACHED_ITEMS_PER_SCOPE`
- `INDUSTRY_LOCAL_PROVINCE`
- `INDUSTRY_LOCAL_CITY`

## Remote service install

Run on the Linux server inside this directory:

```bash
npm install --omit=dev
```

Start manually:

```bash
HOST=127.0.0.1 PORT=38071 DB_PATH=/opt/yc-demo-data/current/industry-cache.db node index.mjs
```

Or use a local env file:

```bash
cp .env.local.example .env.local
node --env-file=.env.local index.mjs
```

Package script:

```bash
npm run start:local
```

For local Windows testing without native `better-sqlite3` bindings, use:

```bash
pnpm start:local:py
```

The production deployment should still use `systemd` plus Nginx reverse proxy on `/demo-api/`.

## Frontend mode

Set:

```bash
VITE_INDUSTRY_DATA_SOURCE=demo-api
```

Optional demo delay:

```bash
VITE_INDUSTRY_DEMO_DELAY_MS=1200
```
