"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { AnimatedText, ExitWipeCharacter } from "./TextAnimation";
import { InteractiveAsciiPortrait } from "../asci art/InteractiveAsciiPortrait";
import { TitleSlide } from "./TitleSlide";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

// ─── SCROLL TIMELINE (hero scroll 0 → 1) ─────────────────────────────────────
// 0.00 → 0.30  ASCII explosion (InteractiveAsciiPortrait scrollProgress = v/0.30)
// 0.30 → 0.50  gap — explosion done, nothing yet
// 0.50 → 0.60  TitleSlide fade in
// 0.60 → 0.92  TitleSlide hold (widened from 0.60→0.85)
// 0.92 → 0.98  TitleSlide fade out
// 0.98 → 1.00  exit buffer
//
// Title opacity is a spring (useSpring over a useMotionValue) chasing a
// scroll-derived target updated via RAF — same spring config as
// ServiceVisualCard, so it has the same fluid, trailing fade feel.
// `revealed` flips exactly once on entry and once on exit, so AnimatedText
// character wipes fire at the correct moment.
// ─────────────────────────────────────────────────────────────────────────────
const TITLE_FADE_IN_START = 0.5;
const TITLE_FADE_IN_END = 0.6;
const TITLE_HOLD_END = 0.92; // was 0.85 — longer hold
const TITLE_FADE_OUT_END = 0.98; // was 0.95 — pushed back to preserve fade-out window
const TITLE_REVEAL_AT = 0.55; // midpoint of fade-in — flip revealed here

export function HeroSection({
  onComplete,
  isLoaded,
  scrollRef,
  uiOpacity,
}: {
  onComplete: () => void;
  isLoaded: boolean;
  scrollRef: React.MutableRefObject<number>;
  uiOpacity: number;
}) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(5);

  // ── Title slide state ──────────────────────────────────────────────────────
  // titleOpacityRaw: raw linear opacity (0→1) computed from scroll, updated
  //   via RAF — this is the "target" the spring chases, not what's rendered.
  // titleOpacitySpring: same spring feel as ServiceVisualCard's smoothY/smoothScale
  //   (stiffness 100, damping 20) — gives the title the same fluid, slightly
  //   trailing motion as the SplitSection cards instead of a mechanical linear fade.
  // revealed: boolean flipped at threshold crossings only (2 setState/scroll).
  // revealedRef: guards against double-fire — state only sets when ref differs.
  const titleOpacityRaw = useMotionValue(0);
  const titleOpacitySpring = useSpring(titleOpacityRaw, {
    stiffness: 100,
    damping: 20,
  });
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);

  // ── RAF loop: feeds the spring target from scroll, flips revealed once ────
  useEffect(() => {
    if (!isLoaded) return; // don't run until hero sequence is done

    let raf: number;

    const tick = () => {
      const v = scrollRef.current;

      // Calculate target opacity from scroll position — the spring smooths
      // the transition between these values rather than snapping to them.
      let opacity = 0;
      if (v >= TITLE_FADE_IN_START && v < TITLE_FADE_IN_END) {
        opacity =
          (v - TITLE_FADE_IN_START) / (TITLE_FADE_IN_END - TITLE_FADE_IN_START);
      } else if (v >= TITLE_FADE_IN_END && v <= TITLE_HOLD_END) {
        opacity = 1;
      } else if (v > TITLE_HOLD_END && v < TITLE_FADE_OUT_END) {
        opacity =
          1 - (v - TITLE_HOLD_END) / (TITLE_FADE_OUT_END - TITLE_HOLD_END);
      }

      titleOpacityRaw.set(Math.max(0, Math.min(1, opacity)));

      // Flip `revealed` exactly once at the threshold crossing — not every tick
      const shouldReveal = v >= TITLE_REVEAL_AT && v <= TITLE_FADE_OUT_END;
      if (shouldReveal !== revealedRef.current) {
        revealedRef.current = shouldReveal;
        setRevealed(shouldReveal);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isLoaded, scrollRef, titleOpacityRaw]);

  // ── Counter logic ──────────────────────────────────────────────────────────
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

  // ── Cinematic sequence timings ─────────────────────────────────────────────
  // NOTE: phase 3 → 4 is driven by onAnimationComplete on the expand div,
  // NOT a timer. See handleExpandComplete below.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === 1) timer = setTimeout(() => setPhase(2), 600);
    else if (phase === 2) timer = setTimeout(() => setPhase(3), 1200);
    else if (phase === 4) timer = setTimeout(() => setPhase(5), 800);
    else if (phase === 5) timer = setTimeout(() => onComplete(), 1000);

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const handleExpandComplete = useCallback(() => {
    setPhase((prev) => (prev === 3 ? 4 : prev));
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* PHASE 1 & 2: COUNTER & WIPE */}
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

      {/* PHASE 3: EXPANDING BACKGROUND */}
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
              width: phase >= 3 ? "100vw" : "280px",
              height: phase >= 3 ? "100vh" : "400px",
              opacity: 1,
              borderRadius: phase >= 3 ? "0rem" : "1rem",
            }}
            transition={{
              opacity: { duration: 0.4 },
              width: { duration: 1.0, ease: cinematicEase },
              height: { duration: 1.0, ease: cinematicEase },
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
                scrollRef={scrollRef}
              />
            )}
          </motion.div>
        )}
      </div>

      {/* TITLE SLIDE OVERLAY
          Mounted once phase >= 4 (ASCII portrait is live).
          Opacity is a spring (stiffness 100, damping 20 — same as
          ServiceVisualCard) chasing a scroll-derived target, so the title
          fades with the same fluid, slightly-trailing feel as the
          SplitSection cards instead of a mechanical linear ramp.
          `revealed` boolean gates AnimatedText wipes — flips at threshold only.
          z-20 sits above ASCII (z-10 expand div) but below UI labels (z-30). */}
      {phase >= 4 && (
        <motion.div
          style={{ opacity: titleOpacitySpring }}
          className="absolute inset-0 z-20"
        >
          <TitleSlide revealed={revealed} />
        </motion.div>
      )}

      {/* PHASE 4 & 5: PORTFOLIO UI (name + title labels)
          uiOpacity fades these out at 0→15% scroll so they don't compete
          with the TitleSlide which starts at 50% scroll. */}
      {phase >= 4 && (
        <div
          style={{ opacity: uiOpacity, transition: "opacity 0.1s ease-out" }}
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
                <AnimatedText
                  text="HUSNAIN"
                  startReveal={true}
                  color="#00FF88"
                />
              </span>
              <span className="block">
                <AnimatedText
                  text="MAROOF"
                  startReveal={true}
                  delayOffset={0.2}
                  color="#FFFFFF"
                />
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
                <AnimatedText
                  text="FULL STACK"
                  startReveal={true}
                  delayOffset={0.4}
                  color="#00FF88"
                />
              </span>
              <span className="block">
                <AnimatedText
                  text="DEVELOPER"
                  startReveal={true}
                  delayOffset={0.6}
                  color="#FFFFFF"
                />
              </span>
            </h2>
          </div>
        </div>
      )}
    </section>
  );
}
