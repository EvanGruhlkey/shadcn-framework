# Design system — media, icons, motion, shadcn

This document is the **product-facing design system** for pages built from
`@framework/blocks` and the studio theme. It complements `rules/design-rules.md`
(which stays the hard contract) with **implementation defaults** so layouts do
not read as typography-only shells.

Load this file during generation (`prompts/page-generation.md` pre-flight) and
when extending blocks or studio UI.

---

## 1. Stack (in order of preference)

| Layer | Use for |
| ----- | ------- |
| **shadcn/ui tokens** | Color, radius, border, ring, spacing — `globals.css` semantic variables + Tailwind `theme.extend` in `apps/studio/tailwind.config.ts`. |
| **Photography & video** | Hero and deep-dive media: rights-cleared images, `alt`, stable dimensions; video only with `controls`, no autoplay (`rules/design-rules.md` §5–§6). |
| **Lucide** (`lucide-react`) | Feature icons, list bullets, nav affordances — import from `@framework/blocks` curated re-export `marketingIcons` (see `packages/blocks/_lib/marketing-icons.ts`) so sizes stay consistent. |
| **Framer Motion** (`framer-motion`) | Enter transitions, staggered lists — use `FadeUp`, `Stagger`, and block-level patterns; always gate with `useReducedMotion()` (`rules/design-rules.md` §6). |
| **Utility classes** | `ds-*` classes in `apps/studio/app/globals.css` (`@layer components`) for framed media and icon tiles when you are not composing the React helpers. |
| **tailwindcss-animate** | Installed in the studio app — `animate-in`, `fade-in`, `slide-in-from-bottom-2`, etc., for lightweight entrances when Framer Motion is not used. |

---

## 2. Media framing

- Wrap marketing images (Unsplash, uploads, `next/image`) in **`MediaFrame`** from `@framework/blocks`, **or** the **`ds-media-frame`** class on a `<figure>` / container. Same visual language: border, soft ring, card background, radius aligned to `--radius`.
- Pair with **`MediaCaption`** (or **`ds-media-caption`**) for credits and licenses; keep captions in `text-muted-foreground` and `text-xs`.
- Prefer aspect ratios from Tailwind: **`aspect-video`** (hero), **`aspect-[4/3]`** (cards), **`aspect-square`** (avatars). Reserve **`aspect-[21/9]`** only for cinematic heroes.

---

## 3. Icons

- **Do not** hand-draw generic 12×12 SVGs for product features when a Lucide icon
  communicates the same role — use the marketing icon set for parity with
  shadcn-style dashboards.
- Icon stroke: default Lucide `strokeWidth` is fine; inside dense tiles use
  **`className="size-5 shrink-0"`** (or `h-5 w-5`) so `FeatureGridThree` slots
  stay aligned.
- Integration marks (Slack, Discord, …) stay separate: small brand SVGs or
  raster next to copy that names the integration (`rules/design-rules.md` §5).

---

## 4. Motion

- Prefer **`FadeUp`**, **`Stagger`**, and block built-ins (e.g. agent transcript)
  over ad-hoc `useEffect` + class toggles.
- Durations and easing live in **`motion-tokens`** (`packages/blocks/_lib/motion-tokens.ts`) so pages and blocks stay within the same envelope.
- Optional **CSS** entrance: `tailwindcss-animate` is enabled in the studio app
  for `animate-in` / `fade-in` utilities when Framer Motion is not needed.

---

## 5. shadcn alignment

- Blocks use **`Button`**, **`Action`**, **`Card`**, **`Section`**, **`Eyebrow`**
  from `@framework/blocks` — they mirror shadcn variable names so dropping in
  generated `components/ui/button` from the shadcn CLI remains a swap of imports
  only.
- When a project adds more shadcn primitives ( **`Separator`**, **`Badge`** ),
  compose them **inside** blocks or generated sections; do not fork token names.

---

## 6. Theming note (neutral “infra” + depth)

The default `:root` palette leans **cool neutral** (slate-like) with slightly
separated **card** surfaces so marketing pages gain depth without a second
accent hue. Custom brands should override the same CSS variables, not introduce
parallel hex palettes in JSX (`rules/design-rules.md` §4).
