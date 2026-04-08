---
created: 2026-04-08
updated: 2026-04-08
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

Font: Inter (variable, self-hosted at `/public/fonts/Inter/`).

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
