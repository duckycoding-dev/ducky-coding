/**
 * Six-digit hex colours only. Deliberately strict: shorthand (`#f50`), alpha
 * hex (`#ff5d01ff`) and CSS colour functions are all rejected, so a topic's
 * accent is always a predictable input to `color-mix()`.
 *
 * Anchored at both ends, which also stops a content file from smuggling extra
 * declarations into the custom property it is injected as.
 *
 * No `g` flag — a global regex carries `lastIndex` between `.test()` calls.
 */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Used when a topic declares no accent colour, or declares an invalid one. */
export const TOPIC_ACCENT_FALLBACK = 'var(--color-accent2)';

/**
 * Resolves a topic's configured accent colour to a value safe to inject as a
 * CSS custom property. Invalid input degrades to the site accent rather than
 * producing an unparseable `color-mix()`.
 */
export function resolveTopicAccent(accentColor?: string): string {
  if (accentColor === undefined) return TOPIC_ACCENT_FALLBACK;
  return HEX_COLOR_PATTERN.test(accentColor)
    ? accentColor
    : TOPIC_ACCENT_FALLBACK;
}
