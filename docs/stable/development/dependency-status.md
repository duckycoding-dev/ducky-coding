---
created: 2026-04-01
updated: 2026-04-02
summary: Locked versions, blocked upgrades, migration notes
---

# Dependency Status

---

## Blocked Upgrades (peer dependency conflicts)

See `docs/issues/discovered.md` for full context on each.

| Package | Latest | Blocked by | Issue |
|---------|--------|-----------|-------|
| `typescript` | 6.0.2 | `@astrojs/check@0.9.8` requires `typescript@^5.0.0` | DEP-001 |
| `schema-dts` | 2.0.0 | `astro-seo-schema@6.0.0` requires `schema-dts@^1.1.0` | DEP-002 |

Both unblocked once upstream packages update their peer dep ranges.

---

## Decision Log

Intentional choices that deviate from "always latest" and should not be revisited
unless the situation changes:

| Package | Decision | Reason |
|---------|----------|--------|
| `cva` | Stay at `1.0.0-beta.4` | No stable release exists. The 1.0 stable release is expected but may take many more months. The current beta API is stable in practice. Will upgrade when a stable version ships — no need to track. |

---

## Breaking Changes — Follow-up Work

### TypeScript 6 (DEP-001)

Waiting on `@astrojs/check` to widen its peer dep range to include TS 6.
No action needed until then.
