import { describe, expect, it } from 'vitest';

import { escapeHtml } from './escape-html.ts';

describe('escapeHtml', () => {
  it('escapes the five characters that break markup or attributes', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('escapes ampersands before other entities, not after', () => {
    // A naive implementation that replaces < first and & second produces
    // '&amp;lt;' — double-escaping the entity it just created.
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('leaves ordinary text untouched', () => {
    expect(escapeHtml('Understanding HTML5 image attributes')).toBe(
      'Understanding HTML5 image attributes',
    );
  });

  it('handles a real title with an apostrophe', () => {
    expect(escapeHtml("Astro's islands")).toBe('Astro&#39;s islands');
  });

  it('returns an empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });
});
