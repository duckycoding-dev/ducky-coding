---
updated: 2026-04-01
---

### Color themes

For the default theme, colors follow the 60-30-10 design rule:

- **60 - primary color**: used the most, mainly as backgrounds
- **30 - secondary color**: used widely but takes up less space, mainly for text
- **10 - accent colors**: three accent colors (`accent`, `accent2`, `accent3`) to draw user attention; used for buttons, links, borders, etc. Use them in order — `accent` most frequently, `accent3` least
- **info colors**: convey meaning to the user (errors, warnings, success); used in pop-ups, snackbars, and similar UI

Colors are chosen so that secondary color text remains highly visible against both primary and accent backgrounds. Other themes must follow this same pattern to avoid complex per-theme CSS logic.

For example, a button using secondary text on an accent background is written:

```html
<button class="text-secondary bg-accent">Click me!</button>
```

Switching themes changes the values of the CSS variables — the HTML and class names stay the same.

### Text colors (Tailwind v4)

In Tailwind v4, color tokens are defined via `@theme` in `global.css`, referencing CSS custom properties set per-theme. Both `text-primary` and `bg-primary` point to `--color-primary`; `text-secondary` and `bg-secondary` point to `--color-secondary`. There is no cross-mapping between text and background tokens.

### Info colors

```css
--color-success
--color-warning
--color-danger
```

These are used for feedback states and should not be repurposed for decorative elements.
