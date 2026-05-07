/**
 * Core typed schema for the pattern atlas, capture manifests, and observation
 * records. Every artifact in this framework — JSON, generated TSX page meta,
 * evaluator report — eventually flows through one of the types below.
 *
 * These types are intentionally narrow. They double as documentation: any
 * field that is not declared here is not part of the framework's contract.
 */

/* -------------------------------------------------------------------------- */
/*  Section taxonomy                                                          */
/* -------------------------------------------------------------------------- */

export const SECTION_ROLES = [
  "nav",
  "hero",
  "proof-logos",
  "proof-quotes",
  "feature-system",
  "feature-deep-dive",
  "use-cases",
  "metrics",
  "integrations",
  "pricing",
  "conversion",
  "faq",
  "footer",
] as const;

export type SectionRole = (typeof SECTION_ROLES)[number];

export const SECTION_COMPOSITIONS = [
  "single-column",
  "two-column",
  "three-column",
  "grid-3",
  "grid-4",
  "card-row",
  "split-media",
  "editorial",
] as const;

export type SectionComposition = (typeof SECTION_COMPOSITIONS)[number];

export const DENSITY = ["thin", "balanced", "dense"] as const;
export type Density = (typeof DENSITY)[number];

export const MEDIA_KINDS = [
  "none",
  "screenshot-mockup",
  "illustration",
  "photo",
  "logo-strip",
] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

/* -------------------------------------------------------------------------- */
/*  Capture manifests                                                         */
/* -------------------------------------------------------------------------- */

export interface CapturePolicy {
  respect_robots_txt: boolean;
  max_requests_per_domain_per_minute: number;
  store_html: false;
  store_assets: false;
}

export interface SiteManifestEntry {
  host: string;
  url: string;
  tags: string[];
  notes?: string;
}

export interface SiteManifest {
  $schema?: string;
  corpus: string;
  summary: string;
  category: string;
  policy: CapturePolicy;
  viewports: Array<"desktop" | "tablet" | "mobile">;
  sites: SiteManifestEntry[];
}

/* -------------------------------------------------------------------------- */
/*  Observations (one per captured screenshot)                                */
/* -------------------------------------------------------------------------- */

export interface SectionObservation {
  id: string;
  role: SectionRole;
  /** Normalized [x, y, w, h] in 0–1 of the screenshot. */
  bbox_norm: [number, number, number, number];
  composition: SectionComposition;
  density: Density;
  cta_count: number;
  media_kind: MediaKind;
  notes?: string;
}

export interface LayoutObservation {
  observation_id: string;
  source: { url: string; corpus: string; captured_at: string };
  viewport: { width: number; height: number; device_scale: number };
  density: Density;
  sections: SectionObservation[];
}

/* -------------------------------------------------------------------------- */
/*  Patterns and the atlas                                                    */
/* -------------------------------------------------------------------------- */

export interface PatternVariant {
  id: string;
  summary: string;
}

export interface Pattern {
  id: string;
  role: SectionRole;
  name: string;
  summary: string;
  prevalence: number;
  domains_seen: number;
  composition: SectionComposition;
  density: Density;
  variants: PatternVariant[];
  block_ref: string | null;
  anti_examples: string[];
}

export interface PatternAtlas {
  $schema?: string;
  category: string;
  summary: string;
  density_profile: Density;
  recommended_order: SectionRole[];
  patterns: Pattern[];
}

/* -------------------------------------------------------------------------- */
/*  Evaluation                                                                */
/* -------------------------------------------------------------------------- */

export type IssueSeverity = "info" | "warn" | "error";

export interface Issue {
  severity: IssueSeverity;
  rule: string;
  message: string;
  location?: string;
}

export interface CheckResult {
  pass: boolean;
  /** 0–1, higher is better. clone_risk reports `1 - similarity`. */
  score: number;
  issues: Issue[];
}

export interface PageEvaluation {
  page: string;
  pass: boolean;
  checks: {
    coherence: CheckResult;
    clone_risk: CheckResult;
    responsiveness: CheckResult;
  };
  generated_at: string;
}

/* -------------------------------------------------------------------------- */
/*  Type guards                                                               */
/* -------------------------------------------------------------------------- */

export function isSectionRole(value: unknown): value is SectionRole {
  return typeof value === "string" && (SECTION_ROLES as readonly string[]).includes(value);
}

export function isDensity(value: unknown): value is Density {
  return typeof value === "string" && (DENSITY as readonly string[]).includes(value);
}

export function isComposition(value: unknown): value is SectionComposition {
  return (
    typeof value === "string" && (SECTION_COMPOSITIONS as readonly string[]).includes(value)
  );
}
