/**
 * Loader and validator for `datasets/corpora/*.json` site manifests.
 *
 * The capture pipeline never accepts an arbitrary URL list at the CLI; it
 * always resolves URLs through a manifest so that capture policy
 * (rate limit, robots.txt respect, no-html storage) is centrally enforced.
 */

import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { SiteManifest } from "../patterns/schemas/pattern-types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, "..", "..");
const CORPORA_DIR = resolve(REPO_ROOT, "datasets", "corpora");

export class ManifestError extends Error {
  constructor(public readonly file: string, public readonly field: string, message: string) {
    super(`[manifest] ${file} :: ${field} — ${message}`);
    this.name = "ManifestError";
  }
}

export function loadManifest(corpus: string): SiteManifest {
  const file = join(CORPORA_DIR, `${corpus}.json`);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new ManifestError(file, "<json>", `Invalid JSON: ${(err as Error).message}`);
  }

  if (typeof raw !== "object" || raw === null) {
    throw new ManifestError(file, "<root>", "Manifest root must be an object.");
  }
  const r = raw as Record<string, unknown>;

  const required = ["corpus", "summary", "category", "policy", "viewports", "sites"] as const;
  for (const key of required) {
    if (!(key in r)) throw new ManifestError(file, key, "Required field missing.");
  }

  const policy = r["policy"] as Record<string, unknown>;
  if (policy["store_html"] !== false || policy["store_assets"] !== false) {
    throw new ManifestError(
      file,
      "policy",
      "store_html and store_assets must both be literal false (anti-clone-policy §2).",
    );
  }
  if (
    typeof policy["max_requests_per_domain_per_minute"] !== "number" ||
    (policy["max_requests_per_domain_per_minute"] as number) <= 0
  ) {
    throw new ManifestError(
      file,
      "policy.max_requests_per_domain_per_minute",
      "Must be a positive number.",
    );
  }

  const sites = r["sites"];
  if (!Array.isArray(sites)) throw new ManifestError(file, "sites", "Must be an array.");
  for (let i = 0; i < sites.length; i++) {
    const s = sites[i] as Record<string, unknown>;
    if (typeof s["host"] !== "string" || typeof s["url"] !== "string") {
      throw new ManifestError(file, `sites[${i}]`, "host and url are required strings.");
    }
    if (!/^https?:\/\//.test(s["url"] as string)) {
      throw new ManifestError(
        file,
        `sites[${i}].url`,
        "URL must include an http(s) scheme.",
      );
    }
  }

  return raw as SiteManifest;
}
