import Link from "next/link";

import ExamplePage, { meta } from "@/components/generated/example";

export const metadata = { title: "Generated · example" };

export default function GeneratedExampleRoute() {
  return (
    <div>
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">Studio</Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-foreground">Generated · example</span>
          </nav>
          <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
                Example generated page
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {meta.intent}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-x-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <div>
                <dt>category</dt>
                <dd className="mt-1 text-sm normal-case tracking-normal text-foreground">
                  {meta.category}
                </dd>
              </div>
              <div>
                <dt>density</dt>
                <dd className="mt-1 text-sm normal-case tracking-normal text-foreground">
                  {meta.density}
                </dd>
              </div>
              <div>
                <dt>patterns</dt>
                <dd className="mt-1 text-sm normal-case tracking-normal text-foreground">
                  {meta.patterns.length}
                </dd>
              </div>
            </dl>
          </header>
        </div>
      </section>

      <ExamplePage />
    </div>
  );
}
