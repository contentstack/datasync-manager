# Agent skills for `@contentstack/datasync-manager`

Short index of `skills/*/SKILL.md` files. Use them when you need more detail than [.cursor/rules/README.md](../.cursor/rules/README.md).

| Skill | When to use |
|-------|-------------|
| [code-review](code-review/SKILL.md) | Preparing or reviewing a PR: compatibility, Sync API semantics, security, tests, severity labels. |
| [testing](testing/SKILL.md) | Running Jest, understanding `PLUGIN_PATH`, nock, dummy fixtures, and where to add tests. |
| [contentstack-datasync](contentstack-datasync/SKILL.md) | Mental model of DataSync Manager: modules, config, Sync API vs CMA, where to change sync behavior. |

There is no separate **framework** skill: HTTP and retry logic live primarily in `src/api.ts` and config, not a standalone framework layer.
