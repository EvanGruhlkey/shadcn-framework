/**
 * FeatureDeepDive — extended single-feature explanation with a media aside.
 *
 * Implements pattern `feature-deep-dive/two-column-with-snippet`. The aside
 * is a slot — typical content is a code block, a small diagram, or a
 * placeholder dashboard from another block. The block alternates between
 * media-right and media-left to create rhythm when stacked.
 */

import type { ReactNode } from "react";

import { Section, Action, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface FeatureDeepDiveProps {
  eyebrow?: string;
  heading: string;
  description: string;
  bullets?: string[];
  cta?: { label: string; href: string };
  media: ReactNode;
  variant?: "media-right" | "media-left";
}

export function FeatureDeepDive({
  eyebrow,
  heading,
  description,
  bullets,
  cta,
  media,
  variant = "media-right",
}: FeatureDeepDiveProps) {
  return (
    <Section ariaLabelledBy="deep-dive-heading">
      <div
        className={cn(
          "grid items-center gap-12 md:grid-cols-12",
          variant === "media-left" && "md:[&>div:first-child]:order-2",
        )}
      >
        <div className="md:col-span-6">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2
            id="deep-dive-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            {heading}
          </h2>
          <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          {bullets && bullets.length > 0 ? (
            <ul className="mt-6 space-y-2.5 text-sm text-foreground/90">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-foreground/60"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {cta ? (
            <div className="mt-8">
              <Action href={cta.href} variant="outline">
                {cta.label}
              </Action>
            </div>
          ) : null}
        </div>

        <div className="md:col-span-6">{media}</div>
      </div>
    </Section>
  );
}
