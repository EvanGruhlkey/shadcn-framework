/**
 * Shared motion envelope for Framer Motion + CSS fallbacks.
 * Keep in sync with `rules/design-rules.md` §6.
 */

/** Custom cubic bezier — calm deceleration, no overshoot. */
export const DS_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const DS_MOTION_DURATION = {
  /** Single element enter */
  subtle: 0.2,
  /** Panels / hero asides */
  panel: 0.22,
  /** Stagger delay between siblings */
  stagger: 0.05,
} as const;
