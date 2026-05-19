---
description: "Reverse-engineer and clone one or more websites in one shot — extracts assets, CSS, and content section-by-section and proactively dispatches parallel builder agents in worktrees as it goes. Use this whenever the user wants to clone, replicate, rebuild, reverse-engineer, or copy any website. Also triggers on phrases like \"make a copy of this site\", \"rebuild this page\", \"pixel-perfect clone\". Provide one or more target URLs as arguments."
argument-hint: "<url1> [<url2> ...]"
---
<!-- AUTO-GENERATED from .claude/skills/clone-website/SKILL.md — do not edit directly.
     Run `node scripts/sync-skills.mjs` to regenerate. -->


# Clone Website

You are about to reverse-engineer and rebuild **$ARGUMENTS** as pixel-perfect clones.

When multiple URLs are provided, process them independently and in parallel where possible, while keeping each site's extraction artifacts isolated in dedicated folders (for example, `docs/research/<hostname>/`).

This is not a two-phase process (inspect then build). You are a **foreman walking the job site** — as you inspect each section of the page, you write a detailed specification to a file, then hand that file to a specialist builder agent with everything they need. Extraction and construction happen in parallel, but extraction is meticulous and produces auditable artifacts.

## Scope Defaults

The target is whatever page `$ARGUMENTS` resolves to. Clone exactly what's visible at that URL. Unless the user specifies otherwise, use these defaults:

- **Fidelity level:** Pixel-perfect — exact match in colors, spacing, typography, animations
- **In scope:** Visual layout and styling, component structure and interactions, responsive design, mock data for demo purposes
- **Out of scope:** Real backend / database, authentication, real-time features, SEO optimization, accessibility audit
- **Customization:** None — pure emulation

If the user provides additional instructions (specific fidelity level, customizations, extra context), honor those over the defaults.

## Pre-Flight

1. **Browser automation is required.** Check for available browser MCP tools (Chrome MCP, Playwright MCP, Browserbase MCP, Puppeteer MCP, etc.). Use whichever is available — if multiple exist, prefer Chrome MCP. If none are detected, ask the user which browser tool they have and how to connect it. This skill cannot work without browser automation.
2. Parse `$ARGUMENTS` as one or more URLs. Normalize and validate each URL; if any are invalid, ask the user to correct them before proceeding. For each valid URL, verify it is accessible via your browser MCP tool.
3. Verify the base project builds: `npm run build`. The Next.js + shadcn/ui + Tailwind v4 scaffold should already be in place. If not, tell the user to set it up first.
4. Create the output directories if they don't exist: `docs/research/`, `docs/research/components/`, `docs/design-references/`, `scripts/`. For multiple clones, also prepare per-site folders like `docs/research/<hostname>/` and `docs/design-references/<hostname>/`.
5. When working with multiple sites in one command, optionally confirm whether to run them in parallel (recommended, if resources allow) or sequentially to avoid overload.

## Guiding Principles

These are the truths that separate a successful clone from a "close enough" mess. Internalize them — they should inform every decision you make.

### 1. Completeness Beats Speed

Every builder agent must receive **everything** it needs to do its job perfectly: screenshot, exact CSS values, downloaded assets with local paths, real text content, component structure. If a builder has to guess anything — a color, a font size, a padding value — you have failed at extraction. Take the extra minute to extract one more property rather than shipping an incomplete brief.

### 2. Small Tasks, Perfect Results

When an agent gets "build the entire features section," it glosses over details — it approximates spacing, guesses font sizes, and produces something "close enough" but clearly wrong. When it gets a single focused component with exact CSS values, it nails it every time.

Look at each section and judge its complexity. A simple banner with a heading and a button? One agent. A complex section with 3 different card variants, each with unique hover states and internal layouts? One agent per card variant plus one for the section wrapper. When in doubt, make it smaller.

**Complexity budget rule:** If a builder prompt exceeds ~150 lines of spec content, the section is too complex for one agent. Break it into smaller pieces. This is a mechanical check — don't override it with "but it's all related."

### 3. Real Content, Real Assets

Extract the actual text, images, videos, and SVGs from the live site. This is a clone, not a mockup. Use `element.textContent`, download every `<img>` and `<video>`, extract inline `<svg>` elements as React components. The only time you generate content is when something is clearly server-generated and unique per session.

**Layered assets matter.** A section that looks like one image is often multiple layers — a background watercolor/gradient, a foreground UI mockup PNG, an overlay icon. Inspect each container's full DOM tree and enumerate ALL `<img>` elements and background images within it, including absolutely-positioned overlays. Missing an overlay image makes the clone look empty even if the background is correct.

### 4. Foundation First

Nothing can be built until the foundation exists: global CSS with the target site's design tokens (colors, fonts, spacing), TypeScript types for the content structures, and global assets (fonts, favicons). This is sequential and non-negotiable. Everything after this can be parallel.

### 5. Extract How It Looks AND How It Behaves

A website is not a screenshot — it's a living thing. Elements move, change, appear, and disappear in response to scrolling, hovering, clicking, resizing, and time. If you only extract the static CSS of each element, your clone will look right in a screenshot but feel dead when someone actually uses it.

For every element, extract its **appearance** (exact computed CSS via `getComputedStyle()`) AND its **behavior** (what changes, what triggers the change, and how the transition happens). Not "it looks like 16px" — extract the actual computed value. Not "the nav changes on scroll" — document the exact trigger (scroll position, IntersectionObserver threshold, viewport intersection), the before and after states (both sets of CSS values), and the transition (duration, easing, CSS transition vs. JS-driven vs. CSS `animation-timeline`).

Examples of behaviors to watch for — these are illustrative, not exhaustive. The page may do things not on this list, and you must catch those too:
- A navbar that shrinks, changes background, or gains a shadow after scrolling past a threshold
- Elements that animate into view when they enter the viewport (fade-up, slide-in, stagger delays)
- Sections that snap into place on scroll (`scroll-snap-type`)
- Parallax layers that move at different rates than the scroll
- Hover states that animate (not just change — the transition duration and easing matter)
- Dropdowns, modals, accordions with enter/exit animations
- Scroll-driven progress indicators or opacity transitions
- Auto-playing carousels or cycling content
- Dark-to-light (or any theme) transitions between page sections
- **Tabbed/pill content that cycles** — buttons that switch visible card sets with transitions
- **Scroll-driven tab/accordion switching** — sidebars where the active item auto-changes as content scrolls past (IntersectionObserver, NOT click handlers)
- **Smooth scroll libraries** (Lenis, Locomotive Scroll) — check for `.lenis` class or scroll container wrappers
- **Typewriter / terminal / "AI agent" animations** — characters appearing one at a time inside a `<pre>`, terminal frame, chat bubble, or command palette (look for monospace fonts + blinking caret + sequential text reveal)
- **Animated code diffs** — code blocks where red `-` lines fade out and green `+` lines fade/slide in (very common on dev-tool sites like Linear, Vercel, Supabase)
- **ASCII / character-grid animations** — wave, matrix-rain, scramble-to-text, glyph-shuffle effects (often a fixed-width grid of `<span>`s mutating on a timer or scroll)
- **Lottie / Bodymovin** — look for `<lottie-player>` custom elements, `lottie-web` script tags, or `.json` requests in the network panel
- **Canvas / WebGL / Three.js / Spline / Rive scenes** — `<canvas>` elements, `iframe[src*="spline.design"]`, `.riv` files, shader-driven hero backgrounds
- **Marquee / ticker / infinite logo strips** — horizontally scrolling rows of logos or quotes (CSS `animation: scroll Xs linear infinite` or `react-fast-marquee`)
- **Number tickers / count-up** — stats animating from 0 to a final value when in view
- **Magnetic / cursor-following elements** — buttons or blobs that drift toward the mouse

### 6. Identify the Interaction Model Before Building

This is the single most expensive mistake in cloning: building a click-based UI when the original is scroll-driven, or vice versa. Before writing any builder prompt for an interactive section, you must definitively answer: **Is this section driven by clicks, scrolls, hovers, time, or some combination?**

How to determine this:
1. **Don't click first.** Scroll through the section slowly and observe if things change on their own as you scroll.
2. If they do, it's scroll-driven. Extract the mechanism: `IntersectionObserver`, `scroll-snap`, `position: sticky`, `animation-timeline`, or JS scroll listeners.
3. If nothing changes on scroll, THEN click/hover to test for click/hover-driven interactivity.
4. Document the interaction model explicitly in the component spec: "INTERACTION MODEL: scroll-driven with IntersectionObserver" or "INTERACTION MODEL: click-to-switch with opacity transition."

A section with a sticky sidebar and scrolling content panels is fundamentally different from a tabbed interface where clicking switches content. Getting this wrong means a complete rewrite, not a CSS tweak.

### 7. Extract Every State, Not Just the Default

Many components have multiple visual states — a tab bar shows different cards per tab, a header looks different at scroll position 0 vs 100, a card has hover effects. You must extract ALL states, not just whatever is visible on page load.

For tabbed/stateful content:
- Click each tab/button via browser MCP
- Extract the content, images, and card data for EACH state
- Record which content belongs to which state
- Note the transition animation between states (opacity, slide, fade, etc.)

For scroll-dependent elements:
- Capture computed styles at scroll position 0 (initial state)
- Scroll past the trigger threshold and capture computed styles again (scrolled state)
- Diff the two to identify exactly which CSS properties change
- Record the transition CSS (duration, easing, properties)
- Record the exact trigger threshold (scroll position in px, or viewport intersection ratio)

### 8. Spec Files Are the Source of Truth

Every component gets a specification file in `docs/research/components/` BEFORE any builder is dispatched. This file is the contract between your extraction work and the builder agent. The builder receives the spec file contents inline in its prompt — the file also persists as an auditable artifact that the user (or you) can review if something looks wrong.

The spec file is not optional. It is not a nice-to-have. If you dispatch a builder without first writing a spec file, you are shipping incomplete instructions based on whatever you can remember from a browser MCP session, and the builder will guess to fill gaps.

### 9. Build Must Always Compile

Every builder agent must verify `npx tsc --noEmit` passes before finishing. After merging worktrees, you verify `npm run build` passes. A broken build is never acceptable, even temporarily.

### 10. Motion Is Design, Not Polish

Modern marketing sites — Linear, Vercel, Supabase, Stripe, Anthropic, OpenAI — are defined by their motion as much as their layout. A clone that nails every pixel but ships a dead, motionless page is a failed clone. The animation IS the design.

You must always:

- **Default to `motion` (the successor to Framer Motion)** for any non-trivial animation. Install with `npm install motion`, import as `import { motion } from "motion/react"`. Use `motion/react-client` in the Next.js App Router when you want to keep server boundaries clean.
- **Install ASCII / typewriter helpers when needed.** If you detect terminal-style text reveal, animated code blocks, scramble effects, or character-grid art, install `react-typewriter-text`, `@char-motion/react`, or `react-ascii-text` — whichever fits the effect. Do not roll a brittle `setTimeout` typewriter when a dedicated hook will do the job in 5 lines.
- **Bring in Lottie when Lottie is detected.** If you find `<lottie-player>` or a `.json` request that looks like Bodymovin output, install `lottie-react`, download the JSON to `public/lottie/`, and render with `<Lottie animationData={json} loop autoplay />`.
- **Preserve the exact tempo.** Match the original's duration, easing, stagger, and delay. A 200ms ease-out is a different design from a 600ms spring — write the numbers into the spec.
- **Animations are part of the spec, not an afterthought.** Every component spec has a "Motion & Media" block (see template below). Builders that ignore it ship a dead component.

If a section is animation-heavy (hero mockups, AI-agent demos, animated diffs), treat the motion as the primary deliverable and the static styling as secondary. The user will judge the clone by whether it feels alive.

## Phase 1: Reconnaissance

Navigate to the target URL with browser MCP.

### Screenshots
- Take **full-page screenshots** at desktop (1440px) and mobile (390px) viewports
- Save to `docs/design-references/` with descriptive names
- These are your master reference — builders will receive section-specific crops/screenshots later

### Global Extraction
Extract these from the page before doing anything else:

**Fonts** — Inspect `<link>` tags for Google Fonts or self-hosted fonts. Check computed `font-family` on key elements (headings, body, code, labels). Document every family, weight, and style actually used. Configure them in `src/app/layout.tsx` using `next/font/google` or `next/font/local`.

**Colors** — Extract the site's color palette from computed styles across the page. Update `src/app/globals.css` with the target's actual colors in the `:root` and `.dark` CSS variable blocks. Map them to shadcn's token names (background, foreground, primary, muted, etc.) where they fit. Add custom properties for colors that don't map to shadcn tokens.

**Favicons & Meta** — Download favicons, apple-touch-icons, OG images, webmanifest to `public/seo/`. Update `layout.tsx` metadata.

**Global UI patterns** — Identify any site-wide CSS or JS: custom scrollbar hiding, scroll-snap on the page container, global keyframe animations, backdrop filters, gradients used as overlays, **smooth scroll libraries** (Lenis, Locomotive Scroll — check for `.lenis`, `.locomotive-scroll`, or custom scroll container classes). Add these to `globals.css` and note any libraries that need to be installed.

### Mandatory Interaction Sweep

This is a dedicated pass AFTER screenshots and BEFORE anything else. Its purpose is to discover every behavior on the page — many of which are invisible in a static screenshot.

**Scroll sweep:** Scroll the page slowly from top to bottom via browser MCP. At each section, pause and observe:
- Does the header change appearance? Record the scroll position where it triggers.
- Do elements animate into view? Record which ones and the animation type.
- Does a sidebar or tab indicator auto-switch as you scroll? Record the mechanism.
- Are there scroll-snap points? Record which containers.
- Is there a smooth scroll library active? Check for non-native scroll behavior.

**Click sweep:** Click every element that looks interactive:
- Every button, tab, pill, link, card
- Record what happens: does content change? Does a modal open? Does a dropdown appear?
- For tabs/pills: click EACH ONE and record the content that appears for each state

**Hover sweep:** Hover over every element that might have hover states:
- Buttons, cards, links, images, nav items
- Record what changes: color, scale, shadow, underline, opacity

**Responsive sweep:** Test at 3 viewport widths via browser MCP:
- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px
- At each width, note which sections change layout (column → stack, sidebar disappears, etc.) and at approximately which breakpoint the change occurs.

Save all findings to `docs/research/BEHAVIORS.md`. This is your behavior bible — reference it when writing every component spec.

### Page Topology
Map out every distinct section of the page from top to bottom. Give each a working name. Document:
- Their visual order
- Which are fixed/sticky overlays vs. flow content
- The overall page layout (scroll container, column structure, z-index layers)
- Dependencies between sections (e.g., a floating nav that overlays everything)
- **The interaction model** of each section (static, click-driven, scroll-driven, time-driven)

Save this as `docs/research/PAGE_TOPOLOGY.md` — it becomes your assembly blueprint.

## Phase 2: Foundation Build

This is sequential. Do it yourself (not delegated to an agent) since it touches many files:

1. **Update fonts** in `layout.tsx` to match the target site's actual fonts. If the target uses a monospace font for terminal/code blocks (e.g. JetBrains Mono, Berkeley Mono, GeistMono), wire that up too — terminal animations look wrong in a UI sans.
2. **Update globals.css** with the target's color tokens, spacing values, keyframe animations, utility classes, and any **global scroll behaviors** (Lenis, smooth scroll CSS, scroll-snap on body). Port any global CSS `@keyframes` you saw (marquee, blink-caret, glow-pulse, etc.) — builders will reference them by class.
3. **Create TypeScript interfaces** in `src/types/` for the content structures you've observed
4. **Install the motion & media stack** — based on what your interaction sweep revealed, install ONLY what the target actually uses. Common picks:
   - `npm install motion` — install by default. Almost every modern marketing site needs it (enter animations, layout animations, scroll-driven reveals, gesture handlers). Import as `import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"`.
   - `npm install lenis` — install if the page has buttery non-native scroll (look for `.lenis` class on `<html>` or `<body>`, or a wrapper div with `data-lenis-prevent`).
   - `npm install lottie-react` — install if you found `<lottie-player>` tags or Bodymovin `.json` requests.
   - `npm install react-typewriter-text` (or `@char-motion/react`) — install if the site has typewriter, terminal-style, or scramble text animations.
   - `npm install react-fast-marquee` — install if the site has an infinite logo strip or testimonial ticker. (You can also hand-roll this in pure CSS — pick based on complexity.)
   - `npm install @splinetool/react-spline` — install only if you found an `iframe[src*="spline.design"]` or a `.splinecode` asset; otherwise skip.
   - `npm install three @react-three/fiber @react-three/drei` — install only if the site has a true Three.js/WebGL hero (rare; verify before installing — the bundle cost is real).
   - `npm install @rive-app/react-canvas` — install only if you found `.riv` files.
   - **Do not pre-emptively install libraries the site does not use.** Each unused dep bloats the clone. Match the target.
5. **Extract SVG icons** — find all inline `<svg>` elements on the page, deduplicate them, and save as named React components in `src/components/icons.tsx`. Name them by visual function (e.g., `SearchIcon`, `ArrowRightIcon`, `LogoIcon`). **Preserve SMIL animations** — if a `<svg>` contains `<animate>`, `<animateTransform>`, or `<animateMotion>`, keep those children intact in the React component; they're often load-bearing for the design.
6. **Download global assets** — write and run a Node.js script (`scripts/download-assets.mjs`) that downloads all images, videos, Lottie JSONs, posters, and other binary assets from the page to `public/`. Preserve meaningful directory structure:
   - `public/images/` — raster + SVG sprites
   - `public/videos/` — MP4/WebM clips (and their `poster` images)
   - `public/lottie/` — Bodymovin JSON files
   - `public/seo/` — favicons, OG, webmanifest
7. **For every `<video>` element** record: `autoplay`, `loop`, `muted`, `playsInline`, `poster`, `preload`, and which sources are present. Builders MUST mirror those attributes — a Linear/Vercel-style "background video hero" is invisible without `autoplay muted playsInline`.
8. Verify: `npm run build` passes

### Asset Discovery Script Pattern

Use browser MCP to enumerate all assets AND animation surfaces on the page:

```javascript
// Run this via browser MCP to discover all assets and motion surfaces
JSON.stringify({
  images: [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.currentSrc,
    srcset: img.srcset,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight,
    loading: img.loading,
    // Include parent info to detect layered compositions
    parentClasses: img.parentElement?.className,
    siblings: img.parentElement ? [...img.parentElement.querySelectorAll('img')].length : 0,
    position: getComputedStyle(img).position,
    zIndex: getComputedStyle(img).zIndex
  })),
  videos: [...document.querySelectorAll('video')].map(v => ({
    src: v.src || v.querySelector('source')?.src,
    sources: [...v.querySelectorAll('source')].map(s => ({ src: s.src, type: s.type })),
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted,
    playsInline: v.playsInline,
    preload: v.preload,
    width: v.videoWidth,
    height: v.videoHeight
  })),
  backgroundImages: [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none';
  }).map(el => ({
    url: getComputedStyle(el).backgroundImage,
    element: el.tagName + '.' + el.className?.split(' ')[0]
  })),
  // Inline SVGs — count + detect SMIL/CSS animations baked into them
  svgs: [...document.querySelectorAll('svg')].map(svg => ({
    classes: svg.getAttribute('class'),
    viewBox: svg.getAttribute('viewBox'),
    hasSMIL: !!svg.querySelector('animate, animateTransform, animateMotion, set'),
    hasStyleAnim: /@keyframes|animation:/.test(svg.querySelector('style')?.textContent || ''),
    innerSnippet: svg.outerHTML.slice(0, 200)
  })),
  // Lottie — both web-component form and json fetches
  lottiePlayers: [...document.querySelectorAll('lottie-player, dotlottie-player, [data-lottie], [data-anim-path]')]
    .map(el => ({ tag: el.tagName, src: el.getAttribute('src') || el.getAttribute('data-anim-path') })),
  // Canvas / WebGL / Spline / Rive
  canvases: [...document.querySelectorAll('canvas')].map(c => ({
    width: c.width, height: c.height,
    parent: c.parentElement?.tagName + '.' + c.parentElement?.className?.split(' ')[0]
  })),
  iframes: [...document.querySelectorAll('iframe')]
    .map(f => f.src)
    .filter(src => /spline|rive|figma|youtube|vimeo|loom/.test(src)),
  riveFiles: performance.getEntriesByType('resource')
    .filter(r => /\.riv$/.test(r.name)).map(r => r.name),
  // Terminal / code-diff / typewriter surfaces — heuristic, review manually
  terminalSurfaces: [...document.querySelectorAll('pre, code, [class*="terminal"], [class*="cli"], [class*="console"], [class*="diff"], [class*="typewriter"], [class*="typing"]')]
    .slice(0, 30)
    .map(el => ({
      tag: el.tagName,
      classes: el.className?.toString().slice(0, 120),
      fontFamily: getComputedStyle(el).fontFamily,
      sample: el.textContent?.trim().slice(0, 160)
    })),
  // Global CSS keyframes — useful for spotting marquee, blink, glow, etc.
  cssKeyframes: [...document.styleSheets].flatMap(sheet => {
    try { return [...sheet.cssRules].filter(r => r.type === 7).map(r => r.name); }
    catch { return []; }
  }),
  svgCount: document.querySelectorAll('svg').length,
  fonts: [...new Set([...document.querySelectorAll('*')].slice(0, 200).map(el => getComputedStyle(el).fontFamily))],
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() })),
  // Scripts that hint at the motion stack
  motionLibs: [...document.scripts].map(s => s.src).filter(src =>
    /lottie|gsap|three|spline|rive|lenis|locomotive|motion|framer/.test(src)
  )
});
```

Then write a download script that fetches everything to `public/`. Use batched parallel downloads (4 at a time) with proper error handling. **Include video posters and Lottie JSON files** — those are easy to miss and the clone looks broken without them.

## Phase 3: Component Specification & Dispatch

This is the core loop. For each section in your page topology (top to bottom), you do THREE things: **extract**, **write the spec file**, then **dispatch builders**.

### Step 1: Extract

For each section, use browser MCP to extract everything:

1. **Screenshot** the section in isolation (scroll to it, screenshot the viewport). Save to `docs/design-references/`.

2. **Extract CSS** for every element in the section. Use the extraction script below — don't hand-measure individual properties. Run it once per component container and capture the full output:

```javascript
// Per-component extraction — run via browser MCP
// Replace SELECTOR with the actual CSS selector for the component
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'Element not found: ' + selector });
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','overflowX','overflowY',
    'position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor',
    'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
    'whiteSpace','textOverflow','WebkitLineClamp'
  ];
  function extractStyles(element) {
    const cs = getComputedStyle(element);
    const styles = {};
    props.forEach(p => { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v; });
    return styles;
  }
  function walk(element, depth) {
    if (depth > 4) return null;
    const children = [...element.children];
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className?.toString().split(' ').slice(0, 5).join(' '),
      text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim().slice(0, 200) : null,
      styles: extractStyles(element),
      images: element.tagName === 'IMG' ? { src: element.src, alt: element.alt, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight } : null,
      childCount: children.length,
      children: children.slice(0, 20).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(el, 0), null, 2);
})('SELECTOR');
```

3. **Extract multi-state styles** — for any element with multiple states (scroll-triggered, hover, active tab), capture BOTH states:

```javascript
// State A: capture styles at current state (e.g., scroll position 0)
// Then trigger the state change (scroll, click, hover via browser MCP)
// State B: re-run the extraction script on the same element
// The diff between A and B IS the behavior specification
```

Record the diff explicitly: "Property X changes from VALUE_A to VALUE_B, triggered by TRIGGER, with transition: TRANSITION_CSS."

4. **Extract real content** — all text, alt attributes, aria labels, placeholder text. Use `element.textContent` for each text node. For tabbed/stateful content, **click each tab and extract content per state**.

5. **Identify assets** this section uses — which downloaded images/videos from `public/`, which icon components from `icons.tsx`. Check for **layered images** (multiple `<img>` or background-images stacked in the same container).

6. **Assess complexity** — how many distinct sub-components does this section contain? A distinct sub-component is an element with its own unique styling, structure, and behavior (e.g., a card, a nav item, a search panel).

### Step 2: Write the Component Spec File

For each section (or sub-component, if you're breaking it up), create a spec file in `docs/research/components/`. This is NOT optional — every builder must have a corresponding spec file.

**File path:** `docs/research/components/<component-name>.spec.md`

**Template:**

```markdown
# <ComponentName> Specification

## Overview
- **Target file:** `src/components/<ComponentName>.tsx`
- **Screenshot:** `docs/design-references/<screenshot-name>.png`
- **Interaction model:** <static | click-driven | scroll-driven | time-driven>

## DOM Structure
<Describe the element hierarchy — what contains what>

## Computed Styles (exact values from getComputedStyle)

### Container
- display: ...
- padding: ...
- maxWidth: ...
- (every relevant property with exact values)

### <Child element 1>
- fontSize: ...
- color: ...
- (every relevant property)

### <Child element N>
...

## States & Behaviors

### <Behavior name, e.g., "Scroll-triggered floating mode">
- **Trigger:** <exact mechanism — scroll position 50px, IntersectionObserver rootMargin "-30% 0px", click on .tab-button, hover>
- **State A (before):** maxWidth: 100vw, boxShadow: none, borderRadius: 0
- **State B (after):** maxWidth: 1200px, boxShadow: 0 4px 20px rgba(0,0,0,0.1), borderRadius: 16px
- **Transition:** transition: all 0.3s ease
- **Implementation approach:** <CSS transition + scroll listener | IntersectionObserver | CSS animation-timeline | etc.>

### Hover states
- **<Element>:** <property>: <before> → <after>, transition: <value>

## Per-State Content (if applicable)

### State: "Featured"
- Title: "..."
- Subtitle: "..."
- Cards: [{ title, description, image, link }, ...]

### State: "Productivity"
- Title: "..."
- Cards: [...]

## Assets
- Background image: `public/images/<file>.webp`
- Overlay image: `public/images/<file>.png`
- Videos: `public/videos/<file>.mp4` (poster: `public/images/<file>-poster.jpg`, attrs: autoplay muted loop playsInline)
- Lottie: `public/lottie/<file>.json`
- Icons used: <ArrowIcon>, <SearchIcon> from icons.tsx

## Motion & Media (REQUIRED — never N/A unless truly static)

- **Library:** <motion | none | lottie-react | react-typewriter-text | @char-motion/react | react-fast-marquee | @react-three/fiber | rive | spline | CSS-only>
- **Trigger:** <on-mount | in-view (IntersectionObserver, threshold X) | scroll-progress (useScroll) | hover | click | timer/interval (Xms) | layout change>
- **Keyframes / variants:**
  ```ts
  // initial → animate → exit (or hover/tap variants)
  initial: { opacity: 0, y: 12 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
  ```
- **Stagger / orchestration:** <staggerChildren: 0.06 | delayChildren: 0.2 | layout transitions | AnimatePresence on key change>
- **Reduced-motion fallback:** <what the section degrades to when `prefers-reduced-motion: reduce` (opacity-only? instant snap? skip entirely?)>
- **Asset-specific notes:**
  - For typewriter / terminal: characters-per-second, cursor blink rate, content lines in order, whether prompts (`$ `) prefix each line
  - For animated code diffs: before/after code blocks, which lines are added/removed, sequence and timing
  - For Lottie: `loop`, `autoplay`, segment ranges if partial playback
  - For video: confirm `autoplay muted playsInline loop preload` mirror the source
  - For marquee: direction, speed, gap, pause-on-hover

## Text Content (verbatim)
<All text content, copy-pasted from the live site. For terminal/typewriter blocks, preserve line breaks, prompts, and whitespace EXACTLY — those are part of the animation, not decoration.>

## Responsive Behavior
- **Desktop (1440px):** <layout description>
- **Tablet (768px):** <what changes — e.g., "maintains 2-column, gap reduces to 16px">
- **Mobile (390px):** <what changes — e.g., "stacks to single column, images full-width">
- **Breakpoint:** layout switches at ~<N>px
```

Fill every section. If a section doesn't apply (e.g., no states for a static footer), write "N/A" — but think twice before marking States & Behaviors as N/A. Even a footer might have hover states on links.

### Step 3: Dispatch Builders

Based on complexity, dispatch builder agent(s) in worktree(s):

**Simple section** (1-2 sub-components): One builder agent gets the entire section.

**Complex section** (3+ distinct sub-components): Break it up. One agent per sub-component, plus one agent for the section wrapper that imports them. Sub-component builders go first since the wrapper depends on them.

**What every builder agent receives:**
- The full contents of its component spec file (inline in the prompt — don't say "go read the spec file")
- Path to the section screenshot in `docs/design-references/`
- Which shared components to import (`icons.tsx`, `cn()`, shadcn primitives)
- The target file path (e.g., `src/components/HeroSection.tsx`)
- Instruction to verify with `npx tsc --noEmit` before finishing
- For responsive behavior: the specific breakpoint values and what changes
- **Motion contract:** explicit instruction to use the library named in the spec's "Motion & Media" block, with the exact variants, transition timings, and triggers. Builders may NOT silently substitute CSS transitions for declared `motion` animations, or vice versa. If the spec says `react-typewriter-text`, the builder uses it — not a hand-rolled `setInterval`.
- **Media contract:** explicit list of asset paths under `public/` that the builder MUST reference. If a `<video>` is declared, the builder must mirror `autoplay muted playsInline loop poster preload` exactly as captured. If a Lottie JSON is declared, the builder imports it and renders via `lottie-react`. No silent omissions.
- **Client-component note:** any component using `motion`, `useScroll`, `useState`, `useEffect`, or `IntersectionObserver` must start with `"use client"`. Remind the builder explicitly in the dispatch prompt.

**Don't wait.** As soon as you've dispatched the builder(s) for one section, move to extracting the next section. Builders work in parallel in their worktrees while you continue extraction.

### Step 4: Merge

As builder agents complete their work:
- Merge their worktree branches into main
- You have full context on what each agent built, so resolve any conflicts intelligently
- After each merge, verify the build still passes: `npm run build`
- If a merge introduces type errors, fix them immediately

The extract → spec → dispatch → merge cycle continues until all sections are built.

## Phase 4: Page Assembly

After all sections are built and merged, wire everything together in `src/app/page.tsx`:

- Import all section components
- Implement the page-level layout from your topology doc (scroll containers, column structures, sticky positioning, z-index layering)
- Connect real content to component props
- Implement page-level behaviors: scroll snap, scroll-driven animations, dark-to-light transitions, intersection observers, smooth scroll (Lenis etc.)
- Verify: `npm run build` passes clean

## Phase 5: Visual QA Diff

After assembly, do NOT declare the clone complete. Take side-by-side comparison screenshots:

1. Open the original site and your clone side-by-side (or take screenshots at the same viewport widths)
2. Compare section by section, top to bottom, at desktop (1440px)
3. Compare again at mobile (390px)
4. For each discrepancy found:
   - Check the component spec file — was the value extracted correctly?
   - If the spec was wrong: re-extract from browser MCP, update the spec, fix the component
   - If the spec was right but the builder got it wrong: fix the component to match the spec
5. Test all interactive behaviors: scroll through the page, click every button/tab, hover over interactive elements
6. Verify smooth scroll feels right, header transitions work, tab switching works, animations play
7. **Motion & media parity check** — open the original and the clone side-by-side and watch each section for at least 5 seconds:
   - Every typewriter / terminal block on the original must be typing on the clone
   - Every animated code diff on the original must be diffing on the clone
   - Every Lottie / SVG-SMIL animation on the original must be playing on the clone
   - Every auto-playing video must be auto-playing (check the network panel — no 404s on `.mp4` or poster files)
   - Every marquee / ticker on the original must be scrolling on the clone at the same speed
   - Every staggered enter-animation on scroll must fire on the clone at the same threshold
8. Run `npm run dev` and inspect with DevTools — confirm no console errors about hydration, missing assets, or `"use client"` violations.

Only after this visual + motion QA pass is the clone complete.

## Pre-Dispatch Checklist

Before dispatching ANY builder agent, verify you can check every box. If you can't, go back and extract more.

- [ ] Spec file written to `docs/research/components/<name>.spec.md` with ALL sections filled
- [ ] Every CSS value in the spec is from `getComputedStyle()`, not estimated
- [ ] Interaction model is identified and documented (static / click / scroll / time)
- [ ] For stateful components: every state's content and styles are captured
- [ ] For scroll-driven components: trigger threshold, before/after styles, and transition are recorded
- [ ] For hover states: before/after values and transition timing are recorded
- [ ] All images in the section are identified (including overlays and layered compositions)
- [ ] All videos identified with their `autoplay/muted/loop/playsInline/poster` attributes
- [ ] All Lottie / Rive / Spline / canvas surfaces identified and their JSON / source files downloaded
- [ ] **Motion & Media block is complete** — library chosen, variants written, trigger documented, reduced-motion fallback specified
- [ ] For typewriter / terminal / animated-diff sections: line-by-line content + per-line timing recorded
- [ ] All icons used are listed and exist in `src/components/icons.tsx` (or are being added in this dispatch)
- [ ] Responsive behavior is documented for at least desktop and mobile
- [ ] Text content is verbatim from the site, not paraphrased
- [ ] The builder prompt is under ~150 lines of spec; if over, the section needs to be split

## What NOT to Do

These are lessons from previous failed clones — each one cost hours of rework:

- **Don't build click-based tabs when the original is scroll-driven (or vice versa).** Determine the interaction model FIRST by scrolling before clicking. This is the #1 most expensive mistake — it requires a complete rewrite, not a CSS fix.
- **Don't extract only the default state.** If there are tabs showing "Featured" on load, click Productivity, Creative, Lifestyle and extract each one's cards/content. If the header changes on scroll, capture styles at position 0 AND position 100+.
- **Don't miss overlay/layered images.** A background watercolor + foreground UI mockup = 2 images. Check every container's DOM tree for multiple `<img>` elements and positioned overlays.
- **Don't build mockup components for content that's actually videos/animations.** Check if a section uses `<video>`, Lottie, or canvas before building elaborate HTML mockups of what the video shows.
- **Don't approximate CSS classes.** "It looks like `text-lg`" is wrong if the computed value is `18px` and `text-lg` is `18px/28px` but the actual line-height is `24px`. Extract exact values.
- **Don't build everything in one monolithic commit.** The whole point of this pipeline is incremental progress with verified builds at each step.
- **Don't reference docs from builder prompts.** Each builder gets the CSS spec inline in its prompt — never "see DESIGN_TOKENS.md for colors." The builder should have zero need to read external docs.
- **Don't skip asset extraction.** Without real images, videos, and fonts, the clone will always look fake regardless of how perfect the CSS is.
- **Don't give a builder agent too much scope.** If you're writing a builder prompt and it's getting long because the section is complex, that's a signal to break it into smaller tasks.
- **Don't bundle unrelated sections into one agent.** A CTA section and a footer are different components with different designs — don't hand them both to one agent and hope for the best.
- **Don't skip responsive extraction.** If you only inspect at desktop width, the clone will break at tablet and mobile. Test at 1440, 768, and 390 during extraction.
- **Don't forget smooth scroll libraries.** Check for Lenis (`.lenis` class), Locomotive Scroll, or similar. Default browser scrolling feels noticeably different and the user will spot it immediately.
- **Don't dispatch builders without a spec file.** The spec file forces exhaustive extraction and creates an auditable artifact. Skipping it means the builder gets whatever you can fit in a prompt from memory.
- **Don't ship a motionless clone.** If the original Linear-style "AI agent typing into a terminal" section is on the page, your clone HAS to type. If the original has a project tile shuffling on the page, your clone has to shuffle. Static screenshots of animated UI are an instant tell.
- **Don't reinvent typewriter / scramble / marquee logic.** Reach for `react-typewriter-text`, `@char-motion/react`, `react-fast-marquee`, or `lottie-react`. Hand-rolled `setInterval` loops drift, leak, and break on tab focus changes.
- **Don't drop a `<video>` poster.** A hero with `autoplay` blocked by the browser falls back to its poster — without one, it shows a black hole. Always capture and ship the poster.
- **Don't inline-rewrite SMIL animations.** When you extract an inline `<svg>` that contains `<animate>` or `<animateTransform>`, keep those children in the React component. Don't "clean them up" — they're animations, not noise.
- **Don't forget `"use client"`.** Anything using `motion`, `useScroll`, `useEffect`, `useState`, or browser APIs needs the client directive in the App Router. A clone that compiles but renders blank in production is usually a missing directive.
- **Don't install motion libraries the site doesn't actually use.** Match the target's stack — don't ship `three` and `@react-three/fiber` for a site that only does fade-ups. Each unused dep bloats the bundle.

## Completion

When done, report:
- Total sections built
- Total components created
- Total spec files written (should match components)
- Total assets downloaded (images, videos, SVGs, fonts)
- Build status (`npm run build` result)
- Visual QA results (any remaining discrepancies)
- Any known gaps or limitations
