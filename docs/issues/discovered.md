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