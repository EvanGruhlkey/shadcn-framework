import Link from "next/link";
import { notFound } from "next/navigation";

import { loadAllAtlases, loadAtlas } from "@framework/patterns";

export function generateStaticParams() {
  const { atlases } = loadAllAtlases();
  return Array.from(atlases.keys()).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return { title: `${humanize(category)} atlas` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const atlas = loadAtlas(category);
  if (!atlas) notFound();

  const byRole = atlas.patterns.reduce<Record<string, typeof atlas.patterns>>(
    (acc, p) => {
      (acc[p.role] ??= []).push(p);
      return acc;
    },
    {},
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/atlas" className="hover:underline">Atlas</Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <span className="text-foreground">{humanize(atlas.category)}</span>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {humanize(atlas.category)}
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {atlas.summary}
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-muted-foreground">
          <div>
            <dt className="inline">density profile · </dt>
            <dd className="inline text-foreground">{atlas.density_profile}</dd>
          </div>
          <div>
            <dt className="inline">patterns · </dt>
            <dd className="inline text-foreground">{atlas.patterns.length}</dd>
          </div>
          <div>
            <dt className="inline">implemented · </dt>
            <dd className="inline text-foreground">
              {atlas.patterns.filter((p) => p.block_ref).length}
            </dd>
          </div>
        </dl>
      </header>

      <section
        aria-labelledby="recommended-order-heading"
        className="mt-12 rounded-lg border border-border bg-muted/20 p-6"
      >
        <h2
          id="recommended-order-heading"
          className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Recommended section order
        </h2>
        <ol className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
          {atlas.recommended_order.map((role, i) => (
            <li
              key={role}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5"
            >
              <span className="text-muted-foreground">{i + 1}</span>
              <span className="text-foreground">{role}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="patterns-heading" className="mt-14">
        <h2
          id="patterns-heading"
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Patterns by role
        </h2>

        <div className="mt-8 space-y-12">
          {Object.entries(byRole).map(([role, patterns]) => (
            <article key={role}>
              <header className="flex items-baseline gap-3 border-b border-border pb-3">
                <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
                  {role}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {patterns.length} pattern{patterns.length === 1 ? "" : "s"}
                </span>
              </header>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {patterns.map((p) => (
                  <li
                    key={p.id}
                    className="flex h-full flex-col rounded-lg border border-border bg-card p-5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="text-base font-semibold">{p.name}</h4>
                      <span className="font-mono text-xs text-muted-foreground">
                        prevalence · {(p.prevalence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {p.summary}
                    </p>

                    <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-muted-foreground">
                      <div>
                        <dt className="inline">id · </dt>
                        <dd className="inline text-foreground">{p.id}</dd>
                      </div>
                      <div>
                        <dt className="inline">composition · </dt>
                        <dd className="inline text-foreground">{p.composition}</dd>
                      </div>
                      <div>
                        <dt className="inline">density · </dt>
                        <dd className="inline text-foreground">{p.density}</dd>
                      </div>
                      <div>
                        <dt className="inline">domains · </dt>
                        <dd className="inline text-foreground">{p.domains_seen}</dd>
                      </div>
                    </dl>

                    {p.variants.length > 0 ? (
                      <div className="mt-4 border-t border-border pt-4">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Variants
                        </h5>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {p.variants.map((v) => (
                            <li key={v.id} className="flex flex-col">
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {v.id}
                              </span>
                              <span className="text-foreground/90">{v.summary}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <p className="mt-auto pt-4 font-mono text-[11px] text-muted-foreground">
                      block_ref ·{" "}
                      <span className={p.block_ref ? "text-foreground" : ""}>
                        {p.block_ref ?? "(unimplemented)"}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function humanize(slug: string): string {
  return slug.split("-").map((s) => s[0]!.toUpperCase() + s.slice(1)).join(" ");
}
