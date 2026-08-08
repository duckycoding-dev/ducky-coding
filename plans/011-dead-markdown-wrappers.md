# Plan 011: Remove the 17 dead markdown Custom* wrapper components

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 1fce5b5..HEAD -- src/components/markdown/`
> On mismatch with the excerpt below, STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt

## Why this matters

`src/components/markdown/` contains 18 wrapper components of which only
`CustomA` is actually wired up. The other 17 are dead files whose justifying
comment says markdown styling relies on "Tailwind's typography plugin" — a
plugin that is NOT installed (no `@tailwindcss/typography` in
`package.json`; markdown is actually styled by `src/styles/markdown.css`).
Dead code that lies about the styling system misleads every future editor.

## Current state

- `src/components/markdown/index.ts` (entire file, verified):

```ts
import CustomA from './CustomA.astro';

// Commented Custom components are commented because we are relying on Tailwind's typography plugin: if more customization is needed
// we will customize the components themselves, and use them here

export const MarkdownComponents = {
  a: CustomA,
  // h1: CustomH1,
  ... // h2..h6, p, blockquote, ul, ol, li, table, thead, tbody, tr, th, td — all commented out
};
```

- Dead files (17): `CustomH1..CustomH6, CustomP, CustomBlockquote, CustomUl,
  CustomOl, CustomLi, CustomTable, CustomThead, CustomTbody, CustomTr,
  CustomTh, CustomTd` — all `.astro` in `src/components/markdown/`.
- Kept: `CustomA.astro` (the only active mapping) and `index.ts`.
- Markdown styling reality: `src/styles/markdown.css` (imported by pages,
  e.g. `src/pages/index.astro:2`), plus
  `src/layouts/markdown-content/MarkdownContent.astro`.

## Commands you will need

| Purpose   | Command               | Expected |
|-----------|-----------------------|----------|
| Usage check | `grep -rn "CustomH1\|CustomP\b\|CustomBlockquote\|CustomUl\|CustomOl\|CustomLi\|CustomTable\|CustomThead\|CustomTbody\|CustomTr\b\|CustomTh\b\|CustomTd\b" src/ --include="*.astro" --include="*.ts" --include="*.mdx"` | hits ONLY inside `src/components/markdown/` (self-references + commented lines in index.ts) |
| Typecheck | `npm run astro:check` | exit 0 |
| Lint      | `npm run lint`        | exit 0 |

## Scope

**In scope**: deletion of the 17 dead `.astro` files in
`src/components/markdown/`; `src/components/markdown/index.ts` (remove the
commented mappings and rewrite the comment); `plans/README.md`.

**Out of scope**: `CustomA.astro` (in use); `src/styles/markdown.css`;
`MarkdownContent.astro`; any restyling work. Do NOT install
`@tailwindcss/typography`.

## Git workflow

- Branch from `develop`: `advisor/011-dead-markdown-wrappers`
- Single commit: `refactor(markdown): remove unused custom element wrappers`.
  No AI trailer.

## Steps

### Step 1: Confirm deadness, then delete

Run the usage-check grep above. If it shows only self-references and
`index.ts` comments, `git rm` the 17 files.

**Verify**: `ls src/components/markdown/` → exactly `CustomA.astro` and
`index.ts` remain.

### Step 2: Clean index.ts

Remove all commented mapping lines and replace the misleading comment with
the truth, e.g.:

```ts
import CustomA from './CustomA.astro';

// Markdown element styling lives in src/styles/markdown.css.
// Add a wrapper component here only when CSS alone can't express the change
// (see CustomA for the pattern).

export const MarkdownComponents = {
  a: CustomA,
};
```

**Verify**: `grep -n "typography" src/components/markdown/index.ts` → no
match; `npm run astro:check && npm run lint` → exit 0.

## Test plan

None — deletion of unreferenced files, gated by grep + typecheck. If plan
002's suite exists, run `npm test` (must stay green).

## Done criteria

- [ ] Only `CustomA.astro` + `index.ts` remain in `src/components/markdown/`
- [ ] No "typography plugin" claim remains
- [ ] `npm run astro:check`, `npm run lint` exit 0
- [ ] No files outside scope modified; `plans/README.md` updated

## STOP conditions

- The usage grep finds a real import of any Custom* wrapper outside
  `src/components/markdown/` — that component is alive; keep it, wire your
  report accordingly.
- MDX posts render differently after deletion (they can't — nothing maps the
  elements — but if `astro:check` surfaces an MDX component-mapping error,
  stop and report).

## Maintenance notes

- If richer markdown element styling is wanted later, the decision is:
  extend `markdown.css` (default) vs. reintroduce a wrapper per element via
  `MarkdownComponents` (the `CustomA` pattern). Both paths stay open.
