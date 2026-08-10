---
created: 2026-08-10
updated: 2026-08-10
summary: Task-by-task implementation plan for the UI redesign spec (topic hero, homepage marks, navbar search)
---

# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign three UI surfaces — the topic hero, the homepage section marks, and the navbar search entry — per the approved spec in `docs/ui-redesign/ui-redesign.md`.

**Architecture:** One new shared primitive (`BadgePlate`) carries every visual mark across all three surfaces, so they read as one system. Topic colour is derived at render time from a single per-topic hex via `color-mix`, with the derivation logic extracted into a unit-tested `.ts` util. Search becomes a plain GET form with no JavaScript.

**Tech Stack:** Astro 7.2.0 (static output, one SSR route), Tailwind CSS v4 (CSS-only config, no `tailwind.config`), `cva@1.0.0-beta.4` (object API), `astro-icon` + `@iconify-json/mdi`, Drizzle ORM + libSQL/Turso, Zod, Vitest.

## Global Constraints

- **Read the spec first:** `docs/ui-redesign/ui-redesign.md`. It contains the rejected alternatives and the reasoning; do not re-litigate settled decisions.
- **No React.** `.astro` components only.
- **TypeScript:** strict. `erasableSyntaxOnly: true` — use `import type` for every type-only import. `noUncheckedIndexedAccess: true` — indexed access returns `T | undefined`.
- **Prefer `undefined` over `null`** in application code. (DB rows still use `null`; that boundary stays.)
- **Always declare explicit function return types.** Do not rely on inference.
- **No `!` non-null assertions.**
- **Prettier:** 80 char width, single quotes, trailing commas, 2-space indent. `prettier-plugin-tailwindcss` sorts classes — do not hand-order them.
- **CVA for multi-variant components**, `class:list` or `cn()` for one or two conditionals.
- **One folder per component** under `src/components/<kebab-case-name>/`, with the `.astro` file itself in PascalCase.
- **Naming:** files/dirs kebab-case; constants UPPER_SNAKE_CASE; functions/variables camelCase; types/interfaces PascalCase; Zod schemas `{TypeName}Schema`.
- **Commits:** conventional format `type(scope): subject`, lowercase, no trailing period. **Never add a `Co-Authored-By` trailer or any AI attribution.** Per `CLAUDE.md`, only run commits directly when executing in a dedicated git worktree with subagents; otherwise propose the message and let the user commit.
- **Dark theme is out of scope.** Do not touch `src/styles/themes/dark-theme.css`.
- **Every icon in this plan is decorative:** `aria-hidden='true'`, meaning carried by adjacent text.

### Why not `GenericIcon`

`src/components/icons/GenericIcon.astro` requires a `title: string` prop (which renders an accessible `<title>`, contradicting `aria-hidden`) and always emits numeric `width`/`height`, defaulting to 50. Both fight the decorative, CSS-sized icons this redesign needs. The new components therefore import `Icon` from `astro-icon/components` directly. `GenericIcon` stays untouched for the existing labelled icons.

### Verified icon names

All confirmed present in the installed `@iconify-json/mdi` (checked against `node_modules/@iconify-json/mdi/icons.json`; none are aliases):

`mdi:code-braces` · `mdi:server` · `mdi:pencil-ruler` · `mdi:chili-hot` · `mdi:gamepad-variant` · `mdi:book-open-page-variant` · `mdi:duck` · `mdi:briefcase` · `mdi:seed` · `mdi:school` · `mdi:magnify`

### Testing reality

This repo has **no `.astro` render harness configured**. Vitest runs in a `node` environment over `tests/**/*.test.ts` and `src/**/*.test.ts` only.

To be precise about why, since it is a deliberate choice and not a limitation:

- `experimental_AstroContainer` from `astro/container` **is** available in the installed Astro 7.2.0 (verified resolvable), and `getViteConfig` **is** exported from `astro/config`. Setting up component render tests would cost configuration, not new dependencies.
- It is deliberately **deferred** to a separate workstream. Most of this repo's pure logic already lives in `src/utils/` and `src/db/` and is covered by the six existing suites; the frontmatter is largely orchestration over those tested units.

Consequently, in this plan:
- Logic that *can* be extracted to `.ts` **is** extracted and gets real red-green TDD (Tasks 1, 2, 7).
- `.astro` components are verified by `astro check` (types), `eslint`, `prettier`, a real build, and **explicit manual checks with stated URLs and expected observations**. These verification steps are not optional — they are the gate for those tasks.

**Two known coverage gaps**, recorded so a future testing workstream knows where to start:

1. `NavSearchForm`'s contract — `action="/search"`, `method="get"`, `name="q"`. The no-JavaScript guarantee is defended only by Task 7 Step 10's manual check. A future change to a JS-driven control would break it silently.
2. `Link.astro`'s self-referencing behaviour — it renders `<span aria-current='page'>` rather than `<a>`. This is untested today and fails silently when a consumer styles the wrong selector, which is exactly the footgun called out in Task 7.

## File Structure

**New files**

| Path | Responsibility |
|------|----------------|
| `src/utils/topic-accent/topic-accent.ts` | Validate a topic hex and resolve it (or the fallback) to a CSS value. Pure, unit-tested. |
| `src/utils/topic-accent/topic-accent.test.ts` | Tests for the above. |
| `src/components/badge-plate/BadgePlate.astro` | The shared plate primitive. Slot-based, so it holds an icon, an image, or text. |
| `src/components/topic-hero/TopicHero.astro` | The topic page hero band. |
| `src/components/card/FeatureCard.astro` | A "What I do" card: plate + ghosted numeral + heading + body. |
| `src/components/sticker/Sticker.astro` | A fun-fact sticker pill. |
| `src/components/search/NavSearchForm.astro` | The GET search form, shared by desktop bar and mobile drawer. |
| `src/data/what-i-do.ts` | Content for the three feature cards. |
| `src/data/fun-facts.ts` | Content for the fun-fact stickers. |
| `src/data/nav-items.ts` | The nav link list, with label/href decoupled. |
| `src/data/nav-items.test.ts` | Tests for the above. |
| `src/db/migrations/0002_*.sql` | Generated — renames the topics colour column. |

**Modified:** `src/types/entities/topicContent.entity.ts` · `src/content/topics/*.json` (6) · `src/db/features/topics/topics.model.ts` · `src/db/sync/buildSync.ts` · `src/components/card/TopicCard.astro` · `src/components/card/TimelineCard.astro` · `src/pages/topics/index.astro` · `src/pages/topics/[topic]/index.astro` · `src/pages/index.astro` · `src/components/navbar/Navbar.astro` · `src/layouts/header/Header.astro` · `src/pages/search.astro` · `tests/build-sync.test.ts` · `docs/stable/development/styling/design-system.md` · `docs/stable/features/icons/icons.md` · `docs/issues/discovered.md`

**Deleted:** `src/components/card/FunfactCard.astro`

---

### Task 1: Topic accent colour util

Pure, additive, fully unit-tested. Nothing else changes yet, so the build stays green.

**Files:**
- Create: `src/utils/topic-accent/topic-accent.ts`
- Create: `src/utils/topic-accent/topic-accent.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `HEX_COLOR_PATTERN: RegExp` — the single source of truth for hex validation, imported by the Zod schema in Task 2 so the two cannot drift.
  - `TOPIC_ACCENT_FALLBACK: string` — `'var(--color-accent2)'`.
  - `resolveTopicAccent(accentColor?: string): string` — returns the hex when valid, otherwise the fallback.

- [ ] **Step 1: Write the failing test**

Create `src/utils/topic-accent/topic-accent.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  HEX_COLOR_PATTERN,
  resolveTopicAccent,
  TOPIC_ACCENT_FALLBACK,
} from './topic-accent.ts';

describe('resolveTopicAccent', () => {
  it('returns a valid lowercase hex unchanged', () => {
    expect(resolveTopicAccent('#ff5d01')).toBe('#ff5d01');
  });

  it('returns a valid uppercase hex unchanged', () => {
    expect(resolveTopicAccent('#61DAFB')).toBe('#61DAFB');
  });

  it('falls back when the value is undefined', () => {
    expect(resolveTopicAccent(undefined)).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a three-digit shorthand hex', () => {
    expect(resolveTopicAccent('#f50')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a missing hash', () => {
    expect(resolveTopicAccent('ff5d01')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on non-hex characters', () => {
    expect(resolveTopicAccent('#gggggg')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on an empty string', () => {
    expect(resolveTopicAccent('')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a CSS colour function', () => {
    expect(resolveTopicAccent('rgb(255 0 0)')).toBe(TOPIC_ACCENT_FALLBACK);
  });
});

describe('HEX_COLOR_PATTERN', () => {
  it('is stateless across repeated calls', () => {
    // A /g flag would make lastIndex leak between tests — guard against it.
    expect(HEX_COLOR_PATTERN.test('#ff5d01')).toBe(true);
    expect(HEX_COLOR_PATTERN.test('#ff5d01')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/utils/topic-accent/topic-accent.test.ts`

Expected: FAIL — cannot resolve `./topic-accent.ts`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/topic-accent/topic-accent.ts`:

```ts
/**
 * Six-digit hex colours only. Deliberately strict: shorthand (#f50) and CSS
 * colour functions are rejected so a topic's accent is always a predictable
 * input to `color-mix()`.
 *
 * No `g` flag — a global regex carries `lastIndex` between `.test()` calls.
 */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Used when a topic declares no accent colour, or declares an invalid one. */
export const TOPIC_ACCENT_FALLBACK = 'var(--color-accent2)';

/**
 * Resolves a topic's configured accent colour to a value safe to inject as a
 * CSS custom property. Invalid input degrades to the site accent rather than
 * producing an unparseable `color-mix()`.
 */
export function resolveTopicAccent(accentColor?: string): string {
  if (accentColor === undefined) return TOPIC_ACCENT_FALLBACK;
  return HEX_COLOR_PATTERN.test(accentColor)
    ? accentColor
    : TOPIC_ACCENT_FALLBACK;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/utils/topic-accent/topic-accent.test.ts`

Expected: PASS, 9 tests.

- [ ] **Step 5: Lint and format**

Run: `npm run lint && npm run format:check`

Expected: both clean. If `format:check` complains, run `npm run format`.

- [ ] **Step 6: Commit**

```bash
git add src/utils/topic-accent
git commit -m "feat(topics): add accent colour resolution util"
```

---

### Task 2: Replace `backgroundGradient` with `accentColor`

**This task must be atomic.** Renaming the field breaks every read site simultaneously, so schema, DB column, migration, sync and both consumers change together or the build goes red.

**Files:**
- Modify: `src/types/entities/topicContent.entity.ts`
- Modify: `src/content/topics/astro.json`, `css.json`, `html.json`, `leetcode.json`, `react.json`, `typescript.json`
- Modify: `src/db/features/topics/topics.model.ts:26`
- Create: `src/db/migrations/0002_*.sql` (generated)
- Modify: `src/db/sync/buildSync.ts:194` and `:204-205`
- Modify: `src/components/card/TopicCard.astro`
- Modify: `src/pages/topics/index.astro:155`
- Test: `tests/build-sync.test.ts`

**Interfaces:**
- Consumes: `HEX_COLOR_PATTERN` from Task 1.
- Produces: `TopicContent.accentColor?: string`; `topicsTable.accentColor` (nullable text); `TopicCard` prop `accentColor?: string` replacing `backgroundGradient?: string`.

- [ ] **Step 1: Update the content entity schema**

In `src/types/entities/topicContent.entity.ts`, replace the `backgroundGradient` line. Keep the file's existing `astro/zod` import — unifying on plain `zod` is CLEANUP-001 and out of scope.

```ts
import { z } from 'astro/zod';

import { HEX_COLOR_PATTERN } from '@utils/topic-accent/topic-accent';

export const TopicContentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  imagePath: z.string().optional(),
  description: z.string().min(1),
  /** Six-digit hex taken from the topic's own brand colour. */
  accentColor: z.string().regex(HEX_COLOR_PATTERN).optional(),
  externalLink: z.string().optional(),
});

export type TopicContent = z.infer<typeof TopicContentSchema>;
```

- [ ] **Step 2: Update the six topic JSON files**

Replace each `"backgroundGradient": …` line with `"accentColor"`, using each project's real brand hex. Five of the six currently hold `""`, so only `astro.json` loses real configuration.

| File | Line to write |
|------|---------------|
| `astro.json` | `"accentColor": "#ff5d01",` |
| `react.json` | `"accentColor": "#61dafb",` |
| `typescript.json` | `"accentColor": "#3178c6",` |
| `css.json` | `"accentColor": "#663399",` |
| `html.json` | `"accentColor": "#e34f26",` |
| `leetcode.json` | `"accentColor": "#ffa116",` |

- [ ] **Step 3: Update the Drizzle model**

In `src/db/features/topics/topics.model.ts`, replace line 26:

```ts
  accentColor: text(), // six-digit hex from the topic's brand colour
```

- [ ] **Step 4: Generate the migration**

Run: `npm run drizzle:generate_migrations`

Expected: a new `src/db/migrations/0002_*.sql` plus a `meta/0002_snapshot.json`.

Open the generated SQL and confirm it renames or drops-and-adds the column on `topics`. SQLite cannot always rename in place; drizzle-kit may emit a table rebuild. Either is acceptable — the column held real data for exactly one topic and that value is being replaced anyway.

- [ ] **Step 5: Update `buildSync.ts`**

At `src/db/sync/buildSync.ts:194`, inside `topicRecord`:

```ts
          accentColor: topicData.accentColor ?? null,
```

At `:204-205`, inside the `changed` comparison, replace the `backgroundGradient` clause:

```ts
            existingTopic.accentColor !== topicRecord.accentColor ||
```

- [ ] **Step 6: Write the failing sync test**

`tests/build-sync.test.ts` uses a `Harness` object (`harness.db`, `harness.writeTopic(slug, title)`, `harness.sync()`) built on a temp project root and a temp libSQL DB. The existing `topicFile(title, slug)` helper emits only `title`/`slug`/`description`, so it must first learn about the accent colour.

**6a.** Extend the helper at `tests/build-sync.test.ts:71-82` to take an optional accent colour, omitting the key entirely when not given:

```ts
function topicFile(title: string, slug: string, accentColor?: string): string {
  return `${JSON.stringify(
    {
      title,
      slug,
      description: `Everything about ${title}`,
      ...(accentColor === undefined ? {} : { accentColor }),
    },
    null,
    2,
  )}\n`;
}
```

**6b.** Widen the `Harness` interface and its implementation so the colour can be passed through:

```ts
  writeTopic: (
    slug: string,
    title: string,
    accentColor?: string,
  ) => Promise<void>;
```

```ts
    writeTopic: (slug, title, accentColor) =>
      writeFile(
        path.join(projectRoot, 'src/content/topics', `${slug}.json`),
        topicFile(title, slug, accentColor),
        'utf-8',
      ),
```

Existing call sites pass two arguments and keep working — the third is optional.

**6c.** Add two tests inside the same `describe` block as the other sync tests:

```ts
  it('persists a topic accent colour and detects changes to it', async () => {
    await harness.writeTopic('astro', 'Astro', '#ff5d01');
    expect((await harness.sync()).success).toBe(true);

    const inserted = await harness.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.title, 'Astro'))
      .get();
    expect(inserted?.accentColor).toBe('#ff5d01');

    // Change only the accent colour — the sync must notice and update.
    await harness.writeTopic('astro', 'Astro', '#61dafb');
    expect((await harness.sync()).success).toBe(true);

    const updated = await harness.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.title, 'Astro'))
      .get();
    expect(updated?.accentColor).toBe('#61dafb');
  });

  it('stores no accent colour when the topic omits one', async () => {
    await harness.writeTopic('astro', 'Astro');
    expect((await harness.sync()).success).toBe(true);

    const row = await harness.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.title, 'Astro'))
      .get();
    expect(row?.accentColor).toBeNull();
  });

  it('skips a topic whose accent colour is not a six-digit hex', async () => {
    await harness.writeTopic('broken', 'Broken', 'red');
    await harness.sync();

    const row = await harness.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.title, 'Broken'))
      .get();
    expect(row).toBeUndefined();
  });
```

The third test relies on `buildSyncAllContent` skipping files that fail `TopicContentSchema.safeParse` (`src/db/sync/buildSync.ts:172-180`), which is why an invalid hex yields no row rather than a thrown error.

- [ ] **Step 7: Run the test to verify it fails**

Run: `npx vitest run tests/build-sync.test.ts`

Expected: FAIL — `accentColor` does not exist on the row type, or the value is `undefined`.

If it fails at *type* level only, that still counts as red. Proceed.

- [ ] **Step 8: Update `TopicCard.astro`**

Replace all five `backgroundGradient` occurrences (three prop declarations at lines ~24, ~35, ~46 and two `<Image>` class usages at ~88, ~102) with an `accentColor` prop rendered through `define:vars` — matching the `titleBackgroundColor` pattern already in this file.

In the frontmatter:

```ts
import { resolveTopicAccent } from '@utils/topic-accent/topic-accent';

// …existing destructuring, with `backgroundGradient` removed and replaced by:
const { accentColor, /* …rest */ } = Astro.props;

const topicAccent = resolveTopicAccent(accentColor);
```

Add `topicAccent` to the existing `define:vars` on this component's `<style>` block, then replace the two inline gradient class strings on the `<Image>` elements with a single class:

```astro
class='topic-card__image -z-1 aspect-square w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110 group-focus:scale-110 group-active:scale-110'
```

And in the `<style define:vars={{ topicAccent, /* …existing vars */ }}>` block:

```css
  .topic-card__image {
    background-color: color-mix(in oklab, var(--topicAccent) 20%, white);
  }
```

Two notes:
- `define:vars` exposes the JS identifier verbatim, so the custom property is `--topicAccent` (camelCase), not `--topic-accent`. This matches the existing `titleBackgroundColor` / `var(--titleBackgroundColor)` pair already in this file at line 121.
- The neighbouring `titleBackgroundColor` prop is typed as `` `#${string}` | 'transparent' ``. Type `accentColor` as plain `string` instead: it arrives from the DB as `string | null`, and a template-literal type would force a cast at the call site. Validation happens at runtime in `resolveTopicAccent`, which is the safer boundary.

- [ ] **Step 9: Update the topics index page**

At `src/pages/topics/index.astro:155`, replace the prop:

```astro
          accentColor={topic.accentColor || undefined}
```

- [ ] **Step 10: Run the full check suite**

```bash
npx vitest run
npm run astro:check
npm run lint
npm run format:check
```

Expected: all pass. `grep -rn "backgroundGradient" src/` must return nothing.

- [ ] **Step 11: Apply the migration locally and build**

```bash
npm run astro:build:local
```

Expected: the build logs `[db-sync] Running DB migrations...` → `Migrations completed successfully.`, then `Topics sync completed! Synced: 6`, then completes.

**Do not use `npm run db:migrate:local`.** It is broken independently of this work: `src/db/migrate.ts:5` imports `@utils/logs/logger`, and the script runs it through bare `node --env-file=…`, which does not resolve tsconfig path aliases — so it dies with `ERR_MODULE_NOT_FOUND`. `db:migrate` has the same defect.

This is not a blocker: migrations genuinely run at build time via the `db-sync` integration in `astro.config.mjs:146-150`, which calls `buildMigrate` through Vite where aliases resolve. That is also how Netlify migrates on deploy. The standalone scripts are vestigial. Logged as a new issue in Task 8.

- [ ] **Step 12: Commit**

```bash
git add src/types/entities/topicContent.entity.ts src/content/topics \
        src/db/features/topics/topics.model.ts src/db/migrations \
        src/db/sync/buildSync.ts src/components/card/TopicCard.astro \
        src/pages/topics/index.astro tests/build-sync.test.ts
git commit -m "refactor(topics): replace backgroundGradient with accentColor hex"
```

---

### Task 3: `BadgePlate` primitive and the "What I do" cards

Deliverable: the homepage "What I do" section fully redesigned and visible in the dev server.

**Files:**
- Create: `src/components/badge-plate/BadgePlate.astro`
- Create: `src/components/card/FeatureCard.astro`
- Create: `src/data/what-i-do.ts`
- Modify: `src/pages/index.astro` (replace lines ~211-252)

**Interfaces:**
- Consumes: `Card.astro` (existing, CVA `shadow`/`hover`), `cn` from `@libs/cn`.
- Produces:
  - `BadgePlate` with `BadgePlateVariants = { size?: 'sm'|'md'|'lg'|'xl'; shape?: 'square'|'round'; weight?: 'default'|'heavy' }`, content via `<slot />`. Consumed by Tasks 4, 5, 6.
  - `FeatureCard` props: `{ icon: string; iconTitle: string; index: number; heading: string; class?: string }`, body via `<slot />`.
  - `WHAT_I_DO: WhatIDoItem[]` from `@data/what-i-do`.

- [ ] **Step 1: Create `BadgePlate.astro`**

```astro
---
import type { HTMLAttributes } from 'astro/types';
import { cn } from '@libs/cn';
import { cva, type VariantProps } from 'cva';

/**
 * The shared mark primitive. Content is a slot, so the same plate holds an
 * icon, an <Image>, or text — see docs/ui-redesign/ui-redesign.md.
 */
const badgePlateVariants = cva({
  base: 'bg-primary-100 border-secondary grid shrink-0 place-items-center overflow-hidden',
  variants: {
    size: {
      sm: 'h-10 w-10',
      md: 'h-14 w-14',
      lg: 'h-20 w-20',
      xl: 'h-24 w-24',
    },
    shape: {
      square: 'rounded-lg',
      round: 'rounded-full',
    },
    weight: {
      default: 'border-comic shadow-comic',
      heavy: 'border-comic-thick shadow-comic-lg',
    },
  },
  defaultVariants: {
    size: 'md',
    shape: 'square',
    weight: 'default',
  },
});

export type BadgePlateVariants = VariantProps<typeof badgePlateVariants>;

interface Props extends HTMLAttributes<'div'>, BadgePlateVariants {}

const { class: className, size, shape, weight, ...props }: Props = Astro.props;
---

<div
  class={cn(badgePlateVariants({ size, shape, weight }), className)}
  {...props}
>
  <slot />
</div>
```

- [ ] **Step 2: Create the data module**

Create `src/data/what-i-do.ts`. This mirrors the existing `src/data/projects.ts` pattern, consumed as `@data/what-i-do`.

```ts
export interface WhatIDoItem {
  /** Iconify name, verified present in @iconify-json/mdi. */
  icon: string;
  /** Tooltip text for the icon; not an accessible name (icon is decorative). */
  iconTitle: string;
  heading: string;
  body: string;
  /** Tailwind background class for the card surface. */
  surfaceClass: string;
  /** True for the card that spans both grid columns. */
  isWide: boolean;
}

export const WHAT_I_DO: WhatIDoItem[] = [
  {
    icon: 'mdi:code-braces',
    iconTitle: 'Code',
    heading: 'Frontend Engineering',
    body: 'I build responsive interfaces and reusable components with React and TypeScript, focusing on clear responsibilities, maintainable structure and a consistent user experience.',
    surfaceClass: 'bg-accent-100',
    isWide: true,
  },
  {
    icon: 'mdi:server',
    iconTitle: 'Server',
    heading: 'End-to-end Development',
    body: 'My full-stack experience helps me follow features beyond the interface, from API integration to Node.js business logic and serverless services with AWS Lambda.',
    surfaceClass: 'bg-accent2-100',
    isWide: false,
  },
  {
    icon: 'mdi:pencil-ruler',
    iconTitle: 'Pencil and ruler',
    heading: 'Projects and Writing',
    body: 'I use personal projects to explore product ideas, frontend architecture and modern web tooling, then share useful lessons through DuckyCoding.',
    surfaceClass: 'bg-accent3-100',
    isWide: false,
  },
];
```

- [ ] **Step 3: Create `FeatureCard.astro`**

The numeral is `aria-hidden`, non-selectable, and sits at `z-0` behind content at `z-10`. It relies on the `overflow-hidden` already present in `Card`'s CVA base.

```astro
---
import type { ComponentProps } from 'astro/types';
import { Icon } from 'astro-icon/components';
import { cn } from '@libs/cn';

import BadgePlate from '@components/badge-plate/BadgePlate.astro';
import Card from './Card.astro';

interface Props extends ComponentProps<typeof Card> {
  /** Iconify name for the decorative mark. */
  icon: string;
  iconTitle: string;
  /** 1-based position, rendered as the ghosted watermark. */
  index: number;
  heading: string;
  /** `true` renders the larger heading used by the column-spanning card. */
  isWide?: boolean;
}

const {
  icon,
  iconTitle,
  index,
  heading,
  isWide = false,
  class: className,
  ...props
} = Astro.props;

const numeral = String(index).padStart(2, '0');
---

<Card class={cn('relative p-6', className)} {...props}>
  <span class='feature-card__numeral' aria-hidden='true'>{numeral}</span>

  <BadgePlate class='relative z-10'>
    <Icon name={icon} title={iconTitle} aria-hidden='true' class='h-7 w-7' />
  </BadgePlate>

  <h3
    class={cn(
      'text-secondary relative z-10 mt-4 mb-3 font-bold',
      isWide ? 'text-2xl md:text-3xl' : 'text-xl',
    )}
  >
    {heading}
  </h3>

  <p class={cn('text-secondary relative z-10', isWide && 'md:text-lg')}>
    <slot />
  </p>
</Card>

<style>
  /* Enormous, ghosted, bleeding off the bottom-right corner. Most of the
     glyph sits outside the card, so it reads as a texture wash rather than
     as a number. Clipped by Card's own overflow-hidden. */
  .feature-card__numeral {
    position: absolute;
    right: -2.2rem;
    bottom: -5.5rem;
    z-index: 0;
    font-size: 16rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.07em;
    color: color-mix(in oklab, var(--color-secondary) 7%, transparent);
    pointer-events: none;
    user-select: none;
  }
</style>
```

Note: `title` on `Icon` is astro-icon's tooltip prop and is required by the wrapper's own types in some versions; `aria-hidden='true'` is what keeps the mark out of the accessibility tree. If `astro check` reports `title` as unknown on `Icon`, drop it — the `aria-hidden` is the part that matters.

- [ ] **Step 4: Wire it into the homepage**

In `src/pages/index.astro`, add to the imports:

```ts
import FeatureCard from '@components/card/FeatureCard.astro';
import { WHAT_I_DO } from '@data/what-i-do';
```

Replace the whole `<!-- About Cards Grid -->` section (lines ~211-252, the three hardcoded `<Card>` blocks) with:

```astro
  <!-- About Cards Grid -->
  <section class='mb-16'>
    <h2 class='text-secondary mb-8 text-center text-3xl font-black md:text-4xl'>
      What I do
    </h2>
    <div class='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {
        WHAT_I_DO.map((item, i) => (
          <FeatureCard
            icon={item.icon}
            iconTitle={item.iconTitle}
            index={i + 1}
            heading={item.heading}
            isWide={item.isWide}
            class={`${item.surfaceClass}${item.isWide ? ' md:col-span-2' : ''}`}
          >
            {item.body}
          </FeatureCard>
        ))
      }
    </div>
  </section>
```

- [ ] **Step 5: Verify types, lint and format**

```bash
npm run astro:check
npm run lint
npm run format:check
```

Expected: all clean.

- [ ] **Step 6: Verify visually**

Run: `npm run astro:dev`, open `http://localhost:4321/`.

Confirm, at desktop width:
- Three cards; the first spans both columns.
- Each card shows a white bordered plate with a line icon: code braces, server, pencil-and-ruler.
- A very faint enormous `01`/`02`/`03` bleeds off each card's **bottom-right** corner and is clipped by the card edge — it must not overflow onto the page background.
- No emoji remain in this section.
- Selecting text across a card does **not** select the numeral.

- [ ] **Step 7: Commit**

```bash
git add src/components/badge-plate src/components/card/FeatureCard.astro \
        src/data/what-i-do.ts src/pages/index.astro
git commit -m "feat(home): redesign what-i-do cards with badge plates and numerals"
```

---

### Task 4: Fun facts sticker scatter

**Files:**
- Create: `src/components/sticker/Sticker.astro`
- Create: `src/data/fun-facts.ts`
- Modify: `src/pages/index.astro` (fun-facts section, and delete the `<style>` block at ~362-399)
- Delete: `src/components/card/FunfactCard.astro`

**Interfaces:**
- Consumes: `BadgePlate` from Task 3.
- Produces: `Sticker` props `{ icon: string; iconTitle: string; title: string; description: string; class?: string }`; `FUN_FACTS: FunFact[]` from `@data/fun-facts`.

- [ ] **Step 1: Create the data module**

Create `src/data/fun-facts.ts`:

```ts
export interface FunFact {
  /** Iconify name, verified present in @iconify-json/mdi. */
  icon: string;
  iconTitle: string;
  title: string;
  description: string;
  /** Tailwind background class for the sticker surface. */
  surfaceClass: string;
}

export const FUN_FACTS: FunFact[] = [
  {
    // `chili-hot` rather than `sprout`: it matches the copy precisely, and it
    // avoids a second plant mark alongside the timeline's `seed`.
    icon: 'mdi:chili-hot',
    iconTitle: 'Chili pepper',
    title: 'Gardener',
    description: 'Hot peppers enjoyer',
    surfaceClass: 'bg-accent-100',
  },
  {
    icon: 'mdi:gamepad-variant',
    iconTitle: 'Gamepad',
    title: 'Gamer',
    description: 'Since I was a little kid',
    surfaceClass: 'bg-accent2-100',
  },
  {
    icon: 'mdi:book-open-page-variant',
    iconTitle: 'Open book',
    title: 'Learner',
    description: 'Always exploring new tech',
    surfaceClass: 'bg-accent3-100',
  },
  {
    icon: 'mdi:duck',
    iconTitle: 'Duck',
    title: 'Duck lover',
    description: 'Quack quack quack',
    surfaceClass: 'bg-primary-100',
  },
];
```

- [ ] **Step 2: Create `Sticker.astro`**

Rotation cycles with `4n+…` so a fifth fact keeps working — unlike the fixed `:nth-child(1..4)` rules being deleted.

```astro
---
import type { HTMLAttributes } from 'astro/types';
import { Icon } from 'astro-icon/components';
import { cn } from '@libs/cn';

import BadgePlate from '@components/badge-plate/BadgePlate.astro';

interface Props extends HTMLAttributes<'li'> {
  icon: string;
  iconTitle: string;
  title: string;
  description: string;
}

const {
  icon,
  iconTitle,
  title,
  description,
  class: className,
  ...props
} = Astro.props;
---

<li
  class={cn(
    'sticker border-secondary shadow-comic-lg flex items-center gap-3',
    'rounded-full border-[3px] py-2 pr-4 pl-2 transition-transform',
    'hover:-rotate-1',
    className,
  )}
  {...props}
>
  <BadgePlate size='sm' shape='round'>
    <Icon name={icon} title={iconTitle} aria-hidden='true' class='h-5 w-5' />
  </BadgePlate>
  <span>
    <b class='text-secondary block text-base leading-tight font-extrabold'>
      {title}
    </b>
    <span class='text-secondary text-sm'>{description}</span>
  </span>
</li>

<style>
  /* Cosmetic tilt, cycling every four items so any number of facts works. */
  .sticker:nth-child(4n + 1) {
    transform: rotate(-3deg);
  }
  .sticker:nth-child(4n + 2) {
    transform: rotate(2deg);
  }
  .sticker:nth-child(4n + 3) {
    transform: rotate(-1.5deg);
  }
  .sticker:nth-child(4n) {
    transform: rotate(3deg);
  }
</style>
```

- [ ] **Step 3: Wire it into the homepage**

In `src/pages/index.astro`:

1. Remove the `FunfactCard` import and the entire `funFacts` array (lines ~74-99).
2. Add:

```ts
import Sticker from '@components/sticker/Sticker.astro';
import { FUN_FACTS } from '@data/fun-facts';
```

3. Replace the fun-facts section with a `<ul>` — stickers are `<li>`, so the container must be a list:

```astro
  <!-- Fun Facts -->
  <section id='fun-facts' class='mb-16'>
    <h2 class='text-secondary mb-8 text-center text-3xl font-black md:text-4xl'>
      <span class='text-accent-700'>Fun facts</span> about me
    </h2>
    <ul class='flex list-none flex-wrap justify-center gap-4 p-0'>
      {
        FUN_FACTS.map((fact) => (
          <Sticker
            icon={fact.icon}
            iconTitle={fact.iconTitle}
            title={fact.title}
            description={fact.description}
            class={fact.surfaceClass}
          />
        ))
      }
    </ul>
  </section>
```

- [ ] **Step 4: Delete the float animation**

Remove the entire `<style>` block at the end of `src/pages/index.astro` (lines ~362-399): the `@keyframes float`, the four `#fun-facts > div > :nth-child(n)` rules, and the `@media (prefers-reduced-motion)` override. All are now dead — the section no longer has a `> div` child, and the replacement tilt is a static transform needing no reduced-motion exception.

- [ ] **Step 5: Delete the old component**

```bash
git rm src/components/card/FunfactCard.astro
```

- [ ] **Step 6: Verify no references remain**

Run: `grep -rn "FunfactCard\|funFacts\|keyframes float" src/`

Expected: no output.

- [ ] **Step 7: Verify types, lint and format**

```bash
npm run astro:check
npm run lint
npm run format:check
```

Expected: all clean.

- [ ] **Step 8: Verify visually**

Run `npm run astro:dev`, open `http://localhost:4321/`, scroll to "Fun facts about me".

Confirm:
- Four rounded sticker pills, each with a round icon plate: chili, gamepad, open book, duck.
- Each pill is tilted slightly, alternating direction.
- Nothing floats or animates on load.
- Hovering a pill straightens it slightly.
- At 390px width the pills stack and wrap; at desktop width they sit on one line.
- No bullet markers are visible (the `<ul>` is `list-none p-0`).

- [ ] **Step 9: Commit**

```bash
git add src/components/sticker src/data/fun-facts.ts src/pages/index.astro
git rm --cached src/components/card/FunfactCard.astro 2>/dev/null || true
git commit -m "feat(home): replace fun fact cards with sticker scatter"
```

---

### Task 5: Timeline kind icons

**Files:**
- Modify: `src/components/card/TimelineCard.astro`
- Modify: `src/pages/index.astro` (the `timelineObjects` array, lines ~28-72)

**Interfaces:**
- Consumes: `BadgePlate` from Task 3.
- Produces: `TimelineCard` prop `logo?: { src: string | ImageMetadata; alt?: string; … } | undefined` (object branch retained) plus a new `icon?: string` / `iconTitle?: string` pair. The `logo?: string` emoji branch is removed.

- [ ] **Step 1: Update `TimelineCard.astro`**

Replace the `logo` wrapper div and its `typeof logo === 'string'` emoji branch (lines ~49-85). Keep the `logo` **object** branch exactly as it is — it costs nothing and lets a real organisation logo drop in later without redesign.

Frontmatter changes — add to the imports:

```ts
import { Icon } from 'astro-icon/components';

import BadgePlate from '@components/badge-plate/BadgePlate.astro';
```

Change the `logo` prop type, dropping the bare-string variant, and add the icon pair:

```ts
interface Props extends ComponentProps<typeof Card> {
  /** A real organisation logo, when one is available and licensed. */
  logo?: {
    src: string | ImageMetadata;
    alt?: string;
    loading?: HTMLAttributes<'img'>['loading'];
    decoding?: HTMLAttributes<'img'>['decoding'];
    class?: string;
  };
  /** Decorative mark describing what kind of entry this is. */
  icon?: string;
  iconTitle?: string;
  place?: string;
  link?: string;
  roleTitle: string;
  period: number | `${number} - ${number}` | `${number} - Present`;
  target?: HTMLAttributes<'a'>['target'];
}
```

Add `icon` and `iconTitle` to the destructuring alongside `logo`.

Replace the template's logo box with:

```astro
      <BadgePlate
        size='lg'
        weight='heavy'
        class='[grid-area:logo] md:h-24 md:w-24'
      >
        {
          logo ? (
            <Image
              format={'avif'}
              src={logo.src}
              alt={logo.alt || 'Logo'}
              loading={logo.loading}
              decoding={logo.decoding}
              widths={[50, 100]}
              sizes={'(max-width: 200px) 50px, 100px'}
              class={cn('h-full w-full object-contain p-2', logo.class)}
            />
          ) : icon ? (
            <Icon
              name={icon}
              title={iconTitle ?? ''}
              aria-hidden='true'
              class='h-10 w-10 md:h-12 md:w-12'
            />
          ) : null
        }
      </BadgePlate>
```

Import `cn` from `@libs/cn` if it is not already imported in this file.

Note: the `md:h-24 md:w-24` override preserves the existing `h-20 w-20 md:h-24 md:w-24` responsive sizing while `size='lg'` supplies the base 80px.

- [ ] **Step 2: Update the timeline data**

In `src/pages/index.astro`, in each of the three `timelineObjects` entries, replace `logo: '🏄‍♂️'` / `logo: '📚'` with an icon pair:

| Entry | Replace with |
|-------|--------------|
| Full-stack Web Developer, Wavelop, 2023 - Present | `icon: 'mdi:briefcase', iconTitle: 'Briefcase',` |
| Full-stack Web Developer Intern, Wavelop, 2023 | `icon: 'mdi:seed', iconTitle: 'Seed',` |
| Bachelor's degree, University of Padua | `icon: 'mdi:school', iconTitle: 'Graduation cap',` |

Then update the `<TimelineCard …>` invocation in the same file to forward the new props instead of `logo`:

```astro
          <TimelineCard
            icon={item.icon}
            iconTitle={item.iconTitle}
            class='block'
            roleTitle={item.roleTitle}
            period={item.period}
            place={item.place}
            link={item.link}
          >
```

- [ ] **Step 3: Verify no emoji logos remain**

Run: `grep -n "logo: '" src/pages/index.astro`

Expected: no output.

- [ ] **Step 4: Verify types, lint and format**

```bash
npm run astro:check
npm run lint
npm run format:check
```

Expected: all clean.

- [ ] **Step 5: Verify visually**

Run `npm run astro:dev`, open `http://localhost:4321/`, scroll to "My journey so far".

Confirm:
- Three cards, each with a bordered white plate on the left holding a line icon: briefcase, seed, graduation cap.
- The plate has a visible border and flat shadow — it is no longer an invisible box.
- Plates are 80px at mobile width and 96px from `md` up.
- No emoji remain in the timeline.

- [ ] **Step 6: Commit**

```bash
git add src/components/card/TimelineCard.astro src/pages/index.astro
git commit -m "feat(home): mark timeline entries with kind icons on plates"
```

---

### Task 6: Topic hero

**Files:**
- Create: `src/components/topic-hero/TopicHero.astro`
- Modify: `src/pages/topics/[topic]/index.astro` (replace lines ~203-237)

**Interfaces:**
- Consumes: `resolveTopicAccent` (Task 1), `TopicContent.accentColor` (Task 2), `BadgePlate` (Task 3), and the existing `getImageWidths` from `@utils/images/images`.
- Produces: `TopicHero` props `{ title: string; description?: string; accentColor?: string; image?: ImageMetadata; imageAlt?: string; postCount: number; lastPostDate?: number }`.

- [ ] **Step 1: Create `TopicHero.astro`**

```astro
---
import { Image } from 'astro:assets';

import BadgePlate from '@components/badge-plate/BadgePlate.astro';
import { resolveTopicAccent } from '@utils/topic-accent/topic-accent';

interface Props {
  title: string;
  description?: string;
  /** Six-digit hex from the topic's brand colour; falls back to accent2. */
  accentColor?: string;
  image?: ImageMetadata;
  imageAlt?: string;
  postCount: number;
  /** Unix millis of the most recent post in this topic. */
  lastPostDate?: number;
}

const {
  title,
  description,
  accentColor,
  image,
  imageAlt,
  postCount,
  lastPostDate,
} = Astro.props;

const topicAccent = resolveTopicAccent(accentColor);

const postLabel = `${postCount} ${postCount === 1 ? 'post' : 'posts'}`;

const lastUpdatedLabel =
  lastPostDate === undefined
    ? undefined
    : `updated ${new Date(lastPostDate).toLocaleDateString('en', {
        month: 'short',
        year: 'numeric',
      })}`;
---

<section class='topic-hero border-comic-thick border-secondary shadow-comic-lg mb-4 p-6'>
  <div class='topic-hero__dots' aria-hidden='true'></div>

  <div class='relative flex flex-col items-start gap-5 sm:flex-row sm:items-center'>
    {
      image ? (
        <BadgePlate
          size='xl'
          weight='heavy'
          class='-rotate-3'
        >
          <Image
            format='avif'
            loading='eager'
            decoding='async'
            fetchpriority='high'
            src={image}
            alt={imageAlt ?? `${title} logo`}
            title={title}
            widths={getImageWidths(image.width, [62, 124, 186])}
            sizes='62px'
            class='h-[62px] w-[62px] object-contain'
          />
        </BadgePlate>
      ) : null
    }

    <div class='min-w-0'>
      <h1 class='text-secondary text-4xl font-extrabold text-balance md:text-5xl'>
        {title}
      </h1>
      {
        description ? (
          <p class='text-secondary mt-2 max-w-[60ch] font-semibold'>
            {description}
          </p>
        ) : null
      }
      <ul class='mt-3 flex list-none flex-wrap gap-2 p-0'>
        <li class='topic-hero__pill border-comic border-secondary shadow-comic rounded-full px-3 py-0.5 text-sm font-bold'>
          {postLabel}
        </li>
        {
          lastUpdatedLabel ? (
            <li class='topic-hero__pill border-comic border-secondary shadow-comic rounded-full px-3 py-0.5 text-sm font-bold'>
              {lastUpdatedLabel}
            </li>
          ) : null
        }
      </ul>
    </div>
  </div>
</section>

<style define:vars={{ topicAccent }}>
  .topic-hero {
    position: relative;
    overflow: hidden;
    /* 20% keeps the surface light enough for `secondary` text at any input. */
    background-color: color-mix(in oklab, var(--topicAccent) 20%, white);
  }

  .topic-hero__pill {
    background-color: color-mix(in oklab, var(--topicAccent) 55%, white);
  }

  /* Pure-CSS dot texture on its own layer: a mask on .topic-hero itself would
     clip its border and its children. Dots sit solid over the logo column and
     are gone before the text begins. */
  .topic-hero__dots {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      var(--color-secondary) 1.6px,
      transparent 1.7px
    );
    background-size: 14px 14px;
    /* Stacked layout: fade downward so the dots never land on the copy. */
    -webkit-mask-image: linear-gradient(
      to bottom,
      #000 0%,
      #000 12%,
      transparent 34%
    );
    mask-image: linear-gradient(to bottom, #000 0%, #000 12%, transparent 34%);
  }

  /* Side-by-side layout: wipe left to right instead. */
  @media (width >= 480px) {
    .topic-hero__dots {
      -webkit-mask-image: linear-gradient(
        to right,
        #000 0%,
        #000 12%,
        transparent 34%
      );
      mask-image: linear-gradient(to right, #000 0%, #000 12%, transparent 34%);
    }
  }
</style>
```

Add `import { getImageWidths } from '@utils/images/images';` to the frontmatter imports (verify the exact export path from `src/utils/images/images.ts`).

- [ ] **Step 2: Wire it into the topic page**

In `src/pages/topics/[topic]/index.astro`:

1. Add `import TopicHero from '@components/topic-hero/TopicHero.astro';`
2. Replace the whole `<section>` at lines ~203-230 **and** the separate description `<p>` block at ~231-237 with a single element. The description now lives inside the hero.

```astro
  <TopicHero
    title={processedTopic.title}
    description={processedTopic.description ?? undefined}
    accentColor={processedTopic.accentColor ?? undefined}
    image={processedTopic.imageSrc ?? undefined}
    imageAlt={processedTopic.image?.alt ?? undefined}
    postCount={processedPostsWithImages.length}
    lastPostDate={processedTopic.lastPostDate ?? undefined}
  />
```

Inspect how `processedTopic` is built earlier in the file (around lines 34-90) and confirm the field names above match. `postCount` and `lastPostDate` already exist on `topicsTable`; if `processedTopic` does not currently carry them through, extend that mapping rather than adding a new query. If `lastPostDate` is genuinely unavailable, pass `undefined` — the pill is conditional.

3. Remove any imports left unused by the deletion (`IMAGE_COMMON_SIZES` may now be unused in this file — `eslint-plugin-unused-imports` will flag it).

- [ ] **Step 3: Verify the dead classes are gone**

Run: `grep -n "text-8\|flex-col.*grid-cols-1 grid-rows-1" src/pages/topics/\[topic\]/index.astro`

Expected: no output. Both `text-8` (not a real Tailwind class) and `flex-col` on a grid container were dead code in the removed markup.

- [ ] **Step 4: Verify types, lint and format**

```bash
npm run astro:check
npm run lint
npm run format:check
```

Expected: all clean.

- [ ] **Step 5: Verify visually across all six topics**

Run `npm run astro:dev`, then visit each of:
`/topics/astro` · `/topics/react` · `/topics/typescript` · `/topics/css` · `/topics/html` · `/topics/leetcode`

Confirm on each:
- The band background is a light tint of that topic's brand colour, and the black heading is comfortably readable on it.
- The logo sits **inside** a tilted bordered plate at its natural size. It does not bleed out of the section anywhere.
- Dots are dense behind the plate and have faded out before the heading starts.
- The hero height follows its content — resize the window vertically and confirm nothing is cropped.
- The description reads inside the hero; there is no separate gradient box beneath it.
- A post-count pill is present, in a stronger tint of the same colour.

Then, at 390px width: the plate sits above the text, and the dots fade **downward** rather than sideways — they must not sit under the copy.

- [ ] **Step 6: Commit**

```bash
git add src/components/topic-hero src/pages/topics/\[topic\]/index.astro
git commit -m "feat(topics): rebuild topic hero with plate, dot band and derived colour"
```

---

### Task 7: Navbar and search form

**Files:**
- Create: `src/data/nav-items.ts`
- Create: `src/data/nav-items.test.ts`
- Create: `src/components/search/NavSearchForm.astro`
- Modify: `src/components/navbar/Navbar.astro`
- Modify: `src/layouts/header/Header.astro`

**Interfaces:**
- Consumes: `Link.astro` (existing — note its self-referencing-link behaviour below).
- Produces: `NAV_ITEMS: NavItem[]` from `@data/nav-items`; `NavSearchForm` props `{ size?: 'bar' | 'drawer'; class?: string }`.

**Critical existing behaviour.** `Link.astro:83-102` renders a `<span aria-current='page'>` instead of an `<a>` when `href` matches the current path, and applies its `isActive: true` CVA variant. The `default` variant's compound `isActive` rule already paints a magenta `::before` underline. So the active-nav treatment is **reuse, not new CSS** — do not add a bespoke active class. The current navbar passes `class='text-secondary …'`, which overrides the active text colour; keep that override only if the underline still reads clearly.

- [ ] **Step 1: Write the failing nav-items test**

Create `src/data/nav-items.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { NAV_ITEMS } from './nav-items.ts';

describe('NAV_ITEMS', () => {
  it('does not expose search as a navigation destination', () => {
    expect(NAV_ITEMS.some((item) => item.href === '/search')).toBe(false);
    expect(
      NAV_ITEMS.some((item) => item.label.toLowerCase() === 'search'),
    ).toBe(false);
  });

  it('keeps the my-projects slug while shortening the label', () => {
    const projects = NAV_ITEMS.find((item) => item.href === '/my-projects');
    expect(projects).toBeDefined();
    expect(projects?.label).toBe('Projects');
  });

  it('lists exactly five destinations', () => {
    expect(NAV_ITEMS).toHaveLength(5);
  });

  it('has no duplicate hrefs', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('uses root-relative hrefs only', () => {
    for (const item of NAV_ITEMS) {
      expect(item.href.startsWith('/')).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/data/nav-items.test.ts`

Expected: FAIL — cannot resolve `./nav-items.ts`.

- [ ] **Step 3: Create the data module**

Create `src/data/nav-items.ts`:

```ts
export interface NavItem {
  href: string;
  /** Display text. Deliberately decoupled from the slug. */
  label: string;
}

/**
 * Search is deliberately absent: it is an action, served by NavSearchForm,
 * not a content destination.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/topics', label: 'Topics' },
  { href: '/memes', label: 'Memes' },
  // Slug stays /my-projects; only the label shortens.
  { href: '/my-projects', label: 'Projects' },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/data/nav-items.test.ts`

Expected: PASS, 5 tests.

- [ ] **Step 5: Create `NavSearchForm.astro`**

No JavaScript. This is a real GET form, which is exactly what the backend expects: `src/pages/search.astro` is `prerender = false` and reads `q` from the query string, and every query is a full page navigation.

```astro
---
import type { HTMLAttributes } from 'astro/types';
import { Icon } from 'astro-icon/components';
import { cn } from '@libs/cn';

interface Props extends HTMLAttributes<'form'> {
  /**
   * `bar` is the desktop header (responsive width);
   * `drawer` is the mobile menu (full width).
   */
  variant?: 'bar' | 'drawer';
}

const { variant = 'bar', class: className, ...props } = Astro.props;
---

<form
  action='/search'
  method='get'
  role='search'
  class={cn(
    'bg-primary-100 border-comic border-secondary shadow-comic',
    'flex items-center gap-2 rounded-lg px-2 py-1.5',
    variant === 'bar' ? 'w-[120px] lg:w-[180px] xl:w-[250px]' : 'w-full',
    className,
  )}
  {...props}
>
  <Icon
    name='mdi:magnify'
    title='Search'
    aria-hidden='true'
    class='text-secondary h-[18px] w-[18px] shrink-0'
  />
  <label class='sr-only' for={`nav-q-${variant}`}>
    Search posts and memes
  </label>
  <input
    id={`nav-q-${variant}`}
    name='q'
    type='search'
    autocomplete='off'
    placeholder={variant === 'bar' ? 'Search…' : 'Search posts and memes…'}
    class='text-secondary placeholder:text-secondary/50 w-full min-w-0 border-0 bg-transparent text-sm outline-none'
  />
</form>
```

Two notes:
- The `id` is suffixed by variant because both instances render in the same document (desktop bar and mobile drawer), and duplicate `id`s would break the `<label for>` association. This is the same class of problem `TagFilter.astro` already solves with a `<template>`.
- `sr-only` is not defined in `src/styles/` — it comes from Tailwind v4's built-in utilities, which this project gets via `@import 'tailwindcss'` in `src/styles/global.css`. No local definition needed.

- [ ] **Step 6: Rewrite `Navbar.astro`**

Replace the local `NAV_ITEMS` array (lines 15-22) with the import, and add the search form to both renderings.

Frontmatter:

```ts
import NavSearchForm from '@components/search/NavSearchForm.astro';
import { NAV_ITEMS } from '@data/nav-items';
```

Delete the inline `NAV_ITEMS` const entirely.

**Mobile drawer** — order must be brand → links → spacer → search → tip. The nav already uses `flex h-full flex-col`, so insert a `grow` spacer element before the form and keep the existing `#scroll-tip` paragraph last:

```astro
    <ul class='flex min-w-fit flex-col gap-4'>
      {
        NAV_ITEMS.map(({ href, label }) => (
          <li>
            <Link href={href} class='text-secondary w-full text-3xl font-medium'>
              {label}
            </Link>
          </li>
        ))
      }
    </ul>
    <div class='grow'></div>
    <NavSearchForm variant='drawer' />
    <p id='scroll-tip' class='text-center text-base italic'>
      Did you know: You can swipe right to open the side menu and left to close
      it.
    </p>
```

Note the existing `<ul>` has `h-full` which would eat the spacer — remove `h-full` from it as shown.

**Desktop nav** — links move left beside the brand; the form sits far right behind a divider. Widen the item gap to `1.6rem` and add no separator glyph:

```astro
<nav class={cn('hidden w-full items-center md:flex', className)} {...props}>
  <ul class='flex items-center gap-x-[1.6rem]'>
    {
      NAV_ITEMS.map(({ href, label }) => (
        <li>
          <Link href={href} class='text-secondary text-base font-medium'>
            {label}
          </Link>
        </li>
      ))
    }
  </ul>
  <div class='grow'></div>
  <div class='bg-secondary mr-4 ml-4 h-6 w-[2px]' aria-hidden='true'></div>
  <NavSearchForm variant='bar' />
</nav>
```

- [ ] **Step 7: Update `Header.astro`**

Two changes in `src/layouts/header/Header.astro`:

1. The nav now occupies the row's full width, so the header's flex layout must let it grow. Inspect the existing wrapper around `<Navbar />` (near line 44) and ensure the navbar container is not width-constrained.
2. Hide the brand **wordmark** from `md` up to `lg` so the desktop bar has room for the 5 links plus the field. The logo image stays at all sizes. Wrap the wordmark text in `class='hidden lg:inline'` (the logo `<Image>` at line ~44 is untouched).

Do not modify `src/utils/scripts/navDialog.ts` or `swipeToToggleDialog.ts` — the drawer's open/close wiring is unchanged and must keep working.

- [ ] **Step 8: Verify no stale search link remains**

Run: `grep -rn "'/search'" src/components src/data src/layouts`

Expected: no output from the navbar or nav-items. (`src/pages/search.astro` itself is unaffected.)

- [ ] **Step 9: Run the full check suite**

```bash
npx vitest run
npm run astro:check
npm run lint
npm run format:check
```

Expected: all pass.

- [ ] **Step 10: Verify visually and functionally**

Run `npm run astro:dev`, open `http://localhost:4321/`.

At 1440px:
- Five links (Home, Blog, Topics, Memes, Projects) sit left beside the brand, with generous even spacing and **no** bullets, pipes or slashes.
- A search field sits far right after a vertical rule, ~250px wide, placeholder "Search…".
- The current page's link shows a magenta underline and is not clickable.

Resize to 976px, then 768px: the field narrows to ~180px then ~120px but **never** collapses into a button. At 768px the brand wordmark is hidden and only the logo remains.

Below 768px: the bar becomes the hamburger. Open the drawer and confirm order top-to-bottom is brand, five links, search field, swipe tip.

Functional checks:
- Type `astro` in the field and press Enter. It must navigate to `/search?q=astro` and show results.
- **Disable JavaScript entirely** (DevTools → Settings → Debugger → Disable JavaScript) and repeat. It must still navigate and return results. This is the whole point of the GET form.
- Press `/` on the page. Nothing should happen — the shortcut was deliberately dropped.
- Tab through the header: the field is reachable, its label is announced, and the icons are skipped.

- [ ] **Step 11: Commit**

```bash
git add src/data/nav-items.ts src/data/nav-items.test.ts \
        src/components/search/NavSearchForm.astro \
        src/components/navbar/Navbar.astro src/layouts/header/Header.astro
git commit -m "feat(nav): replace search link with an always-visible GET form"
```

---

### Task 8: Search page markup fix and documentation

**Files:**
- Modify: `src/pages/search.astro:276` and `:491`
- Modify: `docs/stable/development/styling/design-system.md`
- Modify: `docs/stable/features/icons/icons.md`
- Modify: `docs/issues/discovered.md`

- [ ] **Step 1: Fix the invalid `<p>` wrapper**

In `src/pages/search.astro`, a `<p>` opens at line 276 and closes at line 491, wrapping the entire search grid — divs, sections, an aside and dialogs. `<p>` may only contain phrasing content, so the browser auto-closes it before the first `<div>` and the rendered DOM does not match the source.

Replace the opening `<p …>` with `<div …>` and the matching `</p>` at line 491 with `</div>`, preserving every attribute and class on the element. If the element carried no attributes and no styling, delete both tags instead of converting them.

- [ ] **Step 2: Verify the fix**

Run: `npm run astro:build:local`

Then confirm the built markup no longer nests block elements in a paragraph:

```bash
grep -c "<p[^>]*>\s*<div" dist/search/index.html 2>/dev/null || echo "no dist/search (SSR route)"
```

`/search` is `prerender = false`, so it will not appear in `dist/`. Instead verify in the dev server: open `http://localhost:4321/search`, then in DevTools inspect the search grid's parent element and confirm it is a `div`, not an auto-closed `p`.

- [ ] **Step 3: Document the two new surface patterns**

In `docs/stable/development/styling/design-system.md`, under "Component Surface Patterns", add:

```markdown
### Badge plate (icon, image or monogram mark)

```
bg-primary-100 border-comic border-secondary shadow-comic
grid place-items-center overflow-hidden rounded-lg
```

Implemented as `src/components/badge-plate/BadgePlate.astro` with `size`
(`sm` 40px / `md` 56px / `lg` 80px / `xl` 96px), `shape` (`square` / `round`)
and `weight` (`default` 2px / `heavy` 4px) variants. Content is a slot, so the
same plate holds an `astro-icon` glyph, an `<Image>`, or text.

### Sticker (playful inline fact)

```
bg-{accent-color} border-[3px] border-secondary shadow-comic-lg
rounded-full py-2 pr-4 pl-2
```

Tilt cycles with `:nth-child(4n + …)` so any number of items works.
```

Bump the `updated` date in that file's frontmatter to today.

- [ ] **Step 4: Document the decorative-icon exception**

In `docs/stable/features/icons/icons.md`, add a short section noting that decorative marks import `Icon` from `astro-icon/components` directly with `aria-hidden='true'` and CSS sizing, because `GenericIcon` requires a `title` (which creates an accessible name) and always emits numeric `width`/`height`. `GenericIcon` remains correct for labelled, meaningful icons.

Bump that file's `updated` date.

- [ ] **Step 5: Resolve CLEANUP-007**

`astro.config.mjs` sets `icon({ iconDir: 'src/assets/icons' })` against a directory that does not exist. Pick one and do it:

- **Remove the option** if no local SVGs were added by this redesign (the likely case — every icon here comes from `@iconify-json/mdi`), or
- **Create `src/assets/icons/`** with a `.gitkeep` if you want the local-SVG slot available.

Then remove the CLEANUP-007 entry entirely from `docs/issues/discovered.md` — per `CLAUDE.md`, resolved issues are deleted, not marked done. Bump that file's `updated` date.

- [ ] **Step 6: Final full verification**

```bash
npx vitest run
npm run astro:check
npm run lint
npm run format:check
npm run db:migrate:local
npm run astro:build:local
```

Expected: everything passes and the build completes.

- [ ] **Step 7: Commit**

```bash
git add src/pages/search.astro docs astro.config.mjs
git commit -m "fix(search): unwrap the results grid from an invalid paragraph"
```

---

## Post-implementation verification

Run once, after all tasks are complete.

- [ ] `npx vitest run` — all suites green.
- [ ] `npm run astro:build` (the full pipeline, including `astro check`) — completes.
- [ ] `grep -rn "backgroundGradient\|FunfactCard\|keyframes float" src/` — no output.
- [ ] Homepage: no structural emoji remain in "What I do", "Fun facts" or the timeline. Prose and CTA button emoji (🇮🇹 😃 🚀 📝) are **intentionally retained** — do not remove them.
- [ ] All six topic pages render with distinct derived band colours and nothing cropped.
- [ ] Nav search works with JavaScript disabled.
- [ ] Lighthouse on `/`, `/topics/astro` and `/blog`: no regression. **Capture this baseline before starting Task 1** — after the fact there is nothing to compare against.

## Self-review notes

Checked against the spec:

- Every spec section maps to a task: topic hero → Tasks 1, 2, 6 · homepage marks → Tasks 3, 4, 5 · navbar and drawer → Task 7 · listed bug fixes → Tasks 4, 6, 8 · documentation → Task 8.
- All eight "bugs fixed along the way" rows in the spec are covered: dead `text-8` and `flex-col` (Task 6 Step 3), dead `text-white` on emoji and missing `aria-hidden` (Tasks 3-5, emoji removed entirely), both invisible containers (Tasks 4, 5), the `:nth-child` float animation (Task 4 Step 4), the `<p>`-wrapped search grid (Task 8).
- Type consistency: `BadgePlate`'s `size`/`shape`/`weight` names are used identically in Tasks 3-6. `accentColor` is the field name in the entity, the DB column, the `TopicCard` prop and the `TopicHero` prop. `resolveTopicAccent` is defined once in Task 1 and consumed in Tasks 2 and 6.
- One deliberate deviation from the spec's file list: the spec named `src/data/what-i-do.ts` and `fun-facts.ts` but not `nav-items.ts`. Added, because extracting it is what makes the label/slug divergence testable.
- Task 2 is larger than the others by design. A field rename cannot be split without leaving the build red between tasks.

Claims verified against the codebase while writing this plan, rather than assumed:

| Claim | Result |
|-------|--------|
| All 11 `mdi:*` icon names exist | Verified against `node_modules/@iconify-json/mdi/icons.json`; all resolve, none are aliases |
| `tests/build-sync.test.ts` fixture API | Uses a `Harness` object (`harness.db`, `writeTopic(slug, title)`, `sync()`), **not** loose `topicsDir`/`db` variables — Task 2 Step 6 was rewritten against the real API |
| `topicFile()` signature | `(title, slug)`, emits only title/slug/description — must be extended for `accentColor` |
| `sr-only` | Not defined in `src/styles/`; comes from Tailwind v4 built-ins via `@import 'tailwindcss'` |
| `getImageWidths` | Exported from `src/utils/images/images.ts` → `@utils/images/images` |
| `TopicCard` `define:vars` pattern | Already present at line 121 with camelCase `var(--titleBackgroundColor)` |
| `Link.astro` active handling | Renders `<span aria-current='page'>` with the `isActive` CVA variant for self-referencing links — active nav styling is reuse, not new CSS |
| Drizzle migration output dir | `src/db/migrations` per `drizzle.config.ts`; latest is `0001`, so the new one is `0002` |
| Vitest scope | `node` environment, `tests/**/*.test.ts` and `src/**/*.test.ts` — no `.astro` render harness exists |
