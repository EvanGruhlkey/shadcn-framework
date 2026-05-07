/**
 * Original wordmark — a stylized "≡" plus a hairline frame. Generated
 * from Tailwind utilities, no external assets.
 */

import { cn } from "@framework/blocks";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-[5px] border border-foreground/35 text-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="3" y1="5" x2="13" y2="5" />
        <line x1="3" y1="8" x2="13" y2="8" />
        <line x1="3" y1="11" x2="9" y2="11" />
      </svg>
    </span>
  );
}
