/**
 * UseCaseRoleGrid — role-based use-case grid.
 *
 * Implements pattern `use-cases/role-card-grid`. 3–6 cards, each titled by
 * a role or workflow with a 2–3 line description.
 */

import type { ReactNode } from "react";

import { Section, Card, Eyebrow } from "../_lib/primitives.js";

export interface UseCaseRole {
  id: string;
  glyph?: ReactNode;
  title: string;
  description: string;
}

export interface UseCaseRoleGridProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  roles: UseCaseRole[];
}

export function UseCaseRoleGrid({
  eyebrow,
  heading,
  intro,
  roles,
}: UseCaseRoleGridProps) {
  if (roles.length < 3 || roles.length > 6) {
    if (typeof console !== "undefined") {
      console.warn(
        `[UseCaseRoleGrid] expected 3–6 role cards, received ${roles.length}.`,
      );
    }
  }

  return (
    <Section ariaLabelledBy="use-cases-heading">
      <header className="mx-auto max-w-2xl text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id="use-cases-heading"
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

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <li key={r.id}>
            <Card className="h-full p-6">
              <div className="flex items-center gap-3">
                {r.glyph ? (
                  <span aria-hidden="true" className="ds-icon-tile h-8 w-8">
                    <span className="h-4 w-4">{r.glyph}</span>
                  </span>
                ) : null}
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {r.description}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
