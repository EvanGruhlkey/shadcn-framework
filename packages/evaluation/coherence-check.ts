/**
 * Coherence check.
 *
 * Compares the parsed page against the design rules and the chosen atlas.
 * Every rule emitted here corresponds to a slug documented in
 * `prompts/design-evaluation.md`.
 */

import type {
  CheckResult,
  Issue,
  PatternAtlas,
  SectionRole,
} from "../patterns/schemas/pattern-types.js";

import type { ParsedPage } from "./page-source.js";

const COMPONENT_TO_ROLE: Record<string, SectionRole> = {
  SiteNav: "nav",
  HeroSplitCode: "hero",
  HeroAgentDemo: "hero",
  HeroEnterpriseSplit: "hero",
  LogoStripMono: "proof-logos",
  QuoteCardsThree: "proof-quotes",
  FeatureGridThree: "feature-system",
  FeatureGridFour: "feature-system",
  FeatureDeepDive: "feature-deep-dive",
  UseCaseRoleGrid: "use-cases",
  PricingTierTable: "pricing",
  UsageCalculator: "pricing",
  ConversionBand: "conversion",
};

export function checkCoherence(page: ParsedPage, atlas: PatternAtlas): CheckResult {
  const issues: Issue[] = [];

  const sections = page.blocks.map((b) => COMPONENT_TO_ROLE[b.component]).filter(Boolean) as SectionRole[];

  // Density: 5–8 sections (excluding nav/footer).
  const contentSections = sections.filter((r) => r !== "nav" && r !== "footer");
  if (contentSections.length < 5) {
    issues.push({
      severity: "error",
      rule: "design.density.too-thin",
      message: `Page has ${contentSections.length} content sections; minimum is 5.`,
    });
  } else if (contentSections.length > 8) {
    issues.push({
      severity: "error",
      rule: "design.density.too-dense",
      message: `Page has ${contentSections.length} content sections; maximum is 8.`,
    });
  }

  // Order: must be a subsequence of atlas.recommended_order.
  if (!isSubsequence(sections, atlas.recommended_order)) {
    issues.push({
      severity: "error",
      rule: "design.order.violation",
      message: `Section order does not respect atlas.recommended_order for category=${atlas.category}.`,
    });
  }

  // Duplicate roles: outside the explicitly-permitted ones.
  const seen = new Map<SectionRole, number>();
  for (const r of sections) seen.set(r, (seen.get(r) ?? 0) + 1);
  for (const [role, count] of seen) {
    if (count > 1 && !DUPLICATE_PERMITTED.has(role)) {
      issues.push({
        severity: "error",
        rule: "design.duplicate-role",
        message: `Role "${role}" appears ${count} times. The atlas does not permit duplication of this role.`,
      });
    }
  }

  // Heading levels: source-level scan for `h1` / `h2` / `h3` ordering.
  const headingPath = scanHeadingLevels(page.source);
  for (let i = 1; i < headingPath.length; i++) {
    if (headingPath[i]! - headingPath[i - 1]! > 1) {
      issues.push({
        severity: "error",
        rule: "design.headings.skipped-level",
        message: `Heading level jumps from h${headingPath[i - 1]} to h${headingPath[i]}.`,
      });
      break;
    }
  }

  // CTA ceiling: meta should declare patterns whose ids exist in the atlas.
  for (const id of page.meta.patterns) {
    if (!atlas.patterns.some((p) => p.id === id)) {
      issues.push({
        severity: "warn",
        rule: "design.pattern.unknown",
        message: `meta.patterns references unknown atlas pattern "${id}".`,
      });
    }
  }

  return scoreFromIssues(issues);
}

const DUPLICATE_PERMITTED = new Set<SectionRole>(["feature-system", "feature-deep-dive"]);

function isSubsequence(seq: SectionRole[], canonical: SectionRole[]): boolean {
  let i = 0;
  for (const role of seq) {
    while (i < canonical.length && canonical[i] !== role) i++;
    if (i >= canonical.length) return false;
    i++;
  }
  return true;
}

function scanHeadingLevels(source: string): number[] {
  const re = /<\s*h([1-6])[\s>]/g;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) out.push(parseInt(m[1]!, 10));
  return out;
}

export function scoreFromIssues(issues: Issue[]): CheckResult {
  const errors = issues.filter((i) => i.severity === "error");
  const score = Math.max(0, 1 - errors.length * 0.25);
  return { pass: errors.length === 0, score, issues };
}
