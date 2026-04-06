---
name: code-review
description: PR review checklist for DataSync Manager—Sync API terminology, security, tests, optional severity labels
---

# Code review – @contentstack/datasync-manager

## When to use

- Reviewing a pull request or preparing one for review.
- You need a consistent checklist for **DataSync** / **Sync API** changes (not CMA).

## Instructions

### Scope and naming

- **DataSync Manager** uses the **Contentstack Sync API** and a **delivery token**. It is **not** the CMA SDK; do not describe it as “management” or “CMA” unless the code path actually uses Management APIs (rare here).

### Public surface

- **`src/index.ts`**: JSDoc for new or changed exports, matching existing style.
- **Config**: Document new `contentstack` / `syncManager` options when behavior is user-visible.

### Correctness

- **Queues and notifications**: `push` / `unshift` / `pop` and `notifications` events (`publish`, `unpublish`, `delete`, `error`) must stay consistent for integrators.
- **Token lifecycle**: `.tokens`, `.ledger`, `.checkpoint` and **Error 141** recovery in `src/api.ts`—verify edge cases and no infinite loops.
- **Webhook + fallback polling** (`src/index.ts`): no timer leaks or duplicate `poke()` calls.

### Security

- HTTPS path/query handling must remain safe from SSRF (`src/api.ts`).
- No secrets in logs; **Talisman** / **Snyk** expectations stay satisfied.

### Dependencies

- Prefer minimal, audited dependencies per team policy.

### Tests

- Add or update **Jest** tests with **nock** for HTTP; follow `test/dummy` patterns.
- Run **`npm test`** before approving risky changes.

### Severity (optional labels)

| Label | Examples |
|-------|----------|
| **Blocker** | Security regression, data loss risk, infinite retries, broken public API contract |
| **Major** | Wrong Sync API semantics, missing tests for critical paths, breaking change without version strategy |
| **Minor** | Style, logging, non-user-facing refactors, doc-only gaps |

## References

- [contentstack-datasync/SKILL.md](../contentstack-datasync/SKILL.md) — intended semantics.
- [testing/SKILL.md](../testing/SKILL.md) — test expectations.
- [AGENTS.md](../../AGENTS.md) — project entry point.
