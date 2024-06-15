## Icons
For using icons throught the project, we will be using the `astro-icon` (not an official AstroJS library, but one created by one of the founders)\
For how to use the `<Icon>` component, check [astro-icon's docs](https://www.astroicon.dev/getting-started/).\
As for the actual images, we will be using both `Material Design Icons (MDI)` and `Phosphor` icon sets: we use two because, even though they are huge libraries, they offer different things and some icons available in one of the two is missing from the other (and viceversa).\
For example, `Phosphor` has the new Twitter logo (X) icon, whereas `MDI` does not; on the other hand `MDI` has an icon for Firefox while `Phosphor` does't.\
`Phosphor` also offers different variants of the same logo, like filled, outlined, different thickness, etc...

These two icon sets (and other in the future in case), are installed via `@icony-json` npm package.\
To install one package it's as simple as typing `npm install @iconify-json/NAME_OR_ABBREVIATION_OF_THE_ICON_SET_YOU_WANT`: you can find all the icon sets at [iconify.design](https://iconify.design/)

**_BE CAREFUL_**, if using server side rendering, or hybrid rendering, every icon of the assets will be imported in the final build.
To avoid this, customize `astro.config.mjs` by including only the used icons, like done in the following example:

```js
/* astro.config.mjs */

export default defineConfig({
...
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


#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components
#TODO: explain custom icon components