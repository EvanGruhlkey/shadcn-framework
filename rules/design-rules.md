# Design Rules

These rules govern every page, block, and asset produced by or with this
framework. They are loaded by generation agents before composition begins
and are checked by `packages/evaluation` after composition completes.

For **media, Lucide icons, Framer Motion defaults, and shadcn composition**,
also follow `rules/design-system.md` — it is the practical layer on top of
these constraints.

The rules are deliberately conservative. The framework optimizes for
**polished restraint** over visual novelty.

---

## 1. Composition

- Pages are composed by selecting blocks from `packages/blocks`. Agents must
  not invent new section archetypes when an existing one fits.
- Every block must occupy a clear semantic role: navigation, hero, proof,
  feature system, conversion, pricing, footer.
- A page must not contain two blocks of the same role unless explicitly
  permitted by the pattern atlas (e.g. a "split conversion" pattern with a
  conversion block above and below pricing).
- Section order is constrained by `pattern-atlas/<category>.json` →
  `recommended_order`. Reordering requires written justification.

## 2. Spacing and rhythm

- Vertical rhythm is anchored to a 4 px base and a section gap of
  `py-20 md:py-28` for marketing sections.
- Inside a section, content uses an 8 px sub-grid: gap classes must be one of
  `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `gap-10`, `gap-12`.
- Container widths default to `max-w-6xl` for marketing surfaces and
  `max-w-3xl` for editorial copy. Avoid `max-w-7xl` unless the layout is
  intentionally dense.

## 3. Typography

- Use a single sans-serif family for UI and a single mono family for code.
  Do not mix more than two type families on a page.
- Heading scale, top to bottom: `text-5xl md:text-6xl` (H1) →
  `text-3xl md:text-4xl` (H2) → `text-xl md:text-2xl` (H3). Never skip a
  level.
- Line lengths in body copy stay between 45 and 75 characters
  (`max-w-prose` or equivalent).
- Avoid uppercase tracking on long strings; reserve `tracking-wider uppercase`
  for short eyebrow labels of ≤ 4 words.

## 4. Color and contrast

- Use shadcn/ui's CSS variables (`--background`, `--foreground`, `--muted`,
  `--accent`, `--border`, `--ring`). Do not hardcode hex values in components.
- Reserve a single accent hue per page. Secondary highlights should derive
  from `--muted` or `--secondary`, not from a competing accent.
- All text must clear WCAG AA contrast against its background. The
  `responsiveness-check` evaluator flags low-contrast pairs.

## 5. Imagery and ornament

- Generated pages may use:
  - Geometric shapes built from Tailwind utilities,
  - Stock photography under permissive licenses (e.g. Unsplash) **with
    attribution metadata** — frame with **`MediaFrame`** / **`MediaCaption`**
    from `@framework/blocks` or the **`ds-media-frame`** / **`ds-media-caption`**
    utilities (`rules/design-system.md` §2),
  - Mockup placeholders shipped under `apps/studio/public/mockups`,
  - **Integration marks** (small Slack, Discord, GitHub, etc. icons) placed
    next to copy that describes connecting to that product. Treat them as
    UI affordances, not as proof that those companies use your product.
- **Lucide icons** — prefer the curated `@framework/blocks` marketing icon
  re-export (`rules/design-system.md` §3) for feature tiles and lists instead
  of anonymous inline SVGs.
- Generated pages must not use:
  - Logos, illustrations, or product screenshots from any specific real
    company **as customer proof** (logo strips, testimonials, “trusted by”
    rows) unless the user’s brief names them as real customers,
  - Stock 3D renders that imply a particular brand identity,
  - Decorative AI-generated imagery without a clear semantic role.
- **Hero media for physical or vertical products** (e.g. field services,
  retail, clinics): prefer a photograph or illustration in the hero’s media
  slot (`HeroEnterpriseSplit`’s `media` prop, or a stacked `FeatureDeepDive`
  aside) so the landing page reads as grounded. Use `next/image` with
  configured remote hosts, meaningful `alt`, and stable width/height (or
  `fill` + `sizes`) to avoid layout shift.
- **Video** is allowed only when it does not autoplay (`rules/design-rules.md`
  §6): use `controls`, `playsInline`, and ideally a `poster` frame.
- A "decorative" gradient or mesh background is permitted on at most one
  section per page.

## 6. Motion

- **Prefer [Framer Motion](https://www.framer.com/motion/)** (`framer-motion`)
  for enter transitions, staggered children, layout-safe props, and
  orchestration. Blocks ship motion behind small `"use client"` surfaces where
  hooks are required; pages may import `framer-motion` for page-level reveals
  when they still honor the limits below.
- Motion is opt-in per block via `motion="subtle"` (or equivalent) and must
  respect `prefers-reduced-motion` — use `useReducedMotion()` from
  `framer-motion` (or render static markup) in addition to any CSS
  `motion-reduce:` / `motion-safe:` fallbacks.
- Keep durations and distances modest: opacity fade-in (≤ 220 ms), translate-y
  of ≤ 8 px on enter, scale 0.98 → 1.0. No parallax, no auto-playing video, no
  infinite carousels. Prefer explicit easing arrays over `transition-all` in
  CSS.

## 7. Density

- A marketing page should contain between **5 and 8 distinct sections**.
  Below 5 reads as thin; above 8 reads as a documentation page.
- A feature-system block presents between **3 and 6 items**. If you have
  more, split into a second feature-system block with a separate value
  pillar.

## 8. Originality

- No layout in this repository may be a one-to-one recreation of a real
  product page. The clone-risk evaluator measures structural similarity
  against the captured corpus and fails the build above the threshold.
- See `rules/anti-clone-policy.md` for enforcement details.
