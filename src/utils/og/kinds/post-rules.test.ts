import { describe, expect, it } from 'vitest';

import { pickChips, readTimeLabel } from './post-rules.ts';

describe('pickChips', () => {
  it('uses the topic first and the first tag that differs from it', () => {
    // Every real post today has tags[0] === topicTitle, so a naive
    // "topic + tags[0]" rule would render the same word twice.
    expect(pickChips('HTML', ['HTML', 'a18y', 'Web Development'])).toEqual([
      { label: 'HTML', tone: 'accent' },
      { label: 'a18y', tone: 'accent2' },
    ]);
  });

  it('compares case-insensitively when skipping the topic', () => {
    expect(pickChips('Astro', ['astro', 'SQLite'])).toEqual([
      { label: 'Astro', tone: 'accent' },
      { label: 'SQLite', tone: 'accent2' },
    ]);
  });

  it('renders only the topic when no tag differs', () => {
    expect(pickChips('HTML', ['HTML'])).toEqual([
      { label: 'HTML', tone: 'accent' },
    ]);
  });

  it('renders only the topic when there are no tags at all', () => {
    expect(pickChips('HTML', [])).toEqual([{ label: 'HTML', tone: 'accent' }]);
  });

  it('truncates a tag longer than 18 characters', () => {
    const chips = pickChips('HTML', ['HTML', 'an-extremely-long-tag-name']);
    expect(chips[1]?.label).toBe('an-extremely-long…');
    expect(chips[1]?.label.length).toBe(18);
  });

  it('does not truncate an 18-character tag', () => {
    const chips = pickChips('HTML', ['HTML', 'x'.repeat(18)]);
    expect(chips[1]?.label).toBe('x'.repeat(18));
  });

  it('ignores whitespace-only tags when picking the second chip', () => {
    expect(pickChips('HTML', ['HTML', '   ', 'a18y'])).toEqual([
      { label: 'HTML', tone: 'accent' },
      { label: 'a18y', tone: 'accent2' },
    ]);
  });
});

describe('readTimeLabel', () => {
  it('formats minutes', () => {
    expect(readTimeLabel(5)).toBe('5 min read');
  });

  it('uses the singular for one minute', () => {
    expect(readTimeLabel(1)).toBe('1 min read');
  });
});
