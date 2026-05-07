/**
 * Analysis orchestrator.
 *
 * Reads the per-corpus capture index produced by `packages/capture`,
 * delegates each screenshot to a configured analysis provider to obtain
 * a raw `LayoutObservation`, normalizes the result, classifies sections
 * heuristically, and writes the validated record to
 * `datasets/observations/<corpus>/<host>.<viewport>.json`.
 *
 * Providers are chosen by environment variable to keep the framework
 * provider-agnostic:
 *
 *   ANALYSIS_PROVIDER=stub      (default; emits a skeleton observation)
 *   ANALYSIS_PROVIDER=manual    (asks the operator to paste JSON)
 *   ANALYSIS_PROVIDER=external  (reads from a sibling .observation.json
 *                                file co-located with the capture; useful
 *                                for piping in vision-model output)
 *
 * The orchestrator is deliberately ignorant of any specific vision model.
 * Adding a new provider is a single function — see `loadProvider`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { classifySections } from "./classify-sections.js";
import { normalizeObservation, ObservationError } from "./extract-layout-tree.js";
import type {
  LayoutObservation,
  SectionObservation,
} from "../patterns/schemas/pattern-types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, "..", "..");
const CAPTURES_DIR = resolve(REPO_ROOT, "datasets", "captures");
const OBSERVATIONS_DIR = resolve(REPO_ROOT, "datasets", "observations");

interface CaptureRecord {
  host: string;
  url: string;
  viewport: "desktop" | "tablet" | "mobile";
  outputPath: string;
  bytes: number;
  captured_at: string;
  hash: string;
}

interface CaptureIndex {
  corpus: string;
  generated_at: string;
  records: CaptureRecord[];
}

interface ProviderInput {
  imagePath: string;
  url: string;
  corpus: string;
  capturedAt: string;
  viewport: { width: number; height: number; device_scale: number };
}

type AnalysisProvider = (input: ProviderInput) => Promise<unknown>;

/* -------------------------------------------------------------------------- */
/*  Providers                                                                 */
/* -------------------------------------------------------------------------- */

const stubProvider: AnalysisProvider = async (input) => {
  // The stub emits a plausible but obviously placeholder observation so
  // downstream pipelines run end-to-end without a vision backend.
  const sections: Omit<SectionObservation, "id">[] = [
    {
      role: "nav",
      bbox_norm: [0, 0, 1, 0.04],
      composition: "single-column",
      density: "thin",
      cta_count: 0,
      media_kind: "none",
    },
    {
      role: "hero",
      bbox_norm: [0, 0.04, 1, 0.32],
      composition: "split-media",
      density: "balanced",
      cta_count: 2,
      media_kind: "screenshot-mockup",
    },
    {
      role: "proof-logos",
      bbox_norm: [0, 0.36, 1, 0.06],
      composition: "card-row",
      density: "thin",
      cta_count: 0,
      media_kind: "logo-strip",
    },
    {
      role: "feature-system",
      bbox_norm: [0, 0.42, 1, 0.22],
      composition: "grid-3",
      density: "balanced",
      cta_count: 0,
      media_kind: "none",
    },
    {
      role: "conversion",
      bbox_norm: [0, 0.78, 1, 0.1],
      composition: "single-column",
      density: "thin",
      cta_count: 1,
      media_kind: "none",
    },
    {
      role: "footer",
      bbox_norm: [0, 0.88, 1, 0.12],
      composition: "single-column",
      density: "thin",
      cta_count: 0,
      media_kind: "none",
    },
  ];

  return {
    source: { url: input.url, corpus: input.corpus, captured_at: input.capturedAt },
    viewport: input.viewport,
    density: "balanced",
    sections: sections.map((s, i) => ({ id: `s${i + 1}`, ...s })),
  };
};

const externalProvider: AnalysisProvider = async (input) => {
  // Reads a `<image>.observation.json` file written next to the screenshot
  // by an out-of-band vision pipeline. This keeps the framework
  // model-agnostic.
  const sidecar = input.imagePath.replace(/\.png$/i, ".observation.json");
  if (!existsSync(sidecar)) {
    throw new Error(
      `External provider requires a sidecar file at ${sidecar} but none was found.`,
    );
  }
  return JSON.parse(readFileSync(sidecar, "utf8"));
};

function loadProvider(): { name: string; provider: AnalysisProvider } {
  const name = process.env.ANALYSIS_PROVIDER ?? "stub";
  switch (name) {
    case "stub":
      return { name, provider: stubProvider };
    case "external":
      return { name, provider: externalProvider };
    default:
      throw new Error(
        `Unknown ANALYSIS_PROVIDER="${name}". Supported: stub, external.`,
      );
  }
}

/* -------------------------------------------------------------------------- */
/*  CLI                                                                       */
/* -------------------------------------------------------------------------- */

interface CliArgs {
  corpus: string;
}

function parseArgs(argv: string[]): CliArgs {
  let corpus: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--corpus") corpus = argv[++i];
  }
  if (!corpus) {
    console.error("Usage: tsx analyze-screenshot.ts --corpus <name>");
    process.exit(2);
  }
  return { corpus };
}

const VIEWPORT_DIMS = {
  desktop: { width: 1440, height: 900, device_scale: 2 },
  tablet: { width: 834, height: 1112, device_scale: 2 },
  mobile: { width: 390, height: 844, device_scale: 3 },
} as const;

async function main(): Promise<void> {
  const { corpus } = parseArgs(process.argv.slice(2));
  const indexPath = join(CAPTURES_DIR, corpus, "index.json");
  if (!existsSync(indexPath)) {
    console.error(`No capture index at ${indexPath}. Run capture first.`);
    process.exit(1);
  }

  const { provider, name: providerName } = loadProvider();
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as CaptureIndex;

  console.log(
    `[analyze] corpus=${corpus} provider=${providerName} captures=${index.records.length}`,
  );

  let written = 0;
  for (const rec of index.records) {
    const outFile = join(
      OBSERVATIONS_DIR,
      corpus,
      `${rec.host}.${rec.viewport}.json`,
    );
    try {
      const raw = await provider({
        imagePath: rec.outputPath,
        url: rec.url,
        corpus,
        capturedAt: rec.captured_at,
        viewport: VIEWPORT_DIMS[rec.viewport],
      });
      const observation = normalizeObservation(raw);
      const diffs = classifySections(observation.sections);
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(
        outFile,
        JSON.stringify({ ...observation, classifier_diffs: diffs }, null, 2),
      );
      written++;
      if (diffs.length > 0) {
        console.log(
          `  ⚠ ${rec.host} [${rec.viewport}] — ${diffs.length} classifier diff(s)`,
        );
        for (const d of diffs) {
          console.log(
            `      ${d.section_id}: predicted=${d.predicted} given=${d.given} rule=${d.rule}`,
          );
        }
      } else {
        console.log(`  ✓ ${rec.host} [${rec.viewport}]`);
      }
    } catch (err) {
      const message =
        err instanceof ObservationError
          ? err.message
          : `${(err as Error).message}`;
      console.error(`  ✗ ${rec.host} [${rec.viewport}]: ${message}`);
    }
  }

  console.log(
    `[analyze] wrote ${written}/${index.records.length} observations to ${OBSERVATIONS_DIR}/${corpus}`,
  );
}

if (isMainModule(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

function isMainModule(metaUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(entry).href;
}

export type { LayoutObservation };
