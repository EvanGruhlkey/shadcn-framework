/**
 * Evaluator entry point.
 *
 * Usage:
 *   tsx packages/evaluation/evaluate-page.ts <path-to-generated-page.tsx>
 *
 * Loads the page, the matching pattern atlas, and the per-category
 * observations directory, runs three checks, and prints a structured
 * PageEvaluation report. Exits non-zero if any check fails so the
 * evaluator can gate CI.
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadAtlas } from "../patterns/pattern-registry.js";
import type { PageEvaluation } from "../patterns/schemas/pattern-types.js";

import { parsePage } from "./page-source.js";
import { checkCoherence } from "./coherence-check.js";
import { checkCloneRisk } from "./clone-risk-check.js";
import { checkResponsiveness } from "./responsiveness-check.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const OBSERVATIONS_ROOT = resolve(REPO_ROOT, "datasets", "observations");

function parseArgs(argv: string[]): { pagePath: string } {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const pagePath = positional[0];
  if (!pagePath) {
    console.error("Usage: tsx evaluate-page.ts <path-to-generated-page.tsx>");
    process.exit(2);
  }
  return { pagePath: resolve(pagePath) };
}

function main(): void {
  const { pagePath } = parseArgs(process.argv.slice(2));
  const page = parsePage(pagePath);

  const atlas = loadAtlas(page.meta.category);
  if (!atlas) {
    console.error(
      `[evaluation] no atlas for category="${page.meta.category}". Ensure pattern-atlas/${page.meta.category}.json exists and validates.`,
    );
    process.exit(1);
  }

  const coherence = checkCoherence(page, atlas);
  const cloneRisk = checkCloneRisk(page, OBSERVATIONS_ROOT, page.meta.category);
  const responsiveness = checkResponsiveness(page);

  const report: PageEvaluation = {
    page: pagePath,
    pass: coherence.pass && cloneRisk.pass && responsiveness.pass,
    checks: { coherence, clone_risk: cloneRisk, responsiveness },
    generated_at: new Date().toISOString(),
  };

  printReport(report);
  process.exit(report.pass ? 0 : 1);
}

function printReport(report: PageEvaluation): void {
  const symbol = (pass: boolean) => (pass ? "✓" : "✗");
  console.log(`\n${symbol(report.pass)} ${report.page}\n`);
  for (const [name, check] of Object.entries(report.checks)) {
    console.log(
      `  ${symbol(check.pass)} ${name.padEnd(16)} score=${check.score.toFixed(2)} issues=${check.issues.length}`,
    );
    for (const issue of check.issues) {
      const tag = issue.severity.padEnd(5);
      const loc = issue.location ? ` [${issue.location}]` : "";
      console.log(`      ${tag} ${issue.rule}: ${issue.message}${loc}`);
    }
  }
  console.log("");
  console.log(JSON.stringify(report, null, 2));
}

if (isMainModule(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

function isMainModule(metaUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(entry).href;
}

export { parsePage, checkCoherence, checkCloneRisk, checkResponsiveness };
