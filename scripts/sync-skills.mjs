#!/usr/bin/env node

/**
 * Generates platform-specific command/skill files for every skill defined in
 * `.claude/skills/<skill-name>/SKILL.md`.
 *
 * Each SKILL.md is the source of truth. This script fans it out to every
 * supported AI coding platform's required format/location.
 *
 * To add a new skill: drop a new SKILL.md under .claude/skills/<name>/ with
 * frontmatter (name, description, argument-hint) and re-run this script.
 *
 * Usage: node scripts/sync-skills.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, '.claude', 'skills');

// --- Helpers ---

function write(relPath, content) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  console.log(`  \u2713 ${relPath}`);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const [, frontmatter, body] = match;
  const meta = {};
  for (const line of frontmatter.split('\n')) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[m[1]] = value;
  }
  return { meta, body };
}

function discoverSkills() {
  let entries;
  try {
    entries = readdirSync(SKILLS_DIR);
  } catch {
    console.error(`Error: skills directory not found at .claude/skills/`);
    process.exit(1);
  }
  const skills = [];
  for (const name of entries) {
    const skillPath = join(SKILLS_DIR, name);
    if (!statSync(skillPath).isDirectory()) continue;
    const sourceFile = join(skillPath, 'SKILL.md');
    let raw;
    try {
      raw = readFileSync(sourceFile, 'utf8').replace(/\r\n/g, '\n');
    } catch {
      console.warn(`  ! Skipping ${name}: no SKILL.md`);
      continue;
    }
    const parsed = parseFrontmatter(raw);
    if (!parsed) {
      console.warn(`  ! Skipping ${name}: SKILL.md has no parseable frontmatter`);
      continue;
    }
    skills.push({
      name: parsed.meta.name || name,
      description: parsed.meta.description || `${name} skill`,
      argumentHint: parsed.meta['argument-hint'] || '<args>',
      raw,
      body: parsed.body,
    });
  }
  return skills;
}

function headerFor(skillName) {
  return (
    `<!-- AUTO-GENERATED from .claude/skills/${skillName}/SKILL.md \u2014 do not edit directly.\n` +
    `     Run \`node scripts/sync-skills.mjs\` to regenerate. -->\n\n`
  );
}

const noArgs = (text) => text.replace(/\$ARGUMENTS/g, 'the arguments provided by the user');

function syncSkill(skill) {
  const { name, description, argumentHint, raw, body } = skill;
  console.log(`\nSyncing /${name}...`);
  const HEADER = headerFor(name);

  // 1. Codex CLI — same SKILL.md format, same $ARGUMENTS syntax
  write(`.codex/skills/${name}/SKILL.md`, raw);

  // 2. GitHub Copilot — same SKILL.md format
  write(`.github/skills/${name}/SKILL.md`, raw);

  // 3. Cursor — plain markdown, no argument substitution support
  write(`.cursor/commands/${name}.md`, HEADER + noArgs(body));

  // 4. Windsurf — markdown workflow
  write(`.windsurf/workflows/${name}.md`, HEADER + noArgs(body));

  // 5. Gemini CLI — TOML format, {{args}} for arguments
  const geminiBody = body.replace(/\$ARGUMENTS/g, '{{args}}');
  write(
    `.gemini/commands/${name}.toml`,
    `# AUTO-GENERATED from .claude/skills/${name}/SKILL.md\n` +
      `# Run \`node scripts/sync-skills.mjs\` to regenerate.\n\n` +
      `description = ${JSON.stringify(description)}\n\n` +
      `[prompt]\ntext = '''\n${geminiBody}\n'''\n`
  );

  // 6. OpenCode — markdown + YAML frontmatter, $ARGUMENTS works natively
  write(
    `.opencode/commands/${name}.md`,
    `---\ndescription: ${JSON.stringify(description)}\n---\n${HEADER}${body}`
  );

  // 7. Augment Code — markdown + YAML frontmatter
  write(
    `.augment/commands/${name}.md`,
    `---\ndescription: ${JSON.stringify(description)}\nargument-hint: ${JSON.stringify(argumentHint)}\n---\n${HEADER}${body}`
  );

  // 8. Continue — prompt file with invokable: true
  write(
    `.continue/commands/${name}.md`,
    `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\ninvokable: true\n---\n${HEADER}${body}`
  );

  // 9. Amazon Q — JSON agent definition
  write(
    `.amazonq/cli-agents/${name}.json`,
    JSON.stringify(
      {
        name,
        description,
        prompt: noArgs(body),
        fileContext: ['AGENTS.md', 'docs/research/**'],
      },
      null,
      2
    ) + '\n'
  );
}

// --- Run ---

const skills = discoverSkills();
if (skills.length === 0) {
  console.error('No skills found under .claude/skills/');
  process.exit(1);
}

console.log(`Found ${skills.length} skill(s): ${skills.map((s) => s.name).join(', ')}`);

for (const skill of skills) {
  syncSkill(skill);
}

console.log(`\nDone! ${skills.length * 9} platform command files generated from ${skills.length} source skill(s).`);
