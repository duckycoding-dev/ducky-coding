/**
 * Single source of truth for where a card lives.
 *
 * The generated route is `/og/<kind>/<id>.png`. Because Astro ids for
 * directory-based content entries can contain `/`, the id is the *rest* of the
 * route after the kind, not just the last segment.
 */
export function ogCardUrl(kind: string, id: string): string {
  return `/og/${kind}/${id}.png`;
}

/** The `[...route]` param value, without leading slash or extension. */
export function ogCardRoute(kind: string, id: string): string {
  return `${kind}/${id}`;
}

export function parseOgRoute(
  route: string,
): { kind: string; id: string } | undefined {
  const trimmed = route.replace(/^\/+/, '').replace(/\.png$/, '');
  const firstSlash = trimmed.indexOf('/');
  if (firstSlash <= 0) return undefined;

  const kind = trimmed.slice(0, firstSlash);
  const id = trimmed.slice(firstSlash + 1);
  if (kind.length === 0 || id.length === 0) return undefined;

  return { kind, id };
}
