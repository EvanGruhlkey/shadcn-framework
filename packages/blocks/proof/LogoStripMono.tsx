/**
 * LogoStripMono — monochrome logo strip used directly under a hero.
 *
 * Implements pattern `proof-logos/logo-strip-mono`. Logos are passed in as
 * ReactNodes (typically inline SVG marks the consumer ships themselves).
 * This block renders no imagery of its own.
 *
 * For the marquee variant, motion is opt-in and respects
 * prefers-reduced-motion (when reduced motion is requested, the row falls
 * back to a static state).
 */

import type { ReactNode } from "react";

import { Section } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface LogoMark {
  id: string;
  /** Accessible name. Always required. */
  name: string;
  /** The visual mark. Must be monochrome — use currentColor for fills. */
  mark: ReactNode;
}

export interface LogoStripMonoProps {
  caption?: string;
  logos: LogoMark[];
  variant?: "static-row" | "marquee";
}

export function LogoStripMono({
  caption,
  logos,
  variant = "static-row",
}: LogoStripMonoProps) {
  return (
    <Section ariaLabelledBy="proof-logos-heading" className="border-y border-border bg-muted/30 py-12 md:py-14">
      <h2
        id="proof-logos-heading"
        className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {caption ?? "Trusted by teams across categories"}
      </h2>

      <div
        className={cn(
          "mt-8 grid grid-cols-2 items-center gap-x-10 gap-y-6 sm:grid-cols-3 md:grid-cols-6",
          variant === "marquee" &&
            "motion-safe:flex motion-safe:flex-nowrap motion-safe:gap-12 motion-safe:overflow-hidden",
        )}
      >
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="flex items-center justify-center text-foreground/55 transition-colors hover:text-foreground"
            role="img"
            aria-label={logo.name}
          >
            <span className="h-7 w-auto">{logo.mark}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
