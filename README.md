# shadcn-ui-framework

> A research-oriented shadcn/ui framework for extracting SaaS interface patterns
> and generating original AI-assisted websites.

`shadcn-ui-framework` is a research-oriented framework for analyzing
high-performing SaaS websites and translating recurring interface patterns into
original [shadcn/ui](https://ui.shadcn.com) components, layouts, and
AI-generation rules.

It is **not** a website cloning tool. It does not reproduce source code, brand
assets, logos, illustrations, exact copywriting, or pixel-perfect layouts. It
extracts high-level design patterns and exposes them as a structured knowledge
base that AI coding agents can use to generate better SaaS websites.

---

## Why this framework exists

Modern SaaS marketing sites converge on a small, well-understood set of
interface patterns: a hero with a primary action, a logo strip used as social
proof, feature systems organized around a value pillar, conversion bands,
pricing matrices, and so on.

When AI coding agents generate marketing websites, they tend to do one of two
things wrong:

1. They produce **generic, low-density** layouts that do not resemble what
   actual SaaS teams ship.
2. They produce **derivative, near-clone** layouts that imitate a specific
   product too closely.

This framework is the missing middle layer. It captures public SaaS interfaces,
analyzes their structural composition, formalizes the recurring patterns into
typed schemas, and ships those patterns back to the agent as:

- **Original shadcn/ui blocks** that implement a pattern without copying any
  one site,
- **Pattern atlas JSON** describing each pattern's structure, props, and
  variants,
- **Generation prompts** that an agent can read before producing a page,
- **Evaluation rules** that an agent can run after producing a page to detect
  clone risk, layout incoherence, and accessibility issues.

The result: an agent that has been "trained" on the *grammar* of SaaS
interfaces, without any of the *vocabulary* being lifted from a specific brand.

---

## Core principles

1. **Pattern, not pixel.** We extract structure and intent. We never replicate
   a specific site's source, copy, or visual identity.
2. **Originality is enforced.** Every block, page, and asset shipped from this
   repo is original. Clone risk is measured automatically by the
   `evaluation` package.
3. **Restrained over generic.** Generated UI should feel polished and
   considered, not like a default landing-page template.
4. **Readable TypeScript.** No clever abstractions. Components, schemas, and
   scripts are written so a human reviewer can audit them in a single sitting.
5. **Research artifacts first.** The repo's primary outputs are structured
   artifacts (JSON, Markdown, schemas) — not a single demo site.

The full policy is enforced by the documents in [`rules/`](./rules).

---

## Repository structure

```txt
shadcn-ui-framework/
├── apps/
│   └── studio/                # Next.js research dashboard for browsing patterns
├── packages/
│   ├── capture/               # Playwright-based screenshot capture
│   ├── analysis/              # Layout-tree extraction & section classification
│   ├── patterns/              # Typed pattern schemas + registry
│   ├── blocks/                # Original shadcn/ui blocks per pattern family
│   └── evaluation/            # Page-level evaluators (clone risk, coherence, a11y)
├── datasets/
│   ├── corpora/               # Site lists organized by SaaS category
│   ├── captures/              # Captured screenshots (gitignored binaries)
│   └── observations/          # Per-site analysis output (gitignored)
├── pattern-atlas/             # Formalized pattern catalog per category
├── prompts/                   # Markdown prompts consumed by AI agents
├── rules/                     # Design / copy / anti-clone / a11y policy
└── registry/                  # shadcn-compatible custom registry manifest
```

---

## Pipeline

The framework is organized as a four-stage pipeline. Each stage produces typed
artifacts that the next stage consumes.

```
┌──────────┐   ┌──────────┐   ┌────────────┐   ┌────────────┐
│ capture  │ → │ analyze  │ → │ formalize  │ → │ evaluate   │
└──────────┘   └──────────┘   └────────────┘   └────────────┘
   .png            .json          .json            .json
 screenshots    layout trees    patterns +      page reports
                                  blocks
```

| Stage         | Package                  | Input                  | Output                              |
| ------------- | ------------------------ | ---------------------- | ----------------------------------- |
| **Capture**   | `packages/capture`       | Site manifest (URLs)   | Screenshots in `datasets/captures/` |
| **Analyze**   | `packages/analysis`      | Screenshots            | Layout trees in `datasets/observations/` |
| **Formalize** | `packages/patterns`      | Layout trees           | Pattern records in `pattern-atlas/` |
| **Evaluate**  | `packages/evaluation`    | Generated page         | Coherence / clone-risk / a11y report |

The `apps/studio` Next.js app renders the pattern atlas, the evaluation
results, and the generated blocks in a single browsable surface.

---

## Getting started

```bash
# install dependencies (npm workspaces)
npm install

# install the playwright browser binaries (only needed for capture)
npx playwright install chromium

# launch the research studio
npm run studio
```

Once the studio is running, open [http://localhost:3000](http://localhost:3000).

### Common commands

```bash
npm run studio          # start the Next.js studio in dev mode
npm run capture         # capture screenshots for a corpus
npm run analyze         # analyze captured screenshots
npm run formalize       # update the pattern atlas from observations
npm run evaluate        # evaluate a generated page against the rules
npm run typecheck       # project-wide TypeScript check
```

---

## How AI agents consume this framework

A generation agent should follow this loop:

1. **Read the rules.** Load every file in [`rules/`](./rules) into context.
2. **Pick a category.** Map the user's product to one of the corpora in
   [`datasets/corpora/`](./datasets/corpora).
3. **Load the pattern atlas.** Read the matching file from
   [`pattern-atlas/`](./pattern-atlas).
4. **Compose blocks.** Use components from `packages/blocks` rather than
   inventing new layouts from scratch.
5. **Generate copy** following [`rules/copywriting-rules.md`](./rules/copywriting-rules.md).
6. **Evaluate.** Run `npm run evaluate -- <path-to-generated-page>` and resolve
   any failures before delivering.

The [`prompts/`](./prompts) directory contains step-by-step instructions for
each phase of this loop.

---

## What this framework explicitly is not

- It is **not** a scraper. It captures only what is publicly rendered, stores
  no HTML, and never republishes site content.
- It is **not** a clone tool. The anti-clone policy in
  [`rules/anti-clone-policy.md`](./rules/anti-clone-policy.md) is enforced
  automatically.
- It is **not** a component library replacement. It sits *on top* of
  shadcn/ui and assumes you have it installed.
- It is **not** a no-code site builder. It is a knowledge layer for AI agents
  and engineers who use them.

---

## License

MIT. See [`LICENSE`](./LICENSE).
