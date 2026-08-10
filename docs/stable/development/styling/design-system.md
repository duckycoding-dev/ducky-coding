---
created: 2026-04-08
updated: 2026-08-10
summary: Neo-brutalist design system — tokens, patterns, and usage rules
---

# Design System

The visual language of duckycoding.dev: neo-brutalist, comic-inspired, playful but readable.

## Principles

- Thick, visible borders — no subtle 1px lines
- Flat comic-style drop shadows — no blur, no gradients
- Bold, saturated accent colors on a light primary background
- High contrast text (secondary on primary)
- Blocky layouts — rounded corners used sparingly (`rounded-xl` for cards, `rounded-3xl` for tags)
- Playful but readable typography (Inter)

## Colors (60-30-10 Rule)

Defined in `src/styles/themes/default.css`, bridged to Tailwind in `src/styles/global.css` via `@theme`.

| Token | Role | Usage |
|-------|------|-------|
| `primary` (+ 100–900) | Background / surface (60%) | Page backgrounds, card fills, nested surfaces |
| `secondary` (+ 100–900) | Text / borders (30%) | Body text, all borders, shadow color |
| `accent` (+ 100–900) | Primary CTA (10%) | Links, buttons, key highlights, scrollbar |
| `accent2` (+ 100–900) | Secondary highlight | Code backgrounds, table headers, info elements |
| `accent3` (+ 100–900) | Tertiary highlight | Ordered list markers, `<mark>`, `<time>` |
| `success` / `warning` / `danger` | Semantic feedback | Form validation, alerts |

**Shade guidance:**

- `100`–`400`: lighter variants — hover states, subtle backgrounds
- `500`: base value (same as the unnumbered token)
- `600`–`900`: darker variants — decorative, disabled states

## Spacing

Use Tailwind's default spacing scale. Prefer these tiers for consistency:

| Tier | Tailwind | Use case |
|------|----------|----------|
| Tight | `p-1` / `px-2 py-1` | Inline elements: badges, tags, `<code>`, `<kbd>`, `<mark>` |
| Standard | `p-3` / `p-4` | Card content areas, form fields, blockquote padding |
| Roomy | `p-6` / `p-8` | Page sections, hero areas, major layout containers |
| Section gap | `gap-4` / `gap-6` | Between cards in grids, between page sections |

## Typography

Font: Inter (variable), configured through Astro's `fonts` API in
`astro.config.mjs` with `fontProviders.google()`. Astro downloads it at build
time and self-hosts the result under `dist/_astro/fonts/`, exposed as the
`--font-inter` CSS variable — nothing is fetched from Google at runtime and
there is no `public/fonts/` directory.

| Level | Tailwind classes | Usage |
|-------|-----------------|-------|
| Page title | `text-4xl font-extrabold` | `<h1>`, page headers |
| Section heading | `text-2xl font-extrabold` | `<h2>`, card group titles |
| Subsection | `text-xl font-bold` | `<h3>` |
| Small heading | `text-lg font-bold` | `<h4>`–`<h6>` |
| Body | `text-base font-normal` | Paragraphs, list items |
| Small | `text-sm font-normal` | Captions, metadata, timestamps |
| Tiny | `text-xs font-medium` | Badges, labels |

Markdown heading sizes are defined in `src/styles/markdown.css` and follow this scale.

## Borders

Defined as `@utility` in `src/styles/global.css`.

| Utility | Width | When to use |
|---------|-------|-------------|
| `border-comic` | 2px | Default for all bordered elements — cards, inputs, tags, code, tables |
| `border-comic-thick` | 4px | Emphasis containers — featured cards, `<thead>`/`<tbody>`, blockquotes, `<details>` |

Markdown heading underlines (3–5px `border-bottom`) are intentional decorative accents, not part of the component border scale.

Always pair borders with `border-secondary` for the color.

## Shadows

Values defined as CSS custom properties in `@theme` (`src/styles/global.css`).
Utility classes defined as `@utility` in the same file.

| Utility | CSS variable | Value | When to use |
|---------|-------------|-------|-------------|
| `shadow-comic` | `--shadow-comic` | `0.1rem 0.1rem 0rem 0.1rem var(--color-secondary)` | Small/inline elements: tags, badges, `<kbd>` |
| `shadow-comic-lg` | `--shadow-comic-lg` | `0.3rem 0.3rem 0rem 0.1rem var(--color-secondary)` | Cards, containers, interactive elements at rest |
| `shadow-comic-xl` | `--shadow-comic-xl` | `0.5rem 0.65rem 0rem 0.1rem var(--color-secondary)` | Hero/featured elements, modals, popovers, hover lift |
| `shadow-comic-pressed` | `--shadow-comic-pressed` | `-0.1rem -0.075rem 0rem 0.1rem var(--color-secondary)` | Active/pressed state on interactive elements |

**In Tailwind classes** (components): use the utility class names (`shadow-comic-lg`).
**In CSS files** (like `markdown.css`): use `var(--shadow-comic-lg)`.

The `tailwind-merge` config (`src/libs/tailwind-merge/tailwind-merge.ts`) registers all shadow utilities in a custom class group to prevent merge conflicts with Tailwind's built-in shadow classes.

## Component Surface Patterns

Recurring class combinations for common element types. Apply via `class:list` or `cn()`.

### Card

```
bg-primary-100 border-comic border-secondary shadow-comic-lg
```

### Interactive surface (buttons, clickable cards)

```
bg-primary-100 border-comic border-secondary shadow-comic-lg
hover:shadow-comic-xl hover:-translate-y-0.5
active:shadow-comic-pressed active:translate-y-0.5
transition-all
```

### Inline highlight (tags, badges, inline code)

```
bg-{accent-color} border-comic border-secondary shadow-comic
px-2 py-1 text-sm font-medium
```

### Container (sections, grouped content)

```
bg-primary-200 border-comic-thick border-secondary p-6
```

### Badge plate (icon, image or monogram mark)

```
bg-primary-100 border-comic border-secondary shadow-comic
grid place-items-center overflow-hidden rounded-lg
```

Implemented as `src/components/badge-plate/BadgePlate.astro`. Variants:

| Variant | Values |
|---------|--------|
| `size` | `sm` 40px · `md` 56px · `lg` 80px · `xl` 96px |
| `shape` | `square` (`rounded-lg`) · `round` (`rounded-full`) |
| `weight` | `default` (2px + `shadow-comic`) · `heavy` (4px + `shadow-comic-lg`) |

Content is a `<slot>`, so the same plate holds an `astro-icon` glyph, an
`<Image>`, or text. This is the shared mark primitive — the feature cards, the
fun-fact stickers, the timeline entries and the topic hero all use it, which is
what makes those surfaces read as one system.

**The fill is not always `primary-100`.** Where the plate holds artwork whose
colour is unknown, override it. The topic hero tints the plate with the topic's
own accent because several topic logos are white artwork that vanishes on a
white surface.

### Sticker (playful inline fact)

```
bg-{accent-color} border-[3px] border-secondary shadow-comic-lg
rounded-full py-2 pr-5 pl-3
```

Implemented as `src/components/sticker/Sticker.astro`. The tilt cycles with
`:nth-child(4n + …)` rather than fixed indices, so any number of items keeps
working. Prefer this over positional selectors anywhere a list can grow.

### Ghosted numeral watermark

```
absolute right-[-2.2rem] bottom-[-5.5rem] z-0
text-[16rem] font-black leading-none tracking-[-0.07em]
color-mix(in oklab, var(--color-secondary) 7%, transparent)
pointer-events-none select-none
```

Used by `FeatureCard`, where it is **opt-in** via the `index` prop. Only number a
set that genuinely has an order: the homepage's "What I do" cards are numbered,
while the fun-fact stickers and the technology cards are not, because numbering
an unordered group asserts a sequence that does not exist.

Three requirements:

- `overflow-hidden` on the container, so the glyph is clipped (`Card` has it).
- `isolate` on the container. The numeral sits at `z-0` and the content at
  `z-10`; without a stacking context those values escape into the root context
  and can tie with the sticky header's `z-10`, letting card content scroll over
  site chrome.
- The digits live in a `::before` via `content: attr(data-numeral)`, not a text
  node. At 7% alpha this is decoration nobody is meant to read, so as text it
  fails the contrast audit and lands in the document's copyable text.

### Derived surface colour

Where a surface colour comes from content rather than the palette, inject the
base colour as a CSS custom property with `define:vars` and derive the surface
with `color-mix`, rather than accepting raw Tailwind classes from content:

```css
background-color: color-mix(in oklab, var(--topicAccent) 20%, white);
```

A 20% mix keeps any input hex light enough for `secondary` text; 40–55% gives
distinguishable nested surfaces. `define:vars` exposes the JS identifier
verbatim, so the property is camelCase (`--topicAccent`). See
`src/utils/topic-accent/topic-accent.ts` for the validation and fallback.

## CSS Scoping Conventions

Astro scopes `<style>` tags to the component by default and tree-shakes CSS for components not rendered on a page.

| Scenario | Where to put styles |
|----------|-------------------|
| Styles used by one component only | Component `<style>` tag (scoped, tree-shaken) |
| Styles shared across several components | Dedicated CSS file in `src/styles/`, imported by each component that needs it |
| Global utilities (`shadow-comic`, `border-comic`, etc.) | `src/styles/global.css` (always shipped, keep minimal) |
| CSS animations for one component | Component `<style>` tag |
| CSS animations shared across components | Dedicated file in `src/styles/` (e.g., `src/styles/animations/fade-in.css`) |

Prefer scoped styles over global ones. Only promote to global when multiple components genuinely share the same styles.
