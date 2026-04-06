---
name: testing
description: Jest setup, nock mocks, PLUGIN_PATH, test/dummy fixtures, and credentials policy for DataSync Manager
---

# Testing – @contentstack/datasync-manager

## When to use

- Running or writing tests under **`test/`**, or debugging **Jest** / **nock** behavior.
- Adding opt-in live tests (document env vars clearly).

## Instructions

### Commands

- **`npm test`** — Jest with coverage and verbose output; sets `PLUGIN_PATH=./test/dummy` so plugin resolution finds `test/dummy/plugins/`.
- **`npm run compile`** — Build before packaging; Jest uses ts-jest for TypeScript.

### Runner and config

- **Jest 29** + **ts-jest** (`jest.config.js`): Node environment, `test/**/*.ts` / `test/**/*.js`, coverage to `coverage/`, HTML reporter.
- **`test/dummy/`** is excluded from test discovery (`testPathIgnorePatterns`) — fixtures only.

### Layout

| Path | Role |
|------|------|
| `test/index.ts`, `test/api.ts`, `test/core/*.ts` | Main suites |
| `test/dummy/config.ts` | Dummy stack config (api key, delivery token, sync_token) |
| `test/dummy/api-responses/` | Canned payloads for publish/unpublish/delete, etc. |
| `test/dummy/plugins/` | Loaded via `PLUGIN_PATH` |
| `test/dummy/connector-listener-instances.ts` | Mock content store, asset store, listener |

### Credentials policy

- Default tests **do not** call production Contentstack; no real credentials required.
- For **opt-in live** tests, use env vars (e.g. `CONTENTSTACK_*`) and `describe.skip` unless env is set; document in the test file.

### Mocks

- Use **nock** against the dummy host from `test/dummy/config.ts` (`contentstack.host`).
- Assert headers: `access_token`, `api_key`, `x-user-agent` (see `test/index.ts` `beforeEach` patterns).
- Match query params (`sync_token`, `pagination_token`, `environment`, `limit`) to what `src/api.ts` builds.

### Naming

- Files by area (`sync.ts`, `token-management.ts`, …), not strictly `*.spec.ts`.

## References

- [contentstack-datasync/SKILL.md](../contentstack-datasync/SKILL.md) — Sync API behavior under test.
- [dev-workflow/SKILL.md](../dev-workflow/SKILL.md) — `npm test` in the full workflow.
