# Plan 005: Fix the corrupted .gitignore and untrack the derived SQLite artifacts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- .gitignore database/`
> On mismatch with the excerpts below, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt

## Why this matters

There is no ignore entry for `content.db` itself, so `database/content.db`
(~124 KB binary) is tracked in git. The DB is a build-derived index
(regenerated from `src/content/` by `src/db/sync/buildSync.ts` on every
build) — tracking it means binary churn in every commit that touches
content, and merge conflicts that cannot be resolved meaningfully. Every
local build dirties it: this session had to `git checkout -- database/`
twice to keep a diff readable.

## Current state

**Re-verified 2026-08-08 at `f653ed9`. Partially resolved since `1fce5b5`:
the concatenated-line half of this plan is DONE, the untracking half is
not.**

- `.gitignore:28-31` today — the two entries that were concatenated on
  `1fce5b5` are now separate lines (repaired on `main` and brought in by
  merge `c9dc138`):

```gitignore
# sqlite files
**/content.db-shm
**/content.db-wal
.superpowers/
```

  Still missing: a `**/content.db` entry. `.superpowers/` no longer exists
  in the repo root, so Step 1's "decide the fragment" question resolves to
  "drop it".

- `git ls-files database/` → `database/content.db` only. The WAL file is no
  longer tracked and `git check-ignore` matches it against `:30`. So Step 2
  now concerns a single path.
- Local dev expects the DB at this path: `.env.development:4` —
  `TURSO_DATABASE_URL=file:database/content.db` — and
  `docs/stable/development/build-flow.md:150-165` documents recreating it
  from scratch with `npm run db:migrate:local` (+ optional
  `npm run drizzle:seed`). Untracking does NOT break anyone: the file stays
  on disk, and a fresh clone recreates it with one command.
- The DB contains only public blog content (synced posts/topics/memes/images
  metadata) — no secrets. This is hygiene, not an incident.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Confirm tracked | `git ls-files database/` | lists `content.db` (and possibly `content.db-wal`) |
| Untrack (keep on disk) | `git rm --cached database/content.db database/content.db-wal` | exit 0 (use only paths that `git ls-files` listed) |
| Verify ignore | `git check-ignore -v database/content.db database/content.db-wal` | both match the new rules |
| Status | `git status --short` | shows `.gitignore` modified + the `git rm` deletions, nothing else |

## Scope

**In scope**:
- `.gitignore`
- git index entries for `database/content.db`, `database/content.db-wal` (untrack only — files stay on disk)
- `plans/README.md` (status row)

**Out of scope**:
- Deleting the files from disk — local dev uses them.
- Rewriting git history to purge old blobs — not worth it for a ~100 KB
  public-content file.
- `database/` contents themselves; `.env*` files; any source code.

## Git workflow

- Branch from `develop`: `advisor/005-gitignore-untrack-db`
- Single commit, e.g.: `fix(repo): ignore and untrack derived sqlite artifacts`
- No AI co-author trailer. Do NOT push unless instructed.

## Steps

### Step 1: Repair `.gitignore`

Replace the `# sqlite files` block with:

```gitignore
# sqlite files (build-derived, recreated by db:migrate:local + build sync)
**/content.db
**/content.db-shm
**/content.db-wal
```

Only the `**/content.db` line is new; the other two already exist. The
`.superpowers/` entry below the block: `ls -d .superpowers` returned nothing
on 2026-08-08, so drop it unless the directory has come back.

**Verify**: `git check-ignore -v database/content.db database/content.db-wal database/content.db-shm` → all three match rules in `.gitignore`.

### Step 2: Untrack the artifacts

`git ls-files database/` → for each listed file, `git rm --cached <path>`.

**Verify**: `git ls-files database/` → empty output; `ls database/` → files
still present on disk.

### Step 3: Commit

Commit `.gitignore` + the index removals together.

**Verify**: `git status --short` → clean; a fresh `git status` does NOT show
`database/content.db*` as untracked (they're ignored now).

## Test plan

None (repo metadata change). The verification commands above are the test.

## Done criteria

- [ ] `git check-ignore database/content.db database/content.db-wal` exits 0 for both
- [ ] `git ls-files database/` is empty
- [ ] `database/content.db` still exists on disk
- [ ] No other files modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `git ls-files database/` is already empty (drift — someone fixed it).
- Anything else in the repo turns out to reference the DB *via git* (e.g. a
  script that assumes a fresh clone contains `content.db`). Check first:
  `grep -rn "content.db" --include="*.ts" --include="*.md" --include="*.mjs" .`
  excluding `node_modules` — the only hits should be `.env.development`,
  docs, and `.gitignore`. A hit implying "clone ships a DB" → STOP and report.

## Maintenance notes

- After this, a fresh clone must run `npm run db:migrate:local` before
  `npm run astro:dev` — that is already the documented flow in
  `docs/stable/development/build-flow.md:150-165`; plan 009's README update
  makes it more discoverable.
- Old blobs remain in git history; acceptable (public content, small).
