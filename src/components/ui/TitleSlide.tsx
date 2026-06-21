"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedText } from "./TextAnimation";

// ─── TITLE SLIDE ──────────────────────────────────────────────────────────────
// Opacity is controlled externally — parent writes directly to the wrapper
// div's style.opacity via a DOM ref (RAF loop, zero React re-renders).
//
// `revealed` is a boolean that flips exactly ONCE on entry and ONCE on exit
// per scroll-through. It gates AnimatedText character wipes + staggered
// motion.animate targets. Using a boolean (not a MotionValue) means Framer
// Motion's animate prop only re-evaluates at two scroll positions, not 60×/sec.
//
// This component owns ZERO scroll logic. The parent (HeroSection) owns all
// of it. This is the correct separation of concerns.
//
// Internal stagger (slowed down so the reveal feels more deliberate):
//   0.1s   subtitle ("What Sets Me Apart")
//   0.3s   headline wipe starts ("I DON'T JUST CODE.")
//   0.9s   "BUT" + "CRAFT." wipe
//   1.6s   underline draws
//   1.9s   closing tagline
// ─────────────────────────────────────────────────────────────────────────────

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface TitleSlideProps {
  revealed: boolean;
}

export function TitleSlide({ revealed }: TitleSlideProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="text-center px-6">
        <motion.p
          className="text-[10px] uppercase tracking-[0.4em] text-neutral-200 font-medium mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          What Sets Me Apart
        </motion.p>

        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black italic uppercase leading-[0.88] tracking-wide">
          <span className="block">
            <AnimatedText
              text="I DON'T JUST CODE."
              startReveal={revealed}
              delayOffset={0.3}
              color="#FFFFFF"
            />
          </span>
          <span className="block mt-2">
            <AnimatedText
              text="BUT"
              startReveal={revealed}
              delayOffset={0.3}
              color="#FFFFFF"
            />
            <AnimatedText
              text="CRAFT."
              startReveal={revealed}
              delayOffset={0.9}
              color="#00FF88"
            />
          </span>
        </div>

        <motion.div
          className="w-12 h-px bg-[#00FF88] mx-auto mt-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: revealed ? 1 : 0, opacity: revealed ? 1 : 0 }}
          transition={{ delay: 1.6, duration: 0.5, ease: cinematicEase }}
        />

        <motion.p
          className="text-neutral-200 text-sm font-light mt-6 max-w-xs mx-auto leading-relaxed tracking-widest text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ delay: 1.9, duration: 0.6 }}
        >
          I build what others only design.
          <br />I ship what others only plan.
        </motion.p>
      </div>
    </div>
  );
}