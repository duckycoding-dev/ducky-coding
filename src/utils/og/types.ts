/** Measures `text` at `fontSize`, as laid out inside the caller's box. */
export type MeasureText = (
  text: string,
  fontSize: number,
) => Promise<{ width: number; height: number }>;

export interface FitOptions {
  /** Smallest size to consider before falling back to truncation. */
  minFontSize?: number;
  /** Largest size to consider. */
  maxFontSize?: number;
}

export interface FitResult {
  /** The text to render — possibly shortened. */
  text: string;
  /** Integer pixel font size. */
  fontSize: number;
  truncated: boolean;
}

/** Shared tools handed to a card kind at render time. */
export interface OgRenderContext {
  readonly width: number;
  readonly height: number;
  readonly logoPath: string;
  fitTitle(
    text: string,
    box: { width: number; height: number },
    opts?: FitOptions,
  ): Promise<FitResult>;
}

/**
 * One card type. Deliberately NOT generic — do not add a type parameter for the
 * entry. A parameterised kind leaks the entry type to the dispatch point, where a
 * registry of several kinds collapses to `unknown` and forces a cast; that is the
 * type-dependence this seam exists to remove. Keep the data closed over inside
 * the kind.
 */
export interface OgCardKind {
  /** URL segment and output directory: /og/<kind>/<id>.png */
  readonly kind: string;
  listIds(): Promise<string[]>;
  renderById(id: string, ctx: OgRenderContext): Promise<string>;
}
