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
    icon: <SquareIcon />,
    title: "Operator-friendly",
    description:
      "Pause queues, drain workers, and replay failed runs from a single console without leaving prod.",
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
          <ReplayMockup />
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

function SquareIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="12" height="12" rx="2" />
      <line x1="4" y1="9" x2="16" y2="9" />
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
