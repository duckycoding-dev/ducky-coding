import { describe, expect, it } from 'vitest';

import { formatReadTime } from './read-time';

describe('formatReadTime', () => {
  it('uses the compact label by default', () => {
    expect(formatReadTime(5)).toBe('5 min read');
  });

  it('handles a one-minute compact label', () => {
    expect(formatReadTime(1)).toBe('1 min read');
  });

  it('can spell out the unit for visible interface copy', () => {
    expect(formatReadTime(5, 'long')).toBe('5-minute read');
  });
});
