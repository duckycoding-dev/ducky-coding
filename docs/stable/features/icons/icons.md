---
created: 2026-04-02
updated: 2026-08-09
summary: astro-icon setup, the MDI and Phosphor icon sets, and bundle-size caveats
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

Currently installed: `@iconify-json/mdi` and `@iconify-json/ph`. You can browse
all available icon sets at [iconify.design](https://iconify.design/).

Icons are wrapped rather than used raw: `src/components/icons/` holds one
component per icon (`GitHubIcon.astro`, `CalendarIcon.astro`, …) plus a shared
`GenericIcon.astro` and an `index.ts` exporting the common `CustomIconProps`
type. Import the wrapper, not `<Icon>` directly.

**BE CAREFUL**: when using server-side rendering or hybrid rendering, every icon in the assets will be included in the final build.
To avoid bloating the bundle, configure `astro.config.mjs` to include only the icons actually used:

This project does **not** currently set `include`. Prerendered pages only emit
the sprite symbols they actually use (verified: 8 symbols on a meme page), so
it has not been needed — but `/search` is server-rendered, so revisit this if
icon usage grows.

Note also that the integration is configured with
`iconDir: 'src/assets/icons'`, a directory that does not exist. Every icon
comes from the iconify sets, so the option is inert — see CLEANUP-007.

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
