# Plan 009: DX hygiene — .env.example, README setup, engines, packageManager, dep classification

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- package.json README.md .nvmrc`
> On mismatch with the excerpts below, re-check each sub-task before editing.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (if plan 004 runs first, package.json will have newer
  versions — that's fine, this plan touches different fields)
- **Category**: dx

## Why this matters

Five small onboarding/reproducibility gaps: no `.env.example` even though the
build hard-fails on missing env vars (`validateSecrets: true`); a 5-line
README with zero setup steps; no `engines` field although the build code
requires Node ≥ 22.6 (native `fs.glob`, `Set.prototype.difference`, node-run
`.ts` scripts); no `packageManager` pin; and two build-time tools
(`drizzle-kit`, `@astrojs/check`) declared as production `dependencies`.
Each costs a future contributor (or CI, or an agent) a confusing failure.

## Current state

- Required env vars — schema at `astro.config.mjs:143-173`: `BASE_SITE_URL`
  (client, url), `SERVER_LOGS_LEVEL` / `CLIENT_LOGS_LEVEL` (enum, default
  `info`), `TURSO_DATABASE_URL` (server secret, url), `TURSO_AUTH_TOKEN`
  (server secret, optional). Working local values are visible in the
  committed `.env.development` (no secrets in it: local `file:` URL, empty
  token).
- `README.md` — **no longer 5 lines**: rewritten to 50 lines in `ef5d565`
  (2026-08-07) with intro, stack, "Local development", "Quality checks" and
  site link. What it still misses is the DB step: `:25-35` goes
  `nvm use` → `npm install` → `npm run astro:dev`, with no
  `npm run db:migrate:local`. That step is optional only while
  `database/content.db` is tracked — plan 005 untracks it, after which a
  fresh clone with these instructions starts against a missing database.
  Full setup remains documented in
  `docs/stable/development/build-flow.md:150-165`:
  `npm run db:migrate:local` → optional `npm run drizzle:seed` →
  `npm run astro:dev`.
- `.nvmrc` — exactly `v24.14.1`.
- `package.json` — no `engines`, no `packageManager`. `"drizzle-kit":
  "0.31.10"` at line 59 and `"@astrojs/check": "0.9.8"` at line 44 are in
  `dependencies`; both are used only by dev/build scripts
  (`drizzle:generate_migrations|studio|seed`, `astro:check`, and
  `astro:build`'s `astro check &&` prefix).
- Husky hooks that new clones run: `.husky/pre-commit` → `lint-staged`;
  `.husky/commit-msg` → `commitlint --edit $1`; `.husky/prepare-commit-msg` →
  `node scripts/prepare-commit-msg.ts` (needs Node ≥ 22.6 type-stripping).

## Commands you will need

| Purpose   | Command                             | Expected |
|-----------|-------------------------------------|----------|
| Install   | `npm ci`                            | exit 0   |
| Typecheck | `npm run astro:check`               | exit 0   |
| Lint+fmt  | `npm run lint && npm run format:check` | exit 0 |

## Scope

**In scope**: `.env.example` (create), `README.md`, `package.json`
(`engines`, `packageManager`, dependency reclassification), `package-lock.json`
(regenerated), `plans/README.md`.

**Out of scope**: `.env.development` / `.env.production` contents; version
bumps of any package (plan 004); CI (plan 001); husky hook contents;
`.gitignore` (plan 005).

## Git workflow

- Branch from `develop`: `advisor/009-dx-hygiene`
- Commits: `chore(repo): add .env.example and engines/packageManager pins`,
  `docs(readme): add getting-started section`,
  `chore(deps): move build tools to devDependencies`. No AI trailer.

## Steps

### Step 1: `.env.example`

Create at repo root (placeholder values only — NEVER copy anything from
`.env.production`):

```bash
# Copy to .env.development for local work (see docs/stable/development/build-flow.md)
BASE_SITE_URL=http://localhost:4321
SERVER_LOGS_LEVEL=info
CLIENT_LOGS_LEVEL=info
# Local: file-based SQLite. Production uses a hosted Turso URL + auth token.
TURSO_DATABASE_URL=file:database/content.db
TURSO_AUTH_TOKEN=
```

(If plan 003 landed and added a `DB_SYNC` env var, include it with its
default.)

**Verify**: `test -f .env.example && grep -c "=" .env.example` → ≥ 5;
`grep -iE "libsql://|eyJ" .env.example` → no matches (no real URL/token).

### Step 2: complete the README's "Local development" section

Mostly done by `ef5d565` — do NOT rewrite the section, extend the existing
block at `README.md:25-35` with the two missing steps:

- `cp .env.example .env.development` (already committed in this repo, but
  the copy line documents the general flow)
- `npm run db:migrate:local` (+ optional `npm run drizzle:seed`) before
  `npm run astro:dev` — mandatory once plan 005 untracks the DB file.

Optional, if it does not bloat the section: a pointer to
`docs/stable/architecture/` and `docs/stable/development/build-flow.md`.
The Node prereq is already covered by the `.nvmrc` sentence at `:27`.

**Verify**: `grep -n "db:migrate:local" README.md` → match.

### Step 3: engines + packageManager

In `package.json` add:

```json
"engines": { "node": ">=22.6" },
```

and a `packageManager` field pinned to the npm version you verify locally
(`npm --version`), e.g. `"packageManager": "npm@11.6.2"` — use the ACTUAL
output, don't copy this example.

**Verify**: `npm ci` → exit 0 (no engine conflict); `node -e "const p=require('./package.json'); if(!p.engines||!p.packageManager) process.exit(1)"` → exit 0.

### Step 4: reclassify build tools

Move `drizzle-kit` and `@astrojs/check` (keeping their exact current
versions) from `dependencies` to `devDependencies`, then `npm install` to
regenerate the lockfile. Netlify installs devDependencies by default, and the
build command `astro:build` runs `astro check` — confirm `@astrojs/check`
still resolves: `npm ls @astrojs/check` → present.

**Verify**: `npm ci && npm run astro:check && npm run lint` → all exit 0;
`node -e "const p=require('./package.json'); if(p.dependencies['drizzle-kit']||p.dependencies['@astrojs/check']) process.exit(1)"` → exit 0.

## Test plan

No unit tests — the verification commands above are the gates.

## Done criteria

- [ ] `.env.example` exists, placeholder-only
- [ ] README has the getting-started section
- [ ] `engines.node` ≥ 22.6 and `packageManager` present
- [ ] `drizzle-kit` + `@astrojs/check` in devDependencies; `npm ci && npm run astro:check` green
- [ ] `npm run format:check` exit 0
- [ ] No files outside scope modified; `plans/README.md` updated

## STOP conditions

- Anything would require reading or copying from `.env.production` — never.
- `npm ci` fails after the engines field (your local Node is older than
  22.6) — report; do not lower the constraint.
- Evidence that the Netlify build uses `--omit=dev` (e.g. a `netlify.toml`
  appears with such config) — then step 4's move would break prod builds;
  STOP and report.

## Maintenance notes

- If a new env var is added to `astro.config.mjs`'s schema, `.env.example`
  must gain the line — cheap convention worth keeping.
- Consider Renovate/Dependabot later (also noted in plan 004).
