# Plan 012: Close the memes hole in the service-layer architecture

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- src/db/features/`
> On mismatch with the excerpts below, STOP.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: LOW-MED (moves query code; behavior must not change)
- **Depends on**: none (if plan 006 landed, its LIKE-escaping edits in
  `search.repository.ts` move along with the meme query — preserve them)
- **Category**: tech-debt

## Why this matters

The repo's documented architecture (CLAUDE.md: "all DB access goes through
the service layer"; `docs/stable/architecture/architecture.md`) gives every
entity a `model → repository → service` triple. Memes break the pattern:
`src/db/features/memes/` contains ONLY `memes.model.ts`, and
`search.repository.ts` queries `memesTable` directly. There's also a naming
inconsistency: `search.service.ts` exports camelCase `searchService` while
every other service is PascalCase (`TopicsService`, `TagsService`,
`ImagesService`, `postsService` — note `postsService` is ALSO camelCase; see
Step 3 for the decision). Consistency is what makes this codebase cheap for
agents to navigate; holes in the pattern are where future bugs nest.

## Current state

- `src/db/features/memes/memes.model.ts` — Drizzle table + drizzle-zod
  schemas only (verified; exports `memesTable`, `Meme`, `InsertMeme`, etc.).
- `src/db/features/search/search.repository.ts` — imports `memesTable`
  directly and implements `searchMemes` (the meme LIKE/tag filtering,
  `:97-147` region) alongside `searchPosts`.
- `src/db/features/search/search.service.ts` (entire file read) — validates
  params via `SearchParamsSchema`, calls `searchRepository.searchPosts` /
  `searchRepository.searchMemes`, returns the repo's discriminated-union
  `SearchResponse`.
- Meme PAGES read from content collections, not the DB
  (`src/pages/memes/index.astro`, `src/pages/memes/[...id]/index.astro` use
  `getCollection('memes')`) — that is intentional (files are the source of
  truth; DB is the search index) and must NOT change.
- Exemplar triple to imitate: `src/db/features/images/`
  (`images.model.ts`, `images.repository.ts`, `images.service.ts` — service
  read in full: plain object export `export const ImagesService = {...}` of
  arrow functions with explicit return types).
- Service naming today: `ImagesService`, `TopicsService`, `TagsService`
  (PascalCase) vs `postsService`, `searchService` (camelCase). CLAUDE.md's
  Zod/type rules don't settle service-object casing.

## Commands you will need

| Purpose   | Command               | Expected |
|-----------|-----------------------|----------|
| Typecheck | `npm run astro:check` | exit 0   |
| Lint      | `npm run lint`        | exit 0   |
| Tests     | `npm test`            | pass (if plan 002 landed) |

## Scope

**In scope**: `src/db/features/memes/memes.repository.ts` (create),
`src/db/features/memes/memes.service.ts` (create),
`src/db/features/search/search.repository.ts` (delegate meme queries),
`src/db/features/search/search.service.ts` (only if Step 3's decision
touches it), `docs/stable/architecture/architecture.md` (entity paragraph —
one line), `plans/README.md`.

**Out of scope**: meme pages (`src/pages/memes/**` keep using collections);
`memes.model.ts`; `buildSync.ts` (it's deliberately standalone,
non-aliased Node code — see its header comment — and must keep writing
tables directly); posts service refactors beyond the naming decision.

## Git workflow

- Branch from `develop`: `advisor/012-memes-service-layer`
- Commits: `refactor(db): add memes repository and service`,
  `refactor(search): delegate meme queries to memes repository`. No AI
  trailer.

## Steps

### Step 1: Create `memes.repository.ts`

Move the meme-query logic from `search.repository.ts` into a new
`MemesRepository` (or `memesRepository` — match Step 3's decision) exposing
a `searchMemes(params)` with the exact same signature and return shape the
search repository uses today (`{ results: MemeSearchResult[], total: number }`
— see `src/db/features/search/search.types.ts:43-61`). Copy the query code
verbatim (including plan 006's `escapeLike` if present — move the helper to
a shared location under `src/db/features/search/` or duplicate it locally;
prefer importing from where it lives).

**Verify**: `npm run astro:check` → exit 0 (new files compile; search repo
still uses its own copy at this point — codebase never broken mid-plan).

### Step 2: Delegate from search

Replace the inline meme query in `search.repository.ts` with a call to the
new memes repository; delete the now-unused `memesTable` import. Create
`memes.service.ts` wrapping the repository (mirror
`images.service.ts` structure) — even if `searchService` calls the
repository directly today, the service file is the public surface for any
future page/DB use; have `searchService` (or search.repository) go through
the memes REPOSITORY (repo→repo composition) OR route search's meme branch
through `MemesService` — pick the one that keeps `search.service.ts`'s
behavior byte-identical and note the choice in the commit body.

**Verify**: `grep -n "memesTable" src/db/features/search/search.repository.ts`
→ no matches; `npm run astro:check && npm run lint` → exit 0; `npm test` →
search-related tests still green (plan 002's `SearchParamsSchema` tests are
unaffected; if buildSync tests exist they don't touch this path).

### Step 3: Settle service naming (small, explicit)

Decision rule (pre-made — do not re-litigate): PascalCase wins, because 3 of
5 existing services already use it and CLAUDE.md PascalCases exported
type-like symbols. Rename `searchService` → `SearchService` and
`postsService` → `PostsService`, updating all import sites
(`grep -rn "searchService\|postsService" src/` to find them — expect
`search.astro`, `posts/[...id]/index.astro`, `blog.astro`, and the service
files). Pure rename; no behavior change.

**Verify**: `grep -rn "postsService\|searchService" src/` → zero matches;
`npm run astro:check && npm run lint` → exit 0.

### Step 4: One-line doc touch

In `docs/stable/architecture/architecture.md`, the entity list (plan 007 may
have already edited it): ensure memes is listed as a full
model/repository/service triple now. Bump the doc's `updated:` date.

**Verify**: `grep -n "memes" docs/stable/architecture/architecture.md` →
entity list includes memes without a "model-only" caveat.

## Test plan

- If plan 002 landed: run the full suite; add one test that
  `MemesRepository.searchMemes` returns `{results: [], total: 0}` against an
  empty fixture DB (reuse the build-sync test DB setup).
- Manual gate: `npm run astro:check` covers `/search` page typing end-to-end.

## Done criteria

- [ ] `src/db/features/memes/` contains model + repository + service
- [ ] `search.repository.ts` no longer imports `memesTable`
- [ ] Service exports uniformly PascalCase; zero `postsService`/`searchService` refs
- [ ] `npm run astro:check`, `npm run lint`, `npm test` (if present) green
- [ ] No files outside scope modified; `plans/README.md` updated

## STOP conditions

- The meme query in `search.repository.ts` turns out to be entangled with
  post-query internals (shared CTEs/joins) that can't move without behavior
  change — report with the entangled excerpt.
- Renaming `postsService` touches more than ~6 files or hits dynamic access
  patterns (string lookups) — report before mass-editing.
- You're tempted to make meme PAGES read from the DB — explicitly out of
  scope; files are the source of truth.

## Maintenance notes

- After this, "every entity has a triple" is true again — keep it true for
  the next entity (the pattern is what agents navigate by).
- `buildSync.ts` still writes tables directly by design (standalone Node
  context, no path aliases); do not "fix" that in review.
- Follow-up candidate (not planned): `memes.service.ts` could later serve a
  DB-backed memes listing page with pagination, if the memes collection
  grows beyond what a static page handles comfortably.
