---
created: 2026-04-02
updated: 2026-08-09
summary: Prefer scoped style blocks; when and why to reach for CSS modules
---

### Styling in Astro components

Prefer Astro's built-in `<style>` block. Astro scopes all rules to the component automatically using attribute selectors — no extra files or configuration needed.

```astro
<style>
  @reference '@styles/global.css';

  .card {
    background-color: var(--color-primary);
  }
</style>
```

The `@reference` directive makes Tailwind utilities and theme tokens available inside the block without injecting the full stylesheet into the output.

`@reference` is a Tailwind v4 directive resolved by `@tailwindcss/vite`, not by
Astro. The `@styles` alias works inside it only because `astro.config.mjs`
declares that alias explicitly under `vite.resolve.alias` — the tsconfig
`paths` entry alone is not enough since Astro 7 / Vite 8. A relative path works
too if you would rather not depend on that.

### CSS modules (avoid unless necessary)

CSS modules (`.module.css` files) hash class names at build time to enforce scoping. They're useful when you need to reference class names dynamically in TypeScript:

```ts
import styles from './Component.module.css';
// styles.card → 'card-abc123' (hashed)
element.classList.add(styles.card);
```

The key difference from a bare import:

- `import './Component.module.css'` — applies the CSS as-is, no hashing, no scoping
- `import styles from './Component.module.css'` — exposes hashed class names as object keys; only classes assigned via `styles.x` get the scoped name

**Important**: with the `styles from` form, only classes explicitly referenced as `styles.x` are applied. A rule like `div { color: red }` or `.card { ... }` used without `styles.card` will have no effect on elements in the component.

In practice, Astro's `<style>` block covers almost every use case. Reach for CSS
modules only when programmatic class name access is genuinely needed — and note
that no `.module.css` file exists in the project today, so expect to do some
`astro.config.mjs` configuration to make them work.
