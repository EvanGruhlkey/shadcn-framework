# Launchframe — subagent verification prompts

**How to use this file:** Before Phase 6, the foreman **fills or refreshes** the four prompt blocks below (they must stay **self-contained** so a subagent never needs to open the skill file). Then either:

- Spawn **four parallel** readonly agents (`Task` / team subagents / Claude Code checkers in separate worktrees), each given **one** `## Prompt — Pass N` section only, **or**
- Run the same four prompts **yourself** in order if the host has no subagents.

Each executor appends results to **`docs/research/LAUNCHFRAME_VERIFICATION.md`** using the **output contract** at the bottom.

---

## Prompt — Pass 1 — Raster media & icons

You are a **readonly verification subagent** for a Next.js clone. Repository root is this project.

**Rubric — execute fully:**

1. **Narrative slots:** Inventory every reference marketing/lifestyle/card/hero **image role** described in `docs/research/` specs vs **committed files** under `public/` (e.g. `public/images/...`) actually referenced from `src/`. **FAIL** if the reference showed a photo/panel thumbnail and this clone relies on placeholders, empty `src`, or bare gradients only.
2. List every **raster** and **video poster** and every **authored SVG / component used as an icon** referenced from `src/` (`app/`, `components/`). Confirm files exist and paths resolve.
3. Compare presentation to specs: `picture` / `source` behavior, `sizes` / responsive behavior, `object-fit` / `object-position`, dimensions / aspect-ratio, parent overflow and radius, `background-image` and pseudo-elements.
4. For SVGs/icons: `viewBox`, strokes, fills, `currentColor`, sprite usage must match specs — flag opportunistic Lucide substitutions unless the spec explicitly allowed them. Flag wrong crops, missing layers, or lazy `next/image` `fill` misuse.

Return the **output contract** below.

---

## Prompt — Pass 2 — HTML / DOM structure

You are a **readonly verification subagent** for a Next.js clone.

**Rubric — execute fully:**

Diff **PAGE_TOPOLOGY.md** (or equivalent topology in `docs/research/`) plus component specs against the React tree: **section order**, **wrapper count**, **sibling order**, scroll/sticky containers. Any flattened structure that changes stacking or scroll is **FAIL** until fixed.

Return the **output contract** below.

---

## Prompt — Pass 3 — CSS parity

You are a **readonly verification subagent** for a Next.js clone.

**Rubric — execute fully:**

Spot-check **hero, nav, first fold, footer** (and any section flagged risky in specs) against component CSS: tokens in `src/app/globals.css`, arbitrary Tailwind vs measured px from specs, **`@keyframes`** presence where required. Run **`npm run lint`** and **`npm run typecheck`**; failures = **FAIL** until green.

Return the **output contract** below.

---

## Prompt — Pass 4 — Motion & interaction

You are a **readonly verification subagent** for a Next.js clone.

**Rubric — execute fully:**

Re-walk **`docs/research/BEHAVIORS.md`** and the motion audit JSON under `## Motion audit (Chrome MCP)`: headers, carousels, scroll-driven UI, smooth-scroll libraries. Phase 5 motion QA must be **confirmed** against the reference behavior described in research — not assumed.

Return the **output contract** below.

---

## Output contract (every pass)

Append to **`docs/research/LAUNCHFRAME_VERIFICATION.md`**:

```markdown
### Pass N — <short name>
- Findings: (bullets with `path:line` where possible)
- VERDICT: PASS | FAIL
```

If the file does not exist, create it with a top heading `# Launchframe verification log`.
