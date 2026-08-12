import { describe, expect, it } from 'vitest';

import { getPostCardPresentation } from './post-card';

describe('getPostCardPresentation', () => {
  it('builds compact publication metadata and limits visible tags', () => {
    const presentation = getPostCardPresentation({
      publishedAt: Date.UTC(2025, 9, 6),
      createdAt: Date.UTC(2025, 8, 1),
      timeToRead: 5,
      tags: ['HTML', 'Web Development', 'Accessibility', 'Astro'],
      author: 'DuckyCoding',
    });

    expect(presentation).toEqual({
      publicationDate: new Date(Date.UTC(2025, 9, 6)),
      publicationDateLabel: '6 Oct 2025',
      readTimeLabel: '5-minute read',
      visibleTags: ['HTML', 'Web Development'],
      hiddenTags: ['Accessibility', 'Astro'],
      hiddenTagCount: 2,
      hiddenTagsLabel: '2 more tags: Accessibility, Astro',
      authorLabel: null,
    });
  });

  it('falls back to the creation date and handles a one-minute read', () => {
    const presentation = getPostCardPresentation({
      publishedAt: null,
      createdAt: Date.UTC(2024, 0, 9),
      timeToRead: 1,
      tags: ['Astro'],
      author: 'Guest Author',
    });

    expect(presentation.publicationDateLabel).toBe('9 Jan 2024');
    expect(presentation.readTimeLabel).toBe('1-minute read');
    expect(presentation.hiddenTags).toEqual([]);
    expect(presentation.hiddenTagCount).toBe(0);
    expect(presentation.hiddenTagsLabel).toBeNull();
    expect(presentation.authorLabel).toBe('By Guest Author');
  });

  it('uses a singular label for one hidden tag', () => {
    const presentation = getPostCardPresentation({
      publishedAt: null,
      createdAt: Date.UTC(2024, 0, 9),
      timeToRead: 3,
      tags: ['Astro', 'Web Development', 'TypeScript'],
      author: 'DuckyCoding',
    });

    expect(presentation.hiddenTagsLabel).toBe('1 more tag: TypeScript');
  });
});
