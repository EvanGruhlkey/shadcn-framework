"use client";

/**
 * UsageCalculator — interactive volume calculator for usage-based pricing.
 *
 * Implements pattern `pricing/usage-calculator`. The visitor adjusts one or
 * more meters and the block computes a monthly estimate from a published
 * rate card. The math is deterministic and visible — the rate card is
 * rendered alongside the result.
 *
 * Single-meter and multi-meter variants are both supported.
 */

import { useMemo, useState } from "react";

import { Section, Card, Eyebrow } from "../_lib/primitives.js";

export interface RateMeter {
  id: string;
  label: string;
  /** Unit displayed alongside the slider, e.g. "requests/month". */
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Currency-per-unit. The block formats USD by default. */
  ratePerUnit: number;
}

export interface UsageCalculatorProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  meters: RateMeter[];
  /** Optional fixed monthly base fee added to the metered total. */
  baseFee?: { amount: number; label: string };
  /** ISO currency code for the price formatter. Defaults to USD. */
  currency?: string;
  /** Footnote text rendered beneath the result, e.g. volume-discount tiers. */
  footnote?: string;
}

export function UsageCalculator({
  eyebrow,
  heading,
  intro,
  meters,
  baseFee,
  currency = "USD",
  footnote,
}: UsageCalculatorProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(meters.map((m) => [m.id, m.default])),
  );

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency],
  );

  const lineItems = meters.map((m) => ({
    meter: m,
    value: values[m.id] ?? m.default,
    subtotal: (values[m.id] ?? m.default) * m.ratePerUnit,
  }));

  const total = lineItems.reduce((sum, l) => sum + l.subtotal, 0) + (baseFee?.amount ?? 0);

  return (
    <Section ariaLabelledBy="calculator-heading">
      <header className="mx-auto max-w-2xl text-center">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id="calculator-heading"
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

      <Card className="mt-12 grid gap-6 p-6 md:grid-cols-12 md:p-10">
        <fieldset className="md:col-span-7">
          <legend className="text-sm font-medium text-foreground">Adjust your volume</legend>
          <div className="mt-4 space-y-6">
            {meters.map((m) => {
              const current = values[m.id] ?? m.default;
              return (
                <label key={m.id} className="block">
                  <span className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-foreground">{m.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {current.toLocaleString()} {m.unit}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={m.min}
                    max={m.max}
                    step={m.step}
                    value={current}
                    aria-label={`${m.label} (${m.unit})`}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [m.id]: Number(e.target.value) }))
                    }
                    className="mt-3 w-full accent-foreground"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        <aside className="md:col-span-5 md:border-s md:border-border md:ps-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Estimated monthly cost
          </h3>
          <p className="mt-3 font-mono text-4xl font-semibold tracking-tight text-foreground">
            {formatter.format(total)}
          </p>

          <ul className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            {baseFee ? (
              <li className="flex items-baseline justify-between text-foreground/90">
                <span>{baseFee.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatter.format(baseFee.amount)}
                </span>
              </li>
            ) : null}
            {lineItems.map((l) => (
              <li
                key={l.meter.id}
                className="flex items-baseline justify-between text-foreground/90"
              >
                <span>{l.meter.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatter.format(l.subtotal)}
                </span>
              </li>
            ))}
          </ul>

          {footnote ? (
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{footnote}</p>
          ) : null}
        </aside>
      </Card>
    </Section>
  );
}
