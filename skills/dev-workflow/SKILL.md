---
name: dev-workflow
description: Branches, release flow, build/test/lint, PR expectations, and versioning for DataSync Manager
---

# Development workflow – @contentstack/datasync-manager

## When to use

- Setting up or merging branches, cutting a release, or running the same checks CI expects.
- You need the exact **npm** commands or pre-commit expectations before a PR.

## Instructions

### Branches

- Use **feature branches** for new work; open pull requests against **`development`** to integrate changes.
- For a **release**, open a pull request from **`development`** into **`master`**. **npm** releases use **semantic-release** from **`master`** (see `.releaserc`: branches `["master"]`).

### Local checks

| Task | Command |
|------|---------|
| Compile | `npm run compile` or `npm run build-ts` |
| Tests | `npm test` (sets `PLUGIN_PATH=./test/dummy`; Jest + coverage) |
| ESLint | `npm run lint` — add paths or config if your CLI setup requires it |
| TSLint | `npm run tslint` — legacy; targets `src/**/*.ts` |

### Pre-commit

- `.husky/pre-commit` runs **Talisman** (secrets) and **Snyk** (`snyk test --all-projects --fail-on=all`). Both must pass unless `SKIP_HOOK=1` is set intentionally.

### PR expectations

- Keep changes scoped; match existing patterns in `src/` and `test/`.
- Run **`npm test`** before pushing when touching runtime logic.
- If you add or change **secrets or tokens**, update Talisman allowlists (e.g. `.talismanrc`) only with team approval.

### Versioning

- `package.json` version must advance for releases when your process requires it. A PR check in `.github/workflows/check-version-bump.yml` may enforce bumps for certain file changes — **note:** its path filters may still reflect a boilerplate layout; confirm with maintainers whether `src/` changes count as “code changed” for your PR.

## References

- [testing/SKILL.md](../testing/SKILL.md) — Jest and fixtures.
- [code-review/SKILL.md](../code-review/SKILL.md) — PR checklist.
- [AGENTS.md](../../AGENTS.md) — entry point and command table.
