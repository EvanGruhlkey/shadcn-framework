#!/usr/bin/env node
/**
 * Scaffold a Launchframe project into the current directory (or --dir).
 * Usage: npx launchframe@latest [--dir=path] [--skip-install]
 * Optional: LAUNCHFRAME_SOURCE_URL, LAUNCHFRAME_SAAS_IDEA env vars, or legacy CLI args.
 */

import { cp, mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { spawn } from "node:child_process";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..");

const DEFAULT_URL = "https://example.com";
const DEFAULT_SAAS_IDEA =
  "Edit your SaaS pitch in src/lib/launchframe-config.ts, then run /launchframe with your reference URL and the same pitch.";

/**
 * Never copy these root entries into a scaffolded app (build artifacts, VCS, the CLI itself).
 * All other root files and folders are copied as-is — including every dotfile and dot-directory
 * so AI agents see the same agent rules and commands as this template.
 */
const SKIP_DIR_NAMES = new Set([
  "bin",
  "node_modules",
  ".git",
  ".next",
  "dist",
  "out",
  "coverage",
  ".turbo",
]);

const SKIP_ROOT_FILES = new Set([
  "package-lock.json",
  ".DS_Store",
  "Thumbs.db",
]);

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function printHelp() {
  console.log(`
launchframe — scaffold a Next.js app into the current directory (project root)

Usage:
  npx launchframe@latest

This unpacks the template into the folder you are in (where you ran the command).
No URL or SaaS arguments are required — edit src/lib/launchframe-config.ts after scaffold.

Optional environment variables (same session):
  LAUNCHFRAME_SOURCE_URL     Reference site to clone later (https://...)
  LAUNCHFRAME_SAAS_IDEA     Short landing-page pitch text

Legacy (optional positional args, for scripts only):
  npx launchframe@latest <url> "<saas-idea>"

Options:
  --dir, -o       Scaffold into this folder instead of the current directory (must be empty)
  --skip-install  Do not run npm install after scaffolding
  -h, --help      Show this message

Note:
  Run inside an empty project folder (no existing package.json / src / next.config).
  The output folder must not be inside the Launchframe npm package directory.

Example:
  mkdir my-app && cd my-app
  npx launchframe@latest
`);
}

function parseArgs(argv) {
  const out = {
    url: null,
    idea: null,
    dir: null,
    skipInstall: false,
    help: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") {
      out.help = true;
      continue;
    }
    if (a === "--skip-install") {
      out.skipInstall = true;
      continue;
    }
    if (a === "--dir" || a === "-o") {
      out.dir = argv[++i];
      continue;
    }
    if (a.startsWith("--dir=")) {
      out.dir = a.slice("--dir=".length);
      continue;
    }
    if (a.startsWith("-o=")) {
      out.dir = a.slice("-o=".length);
      continue;
    }
    positional.push(a);
  }

  if (positional[0]) out.url = positional[0];
  if (positional[1]) out.idea = positional[1];

  return out;
}

function validateUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("URL must start with http:// or https://");
  }
  return u.href;
}

function slugFromDir(destRootAbs) {
  const base = basename(resolve(destRootAbs));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "launchframe-app";
}

function tsStringLiteral(value) {
  return JSON.stringify(value);
}

function shouldCopyRootEntry(baseName, isDirectory) {
  if (SKIP_DIR_NAMES.has(baseName)) return false;
  if (!isDirectory && SKIP_ROOT_FILES.has(baseName)) return false;
  return true;
}

/** Output cannot be inside the template package tree (would recurse while copying). */
function isForbiddenOutput(packageRootAbs, destRootAbs) {
  const pkg = resolve(packageRootAbs);
  const dest = resolve(destRootAbs);
  if (dest === pkg) return true;
  const rel = relative(pkg, dest);
  return Boolean(rel) && !rel.startsWith("..") && !isAbsolute(rel);
}

async function copyTemplateTree(sourceRoot, destRootAbs) {
  await mkdir(destRootAbs, { recursive: true });
  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const destResolved = resolve(destRootAbs);
  for (const ent of entries) {
    const from = join(sourceRoot, ent.name);
    if (resolve(from) === destResolved) continue;
    if (!shouldCopyRootEntry(ent.name, ent.isDirectory())) continue;
    const to = join(destRootAbs, ent.name);
    await cp(from, to, { recursive: true });
  }
}

async function writeGeneratedPackageJson(destRoot, npmPackageName) {
  const raw = await readFile(join(PKG_ROOT, "package.json"), "utf8");
  const pkg = JSON.parse(raw);

  const nextPkg = {
    name: npmPackageName,
    version: "0.1.0",
    private: true,
    description: pkg.description,
    license: pkg.license,
    engines: pkg.engines,
    scripts: pkg.scripts,
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
    keywords: pkg.keywords,
  };

  await writeFile(
    join(destRoot, "package.json"),
    `${JSON.stringify(nextPkg, null, 2)}\n`,
    "utf8",
  );
}

async function writeLaunchframeArtifacts(destRoot, url, idea) {
  const configTs = `/**
 * Set your reference site and positioning, then use /launchframe with the same URL and SaaS idea.
 * Written by Launchframe CLI — edit freely.
 */
export const LAUNCHFRAME_SOURCE_URL = ${tsStringLiteral(url)} as const;

export const LAUNCHFRAME_SAAS_IDEA = ${tsStringLiteral(idea)} as const;
`;

  await writeFile(join(destRoot, "src", "lib", "launchframe-config.ts"), configTs, "utf8");

  const ctx = {
    sourceUrl: url,
    saasIdea: idea,
    notes:
      "Edit this file or src/lib/launchframe-config.ts. Use /launchframe with sourceUrl and your SaaS idea for pixel-perfect extraction.",
  };
  await writeFile(
    join(destRoot, "launchframe.context.json"),
    `${JSON.stringify(ctx, null, 2)}\n`,
    "utf8",
  );

  const md = `# Launchframe context

## Reference URL (clone target)

${url}

## SaaS idea (landing copy)

${idea}

When running \`/launchframe\` with your agent, use the reference URL above and align hero copy with your SaaS idea while respecting attribution and copyright for third-party brands.
`;

  await mkdir(join(destRoot, "docs", "research"), { recursive: true });
  await writeFile(join(destRoot, "docs", "research", "LAUNCHFRAME.md"), md, "utf8");
}

async function writeReadme(destRoot, npmPackageName, url, idea) {
  const body = `# ${npmPackageName}

Created with [\`launchframe\`](https://www.npmjs.com/package/launchframe).

## Configure

Edit \`src/lib/launchframe-config.ts\`:

- \`LAUNCHFRAME_SOURCE_URL\` — site to reverse-engineer
- \`LAUNCHFRAME_SAAS_IDEA\` — landing copy / positioning

Current values (from scaffold):

- **Reference site:** ${url}
- **SaaS idea:** ${idea}

## Quick start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open your AI agent and run \`/launchframe <your-reference-url> "your pitch"\` (same values as in the config).

See \`AGENTS.md\` for full agent instructions.
`;

  await writeFile(join(destRoot, "README.md"), body, "utf8");
}

/** Refuse to stomp an existing Next-style project in the target directory. */
async function assertScaffoldTargetVacant(destRoot) {
  const conflicts = ["package.json", "next.config.ts", "src"];
  for (const c of conflicts) {
    if (await pathExists(join(destRoot, c))) {
      console.error(
        `Refusing to scaffold: "${c}" already exists in this folder.\n` +
          `Create a new empty directory, cd into it, then run:\n` +
          `  npx launchframe@latest\n`,
      );
      process.exit(1);
    }
  }
}

function runNpmInstall(cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("npm", ["install"], {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`npm install exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

function resolveUrlAndIdea(args) {
  const envUrl =
    process.env.LAUNCHFRAME_SOURCE_URL?.trim() || process.env.LAUNCHFRAME_URL?.trim();
  const envIdea = process.env.LAUNCHFRAME_SAAS_IDEA?.trim();

  let urlRaw = args.url?.trim() || envUrl || DEFAULT_URL;
  let ideaRaw = args.idea?.trim() || envIdea || DEFAULT_SAAS_IDEA;

  return { urlRaw, ideaRaw };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const destRoot = args.dir?.trim()
    ? resolve(process.cwd(), args.dir.trim())
    : resolve(process.cwd());

  if (isForbiddenOutput(PKG_ROOT, destRoot)) {
    console.error(
      "Output folder cannot be inside the Launchframe package directory. Create a new folder outside this package and cd into it, then run npx launchframe@latest again.",
    );
    process.exit(1);
  }

  await assertScaffoldTargetVacant(destRoot);

  const { urlRaw, ideaRaw } = resolveUrlAndIdea(args);

  let url;
  try {
    url = validateUrl(urlRaw);
  } catch (e) {
    console.error(String(e.message));
    process.exit(1);
  }

  const idea = ideaRaw.trim() || DEFAULT_SAAS_IDEA;
  const npmPackageName = slugFromDir(destRoot);

  await mkdir(destRoot, { recursive: true });

  await copyTemplateTree(PKG_ROOT, destRoot);

  await writeGeneratedPackageJson(destRoot, npmPackageName);
  await writeLaunchframeArtifacts(destRoot, url, idea);
  await writeReadme(destRoot, npmPackageName, url, idea);

  console.log(`\nScaffolded Launchframe in:\n  ${destRoot}`);
  console.log(`  Reference URL: ${url}`);
  console.log(`  SaaS idea: ${idea}\n`);
  console.log("Edit src/lib/launchframe-config.ts if you need different values.\n");

  if (!args.skipInstall) {
    console.log("Running npm install...\n");
    try {
      await runNpmInstall(destRoot);
      console.log("\nDone. From this folder: npm run dev\n");
    } catch (e) {
      console.error(String(e.message));
      console.error("\nRun npm install in this folder manually.\n");
      process.exit(1);
    }
  } else {
    console.log("Skipped npm install (--skip-install). Run npm install in this folder.\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
