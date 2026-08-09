---
updated: 2026-08-09
summary: Active issue and tech debt tracker
---

# Discovered Issues

Problems found during development, audits, or deploys. Each issue has a unique ID
**Severity scale:** `critical` → `high` → `medium` → `low`

---

## Dependency Migrations

### DEP-002 — schema-dts pinned at 1.1.5 by astro-seo-schema

**Severity:** low
**Status:** accepted — not worth acting on

`astro-seo-schema` declares `peerDependencies: { "schema-dts": "^1.1.0" }` in
both `6.0.0` and `7.0.0`, so the Astro 7 major does not lift this.

Deliberately accepted rather than worked around: `schema-dts` ships types only
— no runtime code, no advisory, no build impact — and `2.0.0` brings nothing
but newer Schema.org typings. The cost of the pin is zero.

The escape hatch, if a future need justifies it: `astro-seo-schema` is used at
exactly one site (`src/layouts/base-head/BaseHead.astro`) and is ~15 lines — a
`<script type="application/ld+json">` plus a `JSON.stringify` replacer that
entity-escapes string values to prevent `</script>` breakout. All the graph
building already lives in `src/utils/json-ld/`, so inlining it would free
`schema-dts` entirely.

**Affected files:** `package.json`

---

### DEP-003 — 14 high advisories blocked behind the Astro 7 major

**Severity:** high
**Status:** open — needs a deliberate major upgrade

After the same-major and tooling bumps `npm audit` is down from 59 to 20
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
piece of work, deliberately scoped out of the dependency sweep so it lands
against a green test suite.

Verified peer ranges for that upgrade: `astro@7.2.0` needs Node `>=22.12.0`
(`.nvmrc` is `v24.14.1`, fine), `@astrojs/netlify@8.2.0` and `@astrojs/mdx@7.0.5`
both require `astro@^7.0.0`, and `astro-seo-schema@7.0.0` supports it too.
`@astrojs/mdx@7.0.5` also declares a peer on `@astrojs/markdown-satteri@^0.3.1`
— verify that package before trusting the install.

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

### CLEANUP-004 — docs/stable/development not fully audited

**Severity:** low
**Status:** open

The plan-007 docs sweep scoped itself to `build-flow.md`, `architecture.md` and
CLAUDE.md. `components-and-folders-organization.md` was corrected afterwards
(CLEANUP-003), but the rest of `docs/stable/development/` — `styling/`,
`types/`, `tooling/`, `commit-conventions.md` — has never been checked against
the code it describes.

**Affected files:** `docs/stable/development/**`

---