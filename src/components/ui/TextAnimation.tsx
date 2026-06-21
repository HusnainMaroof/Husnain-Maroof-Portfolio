"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export function AnimatedText({
  text,
  delayOffset = 0,
  startReveal,
  color = "#fff",
  onComplete,
}: {
  text: string;
  delayOffset?: number;
  startReveal: boolean;
  color?: string;
  /** Fires once, when the last character finishes revealing. */
  onComplete?: () => void;
}) {
  const chars = text.split("");
  return (
    <span className="inline-flex overflow-hidden">
      {chars.map((char, i) => (
        <EntryWipeCharacter
          key={i}
          char={char === " " ? "\u00A0" : char}
          delay={delayOffset + i * 0.04}
          startReveal={startReveal}
          color={color}
          onComplete={i === chars.length - 1 ? onComplete : undefined}
        />
      ))}
    </span>
  );
}

export function EntryWipeCharacter({
  char,
  delay,
  startReveal,
  color = "#ffffff",
  onComplete,
}: {
  char: string;
  delay: number;
  startReveal: boolean;
  color?: string;
  onComplete?: () => void;
}) {
  const entryVariants = {
    hidden: {
      color: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
    },
    reveal: {
      color: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", color, color],
      backgroundColor: ["rgba(0,0,0,0)", "#404040", "#404040", "rgba(0,0,0,0)"],
      transition: {
        duration: 0.35,
        times: [0, 0.01, 0.99, 1],
        delay,
      },
    },
  };

  return (
    <motion.span
      variants={entryVariants}
      initial="hidden"
      animate={startReveal ? "reveal" : "hidden"}
      onAnimationComplete={() => {
        if (startReveal) onComplete?.();
      }}
      className="inline-block whitespace-pre"
    >
      {char}
    </motion.span>
  );
}

export function ExitWipeCharacter({
  char,
  delay,
  onComplete,
}: {
  char: string;
  delay: number;
  onComplete?: () => void;
}) {
  const exitVariants = {
    hidden: { color: "#ffffff", backgroundColor: "rgba(0,0,0,0)" },
    wiping: {
      color: ["#ffffff", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
      backgroundColor: ["rgba(0,0,0,0)", "#ffffff", "#ffffff", "rgba(0,0,0,0)"],
      transition: { duration: 0.35, times: [0, 0.01, 0.99, 1], delay: delay },
    },
  };
  return (
    <motion.span
      variants={exitVariants}
      initial="hidden"
      animate="wiping"
      onAnimationComplete={() => onComplete?.()}
      className="inline-block "
    >
      {char}
    </motion.span>
  );
}

/**
 * Mirrors AnimatedText, but for the outgoing string: wipes each character
 * out via ExitWipeCharacter and fires onComplete once the last one finishes.
 * Pair with AnimatedText to reproduce an "animate out -> swap content ->
 * animate in" sequence without timers, e.g.:
 *
 *   phase === "exiting"
 *     ? <ExitText text={oldValue} onComplete={() => { swap content; setPhase("idle"); }} />
 *     : <AnimatedText text={newValue} startReveal onComplete={() => unlock()} />
 */
export function ExitText({
  text,
  delayOffset = 0,
  onComplete,
}: {
  text: string;
  delayOffset?: number;
  onComplete?: () => void;
}) {
  const chars = text.split("");
  return (
    <span className="inline-flex overflow-hidden">
      {chars.map((char, i) => (
        <ExitWipeCharacter
          key={i}
          char={char === " " ? "\u00A0" : char}
          delay={delayOffset + i * 0.03}
          onComplete={i === chars.length - 1 ? onComplete : undefined}
        />
      ))}
    </span>
  );
}