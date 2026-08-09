---
created: 2026-04-02
updated: 2026-08-09
summary: How rendered Markdown is styled, via markdown.css and the MarkdownContent layout
---

## How to style content from Markdown

Markdown content is styled using a dedicated stylesheet (`src/styles/markdown.css`) combined with custom Astro components for elements that need richer markup.

Both are wired up in one place — the `MarkdownContent` layout — so pages never
assemble this themselves.

### Rendering a collection entry

`src/layouts/markdown-content/MarkdownContent.astro` imports the stylesheet,
calls `render()` from `astro:content`, applies the `.markdown-content` class and
passes the custom components:

```astro
---
import '@styles/markdown.css';
import { render } from 'astro:content';
import { MarkdownComponents } from '@components/markdown';

const { entry, class: className, ...props }: Props = Astro.props;
const { Content } = await render(entry);
---

<article class={cn('markdown-content', className)} {...props}>
  <Content components={MarkdownComponents} />
</article>
```

Pages just hand it an entry:

```astro
<!-- src/pages/posts/[...id]/index.astro -->
<MarkdownContent entry={entry} />
```

Note that `render(entry)` is imported from `astro:content` — the older
`entry.render()` method was removed in Astro 5.

### Custom stylesheet

`src/styles/markdown.css` scopes every rule under `.markdown-content`, which is
why the wrapper class matters. It covers headings, paragraphs, lists, code
blocks, blockquotes, tables, inline elements (`mark`, `kbd`, `abbr`, `q`,
`time`), `details`/`summary`, and `hr`.

### Custom Markdown components

For elements that need richer markup than CSS alone can express, custom Astro
components live in `src/components/markdown/` and are exported as a single
`MarkdownComponents` map from its `index.ts`:

```ts
export const MarkdownComponents = {
  a: CustomA,
};
```

Only the anchor tag (`a`) currently has one — everything else is styled purely
through the stylesheet. To override another element, write the component in
that folder and add it to the map; prefer CSS and add a component only when the
change cannot be expressed in CSS.

### Markdown processing

As of Astro 7 the pipeline is Sätteri rather than remark/rehype. GitHub-Flavored
Markdown and smart punctuation are applied by default, so `astro.config.mjs`
sets neither — see the comment in its `markdown` block.
