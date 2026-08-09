---
created: 2026-04-09
updated: 2026-08-09
summary: How to add rel=prev/next when implementing pagination
---

# Pagination SEO

When adding pagination to blog or meme listing pages, include `rel=prev` and `rel=next` links in the page head.

## Pattern

Meme detail pages (`src/pages/memes/[...id]/index.astro`) — for prev/next
between memes — and the search page (`src/pages/search.astro`) — for genuine
result pagination — both already do this using `astro-seo`'s `extend.link`
option:

```ts
const seoProps = buildPageSeo({ ... });

seoProps.extend = {
  ...seoProps.extend,
  link: [
    ...(prevUrl ? [{ rel: 'prev', href: prevUrl }] : []),
    ...(nextUrl ? [{ rel: 'next', href: nextUrl }] : []),
  ],
};
```

## When to apply

Still to do — none of these paginate yet, and none use Astro's `paginate()`
helper. `/search` is the only paginated route, and it builds its own page links
via `src/components/pagination/`.

- Blog listing (`/blog`) — when paginated into `/blog`, `/blog/2`, etc.
- Memes listing (`/memes`) — when paginated
- Topic pages (`/topics/[topic]`) — when paginated

## Notes

- `rel=prev/next` is not a ranking signal for Google (deprecated in 2019) but still useful for other search engines and as a semantic hint
- Canonical URL should point to the specific page (e.g., `/blog/2`), not the first page
- Each paginated page should have its own unique meta description (e.g., "Page 2 of web development articles...")
