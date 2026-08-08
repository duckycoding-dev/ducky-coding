import { describe, expect, it } from 'vitest';

import { buildBreadcrumb } from '../src/utils/json-ld/breadcrumb.ts';
import {
  buildGraph,
  PERSON_ID,
  WEBSITE_ID,
} from '../src/utils/json-ld/graph.ts';

// Shape locks, not schema validation: these catch a refactor that drops
// @context, breaks @id wiring or renumbers breadcrumb positions.
describe('buildGraph', () => {
  it('wraps nodes in a schema.org @graph', () => {
    const nodes = [
      { '@type': 'WebSite' as const, '@id': WEBSITE_ID },
      { '@type': 'Person' as const, '@id': PERSON_ID },
    ];

    const graph = buildGraph(nodes);

    expect(graph['@context']).toBe('https://schema.org');
    expect(graph['@graph']).toEqual(nodes);
  });

  it('keeps @id values rooted at the website origin', () => {
    expect(WEBSITE_ID).toMatch(/#website$/);
    expect(PERSON_ID).toMatch(/#person$/);
    expect(WEBSITE_ID.startsWith('https://')).toBe(true);
  });
});

describe('buildBreadcrumb', () => {
  it('always starts at Home with position 1', () => {
    const crumb = buildBreadcrumb([]);
    const items = crumb.itemListElement;

    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(1);
    expect(items).toEqual([
      expect.objectContaining({ position: 1, name: 'Home' }),
    ]);
  });

  it('numbers positions sequentially after Home', () => {
    const crumb = buildBreadcrumb([
      { name: 'Blog', url: 'https://example.test/blog' },
      { name: 'A post', url: 'https://example.test/blog/a-post' },
    ]);
    const items = crumb.itemListElement;

    expect(items).toHaveLength(3);
    expect(items).toEqual([
      expect.objectContaining({ position: 1, name: 'Home' }),
      expect.objectContaining({ position: 2, name: 'Blog' }),
      expect.objectContaining({
        position: 3,
        name: 'A post',
        item: 'https://example.test/blog/a-post',
      }),
    ]);
  });

  it('anchors an @id on the page url only when one is given', () => {
    const withUrl = buildBreadcrumb([], 'https://example.test/blog');
    const withoutUrl = buildBreadcrumb([]);

    expect(withUrl['@id']).toBe('https://example.test/blog#breadcrumb');
    expect(withoutUrl['@id']).toBeUndefined();
  });
});
