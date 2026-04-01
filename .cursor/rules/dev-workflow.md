---
description: Branches, lint/tests, PR expectations, versioning for DataSync Manager
alwaysApply: false
---

# Development workflow

## Branches

- Default release branch per `.releaserc`: **`master`** (semantic-release publishes from there).
- Use feature branches and open PRs against the team’s usual base branch (commonly `master`).

## Running checks locally

| Task | Command |
|------|---------|
| Compile | `npm run compile` or `npm run build-ts` |
| Tests | `npm test` (sets `PLUGIN_PATH=./test/dummy`; Jest + coverage) |
| ESLint | `npm run lint` — pass paths if your ESLint config expects them (project may rely on default CLI behavior until an explicit config is added). |
| TSLint | `npm run tslint` — legacy; still targets `src/**/*.ts`. |

## Pre-commit

- `.husky/pre-commit` runs **Talisman** (secrets) and **Snyk** (`snyk test --all-projects --fail-on=all`). Both must pass unless `SKIP_HOOK=1` is set intentionally.

## PR expectations

- Keep changes scoped; match existing patterns in `src/` and `test/`.
- Run **`npm test`** before pushing when touching runtime logic.
- If you add or change **secrets or tokens**, ensure Talisman allowlists (e.g. `.talismanrc`) are updated only with team approval.

## Versioning and releases

- **semantic-release** (see `.releaserc`) drives npm releases from **`master`** with conventional commits.
- `package.json` version must advance for releases; a PR check (`.github/workflows/check-version-bump.yml`) may enforce bumps when certain files change — **note:** that workflow’s path filters may still reflect a boilerplate layout; confirm with maintainers whether `src/` changes are included in “code changed” for your PR.
