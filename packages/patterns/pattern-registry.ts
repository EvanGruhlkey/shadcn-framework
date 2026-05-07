/**
 * Pattern registry — the loader and validator that turns the JSON files in
 * `pattern-atlas/` into typed, in-memory `PatternAtlas` records.
 *
 * The registry is the single point at which untrusted JSON crosses into the
 * rest of the framework. Every consumer (studio app, evaluator, generation
 * agent) reads patterns through this module so that schema drift is caught
 * here, once, instead of in every downstream call site.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  isComposition,
  isDensity,
  isSectionRole,
  type Density,
  type Pattern,
  type PatternAtlas,
  type PatternVariant,
  type SectionComposition,
  type SectionRole,
} from "./schemas/pattern-types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, "..", "..");
const ATLAS_DIR = resolve(REPO_ROOT, "pattern-atlas");

export interface AtlasLoadError {
  file: string;
  field: string;
  message: string;
}

export interface AtlasLoadResult {
  atlases: Map<string, PatternAtlas>;
  errors: AtlasLoadError[];
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/** Load every atlas file in `pattern-atlas/`, validate it, and return all. */
export function loadAllAtlases(): AtlasLoadResult {
  const result: AtlasLoadResult = { atlases: new Map(), errors: [] };

  let entries: string[];
  try {
    entries = readdirSync(ATLAS_DIR);
  } catch (err) {
    result.errors.push({
      file: ATLAS_DIR,
      field: "<directory>",
      message: `Could not read pattern-atlas directory: ${(err as Error).message}`,
    });
    return result;
  }

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const file = join(ATLAS_DIR, entry);
    const parsed = parseAtlas(file, result.errors);
    if (parsed) result.atlases.set(parsed.category, parsed);
  }

  return result;
}

/** Load a single atlas by category id (e.g. `"developer-tools"`). */
export function loadAtlas(category: string): PatternAtlas | null {
  const file = join(ATLAS_DIR, `${category}.json`);
  const errors: AtlasLoadError[] = [];
  const atlas = parseAtlas(file, errors);
  if (errors.length > 0) {
    for (const e of errors) console.error(`[atlas] ${e.file} :: ${e.field} — ${e.message}`);
  }
  return atlas;
}

/** Look up a single pattern by id within an atlas. */
export function findPattern(atlas: PatternAtlas, patternId: string): Pattern | null {
  return atlas.patterns.find((p) => p.id === patternId) ?? null;
}

/** Highest-prevalence pattern for a given role. Tie-broken by `domains_seen`. */
export function dominantPatternForRole(atlas: PatternAtlas, role: SectionRole): Pattern | null {
  const candidates = atlas.patterns.filter((p) => p.role === role);
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => {
    if (b.prevalence !== a.prevalence) return b.prevalence - a.prevalence;
    return b.domains_seen - a.domains_seen;
  })[0]!;
}

/* -------------------------------------------------------------------------- */
/*  Internal: schema validation                                               */
/* -------------------------------------------------------------------------- */

function parseAtlas(file: string, errors: AtlasLoadError[]): PatternAtlas | null {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    errors.push({
      file,
      field: "<json>",
      message: `Invalid JSON: ${(err as Error).message}`,
    });
    return null;
  }

  if (typeof raw !== "object" || raw === null) {
    errors.push({ file, field: "<root>", message: "Atlas root must be an object." });
    return null;
  }

  const r = raw as Record<string, unknown>;
  const category = requireString(r, "category", file, errors);
  const summary = requireString(r, "summary", file, errors);
  const densityProfile = r["density_profile"];
  const order = r["recommended_order"];
  const patterns = r["patterns"];

  if (!isDensity(densityProfile)) {
    errors.push({ file, field: "density_profile", message: "Must be thin|balanced|dense." });
  }
  if (!Array.isArray(order) || !order.every(isSectionRole)) {
    errors.push({
      file,
      field: "recommended_order",
      message: "Must be an array of SectionRole values.",
    });
  }
  if (!Array.isArray(patterns)) {
    errors.push({ file, field: "patterns", message: "Must be an array." });
    return null;
  }

  const validatedPatterns: Pattern[] = [];
  for (let i = 0; i < patterns.length; i++) {
    const p = parsePattern(patterns[i], file, `patterns[${i}]`, errors);
    if (p) validatedPatterns.push(p);
  }

  if (errors.some((e) => e.file === file)) return null;

  return {
    category: category!,
    summary: summary!,
    density_profile: densityProfile as Density,
    recommended_order: order as SectionRole[],
    patterns: validatedPatterns,
  };
}

function parsePattern(
  raw: unknown,
  file: string,
  path: string,
  errors: AtlasLoadError[],
): Pattern | null {
  if (typeof raw !== "object" || raw === null) {
    errors.push({ file, field: path, message: "Pattern must be an object." });
    return null;
  }
  const r = raw as Record<string, unknown>;

  const id = requireString(r, "id", file, errors, path);
  const role = r["role"];
  const name = requireString(r, "name", file, errors, path);
  const summary = requireString(r, "summary", file, errors, path);
  const prevalence = requireNumber(r, "prevalence", file, errors, path);
  const domainsSeen = requireNumber(r, "domains_seen", file, errors, path);
  const composition = r["composition"];
  const density = r["density"];
  const variants = r["variants"];
  const blockRef = r["block_ref"];
  const antiExamples = r["anti_examples"] ?? [];

  if (!isSectionRole(role)) {
    errors.push({
      file,
      field: `${path}.role`,
      message: `Unknown role "${String(role)}".`,
    });
  }
  if (!isComposition(composition)) {
    errors.push({
      file,
      field: `${path}.composition`,
      message: `Unknown composition "${String(composition)}".`,
    });
  }
  if (!isDensity(density)) {
    errors.push({
      file,
      field: `${path}.density`,
      message: `Density must be thin|balanced|dense.`,
    });
  }
  if (typeof prevalence === "number" && (prevalence < 0 || prevalence > 1)) {
    errors.push({
      file,
      field: `${path}.prevalence`,
      message: `Prevalence must be in [0, 1] (got ${prevalence}).`,
    });
  }
  if (typeof domainsSeen === "number" && domainsSeen < 0) {
    errors.push({
      file,
      field: `${path}.domains_seen`,
      message: `domains_seen must be ≥ 0.`,
    });
  }
  if (blockRef !== null && typeof blockRef !== "string") {
    errors.push({
      file,
      field: `${path}.block_ref`,
      message: `block_ref must be a string or null.`,
    });
  }
  if (!Array.isArray(variants) || variants.length === 0 || variants.length > 4) {
    errors.push({
      file,
      field: `${path}.variants`,
      message: `variants must be an array of 1–4 entries.`,
    });
  }
  if (!Array.isArray(antiExamples) || !antiExamples.every((s) => typeof s === "string")) {
    errors.push({
      file,
      field: `${path}.anti_examples`,
      message: `anti_examples must be a string array.`,
    });
  }

  if (errors.some((e) => e.file === file && e.field.startsWith(path))) return null;

  return {
    id: id!,
    role: role as SectionRole,
    name: name!,
    summary: summary!,
    prevalence: prevalence as number,
    domains_seen: domainsSeen as number,
    composition: composition as SectionComposition,
    density: density as Density,
    variants: (variants as PatternVariant[]).map((v) => ({ id: v.id, summary: v.summary })),
    block_ref: blockRef as string | null,
    anti_examples: antiExamples as string[],
  };
}

function requireString(
  obj: Record<string, unknown>,
  key: string,
  file: string,
  errors: AtlasLoadError[],
  pathPrefix = "",
): string | null {
  const v = obj[key];
  if (typeof v !== "string" || v.length === 0) {
    errors.push({
      file,
      field: pathPrefix ? `${pathPrefix}.${key}` : key,
      message: `Required string is missing or empty.`,
    });
    return null;
  }
  return v;
}

function requireNumber(
  obj: Record<string, unknown>,
  key: string,
  file: string,
  errors: AtlasLoadError[],
  pathPrefix = "",
): number | null {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isFinite(v)) {
    errors.push({
      file,
      field: pathPrefix ? `${pathPrefix}.${key}` : key,
      message: `Required finite number is missing.`,
    });
    return null;
  }
  return v;
}

/* -------------------------------------------------------------------------- */
/*  CLI entry point                                                           */
/* -------------------------------------------------------------------------- */

function main(): void {
  const result = loadAllAtlases();

  console.log(`Loaded ${result.atlases.size} atlas file(s) from ${ATLAS_DIR}`);
  for (const [category, atlas] of result.atlases) {
    console.log(
      `  • ${category.padEnd(18)} ${atlas.patterns.length} patterns, density=${atlas.density_profile}`,
    );
  }

  if (result.errors.length > 0) {
    console.error(`\nFound ${result.errors.length} validation issue(s):`);
    for (const e of result.errors) {
      console.error(`  ✗ ${basename(e.file)} :: ${e.field} — ${e.message}`);
    }
    process.exit(1);
  }
}

if (isMainModule(import.meta.url)) {
  main();
}

function isMainModule(metaUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(entry).href;
}
