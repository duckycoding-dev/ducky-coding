# Plan 001: Add a GitHub Actions CI workflow that gates every push and PR

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- package.json .nvmrc .github/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx

## Why this matters

This repo has no CI at all — there is no `.github/` directory. The only
verification gate is local husky hooks, which run lint-staged on staged files
only and can be bypassed with `--no-verify`. Type errors, lint failures, or a
broken build can land on `develop` or `main` unseen; the first signal of
breakage is a failed Netlify deploy. A single workflow running the repo's
existing check scripts closes this gap and is the verification baseline that
every other plan in `plans/` relies on.

## Current state

- No `.github/` directory exists anywhere in the repo.
- `package.json:26-42` — the scripts that CI should run already exist:

```json
"astro:check": "astro check",
"lint": "eslint .",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- `.nvmrc` contains exactly `v24.14.1` (no trailing newline). The build code
  hard-requires Node >= 22.6 (`src/db/sync/buildSync.ts` uses
  `node:fs/promises` `glob` and `Set.prototype.difference`).
- Lockfile: `package-lock.json` (npm). Install with `npm ci`.
- Env validation: `astro.config.mjs:143-173` defines an env schema with
  `validateSecrets: true`. The committed `.env.development` (5 lines, no
  secrets — `TURSO_DATABASE_URL=file:database/content.db`, empty auth token)
  provides everything `astro check` needs. Do NOT add any secret to CI.
- There is no test script yet. Plan 002 adds `npm test`; this workflow should
  run it conditionally so the two plans can land in either order.

## Commands you will need

| Purpose      | Command                       | Expected on success |
|--------------|-------------------------------|---------------------|
| Install      | `npm ci`                      | exit 0              |
| Typecheck    | `npm run astro:check`         | exit 0, 0 errors    |
| Lint         | `npm run lint`                | exit 0              |
| Format check | `npm run format:check`        | exit 0              |
| YAML sanity  | `npx --yes yaml-lint .github/workflows/ci.yml` (or any YAML parser) | parses |

## Scope

**In scope** (the only files you should create/modify):
- `.github/workflows/ci.yml` (create)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):
- `package.json` — no new scripts needed; use the existing ones.
- Netlify configuration / deploy settings.
- Husky hooks — they stay as the local fast path.
- Anything under `src/`.

## Git workflow

- Branch from `develop`: `advisor/001-ci-workflow`
- Conventional commits, lowercase, no trailing period, e.g. `ci: add github actions check workflow`
- Do NOT add any AI co-author trailer (repo rule in `CLAUDE.md`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the workflow file

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run astro:check
      - run: npm run lint
      - run: npm run format:check
      - name: Tests (if configured)
        run: |
          if npm run | grep -qE '^  test$'; then
            npm test
          else
            echo "no test script yet — skipping (added by plan 002)"
          fi
```

Notes:
- `node-version-file: .nvmrc` picks up `v24.14.1` — do not hardcode a version.
- Do NOT add a job that runs `npm run astro:build` — the build's
  `astro:build:start` hook runs DB migrations and a destructive content sync
  against whatever `TURSO_DATABASE_URL` is loaded (see plan 003). A build
  smoke job is explicitly deferred until plan 003 makes the sync safe/gateable.

**Verify**: the YAML parses (e.g. `node -e "require('yaml')"` is not needed —
use any YAML parser or `npx --yes js-yaml .github/workflows/ci.yml`) → no parse error.

### Step 2: Run the three checks locally exactly as CI will

**Verify**: `npm ci && npm run astro:check && npm run lint && npm run format:check` → all exit 0.
If `astro:check` or `lint` fails on pre-existing issues, STOP and report the
exact failures (do not fix unrelated code in this plan).

## Test plan

No unit tests — the deliverable is the workflow itself. Verification is the
local dry-run in Step 2 plus, after merge, one green run on GitHub Actions.

## Done criteria

- [ ] `.github/workflows/ci.yml` exists and parses as YAML
- [ ] `npm run astro:check` exits 0 locally
- [ ] `npm run lint` exits 0 locally
- [ ] `npm run format:check` exits 0 locally
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm run astro:check` or `npm run lint` fails on the untouched codebase —
  that is a pre-existing failure the operator must triage, not you.
- You are tempted to add env secrets to the workflow — nothing in these three
  checks needs one.
- The repo already has a `.github/workflows/` directory (drift — someone added
  CI since this plan was written).

## Maintenance notes

- Plan 002 adds `npm test`; the conditional step picks it up with no workflow
  change needed.
- After plan 003 lands (sync gating), consider a second job running
  `npm run astro:build:local` against a throwaway `file:` SQLite database as a
  full build smoke test — deliberately deferred from this plan.
- Reviewer should check: workflow triggers cover both `develop` (working
  branch) and `main` (PR target), and no secret is referenced.
