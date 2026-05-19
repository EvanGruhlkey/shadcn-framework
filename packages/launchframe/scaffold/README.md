# {{PROJECT_NAME}}

Scaffolded with [Launchframe](https://github.com/EvanGruhlkey/launchframe) — a Next.js + shadcn/ui base pre-wired for AI coding agents.

## Quick start

1. Open this folder in your IDE and start your AI agent (Claude Code, Cursor, Copilot, etc.).
2. Run a slash command:
   ```
   /clone-website https://example.com
   ```
   Or clone and rebrand in one shot:
   ```
   /launchframe https://example.com "Your SaaS idea in one sentence"
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run check      # lint + typecheck + build
```

## Agent support

This project ships slash commands and rules for Claude Code, Cursor, Codex, Copilot, Windsurf, Gemini CLI, Continue, Amazon Q, Augment, OpenCode, and more. See `AGENTS.md` for project conventions.
