import type { APIRoute } from 'astro';

import { findOgCardKind, OG_CARD_KINDS } from '@utils/og/kinds';
import { ogCardRoute, parseOgRoute } from '@utils/og/og-paths';
import { createOgRenderContext } from '@utils/og/renderer';

export const prerender = true;

/**
 * One path per card, across every registered kind.
 *
 * This route is deliberately kind-agnostic: it walks the registry and only ever
 * handles a kind string and an id string. Adding a card type means adding a
 * registry entry, not touching this file.
 */
export async function getStaticPaths(): Promise<
  { params: { route: string } }[]
> {
  const paths: { params: { route: string } }[] = [];

  for (const kind of OG_CARD_KINDS) {
    const ids = await kind.listIds();
    for (const id of ids) {
      paths.push({ params: { route: ogCardRoute(kind.kind, id) } });
    }
  }

  return paths;
}

export const GET: APIRoute = async ({ params }) => {
  const parsed = parseOgRoute(params.route ?? '');
  if (parsed === undefined) {
    return new Response('Not found', { status: 404 });
  }

  const kind = findOgCardKind(parsed.kind);
  if (kind === undefined) {
    return new Response(`Unknown card kind "${parsed.kind}"`, { status: 404 });
  }

  const { ctx, renderPng } = await createOgRenderContext();
  const html = await kind.renderById(parsed.id, ctx);
  const png = await renderPng(html);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
