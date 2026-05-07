/**
 * SiteNav — primary marketing site navigation.
 *
 * Pattern: a slim sticky bar with a wordmark on the left, a small group of
 * destination links, and a single primary CTA on the right. This is the
 * default nav for every page composed by this framework.
 *
 * Design rules enforced:
 *   - Single <nav aria-label="Primary">.
 *   - Visible focus states preserved on every link and button.
 *   - Touch targets are ≥ 44 px on mobile (the right-side CTA enlarges).
 */

import type { ReactNode } from "react";

import { Action } from "../_lib/primitives.js";
import { cn } from "../_lib/cn.js";

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteNavProps {
  wordmark: ReactNode;
  links: NavLink[];
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

export function SiteNav({ wordmark, links, cta, secondaryCta, className }: SiteNavProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6">
        <a
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          {wordmark}
        </a>

        <ul className="hidden flex-1 items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          {secondaryCta ? (
            <Action href={secondaryCta.href} variant="ghost" size="sm">
              {secondaryCta.label}
            </Action>
          ) : null}
          <Action href={cta.href} size="sm">
            {cta.label}
          </Action>
        </div>
      </div>
    </nav>
  );
}
