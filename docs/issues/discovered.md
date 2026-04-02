---
updated: 2026-04-02
summary: Active issue and tech debt tracker
---

# Discovered Issues

Problems found during development, audits, or deploys. Each issue has a unique ID
that links to concrete fix steps in `fix-implementation.md`.
This document shall be updated whenever a new issue is found or an existing one is resolved (in which case, it shall be removed completely to keep this tracker as small as possible)

**Severity scale:** `critical` → `high` → `medium` → `low`

---

## Cleanup / Tech Debt

### CLEANUP-001 — API sync endpoints are redundant

**Severity:** low
**Status:** open — deferred to a dedicated refactor branch

**Problem:**
`POST /api/v1/images` and `POST /api/v1/topics` exist to trigger DB re-sync at
runtime. Since the site is mostly SSG, updating the DB at runtime has no effect on
rendered pages. Any content change requires a file edit + redeploy anyway, and the
`astro:build:start` hook in `astro.config.mjs` now runs a full sync on every deploy.
The only practical use would be emergency DB recovery (Turso reset), but the sync is
incomplete even then (posts have no equivalent endpoint).

Three functions in `contentSync.ts` are also dead code (never called):
`syncContentToDatabase`, `updateTopicAnalytics`, `syncAllContent`.

**What to do:**
- Remove POST handlers from `src/pages/api/v1/images.ts` and `src/pages/api/v1/topics.ts`
- Delete `syncContentToDatabase`, `updateTopicAnalytics`, `syncAllContent` from `src/db/sync/contentSync.ts`
- If `contentSync.ts` becomes empty after cleanup, delete it

**Affected files:**
- `src/pages/api/v1/images.ts`
- `src/pages/api/v1/topics.ts`
- `src/db/sync/contentSync.ts`

---

## Dependency Migrations

### DEP-001 — TypeScript 6 blocked by @astrojs/check peer dep

**Severity:** low
**Status:** open — waiting on upstream

`@astrojs/check@0.9.8` declares `peerDependencies: { typescript: "^5.0.0" }`.
TypeScript is therefore pinned at `5.9.3` (latest 5.x).

TS 6 is available (`6.0.2`) and would bring stricter type checking and new features.
Unblocked once `@astrojs/check` updates its peer dep range.

**Affected files:** `package.json`

---

### DEP-002 — schema-dts 2.0 blocked by astro-seo-schema peer dep

**Severity:** low
**Status:** open — waiting on upstream

`astro-seo-schema@6.0.0` declares `peerDependencies: { "schema-dts": "^1.1.0" }`.
`schema-dts` is therefore pinned at `1.1.5` even though `2.0.0` is published.

**Affected files:** `package.json`

---