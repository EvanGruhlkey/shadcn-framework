/**
 * Synthesizer.
 *
 * Pure function from raw per-site observations → a single normalized,
 * shadcn-compatible DesignSystem. The synthesizer never copies a value
 * from a single source verbatim; it clusters across all sites, picks
 * representative anchors, and derives the rest of the system by rule.
 *
 * Each step is small and inspectable so it's easy to tune.
 */

import type {
  ColorObservation,
  ColorRamp,
  DesignSystem,
  RadiusScale,
  RawTokens,
  ShadowScale,
  SpacingScale,
  TypeScale,
} from "./types.js";

/* -------------------------------------------------------------------------- */
/*  Public entry                                                              */
/* -------------------------------------------------------------------------- */

export interface SynthesizeOptions {
  runId: string;
  sources: Array<{ url: string; capturedAt: string }>;
}

export function synthesize(rawList: RawTokens[], opts: SynthesizeOptions): DesignSystem {
  const allColors = rawList.flatMap((r) => r.colors);
  const allType = rawList.flatMap((r) => r.typography);
  const allSpacing = rawList.flatMap((r) => r.spacing);
  const allRadii = rawList.flatMap((r) => r.radii);
  const containers = rawList
    .map((r) => r.dominantContainerPx)
    .filter((v): v is number => v !== null);

  const palette = synthesizePalette(allColors);
  const typography = synthesizeTypography(allType);
  const spacing = synthesizeSpacing(allSpacing, containers);
  const radius = synthesizeRadius(allRadii);
  const shadows = synthesizeShadows();

  const notes: string[] = [];
  if (typography.fontSansSubstituted) {
    notes.push(
      `The most common sans family observed appeared to be proprietary; substituted with ${typography.fontSans}, an open-source alternative with similar metrics.`,
    );
  }
  if (typography.fontMonoSubstituted) {
    notes.push(
      `The most common mono family observed appeared to be proprietary; substituted with ${typography.fontMono}.`,
    );
  }
  if (containers.length > 0) {
    notes.push(
      `Container width ${spacing.containerPx}px chosen as the median of ${containers.length} dominant block widths across the corpus.`,
    );
  }

  return {
    runId: opts.runId,
    sources: opts.sources,
    light: palette.light,
    dark: palette.dark,
    typography,
    spacing,
    radius,
    shadows,
    notes,
  };
}

/* -------------------------------------------------------------------------- */
/*  Color synthesis                                                           */
/* -------------------------------------------------------------------------- */

interface ColorWithHsl {
  hex: string;
  role: ColorObservation["role"];
  area: number;
  h: number;
  s: number;
  l: number;
}

function synthesizePalette(observations: ColorObservation[]): {
  light: ColorRamp;
  dark: ColorRamp;
} {
  const enriched: ColorWithHsl[] = observations
    .map((o) => {
      const hsl = hexToHsl(o.hex);
      if (!hsl) return null;
      return { ...o, ...hsl };
    })
    .filter((v): v is ColorWithHsl => v !== null);

  const backgrounds = enriched.filter((c) => c.role === "background");
  const texts = enriched.filter((c) => c.role === "text");

  // Pick the lightest abundant background and the darkest abundant text.
  const background = pickByAreaAndExtreme(backgrounds, "lightest") ?? "#ffffff";
  const foreground = pickByAreaAndExtreme(texts, "darkest") ?? "#0a0a0a";

  // Find the most-used non-grayscale color across text and background.
  const accentCandidates = enriched.filter((c) => c.s > 0.18);
  const accentHsl = dominantByArea(accentCandidates);
  const primary = accentHsl
    ? hslToHex({ h: accentHsl.h, s: clamp(accentHsl.s, 0.4, 0.85), l: 0.42 })
    : foreground;
  const primaryForeground = pickReadableForeground(primary);

  // Light theme: derive everything from background + foreground anchors.
  const light = deriveLightRamp(background, foreground, primary, primaryForeground);

  // Dark theme: invert the lightness anchors.
  const darkBg = "#0a0a0c";
  const darkFg = "#fafafa";
  const dark = deriveDarkRamp(darkBg, darkFg, primary, primaryForeground);

  return { light, dark };
}

function deriveLightRamp(
  background: string,
  foreground: string,
  primary: string,
  primaryForeground: string,
): ColorRamp {
  const fgHsl = hexToHsl(foreground)!;
  return {
    background,
    foreground,
    card: background,
    cardForeground: foreground,
    popover: background,
    popoverForeground: foreground,
    primary,
    primaryForeground,
    secondary: shiftLightness(background, -0.04),
    secondaryForeground: foreground,
    muted: shiftLightness(background, -0.04),
    mutedForeground: hslToHex({ h: fgHsl.h, s: 0.05, l: 0.42 }),
    accent: shiftLightness(background, -0.04),
    accentForeground: foreground,
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: shiftLightness(background, -0.10),
    input: shiftLightness(background, -0.10),
    ring: foreground,
  };
}

function deriveDarkRamp(
  background: string,
  foreground: string,
  primary: string,
  primaryForeground: string,
): ColorRamp {
  const fgHsl = hexToHsl(foreground)!;
  return {
    background,
    foreground,
    card: shiftLightness(background, 0.03),
    cardForeground: foreground,
    popover: shiftLightness(background, 0.03),
    popoverForeground: foreground,
    primary: foreground,
    primaryForeground: background,
    secondary: shiftLightness(background, 0.06),
    secondaryForeground: foreground,
    muted: shiftLightness(background, 0.06),
    mutedForeground: hslToHex({ h: fgHsl.h, s: 0.05, l: 0.65 }),
    accent: shiftLightness(background, 0.08),
    accentForeground: foreground,
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: shiftLightness(background, 0.10),
    input: shiftLightness(background, 0.10),
    ring: foreground,
  };
}

/* -------------------------------------------------------------------------- */
/*  Typography synthesis                                                      */
/* -------------------------------------------------------------------------- */

const PROPRIETARY_FAMILIES = new Set(
  [
    "sf pro display",
    "sf pro text",
    "sf pro",
    "sohne",
    "söhne",
    "circular",
    "ginto",
    "graphik",
    "tiempos",
    "matter",
    "founders grotesk",
    "monument grotesk",
    "neue haas grotesk",
    "neue haas unica",
    "ibm plex sans",
  ].map((s) => s.toLowerCase()),
);

const SUBSTITUTE_SANS = "Inter";
const SUBSTITUTE_MONO = "JetBrains Mono";

function synthesizeTypography(observations: RawTokens["typography"]): TypeScale {
  if (observations.length === 0) return defaultTypography();

  // Family selection, weighted by observed character count.
  const familyScores = new Map<string, number>();
  let monoScore = 0;
  let monoFamily: string | null = null;
  for (const o of observations) {
    const fam = o.fontFamily;
    const isMono =
      /mono|code|courier|menlo|consolas|cascadia|fira code|jetbrains/i.test(fam);
    if (isMono) {
      if (o.count > monoScore) {
        monoScore = o.count;
        monoFamily = fam;
      }
    } else {
      familyScores.set(fam, (familyScores.get(fam) ?? 0) + o.count);
    }
  }
  let topSans = "system-ui";
  let topSansScore = 0;
  for (const [fam, score] of familyScores) {
    if (score > topSansScore) {
      topSans = fam;
      topSansScore = score;
    }
  }

  const sansSubstituted = PROPRIETARY_FAMILIES.has(topSans.toLowerCase());
  const fontSans = sansSubstituted ? SUBSTITUTE_SANS : topSans;
  const monoSubstituted =
    monoFamily !== null && PROPRIETARY_FAMILIES.has(monoFamily.toLowerCase());
  const fontMono = monoFamily ? (monoSubstituted ? SUBSTITUTE_MONO : monoFamily) : SUBSTITUTE_MONO;

  // Body base size: count-weighted mode of font-sizes between 13 and 19 px.
  const bodyCandidates = observations.filter((o) => o.fontSize >= 13 && o.fontSize <= 19);
  const baseSizeBucket = new Map<number, number>();
  for (const o of bodyCandidates) {
    baseSizeBucket.set(o.fontSize, (baseSizeBucket.get(o.fontSize) ?? 0) + o.count);
  }
  let basePx = 16;
  let bestScore = 0;
  for (const [size, score] of baseSizeBucket) {
    if (score > bestScore) {
      basePx = size;
      bestScore = score;
    }
  }

  // Display size: largest fontSize seen with count > 0 and area significance.
  const headingCandidates = observations.filter((o) => o.fontSize >= 32);
  const display = headingCandidates.length > 0
    ? Math.max(...headingCandidates.map((o) => o.fontSize))
    : basePx * 4;

  // Solve scale ratio so basePx * r^7 ≈ display (we span xs..6xl, that's 9 steps;
  // body sits at index 2 (base), display at index 9 => r^7 = display/base).
  const scaleRatio = clamp(Math.pow(display / basePx, 1 / 7), 1.15, 1.35);

  const stepFromIndex = (i: number) => Math.round(basePx * Math.pow(scaleRatio, i));

  const steps = {
    xs: stepFromIndex(-2),
    sm: stepFromIndex(-1),
    base: basePx,
    lg: stepFromIndex(1),
    xl: stepFromIndex(2),
    "2xl": stepFromIndex(3),
    "3xl": stepFromIndex(4),
    "4xl": stepFromIndex(5),
    "5xl": stepFromIndex(6),
    "6xl": stepFromIndex(7),
  };

  // Body line-height: weighted average ratio for body-sized observations.
  let bodyLhWeighted = 0;
  let bodyLhWeight = 0;
  for (const o of bodyCandidates) {
    if (o.fontSize > 0) {
      bodyLhWeighted += (o.lineHeight / o.fontSize) * o.count;
      bodyLhWeight += o.count;
    }
  }
  const bodyLineHeight = bodyLhWeight > 0 ? round2(bodyLhWeighted / bodyLhWeight) : 1.55;

  // Heading line-height: tighter
  const headingLineHeight = round2(clamp(bodyLineHeight - 0.4, 1.05, 1.25));

  // Body letter-spacing in em.
  let lsWeighted = 0;
  let lsWeight = 0;
  for (const o of bodyCandidates) {
    if (o.fontSize > 0) {
      lsWeighted += (o.letterSpacing / o.fontSize) * o.count;
      lsWeight += o.count;
    }
  }
  const bodyLetterSpacingEm = lsWeight > 0 ? round3(lsWeighted / lsWeight) : 0;

  return {
    fontSans,
    fontMono,
    fontSansSubstituted: sansSubstituted,
    fontMonoSubstituted: monoSubstituted,
    basePx,
    scaleRatio: round3(scaleRatio),
    steps,
    bodyLineHeight,
    headingLineHeight,
    bodyLetterSpacingEm,
  };
}

function defaultTypography(): TypeScale {
  return {
    fontSans: SUBSTITUTE_SANS,
    fontMono: SUBSTITUTE_MONO,
    fontSansSubstituted: false,
    fontMonoSubstituted: false,
    basePx: 16,
    scaleRatio: 1.25,
    steps: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
      "6xl": 60,
    },
    bodyLineHeight: 1.55,
    headingLineHeight: 1.15,
    bodyLetterSpacingEm: 0,
  };
}

/* -------------------------------------------------------------------------- */
/*  Spacing                                                                   */
/* -------------------------------------------------------------------------- */

function synthesizeSpacing(
  observations: RawTokens["spacing"],
  containers: number[],
): SpacingScale {
  // Snap every observed value to the nearest 4 px, count weighted, take the
  // top buckets, sort, dedupe.
  const buckets = new Map<number, number>();
  for (const o of observations) {
    const snapped = Math.round(o.px / 4) * 4;
    if (snapped < 4 || snapped > 192) continue;
    buckets.set(snapped, (buckets.get(snapped) ?? 0) + o.count);
  }
  const sortedSteps = Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([px]) => px)
    .sort((a, b) => a - b);

  const steps = sortedSteps.length > 0 ? sortedSteps : [4, 8, 12, 16, 24, 32, 48, 64, 96];

  const containerPx =
    containers.length > 0 ? Math.round(median(containers) / 8) * 8 : 1152;

  return { basePx: 4, steps, containerPx };
}

/* -------------------------------------------------------------------------- */
/*  Radius and shadows                                                        */
/* -------------------------------------------------------------------------- */

function synthesizeRadius(observations: RawTokens["radii"]): RadiusScale {
  if (observations.length === 0) return { basePx: 10 };
  const buckets = new Map<number, number>();
  for (const o of observations) {
    const snapped = Math.round(o.px / 2) * 2;
    if (snapped <= 0) continue;
    buckets.set(snapped, (buckets.get(snapped) ?? 0) + o.count);
  }
  let bestPx = 10;
  let bestScore = 0;
  for (const [px, count] of buckets) {
    if (px < 4 || px > 24) continue;
    if (count > bestScore) {
      bestScore = count;
      bestPx = px;
    }
  }
  return { basePx: bestPx };
}

function synthesizeShadows(): ShadowScale {
  // Shadow synthesis: generic but tasteful three-stop scale derived from
  // shadcn defaults. We avoid copying any specific site's exact stack.
  return {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
    md: "0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
    lg: "0 12px 32px -8px rgb(0 0 0 / 0.12), 0 4px 12px -4px rgb(0 0 0 / 0.06)",
  };
}

/* -------------------------------------------------------------------------- */
/*  Color helpers                                                             */
/* -------------------------------------------------------------------------- */

function pickByAreaAndExtreme(
  candidates: ColorWithHsl[],
  extreme: "lightest" | "darkest",
): string | null {
  if (candidates.length === 0) return null;
  // Aggregate area by hex.
  const agg = new Map<string, ColorWithHsl>();
  for (const c of candidates) {
    const existing = agg.get(c.hex);
    if (existing) existing.area += c.area;
    else agg.set(c.hex, { ...c });
  }
  // Drop colors that are too rare (< 1% of total area).
  const total = Array.from(agg.values()).reduce((s, c) => s + c.area, 0);
  const abundant = Array.from(agg.values()).filter((c) => c.area >= total * 0.01);
  if (abundant.length === 0) return null;
  abundant.sort((a, b) =>
    extreme === "lightest" ? b.l - a.l : a.l - b.l,
  );
  return abundant[0]!.hex;
}

function dominantByArea(candidates: ColorWithHsl[]): { h: number; s: number; l: number } | null {
  if (candidates.length === 0) return null;
  // Cluster by 30-degree hue buckets.
  const buckets = new Map<number, { weight: number; h: number; s: number; l: number }>();
  for (const c of candidates) {
    const bucket = Math.round(c.h / 30) * 30;
    const existing = buckets.get(bucket);
    if (existing) {
      existing.weight += c.area;
      existing.h = (existing.h + c.h) / 2;
      existing.s = (existing.s + c.s) / 2;
      existing.l = (existing.l + c.l) / 2;
    } else {
      buckets.set(bucket, { weight: c.area, h: c.h, s: c.s, l: c.l });
    }
  }
  let best: { weight: number; h: number; s: number; l: number } | null = null;
  for (const v of buckets.values()) {
    if (!best || v.weight > best.weight) best = v;
  }
  return best ? { h: best.h, s: best.s, l: best.l } : null;
}

function pickReadableForeground(hex: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return "#ffffff";
  return hsl.l < 0.5 ? "#ffffff" : "#0a0a0a";
}

function shiftLightness(hex: string, delta: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + delta, 0, 1) });
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const num = parseInt(m[1]!, 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
    }
  }
  return { h, s, l };
}

function hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/* -------------------------------------------------------------------------- */
/*  Tiny helpers                                                              */
/* -------------------------------------------------------------------------- */

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}
