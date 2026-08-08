# Plan 004: Patch vulnerable dependencies and declare the phantom `yaml` dep

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- package.json package-lock.json`
> If these changed since this plan was written, re-run `npm audit` and
> re-derive target versions before proceeding; if `astro` is no longer 6.1.2,
> treat as a STOP condition and re-assess.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW (minor/patch bumps only; no majors)
- **Depends on**: none (001 recommended first so bumps are CI-verified)
- **Category**: security

## Why this matters

`npm audit` reports 52 advisories (1 critical, 18 high). Most are transitive
dev/build tooling, but four directly-declared packages have patched versions
within the same major: `astro` itself has a high-severity advisory fixed in
6.4.8. Separately, `src/db/sync/buildSync.ts` imports the `yaml` package,
which is declared NOWHERE in `package.json` — it resolves only because npm
hoists it from a transitive tree. Any dependency shuffle can silently break
the production build's frontmatter parsing.

## Current state

**Re-verified 2026-08-08 at `f653ed9`: nothing bumped, and the baseline got
worse — `npm audit` now reports 59 advisories (2 critical, 35 high, 20
moderate, 2 low) against the 52 quoted below. GitHub's Dependabot view on
the default branch counts 137. Use 59 as the npm-audit baseline to compare
against after the bumps.**

- `package.json` (unchanged since `1fce5b5`) pins exact versions; relevant
  lines (line numbers still valid):
  - `"astro": "6.1.2"` (line 53) → advisory fixed in **6.4.8**
  - `"@astrojs/netlify": "7.0.5"` (line 46) → **7.0.13** (GHSA-529g-xq4f-cw38,
    SSRF via broadened `image.remotePatterns`; partly mitigated here by
    `imageCDN: false` in `astro.config.mjs:31`, still bump)
  - `"markdown-it": "14.1.1"` (line 62) → **≥14.3.0** (moderate)
  - `"sanitize-html": "2.17.2"` (line 63) → **≥2.17.5** (moderate)
  - Both markdown-it and sanitize-html are used only at build time in
    `src/pages/rss.xml.ts:4-5,82-83`.
- `yaml` phantom dep: `src/db/sync/buildSync.ts:17` —
  `import { parse as parseYaml } from 'yaml';` — and `package-lock.json`
  currently resolves `node_modules/yaml` to **2.8.3** (transitive).
- Known blocked upgrades — do NOT attempt (tracked in
  `docs/issues/discovered.md` DEP-001/DEP-002 and
  `docs/stable/development/dependency-status.md`):
  - TypeScript stays 5.9.x (`@astrojs/check` peer dep)
  - `schema-dts` stays 1.x (`astro-seo-schema` peer dep)
  - `cva` stays `1.0.0-beta.4` (intentional)
  - `drizzle-kit` — its audit "fix" is a semver-major DOWNGRADE; leave it.

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Install   | `npm ci`                         | exit 0              |
| Audit     | `npm audit`                      | counts drop vs. baseline (52 total before) |
| Typecheck | `npm run astro:check`            | exit 0              |
| Lint      | `npm run lint`                   | exit 0              |
| Tests     | `npm test` (if plan 002 landed)  | all pass            |

## Scope

**In scope**:
- `package.json`, `package-lock.json`
- `docs/issues/discovered.md` — only if you must record a newly-discovered
  blocked bump (follow the existing `DEP-XXX` format in that file)
- `plans/README.md` (status row)

**Out of scope**:
- Any semver-major bump of anything.
- `drizzle-kit`, `typescript`, `schema-dts`, `cva` (see above).
- Source code changes. If a bump requires a code change, STOP.

## Git workflow

- Branch from `develop`: `advisor/004-dependency-bumps`
- Commit style: `fix(deps): bump astro to 6.4.8 and patch advisories` /
  `fix(deps): declare yaml as a direct dependency` — lowercase, no trailing
  period, no AI co-author trailer.

## Steps

### Step 1: Declare `yaml`

`npm install yaml@2.8.3 --save-exact` (matches the currently-resolved
version — the repo pins exact versions for all deps, keep that convention).

**Verify**: `grep '"yaml"' package.json` → `"yaml": "2.8.3"` in
`dependencies`; `npm ci && npm run astro:check` → exit 0.

### Step 2: Bump the four direct packages

`npm install --save-exact astro@6.4.8 @astrojs/netlify@7.0.13 markdown-it@14.3.0 sanitize-html@2.17.5`

If any of these versions no longer exists or a newer patch within the same
major is available, take the latest patch/minor of the SAME major.

**Verify**: `npm run astro:check` → exit 0; `npm run lint` → exit 0;
`npm test` (if present) → pass.

### Step 3: Sweep the transitive noise

`npm audit fix` (WITHOUT `--force` — `--force` would apply semver-major
changes, including the drizzle-kit downgrade).

**Verify**: `npm audit` → total advisories strictly lower than 52; ZERO
critical advisories remaining is the goal — if the `form-data` critical
persists because its parent chain can't move without a major, record that
outcome in the final report (and add a `DEP-XXX` entry to
`docs/issues/discovered.md` following its existing format).

### Step 4: Full local verification

**Verify**: `npm ci` (clean reinstall from the updated lockfile) →
`npm run astro:check && npm run lint && npm run format:check` → all exit 0.

## Test plan

No new tests. The gate is: clean `npm ci`, `astro:check`, `lint`, existing
suite (if plan 002 landed), and a reduced `npm audit` count.

## Done criteria

- [ ] `yaml` appears in `package.json` dependencies, exact-pinned
- [ ] `astro` ≥ 6.4.8 and `@astrojs/netlify` ≥ 7.0.13 (same majors)
- [ ] `npm audit` total < 52 and no critical, OR the remaining critical is
      documented as blocked in `docs/issues/discovered.md`
- [ ] `npm run astro:check`, `npm run lint`, `npm run format:check` exit 0
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `astro:check` fails after the astro bump (breaking change within 6.x) —
  report the errors; do not patch source to accommodate.
- `npm audit fix` wants to change a semver-major (it prints this) — abort the
  fix, report which package.
- `astro` in package.json is no longer `6.1.2` at execution time (drift) —
  re-audit before doing anything.

## Maintenance notes

- Root cause of the pile-up: exact pins + no update automation. Consider
  Renovate/Dependabot (out of scope here; one-line note for the operator).
- After this lands, `docs/stable/development/dependency-status.md` remains
  accurate (its blocked entries are untouched by this plan).
