import Link from "next/link";

import { loadAllAtlases } from "@framework/patterns";

export const metadata = { title: "Pattern atlas" };

export default function AtlasIndexPage() {
  const { atlases } = loadAllAtlases();
  const sorted = Array.from(atlases.values()).sort((a, b) =>
    a.category.localeCompare(b.category),
  );

  return (
    <section
      aria-labelledby="atlas-index-heading"
      className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
    >
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pattern atlas
        </span>
        <h1
          id="atlas-index-heading"
          className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl"
        >
          Four atlases. One taxonomy.
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Each atlas is a structured catalog of recurring section patterns
          observed across a corpus. Patterns are typed, prevalence is
          recorded, and every implemented pattern points back to a block in{" "}
          <code className="font-mono">@framework/blocks</code>.
        </p>
      </header>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {sorted.map((atlas) => (
          <li key={atlas.category}>
            <Link
              href={`/atlas/${atlas.category}`}
              className="flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <header className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{humanize(atlas.category)}</h2>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {atlas.density_profile}
                </span>
              </header>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {atlas.summary}
              </p>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {atlas.patterns.slice(0, 6).map((p) => (
                  <li
                    key={p.id}
                    className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {p.role}
                  </li>
                ))}
                {atlas.patterns.length > 6 ? (
                  <li className="rounded-full px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    +{atlas.patterns.length - 6}
                  </li>
                ) : null}
              </ul>

              <p className="mt-auto pt-6 font-mono text-xs text-muted-foreground">
                {atlas.patterns.length} patterns ·{" "}
                {atlas.patterns.filter((p) => p.block_ref).length} implemented · open →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function humanize(slug: string): string {
  return slug.split("-").map((s) => s[0]!.toUpperCase() + s.slice(1)).join(" ");
}
