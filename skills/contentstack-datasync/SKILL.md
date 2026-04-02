---
name: contentstack-datasync
description: Mental model for Contentstack DataSync Manager — Sync API, modules, and where to change behavior
---

# Contentstack DataSync Manager (TypeScript)

## What this package is

**`@contentstack/datasync-manager`** is the Node.js **DataSync Manager**: it connects your **content store**, **asset store**, and **listener** (webhooks) to Contentstack’s **Sync API** using a **delivery token**. It is **not** a general CDA or CMA SDK; it orchestrates **synchronization** (incremental sync, webhooks, optional fallback polling).

Official product context: [Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync).

## Where to change things

| Concern | Location |
|---------|----------|
| Public API (`start`, stores, queue, notifications) | `src/index.ts` |
| HTTP to Sync API (retries, 429, error 141, headers) | `src/api.ts` |
| Defaults (host, paths, retry limits, content type URLs) | `src/config.ts` |
| Sync loop, queue, plugins loader, token file handling | `src/core/` |
| Validation, logger, path builders | `src/util/` |
| Built-in JS plugins | `src/plugins/` |

## Sync API mental model

- Requests use **`api_key`**, **`access_token`** (delivery token), optional **`branch`**, and paths like **`/v3/stacks/sync`**.
- **Do not** conflate with **CMA** (create/update content, management tokens) — this stack uses **read/sync** semantics.

## Config flow

- Consumer calls `setContentStore`, `setAssetStore`, `setListener`, optional `setConfig`, then **`start()`**.
- Internal config merges defaults from `src/config.ts` with user config; `src/api.ts` `init` runs when the core initializes the API helper.

## Changing behavior safely

- Preserve disk artifacts (tokens, checkpoints) and plugin hook contracts when altering `src/core/`.
- Coordinate documentation updates for any new `contentstack` options or breaking changes to the listener interface.
