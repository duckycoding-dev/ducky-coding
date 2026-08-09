---
created: 2026-04-02
updated: 2026-08-09
summary: CSS file layout, data-theme switching and Tailwind v4 token registration
---

## How CSS files are organized and how themes are handled

The way CSS files are organized follows this schema:

```
/src
  |__/styles
    |__/themes
      |__default.css
      |__dark-theme.css
    |__global.css
    |__style-reset.css
    |__markdown.css
```

Themes are set by using the `data-theme` attribute on the `<html>` element.
`data-theme`'s possible values are defined in the `CSSTheme` type.
To change the active theme, dynamically change `data-theme` to another value.

For each theme there is a CSS file with the same name, stored in `src/styles/themes` (e.g. `default.css` or `dark-theme.css`).
Here we define all the CSS variables used throughout the project — these are registered as Tailwind tokens via `@theme` in `global.css`.

The theme CSS file looks like this:

```css
/* default.css */

html, /* <=== use this plain selector only in the default stylesheet*/
html[data-theme='default'] {
  --color-primary: #ffffff;
  --color-secondary: #909090;

  /* ... */
}
```

<br/>
<hr/>

### ATTENTION:

For the default styles in `default.css` the selector also contains `html`, in addition to the `data-theme` selector: this way if a variable is defined **only** in `default.css` but the currently active theme is `dark-theme`, those styles still apply.
This is useful for values that don't change across themes (e.g. font sizes).

```css
/* default stylesheet */

html,
html[data-theme='default'] {
  /* ... */
  /* default styles */
  /* ... */
}
```

### Importing theme files

All theme CSS files are imported in `global.css`:

```css
/* global.css */
@import 'tailwindcss';
@import './style-reset.css' layer(base);
@import './themes/default.css' layer(base);
@import './themes/dark-theme.css' layer(base);
```

Tailwind is imported first. The style reset and theme files are imported into the `base` layer so they don't accidentally override component-level styles.

### Registering theme tokens with Tailwind v4

In Tailwind v4, custom tokens are registered using `@theme` directly in CSS (no `tailwind.config.mjs`). The theme values reference the CSS custom properties from the theme files:

```css
/* global.css */
@theme {
  --color-primary: var(--color-primary);
  --color-secondary: var(--color-secondary);
  --color-accent: var(--color-accent);
  /* ... */
}
```

This makes Tailwind classes like `bg-primary`, `text-secondary`, `border-accent` available throughout the project.

### Using Tailwind in Astro `<style>` blocks

To access Tailwind utilities and theme tokens inside an Astro `<style>` block, reference the global CSS file:

```css
<style>
  @reference '@styles/global.css';
  /* now you can use @apply, theme tokens, etc. */
</style>
```

See the [official Tailwind v4 docs](https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules) for details.
