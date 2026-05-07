/**
 * FeatureGridThree — three-pillar feature grid anchored under a value pillar.
 *
 * Implements pattern `feature-system/three-column-pillar`. Each card has a
 * monochrome icon, a 3–7 word title, and a 1–2 sentence description. The
 * variant determines whether the icon sits above or to the left of the
 * copy.
 */

import type { ReactNode } from "react";

import { Section, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface FeatureItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export interface FeatureGridThreeProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  items: [FeatureItem, FeatureItem, FeatureItem];
  variant?: "icon-top" | "icon-leading";
}

export function FeatureGridThree({
  eyebrow,
  heading,
  intro,
  items,
  variant = "icon-top",
}: FeatureGridThreeProps) {
  return (
    <Section ariaLabelledBy="feature-three-heading">
      <header className="mx-auto max-w-2xl text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id="feature-three-heading"
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

      <ul className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              variant === "icon-leading" ? "flex gap-4" : "flex flex-col items-start",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex flex-none items-center justify-center rounded-md border border-border bg-muted/40 text-foreground/70",
                variant === "icon-leading" ? "h-10 w-10" : "h-11 w-11",
              )}
            >
              <span className="h-5 w-5">{item.icon}</span>
            </span>
            <div className={cn(variant === "icon-leading" ? "min-w-0" : "mt-5")}>
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
