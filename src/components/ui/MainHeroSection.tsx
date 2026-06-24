"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  MotionValue,
} from "framer-motion";
import { AnimatedText, ExitWipeCharacter } from "./TextAnimation";
import { InteractiveAsciiPortrait } from "../asci art/InteractiveAsciiPortrait";
import { TitleSlide } from "./TitleSlide";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

const TITLE_FADE_IN_START = 0.5;
const TITLE_FADE_IN_END   = 0.6;
const TITLE_HOLD_END      = 0.92;
const TITLE_FADE_OUT_END  = 0.98;
const TITLE_REVEAL_AT     = 0.55;

export function HeroSection({
  localP,
  uiOpacityMV,
  onLoadComplete,
}: {
  localP: React.MutableRefObject<number>;
  uiOpacityMV: MotionValue<number>;
  onLoadComplete?: () => void;
}) {
  const [count, setCount]   = useState(0);
  const [phase, setPhase]   = useState(0);

  const titleOpacityRaw    = useMotionValue(0);
  const titleOpacitySpring = useSpring(titleOpacityRaw, {
    stiffness: 100,
    damping: 20,
  });
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const hasFiredReady = useRef(false);

  // ── RAF: title opacity + revealed driven by localP ───────────────────────
  useEffect(() => {
    if (phase < 4) return;

    let raf: number;
    const tick = () => {
      const v = localP.current;

      let opacity = 0;
      if (v >= TITLE_FADE_IN_START && v < TITLE_FADE_IN_END) {
        opacity = (v - TITLE_FADE_IN_START) / (TITLE_FADE_IN_END - TITLE_FADE_IN_START);
      } else if (v >= TITLE_FADE_IN_END && v <= TITLE_HOLD_END) {
        opacity = 1;
      } else if (v > TITLE_HOLD_END && v < TITLE_FADE_OUT_END) {
        opacity = 1 - (v - TITLE_HOLD_END) / (TITLE_FADE_OUT_END - TITLE_HOLD_END);
      }

      titleOpacityRaw.set(Math.max(0, Math.min(1, opacity)));

      const shouldReveal = v >= TITLE_REVEAL_AT && v <= TITLE_FADE_OUT_END;
      if (shouldReveal !== revealedRef.current) {
        revealedRef.current = shouldReveal;
        setRevealed(shouldReveal);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, localP, titleOpacityRaw]);

  // ── Counter ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 0) return;
    let current = 1;
    let advanceTimer: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      current += 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setCount(current);
        advanceTimer = setTimeout(() => setPhase(1), 300);
      } else {
        setCount(current);
      }
    }, 15);
    return () => {
      clearInterval(interval);
      clearTimeout(advanceTimer);
    };
  }, [phase]);

  // ── Phase sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (phase === 1) timer = setTimeout(() => setPhase(2), 600);
    else if (phase === 2) timer = setTimeout(() => setPhase(3), 1200);
    else if (phase === 4) timer = setTimeout(() => setPhase(5), 800);
    return () => clearTimeout(timer);
  }, [phase]);

  // ── Fire onLoadComplete exactly once when phase 5 is reached ──────────────
  useEffect(() => {
    if (phase === 5 && !hasFiredReady.current) {
      hasFiredReady.current = true;
      onLoadComplete?.();
    }
  }, [phase, onLoadComplete]);

  const handleExpandComplete = useCallback(() => {
    setPhase((prev) => (prev === 3 ? 4 : prev));
  }, []);

  return (
    <section className="absolute inset-0 overflow-hidden">
      {/* PHASE 0 & 1: COUNTER */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        {phase === 0 && (
          <div className="text-2xl md:text-[4rem] lg:text-[6rem] font-mono font-semibold tracking-tighter leading-none">
            {count}
          </div>
        )}
        {phase === 1 && (
          <div className="text-2xl md:text-[4rem] lg:text-[6rem] font-mono font-semibold tracking-tighter leading-none flex">
            {["1", "0", "0"].map((char, index) => (
              <ExitWipeCharacter key={index} char={char} delay={index * 0.1} />
            ))}
          </div>
        )}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/85 font-tech uppercase tracking-widest animate-bounce">
          <AnimatedText text="Loading..." startReveal={phase === 0} />
        </div>
      </div>

      {/* PHASE 2+: EXPANDING BACKGROUND */}
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/50">
        {phase >= 2 && (
          <motion.div
            className="relative flex items-center justify-center overflow-hidden bg-[#050505]"
            initial={{
              width: "0px",
              height: "0px",
              opacity: 0,
              borderRadius: "1rem",
            }}
            animate={{
              width:        phase >= 3 ? "100vw" : "280px",
              height:       phase >= 3 ? "100vh" : "400px",
              opacity:      1,
              borderRadius: phase >= 3 ? "0rem"  : "1rem",
            }}
            transition={{
              opacity:      { duration: 0.4 },
              width:        { duration: 1.0, ease: cinematicEase },
              height:       { duration: 1.0, ease: cinematicEase },
              borderRadius: { duration: 1.0, ease: cinematicEase },
            }}
            onAnimationComplete={handleExpandComplete}
          >
            {phase >= 4 && (
              <InteractiveAsciiPortrait
                image="/images/main_hero_image1.png"
                resolution={4}
                fontSize={8}
                hoverRadius={120}
                scrollRef={localP}
              />
            )}
          </motion.div>
        )}
      </div>

      {/* TITLE SLIDE */}
      {phase >= 4 && (
        <motion.div
          style={{ opacity: titleOpacitySpring }}
          className="absolute inset-0 z-20"
        >
          <TitleSlide revealed={revealed} />
        </motion.div>
      )}

      {/* UI LABELS — name + title */}
      {phase >= 4 && (
        <motion.div
          style={{ opacity: uiOpacityMV }}
          className="absolute inset-0 z-30 pointer-events-none"
        >
          {/* Left: Name */}
          <div className="absolute md:top-1/2 top-[40%] left-2 md:left-12 lg:left-20 -translate-y-1/2 z-30">
            <p className="mb-3 flex items-center gap-2 text-[8px] md:text-sm uppercase tracking-[0.25em] text-neutral-400 font-medium">
              <span>👋</span>
              <span>HI, MY NAME IS</span>
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black italic uppercase leading-[0.9]">
              <span className="block text-primary">
                <AnimatedText text="HUSNAIN" startReveal={true} color="#00FF88" />
              </span>
              <span className="block">
                <AnimatedText text="MAROOF" startReveal={true} delayOffset={0.2} color="#FFFFFF" />
              </span>
            </h2>
          </div>

          {/* Right: Title */}
          <div className="absolute md:top-1/2 right-2 top-[40%] md:right-12 lg:right-20 -translate-y-1/2 z-30">
            <p className="mb-3 text-xs md:text-sm uppercase tracking-[0.25em] text-neutral-400 font-medium text-left">
              I AM A
            </p>
            <h2 className="text-xl md:text-5xl lg:text-6xl font-display font-black italic uppercase leading-[0.9] text-right">
              <span className="block text-primary">
                <AnimatedText text="FULL STACK" startReveal={true} delayOffset={0.4} color="#00FF88" />
              </span>
              <span className="block">
                <AnimatedText text="DEVELOPER" startReveal={true} delayOffset={0.6} color="#FFFFFF" />
              </span>
            </h2>
          </div>
        </motion.div>
      )}
    </section>
  );
}