/**
 * Responsiveness and accessibility static check.
 *
 * Operates on the page's TSX source. We are explicitly looking for
 * structural smells, not browser-rendered measurements:
 *
 *   - Multiple <h1>
 *   - Skipped heading levels
 *   - <img> elements missing alt
 *   - Hardcoded pixel widths exceeding the smallest viewport (375 px)
 *   - Arbitrary color values that bypass shadcn/ui CSS variables
 *
 * For runtime checks (contrast, computed touch-target sizes), see the
 * studio app — those require a browser environment.
 */

import type { CheckResult, Issue } from "../patterns/schemas/pattern-types.js";

import type { ParsedPage } from "./page-source.js";

export function checkResponsiveness(page: ParsedPage): CheckResult {
  const issues: Issue[] = [];
  const src = page.source;

  // Multiple H1.
  const h1Matches = src.match(/<\s*h1[\s>]/g) ?? [];
  if (h1Matches.length === 0) {
    issues.push({
      severity: "error",
      rule: "a11y.heading.missing-h1",
      message: "Page has no <h1>.",
    });
  } else if (h1Matches.length > 1) {
    issues.push({
      severity: "error",
      rule: "a11y.heading.multiple-h1",
      message: `Page declares ${h1Matches.length} <h1> elements; expected exactly 1.`,
    });
  }

  // Skipped heading levels (also done in coherence — kept here for the a11y bucket).
  const headingLevels = (src.match(/<\s*h([1-6])[\s>]/g) ?? []).map((s) =>
    parseInt(s.match(/[1-6]/)![0]!, 10),
  );
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i]! - headingLevels[i - 1]! > 1) {
      issues.push({
        severity: "error",
        rule: "a11y.heading.skipped-level",
        message: `Heading level jumps from h${headingLevels[i - 1]} to h${headingLevels[i]}.`,
      });
      break;
    }
  }

  // <img> missing alt.
  const imgRe = /<img\b([^>]*)>/g;
  let imgMatch: RegExpExecArray | null;
  let imgIndex = 0;
  while ((imgMatch = imgRe.exec(src))) {
    imgIndex++;
    const attrs = imgMatch[1]!;
    if (!/\balt\s*=/.test(attrs)) {
      issues.push({
        severity: "error",
        rule: "a11y.image.missing-alt",
        message: `<img> without alt attribute (#${imgIndex}).`,
      });
    }
  }

  // Hardcoded pixel widths above 375 px in className strings.
  const wPxRe = /\bw-\[(\d+)px\]/g;
  let wpxMatch: RegExpExecArray | null;
  while ((wpxMatch = wPxRe.exec(src))) {
    const px = parseInt(wpxMatch[1]!, 10);
    if (px > 375) {
      issues.push({
        severity: "error",
        rule: "responsive.viewport.overflow",
        message: `Hardcoded width w-[${px}px] exceeds the 375 px mobile baseline.`,
      });
    }
  }

  // Arbitrary color values that bypass CSS variables.
  const arbitraryColorRe =
    /\b(?:text|bg|border|ring|from|to|via)-\[(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\]/g;
  let cMatch: RegExpExecArray | null;
  while ((cMatch = arbitraryColorRe.exec(src))) {
    issues.push({
      severity: "warn",
      rule: "design.color.hardcoded",
      message: `Arbitrary color value "${cMatch[1]}" bypasses shadcn/ui CSS variables.`,
    });
  }

  // Skip-link presence (rough heuristic: an anchor with href="#main").
  if (!/href\s*=\s*["']#main["']/.test(src)) {
    issues.push({
      severity: "warn",
      rule: "a11y.skip-link.missing",
      message: 'Skip-to-content link (anchor href="#main") not detected. Recommended on every page.',
    });
  }

  // Buttons with no accessible label (empty inner text).
  const emptyButtonRe = /<button\b[^>]*>(\s*)<\/button>/g;
  if (emptyButtonRe.test(src)) {
    issues.push({
      severity: "error",
      rule: "a11y.button.empty",
      message: "Empty <button> element detected.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error");
  const score = Math.max(0, 1 - errors.length * 0.25);
  return { pass: errors.length === 0, score, issues };
}
