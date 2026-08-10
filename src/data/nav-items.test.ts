import { describe, expect, it } from 'vitest';

import { NAV_ITEMS } from './nav-items.ts';

describe('NAV_ITEMS', () => {
  it('does not expose search as a navigation destination', () => {
    // Search is an action served by NavSearchForm, not a content section.
    expect(NAV_ITEMS.some((item) => item.href === '/search')).toBe(false);
    expect(
      NAV_ITEMS.some((item) => item.label.toLowerCase() === 'search'),
    ).toBe(false);
  });

  it('keeps the my-projects slug while shortening the label', () => {
    const projects = NAV_ITEMS.find((item) => item.href === '/my-projects');
    expect(projects).toBeDefined();
    expect(projects?.label).toBe('Projects');
  });

  it('lists exactly five destinations', () => {
    expect(NAV_ITEMS).toHaveLength(5);
  });

  it('has no duplicate hrefs', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('has no duplicate labels', () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('uses root-relative hrefs only', () => {
    for (const item of NAV_ITEMS) {
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  it('gives every item a non-empty label', () => {
    for (const item of NAV_ITEMS) {
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
  });
});
