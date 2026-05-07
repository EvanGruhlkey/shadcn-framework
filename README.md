# shadcn-ui-framework

> Point it at a few SaaS sites you admire. Get back a drop-in shadcn/ui
> design system you can build your own site on top of.

`shadcn-ui-framework` is a research-oriented framework for analyzing
high-performing SaaS websites and translating recurring interface patterns
into original [shadcn/ui](https://ui.shadcn.com) components, layouts, and
AI-generation rules.

It is **not** a website cloning tool. It does not reproduce source code,
brand assets, logos, illustrations, exact copywriting, or pixel-perfect
layouts. It extracts high-level **design tokens** (colors, type scale,
spacing rhythm, radii, shadows) and **structural patterns**, then
synthesizes an original design system you can use to build your own.

---

## The headline command

```bash
npm install
npx playwright install chromium
npm run extract -- https://site-a.example https://site-b.example https://site-c.example
```

That's it. After it runs, look in `output/<runId>/`:

```txt
output/20260506-1953/
├── tokens.json          # every value, machine-readable
├── tailwind.config.ts   # drop-in Tailwind theme
├── globals.css          # drop-in shadcn-compatible CSS variables
├── theme-preview.tsx    # render this to eyeball the system
├── REPORT.md            # what was extracted, from where, why
├── run.json             # full run metadata (sources, timing, status)
├── screenshots/         # the captured PNGs
└── raw/                 # per-site raw token observations
```

Drop `tailwind.config.ts` and `globals.css` into a fresh
[shadcn/ui project](https://ui.shadcn.com/docs/installation/next) and you
have an original design system inspired by the sites you picked — with
none of their copy, layout, or brand assets attached.

### What the extractor actually does

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
   shadcn-compatible ramp (`--background`, `--foreground`, `--primary`, …)
   for both light and dark themes.
2. Picks a body base size from the count-weighted mode of body-range font
   sizes, then fits a single scale ratio that lands the largest observed
   heading at the `6xl` step. Substitutes proprietary type families
   (e.g. SF Pro, Söhne, Circular, Graphik) with open-source equivalents.
3. Snaps spacing values to a 4 px scale, takes the most-used buckets, and
   computes a recommended container width from the median dominant block
   width across the corpus.
4. Picks a representative radius and emits a tasteful three-stop shadow
   scale.
5. Writes drop-in files plus a Markdown report attributing every source.

```
URLs ──▶ Playwright ──▶ raw tokens.json ──▶ synthesize ──▶ DesignSystem ──▶ emit
                              (per site)                    (one corpus)
```

### CLI reference

```bash
npm run extract -- <url> [<url> ...] [options]
```

| Flag           | Default              | Notes                                      |
| -------------- | -------------------- | ------------------------------------------ |
| `--out <dir>`  | `output/<runId>`     | Override the output directory              |
| `--name <slug>`| _(unset)_            | Append a slug to the runId for findability |
| `--no-robots`  | _(off)_              | Skip robots.txt check (not recommended)    |
| `--rate <n>`   | `15`                 | Per-domain requests/minute                 |
| `--width <px>` | `1440`               | Viewport width                             |
| `--height <px>`| `900`                | Viewport height                            |

---

## What this framework explicitly is not

- It is **not** a scraper. It captures only what is publicly rendered, stores
  no HTML, and never republishes site content.
- It is **not** a clone tool. The anti-clone policy in
  [`rules/anti-clone-policy.md`](./rules/anti-clone-policy.md) is enforced
  by capture-side policy and synthesis-side normalization.
- It is **not** a component library replacement. It sits *on top* of
  shadcn/ui and produces theme files for it.

---

## What's underneath

The extract command is the front door. Underneath it sits a complete
research framework that AI coding agents can use to generate full SaaS
pages with the same design vocabulary:

```txt
shadcn-ui-framework/
├── apps/
│   └── studio/                # Next.js dashboard for browsing patterns/blocks
├── packages/
│   ├── extract/               # ← the headline `npm run extract` command
│   ├── capture/               # Playwright screenshot capture (lower level)
│   ├── analysis/              # Layout-tree extraction & section classifier
│   ├── patterns/              # Typed pattern schemas + atlas registry loader
│   ├── blocks/                # 13 original shadcn/ui blocks across 6 families
│   └── evaluation/            # Coherence / clone-risk / a11y evaluator
├── pattern-atlas/             # Formalized pattern catalog per category
├── prompts/                   # Markdown prompts for AI agents
├── rules/                     # Design / copy / anti-clone / a11y policy
├── registry/                  # shadcn-compatible custom registry manifest
└── output/                    # ← every `extract` run lands here
```

### Other commands

```bash
npm run extract        # ← the one you'll use 90% of the time
npm run studio         # Next.js dashboard at localhost:3000
npm run capture        # Lower-level Playwright capture pipeline
npm run analyze        # Run section classifier on captured screenshots
npm run formalize      # Validate the pattern-atlas/*.json files
npm run evaluate       # Grade a generated page (coherence/clone/a11y)
npm run typecheck      # Project-wide TypeScript check
```

The full pipeline (`capture → analyze → formalize → evaluate`) is
documented in the [`prompts/`](./prompts) directory and is intended to be
driven by an AI coding agent that reads the rule files first.

---

## Anti-clone policy in one paragraph

The framework captures publicly rendered pages, reads the **computed
appearance** of those pages, and synthesizes an original design system
from aggregate signals. It never stores HTML, JS, CSS, brand assets,
illustrations, logos, or copy. Proprietary type families are substituted
with open-source equivalents. Generated pages and design systems are
checked against captured corpora for structural and token-level overlap;
anything above the configured threshold fails the build. Full policy:
[`rules/anti-clone-policy.md`](./rules/anti-clone-policy.md).

---

## License

MIT. See [`LICENSE`](./LICENSE).
