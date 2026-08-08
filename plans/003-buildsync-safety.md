# Plan 003: Make the build-time DB sync non-destructive and gateable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- src/db/sync/buildSync.ts astro.config.mjs tests/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — this touches the only writer of the production search index
- **Depends on**: plans/002-test-harness.md (characterization tests must exist first)
- **Category**: bug

## Why this matters

The build-time sync can silently hard-delete production data. A post whose
frontmatter fails Zod validation is *skipped* — and the orphan-cleanup phase
then treats it as deleted-from-disk and hard-deletes its DB row and tag links,
even though the file still exists. The sync runs at `astro:build:start`
against whatever `TURSO_DATABASE_URL` the build mode loads, with no
transaction: a build that fails after the deletes still leaves prod rows gone,
so the SSR `/search` page (the DB's only runtime consumer) silently loses
content. Additionally, *every* build — including local
`npm run astro:build:local` — runs migrations and this mutating sync with no
opt-out.

## Current state

All excerpts from `src/db/sync/buildSync.ts` as of commit `1fce5b5`.

- Validation failure skips the file WITHOUT recording its slug (`:271-277`):

```ts
const parsed = PostContentSchema.safeParse(parseYaml(rawFrontmatter));
if (!parsed.success) {
  console.log(`  Skipping post ${postFilePath}: ${parsed.error.message}`);
  postsSkippedCount++;
  continue;                     // slug never reaches syncedSlugs
}
```

  The same pattern exists in the per-post `catch` (`:418-421`), for topics
  (`:181-187`, `:244-247`) and memes (`:444-450`, `:502-505`).

- Orphan cleanup then deletes anything not in `syncedSlugs` (`:516-531`):

```ts
if (syncedSlugs.length > 0) {
  const orphanedPosts = await db
    .select({ id: postsTable.id, slug: postsTable.slug })
    .from(postsTable)
    .where(notInArray(postsTable.slug, syncedSlugs));
  if (orphanedPosts.length > 0) {
    ...
    await db.delete(postsTagsTable).where(inArray(postsTagsTable.postId, orphanedIds));
    await db.delete(postsTable).where(notInArray(postsTable.slug, syncedSlugs));
```

  Same for memes (`:539-546`) and topics (`:549-558`); tags cleanup via raw
  SQL (`:562-568`). Note the inverse hazard too: the `length > 0` guards mean
  "every file failed validation" skips cleanup entirely (accidentally safe),
  but "one file failed" deletes that one row (the bug).

- The whole sync is NOT wrapped in a transaction; `buildSyncAllContent`
  catches all errors and returns `{success:false}` (`:617-622`), and the
  integration in `astro.config.mjs:108-121` merely logs a warning and lets
  the build continue:

```js
'astro:build:start': async ({ logger }) => {
  const dbConfig = {
    url: buildEnv['TURSO_DATABASE_URL'] ?? '',
    authToken: buildEnv['TURSO_AUTH_TOKEN'],
  };
  logger.info('Running DB migrations...');
  const migrateResult = await buildMigrate(dbConfig);
  ...
  await buildSyncImages(dbConfig);
  await buildSyncAllContent(dbConfig);
```

- Mode selection (`astro.config.mjs:12-17`): `--mode development`
  (`npm run astro:build:local`) loads `.env.development`
  (`TURSO_DATABASE_URL=file:database/content.db`), production loads
  `.env.production` (hosted Turso). Whatever is loaded gets migrated + synced
  + orphan-cleaned on every build.

- Plan 002 created `tests/build-sync.test.ts` with a characterization test
  named `'KNOWN BUG (plan 003): validation-failed post is orphan-deleted'`.
  This plan must flip that test's assertion.

- Repo conventions: discriminated-union results `{success, data|error}`
  (see `src/db/features/search/search.service.ts` as exemplar), `undefined`
  over `null`, explicit return types, strict TS.

## Commands you will need

| Purpose   | Command                 | Expected on success |
|-----------|-------------------------|---------------------|
| Install   | `npm ci`                | exit 0              |
| Tests     | `npm test`              | all pass            |
| Typecheck | `npm run astro:check`   | exit 0              |
| Lint      | `npm run lint`          | exit 0              |

Do NOT run `npm run astro:build` or `astro:build:local` to "test" this —
that is exactly the mutation this plan is defusing. The vitest suite from
plan 002 exercises the sync against a throwaway `file:` DB.

## Scope

**In scope**:
- `src/db/sync/buildSync.ts`
- `astro.config.mjs` (sync gating only — the `db-sync` integration block and, if needed, one new env var in the `env.schema`)
- `tests/build-sync.test.ts` (flip/extend assertions)
- `docs/stable/development/build-flow.md` (one short paragraph documenting the new gate — only if plan 007 has not already restructured it; otherwise leave docs to 007)
- `plans/README.md` (status row)

**Out of scope**:
- `deletedAt` reset bug at `:351-356` — fixed in plan 006.
- Batching the per-item SELECT/UPDATE round-trips (N+1) — deferred; see
  Maintenance notes.
- `src/db/features/**` services/repositories; page code; migrations.

## Git workflow

- Branch from `develop`: `advisor/003-buildsync-safety`
- Conventional commits, lowercase, no trailing period, no AI co-author
  trailer. Exemplar from the repo's own commit template
  (`scripts/prepare-commit-msg.ts:33`): `fix(db): post tags deleted on every sync`

## Steps

### Step 1: Key orphan cleanup off "files seen", not "files synced"

In `buildSyncAllContent`, alongside each `synced*` array, track a
`seen*` array appended **before** validation (right after the slug/title is
derived from the file path — for posts derive the slug even when parsing
fails: move the slug derivation at `:280-289` above the `safeParse`, or
duplicate it in the failure branch; for topics you cannot know the title of
an unparseable JSON file, so on parse failure add a boolean flag
`hadUnparseableTopic` and skip topic cleanup entirely that run; same
pattern for memes with unparseable frontmatter).

Change the three cleanup blocks (`:516-531`, `:539-546`, `:549-558`) to use
`seenSlugs` / `seenMemeSlugs` / `seenTitles` in `notInArray`, and to skip
cleanup with a logged warning when the corresponding "unparseable" flag is
set. Result: a row is deleted only when its file is truly gone from disk.

**Verify**: `npm test -- build-sync` → the plan-002 characterization test
now FAILS. Flip its assertion (validation-failed post row SURVIVES sync,
and a warning is logged) and rename it, e.g.
`'validation-failed post is kept in DB (fixed by plan 003)'`. → all pass.

### Step 2: Make sync failures fail the build

In `astro.config.mjs` `astro:build:start` hook: if
`buildSyncAllContent` returns `{ success: false }`, `throw new Error(...)`
so the build aborts instead of shipping with a partially-synced index.
Keep the migration result as a warning (existing behavior — tables may
already exist, see `buildSync.ts:61-67`).

**Verify**: `npm run astro:check` → exit 0. Add a test: point
`buildSyncAllContent` at an unreachable `file:` path → returns
`{success:false}` (confirming the hook would throw).

### Step 3: Gate the sync behind an explicit env switch

Add `DB_SYNC` to the env schema in `astro.config.mjs:143-173` as an
`envField.enum({ context: 'server', access: 'public', values: ['run', 'skip'], default: 'run' })`
— match the style of `SERVER_LOGS_LEVEL` (`:151-156`). In the hook, read it
from `buildEnv['DB_SYNC']` (module-level `loadEnv` result, `:17`) and skip
migrate+sync entirely (with a clear `logger.info`) when `'skip'`.
Add `DB_SYNC=skip` to a comment in `.env.development` is NOT possible
(out of scope for that file? No—) — add the line `DB_SYNC=run` to
`.env.development` so local builds stay explicit, and document in the hook
comment that `DB_SYNC=skip npm run astro:build:local` builds without touching
any DB. Default stays `run` so Netlify prod builds are unchanged.

**Verify**: `npm run astro:check` → exit 0; `npm run lint` → exit 0.

### Step 4: Wrap content sync in a transaction if the driver allows

Attempt to wrap the body of `buildSyncAllContent` (topics + posts + memes +
cleanup + analytics) in `db.transaction(async (tx) => {...})`, replacing
`db` with `tx` inside. Drizzle's libsql driver supports interactive
transactions; the sync currently uses `.get()`, `.returning()`, raw `sql`
— all work on `tx`. If any call is genuinely unsupported inside a
transaction, fall back to batching only the destructive phase (orphan
cleanup) in one transaction and note it in the code.

**Verify**: `npm test` → full suite green (idempotency, tag reconcile,
deletion, and the flipped test all still pass through the transaction path).

## Test plan

- Flip the plan-002 characterization test (Step 1).
- New: unreachable DB → `{success:false}` (Step 2).
- New: `seen`-vs-`synced` distinction — file present but invalid → row kept;
  file removed → row deleted (extend the existing deletion test).
- Verification: `npm test` → all pass; no test touches `database/content.db`.

## Done criteria

- [ ] `npm test` exits 0; the former KNOWN-BUG test now asserts survival
- [ ] `npm run astro:check` and `npm run lint` exit 0
- [ ] `grep -n "notInArray" src/db/sync/buildSync.ts` shows cleanup keyed on `seen*` arrays
- [ ] `astro.config.mjs` throws on `{success:false}` and honors `DB_SYNC=skip`
- [ ] `git status` clean outside in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

- Plan 002's `tests/build-sync.test.ts` does not exist or doesn't pass on the
  unmodified code — execute plan 002 first.
- `db.transaction` fails with the libsql `file:` driver in tests AND the
  cleanup-only fallback also fails — report driver versions and stop.
- The fix seems to require changing content schemas
  (`src/types/entities/*`) or page code — out of scope.

## Maintenance notes

- Deferred, deliberately: batching the per-item `SELECT`-then-`UPDATE` into a
  prefetch map + bulk upserts (`buildSync.ts:291-295` and `:314-320` run per
  post). Worth doing only when content count makes build latency noticeable.
- Plan 001's CI can now safely gain a build smoke job using `DB_SYNC=skip`
  (or a throwaway `file:` DB with `DB_SYNC=run`).
- Reviewer: scrutinize the topic "unparseable → skip cleanup" path — it
  trades staleness (old rows linger) for safety (no false deletes). That
  trade is intentional.
- If a future change adds a new synced entity, it must follow the
  `seen`/`synced` split or the false-orphan bug returns.
