import { describe, expect, it } from 'vitest';

import { fitTitle } from './fit-title.ts';
import type { MeasureText } from './types.ts';

/** Deterministic stand-in for Takumi's layout engine. */
function fakeMeasurer(boxWidth: number): MeasureText {
  return (text, fontSize) => {
    const charWidth = fontSize * 0.5;
    const perLine = Math.max(1, Math.floor(boxWidth / charWidth));
    const lines = Math.max(1, Math.ceil(text.length / perLine));
    return Promise.resolve({
      width: Math.min(text.length * charWidth, boxWidth),
      height: lines * fontSize * 1.04,
    });
  };
}

const BOX = { width: 1000, height: 300 };

describe('fitTitle', () => {
  it('gives a short title the maximum size', async () => {
    const r = await fitTitle('Short', BOX, fakeMeasurer(BOX.width), {
      maxFontSize: 136,
    });
    expect(r.fontSize).toBe(136);
    expect(r.truncated).toBe(false);
    expect(r.text).toBe('Short');
  });

  it('shrinks a long title rather than overflowing', async () => {
    const long = 'x'.repeat(120);
    const r = await fitTitle(long, BOX, fakeMeasurer(BOX.width));
    expect(r.fontSize).toBeLessThan(136);
    expect(r.truncated).toBe(false);
    const m = await fakeMeasurer(BOX.width)(long, r.fontSize);
    expect(m.height).toBeLessThanOrEqual(BOX.height);
  });

  it('never returns a size below the floor', async () => {
    const r = await fitTitle('x'.repeat(5000), BOX, fakeMeasurer(BOX.width), {
      minFontSize: 40,
    });
    expect(r.fontSize).toBe(40);
  });

  it('truncates on a word boundary once the floor cannot fit', async () => {
    const words = 'alpha bravo charlie delta echo foxtrot golf hotel '.repeat(
      20,
    );
    const r = await fitTitle(words, BOX, fakeMeasurer(BOX.width), {
      minFontSize: 40,
    });
    expect(r.truncated).toBe(true);
    expect(r.text.endsWith('…')).toBe(true);
    // A word boundary, not a chopped word.
    expect(r.text.replace(' …', '')).toMatch(
      /\b(alpha|bravo|charlie|delta|echo|foxtrot|golf|hotel)$/,
    );
  });

  it('terminates on a single unbreakable word too long to fit', async () => {
    const r = await fitTitle('x'.repeat(4000), BOX, fakeMeasurer(BOX.width), {
      minFontSize: 40,
    });
    expect(r.fontSize).toBe(40);
    expect(r.text.length).toBeGreaterThan(0);
  });

  it('handles an empty string without looping', async () => {
    const r = await fitTitle('', BOX, fakeMeasurer(BOX.width));
    expect(r.text).toBe('');
    expect(r.truncated).toBe(false);
  });

  it('reaches the exact boundary size, not one pixel under', async () => {
    // Regression guard. A continuous bisection followed by Math.floor never
    // evaluates the upper bound, so anything fitting at the ceiling came back one
    // pixel small. Here the fake measurer fits at exactly 100 and not at 101.
    const measure: MeasureText = (_text, fontSize) =>
      Promise.resolve({
        width: 10,
        height: fontSize <= 100 ? 10 : 10_000,
      });

    const r = await fitTitle('anything', BOX, measure, {
      minFontSize: 40,
      maxFontSize: 136,
    });
    expect(r.fontSize).toBe(100);
  });

  it('returns the ceiling when the text fits at every size', async () => {
    const measure: MeasureText = () => Promise.resolve({ width: 1, height: 1 });
    const r = await fitTitle('tiny', BOX, measure, { maxFontSize: 136 });
    expect(r.fontSize).toBe(136);
  });

  it('returns an integer font size', async () => {
    const r = await fitTitle('x'.repeat(70), BOX, fakeMeasurer(BOX.width));
    expect(Number.isInteger(r.fontSize)).toBe(true);
  });
});
