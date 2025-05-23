## How CSS files are organized and how themes are handled

(For organizing theme css files and variables we will follow the example of this article BUT we will do imports differently since the way that it's explained here does't seem to work: https://canopas.com/the-ultimate-guide-to-crafting-tailwind-css-themes-b43491843ebb)

<hr/>

The way we will organize css files follows the following schema:

```
/*in the astro-app package*/
/src
  |__/styles
    |__/themes
      |__default.css
      |__dark-theme.css
    |__global.css
    |__style-reset.css
```

Themes will be set by using the data attribute `data-theme` on the `<html>` component.\
 `data-theme`'s possible values are defined in the `CSSTheme` type.\
 If we want to change style, we just need to dynamically change `data-theme` with another value.\

For each theme there will be a css file with the same name, stored in `src/styles/themes` (for example `default.css` or `dark-theme.css`).\
 Here we will define all the css variables that will be used throughout the project through tailwind classes: indeed, these css variables will be used to define tailwind classes inside `tailwind.config.mjs`

The css file will look something like this:

```css
/* default.css */

html, /* <=== use this plain selector only in the default stylesheet*/
html[data-theme='default'] {
  --color-primary: #ffffff;
  --color-secondary: #909090;

  /* ... */

  --font-primary: 3rem;
  --font-label: 2rem;
}
```

<br/>
<hr/>

### ATTENTION:

For the default styles in `default.css` the selector will also contain `html`, other than the one with the adjacent data attribute selector: this way if we define some variables **ONLY** in the `default.css` but the currently selected theme is `dark-theme`, we will still have those styles applied.\
This can be useful for example for font sizes, that are probably going to be the same among different stylesheets.

```css
/* default stylesheet */

html,
html[data-theme='default'] {
  /* ... */
  /* default styles */
  /* ... */
}
```

If we wanted to, we could even define all the default styles directly inside `global.css` (using the same selectors) and avoid creating the `default.css` file.

Having said so, we will still use `default.css` for defining the default theme and use `global.css` for grouping together all the different css files to keep the code organized.

The css files need to be imported in the global stylesheet (`global.css` in our case) like so:

```css
/* global.css */
@import './style-reset.css';

@import 'tailwindcss';
@import './themes/default.css' layer(base);
@import './themes/dark-theme.css' layer(base);
```

We will first import the stylesheet that handles resetting all the css rules, so that it won't accidentally affect other custom styles we will create.

Then we import the tailwind styles and our custom ones.\

The `@import 'path' layer(name)` directive (the second part corresponds to the `@layer name` css directive) imports the css file specified and inserts it inside the specified layer.\
Layers allow us to organize css rules even more, more info [here](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

# using tailwind @apply in Astro <style> block

In order to have access to the global css file inside an Astro `<style>` it needs to be referenced like so: `@reference '@styles/global.css'` as shown in [the official Tailwind v4 docs](https://tailwindcss.com/docs/upgrade-guide#using-apply-with-vue-svelte-or-css-modules)
