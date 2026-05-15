# Launchframe

Next.js + shadcn/ui + Tailwind v4 template for cloning a reference site and layering your SaaS pitch—wired for AI agents. Project rules for agents: **`AGENTS.md`**. In Cursor (and similar), use the **`/launchframe`** command with a URL and your pitch in quotes.

Requires **Node.js 24+**.

## Quick start

**You already have this repo**

```bash
npm install
npm run dev
```

**New folder**

```bash
mkdir my-app && cd my-app
npx launchframe@latest
```

That unpacks the template and runs `npm install` unless you pass `--skip-install`. Defaults live in **`src/lib/launchframe-config.ts`** (optional: `LAUNCHFRAME_SOURCE_URL` and `LAUNCHFRAME_SAAS_IDEA` in the environment when you scaffold).

## Scripts

| Command | What it does |
| -------- | ------------- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run check` | Lint, typecheck, then build |

Took inspiration from [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template).

MIT
