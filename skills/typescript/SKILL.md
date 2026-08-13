---
name: typescript
description: TypeScript source layout, compiler settings, logging, and lint for DataSync Manager src/
---

# TypeScript – @contentstack/datasync-manager

## When to use

- Editing or adding files under **`src/**/*.ts`** (or JS plugins under `src/plugins/`).
- You need to match existing **`tsconfig.json`** and logging style.

## Instructions

### Layout

- **`src/index.ts`** — public API (stores, listener, `start`, queue helpers, notifications).
- **`src/api.ts`** — Sync API HTTP client (Node `https`); see [contentstack-datasync/SKILL.md](../contentstack-datasync/SKILL.md).
- **`src/core/`** — sync orchestration, queue, plugins, token handling, inet pinger.
- **`src/util/`** — logger (`debug`-backed), validation, paths, helpers.
- **`src/plugins/`** — JavaScript plugins (`allowJs` in `tsconfig`).

### Compiler and style

- **`tsconfig.json`**: `target` ES6, `module` CommonJS, `alwaysStrict`, `noImplicitReturns`, unused locals/parameters, etc.
- **Logging**: Prefer the **`debug`** package with stable namespaces (`Debug('sm:index')`, `Debug('api')`); avoid raw `console` where `logger` or `debug` is used elsewhere.
- **Lint**: ESLint in `package.json`; TSLint is legacy (`tslint.json`: max line length 120, 2-space indent). New code should satisfy both when run.

### Dependencies

- Do not add alternate HTTP clients without strong justification — **`https`** is the standard for Contentstack requests here.

## References

- [contentstack-datasync/SKILL.md](../contentstack-datasync/SKILL.md) — Sync API and `src/api.ts` behavior.
- [testing/SKILL.md](../testing/SKILL.md) — tests for TypeScript changes.
