import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Tracked in git on purpose — see the note below. */
export const INTER_WOFF2_PATH = 'src/assets/fonts/inter-latin-variable.woff2';

/**
 * The Inter woff2 used to render OG cards.
 *
 * This reads a file committed to the repository rather than one produced by
 * Astro's font pipeline. That is deliberate: the previous implementation globbed
 * `.astro/fonts/`, which is a *download cache*. It exists only after a build has
 * already populated it, so cards rendered locally and the build failed outright
 * on any cold checkout — CI and Netlify both start cold. Astro's build output
 * (`dist/_astro/fonts/<hash>.woff2`) is no better a source: the filenames carry
 * no family, weight or style, so picking the right face means guessing.
 *
 * Astro still downloads Inter independently for the site's own `@font-face`
 * rules. This copy serves only the card renderer, is never sent to a browser,
 * and costs 48 KB in the repo. Inter is OFL-licensed, so redistribution is fine.
 *
 * Deliberately no fallback font: rendering cards in something other than Inter
 * would go unnoticed and ship off-brand images, so a missing file is a hard
 * failure.
 *
 * Takumi reports this file as a single 400-weight face, but the variable weight
 * axis is applied at render time — verified by rendering the same text at 400 and
 * 900 and comparing the output.
 */
export async function loadInterWoff2(): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), INTER_WOFF2_PATH);

  try {
    return await readFile(fontPath);
  } catch (cause) {
    throw new Error(
      `No Inter woff2 at ${fontPath}. This file is tracked in git and must be ` +
        `present for OG card generation; it is not produced by the build.`,
      { cause },
    );
  }
}
