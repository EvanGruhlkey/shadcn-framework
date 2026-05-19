<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Launchframe

## What This Is
Launchframe is a reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just run `/clone-website <url1> [<url2> ...]`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — supplemented by extracted SVGs in `src/components/icons.tsx`)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Motion (install on demand, match the target):**
  - `motion` — successor to `framer-motion`. Default animation library. `import { motion, AnimatePresence } from "motion/react"`.
  - `lenis` — for smooth scroll, only if the target uses it.
  - `lottie-react` — for Bodymovin JSON animations detected in the target.
  - `react-typewriter-text` / `@char-motion/react` — for typewriter, terminal, and ASCII / scramble animations (Linear, Vercel, Anthropic-style "agent typing" effects).
  - `react-fast-marquee` — for infinite logo/testimonial strips, only if needed.
  - `@splinetool/react-spline`, `three` / `@react-three/fiber`, `@rive-app/react-canvas` — only when the target actually ships Spline / WebGL / Rive.
- **Media:**
  - Images → `public/images/` (Next `<Image>` with explicit width/height)
  - Videos → `public/videos/` with posters in `public/images/` (mirror `autoplay muted playsInline loop preload` from the source)
  - Lottie → `public/lottie/`
  - Favicons / OG → `public/seo/`
- **Deployment:** Vercel

## Motion Rules
- Components that use `motion`, `useScroll`, `useEffect`, `useState`, or any browser API MUST start with `"use client"`.
- Match the target's exact `duration`, `ease`, `delay`, and `stagger` — write them in spec files, not "feels about right".
- Always provide a `prefers-reduced-motion: reduce` fallback (opacity-only fade or instant snap).
- Never strip animations during rebrand (see `/launchframe`); swap content, keep motion.

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
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters

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
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing ANY `.claude/skills/<skill-name>/SKILL.md` (e.g. `clone-website`, `launchframe`), run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms. The script auto-discovers every skill under `.claude/skills/`.

@docs/research/INSPECTION_GUIDE.md
