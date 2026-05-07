/**
 * ConversionBand — full-width conversion band near the page bottom.
 *
 * Implements:
 *   - `conversion/docs-and-cta-band` (developer-tools)
 *   - `conversion/dual-cta-with-trust` (ai-agent-saas)
 *   - `conversion/sales-band` (enterprise-b2b)
 *   - `conversion/sandbox-cta` (usage-based-saas)
 *
 * One block, four pattern roles. The variants control alignment; the
 * optional trust line under the CTAs covers ai-agent-saas's variant.
 */

import { Section, Action, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface ConversionBandProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** A single-line trust statement shown beneath the CTAs. */
  trust?: string;
  variant?: "centered" | "asymmetric";
}

export function ConversionBand({
  eyebrow,
  heading,
  description,
  primaryCta,
  secondaryCta,
  trust,
  variant = "centered",
}: ConversionBandProps) {
  const isCentered = variant === "centered";

  return (
    <Section
      ariaLabelledBy="conversion-heading"
      className={cn("border-y border-border bg-muted/30")}
    >
      <div
        className={cn(
          "flex flex-col gap-6",
          isCentered
            ? "items-center text-center"
            : "md:flex-row md:items-end md:justify-between",
        )}
      >
        <div className={cn("max-w-2xl", isCentered ? "" : "md:max-w-xl")}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2
            id="conversion-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            {heading}
          </h2>
          {description ? (
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-col gap-3",
            isCentered ? "items-center" : "md:items-end",
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Action href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Action>
            {secondaryCta ? (
              <Action href={secondaryCta.href} variant="ghost" size="lg">
                {secondaryCta.label}
              </Action>
            ) : null}
          </div>
          {trust ? (
            <p className="text-xs text-muted-foreground">{trust}</p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
