#!/usr/bin/env node

/**
 * Builds packages/launchframe/template/ from the monorepo root.
 * Run before publishing the launchframe npm package.
 *
 * Usage: node scripts/prepare-launchframe-template.mjs
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(ROOT, "packages", "launchframe");
const TEMPLATE = join(PKG, "template");
const SCAFFOLD = join(PKG, "scaffold");

/** Directories copied wholesale from repo root into the template. */
const COPY_DIRS = [
  ".agents/skills",
  ".amazonq",
  ".augment/commands",
  ".claude/skills",
  ".codex/skills",
  ".continue/commands",
  ".continue/rules",
  ".cursor/commands",
  ".cursor/rules",
  ".gemini/commands",
  ".github/skills",
  ".opencode/commands",
  ".windsurf/workflows",
];

/** Individual files copied from repo root. */
const COPY_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  ".aider.conf.yml",
  ".clinerules",
  ".windsurfrules",
  ".gitattributes",
  ".gitignore",
  ".nvmrc",
  "components.json",
  "tsconfig.json",
  "eslint.config.mjs",
  "postcss.config.mjs",
  "LICENSE",
  ".github/copilot-instructions.md",
  ".github/copilot-setup-steps.yml",
  "docs/research/INSPECTION_GUIDE.md",
  "scripts/sync-agent-rules.sh",
  "scripts/sync-skills.mjs",
];

const GIT_BLOB_PATHS = ["src/app/favicon.ico"];

function log(message) {
  console.log(`  ✓ ${message}`);
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function copyPath(from, to) {
  if (!existsSync(from)) {
    console.warn(`  ! Skipping missing path: ${relative(ROOT, from)}`);
    return;
  }
  ensureDir(dirname(to));
  cpSync(from, to, { recursive: true });
  log(relative(TEMPLATE, to));
}

function copyScaffoldDir(fromDir, toDir) {
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    const from = join(fromDir, entry.name);
    const to = join(toDir, entry.name);
    if (entry.isDirectory()) {
      copyScaffoldDir(from, to);
    } else {
      ensureDir(dirname(to));
      cpSync(from, to);
      log(relative(TEMPLATE, to));
    }
  }
}

function writeGitBlob(relativePath) {
  const dest = join(TEMPLATE, relativePath);
  ensureDir(dirname(dest));
  const content = execSync(`git show HEAD:${relativePath}`, {
    cwd: ROOT,
    encoding: "buffer",
  });
  writeFileSync(dest, content);
  log(relativePath);
}

function writePackageJson() {
  const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const templatePkg = {
    name: "{{PROJECT_NAME}}",
    version: "0.1.0",
    private: true,
    description: "Launchframe — AI-ready website scaffold",
    scripts: rootPkg.scripts,
    dependencies: rootPkg.dependencies,
    devDependencies: rootPkg.devDependencies,
    engines: rootPkg.engines,
  };
  writeFileSync(
    join(TEMPLATE, "package.json"),
    `${JSON.stringify(templatePkg, null, 2)}\n`,
  );
  log("package.json");
}

function writePlaceholders() {
  const placeholders = [
    "public/images/.gitkeep",
    "public/videos/.gitkeep",
    "public/lottie/.gitkeep",
    "public/seo/.gitkeep",
    "docs/design-references/.gitkeep",
    "docs/research/components/.gitkeep",
    "src/hooks/.gitkeep",
    "src/types/.gitkeep",
  ];
  for (const rel of placeholders) {
    const full = join(TEMPLATE, rel);
    ensureDir(dirname(full));
    if (!existsSync(full)) {
      writeFileSync(full, "");
      log(rel);
    }
  }
}

function cleanTemplate() {
  if (existsSync(TEMPLATE)) {
    rmSync(TEMPLATE, { recursive: true, force: true });
  }
  ensureDir(TEMPLATE);
}

function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(full);
    } else {
      count += 1;
    }
  }
  return count;
}

function main() {
  console.log("Preparing launchframe template...\n");
  cleanTemplate();

  for (const rel of COPY_DIRS) {
    copyPath(join(ROOT, rel), join(TEMPLATE, rel));
  }

  for (const rel of COPY_FILES) {
    copyPath(join(ROOT, rel), join(TEMPLATE, rel));
  }

  copyScaffoldDir(SCAFFOLD, TEMPLATE);

  for (const rel of GIT_BLOB_PATHS) {
    writeGitBlob(rel);
  }

  writePlaceholders();
  writePackageJson();

  copyPath(join(ROOT, "package-lock.json"), join(TEMPLATE, "package-lock.json"));

  const fileCount = countFiles(TEMPLATE);
  console.log(`\nDone! Template ready at packages/launchframe/template/ (${fileCount} files).`);
}

main();
