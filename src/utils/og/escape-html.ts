/**
 * Escapes text interpolated into the OG card's HTML.
 *
 * The card is assembled by string concatenation from content fields, so a title
 * containing `&` or `<` would otherwise corrupt the markup. Ampersand is replaced
 * first, otherwise the entities produced by later replacements get escaped again.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
