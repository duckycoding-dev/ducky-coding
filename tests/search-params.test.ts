import { describe, expect, it } from 'vitest';

import { SearchParamsSchema } from '../src/db/features/search/search.types.ts';

// Characterization tests: these lock in what the schema does TODAY, including
// the sharp edges. A test failing here means /search's contract changed.
describe('SearchParamsSchema', () => {
  it('applies defaults when nothing is provided', () => {
    const result = SearchParamsSchema.safeParse({});

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      type: 'all',
      page: 1,
      pageSize: 20,
    });
  });

  it('leaves q, tags and topics undefined when absent', () => {
    const result = SearchParamsSchema.safeParse({});

    expect(result.data?.q).toBeUndefined();
    expect(result.data?.tags).toBeUndefined();
    expect(result.data?.topics).toBeUndefined();
  });

  it('splits a comma list and drops empty segments', () => {
    const result = SearchParamsSchema.safeParse({ tags: 'a,,b' });

    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual(['a', 'b']);
  });

  it('splits topics the same way as tags', () => {
    const result = SearchParamsSchema.safeParse({ topics: 'astro,,html' });

    expect(result.data?.topics).toEqual(['astro', 'html']);
  });

  it('rejects an empty tags string (empty array fails min(1))', () => {
    expect(SearchParamsSchema.safeParse({ tags: '' }).success).toBe(false);
  });

  it('rejects a tags string of only separators', () => {
    expect(SearchParamsSchema.safeParse({ tags: ',,' }).success).toBe(false);
  });

  it('rejects an empty q (min(1))', () => {
    expect(SearchParamsSchema.safeParse({ q: '' }).success).toBe(false);
  });

  it('rejects an unknown type', () => {
    expect(SearchParamsSchema.safeParse({ type: 'bogus' }).success).toBe(false);
  });

  it.each(['post', 'meme', 'all'])('accepts type=%s', (type) => {
    const result = SearchParamsSchema.safeParse({ type });

    expect(result.success).toBe(true);
    expect(result.data?.type).toBe(type);
  });

  it('coerces a numeric page string', () => {
    const result = SearchParamsSchema.safeParse({ page: '3' });

    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(3);
  });

  it('rejects page=0 (min(1))', () => {
    expect(SearchParamsSchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('rejects a non-integer page', () => {
    expect(SearchParamsSchema.safeParse({ page: '1.5' }).success).toBe(false);
  });

  it('accepts pageSize at the 100 boundary', () => {
    const result = SearchParamsSchema.safeParse({ pageSize: '100' });

    expect(result.success).toBe(true);
    expect(result.data?.pageSize).toBe(100);
  });

  // Deliberate characterization of a sharp edge: pageSize is NOT clamped.
  // Over the max the whole parse fails, so searchService returns
  // { success: false } and /search renders its error state instead of
  // silently capping at 100. Changing this is a product decision.
  it('FAILS rather than clamping when pageSize exceeds 100', () => {
    const result = SearchParamsSchema.safeParse({ pageSize: '101' });

    expect(result.success).toBe(false);
  });
});
