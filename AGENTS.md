# @contentstack/datasync-manager – Agent guide

*Universal entry point* for contributors and AI agents. Detailed conventions live in **skills/*/SKILL.md**.

## What this repo is

| Field | Detail |
|-------|--------|
| *Name:* | [`@contentstack/datasync-manager`](https://github.com/contentstack/datasync-manager) |
| *Purpose:* | Primary Node.js module for [Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync): coordinates content stores, asset stores, and a listener (webhooks), and pulls stack changes via the **Contentstack Sync API** with a **delivery token**. |
| *Out of scope (if any):* | Not the standalone CDA or CMA client SDKs; not a generic HTTP client library—sync orchestration and Node **`https`** to the Sync API only. Say **DataSync** / **Sync API**, not “CMA”, for this package’s main behavior. |

## Tech stack (at a glance)

| Area | Details |
|------|---------|
| Language | TypeScript **4.9.x** → ES6, CommonJS (`tsconfig.json`); Node **>= 8** (`package.json` `engines`) |
| Build | `tsc` → `dist/`; `types` → `typings` (`package.json`) |
| Tests | **Jest** **29** + **ts-jest**; patterns in `jest.config.js`; tests under `test/**/*.ts` |
| Lint / coverage | **ESLint** (`npm run lint`); legacy **TSLint** (`tslint.json`, `npm run tslint`); Jest coverage to `coverage/` |
| Other | HTTP via Node **`https`**; logging via **`debug`** + `src/util/logger`; pre-commit **Talisman** + **Snyk** (`.husky/pre-commit`) |

## Commands (quick reference)

| Command type | Command |
|--------------|---------|
| Build | `npm run compile` or `npm run build-ts` (`clean` + `tsc`) |
| Test | `npm test` (`PLUGIN_PATH=./test/dummy` + Jest, coverage, verbose) |
| Lint | `npm run lint` / `npm run tslint` |

CI: [.github/workflows/check-version-bump.yml](.github/workflows/check-version-bump.yml) (version bump checks on PRs when applicable).

## Where the documentation lives: skills

| Skill | Path | What it covers |
|-------|------|----------------|
| Development workflow | [skills/dev-workflow/SKILL.md](skills/dev-workflow/SKILL.md) | Branches (`development` / `master`), release flow, build/test/lint, PR expectations, versioning |
| TypeScript conventions | [skills/typescript/SKILL.md](skills/typescript/SKILL.md) | `src/` layout, compiler settings, logging, lint |
| DataSync & Sync API | [skills/contentstack-datasync/SKILL.md](skills/contentstack-datasync/SKILL.md) | Public API, config, HTTP client, retries, tokens, core sync—**not** CMA |
| Testing | [skills/testing/SKILL.md](skills/testing/SKILL.md) | Jest, nock, `PLUGIN_PATH`, fixtures, credentials policy |
| Code review | [skills/code-review/SKILL.md](skills/code-review/SKILL.md) | PR checklist, severity (Blocker / Major / Minor) |

An index with “when to use” hints is in [skills/README.md](skills/README.md).

## Using Cursor (optional)

If you use *Cursor*, [.cursor/rules/README.md](.cursor/rules/README.md) only points to *AGENTS.md*—same docs as everyone else.
