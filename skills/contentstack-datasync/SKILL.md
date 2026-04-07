---
name: contentstack-datasync
description: DataSync Manager public API, Sync API (delivery token), HTTP client, config, and core sync—not CMA
---

# DataSync & Sync API – @contentstack/datasync-manager

## When to use

- Changing **`src/index.ts`**, **`src/api.ts`**, **`src/config.ts`**, or **`src/core/`**.
- You need to know how this package differs from **CMA** or generic CDA clients.

## Instructions

### What this package is

**`@contentstack/datasync-manager`** connects **content store**, **asset store**, and **listener** (webhooks) to Contentstack’s **Sync API** using a **delivery token**. It is **not** the Content Management API (CMA) client and not a generic CDA SDK—it orchestrates **synchronization** (incremental sync, webhooks, optional fallback polling).

Official docs: [Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync).

### Where to change things

| Concern | Location |
|---------|----------|
| Public API (`start`, stores, queue, notifications) | `src/index.ts` |
| HTTP to Sync API (retries, 429, error 141, headers) | `src/api.ts` |
| Defaults (host, paths, retry limits, content type URLs) | `src/config.ts` |
| Sync loop, queue, plugins, token files | `src/core/` |
| Validation, logger, paths | `src/util/` |
| Built-in plugins | `src/plugins/` |

### Configuration (`contentstack` object / `src/config.ts`)

- **Host / protocol / port**: Defaults include `host: 'cdn.contentstack.io'`, `protocol: 'https:'`, `port: 443`.
- **Endpoints**: e.g. `apis.sync: '/v3/stacks/sync'`, `apis.content_types: '/v3/content_types/'`.
- **Auth headers** (`src/api.ts` `init`): `api_key`, `access_token` (delivery token), optional `branch`, `X-User-Agent` (`datasync-manager/v<version>`).
- **Retries / timing**: `MAX_RETRY_LIMIT`, `RETRY_DELAY_BASE`, `TIMEOUT` — overridable from user config.

### HTTP client (`src/api.ts`)

- Node **`https.request`**; paths from config + query; **SSRF** mitigation via `URL` + `@braintree/sanitize-url`.
- **429** and **5xx**: Retries with backoff (`Math.pow(Math.SQRT2, RETRY) * RETRY_DELAY_BASE`).
- **Error 141** (invalid `sync_token`): clear tokens, set `init: true`, one recovery attempt to avoid loops.
- **Network errors** (`ECONNRESET`, `ETIMEDOUT`, etc.): Retries up to `MAX_RETRY_LIMIT`.

### Core sync (`src/core/`)

- Queue, plugin pipeline, token persistence (`.tokens`, `.checkpoint`, `.ledger` — see `npm run clean`), webhook/fallback behavior—preserve on-disk contracts when changing persistence.

### Config flow

- Consumer calls `setContentStore`, `setAssetStore`, `setListener`, optional `setConfig`, then **`start()`**.
- Internal config merges `src/config.ts` defaults with user config; `api` `init` runs when the core wires the API helper.

### Wording

- Use **Sync API**, **delivery token**, **DataSync**—not “CMA” for this module’s primary behavior.

## References

- [typescript/SKILL.md](../typescript/SKILL.md) — `src/` conventions.
- [testing/SKILL.md](../testing/SKILL.md) — nock and Sync API tests.
- [code-review/SKILL.md](../code-review/SKILL.md) — API and security review points.
