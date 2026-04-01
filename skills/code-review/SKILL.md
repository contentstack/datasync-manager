---
name: code-review
description: PR review checklist for Contentstack DataSync Manager (Sync API, TypeScript, Jest, security)
---

# Code review (expanded)

Use this alongside [.cursor/rules/code-review.mdc](../../.cursor/rules/code-review.mdc).

## Scope and naming

- **DataSync Manager** syncs content via the **Contentstack Sync API** using a **delivery token**. It is **not** the CMA SDK; avoid calling it “management” or “CMA” unless the code path actually uses Management APIs (this codebase generally does not).

## Public surface

- **`src/index.ts`**: Document new or changed exports (JSDoc style matching existing blocks).
- **Config**: Document new `contentstack` / `syncManager` options in code comments or consumer-facing docs when behavior is user-visible.

## Correctness

- **Queues and notifications**: `push`/`unshift`/`pop` and `notifications` events (`publish`, `unpublish`, `delete`, `error`) must stay consistent for integrators.
- **Token lifecycle**: `.tokens`, `.ledger`, `.checkpoint` behavior and Error **141** recovery in `src/api.ts` are sensitive — verify edge cases.
- **Webhook + fallback polling**: Changes in `src/index.ts` monitoring should not leak timers or duplicate `poke()` calls.

## Security

- Path and query handling for HTTPS requests must remain safe from SSRF (see `src/api.ts`).
- No secrets in logs; Talisman/Snyk expectations remain satisfied.

## Dependencies

- Prefer minimal, audited dependencies; align with `package.json` and team policy.

## Tests

- Add or update Jest tests with **nock** for HTTP; use `test/dummy` patterns.
- Run **`npm test`** locally before approving.

## Severity

- **Blocker**: Security, data corruption, broken sync or infinite retries.
- **Major**: Wrong API semantics, missing tests for risky changes.
- **Minor**: Style, comments, small refactors without behavior change.
