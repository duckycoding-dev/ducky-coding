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

### BUG-002 — the `outlined` link variant's own text colour fails contrast

**Severity:** low
**Status:** open — latent, nothing renders it today

`Link`'s `outlined` variant sets `text-accent` (`#ff3de9`), which measures
**2.96:1** against white — well under the 4.5:1 AA threshold for normal text and
under 3:1 even for large text.

It does not fail any audit today because all four call sites
(`src/pages/index.astro:160,307,316,325`) override it with `text-secondary`. That
is the tell: the variant's default colour is simultaneously dead and wrong, so the
first call site that trusts it inherits a failure.

Fix by making `text-accent-800` (`#a30091`, 7.08:1 on white) the variant's colour,
matching what `default` now uses, then dropping the redundant `text-secondary`
overrides — or by removing the colour from the variant so call sites must choose.

Related: the `default` variant had the same defect and was fixed by moving from
`accent-700` (4.06:1 on `primary-500`) to `accent-800`. `accent-700` remains in use
on large headings, where 4.06:1 clears the 3:1 large-text threshold.

**Affected files:** `src/components/link/Link.astro`, `src/pages/index.astro`

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

### CLEANUP-007 — the image glob is duplicated across nine modules

**Severity:** low
**Status:** open

The same `import.meta.glob('/src/assets/images/**/*.{jpeg,jpg,png,gif,webp,svg}')`
is written out in nine places: `src/db/sync/buildSync.ts`, `src/pages/blog.astro`,
`src/pages/search.astro`, `src/pages/rss.xml.ts`, `src/pages/posts/[...id]/index.astro`,
`src/pages/memes/index.astro`, `src/pages/memes/[...id]/index.astro`,
`src/pages/topics/index.astro`, `src/pages/topics/[topic]/index.astro`.

**This is not a performance issue** — measured, so it does not get re-litigated.
Every call sits in prerendered frontmatter and resolves during the build; the
whole `dist` ships a single 2.5 KB client script. The cost is duplication: the
glob pattern has to be edited in nine places when a new image format is added,
and a missed one fails silently by simply not matching.

Fix by exporting the glob from one module (`src/utils/images/`) and importing the
resulting record. Note `import.meta.glob` must appear literally in the calling
module — Vite transforms it statically — so the shared module has to own the call
and export its result, not accept a pattern argument.

**Affected files:** the nine modules listed above

---

### CLEANUP-008 — production sourcemaps are emitted

**Severity:** low
**Status:** open — needs a decision, not a fix

`astro.config.mjs:124` sets `vite.build.sourcemap: true`, so `dist` carries six
`.map` files totalling **44 KB**.

**No measurable performance cost** — browsers request a `.map` only when devtools
is open, so no visitor downloads them. The only real question is whether the
unminified source should be readable in production. Deliberately recorded as a
decision rather than a defect: leaving it on is a legitimate choice for a
personal blog whose source is public on GitHub anyway.

**Affected files:** `astro.config.mjs`

---

### CLEANUP-009 — the SSR function bundles 31 MB to serve one route

**Severity:** low
**Status:** open

`.netlify/v1/functions/ssr` is 31 MB, of which 22 MB is `node_modules` and 16 MB
is `@img` (sharp's platform binaries). `/search` is the only route that reaches
it — everything else is prerendered and the function config sets
`preferStatic: true`, so the CDN answers from static files.

Two contributors, both worth checking before acting:

1. `includedFiles: ['**/*']` in the emitted function config pulls the whole
   project in.
2. `sharp` is Astro's build-time image processor. Whether the deployed function
   genuinely needs it depends on whether any runtime route resolves an image;
   `imageCDN: false` already keeps `@netlify/images` out.

The only user-visible symptom is cold-start latency on `/search`. Also note the
local build embeds `@img/sharp-darwin-arm64` — the host's own architecture — which
is harmless because Netlify reinstalls for Linux, but makes local size figures
unrepresentative.

**Affected files:** `astro.config.mjs`, Netlify adapter output

---

### CLEANUP-010 — `dist` emits originals nothing references

**Severity:** low
**Status:** open

`dist/_astro/` contains the full-size source PNGs (`image-srcset-and-sizes-attributes`
2.1 MB, `welcome-to-duckycoding` 2.1 MB, `avoid-self-referencing-links` 484 KB)
even though no HTML, RSS or JSON-LD output references them. Astro emits an
original for every imported asset regardless of references.

**No user-facing cost** — nothing requests these files, so no visitor downloads
them. It affects deploy upload size only. Recorded because it was initially
mistaken for a page-weight problem during the OG card work; it is not one.

The two `.mp4` files in the same directory (8.6 MB combined) are **not** part of
this — they are legitimately referenced by the srcset post, and `<video controls>`
without `preload` fetches metadata only.

**Affected files:** build output

---