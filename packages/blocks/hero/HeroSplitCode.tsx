/**
 * HeroSplitCode — split layout with a code panel on the right.
 *
 * Implements pattern `hero/split-code-right` from the developer-tools atlas.
 * The code panel is the dominant proof artifact: a single representative
 * snippet, optionally tabbed across languages.
 */

import { Action, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface HeroCodeTab {
  id: string;
  label: string;
  /** Pre-formatted code as a string. Lines are rendered exactly as given. */
  code: string;
}

export interface HeroSplitCodeProps {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tabs: HeroCodeTab[];
  activeTabId?: string;
  filename?: string;
}

export function HeroSplitCode({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  tabs,
  activeTabId,
  filename,
}: HeroSplitCodeProps) {
  const active = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-6 md:pr-4">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1
            id="hero-heading"
            className={cn(
              "mt-3 text-balance font-semibold tracking-tight text-foreground",
              "text-4xl md:text-5xl lg:text-6xl",
            )}
          >
            {headline}
          </h1>
          <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {subheadline}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Action href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Action>
            {secondaryCta ? (
              <Action href={secondaryCta.href} variant="ghost" size="lg">
                {secondaryCta.label}
              </Action>
            ) : null}
          </div>
        </div>

        <div className="md:col-span-6">
          <CodePanel tabs={tabs} active={active} filename={filename} />
        </div>
      </div>
    </section>
  );
}

function CodePanel({
  tabs,
  active,
  filename,
}: {
  tabs: HeroCodeTab[];
  active: HeroCodeTab;
  filename?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-muted/40 shadow-sm">
      <header className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {filename ?? active.label}
        </span>
        <div className="w-12" />
      </header>

      {tabs.length > 1 ? (
        <div className="flex border-b border-border bg-muted/30 px-2">
          {tabs.map((t) => (
            <span
              key={t.id}
              className={cn(
                "border-b-2 px-3 py-2 font-mono text-xs",
                t.id === active.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
      ) : null}

      <pre className="overflow-x-auto bg-background/40 p-5 font-mono text-[13px] leading-relaxed text-foreground">
        <code>{active.code}</code>
      </pre>
    </figure>
  );
}
