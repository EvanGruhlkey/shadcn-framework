/**
 * PricingTierTable — 3–4 column pricing tier table.
 *
 * Implements pattern `pricing/contact-tier-table`. The rightmost tier may
 * be "Enterprise" with a "Contact us" CTA and no price. Plan names follow
 * the copywriting rule of using a single noun (Starter, Team, Scale,
 * Enterprise).
 */

import { Section, Card, Action, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface PricingTier {
  id: string;
  name: string;
  /**
   * Either a string ("Free", "Contact us") or a numeric price object.
   * The block renders the right format automatically.
   */
  price:
    | { kind: "fixed"; amount: string; period: string }
    | { kind: "label"; text: string };
  description: string;
  features: string[];
  cta: { label: string; href: string };
  emphasized?: boolean;
}

export interface PricingTierTableProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  tiers: PricingTier[];
}

export function PricingTierTable({
  eyebrow,
  heading,
  intro,
  tiers,
}: PricingTierTableProps) {
  return (
    <Section ariaLabelledBy="pricing-heading">
      <header className="mx-auto max-w-2xl text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id="pricing-heading"
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

      <ul
        className={cn(
          "mt-12 grid gap-6",
          tiers.length === 4
            ? "md:grid-cols-2 lg:grid-cols-4"
            : "md:grid-cols-3",
        )}
      >
        {tiers.map((tier) => (
          <li key={tier.id}>
            <Card
              className={cn(
                "flex h-full flex-col p-6",
                tier.emphasized && "border-foreground/20 ring-1 ring-foreground/10",
              )}
            >
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {tier.name}
                </h3>
                <p className="mt-3 text-foreground">
                  {tier.price.kind === "fixed" ? (
                    <>
                      <span className="text-3xl font-semibold tracking-tight">
                        {tier.price.amount}
                      </span>
                      <span className="ms-1 text-sm text-muted-foreground">
                        / {tier.price.period}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold tracking-tight">
                      {tier.price.text}
                    </span>
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-foreground/90">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border border-foreground/30 text-[10px] font-bold text-foreground/60"
                    >
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-4">
                <Action
                  href={tier.cta.href}
                  variant={tier.emphasized ? "primary" : "outline"}
                  className="w-full justify-center"
                >
                  {tier.cta.label}
                </Action>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
