import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';

const FONT_GLOB = '.astro/fonts/font-inter-*-normal-*.woff2';

/**
 * The Inter woff2 that Astro's font pipeline downloaded.
 *
 * Deliberately no fallback: rendering cards in some other font would go
 * unnoticed and ship off-brand images, so a missing font is a hard failure. The
 * filename carries a content hash, hence the glob rather than a literal path.
 *
 * Takumi reports this file as a single 400-weight face, but the variable weight
 * axis is applied at render time — verified by rendering the same text at 400 and
 * 900 and comparing the output.
 */
export async function loadInterWoff2(): Promise<Buffer> {
  const pattern = path.join(process.cwd(), FONT_GLOB);

  for await (const match of glob(pattern)) {
    return readFile(match);
  }

  throw new Error(
    `No Inter woff2 found at ${pattern}. Astro downloads fonts during the ` +
      `build, so this must run inside the build, or after an "astro build" has ` +
      `populated .astro/fonts.`,
  );
}
