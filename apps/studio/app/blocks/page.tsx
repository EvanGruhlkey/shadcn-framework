import Link from "next/link";

export const metadata = { title: "Block gallery" };

const FAMILIES = [
  {
    name: "Navigation",
    blocks: [
      { id: "navigation/SiteNav", summary: "Sticky primary nav with single CTA." },
    ],
  },
  {
    name: "Hero",
    blocks: [
      { id: "hero/HeroSplitCode", summary: "Split layout with a code panel and optional language tabs." },
      { id: "hero/HeroAgentDemo", summary: "Static agent transcript anchored in the right pane." },
      { id: "hero/HeroEnterpriseSplit", summary: "Outcome headline with a Tailwind-built dashboard placeholder." },
    ],
  },
  {
    name: "Proof",
    blocks: [
      { id: "proof/LogoStripMono", summary: "Monochrome logo strip; logos are caller-owned." },
      { id: "proof/QuoteCardsThree", summary: "Three customer quote cards with proper figure semantics." },
    ],
  },
  {
    name: "Feature systems",
    blocks: [
      { id: "feature-systems/FeatureGridThree", summary: "Three-pillar feature grid, icon-top or icon-leading." },
      { id: "feature-systems/FeatureGridFour", summary: "Four-pillar platform overview with optional 'Learn more'." },
      { id: "feature-systems/FeatureDeepDive", summary: "Extended single-feature explanation with a media aside." },
      { id: "feature-systems/UseCaseRoleGrid", summary: "Role-based 3–6 card use-case grid." },
    ],
  },
  {
    name: "Pricing",
    blocks: [
      { id: "pricing/PricingTierTable", summary: "3 or 4 tier table; supports fixed and label-only prices." },
      { id: "pricing/UsageCalculator", summary: "Interactive multi-meter calculator with a transparent line-item breakdown." },
    ],
  },
  {
    name: "Conversion",
    blocks: [
      { id: "conversion/ConversionBand", summary: "Centered or asymmetric band with optional trust line." },
    ],
  },
];

export default function BlocksGalleryPage() {
  const total = FAMILIES.reduce((s, f) => s + f.blocks.length, 0);
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Block gallery
        </span>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {total} original shadcn/ui blocks across {FAMILIES.length} families.
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          Every block is referenced by id from one or more pattern atlases.
          Blocks consume only shadcn/ui's CSS variables, ship no proprietary
          imagery, and accept their content via typed Props.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {FAMILIES.map((family) => (
          <article key={family.name}>
            <header className="flex items-baseline gap-3 border-b border-border pb-3">
              <h2 className="text-lg font-semibold">{family.name}</h2>
              <span className="text-xs text-muted-foreground">
                {family.blocks.length} block{family.blocks.length === 1 ? "" : "s"}
              </span>
            </header>
            <ul className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {family.blocks.map((b) => (
                <li
                  key={b.id}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {b.id}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                    {b.summary}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        See the framework in action on the{" "}
        <Link href="/generated/example" className="font-medium text-foreground hover:underline">
          example generated page
        </Link>
        .
      </p>
    </section>
  );
}
