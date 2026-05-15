#!/usr/bin/env node

/**
 * Generates invokable skill/command files for all supported AI coding platforms.
 *
 * Source of truth: every `.claude/skills/<skill-id>/SKILL.md` (YAML frontmatter + body).
 *
 * Required frontmatter: `description`, `argument-hint`
 * Optional: `argument-substitution` (replaces `$ARGUMENTS`; default derives from skill `name`)
 *
 * Usage: node scripts/sync-skills.mjs
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import { dirname, join } from "node:path";

import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SKILLS_DIR = join(ROOT, ".claude/skills");

function parseFrontmatterBlock(block) {
  /** @type {Record<string, string>} */

  const fm = {};

  for (const line of block.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const colon = trimmed.indexOf(":");

    if (colon === -1) continue;

    const key = trimmed.slice(0, colon).trim();

    let val = trimmed.slice(colon + 1).trim();

    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    fm[key] = val;
  }

  return fm;
}

/**

 * @param {string} sourceRel

 * @returns {{ raw: string, body: string, fm: Record<string, string> }}

 */

function readSkillSplits(sourceRel) {
  const full = join(ROOT, sourceRel);

  const raw = readFileSync(full, "utf8").replace(/\r\n/g, "\n");

  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`Could not parse frontmatter: ${sourceRel}`);
  }

  const fm = parseFrontmatterBlock(match[1]);

  const body = match[2];

  return { raw, body, fm };
}

/**

 * @param {string} id

 */

function loadSkillMeta(id) {
  const sourceRel = `.claude/skills/${id}/SKILL.md`.replace(/\\/g, "/");

  const { raw, body, fm } = readSkillSplits(sourceRel);

  const description = (fm.description ?? "").trim();

  if (!description) {
    throw new Error(`${sourceRel} must set YAML frontmatter "description:"`);
  }

  const skillName = (fm.name ?? id).trim();

  const augmentArgumentHint =
    (fm["argument-hint"] ?? "").trim() || "(see skill SOURCE)";

  let plainSubstitution = (fm["argument-substitution"] ?? "").trim();

  if (!plainSubstitution) {
    plainSubstitution = `the arguments you received with ${skillName.includes("/") ? skillName : `/${skillName}`}`;
  }

  return {
    id,

    sourceRel,

    shortDesc: description,

    augmentArgumentHint,

    plainSubstitution,

    raw,

    body,

    fm,
  };
}

/**

 * @returns {string[]}

 */

function discoverSkillIds() {
  if (!existsSync(SKILLS_DIR)) {
    return [];
  }

  return readdirSync(SKILLS_DIR)
    .filter((name) => {
      if (name.startsWith(".")) return false;

      return existsSync(join(SKILLS_DIR, name, "SKILL.md"));
    })

    .sort((a, b) => a.localeCompare(b));
}

function write(relPath, content) {
  const full = join(ROOT, relPath);

  mkdirSync(dirname(full), { recursive: true });

  writeFileSync(full, content, "utf8");

  console.log(`  \u2713 ${relPath}`);
}

/**

 * @param {ReturnType<typeof loadSkillMeta>} meta

 */

function syncSkill(meta) {
  const {
    id,

    sourceRel,

    shortDesc,

    augmentArgumentHint,

    plainSubstitution,

    raw,

    body,
  } = meta;

  const noArgs = (text) => text.replace(/\$ARGUMENTS/g, plainSubstitution);

  const header =
    `<!-- AUTO-GENERATED from ${sourceRel} \u2014 do not edit directly.\n` +
    `     Run \`node scripts/sync-skills.mjs\` to regenerate. -->\n\n`;

  console.log(`\nSyncing ${id}...\n  Source: ${sourceRel}\n`);

  write(`.codex/skills/${id}/SKILL.md`, raw);

  write(`.github/skills/${id}/SKILL.md`, raw);

  write(`.cursor/commands/${id}.md`, header + noArgs(body));

  write(`.windsurf/workflows/${id}.md`, header + noArgs(body));

  const geminiBody = body.replace(/\$ARGUMENTS/g, "{{args}}");

  write(
    `.gemini/commands/${id}.toml`,

    `# AUTO-GENERATED from ${sourceRel}\n` +
      `# Run \`node scripts/sync-skills.mjs\` to regenerate.\n\n` +
      `description = ${JSON.stringify(shortDesc)}\n\n` +
      `[prompt]\ntext = '''\n${geminiBody}\n'''\n`,
  );

  write(
    `.opencode/commands/${id}.md`,

    `---\ndescription: ${JSON.stringify(shortDesc)}\n---\n${header}${body}`,
  );

  write(
    `.augment/commands/${id}.md`,

    `---\ndescription: ${JSON.stringify(shortDesc)}\nargument-hint: ${JSON.stringify(augmentArgumentHint)}\n---\n${header}${body}`,
  );

  write(
    `.continue/commands/${id}.md`,

    `---\nname: ${id}\ndescription: ${JSON.stringify(shortDesc)}\ninvokable: true\n---\n${header}${body}`,
  );

  write(
    `.amazonq/cli-agents/${id}.json`,

    JSON.stringify(
      {
        name: id,

        description: shortDesc,

        prompt: noArgs(body),

        fileContext: ["AGENTS.md", "docs/research/**"],
      },

      null,

      2,
    ) + "\n",
  );
}

console.log(
  "Syncing skills to all platforms...\nSkills source: `.claude/skills/*/SKILL.md`",
);

const skillIds = discoverSkillIds();

if (skillIds.length === 0) {
  console.error("No skills found under .claude/skills/<id>/SKILL.md");

  process.exit(1);
}

/** @type {ReturnType<typeof loadSkillMeta>[]} */

const metas = [];

for (const id of skillIds) {
  try {
    metas.push(loadSkillMeta(id));
  } catch (e) {
    console.error(e.message || e);

    process.exit(1);
  }
}

for (const meta of metas) {
  syncSkill(meta);
}

const totalFiles = metas.length * 9;

console.log(
  `\nDone! ${totalFiles} platform files generated (${metas.length} skill(s) \u00d7 9 targets).`,
);
