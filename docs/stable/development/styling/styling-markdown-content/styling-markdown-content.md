---
updated: 2026-04-01
---

## How to style content from Markdown

Markdown content is styled using a dedicated stylesheet (`src/styles/markdown.css`) combined with custom Astro components for elements that need richer markup.

### Custom stylesheet

`src/styles/markdown.css` applies styles by scoping them under the `.markdown-content` class. Add this class to the wrapper element around the rendered markdown content:

```astro
<!-- src/pages/posts/[...slug]/index.astro -->
---
const { Content } = await entry.render();
---

<article class="markdown-content">
  <Content components={MarkdownComponents} />
</article>
```

The stylesheet covers: headings, paragraphs, lists, code blocks, blockquotes, tables, inline elements (`mark`, `kbd`, `abbr`, `q`, `time`), `details`/`summary`, and `hr`.

### Custom Markdown components

For elements that require richer component markup beyond what CSS alone can express, custom Astro components live in `src/components/Markdown/`.

They are exported from `src/components/Markdown/index.ts` as a single `MarkdownComponents` object:

```ts
import { MarkdownComponents } from '@components/Markdown';
```

And passed to the `<Content />` component:

```astro
<Content components={MarkdownComponents} />
```

Currently only the anchor tag (`a`) uses a custom component. All other elements are styled via the CSS stylesheet. To activate a custom component for another element, uncomment it in `src/components/Markdown/index.ts`.
