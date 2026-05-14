/**
 * Framed marketing media — matches `ds-media-frame` in studio `globals.css`
 * so pages stay on-token without one-off border classes.
 */

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn.js";

/** Shared class for `<figure>`, `<div>`, or `MediaFrame` — keep blocks and utilities aligned. */
export const MEDIA_FRAME_CLASS =
  "overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm ring-1 ring-foreground/[0.04]";

export function MediaFrame({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn(MEDIA_FRAME_CLASS, className)} {...rest}>
      {children}
    </div>
  );
}

export function MediaCaption({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p
      className={cn(
        "border-t border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
