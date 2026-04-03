# CLAUDE.md - Ducky Coding Blog

Personal blog at [duckycoding.dev](https://duckycoding.dev), built with Astro 6 and deployed on Netlify.

## Conventions

### Git Commits

- Do **not** add `Co-Authored-By: Claude` or any AI co-author trailer to commits
- Commit convention: `type(scope): subject` (lowercase, no trailing period)
- Avoid running git commits after every step (unless in a dedicated git worktree with subagents); instead propose when it would be a good idea to commit

### TypeScript

- Strict mode with all checks enabled (see tsconfig.json)
- `erasableSyntaxOnly: true` — use `import type` for type-only imports
- `noUncheckedIndexedAccess: true` — indexed access returns `T | undefined`
- Path aliases: `@components/`, `@layouts/`, `@content/`, `@utils/`, `@styles/`, `@assets/`, `@db/`, `@typings/`

### Formatting & Linting

- **Prettier**: 80 char width, single quotes, trailing commas, 2-space indent
- **ESLint**: flat config, strict TS rules, Astro plugin, max line 80 chars
- Prettier plugins: astro + tailwindcss (auto class sorting)

### Naming

- **file and dir names** — kebab-case; exception: `.astro` component filenames use PascalCase (Astro convention — filename must match the component tag name); their containing directories remain kebab-case
- **constants** — UPPER_SNAKE_CASE for truly fixed values (fixed numbers, fixed strings)
- **functions and variables** — camelCase
- **TS types and interfaces** — PascalCase
- **Zod schemas** — PascalCase, `{TypeName}Schema` when used for type inference

### Code Style

- **`undefined` over `null`** — prefer `undefined` for absent values in application code
- **function return types** — always define explicitly, do not rely on inference
- **promises** — prefer `try/catch/finally` with `await` over `.then()` chaining
- **avoid `!` assertions** — prefer clean typesafe code
- **use `import type`** — whenever importing a type
- **utils vs libs** — `utils/` for generic reusable utilities, `libs/` for wrappers of external libraries
- **No React** — use pure `.astro` components only; provide clear justification if something else is needed
- **prefer discriminated union responses over throws** — service layers return `{ success: true, data } | { success: false, error }`, caller handles via `success` field
- **components: base vs feature** — `components/base/` for domain-agnostic primitives, `<feature>/` folders for feature-scoped components
- **props** — minimum viable interface needed; working with Tailwind almost always requires `class`
- **CVA** — use for multi-variant components; prefer `class:list` for 1-2 conditional classes
- **data fetching** — all DB access goes through the service layer (`*.service.ts`), only in `.astro` frontmatter; ESLint enforces this
- **mark incomplete components** — `{/* USABLE BUT NOT COMPLETED */}`

## Issue Tracking

Known issues and tech debt are tracked in **`docs/issues/discovered.md`**.

| Prefix | Meaning |
|--------|---------|
| `BUG-XXX` | Logic errors, data integrity problems, incorrect behaviour |
| `DEP-XXX` | Dependency version blocks or migration work |
| `CLEANUP-XXX` | Tech debt, dead code, unused config |

Add new issues as they are found. Remove issues entirely once resolved (git history tracks the rest).

## Documentation Conventions

- **draw graphs with mermaid syntax** — never use `\n` inside node labels
- **keep documents concise** — do not add "it used to be X" notes; git history tracks that
- **delete no longer needed docs** — remove completed implementation tracking, etc.

### Document Frontmatter

Every document must open with YAML frontmatter:

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
summary: <one-line description>
---
```

### Stable Docs (`docs/stable/`)

Permanent reference — architecture, development guides, features. Organized by topic:

`docs/stable/{architecture,development,deploy,features}/`

Updated in-place as the system evolves (`updated` date bumped on every edit).

### LLM Session Docs (`docs/<topic>/`)

Session artifacts — specs, design docs, research. Kebab-case topic name.

## Reference Docs

- `docs/stable/architecture/` — system diagrams, content flow, DB schema, request flow, theming
- `docs/stable/development/build-flow.md` — build & dev order, DB sync, env vars, local setup
- `docs/stable/development/dependency-status.md` — locked versions, blocked upgrades
- `docs/stable/development/commit-conventions.md` — conventional commits format
- `docs/stable/development/components/` — folder organization, props patterns
- `docs/stable/development/styling/` — mobile-first, theming, colors, markdown styling
- `docs/stable/development/types/` — entity and DB type architecture
- `docs/stable/development/tooling/` — file templates
- `docs/stable/features/` — icons
