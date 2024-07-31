## How to style content from Markdown

There are different ways to style markdown content inside an Astro page: using global styles, importing a stylesheet directly inside the page/layout that wraps the content, creating custom components for everything or using Tailwind's typography plugin.

In order to ease development, for now we will rely on the Tailwind's typography plugin, combined with a few custom elements (for example for styling anchor tags as done around the website using the same `<Link />` component, with `variant='default'`)

It's been created a directory in `packages/astro-app/src/components/Markdown` in which are present some custom components, exported as a single object from the `index.ts` file: as for now this object won't be used, untill there is time to invest in manually styling how the markdown content looks, except for some components that might require immediate styling (again, e.g. the anchor tags)

These custom components are used in this way, passed to the markdown `<Content />` component:

```jsx
// src/pages/articles/[...slug]/index.astro
---
import { MarkdownComponents } from '@components/Markdown';
const { Content } = await entry.render();
---

<article>
  <Content components={MarkdownComponents} />
</article>
```

In order to use Tailwind's typography plugin we add it to `tailwind.config.mjs` like so:

```js
import typography from '@tailwindcss/typography';

export default{
  ...
  plugins: [typography],
}
```

And then add its own `prose` class (and other classes if needed) in the .astro page:

```jsx
<article class='prose'>
  <Content components={MarkdownComponents} />
</article>
```

For more info about Tailwind's typography plugin check its [GitHub repo](https://github.com/tailwindlabs/tailwindcss-typography#adding-custom-color-themes)
