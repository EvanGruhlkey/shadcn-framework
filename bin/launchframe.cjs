#!/usr/bin/env node
/**
 * Windows-friendly CLI entry: npx/cmd-shim reliably spawns Node for .cjs bins.
 * Implementation lives in launchframe.mjs (ESM).
 */
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const script = join(__dirname, "launchframe.mjs");
const result = spawnSync(process.execPath, [script, ...process.argv.slice(2)], {
  stdio: "inherit",
  windowsHide: true,
});

process.exit(result.status === null ? 1 : result.status);
