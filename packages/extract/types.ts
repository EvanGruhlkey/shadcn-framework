/**
 * Types for the design-system extraction pipeline.
 *
 * Shape of the run:
 *
 *   URLs ──▶ capture ──▶ RawTokens (per site) ──▶ synthesize ──▶ DesignSystem ──▶ emit
 *
 * Every record is plain data and JSON-serializable. The synthesizer is a
 * pure function over `RawTokens[]`, which makes it easy to test and to
 * re-run with different tuning without recapturing.
 */

/* -------------------------------------------------------------------------- */
/*  Raw tokens (per page, harvested from the live DOM)                        */
/* -------------------------------------------------------------------------- */

export interface ColorObservation {
  /** Hex RGB ("#0a0a0a"). Alpha is folded into the area weight. */
  hex: string;
  /** Where the color was found. */
  role: "text" | "background" | "border" | "shadow";
  /** Effective area in CSS pixels² (text uses font-size² × char count proxy). */
  area: number;
}

export interface TypographyObservation {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  /** Effective line-height in px. */
  lineHeight: number;
  /** Letter-spacing in px. */
  letterSpacing: number;
  /** Number of distinct text nodes seen with this style. */
  count: number;
}

export interface SpacingObservation {
  /** "padding" | "gap" | "margin". */
  axis: "padding" | "gap" | "margin";
  /** Computed value in px. */
  px: number;
  /** How often this value appears across the page. */
  count: number;
}

export interface RadiusObservation {
  px: number;
  count: number;
}

export interface ShadowObservation {
  /** Verbatim computed box-shadow string. Used to derive 1–3 representative stops. */
  value: string;
  count: number;
}

export interface RawTokens {
  url: string;
  capturedAt: string;
  viewport: { width: number; height: number };
  colors: ColorObservation[];
  typography: TypographyObservation[];
  spacing: SpacingObservation[];
  radii: RadiusObservation[];
  shadows: ShadowObservation[];
  /**
   * Container width signal: the largest layout-dominating block width
   * observed (used to derive the recommended max-w container).
   */
  dominantContainerPx: number | null;
}

/* -------------------------------------------------------------------------- */
/*  Synthesized design system                                                 */
/* -------------------------------------------------------------------------- */

export interface ColorRamp {
  /** Hex value, e.g. "#0f0f10". */
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface TypeScale {
  /** Recommended sans family (verbatim if open-source; substitute if proprietary). */
  fontSans: string;
  /** Recommended mono family. */
  fontMono: string;
  /** Whether the sans family was substituted because the source was proprietary. */
  fontSansSubstituted: boolean;
  /** Whether the mono family was substituted because the source was proprietary. */
  fontMonoSubstituted: boolean;
  /** Body base font-size (px). All other steps are derived from this. */
  basePx: number;
  /** Computed scale ratio between consecutive steps. */
  scaleRatio: number;
  /** Concrete pixel sizes per step, in ascending order. */
  steps: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
    "4xl": number;
    "5xl": number;
    "6xl": number;
  };
  /** Body line-height as a unitless ratio. */
  bodyLineHeight: number;
  /** Heading line-height as a unitless ratio. */
  headingLineHeight: number;
  /** Body letter-spacing in em (negative for tighter). */
  bodyLetterSpacingEm: number;
}

export interface SpacingScale {
  /** The scale's base unit in px (typically 4). */
  basePx: number;
  /** Concrete steps in px. */
  steps: number[];
  /** Recommended max-content width in px. */
  containerPx: number;
}

export interface RadiusScale {
  /** Base radius in px (used for shadcn's `--radius`). */
  basePx: number;
}

export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
}

export interface DesignSystem {
  /** Run identifier (timestamp-based). */
  runId: string;
  /** Sites the system was inspired by. Used for attribution in REPORT.md. */
  sources: Array<{ url: string; capturedAt: string }>;
  light: ColorRamp;
  dark: ColorRamp;
  typography: TypeScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  shadows: ShadowScale;
  /**
   * Notes the synthesizer wants surfaced in the report. Each note is a
   * factual statement, not a recommendation.
   */
  notes: string[];
}

/* -------------------------------------------------------------------------- */
/*  Run summary                                                               */
/* -------------------------------------------------------------------------- */

export interface SiteCapture {
  url: string;
  host: string;
  capturedAt: string;
  screenshotPath: string;
  rawTokensPath: string;
  status: "ok" | "skipped" | "failed";
  reason?: string;
}

export interface ExtractionRun {
  runId: string;
  startedAt: string;
  finishedAt: string;
  outputDir: string;
  captures: SiteCapture[];
  designSystem: DesignSystem | null;
}
