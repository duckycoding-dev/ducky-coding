import { describe, expect, it } from 'vitest';

import {
  HEX_COLOR_PATTERN,
  resolveTopicAccent,
  TOPIC_ACCENT_FALLBACK,
} from './topic-accent.ts';

describe('resolveTopicAccent', () => {
  it('returns a valid lowercase hex unchanged', () => {
    expect(resolveTopicAccent('#ff5d01')).toBe('#ff5d01');
  });

  it('returns a valid uppercase hex unchanged', () => {
    expect(resolveTopicAccent('#61DAFB')).toBe('#61DAFB');
  });

  it('falls back when the value is undefined', () => {
    expect(resolveTopicAccent(undefined)).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a three-digit shorthand hex', () => {
    expect(resolveTopicAccent('#f50')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a missing hash', () => {
    expect(resolveTopicAccent('ff5d01')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on non-hex characters', () => {
    expect(resolveTopicAccent('#gggggg')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on an empty string', () => {
    expect(resolveTopicAccent('')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a CSS colour function', () => {
    expect(resolveTopicAccent('rgb(255 0 0)')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on an eight-digit hex with alpha', () => {
    expect(resolveTopicAccent('#ff5d01ff')).toBe(TOPIC_ACCENT_FALLBACK);
  });

  it('falls back on a hex carrying surrounding whitespace', () => {
    expect(resolveTopicAccent(' #ff5d01 ')).toBe(TOPIC_ACCENT_FALLBACK);
  });
});

describe('HEX_COLOR_PATTERN', () => {
  it('is stateless across repeated calls', () => {
    // A /g flag would make lastIndex leak between calls — guard against it.
    expect(HEX_COLOR_PATTERN.test('#ff5d01')).toBe(true);
    expect(HEX_COLOR_PATTERN.test('#ff5d01')).toBe(true);
  });

  it('anchors both ends so injected CSS cannot ride along', () => {
    expect(HEX_COLOR_PATTERN.test('#ff5d01; background: url(evil)')).toBe(
      false,
    );
  });
});
