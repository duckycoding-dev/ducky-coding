import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

/**
 * Assertions on the built output. Requires `npm run astro:build:local` to have
 * run — these read `dist/` rather than exercising the endpoint directly, because
 * the endpoint only runs inside Astro's build.
 */
const DIST = path.join(process.cwd(), 'dist');
const CARDS = path.join(DIST, 'og/posts');

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function cardFiles(): Promise<string[]> {
  return (await readdir(CARDS)).filter((file) => file.endsWith('.png'));
}

describe('generated OG cards', () => {
  it('emits one card per published post', async () => {
    expect(await exists(CARDS)).toBe(true);
    expect((await cardFiles()).length).toBeGreaterThanOrEqual(3);
  });

  it('emits real 1200x630 PNGs', async () => {
    for (const file of await cardFiles()) {
      const meta = await sharp(path.join(CARDS, file)).metadata();
      expect(meta.format).toBe('png');
      expect(meta.width).toBe(1200);
      expect(meta.height).toBe(630);
    }
  });

  it('points each post page at its own card', async () => {
    const html = await readFile(
      path.join(DIST, 'posts/avoid-self-referencing-links/index.html'),
      'utf-8',
    );
    expect(html).toContain('/og/posts/avoid-self-referencing-links.png');
    expect(html).toContain('og:image:width');
    expect(html).toContain('1200');
  });

  it('serves a social card two orders of magnitude smaller than the banner', async () => {
    // This is the real win, and it is on the wire rather than in the build: the
    // banners were 495-2237 KB and wrongly proportioned for a social preview.
    // Note it does NOT shrink `dist` — Astro emits an original for every imported
    // asset whether or not anything references it.
    for (const file of await cardFiles()) {
      const { size } = await stat(path.join(CARDS, file));
      expect(size).toBeLessThan(150 * 1024);
    }
  });

  it('no longer references the unoptimised originals anywhere in the output', async () => {
    const originals = [
      'welcome-to-duckycoding.DnzYi2GU.png',
      'image-srcset-and-sizes-attributes.CzRZC2KU.png',
      'avoid-self-referencing-links.Cyx_FKHn.png',
    ];

    const html = await readFile(path.join(DIST, 'index.html'), 'utf-8');
    const rss = await readFile(path.join(DIST, 'rss.xml'), 'utf-8');
    const post = await readFile(
      path.join(DIST, 'posts/avoid-self-referencing-links/index.html'),
      'utf-8',
    );

    for (const original of originals) {
      expect(html).not.toContain(original);
      expect(rss).not.toContain(original);
      expect(post).not.toContain(original);
    }
  });

  it('gives the rss feed an optimised enclosure, not a source file', async () => {
    const rss = await readFile(path.join(DIST, 'rss.xml'), 'utf-8');
    const enclosures = rss.match(/enclosure url="[^"]+"/g) ?? [];
    expect(enclosures.length).toBeGreaterThan(0);
    for (const enclosure of enclosures) {
      expect(enclosure).toMatch(/\.webp"/);
    }
  });
});
