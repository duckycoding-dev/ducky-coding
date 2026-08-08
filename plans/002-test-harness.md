# Plan 002: Add Vitest and lock down the four highest-risk pure-logic units

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- package.json src/db/features/search/ src/components/pagination/ src/db/sync/ src/utils/json-ld/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (tests only; one small export refactor)
- **Depends on**: none (001 recommended first so CI picks tests up)
- **Category**: tests

## Why this matters

The repo has zero test files and no test runner. Four units carry real risk:
(1) `SearchParamsSchema` gates the site's only runtime SSR route (`/search`);
(2) pagination math renders on every listing page and feeds `rel=prev/next`
SEO links; (3) `buildSync.ts` is the only writer of the production search
index and has already regressed once (the repo's own commit template
memorializes a "post tags deleted on every sync" bug); (4) the JSON-LD graph
builders produce the structured data on every page. Plan 003 **rewrites parts
of buildSync** — these characterization tests must exist first so that rewrite
is verifiable.

## Current state

**Re-verified 2026-08-08 at `f653ed9`: still entirely TODO. One drift to
know about — `src/utils/json-ld/person.ts` changed in `fb28acb` (`jobTitle`
is now `Frontend Engineer`, plus a new `description` and a reordered
`knowsAbout`). Unit D below targets `graph.ts` / `breadcrumb.ts`, which are
untouched, but read `person.ts` live before asserting anything about the
Person node.**

- No `*.test.*` / `*.spec.*` files anywhere; no vitest/jest/playwright in
  `package.json` (read `package.json:26-87` to confirm).
- TypeScript strict mode, `erasableSyntaxOnly: true` (use `import type`),
  `noUncheckedIndexedAccess: true`. ESLint flat config in `eslint.config.js`,
  Prettier 80-char/single-quote.
- **Unit A** — `src/db/features/search/search.types.ts:7-22`:

```ts
export const SearchParamsSchema = z.object({
  q: z.string().min(1).optional(),
  tags: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.string().min(1)).min(1))
    .optional(),
  topics: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.string().min(1)).min(1))
    .optional(),
  type: z.enum(['post', 'meme', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
```

  Sharp edge to pin: `pageSize=101` makes `safeParse` FAIL, and
  `searchService.search` (`src/db/features/search/search.service.ts:6-12`)
  then returns `{ success: false }`, so `/search` renders its error state
  instead of clamping. Characterize this AS-IS (a test asserting parse
  failure); plan 006 may change the behavior and will update the test.

- **Unit B** — `src/components/pagination/Pagination.astro:26-54` contains a
  pure function `getVisiblePages(current, total)` defined inside the
  component frontmatter (first/last/current ±1, `'ellipsis'` on gaps, "show
  all if ≤ 5"). It must be extracted to a plain `.ts` file to be testable.

- **Unit C** — `src/db/sync/buildSync.ts` (624 lines). Key behaviors to
  characterize (all read from the current code):
  - `extractFrontmatter` (`:74-85`) — regex split of `---` frontmatter.
  - Change detection `someDataChanged` (`:330-343`) — field-by-field diff
    including tag-set comparison via `Set.prototype.difference` (`:322-324`).
  - Tag reconciliation (`:395-413`) — delete-all-then-reinsert of
    `posts_tags` rows, guarded by `shouldSyncTags`.
  - Orphan cleanup (`:512-568`) — hard-deletes posts/memes/topics whose slug
    is not in the synced list, guarded by `if (list.length > 0)`.
  - Known bugs to characterize AS-IS (fixed later by plans 003/006, which
    will flip these assertions): a validation-failed post file is skipped and
    then **deleted** by orphan cleanup (`:271-277` + `:516-531`); `deletedAt`
    is reset to `null` on any edit of an already-deleted post (`:351-356`).
  - The module takes a `BuildSyncDbConfig` (`{url, authToken?}`) and creates
    its own libsql client (`:33-41`) — so tests can point it at a throwaway
    `file:` database. Content is read from `src/content/**` via
    `path.join(process.cwd(), ...)` glob patterns (`:169-172`, `:257-260`,
    `:431-434`) — tests must run with `process.cwd()` set to a fixture
    directory (use vitest's ability to `process.chdir` in `beforeEach`, and
    restore after).

- **Unit D** — `src/utils/json-ld/graph.ts` (`buildGraph`) and
  `src/utils/json-ld/breadcrumb.ts` (`buildBreadcrumb`); read them before
  writing tests — assert output shape (`@graph` array, `@id` wiring,
  breadcrumb `position` sequence), not exact content.

- Migrations live in `src/db/migrations/*.sql` and can be applied to a
  throwaway DB via `drizzle-orm/libsql/migrator` the same way
  `buildMigrate` does (`buildSync.ts:49-68`).

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `npm ci`                         | exit 0              |
| Add dev dep | `npm install -D vitest`        | exit 0, lockfile updated |
| Typecheck | `npm run astro:check`            | exit 0              |
| Tests     | `npm test`                       | all pass            |
| Lint      | `npm run lint`                   | exit 0              |

## Scope

**In scope**:
- `package.json` (add `vitest` devDependency + `"test": "vitest run"` script)
- `vitest.config.ts` (create; node environment; include `src/**/*.test.ts` and `tests/**/*.test.ts`)
- `src/components/pagination/get-visible-pages.ts` (create — extracted function)
- `src/components/pagination/Pagination.astro` (import the extracted function; delete the inline copy — no other change)
- `tests/` (create: `search-params.test.ts`, `pagination.test.ts`, `build-sync.test.ts`, `json-ld.test.ts`, plus `tests/fixtures/` content files)
- `plans/README.md` (status row)

**Out of scope**:
- Any behavior change in `buildSync.ts`, `search.types.ts`, or the json-ld
  builders — these are characterization tests; bugs get fixed in plans 003/006.
- Playwright/E2E, coverage thresholds, CI changes (001 auto-detects `npm test`).
- `database/content.db` — never point tests at it; use a temp-dir `file:` DB.

## Git workflow

- Branch from `develop`: `advisor/002-test-harness`
- Conventional commits, lowercase, no trailing period, no AI co-author
  trailer. Example: `test(db): characterize buildSync orphan cleanup`

## Steps

### Step 1: Install and configure Vitest

`npm install -D vitest`. Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
```

Add `"test": "vitest run"` to `package.json` scripts.

**Verify**: `npm test` → "no test files found" style exit (or 0 tests) without crashing.

### Step 2: Test SearchParamsSchema (`tests/search-params.test.ts`)

Cases: empty input → all defaults (`type:'all'`, `page:1`, `pageSize:20`);
`tags: 'a,,b'` → `['a','b']`; `tags: ''` → parse failure (empty array fails
`.min(1)`); `type:'bogus'` → failure; `page:'0'` → failure; `page:'3'` →
`3` (coercion); `pageSize:'101'` → **failure** (characterizes current
behavior — see Why this matters); `pageSize:'100'` → `100`.

**Verify**: `npm test -- search-params` → all pass.

### Step 3: Extract and test getVisiblePages

Move the function body from `Pagination.astro:26-54` verbatim into
`src/components/pagination/get-visible-pages.ts` with an explicit return
type (`(number | 'ellipsis')[]`), export it, and import it in the `.astro`
frontmatter. Then `tests/pagination.test.ts` covering: `(1,1)` → `[1]`;
`(1,5)` → `[1..5]`; `(1,6)` → `[1,2,'ellipsis',6]`; `(3,10)` →
`[1,2,3,4,'ellipsis',10]`; `(10,10)` → `[1,'ellipsis',9,10]`; `(5,9)` →
ellipsis on both sides; no duplicate entries for `(2,6)`.
Run each case mentally against the excerpt first; if an expectation
disagrees with actual output, trust the code (characterization).

**Verify**: `npm test -- pagination` and `npm run astro:check` → pass, 0 errors.

### Step 4: Characterization tests for buildSync (`tests/build-sync.test.ts`)

Setup per test: create a temp dir with `src/content/{posts,topics,memes}`
fixture files (valid frontmatter copied in shape from
`src/content/posts/welcome-to-duckycoding.mdx`), `process.chdir(tempDir)`,
apply migrations from the real `src/db/migrations` folder to
`file:<tempdir>/test.db` using `migrate` from `drizzle-orm/libsql/migrator`,
then call `buildSyncAllContent({ url: 'file:...' })` and query the DB with a
drizzle client to assert. Restore `process.cwd` in `afterEach`.

Cases:
1. Fresh sync of 1 topic + 2 posts → rows exist, tags linked, topic
   `postCount` updated.
2. Idempotency: second run with unchanged files → `someDataChanged` path
   writes nothing (assert `updatedAt` values unchanged between runs).
3. Tag change: edit fixture tags → posts_tags reflects new set; removed tag
   with no other references is deleted by cleanup (`:562-568`).
4. File deletion: remove one post fixture → its row and posts_tags rows are
   gone after resync.
5. **Bug characterization (flips in plan 003)**: make one post's frontmatter
   invalid (e.g. remove `title`) → after resync its DB row is DELETED even
   though the file exists. Name the test clearly, e.g.
   `'KNOWN BUG (plan 003): validation-failed post is orphan-deleted'`.
6. **Bug characterization (flips in plan 006)**: post with `status: 'deleted'`
   and an existing `deletedAt`; change its title; resync → `deletedAt` is
   reset to `null`.

**Verify**: `npm test -- build-sync` → all pass.

### Step 5: Shape tests for JSON-LD builders (`tests/json-ld.test.ts`)

Read `src/utils/json-ld/graph.ts` and `breadcrumb.ts` first. Assert:
`buildGraph([...])` returns an object with `@context`/`@graph` (match actual
shape) containing the passed nodes; `buildBreadcrumb` produces sequential
`position`s starting at 1 and includes the page URL. 3-5 assertions total —
this is a smoke lock, not a schema validator.

**Verify**: `npm test` → full suite passes; `npm run lint` → exit 0.

## Test plan

This plan IS the test plan. Final state: 4 test files, ≥ 20 cases, all green,
runnable via `npm test` with no network and no touch of `database/content.db`.

## Done criteria

- [ ] `npm test` exits 0 with ≥ 20 passing tests across 4 files
- [ ] `npm run astro:check` exits 0 (Pagination extraction broke nothing)
- [ ] `npm run lint` exits 0
- [ ] `grep -n "getVisiblePages" src/components/pagination/Pagination.astro` shows only the import + call, no inline definition
- [ ] `git status` clean outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

- `buildSyncAllContent` cannot be pointed at a fixture dir via
  `process.chdir` (e.g. it resolves paths at import time) — report; do not
  refactor buildSync's path handling in this plan.
- Vitest cannot import a module because of Astro-specific imports
  (`astro:content` etc.) leaking into a unit under test — report which
  import; do not mock Astro internals speculatively.
- Any test would need to hit the network or a real Turso instance.
- The `Pagination.astro` extraction changes rendered output
  (`astro:check` errors or the component's props change).

## Maintenance notes

- Plans 003 and 006 MUST flip the two "KNOWN BUG" characterization tests to
  assert the fixed behavior — that is by design.
- If content frontmatter schemas change (`src/types/entities/*`), the
  buildSync fixtures need the same update.
- Reviewer: check tests assert on DB state, not on console output.
