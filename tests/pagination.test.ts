import { describe, expect, it } from 'vitest';

import { getVisiblePages } from '../src/components/pagination/get-visible-pages.ts';

describe('getVisiblePages', () => {
  it('returns the single page for a one-page list', () => {
    expect(getVisiblePages(1, 1)).toEqual([1]);
  });

  it('shows every page without ellipsis at the 5-page boundary', () => {
    expect(getVisiblePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getVisiblePages(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('adds a trailing ellipsis once past the boundary', () => {
    expect(getVisiblePages(1, 6)).toEqual([1, 2, 'ellipsis', 6]);
  });

  it('shows first, current ±1 and last from an early page', () => {
    expect(getVisiblePages(3, 10)).toEqual([1, 2, 3, 4, 'ellipsis', 10]);
  });

  it('adds a leading ellipsis on the last page', () => {
    expect(getVisiblePages(10, 10)).toEqual([1, 'ellipsis', 9, 10]);
  });

  it('adds an ellipsis on both sides in the middle', () => {
    expect(getVisiblePages(5, 9)).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      'ellipsis',
      9,
    ]);
  });

  it('never emits a duplicate page number', () => {
    for (let total = 1; total <= 12; total++) {
      for (let current = 1; current <= total; current++) {
        const pages = getVisiblePages(current, total);
        const numbers = pages.filter((p): p is number => p !== 'ellipsis');

        expect(new Set(numbers).size).toBe(numbers.length);
      }
    }
  });

  it('always keeps pages sorted ascending and includes first and last', () => {
    for (let total = 6; total <= 12; total++) {
      for (let current = 1; current <= total; current++) {
        const numbers = getVisiblePages(current, total).filter(
          (p): p is number => p !== 'ellipsis',
        );

        expect(numbers[0]).toBe(1);
        expect(numbers.at(-1)).toBe(total);
        expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
      }
    }
  });

  it('never places an ellipsis where the gap is only one page', () => {
    // (2, 6) would produce 1,2,3 then a real gap before 6
    expect(getVisiblePages(2, 6)).toEqual([1, 2, 3, 'ellipsis', 6]);
  });
});
