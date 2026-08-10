import type { FitOptions, FitResult, MeasureText } from './types.ts';

const DEFAULT_MIN_FONT_SIZE = 40;
const DEFAULT_MAX_FONT_SIZE = 136;
/** Never truncate below this many words, so a card is never a bare ellipsis. */
const MIN_WORDS = 4;

/**
 * Largest font size at which `text` fits `box`, found by bisection.
 *
 * The measurer is a parameter rather than an import so this stays pure and can be
 * tested without the native renderer. In production it is backed by Takumi's own
 * `Renderer.measure`, so measuring and drawing use the same layout engine.
 *
 * Truncation is a backstop, not the primary strategy: it only runs when the text
 * does not fit even at `minFontSize`.
 */
export async function fitTitle(
  text: string,
  box: { width: number; height: number },
  measure: MeasureText,
  opts: FitOptions = {},
): Promise<FitResult> {
  const min = opts.minFontSize ?? DEFAULT_MIN_FONT_SIZE;
  const max = opts.maxFontSize ?? DEFAULT_MAX_FONT_SIZE;

  if (text.length === 0) {
    return { text, fontSize: Math.floor(max), truncated: false };
  }

  const fits = async (candidate: string, size: number): Promise<boolean> => {
    const m = await measure(candidate, size);
    return m.width <= box.width + 1 && m.height <= box.height + 1;
  };

  // Integer bisection over [min, max]. Deliberately not a continuous bisection
  // followed by Math.floor: that variant never evaluates the upper bound itself,
  // so a title that fits at `max` converges to `max - ε` and floors to `max - 1`.
  // Searching integers directly reaches both endpoints exactly, so the result is
  // the true largest fitting size with no correction step.
  let low = Math.ceil(min);
  let high = Math.floor(max);
  let best: number | undefined;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (await fits(text, mid)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (best !== undefined) {
    return { text, fontSize: best, truncated: false };
  }

  // Backstop: shed whole words at the floor size until it fits.
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  let kept = words.length;
  while (kept > MIN_WORDS) {
    kept -= 1;
    const candidate = `${words.slice(0, kept).join(' ')} …`;
    if (await fits(candidate, min)) {
      return { text: candidate, fontSize: min, truncated: true };
    }
  }

  // A single unbreakable word, or fewer than MIN_WORDS words, that still does not
  // fit. Render at the floor and let the plate's overflow clip it rather than
  // looping forever.
  return { text, fontSize: min, truncated: false };
}
