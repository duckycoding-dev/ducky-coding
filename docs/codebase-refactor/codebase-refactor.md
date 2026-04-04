---
created: 2026-04-05
updated: 2026-04-05
summary: Tracking document for the codebase refactor branch
---

# Codebase Refactor

## Phase 1: Dead code removal — DONE

- [x] Delete API endpoints (`src/pages/api/v1/topics.ts`, `images.ts`)
- [x] Delete `src/db/sync/contentSync.ts`
- [x] Unexport `getClientLogger()` and `getServerLogger()` in logger.ts
- [x] Update docs: remove CLEANUP-001, remove API endpoint docs, update architecture

## Phase 2a: Directory renames — DONE

- [x] Rename all component directories to kebab-case (13 top-level + 11 icon + 2 form subdirs)
- [x] Rename all layout directories to kebab-case (7 dirs)
- [x] Rename `src/utils/jsonld/` → `src/utils/json-ld/`
- [x] Update all imports (27 files)
- [x] Fix GenericIcon.astro union type (prettier-ignore for esbuild compat)
- [x] Update CLAUDE.md naming convention (PascalCase for .astro files, kebab-case for dirs)

## Phase 2b: utils → libs + constants naming

- [x] Move `src/utils/tailwind-merge/` → `src/libs/tailwind-merge/`
- [x] Move `src/utils/cn/` → `src/libs/cn/`
- [x] Add `@libs/` path alias to `tsconfig.json`
- [x] Update all imports (24+ files)
- [x] Rename constants in `my-projects.astro` to UPPER_SNAKE_CASE

## Phase 3: Component & page code quality

### ~~Step 1: Extract page data to constants files~~ — SKIPPED

Data is tightly coupled to component types and Astro image imports — extracting
to plain `.ts` files would require duplicating types. Page-specific data stays
at the top of the page that uses it.

### Step 2: Extract SEO + breadcrumb helpers — DONE

- [x] Created `src/utils/seo/page-seo.ts` with `buildPageSeo()`
- [x] Created `src/utils/json-ld/breadcrumb.ts` with `buildBreadcrumb()`
- [x] Updated all 9 pages to use helpers (50-65 line SEO blocks → ~15 lines)

### Step 3: Make repeated items data-driven

- [ ] Navbar: extract nav items to config array + map
- [ ] MemeExternalLinks: replace 7 ternary chains with config array + map

### Step 4: Standardize component patterns

- [ ] Fix props destructuring where `const { props } = Astro` adds no value
- [ ] CustomA.astro: replace inline style with Tailwind class or remove
- [ ] ToggleSwitch.astro: remove empty `<script>` tag
