/**
 * Heuristic section classifier.
 *
 * Given a list of sections with bounding boxes, density estimates, and
 * media kind, this module assigns or refines `role` labels using rules
 * derived from the pattern atlas. It does not look at pixels.
 *
 * The classifier is intentionally simple and deterministic. It is meant to
 * (a) sanity-check a vision provider's output and
 * (b) produce a "first guess" labeling for an analyst to review.
 *
 * Where a rule conflicts with the provider's label, we surface the conflict
 * in a `ClassificationDiff` rather than silently overwriting.
 */

import type {
  SectionObservation,
  SectionRole,
} from "../patterns/schemas/pattern-types.js";

export interface ClassificationDiff {
  section_id: string;
  predicted: SectionRole;
  given: SectionRole;
  rule: string;
}

/**
 * Apply role rules to a sorted-by-y array of sections. Returns the diffs
 * between the rule-derived label and the section's own `role`.
 */
export function classifySections(sections: SectionObservation[]): ClassificationDiff[] {
  const diffs: ClassificationDiff[] = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]!;
    const predicted = predictRole(s, i, sections);
    if (predicted && predicted !== s.role) {
      diffs.push({
        section_id: s.id,
        predicted,
        given: s.role,
        rule: roleRuleFor(predicted, i, sections),
      });
    }
  }
  return diffs;
}

function predictRole(
  s: SectionObservation,
  index: number,
  all: SectionObservation[],
): SectionRole | null {
  // First section near the top with low height is almost always nav.
  if (index === 0 && s.bbox_norm[1] < 0.05 && s.bbox_norm[3] < 0.08) {
    return "nav";
  }

  // Last section near the bottom with low height is almost always footer.
  if (index === all.length - 1 && s.bbox_norm[1] > 0.85 && s.bbox_norm[3] < 0.15) {
    return "footer";
  }

  // The first sizeable section after nav is the hero.
  if (index <= 1 && s.bbox_norm[3] > 0.2) {
    return "hero";
  }

  // A logo-strip media kind is a strong signal.
  if (s.media_kind === "logo-strip") {
    return "proof-logos";
  }

  // A thin section directly under the hero with no CTAs and no text density
  // is most likely a proof-logos band even if media_kind is misclassified.
  if (
    index === 2 &&
    s.density === "thin" &&
    s.cta_count === 0 &&
    s.bbox_norm[3] < 0.12
  ) {
    return "proof-logos";
  }

  // A dense section near the bottom with ≥ 1 CTA is almost always conversion.
  if (
    index >= all.length - 3 &&
    s.cta_count >= 1 &&
    s.bbox_norm[3] < 0.25 &&
    s.composition === "single-column"
  ) {
    return "conversion";
  }

  return null;
}

function roleRuleFor(
  role: SectionRole,
  index: number,
  all: SectionObservation[],
): string {
  switch (role) {
    case "nav":
      return "rule.position.first-and-thin";
    case "footer":
      return "rule.position.last-and-thin";
    case "hero":
      return "rule.position.first-tall-section";
    case "proof-logos":
      return "rule.media.logo-strip-or-thin-band";
    case "conversion":
      return "rule.position.late-with-cta";
    default:
      return `rule.derived.${role}.at_${index}_of_${all.length}`;
  }
}
