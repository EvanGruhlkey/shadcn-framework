<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

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

# Website Inspection Guide

## How to Reverse-Engineer Any Website

This guide outlines what to capture when inspecting a target website via Chrome MCP or browser DevTools.

## Priority: media, SVGs, and motion (do this early)

When crawling the DOM and network, **tackle these before fine-tuning copy or spacing**:

1. **Raster imagery** — Every `<img>`, `<picture>` / `source`, `srcset` / `sizes`, CDN URLs, lazy-loaded `data-src`, `loading="lazy"` nodes, **CSS `background-image`** on the element and ancestors (including `::before` / `::after`), masks that use `url()`, `<video>` still / poster frames. Prefer **downloading** originals via scripts or MCP; if a URL is blocked or session-gated, **export a screenshot** of the element’s bounding box at a crisp DPR and store it under `public/images/`, and note the substitute in the spec.
2. **SVGs** — Inline `<svg>`, `<use>` / sprite sheets, **SVG in CSS** (`mask-image`, `background-image`), favicons as SVG, logo marks. Prefer extracting path/viewBox into React components or static files under `public/` — **recreate** from a screenshot/trace only when the markup is obfuscated or blocked.
3. **Motion & animation** — Inspect Styles for `animation`, `animation-name`, `animation-timeline`, `transition`, `transform`, `@keyframes`; check for libraries (Framer Motion, GSAP, Lottie, Lenis). Capture **durations, easings, delays, fill-modes**, scroll/view triggers, and `prefers-reduced-motion` handling. Motion often defines perceived quality — do not leave it as an afterthought.

Then continue with typography, spacing, and component structure as usual.

## Phase 1: Visual Audit

### Screenshots to Capture
- [ ] Every distinct page — desktop, tablet, mobile
- [ ] Dark mode variants (if applicable)
- [ ] Light mode variants (if applicable)
- [ ] Key interaction states (hover, active, open menus, modals)
- [ ] Loading/skeleton states
- [ ] Empty states
- [ ] Error states

### Design Tokens to Extract
- [ ] **Colors** — background, text (primary/secondary/muted), accent, border, hover, error, success, warning
- [ ] **Typography** — font family, sizes (h1-h6, body, caption, label), weights, line heights, letter spacing
- [ ] **Spacing** — padding/margin patterns (look for a scale: 4px, 8px, 12px, 16px, 24px, 32px, etc.)
- [ ] **Border radius** — buttons, cards, avatars, inputs
- [ ] **Shadows/elevation** — card shadows, dropdown shadows, modal overlay
- [ ] **Breakpoints** — when does the layout shift? (inspect with DevTools responsive mode)
- [ ] **Icons** — which icon library? custom SVGs? sizes?
- [ ] **Avatars** — sizes, shapes, fallback behavior
- [ ] **Buttons** — all variants (primary, secondary, ghost, icon-only, danger)
- [ ] **Inputs** — text fields, textareas, selects, checkboxes, toggles

## Phase 2: Component Inventory

For each distinct UI component, document:
1. **Name** — what would you call this component?
2. **Structure** — what HTML elements / child components does it contain?
3. **Variants** — does it have different sizes, colors, or states?
4. **States** — default, hover, active, disabled, loading, error, empty
5. **Responsive behavior** — how does it change at different breakpoints?
6. **Interactions** — click, hover, focus, keyboard navigation
7. **Animations** — transitions, entrance/exit animations, micro-interactions

### Common Components to Look For
- Navigation (top bar, sidebar, bottom bar)
- Cards / list items
- Buttons and links
- Forms and inputs
- Modals and dialogs
- Dropdowns and menus
- Tabs and segmented controls
- Avatars and user badges
- Loading skeletons
- Toast notifications
- Tooltips and popovers

## Phase 3: Layout Architecture

- [ ] **Grid system** — CSS Grid? Flexbox? Fixed widths?
- [ ] **Column layout** — how many columns at each breakpoint?
- [ ] **Max-width** — main content area max-width
- [ ] **Sticky elements** — header, sidebar, floating buttons
- [ ] **Z-index layers** — navigation, modals, tooltips, overlays
- [ ] **Scroll behavior** — infinite scroll, pagination, virtual scrolling

## Phase 4: Technical Stack Analysis

- [ ] **Framework** — React? Vue? Angular? Check `__NEXT_DATA__`, `__NUXT__`, `ng-version`
- [ ] **CSS approach** — Tailwind (utility classes), CSS Modules, Styled Components, Emotion, vanilla CSS
- [ ] **State management** — Redux (check DevTools), React Query, Zustand, Pinia
- [ ] **API patterns** — REST, GraphQL (check network tab for `/graphql` requests)
- [ ] **Font loading** — Google Fonts, self-hosted, system fonts
- [ ] **Image strategy** — CDN, lazy loading, srcset, WebP/AVIF
- [ ] **Animation library** — Framer Motion, GSAP, CSS transitions only

## Phase 5: Documentation Output

After inspection, create these files in `docs/research/`:
1. `DESIGN_TOKENS.md` — All extracted colors, typography, spacing
2. `COMPONENT_INVENTORY.md` — Every component with structure notes
3. `LAYOUT_ARCHITECTURE.md` — Page layouts, grid system, responsive behavior
4. `INTERACTION_PATTERNS.md` — Animations, transitions, hover states
5. `TECH_STACK_ANALYSIS.md` — What the site uses and our chosen equivalents
