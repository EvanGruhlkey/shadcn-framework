import Link from "next/link";

import { loadAllAtlases } from "@framework/patterns";

export default function HomePage() {
  const { atlases } = loadAllAtlases();
  const orderedAtlases = Array.from(atlases.values()).sort((a, b) =>
    a.category.localeCompare(b.category),
  );

  const totals = {
    categories: orderedAtlases.length,
    patterns: orderedAtlases.reduce((sum, a) => sum + a.patterns.length, 0),
    blocks: orderedAtlases.reduce(
      (sum, a) => sum + a.patterns.filter((p) => p.block_ref).length,
      0,
    ),
  };

  return (
    <>
      <section
        aria-labelledby="studio-hero-heading"
        className="border-b border-border"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <span className="inline-block rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Research framework · v0.1
            </span>
            <h1
              id="studio-hero-heading"
              className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-6xl"
            >
              The grammar of SaaS interfaces, formalized for AI agents.
            </h1>
            <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              shadcn-ui-framework analyzes high-performing SaaS websites and
              translates the recurring patterns into typed schemas, original
              shadcn/ui blocks, and evaluable rules. Agents read the framework
              before they generate; the framework grades them after.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/atlas"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse the pattern atlas
              </Link>
              <Link
                href="/blocks"
                className="inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open the block gallery →
              </Link>
            </div>
          </div>

          <aside className="md:col-span-5">
            <dl className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-card p-5">
              <Stat label="Categories" value={totals.categories} />
              <Stat label="Patterns" value={totals.patterns} />
              <Stat label="Blocks" value={totals.blocks} />
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Counts derived live from <code className="font-mono">pattern-atlas/*.json</code>{" "}
              by <code className="font-mono">@framework/patterns</code>.
            </p>
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="studio-pipeline-heading"
        className="border-b border-border bg-muted/20 py-20 md:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <header className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pipeline
            </span>
            <h2
              id="studio-pipeline-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl"
            >
              Capture, analyze, formalize, evaluate.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              Four stages, each emitting typed artifacts that the next stage
              consumes. The studio is a window onto every stage's output.
            </p>
          </header>

          <ol className="mt-12 grid gap-4 md:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <li
                key={step.title}
                className="rounded-lg border border-border bg-card p-5"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  Stage {i + 1}
                </span>
                <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {step.artifact}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="studio-atlases-heading"
        className="py-20 md:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Atlases
              </span>
              <h2
                id="studio-atlases-heading"
                className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Four categories. {totals.patterns} formalized patterns.
              </h2>
            </div>
            <Link
              href="/atlas"
              className="text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              View all →
            </Link>
          </header>

          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {orderedAtlases.map((atlas) => (
              <li key={atlas.category}>
                <Link
                  href={`/atlas/${atlas.category}`}
                  className="block rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold">
                      {humanize(atlas.category)}
                    </h3>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      density · {atlas.density_profile}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {atlas.summary}
                  </p>
                  <p className="mt-4 font-mono text-xs text-muted-foreground">
                    {atlas.patterns.length} patterns ·{" "}
                    {atlas.patterns.filter((p) => p.block_ref).length} implemented
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((s) => s[0]!.toUpperCase() + s.slice(1))
    .join(" ");
}

const PIPELINE = [
  {
    title: "Capture",
    description:
      "Render public pages at fixed viewports. Store only PNGs; never HTML, JS, or third-party assets.",
    artifact: "→ datasets/captures",
  },
  {
    title: "Analyze",
    description:
      "Extract a typed LayoutObservation per screenshot. Validate, normalize, and run a deterministic role classifier.",
    artifact: "→ datasets/observations",
  },
  {
    title: "Formalize",
    description:
      "Aggregate observations into named patterns with prevalence, variants, and a pointer to a shadcn/ui block.",
    artifact: "→ pattern-atlas",
  },
  {
    title: "Evaluate",
    description:
      "Grade a generated page on coherence, clone risk, and accessibility. Fail the build on any error issue.",
    artifact: "→ PageEvaluation report",
  },
];
