---
created: 2026-08-10
updated: 2026-08-10
summary: Task-by-task implementation plan for build-time OG card generation
---

# OG Card Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a 1200×630 PNG social card per published blog post at build time, replacing the unoptimised source images currently used as `og:image`.

**Architecture:** A generic Astro endpoint walks a registry of *card kinds*; each kind owns its own data loading and HTML. Rendering goes through `takumi-js`, whose layout engine also measures the title so its size can be fitted to the available box by bisection. Pure logic (fitting, the card frame) lives in tested `.ts` modules; the endpoint is a thin runner.

**Tech Stack:** Astro 7.2.0 (static), `takumi-js` (Rust renderer, woff2 + HTML-string input), Vitest, `sharp` (already present, used only to verify output).

## Global Constraints

Read `docs/og-images/og-images.md` first. It carries the approved visual design and the reasoning behind the seam; do not re-litigate settled decisions.

- **Card:** 1200×630 PNG · 28px `#ccf9ff` margin · white plate with 8px `#00020a` border and `12px 12px 0 0` shadow · 52px padding · `overflow: hidden`.
- **Rows:** slug chip (auto) → title (`flex: 1`) → meta row (auto), `gap: 26px`.
- **Meta row:** topic chip (`#ff3de9`) + first-tag chip (`#3de9ff`) + read time as plain text.
- **Second chip is the first tag that is NOT the topic.** All three current posts have `tags[0] === topicTitle`, so a naive rule renders the same word twice.
- **Watermark:** logo at 400px, `opacity: 0.16`, `right: -85px; bottom: -105px`, clipped by the plate.
- **Title sizing:** bisection between 40px and 136px. Do NOT use fixed size steps per title length — sizes chosen by eye overflow.
- **The title box's height must be determinate, not content-driven.** The plate is `height: 100%` of a fixed canvas so `flex: 1` already resolves; do not add a redundant fixed height.
- **The watermark is excluded from overflow reasoning.** It is absolutely positioned and intended to bleed.
- **Font:** the woff2 Astro already downloaded. **Throw if absent — never silently fall back to another font.**
- **Scope: blog posts only.** Other page types keep the current logo fallback.
- TypeScript strict; `erasableSyntaxOnly` (use `import type`); `noUncheckedIndexedAccess` (indexed access is `T | undefined`); explicit return types on all functions; no `!` assertions; prefer `undefined` over `null`.
- Prettier 80 cols, single quotes, trailing commas. ESLint flat config.
- kebab-case files; PascalCase types; camelCase functions; UPPER_SNAKE_CASE for fixed constants.
- Commits: `type(scope): subject`, lowercase, no trailing period. **Never add a `Co-Authored-By` trailer.** Per `CLAUDE.md`, only run commits directly in a dedicated worktree with subagents; otherwise propose the message.
- **Do not use `npm run db:migrate:local`** — it is broken independently of this work (see BUG-001). Build with `npm run astro:build:local`, which migrates via the `db-sync` integration.

### Verified `takumi-js` API

Confirmed by reading the published type definitions of `takumi-js@2.7.0`, `@takumi-rs/core` and `@takumi-rs/helpers`. Do not guess beyond this.

```ts
import { fromHtml } from 'takumi-js/helpers/html';
import { Renderer } from 'takumi-js/node';

/** Lifts <style> blocks out of the markup into `stylesheets`. */
declare function fromHtml(html: string): { node: Node; stylesheets: string[] };

declare class Renderer {
  constructor(options?: RendererOptions);
  registerFont(font: { name?: string; data: Uint8Array | ArrayBuffer | Buffer; weight?: number; style?: string }): Promise<RegisteredFamily[]>;
  render(source: Node, options?: RenderOptions): Promise<Buffer>;
  measure(source: Node, options?: RenderOptions): Promise<MeasuredNode>;
}

interface RenderOptions {
  width?: number; height?: number;
  format?: 'webp' | 'png' | 'jpeg' | 'ico';
  quality?: number; lossless?: boolean;
  images?: { src: string; data: Uint8Array | ArrayBuffer }[];
  stylesheets?: string[];
}

interface MeasuredNode {
  width: number; height: number;
  transform: [number, number, number, number, number, number];
  children: MeasuredNode[];
  runs: { text: string; x: number; y: number; width: number }[];
}
```

`takumi-js` is 4½ months old with 119+ published versions — **pin the exact version**, no caret.

## File Structure

**New**

| Path | Responsibility |
|------|----------------|
| `src/utils/og/types.ts` | `OgCardKind`, `OgRenderContext`, `FitOptions`, `FitResult`. No content shape, no generics. |
| `src/utils/og/fit-title.ts` | Bisection fit + truncation backstop. Pure; takes the measurer as a parameter. |
| `src/utils/og/fit-title.test.ts` | Tests with a fake measurer. |
| `src/utils/og/escape-html.ts` | Minimal HTML escaper for interpolated text. |
| `src/utils/og/escape-html.test.ts` | Tests. |
| `src/utils/og/card-shell.ts` | Opt-in helper drawing the approved plate frame from its **own** options type. |
| `src/utils/og/card-shell.test.ts` | Tests, built from shell options only — never post data. |
| `src/utils/og/og-paths.ts` | `/og/<kind>/<id>.png` URL and output path. |
| `src/utils/og/og-paths.test.ts` | Tests. |
| `src/utils/og/inter-font.ts` | Locate Astro's Inter woff2; throw if missing. |
| `src/utils/og/renderer.ts` | Build a `Renderer` with the font registered, and an `OgRenderContext`. |
| `src/utils/og/kinds/post-card.ts` | The blog-post kind. All post knowledge lives here. |
| `src/utils/og/kinds/post-card.test.ts` | Tests against post-shaped fixtures. |
| `src/utils/og/kinds/index.ts` | `OG_CARD_KINDS` registry / mapper. |
| `src/pages/og/[...route].png.ts` | Generic endpoint. Handles two strings, never card data. |
| `tests/og-output.test.ts` | Post-build assertions on the emitted PNGs. |

**Modified:** `package.json` · `src/pages/posts/[...id]/index.astro` · `docs/issues/discovered.md`

---

### Task 1: HTML escaping

Smallest independent unit, and a real correctness concern: the card is built by string concatenation from content, so a title containing `&` or `<` must not corrupt the markup.

**Files:**
- Create: `src/utils/og/escape-html.ts`
- Test: `src/utils/og/escape-html.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `escapeHtml(value: string): string`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';

import { escapeHtml } from './escape-html.ts';

describe('escapeHtml', () => {
  it('escapes the five characters that break markup or attributes', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('escapes ampersands before other entities, not after', () => {
    // A naive implementation that replaces < first and & second produces
    // '&amp;lt;' — double-escaping the entity it just created.
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('Understanding HTML5 image attributes')).toBe(
      'Understanding HTML5 image attributes',
    );
  });

  it('handles a real title with an apostrophe', () => {
    expect(escapeHtml("Astro's islands")).toBe('Astro&#39;s islands');
  });

  it('returns an empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/utils/og/escape-html.test.ts`
Expected: FAIL — cannot resolve `./escape-html.ts`.

- [ ] **Step 3: Write the implementation**

```ts
/**
 * Escapes text interpolated into the OG card's HTML.
 *
 * The card is assembled by string concatenation from content fields, so a title
 * containing `&` or `<` would otherwise corrupt the markup. Ampersand is replaced
 * first, otherwise the entities produced by later replacements get escaped again.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/utils/og/escape-html.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Lint and format**

Run: `npm run lint && npm run format:check`
Expected: 0 errors. (6 pre-existing warnings in `src/pages/search.astro` are expected and unrelated.)

- [ ] **Step 6: Commit**

```bash
git add src/utils/og/escape-html.ts src/utils/og/escape-html.test.ts
git commit -m "feat(og): add html escaper for card text interpolation"
```

---

### Task 2: Title fitting

The riskiest logic in the feature, and the reason fixed size steps were rejected. Pure, with the measurer injected so it is testable without the native renderer.

**Files:**
- Create: `src/utils/og/types.ts`
- Create: `src/utils/og/fit-title.ts`
- Test: `src/utils/og/fit-title.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type MeasureText = (text: string, fontSize: number) => Promise<{ width: number; height: number }>`
  - `interface FitOptions { minFontSize?: number; maxFontSize?: number; }`
  - `interface FitResult { text: string; fontSize: number; truncated: boolean; }`
  - `fitTitle(text: string, box: { width: number; height: number }, measure: MeasureText, opts?: FitOptions): Promise<FitResult>`

- [ ] **Step 1: Write the failing test**

The fake measurer models a monospace-ish font: each character is `0.5 × fontSize` wide, lines wrap at the box width, each line is `1.04 × fontSize` tall. That is enough to exercise every branch deterministically.

```ts
import { describe, expect, it } from 'vitest';

import { fitTitle } from './fit-title.ts';
import type { MeasureText } from './types.ts';

/** Deterministic stand-in for Takumi's layout engine. */
function fakeMeasurer(boxWidth: number): MeasureText {
  return (text, fontSize) => {
    const charWidth = fontSize * 0.5;
    const perLine = Math.max(1, Math.floor(boxWidth / charWidth));
    const lines = Math.max(1, Math.ceil(text.length / perLine));
    return Promise.resolve({
      width: Math.min(text.length * charWidth, boxWidth),
      height: lines * fontSize * 1.04,
    });
  };
}

const BOX = { width: 1000, height: 300 };

describe('fitTitle', () => {
  it('gives a short title the maximum size', async () => {
    const r = await fitTitle('Short', BOX, fakeMeasurer(BOX.width), {
      maxFontSize: 136,
    });
    expect(r.fontSize).toBe(136);
    expect(r.truncated).toBe(false);
    expect(r.text).toBe('Short');
  });

  it('shrinks a long title rather than overflowing', async () => {
    const long = 'x'.repeat(120);
    const r = await fitTitle(long, BOX, fakeMeasurer(BOX.width));
    expect(r.fontSize).toBeLessThan(136);
    expect(r.truncated).toBe(false);
    const m = await fakeMeasurer(BOX.width)(long, r.fontSize);
    expect(m.height).toBeLessThanOrEqual(BOX.height);
  });

  it('never returns a size below the floor', async () => {
    const r = await fitTitle('x'.repeat(5000), BOX, fakeMeasurer(BOX.width), {
      minFontSize: 40,
    });
    expect(r.fontSize).toBe(40);
  });

  it('truncates on a word boundary once the floor cannot fit', async () => {
    const words = 'alpha bravo charlie delta echo foxtrot golf hotel '.repeat(20);
    const r = await fitTitle(words, BOX, fakeMeasurer(BOX.width), {
      minFontSize: 40,
    });
    expect(r.truncated).toBe(true);
    expect(r.text.endsWith('…')).toBe(true);
    // A word boundary, not a chopped word.
    expect(r.text.replace(' …', '')).toMatch(/\b(alpha|bravo|charlie|delta|echo|foxtrot|golf|hotel)$/);
  });

  it('terminates on a single unbreakable word too long to fit', async () => {
    const r = await fitTitle('x'.repeat(4000), BOX, fakeMeasurer(BOX.width), {
      minFontSize: 40,
    });
    expect(r.fontSize).toBe(40);
    expect(r.text.length).toBeGreaterThan(0);
  });

  it('handles an empty string without looping', async () => {
    const r = await fitTitle('', BOX, fakeMeasurer(BOX.width));
    expect(r.text).toBe('');
    expect(r.truncated).toBe(false);
  });

  it('reaches the exact boundary size, not one pixel under', async () => {
    // Regression guard for the continuous-bisection off-by-one described in
    // fit-title.ts. This measurer fits at exactly 100 and not at 101.
    const measure: MeasureText = (_text, fontSize) =>
      Promise.resolve({ width: 10, height: fontSize <= 100 ? 10 : 10_000 });

    const r = await fitTitle('anything', BOX, measure, {
      minFontSize: 40,
      maxFontSize: 136,
    });
    expect(r.fontSize).toBe(100);
  });

  it('returns the ceiling when the text fits at every size', async () => {
    const measure: MeasureText = () => Promise.resolve({ width: 1, height: 1 });
    const r = await fitTitle('tiny', BOX, measure, { maxFontSize: 136 });
    expect(r.fontSize).toBe(136);
  });

  it('returns an integer font size', async () => {
    const r = await fitTitle('x'.repeat(70), BOX, fakeMeasurer(BOX.width));
    expect(Number.isInteger(r.fontSize)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/utils/og/fit-title.test.ts`
Expected: FAIL — cannot resolve `./fit-title.ts`.

- [ ] **Step 3: Write the shared types**

Create `src/utils/og/types.ts`:

```ts
/** Measures `text` at `fontSize`, as laid out inside the caller's box. */
export type MeasureText = (
  text: string,
  fontSize: number,
) => Promise<{ width: number; height: number }>;

export interface FitOptions {
  /** Smallest size to consider before falling back to truncation. */
  minFontSize?: number;
  /** Largest size to consider. */
  maxFontSize?: number;
}

export interface FitResult {
  /** The text to render — possibly shortened. */
  text: string;
  /** Integer pixel font size. */
  fontSize: number;
  truncated: boolean;
}

/** Shared tools handed to a card kind at render time. */
export interface OgRenderContext {
  readonly width: number;
  readonly height: number;
  readonly logoPath: string;
  fitTitle(
    text: string,
    box: { width: number; height: number },
    opts?: FitOptions,
  ): Promise<FitResult>;
}

/**
 * One card type. Deliberately NOT generic — do not add a type parameter for the
 * entry. A parameterised kind leaks the entry type to the dispatch point, where a
 * registry of several kinds collapses to `unknown` and forces a cast; that is the
 * type-dependence this seam exists to remove. Keep the data closed over inside
 * the kind.
 */
export interface OgCardKind {
  /** URL segment and output directory: /og/<kind>/<id>.png */
  readonly kind: string;
  listIds(): Promise<string[]>;
  renderById(id: string, ctx: OgRenderContext): Promise<string>;
}
```

- [ ] **Step 4: Write the fitting implementation**

Create `src/utils/og/fit-title.ts`:

```ts
import type { FitOptions, FitResult, MeasureText } from './types.ts';

const DEFAULT_MIN_FONT_SIZE = 40;
const DEFAULT_MAX_FONT_SIZE = 136;
/** Never truncate below this many words, so a card is never a bare ellipsis. */
const MIN_WORDS = 4;

/**
 * Largest font size at which `text` fits `box`, found by bisection.
 *
 * The measurer is a parameter rather than an import so this stays pure and can be
 * tested without the native renderer. In production it is backed by Takumi's own
 * `Renderer.measure`, so measuring and drawing use the same layout engine.
 *
 * Truncation is a backstop, not the primary strategy: it only runs when the text
 * does not fit even at `minFontSize`.
 */
export async function fitTitle(
  text: string,
  box: { width: number; height: number },
  measure: MeasureText,
  opts: FitOptions = {},
): Promise<FitResult> {
  const min = opts.minFontSize ?? DEFAULT_MIN_FONT_SIZE;
  const max = opts.maxFontSize ?? DEFAULT_MAX_FONT_SIZE;

  if (text.length === 0) {
    return { text, fontSize: Math.floor(max), truncated: false };
  }

  const fits = async (candidate: string, size: number): Promise<boolean> => {
    const m = await measure(candidate, size);
    return m.width <= box.width + 1 && m.height <= box.height + 1;
  };

  // Integer bisection over [min, max]. Do NOT rewrite this as a continuous
  // bisection followed by Math.floor: that variant never evaluates the upper
  // bound itself, so a title that fits at `max` converges to `max - ε` and floors
  // to `max - 1`, making every short title render a pixel smaller than it could.
  // Searching integers directly reaches both endpoints exactly and needs no
  // correction step.
  let low = Math.ceil(min);
  let high = Math.floor(max);
  let best: number | undefined;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (await fits(text, mid)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (best !== undefined) {
    return { text, fontSize: best, truncated: false };
  }

  // Backstop: shed whole words at the floor size until it fits.
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  let kept = words.length;
  while (kept > MIN_WORDS) {
    kept -= 1;
    const candidate = `${words.slice(0, kept).join(' ')} …`;
    if (await fits(candidate, min)) {
      return { text: candidate, fontSize: min, truncated: true };
    }
  }

  // A single unbreakable word, or fewer than MIN_WORDS words, that still does not
  // fit. Render at the floor and let the plate's overflow clip it rather than
  // looping forever.
  return { text, fontSize: min, truncated: false };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/utils/og/fit-title.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 6: Lint, format, type check**

```bash
npm run lint
npm run format:check
npm run astro:check
```
Expected: 0 errors from all three.

- [ ] **Step 7: Commit**

```bash
git add src/utils/og/types.ts src/utils/og/fit-title.ts src/utils/og/fit-title.test.ts
git commit -m "feat(og): add title fitting by bisection with truncation backstop"
```

---

### Task 3: The card shell

The approved frame, as an opt-in helper with its **own** options type. It must never learn what a post is — if a shell test needs post data, the seam is wrong.

**Files:**
- Create: `src/utils/og/card-shell.ts`
- Test: `src/utils/og/card-shell.test.ts`

**Interfaces:**
- Consumes: `escapeHtml` from Task 1.
- Produces:
  - `interface CardChip { label: string; tone: 'accent' | 'accent2' | 'accent3' }`
  - `interface CardShellOptions { eyebrow?: string; title: string; titleFontSize: number; chips: CardChip[]; trailing?: string; logoPath: string; width: number; height: number; }`
  - `renderCardShell(opts: CardShellOptions): string`
  - `TITLE_BOX: { width: number; height: number }` — the box `fitTitle` should be given for this frame.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';

import { renderCardShell, TITLE_BOX } from './card-shell.ts';

const BASE = {
  title: 'A title',
  titleFontSize: 88,
  chips: [{ label: 'HTML', tone: 'accent' as const }],
  logoPath: '/tmp/logo.png',
  width: 1200,
  height: 630,
};

describe('renderCardShell', () => {
  it('includes the title and its computed size', () => {
    const html = renderCardShell({ ...BASE, title: 'Hello world' });
    expect(html).toContain('Hello world');
    expect(html).toContain('88px');
  });

  it('escapes text that would break the markup', () => {
    const html = renderCardShell({
      ...BASE,
      title: 'Tags & <script>alert("x")</script>',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('renders every chip with its tone colour', () => {
    const html = renderCardShell({
      ...BASE,
      chips: [
        { label: 'HTML', tone: 'accent' },
        { label: 'a18y', tone: 'accent2' },
      ],
    });
    expect(html).toContain('HTML');
    expect(html).toContain('a18y');
    expect(html).toContain('#ff3de9');
    expect(html).toContain('#3de9ff');
  });

  it('omits the eyebrow when not supplied', () => {
    const without = renderCardShell(BASE);
    const withIt = renderCardShell({ ...BASE, eyebrow: '/posts/thing' });
    expect(withIt).toContain('/posts/thing');
    expect(without).not.toContain('/posts/');
  });

  it('omits the trailing text when not supplied', () => {
    const withIt = renderCardShell({ ...BASE, trailing: '5 min read' });
    expect(withIt).toContain('5 min read');
    expect(renderCardShell(BASE)).not.toContain('min read');
  });

  it('embeds the logo path as the watermark', () => {
    const html = renderCardShell({ ...BASE, logoPath: '/x/duck.png' });
    expect(html).toContain('/x/duck.png');
  });

  it('carries the agreed frame values', () => {
    const html = renderCardShell(BASE);
    expect(html).toContain('#ccf9ff'); // 28px margin colour
    expect(html).toContain('28px');
    expect(html).toContain('1200px');
    expect(html).toContain('630px');
  });

  it('exposes a title box smaller than the canvas', () => {
    expect(TITLE_BOX.width).toBeLessThan(1200);
    expect(TITLE_BOX.height).toBeLessThan(630);
    expect(TITLE_BOX.width).toBeGreaterThan(0);
    expect(TITLE_BOX.height).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/utils/og/card-shell.test.ts`
Expected: FAIL — cannot resolve `./card-shell.ts`.

- [ ] **Step 3: Write the implementation**

Values come from the approved mockup. `fromHtml` lifts the `<style>` block into `stylesheets`, so the frame is authored as a real stylesheet rather than inline styles on every element.

```ts
import { escapeHtml } from './escape-html.ts';

export interface CardChip {
  label: string;
  tone: 'accent' | 'accent2' | 'accent3';
}

export interface CardShellOptions {
  /** Small chip above the title. Omitted when absent. */
  eyebrow?: string;
  title: string;
  /** Size resolved by `fitTitle` against `TITLE_BOX`. */
  titleFontSize: number;
  chips: CardChip[];
  /** Plain text at the end of the meta row. Omitted when absent. */
  trailing?: string;
  /** Absolute path of the watermark image. */
  logoPath: string;
  width: number;
  height: number;
}

const TONE_COLOURS: Record<CardChip['tone'], string> = {
  accent: '#ff3de9',
  accent2: '#3de9ff',
  accent3: '#e9ff3d',
};

/**
 * The box the title occupies inside this frame, for `fitTitle`.
 *
 * 1200 − 2×28 margin − 2×8 border − 2×52 padding = 1080 wide.
 * 630 − 2×28 − 2×8 − 2×52 = 510 tall, less the eyebrow row (~58), the meta row
 * (~74) and two 26px gaps = 326.
 */
export const TITLE_BOX = { width: 1080, height: 326 } as const;

/**
 * Draws the approved neo-brutalist plate frame.
 *
 * This is a helper, not a contract: a card kind may call it, call it with
 * different options, or emit entirely different HTML. Nothing about posts is
 * known here.
 */
export function renderCardShell(opts: CardShellOptions): string {
  const chips = opts.chips
    .map(
      (chip) =>
        `<span class="chip" style="background:${TONE_COLOURS[chip.tone]}">${escapeHtml(chip.label)}</span>`,
    )
    .join('');

  const eyebrow =
    opts.eyebrow === undefined
      ? ''
      : `<div class="row-top"><span class="slug">${escapeHtml(opts.eyebrow)}</span></div>`;

  const trailing =
    opts.trailing === undefined
      ? ''
      : `<span class="rt">${escapeHtml(opts.trailing)}</span>`;

  return `<div class="card">
  <style>
    .card {
      width: ${opts.width}px;
      height: ${opts.height}px;
      padding: 28px;
      background: #ccf9ff;
      font-family: Inter;
      color: #00020a;
      display: flex;
    }
    .plate {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #ffffff;
      border: 8px solid #00020a;
      box-shadow: 12px 12px 0 0 #00020a;
      padding: 52px;
      display: flex;
      flex-direction: column;
      gap: 26px;
    }
    .wm {
      position: absolute;
      right: -85px;
      bottom: -105px;
      width: 400px;
      height: 400px;
      opacity: 0.16;
    }
    .row-top { display: flex; }
    .slug {
      background: #e9ff3d;
      border: 5px solid #00020a;
      padding: 7px 16px;
      font-size: 28px;
      font-weight: 700;
    }
    .row-title { flex: 1; display: flex; align-items: center; }
    .title {
      font-size: ${opts.titleFontSize}px;
      font-weight: 900;
      line-height: 1.04;
      letter-spacing: -0.03em;
    }
    .row-meta { display: flex; align-items: center; gap: 18px; }
    .chip {
      border: 6px solid #00020a;
      box-shadow: 8px 8px 0 0 #00020a;
      padding: 12px 28px;
      font-size: 32px;
      font-weight: 800;
    }
    .rt { font-size: 30px; font-weight: 800; }
  </style>
  <div class="plate">
    <img class="wm" src="${escapeHtml(opts.logoPath)}" />
    ${eyebrow}
    <div class="row-title"><div class="title">${escapeHtml(opts.title)}</div></div>
    <div class="row-meta">${chips}${trailing}</div>
  </div>
</div>`;
}
```

Note: the dot texture from the design is **deliberately omitted at this step** and added in Task 7, after a render has confirmed whether `mask-image` is supported. The spec defines the fallback.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/utils/og/card-shell.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Confirm the shell knows nothing about posts**

Run: `grep -niE "post|topic|tag|slug:|timeToRead" src/utils/og/card-shell.ts`
Expected: only the CSS class name `.slug` matches. Any reference to posts, topics or tags means the seam has leaked and belongs in Task 5 instead.

- [ ] **Step 6: Lint, format, type check, commit**

```bash
npm run lint && npm run format:check && npm run astro:check
git add src/utils/og/card-shell.ts src/utils/og/card-shell.test.ts
git commit -m "feat(og): add the card shell frame as an opt-in helper"
```

---

### Task 4: Paths

**Files:**
- Create: `src/utils/og/og-paths.ts`
- Test: `src/utils/og/og-paths.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `ogCardUrl(kind: string, id: string): string`, `ogCardRoute(kind: string, id: string): string`, `parseOgRoute(route: string): { kind: string; id: string } | undefined`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';

import { ogCardRoute, ogCardUrl, parseOgRoute } from './og-paths.ts';

describe('og paths', () => {
  it('builds a site-absolute url', () => {
    expect(ogCardUrl('posts', 'welcome-to-duckycoding')).toBe(
      '/og/posts/welcome-to-duckycoding.png',
    );
  });

  it('builds the route param without the extension or leading slash', () => {
    expect(ogCardRoute('posts', 'welcome')).toBe('posts/welcome');
  });

  it('round-trips a simple id', () => {
    expect(parseOgRoute(ogCardRoute('posts', 'welcome'))).toEqual({
      kind: 'posts',
      id: 'welcome',
    });
  });

  it('round-trips an id containing slashes', () => {
    // Astro ids for directory-based entries can contain segments.
    const parsed = parseOgRoute(ogCardRoute('posts', 'nested/thing'));
    expect(parsed).toEqual({ kind: 'posts', id: 'nested/thing' });
  });

  it('returns undefined for a route with no id', () => {
    expect(parseOgRoute('posts')).toBeUndefined();
  });

  it('returns undefined for an empty route', () => {
    expect(parseOgRoute('')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/utils/og/og-paths.test.ts`
Expected: FAIL — cannot resolve `./og-paths.ts`.

- [ ] **Step 3: Write the implementation**

```ts
/**
 * Single source of truth for where a card lives.
 *
 * The generated route is `/og/<kind>/<id>.png`. Because Astro ids for
 * directory-based content entries can contain `/`, the id is the *rest* of the
 * route after the kind, not just the last segment.
 */
export function ogCardUrl(kind: string, id: string): string {
  return `/og/${kind}/${id}.png`;
}

/** The `[...route]` param value, without leading slash or extension. */
export function ogCardRoute(kind: string, id: string): string {
  return `${kind}/${id}`;
}

export function parseOgRoute(
  route: string,
): { kind: string; id: string } | undefined {
  const trimmed = route.replace(/^\/+/, '').replace(/\.png$/, '');
  const firstSlash = trimmed.indexOf('/');
  if (firstSlash <= 0) return undefined;

  const kind = trimmed.slice(0, firstSlash);
  const id = trimmed.slice(firstSlash + 1);
  if (kind.length === 0 || id.length === 0) return undefined;

  return { kind, id };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/utils/og/og-paths.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
npm run lint && npm run format:check
git add src/utils/og/og-paths.ts src/utils/og/og-paths.test.ts
git commit -m "feat(og): add card url and route helpers"
```

---

### Task 5: The blog-post kind

All post-specific knowledge, in one file. This is where the topic/tag rule lives.

**Files:**
- Create: `src/utils/og/kinds/post-card.ts`
- Create: `src/utils/og/kinds/index.ts`
- Test: `src/utils/og/kinds/post-card.test.ts`

**Interfaces:**
- Consumes: `OgCardKind`, `OgRenderContext` (Task 2); `renderCardShell`, `TITLE_BOX`, `CardChip` (Task 3); `ogCardUrl` (Task 4).
- Produces: `postCardKind: OgCardKind`; `OG_CARD_KINDS: readonly OgCardKind[]`; and two exported pure helpers so the rules are testable without Astro content: `pickChips(topicTitle: string, tags: string[]): CardChip[]` and `readTimeLabel(minutes: number): string`.

- [ ] **Step 1: Write the failing test**

Only the pure rules are unit-tested; `listIds`/`renderById` need `getCollection`, which is covered by the build verification in Task 8.

```ts
import { describe, expect, it } from 'vitest';

import { pickChips, readTimeLabel } from './post-card.ts';

describe('pickChips', () => {
  it('uses the topic first and the first tag that differs from it', () => {
    // Every real post today has tags[0] === topicTitle, so a naive
    // "topic + tags[0]" rule would render the same word twice.
    expect(pickChips('HTML', ['HTML', 'a18y', 'Web Development'])).toEqual([
      { label: 'HTML', tone: 'accent' },
      { label: 'a18y', tone: 'accent2' },
    ]);
  });

  it('compares case-insensitively when skipping the topic', () => {
    expect(pickChips('Astro', ['astro', 'SQLite'])).toEqual([
      { label: 'Astro', tone: 'accent' },
      { label: 'SQLite', tone: 'accent2' },
    ]);
  });

  it('renders only the topic when no tag differs', () => {
    expect(pickChips('HTML', ['HTML'])).toEqual([
      { label: 'HTML', tone: 'accent' },
    ]);
  });

  it('renders only the topic when there are no tags at all', () => {
    expect(pickChips('HTML', [])).toEqual([{ label: 'HTML', tone: 'accent' }]);
  });

  it('truncates a tag longer than 18 characters', () => {
    const chips = pickChips('HTML', ['HTML', 'an-extremely-long-tag-name']);
    expect(chips[1]?.label).toBe('an-extremely-long…');
    expect(chips[1]?.label.length).toBe(18);
  });

  it('does not truncate an 18-character tag', () => {
    const chips = pickChips('HTML', ['HTML', 'x'.repeat(18)]);
    expect(chips[1]?.label).toBe('x'.repeat(18));
  });
});

describe('readTimeLabel', () => {
  it('formats minutes', () => {
    expect(readTimeLabel(5)).toBe('5 min read');
  });

  it('uses the singular for one minute', () => {
    expect(readTimeLabel(1)).toBe('1 min read');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/utils/og/kinds/post-card.test.ts`
Expected: FAIL — cannot resolve `./post-card.ts`.

- [ ] **Step 3: Write the kind**

Create `src/utils/og/kinds/post-card.ts`:

```ts
import { getCollection } from 'astro:content';

import { renderCardShell, TITLE_BOX } from '../card-shell.ts';
import type { CardChip } from '../card-shell.ts';
import type { OgCardKind, OgRenderContext } from '../types.ts';

const MAX_TAG_LENGTH = 18;

/**
 * The topic, then the first tag that is not the topic.
 *
 * Every post in the repo today has `tags[0] === topicTitle`, so pairing the topic
 * with `tags[0]` would print the same word twice on every card.
 */
export function pickChips(topicTitle: string, tags: string[]): CardChip[] {
  const chips: CardChip[] = [{ label: topicTitle, tone: 'accent' }];

  const extra = tags.find(
    (tag) => tag.toLowerCase() !== topicTitle.toLowerCase(),
  );
  if (extra !== undefined) {
    chips.push({ label: truncateTag(extra), tone: 'accent2' });
  }

  return chips;
}

function truncateTag(tag: string): string {
  if (tag.length <= MAX_TAG_LENGTH) return tag;
  return `${tag.slice(0, MAX_TAG_LENGTH - 1)}…`;
}

export function readTimeLabel(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Published posts only.
 *
 * Filters after the call rather than using `getCollection`'s filter argument,
 * matching how every other page in the repo does it — see
 * `src/pages/blog.astro:23` and `src/pages/topics/[topic]/index.astro:60`.
 */
async function publishedPosts(): Promise<
  Awaited<ReturnType<typeof getCollection>>
> {
  return (await getCollection('posts')).filter(
    (post) => post.data.status === 'published',
  );
}

export const postCardKind: OgCardKind = {
  kind: 'posts',

  async listIds(): Promise<string[]> {
    const posts = await publishedPosts();
    return posts.map((post) => post.id);
  },

  async renderById(id: string, ctx: OgRenderContext): Promise<string> {
    const posts = await publishedPosts();
    const post = posts.find((candidate) => candidate.id === id);
    if (post === undefined) {
      throw new Error(`No published post with id "${id}"`);
    }

    const { title, topicTitle, tags, timeToRead } = post.data;
    const fitted = await ctx.fitTitle(title, TITLE_BOX);

    return renderCardShell({
      eyebrow: `/posts/${id}`,
      title: fitted.text,
      titleFontSize: fitted.fontSize,
      chips: pickChips(topicTitle, tags),
      trailing: readTimeLabel(timeToRead),
      logoPath: ctx.logoPath,
      width: ctx.width,
      height: ctx.height,
    });
  },
};
```

- [ ] **Step 4: Write the registry**

Create `src/utils/og/kinds/index.ts`:

```ts
import type { OgCardKind } from '../types.ts';
import { postCardKind } from './post-card.ts';

/**
 * The mapper from a `kind` string to its implementation.
 *
 * Adding a card type means adding an entry here and nothing else: the route,
 * renderer, font loading, fitting and output paths are all kind-agnostic.
 */
export const OG_CARD_KINDS: readonly OgCardKind[] = [postCardKind];

export function findOgCardKind(kind: string): OgCardKind | undefined {
  return OG_CARD_KINDS.find((candidate) => candidate.kind === kind);
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/utils/og/kinds/post-card.test.ts`
Expected: PASS, 8 tests.

If the import of `astro:content` breaks the test run, move `pickChips`,
`truncateTag` and `readTimeLabel` into `src/utils/og/kinds/post-rules.ts` (no
Astro imports), re-export them from `post-card.ts`, and point the test at
`post-rules.ts`. The rules are what is under test, not the Astro plumbing.

- [ ] **Step 6: Lint, format, type check, commit**

```bash
npm run lint && npm run format:check && npm run astro:check
git add src/utils/og/kinds
git commit -m "feat(og): add the blog post card kind and the kind registry"
```

---

### Task 6: Font location and renderer

**Files:**
- Create: `src/utils/og/inter-font.ts`
- Create: `src/utils/og/renderer.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `fitTitle` (Task 2), `MeasureText`, `OgRenderContext` (Task 2).
- Produces: `loadInterWoff2(): Promise<Buffer>`; `createOgRenderContext(): Promise<{ ctx: OgRenderContext; renderPng(html: string): Promise<Buffer> }>`.

- [ ] **Step 1: Install the dependency, pinned**

```bash
npm install --save-exact takumi-js@2.7.0
```

Verify the lockfile picked up the platform binary for this machine **and** that the WASM fallback is present:

```bash
node -e "console.log(require('takumi-js/package.json').version)"
ls node_modules/@takumi-rs | cat
```
Expected: `2.7.0`, and `core`, `helpers` and `wasm` all present.

- [ ] **Step 2: Write the font locator**

Create `src/utils/og/inter-font.ts`:

```ts
import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * The Inter woff2 that Astro's font pipeline downloaded.
 *
 * Deliberately no fallback: rendering cards in some other font would go
 * unnoticed and ship off-brand images. The filename carries a content hash, so
 * this globs rather than hard-coding a path.
 */
export async function loadInterWoff2(): Promise<Buffer> {
  const pattern = path.join(
    process.cwd(),
    '.astro/fonts/font-inter-*-normal-*.woff2',
  );

  for await (const match of glob(pattern)) {
    return readFile(match);
  }

  throw new Error(
    `No Inter woff2 found at ${pattern}. Astro downloads fonts during the build, ` +
      `so this must run inside the build (or after "astro build" has populated .astro/fonts).`,
  );
}
```

- [ ] **Step 3: Write the renderer factory**

Create `src/utils/og/renderer.ts`:

```ts
import { fromHtml } from 'takumi-js/helpers/html';
import { Renderer } from 'takumi-js/node';

import { fitTitle } from './fit-title.ts';
import { loadInterWoff2 } from './inter-font.ts';
import type { FitOptions, FitResult, OgRenderContext } from './types.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const FONT_FAMILY = 'Inter';

/**
 * Builds a Takumi renderer with the site font registered, plus the render
 * context handed to card kinds.
 *
 * The title is measured with `Renderer.measure`, i.e. the same layout engine that
 * draws the card, so the fitted size cannot disagree with the final render.
 */
export async function createOgRenderContext(): Promise<{
  ctx: OgRenderContext;
  renderPng: (html: string) => Promise<Buffer>;
}> {
  const renderer = new Renderer();
  await renderer.registerFont({
    name: FONT_FAMILY,
    data: await loadInterWoff2(),
  });

  const logoPath = path.join(
    process.cwd(),
    'src/assets/images/DuckyCoding_logo.png',
  );

  /** Measures one line-wrapped paragraph inside `box`. */
  const measureIn =
    (box: { width: number; height: number }) =>
    async (text: string, fontSize: number) => {
      const probe = `<div style="width:${box.width}px;font-family:${FONT_FAMILY};font-size:${fontSize}px;font-weight:900;line-height:1.04;letter-spacing:-0.03em">${text}</div>`;
      const { node, stylesheets } = fromHtml(probe);
      const measured = await renderer.measure(node, {
        width: box.width,
        height: OG_HEIGHT,
        stylesheets,
      });
      return { width: measured.width, height: measured.height };
    };

  const ctx: OgRenderContext = {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    logoPath,
    fitTitle: (
      text: string,
      box: { width: number; height: number },
      opts?: FitOptions,
    ): Promise<FitResult> => fitTitle(text, box, measureIn(box), opts),
  };

  const renderPng = async (html: string): Promise<Buffer> => {
    const { node, stylesheets } = fromHtml(html);
    const buffer = await renderer.render(node, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      format: 'png',
      stylesheets,
    });
    return Buffer.from(buffer);
  };

  return { ctx, renderPng };
}
```

Add `import path from 'node:path';` to the imports.

- [ ] **Step 4: Spike — confirm the native binding renders at all**

Before wiring the endpoint, prove the dependency works in this project. Write a throwaway script:

```bash
cat > /tmp/og-spike.mjs <<'EOF'
import { fromHtml } from 'takumi-js/helpers/html';
import { Renderer } from 'takumi-js/node';
import { glob, readFile, writeFile } from 'node:fs/promises';

let fontPath;
for await (const m of glob('.astro/fonts/font-inter-*-normal-*.woff2')) { fontPath = m; break; }
if (!fontPath) throw new Error('no font — run "npm run astro:build:local" first');

const r = new Renderer();
await r.registerFont({ name: 'Inter', data: await readFile(fontPath) });

const { node, stylesheets } = fromHtml(
  '<div style="width:1200px;height:630px;background:#ccf9ff;display:flex;font-family:Inter"><div style="margin:28px;background:#fff;border:8px solid #00020a;padding:52px;font-size:88px;font-weight:900">Spike</div></div>',
);
const measured = await r.measure(node, { width: 1200, height: 630, stylesheets });
console.log('measured:', measured.width, 'x', measured.height);

const png = await r.render(node, { width: 1200, height: 630, format: 'png', stylesheets });
await writeFile('/tmp/og-spike.png', png);
console.log('wrote /tmp/og-spike.png', png.length, 'bytes');
EOF
node /tmp/og-spike.mjs
node -e "require('sharp')('/tmp/og-spike.png').metadata().then(m=>console.log(m.format, m.width+'x'+m.height))"
```

Expected: a measured size, a written PNG, and `png 1200x630`.

**If the render fails inside Vite later** (this spike runs in plain Node, the endpoint will not), the spec's documented fallback applies: move only the runner into an `astro:build:done` integration hook, following the `db-sync` precedent in `astro.config.mjs`. The pure modules and this file are unaffected.

- [ ] **Step 5: Lint, format, type check, commit**

```bash
npm run lint && npm run format:check && npm run astro:check
git add package.json package-lock.json src/utils/og/inter-font.ts src/utils/og/renderer.ts
git commit -m "feat(og): add font loading and the takumi render context"
```

---

### Task 7: The endpoint, and the dot texture

Deliverable: real PNGs in `dist`.

**Files:**
- Create: `src/pages/og/[...route].png.ts`
- Modify: `src/utils/og/card-shell.ts` (add the dot layer)

**Interfaces:**
- Consumes: `OG_CARD_KINDS`, `findOgCardKind` (Task 5); `createOgRenderContext` (Task 6); `ogCardRoute`, `parseOgRoute` (Task 4).
- Produces: `dist/og/posts/<id>.png` for every published post.

- [ ] **Step 1: Write the endpoint**

```ts
import type { APIRoute } from 'astro';

import { findOgCardKind, OG_CARD_KINDS } from '@utils/og/kinds';
import { ogCardRoute, parseOgRoute } from '@utils/og/og-paths';
import { createOgRenderContext } from '@utils/og/renderer';

export const prerender = true;

export async function getStaticPaths(): Promise<
  { params: { route: string } }[]
> {
  const paths: { params: { route: string } }[] = [];

  for (const kind of OG_CARD_KINDS) {
    const ids = await kind.listIds();
    for (const id of ids) {
      paths.push({ params: { route: ogCardRoute(kind.kind, id) } });
    }
  }

  return paths;
}

export const GET: APIRoute = async ({ params }) => {
  const parsed = parseOgRoute(params.route ?? '');
  if (parsed === undefined) {
    return new Response('Not found', { status: 404 });
  }

  const kind = findOgCardKind(parsed.kind);
  if (kind === undefined) {
    return new Response(`Unknown card kind "${parsed.kind}"`, { status: 404 });
  }

  const { ctx, renderPng } = await createOgRenderContext();
  const html = await kind.renderById(parsed.id, ctx);
  const png = await renderPng(html);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
```

- [ ] **Step 2: Build and confirm PNGs are emitted**

Run: `npm run astro:build:local`

Then:

```bash
ls -l dist/og/posts/
node -e "require('sharp')('dist/og/posts/welcome-to-duckycoding.png').metadata().then(m=>console.log(m.format, m.width+'x'+m.height))"
```
Expected: three PNGs, each `png 1200x630`.

If the build fails on the native binding, apply the fallback recorded in Task 6 Step 4.

- [ ] **Step 3: Look at a generated card**

Open `dist/og/posts/avoid-self-referencing-links.png` and compare against the approved mockup. Confirm: the title fills the plate without touching the chips, the chips read `HTML` and `a18y`, the read time is present, the watermark bleeds off the bottom-right and is clipped, nothing else is clipped.

- [ ] **Step 4: Add the dot texture**

Now that a render is known to work, add the texture to `card-shell.ts`. Insert into the `<style>` block:

```css
    .dots {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#808088 3px, transparent 3.2px);
      background-size: 28px 28px;
      mask-image: linear-gradient(to bottom, #000 0, #000 80px, transparent 290px);
      -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 80px, transparent 290px);
    }
```

and add `<div class="dots"></div>` as the first child of `.plate`, before the watermark.

- [ ] **Step 5: Rebuild and check whether the mask worked**

```bash
npm run astro:build:local
```

Open a card again. Two outcomes, both defined:

- **Dots fade out below the slug row** → `mask-image` is supported. Done.
- **Dots cover the whole plate evenly** → `mask-image` is unsupported. Replace the mask with an overlay that fades in the plate's own colour, which needs no mask support:

```css
    .dots-fade {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 290px;
      background-image: linear-gradient(to bottom, rgba(255,255,255,0) 0, #ffffff 100%);
    }
```

with `<div class="dots-fade"></div>` immediately after the dots div.

- [ ] **Step 6: Update the shell test for the texture**

Add to `src/utils/og/card-shell.test.ts`:

```ts
  it('includes the dot texture layer', () => {
    const html = renderCardShell(BASE);
    expect(html).toContain('radial-gradient');
    expect(html).toContain('28px 28px');
  });
```

Run: `npx vitest run src/utils/og/card-shell.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 7: Commit**

```bash
npm run lint && npm run format:check && npm run astro:check
git add src/pages/og src/utils/og/card-shell.ts src/utils/og/card-shell.test.ts
git commit -m "feat(og): generate post cards from a generic endpoint"
```

---

### Task 8: Point posts at the cards, and prove the weight drops

The payoff. This is where the 4,808 KB leaves the build.

**Files:**
- Modify: `src/pages/posts/[...id]/index.astro`
- Test: `tests/og-output.test.ts`

**Interfaces:**
- Consumes: `ogCardUrl` (Task 4).
- Produces: `og:image` on every post pointing at its card.

- [ ] **Step 1: Record the baseline weight**

```bash
find dist -name "*.png" -exec du -k {} + | awk '{s+=$1} END {print "png total:", s, "KB"}'
```
Expected: around 6,864 KB before the change (the exact figure from the spec; note whatever it actually reports).

- [ ] **Step 2: Repoint `og:image` at the card**

In `src/pages/posts/[...id]/index.astro`, the `buildPageSeo` call passes the image
as a **conditional spread**, around line 174:

```ts
    ...(processedImage && {
      image: {
        src: processedImage.src,
        width: processedImage.width,
        height: processedImage.height,
        format: processedImage.format,
        alt:
          bannerImage?.alt ||
          `Post banner cover related to "${entry.data.topicTitle}"`,
      },
    }),
```

The card always exists, so the conditional goes away entirely. Add the import:

```ts
import { ogCardUrl } from '@utils/og/og-paths';
```

and replace the whole spread above with an unconditional property:

```ts
    image: {
      src: ogCardUrl('posts', entry.id),
      width: 1200,
      height: 630,
      format: 'png',
      alt: entry.data.title,
    },
```

`PageImage` is `{ src, width, height, format, alt }` — all five are required.

Leave the banner `<Image>` in the page body untouched. It is still the visible hero.

- [ ] **Step 3: Stop the JSON-LD from keeping the originals alive**

**Without this step the weight claim fails.** At `src/pages/posts/[...id]/index.astro:96-98`:

```ts
const imageSource = processedImage ?? DuckyCodingLogo;
const imageIsBanner = processedImage !== undefined;
const imageContentUrl = new URL(imageSource.src, WEBSITE_ROOT).href;
```

`processedImage.src` is the URL of the **original** asset, and it feeds
`BlogPosting.image` (line ~117) and `primaryImageUrl` (line ~149). Referencing
`.src` is exactly what makes Astro emit the unoptimised PNG, so repointing
`og:image` alone changes nothing about the build weight.

Keep the banner as the structured-data image — it is a better representative
image for a `BlogPosting` than a title card — but reference an **optimised
derivative** instead of the original. Add the import:

```ts
import { getImage } from 'astro:assets';
```

and replace the three lines above with:

```ts
// Structured data keeps the banner illustration, but must not reference the
// original asset: doing so makes Astro emit the full-size source PNG purely for
// a metadata URL.
const optimisedBanner = processedImage
  ? await getImage({ src: processedImage, width: 1200, format: 'webp' })
  : undefined;
const imageSource = optimisedBanner ?? DuckyCodingLogo;
const imageIsBanner = optimisedBanner !== undefined;
const imageContentUrl = new URL(imageSource.src, WEBSITE_ROOT).href;
```

`getImage` returns `{ src, attributes, ... }`, and `width`/`height` on the result
reflect the requested size, so the JSON-LD `width`/`height` fields keep working.
If `astro check` objects to the `width`/`height` properties on the `getImage`
result, read them from `optimisedBanner.options` instead.

The simpler alternative — pointing JSON-LD at the generated card too — also frees
the originals, but replaces a real illustration with a title card in structured
data. Prefer the derivative.

- [ ] **Step 4: Rebuild**

Run: `npm run astro:build:local`

- [ ] **Step 5: Write the output test**

Create `tests/og-output.test.ts`. This reads the built output, so it documents that `astro:build:local` must have run.

```ts
import sharp from 'sharp';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = path.join(process.cwd(), 'dist');
const CARDS = path.join(DIST, 'og/posts');

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

describe('generated OG cards', () => {
  it('emits one card per published post', async () => {
    expect(await exists(CARDS)).toBe(true);
    const files = (await readdir(CARDS)).filter((f) => f.endsWith('.png'));
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  it('emits real 1200x630 PNGs', async () => {
    const files = (await readdir(CARDS)).filter((f) => f.endsWith('.png'));
    for (const file of files) {
      const meta = await sharp(path.join(CARDS, file)).metadata();
      expect(meta.format).toBe('png');
      expect(meta.width).toBe(1200);
      expect(meta.height).toBe(630);
    }
  });

  it('points each post page at its own card', async () => {
    const html = await readFile(
      path.join(DIST, 'posts/avoid-self-referencing-links/index.html'),
      'utf-8',
    );
    expect(html).toContain('/og/posts/avoid-self-referencing-links.png');
    expect(html).toContain('og:image:width');
    expect(html).toContain('1200');
  });

  it('no longer ships the unoptimised post banners', async () => {
    const astro = await readdir(path.join(DIST, '_astro'));
    const banners = astro.filter(
      (f) =>
        f.endsWith('.png') &&
        (f.startsWith('welcome-to-duckycoding') ||
          f.startsWith('image-srcset-and-sizes-attributes') ||
          f.startsWith('avoid-self-referencing-links')),
    );
    expect(banners).toEqual([]);
  });

  it('keeps every card comfortably small', async () => {
    const files = (await readdir(CARDS)).filter((f) => f.endsWith('.png'));
    for (const file of files) {
      const { size } = await stat(path.join(CARDS, file));
      // The old cards were 484-2188 KB. A flat-colour card should be far under.
      expect(size).toBeLessThan(300 * 1024);
    }
  });
});
```

- [ ] **Step 6: Run it**

Run: `npx vitest run tests/og-output.test.ts`
Expected: PASS, 5 tests.

If "no longer ships the unoptimised post banners" fails, something else still
references the banner's `.src`. Find it with
`grep -rn "imageSrc.src\|processedBannerImage.src\|bannerImage.*\.src" src/` and
repoint or remove that reference.

- [ ] **Step 7: Measure the drop**

```bash
find dist -name "*.png" -exec du -k {} + | awk '{s+=$1} END {print "png total now:", s, "KB"}'
du -sh dist
```
Expected: PNG total down by roughly 4,800 KB against Step 1. Record both numbers.

- [ ] **Step 8: Full verification and commit**

```bash
npx vitest run
npm run astro:check
npm run lint
npm run format:check
```
Expected: all green.

```bash
git add src/pages/posts tests/og-output.test.ts
git commit -m "feat(og): use generated cards as the post og:image"
```

---

### Task 9: Documentation

**Files:**
- Modify: `docs/issues/discovered.md`
- Modify: `docs/stable/development/build-flow.md`
- Modify: `docs/og-images/og-images.md`

- [ ] **Step 1: Document the build step**

In `docs/stable/development/build-flow.md`, add the OG route to the build order: the `/og/[...route].png` endpoint is prerendered during `astro build`, after fonts are downloaded (it reads `.astro/fonts`) and after content is synced (it reads the `posts` collection). Bump the `updated` date.

- [ ] **Step 2: Record the dependency**

In `docs/stable/development/dependency-status.md`, add `takumi-js` pinned to an exact version, with the reason: it is 4½ months old with 119+ releases, so a caret range would pull breaking changes. Bump the `updated` date.

- [ ] **Step 3: Note anything that diverged**

If the `mask-image` fallback was needed in Task 7 Step 5, or the integration-hook
fallback in Task 6 Step 4, update `docs/og-images/og-images.md` to state what was
actually built — as a rule, not as history, per `CLAUDE.md`. Bump its `updated` date.

- [ ] **Step 4: Commit**

```bash
git add docs
git commit -m "docs(og-images): record the build step and pinned dependency"
```

---

## Post-implementation verification

- [ ] `npx vitest run` — all suites green.
- [ ] `npm run astro:build` — full pipeline including `astro check`. **Note:** this uses `--mode production` and will try to reach production Turso; expect an auth failure locally. Use `npm run astro:build:local` for local verification.
- [ ] `dist/og/posts/` holds one 1200×630 PNG per published post.
- [ ] Every post's built HTML has `og:image` pointing at its card and `og:image:width` of 1200.
- [ ] `dist` PNG total is down by roughly 4,800 KB.
- [ ] Open two cards — the 79-character title and the 22-character one — and confirm the title fills its box in both without colliding with the chips.
- [ ] Non-post pages still carry the logo fallback: `grep -o 'og:image" content="[^"]*"' dist/index.html`.
- [ ] Validate one card against a preview debugger (X, LinkedIn or opengraph.xyz) once deployed, since only a real scraper proves the meta tags parse.

## Self-review notes

Spec coverage checked section by section: the card design → Task 3 + Task 7; label rules → Task 5; title sizing → Task 2; the two design constraints → carried in Global Constraints and Task 3's `TITLE_BOX` comment; architecture and the seam → Tasks 2, 3, 5; Takumi rationale and the pinned version → Task 6 + Task 9; fonts and the hard failure → Task 6; the two rendering risks → Task 7 Steps 4-5 (mask) and Task 6 Step 4 (native binding); output and caching → Task 7; consumer changes → Task 8; testing → Tasks 1-5, 8.

Type consistency checked: `MeasureText`, `FitOptions`, `FitResult`, `OgRenderContext`, `OgCardKind` are defined once in Task 2 and used with the same names in Tasks 3, 5 and 6; `CardChip` is defined in Task 3 and consumed in Task 5; `ogCardUrl`/`ogCardRoute`/`parseOgRoute` are defined in Task 4 and consumed in Tasks 7 and 8.

Three corrections the self-review caught by reading the codebase rather than trusting the spec:

- **The JSON-LD keeps the originals alive.** `posts/[...id]/index.astro:96-98`
  derives `imageContentUrl` from `processedImage.src`, the original asset. Repointing
  `og:image` alone would have left all three banner PNGs in `dist` and the headline
  weight claim would have been false. Task 8 Step 3 now handles it.
- **The `image` argument to `buildPageSeo` is a conditional spread**, not a plain
  property, so swapping its fields would not have compiled cleanly. Task 8 Step 2
  replaces the whole spread.
- **`getCollection` filtering style** now matches the repo's existing pattern
  instead of using the callback argument.

Two deliberate deviations from the spec, both improvements found while verifying the library:

- The spec described the measurer abstractly. Takumi turns out to expose
  `Renderer.measure`, so measuring uses the same layout engine that draws — no
  font-metrics dependency and no approximation error. `fitTitle` keeps the
  injected measurer so it stays unit-testable.
- `fromHtml` returns `{ node, stylesheets }`, lifting `<style>` blocks out of the
  markup. The card is therefore authored with a real stylesheet rather than inline
  styles on every element.

One ordering choice worth flagging: the dot texture is added in Task 7 **after** a
first successful render, not in Task 3. It is the one piece of the design whose CSS
support is unconfirmed, and separating it means a mask failure cannot be confused
with a broken pipeline.
