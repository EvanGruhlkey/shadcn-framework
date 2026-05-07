import Link from "next/link";
import type { ReactNode } from "react";

import { Wordmark } from "./wordmark";

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: "/atlas", label: "Atlas" },
  { href: "/blocks", label: "Blocks" },
  { href: "/generated/example", label: "Generated" },
];

export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6"
        >
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Wordmark className="h-5 w-auto" />
            <span>shadcn-ui-framework</span>
            <span className="ms-1 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              studio
            </span>
          </Link>

          <ul className="ms-6 hidden flex-1 items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href="https://github.com/shadcn-ui-framework"
            className="ml-auto text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            GitHub →
          </a>
        </nav>
      </header>

      <main id="main" className="min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>shadcn-ui-framework — pattern research, original blocks, evaluable output.</p>
          <p className="font-mono text-xs">v0.1.0 · MIT</p>
        </div>
      </footer>
    </div>
  );
}
