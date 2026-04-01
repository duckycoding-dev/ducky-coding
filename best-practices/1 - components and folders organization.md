---
updated: 2026-04-01
---

### Component folder structure

Each component lives in its own folder:

```
/ComponentName
  |__ ComponentName.astro   (or .ts for non-UI modules)
  |__ ComponentName.test.ts (if it has tests)
```

No `index.ts` re-export file is needed. Import directly from the `.astro` file using path aliases:

```ts
import Button from '@components/Button/Button.astro';
```

When a folder logically groups multiple related components (e.g. `Card/`, `Icons/`, `Markdown/`), a barrel `index.ts` can be used to export all of them together — but only when that grouping is genuinely useful at the import site.

### Styling

Use Astro's built-in `<style>` block for component-scoped styles. Astro scopes these automatically using the `attribute` strategy — no CSS modules needed.

```astro
<style>
  @reference '@styles/global.css';

  .my-element {
    color: var(--color-accent);
  }
</style>
```

The `@reference` directive gives access to Tailwind utilities and theme tokens inside the style block without duplicating the stylesheet.

CSS modules (`.module.css` files) should be avoided unless you need to reference class names programmatically in TypeScript code. That case is rare — prefer `<style>` blocks by default.
