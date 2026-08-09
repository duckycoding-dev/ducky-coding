---
created: 2026-04-02
updated: 2026-08-09
summary: Component folder naming, nesting, barrels and styling conventions
---

### Component folder structure

Each component lives in its own folder. The folder name is **kebab-case**; the
`.astro` file inside is **PascalCase**, matching the component tag name:

```
/component-name
  |__ ComponentName.astro
  |__ helper-module.ts       (co-located non-UI module, kebab-case)
```

Import directly from the `.astro` file using path aliases:

```ts
import Button from '@components/button/Button.astro';
```

Folders may nest when a component owns a family of related components — the same
naming rule applies at every level:

```
@components/form/input/Input.astro
@components/icons/github-icon/GitHubIcon.astro
```

No `index.ts` re-export file is needed for a single component. A barrel is used
only when a folder groups things that are genuinely consumed together — today
that is `icons/index.ts` (shared icon prop types) and `markdown/index.ts` (the
`MarkdownComponents` map passed to `<Content />`).

Tests do **not** live next to components. The suite is a top-level `tests/`
folder run by Vitest; logic that needs coverage is extracted out of the
`.astro` frontmatter into a co-located `.ts` module and imported from there —
see `pagination/get-visible-pages.ts`, covered by `tests/pagination.test.ts`.

### Styling

Use Astro's built-in `<style>` block for component-scoped styles. Astro scopes
these automatically using the `attribute` strategy — no CSS modules needed.

```astro
<style>
  @reference '@styles/global.css';

  .my-element {
    color: var(--color-accent);
  }
</style>
```

The `@reference` directive gives access to Tailwind utilities and theme tokens
inside the style block without duplicating the stylesheet.

Avoid CSS modules (`.module.css`). They are not configured in
`astro.config.mjs` and would need setup work to function; prefer `<style>`
blocks.
