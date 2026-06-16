"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];
export function AnimatedText({
  text,
  delayOffset = 0,
  startReveal,
  color = "#fff",
}: {
  text: string;
  delayOffset?: number;
  startReveal: boolean;
  color?: string;
}) {
  return (
    <span className="inline-flex overflow-hidden">
      {text.split("").map((char, i) => (
        <EntryWipeCharacter
          key={i}
          char={char === " " ? "\u00A0" : char}
          delay={delayOffset + i * 0.04}
          startReveal={startReveal}
          color={color}
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
}: {
  char: string;
  delay: number;
  startReveal: boolean;
  color?: string;
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
      className="inline-block whitespace-pre"
    >
      {char}
    </motion.span>
  );
}

export function ExitWipeCharacter({
  char,
  delay,
}: {
  char: string;
  delay: number;
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
      className="inline-block "
    >
      {char}
    </motion.span>
  );
}
