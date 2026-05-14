/**
 * HeroAgentDemo — hero anchored by a static agent transcript.
 *
 * Implements pattern `hero/agent-demo-box` from the ai-agent-saas atlas.
 * The demo panel shows a representative input followed by the agent's
 * response. When `motion="subtle"`, the transcript uses Framer Motion for a
 * short panel fade-up and staggered lines; `useReducedMotion` falls back to
 * CSS `motion-safe` fade or static markup.
 */

import { Action, Eyebrow } from "../_lib/primitives.js";

import type { AgentTurn } from "./agent-types.js";
import { TranscriptPanel } from "./TranscriptPanel.client.js";

export type { AgentTurn } from "./agent-types.js";

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
          <TranscriptPanel motion={motion} transcript={transcript} />
        </div>
      </div>
    </section>
  );
}
