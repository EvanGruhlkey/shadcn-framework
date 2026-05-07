/**
 * Clone-risk check.
 *
 * Three measurements:
 *
 * 1. Token-level Jaccard similarity between the page's literal text and
 *    each observation's `notes` corpus. A score ≥ 0.35 fails.
 * 2. Section-vector cosine similarity between the page's role sequence
 *    and each observation's role sequence. A score > 0.85 fails.
 * 3. Forbidden-phrase scan across the rendered text using the list from
 *    `rules/copywriting-rules.md` §8.
 *
 * The check reports `score = 1 - max(observed similarity)` so higher is
 * better, consistent with the other CheckResult contracts.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import type {
  CheckResult,
  Issue,
  LayoutObservation,
  SectionRole,
} from "../patterns/schemas/pattern-types.js";

import type { ParsedPage } from "./page-source.js";

export const FORBIDDEN_PHRASES = [
  "revolutionize your workflow",
  "game-changing",
  "next-generation platform",
  "unleash the power of",
  "empower your team to",
  "all-in-one solution for",
];

export const TOKEN_SIMILARITY_THRESHOLD = 0.35;
export const STRUCTURAL_COSINE_THRESHOLD = 0.85;

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

export function checkCloneRisk(
  page: ParsedPage,
  observationsRoot: string,
  category: string,
): CheckResult {
  const issues: Issue[] = [];
  const dir = join(observationsRoot, category);

  // Forbidden phrases.
  const lowered = page.literalText.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowered.includes(phrase)) {
      issues.push({
        severity: "error",
        rule: "clone.copy.forbidden-phrase",
        message: `Forbidden marketing phrase detected: "${phrase}".`,
      });
    }
  }

  let maxTokenSim = 0;
  let maxStructural = 0;

  if (existsSync(dir)) {
    const pageRoles = pageSectionRoles(page);
    const pageVector = roleVector(pageRoles);
    const pageTokens = tokenize(page.literalText);

    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      const obs = JSON.parse(
        readFileSync(join(dir, file), "utf8"),
      ) as LayoutObservation;

      const obsRoles = obs.sections.map((s) => s.role);
      const cosine = cosineSimilarity(pageVector, roleVector(obsRoles));
      if (cosine > maxStructural) maxStructural = cosine;
      if (cosine > STRUCTURAL_COSINE_THRESHOLD) {
        issues.push({
          severity: "error",
          rule: "clone.layout.cosine",
          message: `Structural cosine ${cosine.toFixed(3)} exceeds threshold ${STRUCTURAL_COSINE_THRESHOLD} against ${file}.`,
          location: file,
        });
      }

      const obsText = (obs.sections.map((s) => s.notes ?? "").join(" ") || "").toLowerCase();
      if (obsText) {
        const sim = jaccard(pageTokens, tokenize(obsText));
        if (sim > maxTokenSim) maxTokenSim = sim;
        if (sim >= TOKEN_SIMILARITY_THRESHOLD) {
          issues.push({
            severity: "error",
            rule: "clone.copy.token-overlap",
            message: `Token Jaccard ${sim.toFixed(3)} ≥ ${TOKEN_SIMILARITY_THRESHOLD} against ${file}.`,
            location: file,
          });
        }
      }
    }
  } else {
    issues.push({
      severity: "info",
      rule: "clone.observations.empty",
      message: `No observations available for category="${category}". Structural and token similarity were not computed.`,
    });
  }

  const errors = issues.filter((i) => i.severity === "error");
  const score = 1 - Math.max(maxStructural, maxTokenSim);
  return { pass: errors.length === 0, score: Math.max(0, score), issues };
}

function pageSectionRoles(page: ParsedPage): SectionRole[] {
  const out: SectionRole[] = [];
  for (const b of page.blocks) {
    const r = COMPONENT_TO_ROLE[b.component];
    if (r) out.push(r);
  }
  return out;
}

function roleVector(roles: SectionRole[]): Map<SectionRole, number> {
  const v = new Map<SectionRole, number>();
  for (const r of roles) v.set(r, (v.get(r) ?? 0) + 1);
  return v;
}

function cosineSimilarity(
  a: Map<SectionRole, number>,
  b: Map<SectionRole, number>,
): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const av = a.get(k) ?? 0;
    const bv = b.get(k) ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return intersection / union;
}
