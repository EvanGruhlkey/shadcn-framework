/**
 * Capture pipeline entry point.
 *
 * Reads a site manifest, opens each URL with Playwright at the configured
 * viewport profiles, and writes a full-page PNG to
 * `datasets/captures/<corpus>/<host>.<viewport>.png`.
 *
 * What this script DOES:
 *   - Renders public pages at fixed viewports.
 *   - Honors a per-domain rate limit derived from the manifest.
 *   - Aborts when robots.txt disallows the path.
 *   - Stores only the rendered PNG.
 *
 * What this script DOES NOT do:
 *   - Save HTML, JS, CSS, fonts, or any third-party asset.
 *   - Follow links or crawl the site.
 *   - Bypass authentication or paywalls.
 *
 * Usage:
 *   tsx packages/capture/screenshot-site.ts --corpus yc-devtools
 *   tsx packages/capture/screenshot-site.ts --corpus ai-saas --viewport desktop
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser, type Page } from "playwright";

import { getViewport, type ViewportProfile } from "./viewport-config.js";
import { loadManifest } from "./site-manifest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, "..", "..");
const CAPTURES_DIR = resolve(REPO_ROOT, "datasets", "captures");

const USER_AGENT =
  "shadcn-ui-framework/0.1 (+https://github.com/shadcn-ui-framework; pattern research; respects robots.txt)";

interface CliArgs {
  corpus: string;
  viewport: ViewportProfile["name"] | "all";
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = { viewport: "all", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--corpus") args.corpus = argv[++i];
    else if (a === "--viewport") args.viewport = argv[++i] as ViewportProfile["name"] | "all";
    else if (a === "--dry-run") args.dryRun = true;
  }
  if (!args.corpus) {
    console.error("Usage: tsx screenshot-site.ts --corpus <name> [--viewport desktop|tablet|mobile|all] [--dry-run]");
    process.exit(2);
  }
  return args as CliArgs;
}

/* -------------------------------------------------------------------------- */
/*  robots.txt                                                                */
/* -------------------------------------------------------------------------- */

interface RobotsRules {
  disallow: string[];
  allow: string[];
}

async function fetchRobotsRules(origin: string): Promise<RobotsRules> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { disallow: [], allow: [] };
    return parseRobots(await res.text());
  } catch {
    return { disallow: [], allow: [] };
  }
}

function parseRobots(body: string): RobotsRules {
  const lines = body.split(/\r?\n/);
  let inStarBlock = false;
  let inAnyBlock = false;
  const disallow: string[] = [];
  const allow: string[] = [];
  for (const lineRaw of lines) {
    const line = lineRaw.split("#")[0]!.trim();
    if (!line) continue;
    const [k, ...rest] = line.split(":");
    const key = k!.toLowerCase().trim();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      inAnyBlock = true;
      inStarBlock = value === "*";
    } else if (inStarBlock) {
      if (key === "disallow" && value) disallow.push(value);
      else if (key === "allow" && value) allow.push(value);
    } else if (!inAnyBlock) {
      if (key === "disallow" && value) disallow.push(value);
      else if (key === "allow" && value) allow.push(value);
    }
  }
  return { disallow, allow };
}

function isPathAllowed(rules: RobotsRules, pathname: string): boolean {
  const matchLength = (patterns: string[]): number => {
    let best = -1;
    for (const p of patterns) {
      if (pathname.startsWith(p) && p.length > best) best = p.length;
    }
    return best;
  };
  const allowMatch = matchLength(rules.allow);
  const disallowMatch = matchLength(rules.disallow);
  if (disallowMatch === -1) return true;
  return allowMatch >= disallowMatch;
}

/* -------------------------------------------------------------------------- */
/*  Rate limiter                                                              */
/* -------------------------------------------------------------------------- */

class DomainRateLimiter {
  private readonly intervalMs: number;
  private readonly lastByHost = new Map<string, number>();

  constructor(perMinute: number) {
    this.intervalMs = Math.ceil(60_000 / perMinute);
  }

  async wait(host: string): Promise<void> {
    const last = this.lastByHost.get(host) ?? 0;
    const elapsed = Date.now() - last;
    if (elapsed < this.intervalMs) {
      await new Promise((r) => setTimeout(r, this.intervalMs - elapsed));
    }
    this.lastByHost.set(host, Date.now());
  }
}

/* -------------------------------------------------------------------------- */
/*  Capture                                                                   */
/* -------------------------------------------------------------------------- */

interface CaptureRecord {
  host: string;
  url: string;
  viewport: ViewportProfile["name"];
  outputPath: string;
  bytes: number;
  captured_at: string;
  hash: string;
}

async function capturePage(
  page: Page,
  url: string,
  viewport: ViewportProfile,
  outFile: string,
): Promise<CaptureRecord> {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  if (!response || response.status() >= 400) {
    throw new Error(`Page returned status ${response?.status() ?? "unknown"}`);
  }

  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }`;
    document.head.appendChild(style);
  });
  await page.waitForTimeout(400);

  const buffer = await page.screenshot({ fullPage: true, type: "png" });
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, buffer);

  return {
    host: new URL(url).host,
    url,
    viewport: viewport.name,
    outputPath: outFile,
    bytes: buffer.byteLength,
    captured_at: new Date().toISOString(),
    hash: hashBuffer(buffer),
  };
}

function hashBuffer(buf: Uint8Array): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < buf.length; i++) {
    h ^= buf[i]!;
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/* -------------------------------------------------------------------------- */
/*  Main                                                                      */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadManifest(args.corpus);

  const viewportNames: ViewportProfile["name"][] =
    args.viewport === "all"
      ? (manifest.viewports as ViewportProfile["name"][])
      : [args.viewport];

  const limiter = new DomainRateLimiter(manifest.policy.max_requests_per_domain_per_minute);

  console.log(`[capture] corpus=${manifest.corpus} sites=${manifest.sites.length} viewports=${viewportNames.join(",")} dry_run=${args.dryRun}`);

  if (args.dryRun) {
    for (const site of manifest.sites) {
      for (const vp of viewportNames) {
        const out = capturePath(manifest.corpus, site.host, vp);
        console.log(`  would write ${out}  (${site.url})`);
      }
    }
    return;
  }

  let browser: Browser | null = null;
  const records: CaptureRecord[] = [];

  try {
    browser = await chromium.launch();
    for (const site of manifest.sites) {
      const origin = new URL(site.url).origin;
      const robots = manifest.policy.respect_robots_txt
        ? await fetchRobotsRules(origin)
        : { disallow: [], allow: [] };
      const pathname = new URL(site.url).pathname;
      if (manifest.policy.respect_robots_txt && !isPathAllowed(robots, pathname)) {
        console.warn(`[capture] ${site.host}: skipped — robots.txt disallows ${pathname}`);
        continue;
      }

      for (const vpName of viewportNames) {
        const viewport = getViewport(vpName);
        const context = await browser.newContext({
          userAgent: USER_AGENT,
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: viewport.deviceScaleFactor,
          isMobile: viewport.isMobile,
          hasTouch: viewport.hasTouch,
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        await limiter.wait(site.host);
        const outFile = capturePath(manifest.corpus, site.host, vpName);

        try {
          const rec = await capturePage(page, site.url, viewport, outFile);
          records.push(rec);
          console.log(`  ✓ ${site.host} [${vpName}] → ${rec.outputPath} (${rec.bytes} bytes)`);
        } catch (err) {
          console.error(`  ✗ ${site.host} [${vpName}]: ${(err as Error).message}`);
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    if (browser) await browser.close();
  }

  const indexFile = join(CAPTURES_DIR, manifest.corpus, "index.json");
  mkdirSync(dirname(indexFile), { recursive: true });
  writeFileSync(
    indexFile,
    JSON.stringify(
      { corpus: manifest.corpus, generated_at: new Date().toISOString(), records },
      null,
      2,
    ),
  );
  console.log(`[capture] wrote ${records.length} screenshots, index → ${indexFile}`);
}

function capturePath(corpus: string, host: string, viewport: string): string {
  return join(CAPTURES_DIR, corpus, `${host}.${viewport}.png`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { capturePage, capturePath };
