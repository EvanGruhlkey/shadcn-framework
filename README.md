# launchframe

> Point Launchframe at SaaS sites you admire. Get back a drop-in
> shadcn/ui design system you can build your own UI on top of —
> with a ready-made handoff for Cursor or Claude Code.

`launchframe` opens each URL in headless Chromium, harvests the
**computed appearance** of the rendered page (colors, type, spacing,
radii, shadows), and synthesizes an original design system as
`tailwind.config.ts` + `globals.css` + `tokens.json` + a Markdown
report and an AI-handoff file.

It is **not** a website cloning tool. It does not store HTML, JS, CSS,
brand assets, logos, illustrations, or copywriting. Proprietary type
families are substituted with open-source equivalents. See the
[anti-clone policy](./rules/anti-clone-policy.md).

---

## Quick start (any folder)

The design system is written to **`./output/<runId>/`** in whatever
directory you run the command from — not inside the package.

**One time per machine** (Chromium for Playwright):

```bash
npx playwright install chromium
```

**Every time you want a new theme:**

```bash
cd path/to/your-app-or-empty-folder
npx launchframe@latest https://site-a.example https://site-b.example
```

When it finishes, open **`output/<runId>/FOR_AI.md`** — it tells you
exactly how to attach the folder in **Cursor** or **Claude Code** so
the model follows your tokens when building UI.

```txt
output/<runId>/
├── FOR_AI.md            ← paste / @-attach this for your AI (handoff instructions)
├── tokens.json          ← every value, machine-readable
├── tailwind.config.ts   ← drop-in Tailwind theme
├── globals.css          ← drop-in shadcn-compatible CSS variables
├── theme-preview.tsx    ← render this to eyeball the system
├── REPORT.md            ← what was extracted, from where, why
├── run.json             ← full run metadata (sources, timing, status)
├── screenshots/         ← captured PNGs
└── raw/                 ← per-site raw token observations
```

---

## Hand the output to your AI

1. Run the command above so `output/<runId>/` exists.
2. Either:
   - **Cursor:** `@`-attach the folder (or `FOR_AI.md` + `REPORT.md` + `tokens.json`) and paste the instruction block from `FOR_AI.md` into Composer, or
   - **Claude Code:** copy the `output/<runId>/` folder into your project and attach it.
3. The AI's authority order is **REPORT.md → tokens.json → merge tailwind.config.ts and globals.css into the app**. It must use semantic tokens (`bg-background`, `text-muted-foreground`, `bg-primary`, …) and write **original copy only**.

---

## CLI reference

```bash
npx launchframe <url> [<url> ...] [options]
```

| Flag           | Default              | Notes                                                    |
| -------------- | -------------------- | -------------------------------------------------------- |
| `--out <dir>`  | `./output/<runId>` (under **current working directory**) | Absolute or relative path for the run folder |
| `--name <slug>`| _(unset)_            | Append a slug to the runId for findability              |
| `--no-robots`  | _(off)_              | Skip robots.txt check (not recommended)                  |
| `--rate <n>`   | `15`                 | Per-domain requests per minute                           |
| `--width <px>` | `1440`               | Viewport width                                           |
| `--height <px>`| `900`                | Viewport height                                          |

```bash
npx launchframe https://example.com --name my-brand
npx launchframe https://a.example https://b.example https://c.example --width 1280
```

---

## What the extractor actually does

For each URL:

1. Open the page in headless Chromium at a 1440 × 900 desktop viewport.
2. Take a full-page screenshot.
3. Walk the rendered DOM and harvest **computed styles** for every
   visible element:
   - Text and background colors, weighted by area
   - Font families, sizes, weights, line-heights, letter-spacing
   - Padding, gap, and margin values (snapped to a 4 px grid)
   - Border radii (mode-picked across the page)
   - Box-shadow stacks
   - Dominant container width (the layout signal)
4. Save the raw observations as JSON.

After every site is captured, the synthesizer:

1. Clusters all colors into a representative palette and derives a full
   shadcn-compatible ramp (`--background`, `--foreground`, `--primary`,
   …) for both light and dark themes.
2. Picks a body base size from the count-weighted mode of body-range
   font sizes, then fits a single scale ratio that lands the largest
   observed heading at the `6xl` step. Substitutes proprietary type
   families (e.g. SF Pro, Söhne, Circular, Graphik) with open-source
   equivalents.
3. Snaps spacing values to a 4 px scale, takes the most-used buckets,
   and computes a recommended container width from the median dominant
   block width across the corpus.
4. Picks a representative radius and emits a tasteful three-stop shadow
   scale.
5. Writes drop-in files plus a Markdown report attributing every source.

```
URLs ──▶ Playwright ──▶ raw tokens.json ──▶ synthesize ──▶ DesignSystem ──▶ emit
                              (per site)                    (one corpus)
```

---

## Run inside this repo (contributors)

```bash
git clone https://github.com/evangruhlkey/launchframe
cd launchframe
npm install
npx playwright install chromium
npm run extract -- https://site-a.example https://site-b.example
```

The repo is a monorepo that also contains a research framework for
classifying SaaS UI patterns and generating original shadcn blocks:

```txt
launchframe/
├── apps/
│   └── studio/                # Next.js dashboard for browsing patterns/blocks
├── packages/
│   ├── extract/               # ← the published CLI
│   ├── capture/               # Playwright screenshot capture (lower level)
│   ├── analysis/              # Layout-tree extraction & section classifier
│   ├── patterns/              # Typed pattern schemas + atlas registry loader
│   ├── blocks/                # Original shadcn/ui blocks across families
│   └── evaluation/            # Coherence / clone-risk / a11y evaluator
├── pattern-atlas/             # Formalized pattern catalog per category
├── prompts/                   # Markdown prompts for AI agents
├── rules/                     # Design / copy / anti-clone / a11y policy
├── registry/                  # shadcn-compatible custom registry manifest
└── output/                    # ← every `extract` run lands here
```

Other commands (repo-only):

```bash
npm run studio         # Next.js dashboard at localhost:3000
npm run capture        # Lower-level Playwright capture pipeline
npm run analyze        # Run section classifier on captured screenshots
npm run formalize      # Validate the pattern-atlas/*.json files
npm run evaluate       # Grade a generated page (coherence/clone/a11y)
npm run typecheck      # Project-wide TypeScript check
```

---

## What this is not

- **Not a scraper.** It captures only what is publicly rendered, stores
  no HTML, and never republishes site content.
- **Not a clone tool.** Anti-clone policy is enforced by capture-side
  policy and synthesis-side normalization.
- **Not a component library replacement.** It sits *on top* of
  shadcn/ui and produces theme files for it.

---

## Anti-clone policy in one paragraph

Launchframe captures publicly rendered pages, reads the **computed
appearance** of those pages, and synthesizes an original design system
from aggregate signals. It never stores HTML, JS, CSS, brand assets,
illustrations, logos, or copy. Proprietary type families are
substituted with open-source equivalents. Generated pages and design
systems are checked against captured corpora for structural and
token-level overlap; anything above the configured threshold fails the
build. Full policy:
[`rules/anti-clone-policy.md`](./rules/anti-clone-policy.md).

---

## License

MIT. See [`LICENSE`](./LICENSE).
