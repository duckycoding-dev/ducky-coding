# Plan 007: Make the docs describe the site that actually exists

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- docs/ CLAUDE.md src/pages/search.astro`
> On mismatch with the excerpts below, re-verify each claim against the live
> code before editing.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (docs only)
- **Depends on**: none. Coordinate with plan 003: if 003 landed first, also
  document its `DB_SYNC` gate here.
- **Category**: docs

## Why this matters

The two canonical architecture docs contradict each other and reality — in
opposite directions. `build-flow.md` documents `/api/v1/*` endpoints that
were deliberately deleted; `architecture.md` claims "no runtime API
endpoints" and "all pages prerendered" while `/search` is a live SSR route
querying Turso per request. This repo is heavily worked on by AI agents
(CLAUDE.md-driven); wrong architecture docs poison every future session.
Several smaller drifts compound it: CLAUDE.md documents a nonexistent
`components/base/` convention, the memes entity is missing from the schema
docs, and a completed refactor-tracking doc lingers against the repo's own
"delete finished session docs" rule.

## Current state — verified facts to write the docs against

**Reality (confirmed by direct reads):**
- `src/pages/search.astro:31` — `export const prerender = false;` — the ONE
  SSR route. It sets CDN cache headers (`:37-48`), reads URL params
  (`:54-60`), and queries live data via `searchService.search(rawParams)`
  plus `TagsService.getAllTags()` / `TopicsService.getAllTopics()`
  (`:66-70`). Everything else is prerendered.
- There is NO `src/pages/api/` directory. The former endpoints
  (`api/v1/topics.ts`, `api/v1/images.ts`) and `contentSync.ts` were
  deliberately deleted — recorded in `docs/codebase-refactor/codebase-refactor.md:9-14`.
- DB sync runs from the `db-sync` integration in `astro.config.mjs:104-124`
  at `astro:build:start` (functions in `src/db/sync/buildSync.ts`), NOT from
  404.astro.
- Entities in `src/db/features/`: posts, topics, tags, images, **memes**
  (memes has only `memes.model.ts` — no repository/service; the table is
  written by `buildSync.ts:428-506` and read directly by
  `search.repository.ts`).
- `src/components/` is a flat `components/<name>/` layout; there is no
  `components/base/` directory.
- **New since `1fce5b5` (`fb28acb`, 2026-08-08)**: `src/data/` exists — a
  plain-data module (`src/data/projects.ts`) feeding the homepage and
  `/my-projects`, with a matching `@data/*` path alias in `tsconfig.json`
  and in the import-sort group in `eslint.config.js`. No architecture or
  development doc mentions either, so the folder-structure and alias
  sections are now incomplete: add them while sweeping.

**The wrong text, doc by doc:**

1. `docs/stable/development/build-flow.md`
   - `:112` — "API endpoints available at `/api/v1/*` (no auth required in dev)" → delete the row.
   - `:120-124` — "on-demand sync" curl block (`curl -X POST http://localhost:4321/api/v1/topics` / `/images`) → delete; dev has NO sync trigger (note: in dev, pages read whatever the local DB contains; sync happens on build or via manual scripts).
   - `:33-37` — Netlify diagram claims "API routes as Netlify Functions" → replace with "one SSR route (/search) as a Netlify Function".
   - `:136-137` — "SSR/API bundles" wording → "SSR bundle (search)".
   - `:171-184` — content-flow mermaid: node `SYNC["DB sync\n(404.astro at build time)"]` is wrong twice (sync is the `db-sync` integration hook, and labels must not contain `\n` per `CLAUDE.md`) → relabel using `<br/>` or shorter single-line text; change `API["API endpoints\n(future: search, etc.)"]` → search page node, not "future".
   - If plan 003 landed: document `DB_SYNC=skip` in the build modes section.
2. `docs/stable/architecture/architecture.md`
   - `:208` "All pages are prerendered (SSG)" and `:214-215` "There are no
     runtime API endpoints." → rewrite the Request Flow section: all pages
     prerendered EXCEPT `/search` (`prerender = false`), which runs as a
     Netlify Function, validates params with `SearchParamsSchema`
     (`src/db/features/search/search.types.ts`), queries Turso through
     `searchService`, and is cached at the CDN via `Cache-Control` /
     `Netlify-CDN-Cache-Control` / `Netlify-Vary` headers.
   - `:20` mermaid edge labeled "future: search, etc." → search exists; relabel.
   - `:179` "Entities: `posts`, `topics`, `tags`, `images`." → add `memes`,
     with a one-liner that memes currently have model-only DB access (no
     service/repository — see plan 012 before documenting it as a pattern).
   - DB-schema mermaid (`:110-159`) → add the `memes` table: columns from
     `src/db/features/memes/memes.model.ts` (`id` PK, `slug` unique, `title`,
     `author`, `imagePath` FK→images.path, `imageAlt`, `tags` (JSON text),
     `createdAt` integer millis).
   - `:195-198` code example contains the `postCount ?? 0 > 0` precedence bug
     — if plan 006 already fixed it here, leave it; otherwise write
     `(topic.postCount ?? 0) > 0`.
3. `CLAUDE.md:44` (repo root) — "**components: base vs feature** —
   `components/base/` for domain-agnostic primitives, `<feature>/` folders
   for feature-scoped components" → reword to match reality, e.g.:
   "**components** — one folder per component under `src/components/<name>/`;
   domain-agnostic primitives (Button, Card, Link, Input, Tag) live at the
   same level as feature components". Do not invent a new convention.
4. Delete `docs/codebase-refactor/` entirely (its single file is a completed
   tracking doc: every phase is DONE/SKIPPED). `CLAUDE.md` "Documentation
   Conventions" mandates deleting finished session docs.
5. `docs/stable/development/components/usable-but-not-completed-components.md`
   — frontmatter is only `updated: 2026-04-01`; the repo's frontmatter rule
   (CLAUDE.md) requires `created`, `updated`, `summary`. Add the missing keys
   (`created: 2026-04-01`, one-line summary). Note: the
   `{/* USABLE BUT NOT COMPLETED */}` marker has zero current uses in `src/`
   — keep the doc (the convention is still declared in CLAUDE.md) but add a
   line saying no components currently carry the marker.
6. Frontmatter `updated:` — bump to today's date on every stable doc you edit
   (repo convention).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| No stale api refs | `grep -rn "api/v1" docs/ src/ CLAUDE.md` | no matches |
| No fake prerender claim | `grep -n "no runtime API endpoints" docs/stable/architecture/architecture.md` | no match |
| No \n in mermaid labels | `grep -n '\\\\n' docs/stable/development/build-flow.md docs/stable/architecture/architecture.md` | no match inside mermaid node labels |
| Refactor doc gone | `ls docs/codebase-refactor 2>&1` | "No such file or directory" |
| Format | `npm run format:check` | exit 0 |

## Scope

**In scope**: `docs/stable/development/build-flow.md`,
`docs/stable/architecture/architecture.md`, `CLAUDE.md` (line 44 area only),
`docs/codebase-refactor/` (delete),
`docs/stable/development/components/usable-but-not-completed-components.md`
(frontmatter + one note), `plans/README.md` (status row).

**Out of scope**: all source code; other docs under `docs/stable/**` (styling
docs etc. were not audited for accuracy — do not "improve" them);
`docs/issues/discovered.md`.

## Git workflow

- Branch from `develop`: `advisor/007-docs-truth-sweep`
- Commits like `docs(architecture): document /search as the single ssr route`,
  `docs: delete completed codebase-refactor tracking doc`. No AI trailer.

## Steps

1. Fix `build-flow.md` (items 1a-1f). **Verify**: `grep -n "api/v1" docs/stable/development/build-flow.md` → none; mermaid blocks render (paste into a mermaid parser if available, else visual check for balanced brackets).
2. Fix `architecture.md` (items 2a-2e). **Verify**: greps above.
3. Fix `CLAUDE.md:44`. **Verify**: `grep -n "components/base" CLAUDE.md` → no match.
4. `git rm -r docs/codebase-refactor`. **Verify**: ls check above.
5. Fix the usable-but-not-completed frontmatter. **Verify**: `head -6` shows `created`, `updated`, `summary`.
6. `npm run format:check` → exit 0 (Prettier formats md).

## Test plan

Docs-only; the grep gates above are the tests.

## Done criteria

- [ ] All five grep/ls verifications pass
- [ ] Every edited stable doc has its `updated:` bumped
- [ ] `npm run format:check` exits 0
- [ ] No files outside scope modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- `src/pages/search.astro` no longer contains `prerender = false` (drift —
  the architecture changed; docs must follow the NEW reality, so stop and
  report rather than writing this plan's version of it).
- A `src/pages/api/` directory exists at execution time.
- You find yourself rewriting sections this plan doesn't list — scope creep;
  stop at the listed items.

## Maintenance notes

- Rule of thumb going forward (worth a line in a future CONTRIBUTING): any PR
  that adds/removes a route or entity updates `architecture.md` in the same
  change.
- Plan 012 (memes service layer) will need a follow-up edit to the entity
  paragraph written in step 2.
