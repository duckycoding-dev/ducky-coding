---
updated: 2026-04-02
summary: Active issue and tech debt tracker
---

# Discovered Issues

Problems found during development, audits, or deploys. Each issue has a unique ID
**Severity scale:** `critical` → `high` → `medium` → `low`

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