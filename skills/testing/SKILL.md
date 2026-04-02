---
name: testing
description: How to run and extend Jest tests for DataSync Manager (nock, PLUGIN_PATH, fixtures)
---

# Testing

## Commands

- **`npm test`** — Runs Jest with coverage and verbose output. Equivalent to setting `PLUGIN_PATH=./test/dummy` so built-in plugin resolution finds `test/dummy/plugins/`.
- **`npm run compile`** — Build TypeScript before packaging or when tests import from `src/` via ts-jest (Jest compiles TS on the fly).

## Framework

- **Jest 29** + **ts-jest**, Node test environment (`jest.config.js`).
- **nock** mocks `https` requests to a fake host (see `test/dummy/config.ts` `contentstack.host`).

## Layout

| Path | Role |
|------|------|
| `test/index.ts`, `test/api.ts`, `test/core/*.ts` | Main suites |
| `test/dummy/config.ts` | Dummy stack config (api key, delivery token, sync_token) |
| `test/dummy/api-responses/` | Response payloads for nock |
| `test/dummy/plugins/` | Dummy plugins loaded via `PLUGIN_PATH` |
| `test/dummy/connector-listener-instances.ts` | Mock content store, asset store, listener |

`test/dummy/**` is excluded from Jest’s test file discovery so only top-level `test/**/*.ts` files run as tests.

## Environment

- Default tests **do not** call Contentstack production; no real credentials required.
- If you add opt-in live tests, use env vars (e.g. `CONTENTSTACK_*`) and `describe.skip` unless env is set; document in the test file.

## Mocks

- Prefer **nock** to assert headers (`access_token`, `api_key`, `x-user-agent`) like existing `beforeEach` blocks in `test/index.ts`.
- Match query params (`sync_token`, `pagination_token`, `environment`, `limit`) to the Sync API contract your code builds.

## Naming

- Tests are named by area (`sync.ts`, `token-management.ts`, …), not strictly `*.spec.ts`.
