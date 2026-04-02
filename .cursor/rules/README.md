# Cursor rules for `@contentstack/datasync-manager`

Rules live in this folder as `.mdc` (and `dev-workflow.md`) with YAML frontmatter. Use them so changes stay aligned with DataSync, the Sync API, and this repo’s TypeScript/Jest setup.

## How to reference rules

In Cursor chat, you can **@** mention a rule file (e.g. `@dev-workflow`, `@typescript`, `@contentstack-datasync-sync-api`, `@testing`, `@code-review`) to pull it into context when working on matching files or tasks.

| File | `alwaysApply` | `globs` | When it applies |
|------|---------------|---------|-----------------|
| [dev-workflow.md](./dev-workflow.md) | no | *(none)* | Branching, CI/versioning, how to run lint/tests, PR expectations. |
| [typescript.mdc](./typescript.mdc) | no | `src/**/*.ts` | TypeScript layout, logging (`debug`), style notes (TSLint/ESLint, `tsconfig`). |
| [contentstack-datasync-sync-api.mdc](./contentstack-datasync-sync-api.mdc) | no | `src/api.ts`, `src/config.ts`, `src/core/**/*.ts` | Sync API usage: delivery token, host/branch, retries, `https` client behavior — **not** CMA. |
| [testing.mdc](./testing.mdc) | no | `test/**/*.ts`, `jest.config.js` | Jest, nock, `PLUGIN_PATH`, dummy config paths. |
| [code-review.mdc](./code-review.mdc) | **yes** | *(global)* | PR checklist: API docs, compatibility, errors, security, tests, DataSync terminology. |

## Related docs

- [AGENTS.md](../../AGENTS.md) — single entry point for the repo.  
- [skills/README.md](../../skills/README.md) — expanded checklists and how-tos.  
