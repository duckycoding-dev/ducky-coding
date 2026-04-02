---
updated: 2026-04-01
---

## Icons

For using icons throughout the project, we use `astro-icon` (not an official Astro library, but one created by one of the founders).
For how to use the `<Icon>` component, check [astro-icon's docs](https://www.astroicon.dev/getting-started/).

We use both `Material Design Icons (MDI)` and `Phosphor` icon sets: the two sets complement each other — some icons available in one are missing from the other.
For example, `Phosphor` has the new Twitter/X logo icon, whereas `MDI` does not; `MDI` has a Firefox icon while `Phosphor` doesn't.
`Phosphor` also offers multiple variants of the same icon (filled, outlined, different weights, etc.).

These icon sets are installed via `@iconify-json` npm packages:

```bash
npm install @iconify-json/NAME_OR_ABBREVIATION_OF_THE_ICON_SET
```

You can browse all available icon sets at [iconify.design](https://iconify.design/).

**BE CAREFUL**: when using server-side rendering or hybrid rendering, every icon in the assets will be included in the final build.
To avoid bloating the bundle, configure `astro.config.mjs` to include only the icons actually used:

```js
/* astro.config.mjs */

export default defineConfig({
  integrations: [
    icon({
      include: {
        // Include only three `mdi` icons in the bundle
        mdi: ['account', 'account-plus', 'account-minus'],
        // Include all `uis` icons
        uis: ['*']
      }
    })
  ]
});
```
