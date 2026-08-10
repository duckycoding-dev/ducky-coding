---
updated: 2026-08-10
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

### DEP-003 — high advisories in the Netlify adapter's dev tooling

**Severity:** medium
**Status:** open — no upstream fix available

**This issue was previously mis-diagnosed.** It claimed the 14 high advisories
were gated behind the Astro 7 major. That upgrade has now landed
(`astro@7.2.0`, `@astrojs/netlify@8.2.0`) and the count went 20 → 17, with 13
high remaining. Astro was never the root.

The chain roots in the adapter, not the framework:

`@astrojs/netlify` → `@netlify/vite-plugin` → `@netlify/dev` →
`@netlify/dev-utils` → `image-size` (DoS via infinite loops in the ICNS and
JXL/HEIF parsers), plus `@netlify/blobs`, `@netlify/edge-functions-dev`,
`@netlify/functions-dev`, `@netlify/redirects`, `@netlify/runtime`, and
`@netlify/images` → `ipx` → `sharp` (inherited libvips CVEs,
GHSA-f88m-g3jw-g9cj).

`npm audit` reports a "fix available" for `@astrojs/netlify`, but it resolves
to version `6.4.1` — which requires `astro@^6`. That is a downgrade out of
Astro 7, not a fix. The advisory range is `>=6.5.0`, so every adapter version
compatible with Astro 7 carries it.

Why this is tolerable rather than urgent:

- `@netlify/dev` is Netlify's local dev-server tooling. It is build- and
  dev-time only; none of it is shipped to the browser.
- `imageCDN: false` in `astro.config.mjs` keeps the `@netlify/images` → `ipx` →
  `sharp` path out of the deploy.

Resolved only when Netlify updates `@netlify/dev-utils` and `@netlify/blobs`
upstream. Re-check with `npm audit` periodically; there is no local action that
clears it.

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

### BUG-001 — the standalone migration scripts cannot run

**Severity:** low
**Status:** open — not load-bearing

`npm run db:migrate` and `npm run db:migrate:local` both fail immediately:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@utils/logs'
imported from src/db/migrate.ts
```

`src/db/migrate.ts:5` imports `@utils/logs/logger`, but the scripts run it with
bare `node --env-file=… ./src/db/migrate.ts`. Node strips the TypeScript but does
not resolve `tsconfig.json` path aliases, so the import cannot be found.
`src/db/client.ts:1` has the same problem with `@utils/env`, so fixing only
`migrate.ts` is not enough.

**Why it is tolerable:** migrations do not depend on these scripts. They run at
build time through the `db-sync` integration in `astro.config.mjs`, which calls
`buildMigrate` via Vite where aliases resolve — confirmed in build output:

```
[db-sync] Running DB migrations...
Migrations completed successfully.
```

That is also how Netlify migrates on deploy. The scripts are vestigial.

**Fix options:** switch the imports in `migrate.ts` and `client.ts` to relative
paths, or run the script through a loader that honours the alias map. Removing
the scripts entirely is also defensible, since nothing uses them.

**Affected files:** `package.json`, `src/db/migrate.ts`, `src/db/client.ts`

---

### CLEANUP-005 — Netlify `NODE_VERSION` overrides and contradicts `.nvmrc`

**Severity:** low
**Status:** open — needs a decision

`.nvmrc` pins `v24.19.0` (the current Node LTS), but the Netlify site defines a
`NODE_VERSION` environment variable set to `24.1.0`, and that variable takes
precedence over `.nvmrc`. Production therefore builds on a different Node patch
than local and CI, and the pin is invisible from the repo — the same trap as
the deploy topology, which also lives only in the Netlify UI.

Both satisfy Astro 7's `>=22.12.0` requirement, so nothing is broken today.

Fix by deleting the `NODE_VERSION` variable (`netlify env:unset NODE_VERSION`)
so `.nvmrc` becomes the single source of truth, or by keeping it and updating
it in lockstep on every `.nvmrc` bump.

**Affected files:** `.nvmrc`, Netlify site environment variables

---

### CLEANUP-006 — the path alias map is defined in three places

**Severity:** low
**Status:** open — accepted for now

The same aliases are declared in `tsconfig.json` (`paths`, for TypeScript),
`vitest.config.ts` (`resolve.alias`, for tests) and now `astro.config.mjs`
(`vite.resolve.alias`, for `@styles` only, so Tailwind's `@reference` resolves
under Vite 8). Nothing enforces that the three agree; a new alias added to one
silently fails in the others.

Fixable by defining the map once — a plain `.ts`/`.mjs` module exporting the
pairs — and deriving all three from it. Deliberately not done during the Astro
7 upgrade to keep that change reviewable.

**Affected files:** `tsconfig.json`, `vitest.config.ts`, `astro.config.mjs`

---