#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(PKG_ROOT, "template");
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;

const HELP = `
Usage: launchframe [project-directory] [options]

Scaffold a Next.js app pre-wired for /clone-website and /launchframe slash commands.

Arguments:
  project-directory    Folder to create (default: current directory)

Options:
  -y, --yes            Skip confirmation prompts
  --no-install         Skip npm install
  --force              Overwrite existing files in a non-empty directory
  -h, --help           Show this help message
  -v, --version        Show package version

Examples:
  npx launchframe@latest my-app
  npx launchframe@latest .
  npx launchframe@latest my-app --no-install
`.trim();

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
};

function print(message = "") {
  console.log(message);
}

function fail(message) {
  console.error(`\n${colors.yellow}Error:${colors.reset} ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {
    yes: false,
    install: true,
    force: false,
    help: false,
    version: false,
    projectDir: ".",
  };

  const positional = [];

  for (const arg of argv) {
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version") {
      options.version = true;
    } else if (arg === "-y" || arg === "--yes") {
      options.yes = true;
    } else if (arg === "--no-install") {
      options.install = false;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg.startsWith("-")) {
      fail(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 1) {
    fail(`Too many arguments. Expected at most one project directory.\n\n${HELP}`);
  }

  if (positional.length === 1) {
    options.projectDir = positional[0];
  }

  return options;
}

function isEmptyDir(dir) {
  if (!existsSync(dir)) {
    return true;
  }
  return readdirSync(dir).length === 0;
}

function hasConflict(dir) {
  if (!existsSync(dir)) {
    return false;
  }
  return readdirSync(dir).some((entry) => entry !== ".git");
}

function sanitizePackageName(name) {
  const base = basename(resolve(name));
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-") || "launchframe-app";
}

function copyTemplate(targetDir, projectName) {
  if (!existsSync(TEMPLATE)) {
    fail(
      "Template bundle is missing. If you are developing locally, run:\n  node scripts/prepare-launchframe-template.mjs",
    );
  }

  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(TEMPLATE)) {
    const from = join(TEMPLATE, entry);
    const to = join(targetDir, entry);
    cpSync(from, to, { recursive: true });
  }

  const pkgPath = join(targetDir, "package.json");
  const pkg = readFileSync(pkgPath, "utf8").replaceAll("{{PROJECT_NAME}}", projectName);
  writeFileSync(pkgPath, pkg);

  const readmePath = join(targetDir, "README.md");
  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, "utf8").replaceAll("{{PROJECT_NAME}}", projectName);
    writeFileSync(readmePath, readme);
  }
}

function runInstall(targetDir) {
  print(`\n${colors.cyan}Installing dependencies...${colors.reset}`);

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCmd, ["install"], {
    cwd: targetDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    fail("npm install failed. Run `npm install` manually inside the project directory.");
  }
}

function printNextSteps(targetDir, projectName) {
  const relativeDir = targetDir === process.cwd() ? "." : projectName;
  const cdLine = relativeDir === "." ? "" : `  cd ${relativeDir}\n`;

  print(`
${colors.green}${colors.bold}Success!${colors.reset} Created ${colors.bold}${projectName}${colors.reset} at ${colors.cyan}${targetDir}${colors.reset}

${colors.bold}Next steps:${colors.reset}
${cdLine}  Open the folder in your IDE and start your AI agent
  Run ${colors.cyan}/clone-website https://example.com${colors.reset}
  Or ${colors.cyan}/launchframe https://example.com "your SaaS idea"${colors.reset}
  ${colors.dim}npm run dev${colors.reset}
`);
}

async function confirmOverwrite(message) {
  const rl = createInterface({ input, output });
  const answer = await rl.question(`${message} (y/N) `);
  rl.close();
  return answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes";
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    print(HELP);
    return;
  }

  if (options.version) {
    print(VERSION);
    return;
  }

  const targetDir = resolve(process.cwd(), options.projectDir);
  const projectName = sanitizePackageName(options.projectDir);

  if (existsSync(targetDir) && !statSync(targetDir).isDirectory()) {
    fail(`${targetDir} exists and is not a directory.`);
  }

  if (hasConflict(targetDir) && !options.force) {
    if (!options.yes) {
      const ok = await confirmOverwrite(
        `${colors.yellow}Directory "${targetDir}" is not empty.${colors.reset} Continue and merge template files?`,
      );
      if (!ok) {
        print("Cancelled.");
        process.exit(0);
      }
    }
  } else if (!isEmptyDir(targetDir) && options.force) {
    print(`${colors.yellow}Merging template into existing directory.${colors.reset}`);
  }

  print(`\n${colors.bold}Launchframe ${VERSION}${colors.reset}`);
  print(`Creating project in ${colors.cyan}${targetDir}${colors.reset} ...`);

  copyTemplate(targetDir, projectName);

  if (options.install) {
    runInstall(targetDir);
  } else {
    print(`\n${colors.dim}Skipped npm install (--no-install). Run npm install before starting.${colors.reset}`);
  }

  printNextSteps(targetDir, projectName);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
