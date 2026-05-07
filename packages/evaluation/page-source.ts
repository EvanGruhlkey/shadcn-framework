/**
 * Page source parser.
 *
 * The evaluator never executes a generated page; it inspects its TSX
 * source. This module extracts the structural signal we care about:
 *
 *   - The `meta` export (intent, density, category, patterns).
 *   - An ordered list of block usages (which blocks appear, in which
 *     order, and what literal copy they receive as props).
 *
 * The parser is intentionally regex-based and conservative. It will not
 * understand every TSX dialect — but it will refuse to evaluate a page it
 * cannot parse, which keeps false-pass risk low.
 */

import { readFileSync } from "node:fs";

export interface PageMeta {
  intent: string;
  density: "thin" | "balanced" | "dense";
  category: string;
  patterns: string[];
}

export interface BlockUsage {
  /** The component identifier as written in the source, e.g. `HeroSplitCode`. */
  component: string;
  /** Source character offset of the opening tag. */
  offset: number;
  /** Raw JSX text from `<` to the matching `/>` or closing tag (best effort). */
  source: string;
}

export interface ParsedPage {
  path: string;
  source: string;
  meta: PageMeta;
  blocks: BlockUsage[];
  /** Concatenated string-literal text appearing in JSX expressions. */
  literalText: string;
}

const META_REGEX = /export\s+const\s+meta\s*=\s*({[\s\S]*?})\s*as\s+const/;

const KNOWN_BLOCKS = [
  "SiteNav",
  "HeroSplitCode",
  "HeroAgentDemo",
  "HeroEnterpriseSplit",
  "LogoStripMono",
  "QuoteCardsThree",
  "FeatureGridThree",
  "FeatureGridFour",
  "FeatureDeepDive",
  "UseCaseRoleGrid",
  "PricingTierTable",
  "UsageCalculator",
  "ConversionBand",
];

export function parsePage(path: string): ParsedPage {
  const source = readFileSync(path, "utf8");

  const meta = parseMeta(source, path);
  const blocks = parseBlockUsages(source);
  const literalText = extractLiterals(source);

  return { path, source, meta, blocks, literalText };
}

function parseMeta(source: string, path: string): PageMeta {
  const match = source.match(META_REGEX);
  if (!match) {
    throw new Error(
      `[evaluation] ${path} is missing the required \`export const meta = {...} as const\` declaration.`,
    );
  }
  // The meta block is intentionally simple to keep the parser dependency-free.
  // We treat it as JSON-ish: find string fields and the patterns array.
  const body = match[1]!;

  const intent = pickString(body, "intent");
  const density = pickString(body, "density");
  const category = pickString(body, "category");
  const patterns = pickArrayOfStrings(body, "patterns");

  if (!intent || !density || !category || !patterns) {
    throw new Error(
      `[evaluation] ${path} meta export must include intent, density, category, patterns.`,
    );
  }
  if (density !== "thin" && density !== "balanced" && density !== "dense") {
    throw new Error(
      `[evaluation] ${path} meta.density must be thin|balanced|dense.`,
    );
  }
  return { intent, density, category, patterns };
}

function pickString(body: string, key: string): string | null {
  const re = new RegExp(`${key}\\s*:\\s*["\`']([^"\`']*)["\`']`);
  const m = body.match(re);
  return m ? m[1]! : null;
}

function pickArrayOfStrings(body: string, key: string): string[] | null {
  const re = new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`);
  const m = body.match(re);
  if (!m) return null;
  const list = m[1]!
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^["\`']|["\`']$/g, ""));
  return list;
}

function parseBlockUsages(source: string): BlockUsage[] {
  const usages: BlockUsage[] = [];
  for (const name of KNOWN_BLOCKS) {
    const re = new RegExp(`<${name}[\\s>]`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(source))) {
      usages.push({
        component: name,
        offset: m.index,
        source: extractElementSlice(source, m.index, name),
      });
    }
  }
  return usages.sort((a, b) => a.offset - b.offset);
}

function extractElementSlice(source: string, start: number, name: string): string {
  const closingTag = `</${name}>`;
  const closeIdx = source.indexOf(closingTag, start);
  const selfClose = source.indexOf("/>", start);
  if (closeIdx > -1 && (selfClose === -1 || closeIdx < selfClose)) {
    return source.slice(start, closeIdx + closingTag.length);
  }
  if (selfClose > -1) return source.slice(start, selfClose + 2);
  return source.slice(start, Math.min(start + 400, source.length));
}

function extractLiterals(source: string): string {
  const matches = source.match(/(["'`])(?:(?!\1).)*\1/g);
  if (!matches) return "";
  return matches
    .map((s) => s.slice(1, -1))
    .filter((s) => /[a-z]{4,}/i.test(s))
    .join(" ");
}
