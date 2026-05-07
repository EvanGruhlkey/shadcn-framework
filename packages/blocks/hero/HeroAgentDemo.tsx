/**
 * HeroAgentDemo — hero anchored by a static agent transcript.
 *
 * Implements pattern `hero/agent-demo-box` from the ai-agent-saas atlas.
 * The demo panel shows a representative input followed by the agent's
 * response. Animation is opt-in via `motion="subtle"` and respects
 * prefers-reduced-motion.
 */

import { Action, Eyebrow } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface AgentTurn {
  role: "user" | "agent";
  content: string;
  meta?: string;
}

export interface HeroAgentDemoProps {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  transcript: AgentTurn[];
  motion?: "off" | "subtle";
}

export function HeroAgentDemo({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  transcript,
  motion = "off",
}: HeroAgentDemoProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
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

        <div className="md:col-span-7">
          <TranscriptPanel transcript={transcript} motion={motion} />
        </div>
      </div>
    </section>
  );
}

function TranscriptPanel({
  transcript,
  motion,
}: {
  transcript: AgentTurn[];
  motion: "off" | "subtle";
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        motion === "subtle" &&
          "motion-safe:animate-[fadeIn_220ms_ease-out_both] motion-reduce:animate-none",
      )}
      aria-label="Example agent transcript"
    >
      <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Example session
        </span>
        <span className="font-mono text-xs text-muted-foreground">read-only</span>
      </header>
      <ol className="divide-y divide-border">
        {transcript.map((turn, i) => (
          <li key={i} className="flex gap-4 px-5 py-4">
            <span
              className={cn(
                "mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-medium",
                turn.role === "user"
                  ? "border-border bg-background text-muted-foreground"
                  : "border-foreground/20 bg-foreground/[0.04] text-foreground",
              )}
              aria-hidden="true"
            >
              {turn.role === "user" ? "U" : "A"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {turn.role === "user" ? "User" : "Agent"}
                </span>
                {turn.meta ? (
                  <span className="text-xs text-muted-foreground">{turn.meta}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                {turn.content}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
