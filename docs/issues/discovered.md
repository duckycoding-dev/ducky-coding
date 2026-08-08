---
updated: 2026-08-08
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

### DEP-003 — 14 high advisories blocked behind the Astro 7 major

**Severity:** high
**Status:** open — needs a deliberate major upgrade

After the same-major bumps (`astro@6.4.8`, `@astrojs/netlify@7.0.13`,
`markdown-it@14.3.0`, `sanitize-html@2.17.6`) `npm audit` is down from 59 to 21
advisories with zero critical. All 14 remaining high advisories sit in one
chain that `npm audit` can only resolve by installing `astro@7.2.0`, a semver
major:

`astro` → `@netlify/vite-plugin` / `@netlify/dev` / `@netlify/runtime` →
`@netlify/images` → `ipx` → `sharp` (`<0.35.0`, inherited libvips CVEs
GHSA-f88m-g3jw-g9cj), plus `@netlify/blobs`, `@netlify/dev-utils`,
`@netlify/edge-functions-dev`, `@netlify/functions-dev`, `@netlify/redirects`
and `image-size`.

Mitigation while blocked: `imageCDN: false` in `astro.config.mjs` keeps the
Netlify image CDN path out of the deploy, and the whole chain is build-time
tooling rather than shipped client code.

Unblocked by upgrading to `astro@7.x` + `@astrojs/netlify@8.x` — a separate
piece of work, deliberately scoped out of the patch-level sweep so it lands
against a green test suite.

**Affected files:** `package.json`, `package-lock.json`

---

## Cleanup

### CLEANUP-001 — two zod entry points used side by side

**Severity:** low
**Status:** open

Three content-entity schemas import `astro/zod`
(`src/types/entities/{post,topic,meme}Content.entity.ts`) while eight other
modules import `zod` directly (`src/utils/env.ts`, the six
`src/db/features/*/*.model.ts` files, `src/db/features/search/search.types.ts`).

Both currently resolve to the same deduped `zod@4.3.6` instance, so nothing is
broken today. It becomes a real problem if astro's bundled zod ever diverges
from the declared one: schemas built with one instance and composed with the
other fail `instanceof` checks inside zod.

Pick one entry point for all of `src/` — `zod` is the better default now that
it is a declared direct dependency.

**Affected files:** `src/types/entities/*.entity.ts`, `src/db/features/**/*.ts`,
`src/utils/env.ts`

---

### CLEANUP-002 — repositories and services cannot be unit tested

**Severity:** medium
**Status:** open

`src/db/client.ts` creates its libSQL client at module scope, and
`src/utils/env.ts` calls `envVariables.parse(import.meta.env ?? process.env)`
at module scope too. Importing *any* repository or service therefore builds a
DB connection and throws on missing env before a single test runs — under
Vitest `import.meta.env` exists but carries no `TURSO_DATABASE_URL`.

Consequence: the test suite can only reach code that avoids the client
entirely. `buildSync.ts` is testable because it takes its config as an
argument and builds its own client; `search.sql.ts` is testable because it was
deliberately split out with no client import. Everything under
`src/db/features/**` is not.

Fix options, cheapest first:
1. Make `db` lazy (`getDb()` memoised) so importing a module does not connect.
2. Let repositories accept an optional client argument defaulting to the
   shared one, matching how `buildSync` already works.

Until then, new query logic should follow the `search.sql.ts` pattern: put the
pure part in a client-free module so it can be covered.

**Affected files:** `src/db/client.ts`, `src/utils/env.ts`,
`src/db/features/**/*.repository.ts`

---

### CLEANUP-003 — component docs still show PascalCase folders

**Severity:** low
**Status:** open

`docs/stable/development/components/components-and-folders-organization.md`
documents the folder convention as:

```
/ComponentName
  |__ ComponentName.astro
```

with the import example `@components/Button/Button.astro`. The actual
convention (CLAUDE.md, and every folder in `src/components/`) is a kebab-case
directory holding a PascalCase file — `@components/button/Button.astro`.

The doc also has frontmatter with only `updated:`, missing the `created:` and
`summary:` keys the repo requires.

Found during the plan-007 docs sweep but deliberately left alone: that plan
scoped itself to `build-flow.md`, `architecture.md` and CLAUDE.md, and treats
touching unaudited docs as scope creep. The rest of `docs/stable/development/`
and `docs/stable/development/styling/` has not been audited for accuracy
either.

**Affected files:**
`docs/stable/development/components/components-and-folders-organization.md`

---