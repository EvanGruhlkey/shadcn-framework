#!/usr/bin/env node
/**
 * CLI entry for `npx launchframe` / `npm exec launchframe`.
 * Spawns the TypeScript extract pipeline with the same Node that installed
 * this package. Output defaults to `./output/<runId>/` in the *current*
 * working directory (where the user ran the command), not inside the
 * package install path.
 */

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = join(__dirname, "..");
const pkgJsonPath = join(pkgRoot, "package.json");

const require = createRequire(pkgJsonPath);

let tsxCli;
try {
  const tsxPkg = require.resolve("tsx/package.json", { paths: [pkgRoot] });
  tsxCli = join(dirname(tsxPkg), "dist", "cli.mjs");
} catch {
  console.error(
    "launchframe: could not resolve the `tsx` runtime. Re-install: npm install -g launchframe",
  );
  process.exit(1);
}

const extractScript = join(pkgRoot, "packages", "extract", "extract.ts");

const result = spawnSync(
  process.execPath,
  [tsxCli, extractScript, ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
    shell: false,
  },
);

process.exit(result.status === null ? 1 : result.status);
