# Industry Demo API

This directory is a historical local development helper. The current main
application no longer depends on `/demo-api` for industry, company, or talent
data.

Current production data source rules live in:

- `DATA_SOURCES.md`
- `docs/SESSION-HANDOFF.md`

## When To Use

Only use this service if you need to inspect or reproduce the old local SQLite
demo data flow. Do not use it as the default deployment path for the current
project.

## Local Start

Install dependencies inside this directory:

```bash
pnpm install
```

Start the old read-only API:

```bash
pnpm start:local:py
```

The historical API reads `industry-cache.db` through `DB_PATH` or the local
env file. This service should remain isolated from the current TG/WF API
integration.
