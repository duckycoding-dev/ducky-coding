import type { OgCardKind } from '../types.ts';
import { postCardKind } from './post-card.ts';

/**
 * The mapper from a `kind` string to its implementation.
 *
 * Adding a card type means adding an entry here and nothing else: the route,
 * renderer, font loading, fitting and output paths are all kind-agnostic, and no
 * shared type describes what a card contains.
 */
export const OG_CARD_KINDS: readonly OgCardKind[] = [postCardKind];

export function findOgCardKind(kind: string): OgCardKind | undefined {
  return OG_CARD_KINDS.find((candidate) => candidate.kind === kind);
}
