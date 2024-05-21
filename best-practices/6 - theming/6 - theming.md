## How themes are handled

[TLDR 🥱](https://canopas.com/the-ultimate-guide-to-crafting-tailwind-css-themes-b43491843ebb)

Theme's will be set by using the data attribute `data-theme` on the `<html>` component\
 `data-theme`'s possible values are defined in the `CSSTheme`.\
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
  This can be useful for example for font sizes, that are probably going to be the same in every among different stylesheets.
  
  ```css
  /* default stylesheet */
  
  html,
  html[data-theme='default'] {
    /* ... */
    /* default styles */
    /* ... */
  }
  ```
  
  Also, if we wanted to, we could even define all the default styles directly inside `global.css` (using the same selectors) and avoid creating the `default.css` file: having said so, we will still use `default.css` for defining the default theme and use `global.css` for grouping together all the different themes' stylesheets and for defining styles for the `:root` selector (and other generic styles), to keep the code organized.
  
  <br/>
  <hr/>
  
  The css files need to be imported in the global stylesheet (`global.css` in our case) like so:
  
  <details>
    <summary>How I would like to do it using @import and @layer directives</summary>

```css
/* global.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    /* ... */
  }

  /* import all your themes below */
  @import 'themes/default.css';
  @import 'themes/dark-theme.css';
  /* ... */
}
```

## ATTENTION:

Using the css code described above (with the `@layer` and `@import` directives) and referencing the css variables inside `tailwind.config.mjs`, Tailwind was not able to find the variables value, as if they were not set at all.\
 This was fixed by following [part of this answer](https://stackoverflow.com/a/74749205/23628435), the PostCSS configuration part.\
 (I used a .mjs file with "export default" instead of a .cjs file with "module.exports", for consistency with the rest of the project)\

```js
/** @type {import('postcss')} */
export default {
  plugin: {
    'postcss-import': {},
  },
};
```

  </details>

  <details>
  <summary>How it's done at the moment because the other method is not working as intended (and not even the fix described works, need to investigate that)</summary>

Just import the css files for the themes at the top of `global.css`

```css
/* global.css */
/* import all your themes below */
@import 'themes/default.css';
@import 'themes/dark-theme.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ... */
```

Or even do like this

```css
/* global.css */

@import 'tailwindcss/base';
@import './themes/default.css';
@import './themes/dark-theme.css';

@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

```css
/* default.css */

@layer base {
  html,
  html[data-theme='default'] {
    --color-primary: #fff;
    --color-secondary: #909090;
    --color-success: #6ccade;
    --color-danger: #8a170b;
    --color-info: #ffffff;
    --color-label: #ffffff0d;

    --font-primary: 3rem;
    --font-label: 2rem;
  }
}
```

Not sure if the @layer directive inside an imported file does anything.\
Also have to check if at this point the custom PostCSS config does anything special or not.

  </details>
