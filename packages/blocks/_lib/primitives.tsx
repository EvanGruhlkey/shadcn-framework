/**
 * Minimal primitives used by every block.
 *
 * These wrap the same CSS-variable surface as shadcn/ui (`--primary`,
 * `--foreground`, `--muted`, `--border`, `--ring`) so a project that has
 * shadcn/ui installed can drop in its own `Button` / `Card` and the blocks
 * will inherit the project's theme without modification.
 *
 * They are intentionally narrow. Any styling more sophisticated than these
 * primitives belongs inside the block that needs it, not here.
 */

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { cn } from "./cn.js";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline:
    "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button ref={ref} className={buttonClass(variant, size, className)} {...props} />
  ),
);
Button.displayName = "Button";

/**
 * Action — semantic CTA. Renders an `<a>` when given an `href`, a
 * `<button>` otherwise. Use this in marketing blocks; reserve `<Button>`
 * for purely interactive controls (e.g. modals, form submission).
 */
export type ActionProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "type" | "onClick"> & {
  href?: string;
  variant?: Variant;
  size?: Size;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  disabled?: boolean;
};

export function Action({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  type,
  onClick,
  disabled,
  ...rest
}: ActionProps) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    return (
      <a href={href} className={cls} aria-disabled={disabled || undefined} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button
      type={type ?? "button"}
      className={cls}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Required for a11y. The block's heading uses this id. */
  ariaLabelledBy: string;
}

export function Section({
  ariaLabelledBy,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={cn("py-20 md:py-28", className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
