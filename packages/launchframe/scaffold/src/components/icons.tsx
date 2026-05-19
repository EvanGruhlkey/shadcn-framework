import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

/** Extracted target-site SVG icons are added here during /clone-website. */
export function PlaceholderIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
