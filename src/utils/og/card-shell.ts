import { escapeHtml } from './escape-html.ts';

export interface CardChip {
  label: string;
  tone: 'accent' | 'accent2' | 'accent3';
}

export interface CardShellOptions {
  /** Small chip above the title. Omitted when absent. */
  eyebrow?: string;
  title: string;
  /** Size resolved by `fitTitle` against `TITLE_BOX`. */
  titleFontSize: number;
  chips: CardChip[];
  /** Plain text at the end of the meta row. Omitted when absent. */
  trailing?: string;
  /** Absolute path of the watermark image. */
  logoPath: string;
  width: number;
  height: number;
}

const TONE_COLOURS: Record<CardChip['tone'], string> = {
  accent: '#ff3de9',
  accent2: '#3de9ff',
  accent3: '#e9ff3d',
};

/**
 * The box the title occupies inside this frame, for `fitTitle`.
 *
 * 1200 − 2×28 margin − 2×8 border − 2×52 padding = 1080 wide.
 * 630 − 2×28 − 2×8 − 2×52 = 510 tall, less the eyebrow row (~58), the meta row
 * (~74) and two 26px gaps = 326.
 */
export const TITLE_BOX = { width: 1080, height: 326 } as const;

/**
 * Draws the approved neo-brutalist plate frame.
 *
 * This is a helper, not a contract: a card kind may call it, call it with
 * different options, or emit entirely different HTML. Nothing about posts is
 * known here — if a test of this file ever needs post data, the seam has leaked.
 */
export function renderCardShell(opts: CardShellOptions): string {
  const chips = opts.chips
    .map(
      (chip) =>
        `<span class="chip" style="background:${TONE_COLOURS[chip.tone]}">${escapeHtml(chip.label)}</span>`,
    )
    .join('');

  const eyebrow =
    opts.eyebrow === undefined
      ? ''
      : `<div class="row-top"><span class="slug">${escapeHtml(opts.eyebrow)}</span></div>`;

  const trailing =
    opts.trailing === undefined
      ? ''
      : `<span class="rt">${escapeHtml(opts.trailing)}</span>`;

  return `<div class="card">
  <style>
    .card {
      width: ${opts.width}px;
      height: ${opts.height}px;
      padding: 28px;
      background: #ccf9ff;
      font-family: Inter;
      color: #00020a;
      display: flex;
    }
    .plate {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #ffffff;
      border: 8px solid #00020a;
      box-shadow: 12px 12px 0 0 #00020a;
      padding: 52px;
      display: flex;
      flex-direction: column;
      gap: 26px;
    }
    .wm {
      position: absolute;
      right: -85px;
      bottom: -105px;
      width: 400px;
      height: 400px;
      opacity: 0.16;
    }
    .row-top { display: flex; }
    .slug {
      background: #e9ff3d;
      border: 5px solid #00020a;
      padding: 7px 16px;
      font-size: 28px;
      font-weight: 700;
    }
    .row-title { flex: 1; display: flex; align-items: center; }
    .title {
      font-size: ${opts.titleFontSize}px;
      font-weight: 900;
      line-height: 1.04;
      letter-spacing: -0.03em;
    }
    .row-meta { display: flex; align-items: center; gap: 18px; }
    .chip {
      border: 6px solid #00020a;
      box-shadow: 8px 8px 0 0 #00020a;
      padding: 12px 28px;
      font-size: 32px;
      font-weight: 800;
    }
    .rt { font-size: 30px; font-weight: 800; }
  </style>
  <div class="plate">
    <img class="wm" src="${escapeHtml(opts.logoPath)}" />
    ${eyebrow}
    <div class="row-title"><div class="title">${escapeHtml(opts.title)}</div></div>
    <div class="row-meta">${chips}${trailing}</div>
  </div>
</div>`;
}
