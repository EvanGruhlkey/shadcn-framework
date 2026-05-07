/**
 * `extract` — the headline command.
 *
 *   npm run extract -- https://site-a.com https://site-b.com https://site-c.com
 *
 * For each URL: open in Chromium, screenshot, harvest computed design
 * tokens via `browser-extract.ts`. After all sites: synthesize an
 * original shadcn-compatible design system and emit drop-in files.
 *
 * Output goes to `output/<runId>/`.
 *
 * Policy (from rules/anti-clone-policy.md):
 *   - Honor robots.txt by default.
 *   - Per-domain rate limit defaults to 15 req/min.
 *   - Store only PNG screenshots and harvested computed-style values.
 *   - Never persist HTML, JS, CSS, or third-party assets.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium, type Browser } from "playwright";

import { harvestTokens } from "./browser-extract.js";
import { emitAll } from "./emit.js";
import { synthesize } from "./synthesize.js";
import type { ExtractionRun, RawTokens, SiteCapture } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");
const DEFAULT_OUTPUT_ROOT = resolve(REPO_ROOT, "output");

const USER_AGENT =
  "shadcn-ui-framework/0.1 (+https://github.com/shadcn-ui-framework; design-token research; respects robots.txt)";

interface CliArgs {
  urls: string[];
  outDir: string;
  viewport: { width: number; height: number };
  respectRobots: boolean;
  rateLimitPerMinute: number;
  runName?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    urls: [],
    outDir: "",
    viewport: { width: 1440, height: 900 },
    respectRobots: true,
    rateLimitPerMinute: 15,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--out") args.outDir = argv[++i]!;
    else if (a === "--name") args.runName = argv[++i];
    else if (a === "--no-robots") args.respectRobots = false;
    else if (a === "--rate") args.rateLimitPerMinute = parseInt(argv[++i]!, 10);
    else if (a === "--width") args.viewport.width = parseInt(argv[++i]!, 10);
    else if (a === "--height") args.viewport.height = parseInt(argv[++i]!, 10);
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else if (a.startsWith("http://") || a.startsWith("https://")) {
      args.urls.push(a);
    } else if (a.startsWith("--")) {
      console.error(`Unknown flag: ${a}`);
      process.exit(2);
    } else {
      console.error(`Unrecognized argument: ${a}`);
      process.exit(2);
    }
  }
  if (args.urls.length === 0) {
    printHelp();
    process.exit(2);
  }
  return args;
}

function printHelp(): void {
  console.log(
    [
      "Usage: npm run extract -- <url> [<url> ...] [options]",
      "",
      "Captures each URL at a desktop viewport, harvests computed design",
      "tokens (colors, type, spacing, radius, shadow), and synthesizes a",
      "drop-in shadcn-compatible design system in output/<runId>/.",
      "",
      "Options:",
      "  --out <dir>          Output directory (default: output/<runId>)",
      "  --name <slug>        Human-friendly slug used in the runId",
      "  --no-robots          Skip robots.txt check (not recommended)",
      "  --rate <per-min>     Per-domain rate limit, default 15",
      "  --width <px>         Viewport width, default 1440",
      "  --height <px>        Viewport height, default 900",
      "  --help               Show this help",
    ].join("\n"),
  );
}

/* -------------------------------------------------------------------------- */
/*  robots.txt                                                                */
/* -------------------------------------------------------------------------- */

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    const res = await fetch(`${u.origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return true;
    const body = await res.text();
    return checkRobots(body, u.pathname);
  } catch {
    return true;
  }
}

function checkRobots(body: string, pathname: string): boolean {
  const lines = body.split(/\r?\n/);
  let inStarBlock = false;
  const disallow: string[] = [];
  const allow: string[] = [];
  for (const raw of lines) {
    const line = raw.split("#")[0]!.trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).toLowerCase().trim();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") inStarBlock = value === "*";
    else if (inStarBlock && key === "disallow" && value) disallow.push(value);
    else if (inStarBlock && key === "allow" && value) allow.push(value);
  }
  const len = (patterns: string[]) =>
    patterns.reduce((m, p) => (pathname.startsWith(p) ? Math.max(m, p.length) : m), -1);
  const a = len(allow);
  const d = len(disallow);
  if (d < 0) return true;
  return a >= d;
}

/* -------------------------------------------------------------------------- */
/*  Rate limiter                                                              */
/* -------------------------------------------------------------------------- */

class RateLimiter {
  private readonly intervalMs: number;
  private readonly lastByHost = new Map<string, number>();
  constructor(perMinute: number) {
    this.intervalMs = Math.ceil(60_000 / Math.max(1, perMinute));
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
/*  Pipeline                                                                  */
/* -------------------------------------------------------------------------- */

async function captureOne(
  browser: Browser,
  url: string,
  viewport: { width: number; height: number },
  outDir: string,
): Promise<{ raw: RawTokens; capture: SiteCapture } | null> {
  const host = new URL(url).host;
  const stamp = `${host}.png`;
  const screenshotPath = join(outDir, "screenshots", stamp);
  const rawPath = join(outDir, "raw", `${host}.tokens.json`);

  const ctx = await browser.newContext({
    userAgent: USER_AGENT,
    viewport,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response || response.status() >= 400) {
      throw new Error(`HTTP ${response?.status() ?? "unknown"}`);
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

    mkdirSync(dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true, type: "png" });

    const raw = await harvestTokens(page, url, viewport);
    mkdirSync(dirname(rawPath), { recursive: true });
    writeFileSync(rawPath, JSON.stringify(raw, null, 2));

    const capture: SiteCapture = {
      url,
      host,
      capturedAt: raw.capturedAt,
      screenshotPath,
      rawTokensPath: rawPath,
      status: "ok",
    };
    return { raw, capture };
  } catch (err) {
    return {
      raw: emptyRaw(url, viewport),
      capture: {
        url,
        host,
        capturedAt: new Date().toISOString(),
        screenshotPath: "",
        rawTokensPath: "",
        status: "failed",
        reason: (err as Error).message,
      },
    };
  } finally {
    await ctx.close();
  }
}

function emptyRaw(url: string, viewport: { width: number; height: number }): RawTokens {
  return {
    url,
    capturedAt: new Date().toISOString(),
    viewport,
    colors: [],
    typography: [],
    spacing: [],
    radii: [],
    shadows: [],
    dominantContainerPx: null,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const runId = makeRunId(startedAt, args.runName);
  const outDir = args.outDir || join(DEFAULT_OUTPUT_ROOT, runId);

  console.log(`[extract] runId=${runId}`);
  console.log(`[extract] urls=${args.urls.length} viewport=${args.viewport.width}x${args.viewport.height}`);
  console.log(`[extract] output=${outDir}`);
  console.log("");

  mkdirSync(outDir, { recursive: true });

  const limiter = new RateLimiter(args.rateLimitPerMinute);
  const captures: SiteCapture[] = [];
  const rawList: RawTokens[] = [];

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();

    for (const url of args.urls) {
      const host = new URL(url).host;

      if (args.respectRobots) {
        const allowed = await isAllowedByRobots(url);
        if (!allowed) {
          console.log(`  ⊘ ${url}  skipped — robots.txt disallows`);
          captures.push({
            url,
            host,
            capturedAt: new Date().toISOString(),
            screenshotPath: "",
            rawTokensPath: "",
            status: "skipped",
            reason: "robots.txt",
          });
          continue;
        }
      }

      await limiter.wait(host);
      const result = await captureOne(browser, url, args.viewport, outDir);
      if (!result) continue;
      captures.push(result.capture);
      if (result.capture.status === "ok") {
        rawList.push(result.raw);
        console.log(`  ✓ ${url}`);
      } else {
        console.log(`  ✗ ${url}  ${result.capture.reason ?? ""}`);
      }
    }
  } finally {
    if (browser) await browser.close();
  }

  if (rawList.length === 0) {
    console.error("[extract] no successful captures — nothing to synthesize.");
    process.exit(1);
  }

  console.log("");
  console.log(`[extract] synthesizing design system from ${rawList.length} site(s)...`);
  const designSystem = synthesize(rawList, {
    runId,
    sources: rawList.map((r) => ({ url: r.url, capturedAt: r.capturedAt })),
  });

  const run: ExtractionRun = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    outputDir: outDir,
    captures,
    designSystem,
  };

  const written = emitAll(designSystem, run);
  writeFileSync(join(outDir, "run.json"), JSON.stringify(run, null, 2));
  console.log("");
  console.log("[extract] wrote:");
  for (const f of written) console.log(`  → ${f}`);
  console.log(`  → ${join(outDir, "run.json")}`);
  console.log("");
  console.log(`[extract] done. Open ${join(outDir, "REPORT.md")} for the summary.`);
}

function makeRunId(startedAt: string, name: string | undefined): string {
  const stamp = startedAt.replace(/[-:T]/g, "").slice(0, 14);
  return name ? `${stamp}-${name}` : stamp;
}

if (isMainModule(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

/**
 * Cross-platform entry-point check. On Windows, `process.argv[1]` is a
 * backslash path while `import.meta.url` is a proper file URL, so the
 * naive `file://${argv[1]}` template literal never matches and the
 * script silently exits. `pathToFileURL` produces the encoded URL form
 * on every platform.
 */
function isMainModule(metaUrl: string): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(entry).href;
}

export { main };
