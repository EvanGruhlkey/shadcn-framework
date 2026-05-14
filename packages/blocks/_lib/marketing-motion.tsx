/**
 * Client-only marketing motion primitives — Framer Motion + reduced motion.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "./cn.js";
import { DS_MOTION_DURATION, DS_MOTION_EASE } from "./motion-tokens.js";

export function FadeUp({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DS_MOTION_DURATION.subtle, ease: DS_MOTION_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: DS_MOTION_DURATION.stagger, delayChildren: 0.04 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DS_MOTION_DURATION.subtle, ease: DS_MOTION_EASE },
  },
};

export function Stagger({
  className,
  as: Component = "div",
  children,
}: {
  className?: string;
  as?: "div" | "ul" | "ol";
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Static = Component;
    return <Static className={className}>{children}</Static>;
  }
  const MotionTag = Component === "div" ? motion.div : Component === "ul" ? motion.ul : motion.ol;
  return (
    <MotionTag
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  className,
  children,
  as = "div",
}: {
  className?: string;
  children: ReactNode;
  /** Use `"li"` when the parent `Stagger` is `as="ul"` or `as="ol"`. */
  as?: "div" | "li";
}) {
  const reduced = useReducedMotion();
  const Static = as === "li" ? "li" : "div";
  if (reduced) {
    return <Static className={className}>{children}</Static>;
  }
  const Motion = as === "li" ? motion.li : motion.div;
  return (
    <Motion className={className} variants={staggerItem}>
      {children}
    </Motion>
  );
}
