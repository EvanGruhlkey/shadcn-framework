/**
 * Client transcript shell for HeroAgentDemo — Framer Motion enter transitions
 * with prefers-reduced-motion respected (CSS fallback or static markup when reduced).
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "../_lib/cn.js";
import { MEDIA_FRAME_CLASS } from "../_lib/media-frame.js";
import { DS_MOTION_DURATION, DS_MOTION_EASE } from "../_lib/motion-tokens.js";

import type { AgentTurn } from "./agent-types.js";

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: DS_MOTION_DURATION.stagger,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DS_MOTION_DURATION.subtle, ease: DS_MOTION_EASE },
  },
};

function TranscriptHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Example session
      </span>
      <span className="font-mono text-xs text-muted-foreground">read-only</span>
    </header>
  );
}

function TurnRow({ turn }: { turn: AgentTurn }) {
  return (
    <>
      <span
        className={cn(
          "mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-medium",
          turn.role === "user"
            ? "border-border bg-background text-muted-foreground"
            : "border-foreground/20 bg-foreground/[0.04] text-foreground",
        )}
        aria-hidden="true"
      >
        {turn.role === "user" ? "U" : "A"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {turn.role === "user" ? "User" : "Agent"}
          </span>
          {turn.meta ? <span className="text-xs text-muted-foreground">{turn.meta}</span> : null}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{turn.content}</p>
      </div>
    </>
  );
}

export function TranscriptPanel({
  transcript,
  motion: motionMode,
}: {
  transcript: AgentTurn[];
  motion: "off" | "subtle";
}) {
  const reduced = useReducedMotion();
  const useFm = motionMode === "subtle" && !reduced;

  if (!useFm) {
    return (
      <figure
        aria-label="Example agent transcript"
        className={cn(
          MEDIA_FRAME_CLASS,
          motionMode === "subtle" &&
            "motion-safe:animate-[fadeIn_220ms_ease-out_both] motion-reduce:animate-none",
        )}
      >
        <TranscriptHeader />
        <ol className="divide-y divide-border">
          {transcript.map((turn, i) => (
            <li key={i} className="flex gap-4 px-5 py-4">
              <TurnRow turn={turn} />
            </li>
          ))}
        </ol>
      </figure>
    );
  }

  return (
    <motion.figure
      aria-label="Example agent transcript"
      className={MEDIA_FRAME_CLASS}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DS_MOTION_DURATION.panel, ease: DS_MOTION_EASE }}
    >
      <TranscriptHeader />
      <motion.ol className="divide-y divide-border" variants={listVariants} initial="hidden" animate="show">
        {transcript.map((turn, i) => (
          <motion.li key={i} variants={itemVariants} className="flex gap-4 px-5 py-4">
            <TurnRow turn={turn} />
          </motion.li>
        ))}
      </motion.ol>
    </motion.figure>
  );
}
