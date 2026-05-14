/**
 * example.tsx — a complete page composed entirely from @framework/blocks.
 *
 * This file demonstrates the page-generation prompt's algorithm end-to-end
 * for a fictional developer-tools product. It is the output an agent should
 * produce on a typical request and the input the evaluator runs against.
 *
 * Every string in this file is original. No real product, customer, or
 * person is named.
 */

import {
  ConversionBand,
  FeatureDeepDive,
  FeatureGridThree,
  HeroSplitCode,
  LogoStripMono,
  QuoteCardsThree,
  SiteNav,
  type FeatureItem,
  type HeroCodeTab,
  type LogoMark,
  type QuoteCardData,
} from "@framework/blocks";
import Image from "next/image";

import { Wordmark } from "@/components/ui/wordmark";

export const meta = {
  intent:
    "Landing page for a fictional background-job platform aimed at backend engineering teams.",
  density: "balanced",
  category: "developer-tools",
  patterns: [
    "hero/split-code-right",
    "proof-logos/logo-strip-mono",
    "feature-system/three-column-pillar",
    "feature-deep-dive/two-column-with-snippet",
    "proof-quotes/three-up-quote-cards",
    "conversion/docs-and-cta-band",
  ],
} as const;

const HERO_TABS: HeroCodeTab[] = [
  {
    id: "ts",
    label: "TypeScript",
    code: `import { defineJob } from "example-jobs";

export const sendDigest = defineJob({
  name: "send-daily-digest",
  retries: 3,
  schedule: "0 9 * * *",
  async run({ logger }) {
    logger.info("starting digest send");
    // ...your work here
  },
});`,
  },
  {
    id: "py",
    label: "Python",
    code: `from example_jobs import job

@job(name="send-daily-digest", retries=3, schedule="0 9 * * *")
def send_digest(logger):
    logger.info("starting digest send")
    # ...your work here`,
  },
];

const FEATURE_ITEMS: [FeatureItem, FeatureItem, FeatureItem] = [
  {
    id: "durability",
    icon: <CircleIcon />,
    title: "Durable by default",
    description:
      "Jobs persist across deploys and process restarts. Replays are deterministic and inspectable.",
  },
  {
    id: "observability",
    icon: <BarsIcon />,
    title: "Observable end to end",
    description:
      "Per-job timelines, structured logs, and metrics ship with the runtime — no extra integrations.",
  },
  {
    id: "control",
    icon: (
      <span className="flex items-center gap-0.5" aria-hidden="true">
        <SlackMark />
        <DiscordMark />
      </span>
    ),
    title: "Ready for team channels",
    description:
      "Send finished-job summaries to Slack or Discord with built-in templates instead of maintaining fragile webhooks.",
  },
];

const QUOTES: [QuoteCardData, QuoteCardData, QuoteCardData] = [
  {
    id: "q1",
    quote:
      "We replaced an in-house queue with this and removed about a thousand lines of glue code. Operations is calmer.",
    author: { name: "An anonymous engineer", role: "Staff engineer", company: "an example fintech" },
  },
  {
    id: "q2",
    quote:
      "The replay UI is the part we didn't know we needed. Postmortems used to take a day; now they take an afternoon.",
    author: { name: "An anonymous lead", role: "Platform lead", company: "an example logistics company" },
  },
  {
    id: "q3",
    quote:
      "It feels designed by people who have actually been on call at 3 AM. The ergonomics are better than what we built ourselves.",
    author: { name: "An anonymous reviewer", role: "Director of engineering", company: "an example healthcare SaaS" },
  },
];

const LOGOS: LogoMark[] = [
  "Acme Lab",
  "Northwind Press",
  "Foxtrot Type",
  "Lighthouse Pay",
  "Outpost Maps",
  "Forge Robotics",
].map((name, i) => ({
  id: `logo-${i}`,
  name,
  mark: <PlaceholderMark label={name.split(" ")[0]!.slice(0, 2)} />,
}));

export default function ExamplePage() {
  return (
    <div className="bg-background text-foreground">
      <SiteNav
        wordmark={
          <span className="flex items-center gap-2">
            <Wordmark className="h-5 w-auto" />
            <span>Example Jobs</span>
          </span>
        }
        links={[
          { label: "Product", href: "#" },
          { label: "Docs", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "Changelog", href: "#" },
        ]}
        cta={{ label: "Start free", href: "#cta" }}
        secondaryCta={{ label: "Sign in", href: "#" }}
      />

      <HeroSplitCode
        eyebrow="Background jobs"
        headline="Ship reliable background jobs without writing your own runtime."
        subheadline="A queue and worker stack designed for engineering teams who treat reliability as a product feature, not an afterthought."
        primaryCta={{ label: "Start free", href: "#cta" }}
        secondaryCta={{ label: "Read the docs", href: "#docs" }}
        tabs={HERO_TABS}
        activeTabId="ts"
        filename="src/jobs/send-digest.ts"
      />

      <LogoStripMono caption="Used by teams across categories" logos={LOGOS} />

      <FeatureGridThree
        eyebrow="The runtime"
        heading="Three guarantees, baked into the runtime."
        intro="The defaults match what mature backend teams already wish they had — without the half-finished tooling that usually comes with that wish."
        items={FEATURE_ITEMS}
      />

      <FeatureDeepDive
        eyebrow="Replay"
        heading="Inspect and replay any failed run, in production."
        description="Failed jobs do not vanish. Each run keeps its inputs, environment, and logs so you can replay it from the operator console with one click."
        bullets={[
          "Inputs preserved verbatim, including upstream IDs",
          "Environment captured at run time, not at deploy time",
          "Replay returns a new run id; no implicit retries",
        ]}
        cta={{ label: "See the replay docs", href: "#docs" }}
        media={
          <div className="space-y-6">
            <figure className="overflow-hidden rounded-lg border border-border bg-muted shadow-sm ring-1 ring-foreground/[0.03]">
              <Image
                alt="Engineers collaborating over laptop reliability dashboards in an open office."
                className="aspect-video w-full object-cover"
                height={675}
                sizes="(max-width: 768px) 100vw, 50vw"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                width={1200}
              />
              <figcaption className="border-t border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                Stock photograph via Unsplash; used here to show hero-style imagery next to product UI.
              </figcaption>
            </figure>
            <ReplayMockup />
          </div>
        }
      />

      <QuoteCardsThree
        eyebrow="Field reports"
        heading="What teams say after the second month."
        cards={QUOTES}
      />

      <ConversionBand
        heading="Try it in fifteen minutes."
        description="Install the SDK, define one job, and let the runtime handle the rest. No credit card required."
        primaryCta={{ label: "Start free", href: "#" }}
        secondaryCta={{ label: "Read the docs", href: "#" }}
        trust="No credit card. Free up to 100 000 jobs / month."
      />
    </div>
  );
}

function ReplayMockup() {
  return (
    <figure
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">run · r_3a09bf</span>
        <span className="rounded-full border border-foreground/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground/70">
          failed
        </span>
      </header>
      <div className="space-y-3 p-5">
        {[
          { label: "queue", value: "send-daily-digest" },
          { label: "started", value: "2026-04-12 09:00:14 UTC" },
          { label: "duration", value: "1.4 s" },
          { label: "attempt", value: "3 of 3" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono text-foreground">{row.value}</span>
          </div>
        ))}
        <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground/90">
          <span className="text-muted-foreground">› </span>logger.error(&quot;upstream timeout&quot;)
          <br />
          <span className="text-muted-foreground">› </span>retrying in 30s…
        </div>
      </div>
    </figure>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="6" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="14" x2="4" y2="10" strokeLinecap="round" />
      <line x1="9" y1="14" x2="9" y2="6" strokeLinecap="round" />
      <line x1="14" y1="14" x2="14" y2="9" strokeLinecap="round" />
    </svg>
  );
}

/** Slack mark — integration context only; not customer proof. */
function SlackMark() {
  return (
    <svg
      aria-hidden="true"
      className="text-[hsl(var(--integration-slack))]"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.528 2.528 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834V5.042zm0 1.27a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.123 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.833zm-1.27 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.521 2.522v6.311zm-2.521 10.123a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.27a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313zM5.042 8.833a2.528 2.528 0 0 1-2.52-2.521A2.528 2.528 0 0 1 5.042 3.79 2.527 2.527 0 0 1 7.563 6.31v2.523H5.042zm0 1.27h2.521v6.313a2.528 2.528 0 0 1-2.521 2.522A2.528 2.528 0 0 1 2.52 17.436V11.12a2.528 2.528 0 0 1 2.522-2.518z" />
    </svg>
  );
}

/** Discord mark — integration context only; not customer proof. */
function DiscordMark() {
  return (
    <svg
      aria-hidden="true"
      className="text-[hsl(var(--integration-discord))]"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function PlaceholderMark({ label }: { label: string }) {
  return (
    <span className="inline-flex h-7 w-12 items-center justify-center rounded-sm border border-foreground/30 font-mono text-[11px] uppercase tracking-wider">
      {label}
    </span>
  );
}
