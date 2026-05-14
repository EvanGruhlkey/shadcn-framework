/**
 * FeatureGridFour — four-pillar platform overview.
 *
 * Implements pattern `feature-system/four-pillar-platform`. Used by
 * enterprise-b2b atlases to lay out platform modules. Each card may
 * optionally include a "Learn more" affordance.
 */

import type { ReactNode } from "react";

import { Section, Eyebrow } from "../_lib/primitives.js";

export interface PlatformPillar {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
}

export interface FeatureGridFourProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  pillars: [PlatformPillar, PlatformPillar, PlatformPillar, PlatformPillar];
}

export function FeatureGridFour({
  eyebrow,
  heading,
  intro,
  pillars,
}: FeatureGridFourProps) {
  return (
    <Section ariaLabelledBy="feature-four-heading">
      <header className="max-w-2xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id="feature-four-heading"
          className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {heading}
        </h2>
        {intro ? (
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
        ) : null}
      </header>

      <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p) => (
          <li
            key={p.id}
            className="flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/30"
          >
            <span aria-hidden="true" className="ds-icon-tile mb-5 h-10 w-10">
              <span className="h-5 w-5">{p.icon}</span>
            </span>
            <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p.description}
            </p>
            {p.href ? (
              <a
                href={p.href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Learn more
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
