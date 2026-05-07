/**
 * HeroEnterpriseSplit — outcome-headline hero with a dashboard mockup.
 *
 * Implements pattern `hero/talk-to-sales-headline` from the enterprise-b2b
 * atlas. The right pane is a placeholder dashboard frame composed from
 * Tailwind utilities — never an image lifted from a real product.
 */

import type { ReactNode } from "react";

import { Action, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface HeroEnterpriseSplitProps {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Optional bullet list rendered under the subheadline. */
  bullets?: string[];
  /** Replace the default placeholder dashboard with custom media. */
  media?: ReactNode;
}

export function HeroEnterpriseSplit({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  bullets,
  media,
}: HeroEnterpriseSplitProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/30"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-6">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1
            id="hero-heading"
            className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            {headline}
          </h1>
          <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {subheadline}
          </p>

          {bullets && bullets.length > 0 ? (
            <ul className="mt-6 space-y-2 text-sm text-foreground/90">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-foreground/60"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Action href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Action>
            {secondaryCta ? (
              <Action href={secondaryCta.href} variant="outline" size="lg">
                {secondaryCta.label}
              </Action>
            ) : null}
          </div>
        </div>

        <div className="md:col-span-6">{media ?? <PlaceholderDashboard />}</div>
      </div>
    </section>
  );
}

function PlaceholderDashboard() {
  return (
    <figure
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        "ring-1 ring-foreground/[0.03]",
      )}
    >
      <header className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        <span className="ms-3 text-xs text-muted-foreground">Dashboard</span>
      </header>
      <div className="grid grid-cols-12 gap-4 p-5">
        <aside className="col-span-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-muted/70" />
          ))}
        </aside>
        <div className="col-span-9 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-md border border-border p-3">
                <div className="h-2 w-12 rounded bg-muted" />
                <div className="mt-2 h-5 w-20 rounded bg-foreground/15" />
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border p-4">
            <div className="h-2 w-16 rounded bg-muted" />
            <div className="mt-3 grid grid-cols-12 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${20 + (i % 5) * 8}px` }}
                  className="rounded-sm bg-foreground/15"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
