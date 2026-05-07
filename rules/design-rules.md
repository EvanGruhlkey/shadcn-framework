# Design Rules

These rules govern every page, block, and asset produced by or with this
framework. They are loaded by generation agents before composition begins
and are checked by `packages/evaluation` after composition completes.

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
    attribution metadata**,
  - Mockup placeholders shipped under `apps/studio/public/mockups`.
- Generated pages must not use:
  - Logos, illustrations, or product screenshots from any specific real
    company,
  - Stock 3D renders that imply a particular brand identity,
  - Decorative AI-generated imagery without a clear semantic role.
- A "decorative" gradient or mesh background is permitted on at most one
  section per page.

## 6. Motion

- Default to no motion. Motion is opt-in per block via a `motion="subtle"`
  prop and must respect `prefers-reduced-motion`.
- Permitted motion primitives: opacity fade-in (≤ 200 ms), translate-y of ≤
  8 px on enter, scale of 0.98 → 1.0. No parallax, no auto-playing video,
  no infinite carousels.

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
