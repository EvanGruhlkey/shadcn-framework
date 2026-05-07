/**
 * Layout-tree extraction.
 *
 * The framework treats screenshot analysis as a structured prediction task:
 * produce a `LayoutObservation` from a captured PNG. The actual visual
 * reasoning is delegated to a vision provider (an LLM with an image input,
 * or a deterministic CV pipeline) chosen at orchestration time.
 *
 * This module owns the surrounding work: validating the provider's output,
 * normalizing bounding boxes, and ensuring sections do not overlap.
 *
 * Keeping the validator separate from the provider means a switch from one
 * vision backend to another never silently degrades data quality — every
 * observation crosses through the same gate before it reaches
 * `datasets/observations/`.
 */

import { createHash } from "node:crypto";

import {
  isComposition,
  isDensity,
  isSectionRole,
  type LayoutObservation,
  type SectionObservation,
} from "../patterns/schemas/pattern-types.js";

export class ObservationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(`[observation] ${field} — ${message}`);
    this.name = "ObservationError";
  }
}

/**
 * Validate and normalize a raw observation produced by a vision provider.
 *
 * - Sections are sorted by `y` ascending (top to bottom on screen).
 * - `id` fields are reassigned to `s1`, `s2`, ... so analysis output is
 *   deterministic regardless of provider quirks.
 * - `bbox_norm` values are clamped to [0, 1] and any pair of overlapping
 *   sections is flagged.
 */
export function normalizeObservation(raw: unknown): LayoutObservation {
  if (typeof raw !== "object" || raw === null) {
    throw new ObservationError("<root>", "Observation must be an object.");
  }
  const r = raw as Record<string, unknown>;

  const source = r["source"] as Record<string, unknown> | undefined;
  if (
    !source ||
    typeof source["url"] !== "string" ||
    typeof source["corpus"] !== "string" ||
    typeof source["captured_at"] !== "string"
  ) {
    throw new ObservationError("source", "Required {url, corpus, captured_at}.");
  }

  const viewport = r["viewport"] as Record<string, unknown> | undefined;
  if (
    !viewport ||
    typeof viewport["width"] !== "number" ||
    typeof viewport["height"] !== "number" ||
    typeof viewport["device_scale"] !== "number"
  ) {
    throw new ObservationError("viewport", "Required {width, height, device_scale} numbers.");
  }

  const density = r["density"];
  if (!isDensity(density)) {
    throw new ObservationError("density", "Must be thin|balanced|dense.");
  }

  const sectionsRaw = r["sections"];
  if (!Array.isArray(sectionsRaw) || sectionsRaw.length === 0) {
    throw new ObservationError("sections", "Must be a non-empty array.");
  }

  const sections = sectionsRaw
    .map((s, i) => normalizeSection(s, `sections[${i}]`))
    .sort((a, b) => a.bbox_norm[1] - b.bbox_norm[1])
    .map((s, i) => ({ ...s, id: `s${i + 1}` }));

  detectOverlaps(sections);

  const obsId = computeObservationId(
    source["url"] as string,
    source["captured_at"] as string,
  );

  return {
    observation_id: obsId,
    source: {
      url: source["url"] as string,
      corpus: source["corpus"] as string,
      captured_at: source["captured_at"] as string,
    },
    viewport: {
      width: viewport["width"] as number,
      height: viewport["height"] as number,
      device_scale: viewport["device_scale"] as number,
    },
    density,
    sections,
  };
}

function normalizeSection(raw: unknown, path: string): SectionObservation {
  if (typeof raw !== "object" || raw === null) {
    throw new ObservationError(path, "Section must be an object.");
  }
  const s = raw as Record<string, unknown>;

  const role = s["role"];
  if (!isSectionRole(role)) {
    throw new ObservationError(`${path}.role`, `Unknown role "${String(role)}".`);
  }
  const composition = s["composition"];
  if (!isComposition(composition)) {
    throw new ObservationError(`${path}.composition`, `Unknown composition.`);
  }
  const density = s["density"];
  if (!isDensity(density)) {
    throw new ObservationError(`${path}.density`, `Density must be thin|balanced|dense.`);
  }

  const bbox = s["bbox_norm"];
  if (
    !Array.isArray(bbox) ||
    bbox.length !== 4 ||
    !bbox.every((n) => typeof n === "number" && Number.isFinite(n))
  ) {
    throw new ObservationError(`${path}.bbox_norm`, `Must be [x, y, w, h] of finite numbers.`);
  }
  const [x, y, w, h] = bbox as [number, number, number, number];
  if (
    [x, y, w, h].some((v) => v < 0 || v > 1) ||
    x + w > 1.001 ||
    y + h > 1.001 ||
    w <= 0 ||
    h <= 0
  ) {
    throw new ObservationError(
      `${path}.bbox_norm`,
      `Bbox must be normalized to [0, 1] and non-degenerate.`,
    );
  }

  const ctaCount = s["cta_count"];
  if (typeof ctaCount !== "number" || ctaCount < 0 || !Number.isInteger(ctaCount)) {
    throw new ObservationError(`${path}.cta_count`, `Must be a non-negative integer.`);
  }

  const mediaKind = s["media_kind"];
  if (
    typeof mediaKind !== "string" ||
    !["none", "screenshot-mockup", "illustration", "photo", "logo-strip"].includes(mediaKind)
  ) {
    throw new ObservationError(`${path}.media_kind`, `Unknown media_kind "${String(mediaKind)}".`);
  }

  const notes = s["notes"];
  if (notes !== undefined && (typeof notes !== "string" || notes.length > 240)) {
    throw new ObservationError(`${path}.notes`, `Notes must be ≤ 240 chars.`);
  }

  return {
    id: typeof s["id"] === "string" ? (s["id"] as string) : "",
    role,
    composition,
    density,
    bbox_norm: [
      clamp01(x),
      clamp01(y),
      clamp01(Math.min(w, 1 - x)),
      clamp01(Math.min(h, 1 - y)),
    ],
    cta_count: ctaCount,
    media_kind: mediaKind as SectionObservation["media_kind"],
    ...(notes ? { notes } : {}),
  };
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function detectOverlaps(sections: SectionObservation[]): void {
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const a = sections[i]!.bbox_norm;
      const b = sections[j]!.bbox_norm;
      const overlap = rectOverlap(a, b);
      const minArea = Math.min(a[2] * a[3], b[2] * b[3]);
      if (minArea > 0 && overlap / minArea > 0.05) {
        throw new ObservationError(
          `sections[${i}|${j}]`,
          `Sections overlap by ${((overlap / minArea) * 100).toFixed(1)}% (max 5%).`,
        );
      }
    }
  }
}

function rectOverlap(
  a: [number, number, number, number],
  b: [number, number, number, number],
): number {
  const ix = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  return ix * iy;
}

function computeObservationId(url: string, capturedAt: string): string {
  return createHash("sha256").update(`${url}|${capturedAt}`).digest("hex").slice(0, 16);
}
