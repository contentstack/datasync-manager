# @contentstack/datasync-manager

## What this package is

**Contentstack DataSync Manager** — the primary Node.js module for [Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync). It runs on your server, coordinates **content stores**, **asset stores**, and a **listener** (webhooks), and pulls stack changes via the **Contentstack Sync API** using a **delivery token** (read/sync path).

This is **not** the general-purpose Content Delivery API (CDA) or Content Management API (CMA) SDK packages. It is purpose-built for **synchronization** (`/v3/stacks/sync`, tokens, plugins, queues). Terminology in reviews and docs should say **DataSync** / **Sync API**, not “CMA” unless you are discussing something that truly uses Management APIs (this codebase does not).

- **Repository:** https://github.com/contentstack/datasync-manager  
- **Homepage / product docs:** https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync  

## Tech stack

| Area | Details |
|------|---------|
| Language | TypeScript **4.9.x** (compiles to ES6, CommonJS) |
| Runtime | Node.js **>= 8** (`engines` in `package.json`) |
| Build | `tsc` → `dist/`; types path `typings` (see `package.json` `types`) |
| Tests | **Jest** **29** + **ts-jest**; **nock** for HTTP mocking |
| HTTP client | Node **`https`** (no axios/fetch dependency) |
| Logging | **`debug`** (namespaces such as `sm:index`, `api`) + pluggable logger via `util/logger` |
| Other libs | `lodash`, `marked`, `@braintree/sanitize-url`, `write-file-atomic`, etc. (see `package.json`) |

## Public entry points and layout

| Role | Path |
|------|------|
| Package main | `dist/index.js` (built from `src/index.ts`) |
| Sync HTTP API wrapper | `src/api.ts` |
| Default config (Sync API paths, host, retries) | `src/config.ts` |
| Core sync loop, queue, plugins | `src/core/` |
| Utilities (logger, validation, paths) | `src/util/` |
| Built-in plugins (JS) | `src/plugins/` |
| Example consumer | `example/` |
| Tests + dummy stack config / mocks | `test/` (`test/dummy/` is fixtures; ignored as tests by Jest `testPathIgnorePatterns`) |

Exports from `src/index.ts` include `start`, `setConfig`, `getConfig`, `setContentStore`, `setAssetStore`, `setListener`, `push` / `unshift` / `pop`, `notifications`, etc.

## Common commands

| Command | Purpose |
|---------|---------|
| `npm run compile` | TypeScript compile to `dist/` |
| `npm run build-ts` | Clean + full compile (`clean` + `tsc`) |
| `npm test` | Jest with coverage and verbose output; sets `PLUGIN_PATH=./test/dummy` |
| `npm run lint` | ESLint (ensure project config exists or use defaults) |
| `npm run tslint` | TSLint on `src/**/*.ts` (legacy; still in `package.json`) |

Tests are **unit/integration-style** against **nock**-mocked HTTP and dummy connectors; there is no separate “live stack” test suite in-repo by default.

## Credentials and environment

- **Live / integration** tests against a real stack are **not** wired in this repo’s default `npm test`.  
- Dummy config uses **delivery token** + **api key** in `test/dummy/config.ts` (mock values).  
- Real deployments need stack **delivery token**, **api key**, optional **branch**, **environment**, sync tokens, and host/protocol as your app supplies via config (see `src/config.ts` and `src/api.ts` `init`).  
- Pre-commit may run **Talisman** and **Snyk** (see `.husky/pre-commit`); use `SKIP_HOOK=1` only when appropriate.

## Agent guidance index

- **Cursor rules (overview):** [.cursor/rules/README.md](.cursor/rules/README.md)  
- **Skills (deep dives):** [skills/README.md](skills/README.md)  
