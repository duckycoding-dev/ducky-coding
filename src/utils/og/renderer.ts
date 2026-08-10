import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fromHtml } from 'takumi-js/helpers/html';
import { Renderer } from 'takumi-js/node';

import { fitTitle } from './fit-title.ts';
import { loadInterWoff2 } from './inter-font.ts';
import type { FitOptions, FitResult, OgRenderContext } from './types.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const FONT_FAMILY = 'Inter';
const LOGO_PATH = 'src/assets/images/DuckyCoding_logo.png';

export interface OgRenderer {
  ctx: OgRenderContext;
  renderPng: (html: string) => Promise<Buffer>;
}

/**
 * Builds a Takumi renderer with the site font registered, plus the render context
 * handed to card kinds.
 *
 * The title is measured with `Renderer.measure`, i.e. the same layout engine that
 * draws the card, so the fitted size cannot disagree with the final render.
 */
export async function createOgRenderContext(): Promise<OgRenderer> {
  const renderer = new Renderer();
  await renderer.registerFont({
    name: FONT_FAMILY,
    data: await loadInterWoff2(),
  });

  // Takumi does not read the filesystem from an <img src>: every image must be
  // handed to it as bytes keyed by the exact src string used in the markup.
  // Without this the watermark simply renders as nothing, silently.
  const logoSrc = 'duckycoding-logo.png';
  const logoData = await readFile(path.join(process.cwd(), LOGO_PATH));

  /**
   * Measures one wrapped paragraph inside `box`.
   *
   * The probe reproduces the title's own type styling from `card-shell`, because
   * weight, line height and letter spacing all change where the text wraps.
   */
  const measureIn =
    (box: { width: number; height: number }) =>
    async (
      text: string,
      fontSize: number,
    ): Promise<{ width: number; height: number }> => {
      const probe =
        `<div style="width:${box.width}px;font-family:${FONT_FAMILY};` +
        `font-size:${fontSize}px;font-weight:900;line-height:1.04;` +
        `letter-spacing:-0.03em">${text}</div>`;
      const { node, stylesheets } = fromHtml(probe);
      const measured = await renderer.measure(node, {
        width: box.width,
        stylesheets,
      });
      return { width: measured.width, height: measured.height };
    };

  const ctx: OgRenderContext = {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    logoPath: logoSrc,
    fitTitle: (
      text: string,
      box: { width: number; height: number },
      opts?: FitOptions,
    ): Promise<FitResult> => fitTitle(text, box, measureIn(box), opts),
  };

  const renderPng = async (html: string): Promise<Buffer> => {
    const { node, stylesheets } = fromHtml(html);
    const buffer = await renderer.render(node, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      format: 'png',
      stylesheets,
      images: [{ src: logoSrc, data: logoData }],
    });
    return Buffer.from(buffer);
  };

  return { ctx, renderPng };
}
