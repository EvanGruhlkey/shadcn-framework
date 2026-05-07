/**
 * Output emitters.
 *
 * Given a synthesized DesignSystem, produce drop-in files the user can
 * copy into a fresh shadcn/ui project:
 *
 *   tokens.json         — every value, machine-readable
 *   tailwind.config.ts  — Tailwind theme extension
 *   globals.css         — shadcn-compatible CSS variables (light + dark)
 *   theme-preview.tsx   — a self-contained React component that renders
 *                         every token so you can eyeball the system
 *   REPORT.md           — what was extracted, from where, with the
 *                         anti-clone disclaimer
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ColorRamp, DesignSystem, ExtractionRun } from "./types.js";

export function emitAll(system: DesignSystem, run: ExtractionRun): string[] {
  mkdirSync(run.outputDir, { recursive: true });
  const written: string[] = [];

  written.push(write(run.outputDir, "tokens.json", JSON.stringify(system, null, 2) + "\n"));
  written.push(write(run.outputDir, "tailwind.config.ts", emitTailwindConfig(system)));
  written.push(write(run.outputDir, "globals.css", emitGlobalsCss(system)));
  written.push(write(run.outputDir, "theme-preview.tsx", emitThemePreview(system)));
  written.push(write(run.outputDir, "REPORT.md", emitReport(system, run)));

  return written;
}

function write(dir: string, file: string, contents: string): string {
  const path = join(dir, file);
  writeFileSync(path, contents);
  return path;
}

/* -------------------------------------------------------------------------- */
/*  tailwind.config.ts                                                        */
/* -------------------------------------------------------------------------- */

function emitTailwindConfig(system: DesignSystem): string {
  return `/**
 * Tailwind theme extracted by shadcn-ui-framework.
 * Run id: ${system.runId}
 *
 * Sources (inspirational only, no source code or assets reused):
${system.sources.map((s) => ` *   - ${s.url}`).join("\n")}
 */

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "${pxToRem(system.spacing.containerPx)}rem" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["${system.typography.fontSans}", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["${system.typography.fontMono}", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
${Object.entries(system.typography.steps)
  .map(([k, v]) => `        "${k}": ["${pxToRem(v)}rem", { lineHeight: "${heightFor(k, system)}" }],`)
  .join("\n")}
      },
      letterSpacing: {
        body: "${system.typography.bodyLetterSpacingEm}em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
${system.spacing.steps
  .map((px, i) => `        "${i + 1}p": "${pxToRem(px)}rem",`)
  .join("\n")}
      },
      boxShadow: {
        sm: "${system.shadows.sm}",
        md: "${system.shadows.md}",
        lg: "${system.shadows.lg}",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

function heightFor(step: string, system: DesignSystem): string {
  const headingSteps = new Set(["3xl", "4xl", "5xl", "6xl"]);
  return headingSteps.has(step)
    ? String(system.typography.headingLineHeight)
    : String(system.typography.bodyLineHeight);
}

/* -------------------------------------------------------------------------- */
/*  globals.css                                                               */
/* -------------------------------------------------------------------------- */

function emitGlobalsCss(system: DesignSystem): string {
  return `/**
 * Drop-in CSS variables produced by shadcn-ui-framework.
 * Compatible with shadcn/ui's --background / --foreground / etc. tokens.
 */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${cssVarsBlock(system.light)}
    --radius: ${pxToRem(system.radius.basePx)}rem;
  }

  .dark {
${cssVarsBlock(system.dark)}
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
    text-rendering: optimizeLegibility;
  }
}
`;
}

function cssVarsBlock(ramp: ColorRamp): string {
  const map: Array<[string, string]> = [
    ["--background", ramp.background],
    ["--foreground", ramp.foreground],
    ["--card", ramp.card],
    ["--card-foreground", ramp.cardForeground],
    ["--popover", ramp.popover],
    ["--popover-foreground", ramp.popoverForeground],
    ["--primary", ramp.primary],
    ["--primary-foreground", ramp.primaryForeground],
    ["--secondary", ramp.secondary],
    ["--secondary-foreground", ramp.secondaryForeground],
    ["--muted", ramp.muted],
    ["--muted-foreground", ramp.mutedForeground],
    ["--accent", ramp.accent],
    ["--accent-foreground", ramp.accentForeground],
    ["--destructive", ramp.destructive],
    ["--destructive-foreground", ramp.destructiveForeground],
    ["--border", ramp.border],
    ["--input", ramp.input],
    ["--ring", ramp.ring],
  ];
  return map.map(([k, v]) => `    ${k}: ${hexToHslTokens(v)};`).join("\n");
}

function hexToHslTokens(hex: string): string {
  const m = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return "0 0% 0%";
  const num = parseInt(m[1]!, 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/* -------------------------------------------------------------------------- */
/*  theme-preview.tsx                                                         */
/* -------------------------------------------------------------------------- */

function emitThemePreview(system: DesignSystem): string {
  return `/**
 * Theme preview for the design system extracted at ${system.runId}.
 *
 * Drop this into your app at \`components/theme-preview.tsx\` and render
 * it on a route to eyeball every token in light and dark mode.
 */

export default function ThemePreview() {
  return (
    <div className="space-y-12 p-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Design system preview
        </p>
        <h1 className="text-5xl font-semibold tracking-tight">
          Headline at the 5xl step
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          Body copy at the lg step demonstrating the chosen line-height and
          letter-spacing across a representative paragraph length.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Type scale</h2>
        <div className="space-y-2 font-mono text-sm">
${(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"] as const)
  .map(
    (step) =>
      `          <p className="text-${step}">${step} — The quick brown fox jumps over the lazy dog</p>`,
  )
  .join("\n")}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Color tokens</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
${[
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "border",
  "ring",
]
  .map(
    (token) =>
      `          <div className="rounded-md border border-border bg-${token.includes("foreground") ? "background" : token} p-4">
            <div className="font-mono text-xs">${token}</div>
          </div>`,
  )
  .join("\n")}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Radius and shadow</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-6 text-sm shadow-sm">shadow-sm + rounded-lg</div>
          <div className="rounded-lg border border-border bg-card p-6 text-sm shadow-md">shadow-md + rounded-lg</div>
          <div className="rounded-lg border border-border bg-card p-6 text-sm shadow-lg">shadow-lg + rounded-lg</div>
        </div>
      </section>
    </div>
  );
}
`;
}

/* -------------------------------------------------------------------------- */
/*  REPORT.md                                                                 */
/* -------------------------------------------------------------------------- */

function emitReport(system: DesignSystem, run: ExtractionRun): string {
  const okCaptures = run.captures.filter((c) => c.status === "ok");
  const failedCaptures = run.captures.filter((c) => c.status !== "ok");

  return `# Design system extraction report

**Run:** \`${system.runId}\`
**Generated:** ${run.finishedAt}

## Inspiration sources

The design system below was synthesized by analyzing the **rendered
appearance** of these public pages. No source code, brand assets,
illustrations, logos, or copywriting was extracted or stored.

${okCaptures.map((c) => `- ${c.url}  \n  screenshot: \`${relativize(c.screenshotPath, run.outputDir)}\``).join("\n")}

${
  failedCaptures.length > 0
    ? `### Skipped or failed\n\n${failedCaptures
        .map((c) => `- ${c.url} — ${c.status}${c.reason ? `: ${c.reason}` : ""}`)
        .join("\n")}`
    : ""
}

## Synthesis decisions

${system.notes.length > 0 ? system.notes.map((n) => `- ${n}`).join("\n") : "_No special notes — defaults applied where signals were weak._"}

## Typography

- **Sans family:** ${system.typography.fontSans}${system.typography.fontSansSubstituted ? " *(substituted)*" : ""}
- **Mono family:** ${system.typography.fontMono}${system.typography.fontMonoSubstituted ? " *(substituted)*" : ""}
- **Body base:** ${system.typography.basePx}px
- **Scale ratio:** ${system.typography.scaleRatio}
- **Body line-height:** ${system.typography.bodyLineHeight}
- **Heading line-height:** ${system.typography.headingLineHeight}
- **Body letter-spacing:** ${system.typography.bodyLetterSpacingEm}em

| step | px |
| ---- | -- |
${Object.entries(system.typography.steps).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## Spacing

- **Base unit:** ${system.spacing.basePx}px
- **Container width:** ${system.spacing.containerPx}px
- **Steps (px):** ${system.spacing.steps.join(", ")}

## Radius

- **Base radius:** ${system.radius.basePx}px (used for shadcn's \`--radius\`)

## Color tokens

### Light theme

| token | value |
| ----- | ----- |
${rampRows(system.light)}

### Dark theme

| token | value |
| ----- | ----- |
${rampRows(system.dark)}

## Shadows

- \`shadow-sm\` — \`${system.shadows.sm}\`
- \`shadow-md\` — \`${system.shadows.md}\`
- \`shadow-lg\` — \`${system.shadows.lg}\`

## Drop-in usage

1. Copy \`tailwind.config.ts\` into the root of a Next.js + Tailwind project.
2. Copy \`globals.css\` into \`app/globals.css\` (replacing the existing file).
3. Render \`theme-preview.tsx\` somewhere to eyeball the system.
4. Iterate from there. The tokens are yours; this report is a record of where
   they came from.

## What this report is not

This is **not** a clone of any source site. It does not reproduce layouts,
copy, logos, or brand identity. It records aggregate design-token signals
(colors, type sizes, spacing, radii) and synthesizes an original system
inspired by the corpus.

If a source operator requests removal, delete the screenshot, drop the URL
from the manifest, and re-run the extraction.
`;
}

function rampRows(ramp: ColorRamp): string {
  const entries: Array<[string, string]> = [
    ["background", ramp.background],
    ["foreground", ramp.foreground],
    ["card", ramp.card],
    ["card-foreground", ramp.cardForeground],
    ["primary", ramp.primary],
    ["primary-foreground", ramp.primaryForeground],
    ["secondary", ramp.secondary],
    ["secondary-foreground", ramp.secondaryForeground],
    ["muted", ramp.muted],
    ["muted-foreground", ramp.mutedForeground],
    ["accent", ramp.accent],
    ["accent-foreground", ramp.accentForeground],
    ["destructive", ramp.destructive],
    ["destructive-foreground", ramp.destructiveForeground],
    ["border", ramp.border],
    ["input", ramp.input],
    ["ring", ramp.ring],
  ];
  return entries.map(([k, v]) => `| \`--${k}\` | \`${v}\` |`).join("\n");
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function pxToRem(px: number): string {
  return (Math.round((px / 16) * 1000) / 1000).toString();
}

function relativize(p: string, base: string): string {
  return p.replace(base + "/", "").replace(base + "\\", "");
}
