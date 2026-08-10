import { describe, expect, it } from 'vitest';

import { ogCardRoute, ogCardUrl, parseOgRoute } from './og-paths.ts';

describe('og paths', () => {
  it('builds a site-absolute url', () => {
    expect(ogCardUrl('posts', 'welcome-to-duckycoding')).toBe(
      '/og/posts/welcome-to-duckycoding.png',
    );
  });

  it('builds the route param without the extension or leading slash', () => {
    expect(ogCardRoute('posts', 'welcome')).toBe('posts/welcome');
  });

  it('round-trips a simple id', () => {
    expect(parseOgRoute(ogCardRoute('posts', 'welcome'))).toEqual({
      kind: 'posts',
      id: 'welcome',
    });
  });

  it('round-trips an id containing slashes', () => {
    // Astro ids for directory-based entries can contain segments.
    const parsed = parseOgRoute(ogCardRoute('posts', 'nested/thing'));
    expect(parsed).toEqual({ kind: 'posts', id: 'nested/thing' });
  });

  it('returns undefined for a route with no id', () => {
    expect(parseOgRoute('posts')).toBeUndefined();
  });

  it('returns undefined for an empty route', () => {
    expect(parseOgRoute('')).toBeUndefined();
  });
});
