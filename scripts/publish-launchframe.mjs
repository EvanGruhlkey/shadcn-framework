#!/usr/bin/env node

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(ROOT, "packages", "launchframe");

execSync("node scripts/prepare-launchframe-template.mjs", {
  cwd: ROOT,
  stdio: "inherit",
});

execSync("npm publish --access public", {
  cwd: PKG,
  stdio: "inherit",
});
