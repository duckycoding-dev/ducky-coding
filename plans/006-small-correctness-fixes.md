# Plan 006: Fix five small confirmed correctness bugs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- src/utils/images/images.ts src/db/sync/buildSync.ts "src/pages/topics/[topic]/index.astro" src/db/features/search/ src/types/entities/memeContent.entity.ts src/content/memes/`
> On mismatch with any excerpt below, skip that fix and report it; the other
> fixes proceed independently.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/002-test-harness.md recommended (one fix flips a
  characterization test); executable without it, then skip the test edits
- **Category**: bug

## Why this matters

Five small bugs, each read and confirmed in the source. None is currently
user-visible-catastrophic, but each is a trap: a dead null-guard that never
warns, a soft-delete timestamp that silently vanishes, an expression that is
correct only by accident, a search box where `%` matches everything, and a
meme schema that both rejects normal YAML dates and churns a DB write on
every single build.

## Current state / Steps

Repo conventions: strict TS, `undefined` over `null` where possible, explicit
return types, Prettier 80-char single-quote. Verify after each fix with
`npm run astro:check && npm run lint` (both must exit 0) plus the
fix-specific check below.

### Fix A — dead null-guard in `matchImageFromGlobImport`

`src/utils/images/images.ts:16-19` currently:

```ts
if (!relativePath === undefined || relativePath === null) {
  logger?.warn('A relative path is required to match an image');
  return undefined;
}
```

`!relativePath` is a boolean, never `undefined` — the left side is always
false, so `undefined`/`''` slip through and build a bogus
`/src/assets/images/undefined` lookup path (harmless today only because of
the optional chaining at `:23`). Replace the condition with:

```ts
if (relativePath === undefined || relativePath === null || relativePath === '') {
```

**Verify**: `grep -n '!relativePath' src/utils/images/images.ts` → no match.

### Fix B — `deletedAt` wiped on edits of already-deleted posts

`src/db/sync/buildSync.ts:351-356` (inside the `someDataChanged` update):

```ts
deletedAt:
  postContentData.status === 'deleted' &&
  existingPost.status !== 'deleted' &&
  !existingPost.deletedAt
    ? Date.now()
    : null,
```

When a post is already `status: 'deleted'` and any other field changes, the
ternary takes the `null` branch and erases the original deletion timestamp.
Intended behavior: stamp on the transition into `deleted`, preserve while it
stays `deleted`, clear only when it leaves `deleted`. Replace with:

```ts
deletedAt:
  postContentData.status !== 'deleted'
    ? null
    : (existingPost.deletedAt ?? Date.now()),
```

**Verify**: if plan 002 landed, flip the characterization test named
`'KNOWN BUG (plan 006): deletedAt reset on edit of deleted post'` in
`tests/build-sync.test.ts` to assert preservation → `npm test -- build-sync`
passes. Without plan 002: `npm run astro:check` only.

### Fix C — operator-precedence accident in topic filter

`src/pages/topics/[topic]/index.astro:30-32` (inside `getStaticPaths`):

```ts
const topicsWithImages = (await TopicsService.getAllTopicsWithImage()).filter(
  (topic) => topic.postCount ?? 0 > 0,
);
```

Parses as `topic.postCount ?? (0 > 0)` — works today only via boolean
coercion in `filter`. Change to `(topic.postCount ?? 0) > 0`.
Then sweep for siblings: `grep -rn "postCount ?? 0 > 0" src/ docs/` — fix
any other occurrence in `src/` the same way (the architecture doc example at
`docs/stable/architecture/architecture.md:195-198` shows the same expression;
fix it there too so nobody re-copies the bug).

**Verify**: `grep -rn "?? 0 > 0" src/ docs/` → no matches.

### Fix D — unescaped LIKE wildcards in search

`src/db/features/search/search.repository.ts` builds LIKE patterns by direct
interpolation (parameterized by Drizzle, so NOT SQL injection — this is a
semantics bug):

```ts
// :34-38 (posts)
like(postsTable.title, `%${params.q}%`),
like(postsTable.summary, `%${params.q}%`),
like(postsTable.content, `%${params.q}%`),
// :115 (memes)
params.q ? like(memesTable.title, `%${params.q}%`) : undefined,
```

A user query of `%` or `_` acts as a wildcard (`q=%` matches every row).
Add a module-private helper in `search.repository.ts`:

```ts
const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, (c) => `\\${c}`);
```

Use `escapeLike(params.q)` in all four patterns, and append `ESCAPE '\'` to
each LIKE via Drizzle's `sql` operator — the shape is
`sql`${postsTable.title} LIKE ${`%${escaped}%`} ESCAPE '\'`` (replacing the
`like()` helper for these four call sites). Keep the discriminated-union
service contract untouched.

**Verify**: `npm run astro:check` exits 0. If plan 002 landed, add two unit
cases for `escapeLike` (export it for tests): `escapeLike('50%_\\')` →
`'50\\%\\_\\\\'`, `escapeLike('plain')` → `'plain'`.

### Fix E — meme `createdAt` schema drift

`src/types/entities/memeContent.entity.ts:8`:

```ts
createdAt: z.number().default(Date.now), // Unix timestamp
```

Two defects: (1) a YAML date (`createdAt: 2025-06-10`, the format posts use —
`src/types/entities/postContent.entity.ts` uses `z.coerce.date()`) parses to
a JS `Date` and FAILS `z.number()`, so the meme is skipped by the build sync;
(2) `.default(Date.now)` evaluates per parse, so a meme without `createdAt`
gets a NEW timestamp every build — `buildSync.ts:479-494` then sees
`existingMeme.createdAt !== memeRecord.createdAt` and rewrites the row every
single build (confirmed churn). Replace line 8 with:

```ts
createdAt: z.coerce.date().transform((d) => d.getTime()),
```

i.e. required, accepts YAML dates and numbers, stores millis (the DB column
is `integer` millis — `src/db/features/memes/memes.model.ts:24-26`). Then
check the three meme files (`src/content/memes/*.mdx`) — each must have a
`createdAt:` in frontmatter; add one (use a plausible past date from the
file's git-visible context or the existing DB value) to any that lacks it.
Note `content.config.ts:20-23` uses this same schema for the `memes`
collection, so `astro:check`/dev will validate the frontmatter too.
Check consumers of the collection field: `src/pages/memes/[...id]/index.astro`
sorts on `createdAt` numerically (`.data.createdAt`) — after this change the
collection value is a number (post-transform), so sorting still works; if
you find a consumer treating it as a `Date` object, STOP and report.

**Verify**: `npm run astro:check` → exit 0 (this validates the meme
collection against the new schema). If plan 002 landed, add a build-sync test:
two consecutive syncs of an unchanged meme fixture produce identical
`createdAt` and no second-run update.

## Commands you will need

| Purpose   | Command               | Expected |
|-----------|-----------------------|----------|
| Typecheck | `npm run astro:check` | exit 0   |
| Lint      | `npm run lint`        | exit 0   |
| Tests     | `npm test`            | all pass (if plan 002 landed) |

## Scope

**In scope**: `src/utils/images/images.ts`, `src/db/sync/buildSync.ts`
(deletedAt ternary only), `src/pages/topics/[topic]/index.astro`,
`src/db/features/search/search.repository.ts`,
`src/types/entities/memeContent.entity.ts`, `src/content/memes/*.mdx`
(frontmatter `createdAt` only), `docs/stable/architecture/architecture.md`
(the `?? 0 > 0` example only), `tests/**` (if present), `plans/README.md`.

**Out of scope**: buildSync orphan-cleanup/transaction work (plan 003);
`SearchParamsSchema` pageSize clamp-vs-fail (deliberately NOT changed here —
it's a product decision; see plans/README.md rejected/deferred list);
any other refactoring of the touched files.

## Git workflow

- Branch from `develop`: `advisor/006-small-correctness-fixes`
- One commit per fix (A–E), conventional style, e.g.
  `fix(images): correct null guard in matchImageFromGlobImport`,
  `fix(db): preserve deletedAt on edits of deleted posts`. No AI trailer.

## Done criteria

- [ ] All five greps/verifies above pass
- [ ] `npm run astro:check`, `npm run lint` exit 0
- [ ] `npm test` green (if suite exists), with flipped deletedAt test
- [ ] No files outside scope modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any excerpt above doesn't match the live code (drift) — skip that fix,
  do the rest, report which one was skipped.
- Fix E: a meme file's correct historical `createdAt` cannot be determined —
  report rather than inventing a date silently (proposing today's date is
  fine, but flag it).
- Fix D: Drizzle version in the repo rejects the `ESCAPE` construction —
  report; do not swap ORMs or write raw unparameterized SQL.

## Maintenance notes

- Fix E makes `createdAt` REQUIRED for memes — future meme files must include
  it (good: stable ordering). Reviewer should confirm all three existing
  memes still render at `/memes`.
- Fix D changes match semantics for queries containing `%`/`_` — previously
  "match everything", now literal. That's the point; noting for review.
