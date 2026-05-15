<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — use **`/launchframe <url> "saas idea"`** for the full pixel-perfect clone plus SaaS landing copy (`src/lib/launchframe-config.ts`, `launchframe.context.json`, `docs/research/LAUNCHFRAME.md`). For a **new empty folder** only, **`npx launchframe@latest`** unpacks this template; then run **`/launchframe`** in that project with your URL and pitch.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide ships as a default only — **`/launchframe` clones must lift reference SVG sprites/paths/masks first** so UI icons match the source; Lucide fills gaps only where documented equivalent
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site where they are interchangeable chrome; **`/launchframe`** overlays your SaaS pitch on headings and CTAs. **Marketing photographs and illustrative hero/feature imagery are not photocopied**: you **must** ship **committed files** under `public/images/` (etc.) for every such slot — **generate them yourself** with your host **image-generation** tool (prompts tied to the SaaS idea), wire into components, supplement with UI mock composites only if helpful. Blank placeholders count as unfinished. Record paths in `docs/research/LAUNCHFRAME.md`
- **Beauty-first** — every pixel matters
- **DOM crawl priority** — when walking the target page, emphasize **images** (raster, responsive sources, CSS backgrounds), **SVGs** (inline icons, sprites, masks — **copy extracted geometry**, do not approximate with unrelated Lucide glyphs), then **motion** (**copy** `@keyframes`, `transition`/`animation` timings, scroll triggers, carousel staggers via Chrome MCP / CSS sources). **Measure and mirror** mounting and styling from the DOM; scrape **permission-neutral** bytes when appropriate. When a raster slot must be original for brand safety, **author** replacements and label them in research notes — **that never waives SVG or animation fidelity**

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- **`/launchframe` Phase 6 verification** must always run: prompt text lives in **`docs/research/LAUNCHFRAME_SUBAGENTS.md`**; results in **`docs/research/LAUNCHFRAME_VERIFICATION.md`**. Use four parallel **Task**/subagents (paste one `## Prompt — Pass …` section per agent) or run all four sequentially yourself — never skip verification.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing **any** `SKILL.md` under `.claude/skills/<skill-id>/`, run `node scripts/sync-skills.mjs` to regenerate that skill’s slash commands/workflows for **every supported platform** (discovered automatically).

@docs/research/INSPECTION_GUIDE.md
