# Plan 008: Right-size the /search CDN cache (investigate, then fix)

> **Executor instructions**: Follow this plan step by step. This is an
> INVESTIGATE-THEN-FIX plan — step 1's findings decide which fix branch to
> take. Run every verification command and confirm the expected result. If
> anything in the "STOP conditions" section occurs, stop and report. When
> done, update the status row in `plans/README.md` — unless a reviewer
> dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- src/pages/search.astro`
> On mismatch with the excerpt below, STOP.

## Status

- **Priority**: P2
- **Effort**: S (investigation) + S (fix)
- **Risk**: LOW — worst case is more cache misses on one route
- **Depends on**: none
- **Category**: bug (staleness) / perf

## Why this matters

`/search` is the site's only SSR route; it reflects the Turso index that each
production build rewrites. Its responses are cached on Netlify's CDN with
`durable, s-maxage=31536000` — up to ONE YEAR per query-string combination.
If Netlify's durable cache is not invalidated by a new deploy (this is the
open question to verify), a search result cached today can keep serving
deleted or edited posts for months after they change. Separately,
`Netlify-Vary` keys the cache on raw query params, so unbounded distinct `q`
values create unbounded cache entries (harmless cost-wise, but it means
"cache hit" is rare for real searches while stale hits persist for common
ones).

## Current state

`src/pages/search.astro:31-48` (verified):

```ts
export const prerender = false;

// CDN cache headers
Astro.response.headers.set(
  'Cache-Control',
  'public, max-age=300, must-revalidate',
);
Astro.response.headers.set(
  'Netlify-CDN-Cache-Control',
  'public, durable, s-maxage=31536000, stale-while-revalidate=31536000',
);
Astro.response.headers.set(
  'Netlify-Vary',
  'query=q|tags|topics|type|page|pageSize',
);
```

- Browser cache: 5 min (`max-age=300`) — fine, leave it.
- The DB behind this route changes ONLY at deploy time (build-start sync,
  `astro.config.mjs:104-124`) — so the correct cache lifetime is exactly
  "until the next deploy".
- No cache tags (`Netlify-Cache-Tag` / `Cache-Tag` headers) are set anywhere
  in the repo, and there is no purge call in any build script.

## Step 1 — Investigate (decides the fix)

Answer ONE question from Netlify's current documentation (use web search /
Netlify docs; do not guess): **does a new production deploy automatically
invalidate `durable` cache objects?**

- Netlify docs pages to check: "Caching" / "Fine-grained cache control"
  (docs.netlify.com), specifically the `durable` directive semantics.
- Record the answer with a quote + URL in the PR/commit description and in
  the plans/README.md status note.

**Verify**: you can state, with a citation, either "durable objects are
invalidated on deploy" or "durable objects persist across deploys unless
purged via API/cache-tags".

## Step 2 — Fix (branch on the answer)

**Branch A — durable persists across deploys (staleness is real):**
Choose the simplest correct option: replace the durable header with a
deploy-scoped lifetime, e.g.

```ts
Astro.response.headers.set(
  'Netlify-CDN-Cache-Control',
  'public, s-maxage=3600, stale-while-revalidate=86400',
);
```

(1-hour edge cache, serve-stale-while-refresh for a day). Do NOT build a
cache-tag purge pipeline in this plan — that is over-engineering for a blog
whose one dynamic page can tolerate a 1-hour staleness window; note it as a
deferred option in Maintenance notes.

**Branch B — durable is invalidated on deploy (staleness is bounded by
deploy cadence):** the year-long `s-maxage` is then effectively "until next
deploy" and correct. Make one small change only: add a code comment above
the headers block stating the verified semantics with the doc URL, so the
next reader doesn't re-open this investigation. Optionally still lower
`stale-while-revalidate` to something sane (e.g. `86400`).

**Verify**: `npm run astro:check && npm run lint` → exit 0. Header string
matches the chosen branch exactly (`grep -n "Netlify-CDN-Cache-Control" src/pages/search.astro` + read the value).

## Commands you will need

| Purpose   | Command               | Expected |
|-----------|-----------------------|----------|
| Typecheck | `npm run astro:check` | exit 0   |
| Lint      | `npm run lint`        | exit 0   |

## Scope

**In scope**: `src/pages/search.astro` (the three header `set` calls and an
explanatory comment ONLY), `plans/README.md`.

**Out of scope**: search logic, `SearchParamsSchema`, the service/repository
layer; any purge-API integration, Netlify config files, build scripts;
`Netlify-Vary` restructuring (bounding cacheable `q` variants is possible but
not worth complexity now — deferred).

## Git workflow

- Branch from `develop`: `advisor/008-search-cache-strategy`
- Commit: `fix(search): bound cdn cache lifetime for ssr search page` (or
  `docs(search): document verified durable-cache semantics` for branch B).
  No AI trailer.

## Test plan

None automated (header-only change; the investigation citation is the
deliverable that prevents regressions).

## Done criteria

- [ ] Investigation answer recorded with citation (commit message + README status note)
- [ ] Header value matches the chosen branch; comment explains why
- [ ] `npm run astro:check`, `npm run lint` exit 0
- [ ] Only `src/pages/search.astro` (+ plans/README.md) modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Netlify documentation is ambiguous or contradicts itself on durable
  invalidation — report both quotes; the operator decides.
- The headers in `search.astro` differ from the excerpt (drift).
- You feel the need to add a purge webhook/build plugin — that's the
  over-engineering this plan explicitly defers.

## Maintenance notes

- If posting cadence rises and search freshness matters more, the "right"
  solution is `Netlify-Cache-Tag: search` + a purge API call from a deploy
  hook — deferred deliberately.
- If plan 006's Fix D (LIKE escaping) changes result semantics, cached
  entries keep old semantics until they expire — acceptable, but deploy both
  in the same release if possible.
