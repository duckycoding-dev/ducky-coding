import { describe, expect, it } from 'vitest';

import { INTER_WOFF2_PATH, loadInterWoff2 } from './inter-font.ts';

describe('loadInterWoff2', () => {
  it('reads a real woff2 from a tracked path', async () => {
    const font = await loadInterWoff2();
    // wOF2 magic number. Guards against the file being replaced by a pointer,
    // an LFS stub, or a truncated copy.
    expect(font.subarray(0, 4).toString('latin1')).toBe('wOF2');
    expect(font.byteLength).toBeGreaterThan(10_000);
  });

  it('points at a build-independent location', () => {
    // The regression this pins: the font used to come from `.astro/fonts`, a
    // download cache that is empty on a cold checkout, so the build failed on CI
    // and Netlify while succeeding locally.
    expect(INTER_WOFF2_PATH).not.toContain('.astro');
    expect(INTER_WOFF2_PATH).not.toContain('dist');
    expect(INTER_WOFF2_PATH).not.toContain('node_modules');
    expect(INTER_WOFF2_PATH.startsWith('src/')).toBe(true);
  });
});
