/**
 * QuoteCardsThree — three-up customer quote band.
 *
 * Implements pattern `proof-quotes/three-up-quote-cards`. Quotes are bounded
 * to ≤220 characters per the copywriting rules; the block does not enforce
 * that, but the evaluator does.
 */

import type { ReactNode } from "react";

import { Section, Card, Eyebrow } from "../_lib/primitives.js";

export interface QuoteCardData {
  id: string;
  quote: string;
  author: { name: string; role: string; company: string };
  glyph?: ReactNode;
}

export interface QuoteCardsThreeProps {
  eyebrow?: string;
  heading: string;
  cards: [QuoteCardData, QuoteCardData, QuoteCardData];
}

export function QuoteCardsThree({ eyebrow, heading, cards }: QuoteCardsThreeProps) {
  return (
    <Section ariaLabelledBy="proof-quotes-heading">
      <header className="mx-auto max-w-2xl text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id="proof-quotes-heading"
          className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {heading}
        </h2>
      </header>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <li key={c.id}>
            <Card className="flex h-full flex-col gap-4 p-6">
              <blockquote className="text-pretty text-sm leading-relaxed text-foreground/90">
                <span aria-hidden="true" className="font-serif text-foreground/30">
                  &ldquo;
                </span>
                <span>{c.quote}</span>
                <span aria-hidden="true" className="font-serif text-foreground/30">
                  &rdquo;
                </span>
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                {c.glyph ? (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-border bg-muted/50 text-foreground/60"
                  >
                    {c.glyph}
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {c.author.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.author.role}, {c.author.company}
                  </span>
                </span>
              </figcaption>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
