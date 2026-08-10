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

// Frame geometry. TITLE_BOX is derived from these rather than written by hand,
// because a hand-written figure silently disagreed with the real layout: the
// title was measured in a box 56px wider than it actually renders in, wrapped to
// fewer lines than it really needed, and pushed the meta row out of the plate.
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const MARGIN = 28;
const PLATE_BORDER = 8;
const PLATE_PADDING = 52;
const ROW_GAP = 26;
/** Slug chip: 28px text, 7px padding, 5px border, top and bottom. */
const EYEBROW_ROW_HEIGHT = 58;
/** Chips: 32px text, 12px padding, 6px border, top and bottom. */
const META_ROW_HEIGHT = 74;

const CONTENT_WIDTH =
  CANVAS_WIDTH - 2 * MARGIN - 2 * PLATE_BORDER - 2 * PLATE_PADDING;
const CONTENT_HEIGHT =
  CANVAS_HEIGHT - 2 * MARGIN - 2 * PLATE_BORDER - 2 * PLATE_PADDING;

/**
 * The box the title occupies inside this frame, for `fitTitle`.
 *
 * Must match what the title actually renders into, or the fitted size overflows.
 */
export const TITLE_BOX = {
  width: CONTENT_WIDTH,
  height: CONTENT_HEIGHT - EYEBROW_ROW_HEIGHT - META_ROW_HEIGHT - 2 * ROW_GAP,
} as const;

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
    .dots {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#808088 3px, transparent 3.2px);
      background-size: 28px 28px;
      mask-image: linear-gradient(to bottom, #000 0, #000 80px, transparent 290px);
      -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 80px, transparent 290px);
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
    <div class="dots"></div>
    <img class="wm" src="${escapeHtml(opts.logoPath)}" />
    ${eyebrow}
    <div class="row-title"><div class="title">${escapeHtml(opts.title)}</div></div>
    <div class="row-meta">${chips}${trailing}</div>
  </div>
</div>`;
}
