"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, MotionValue } from "framer-motion";
import { AnimatedText, ExitWipeCharacter } from "./TextAnimation";
import { InteractiveAsciiPortrait } from "../asci art/InteractiveAsciiPortrait";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

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

  // 1. Counter Logic
  useEffect(() => {
    if (phase !== 0) return;

    let current = 1; // Start the count at 1
    let advanceTimer: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      current += 1; // Increment directly by 1

      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setCount(current);
        // Transition to the next phase of your UI sequence
        advanceTimer = setTimeout(() => setPhase(1), 300);
      } else {
        setCount(current);
      }
    }, 15); // Runs every 15ms

    return () => {
      clearInterval(interval);
      clearTimeout(advanceTimer);
    };
  }, [phase]);

  // 2. Cinematic Sequence Timings
  //
  // NOTE: phase 3 -> 4 is intentionally NOT a timer here anymore. It used to
  // be `setTimeout(() => setPhase(4), 1000)`, fired from the same render
  // that kicks off the box's own 1000ms expand transition — i.e. two
  // independent clocks racing each other. Any frame of mount/layout/commit
  // lag and the hero text started revealing before the box had actually
  // finished growing. Phase 4 is now driven by the expand div's own
  // `onAnimationComplete` callback below, which is the only signal that's
  // actually tied to the real animation finishing.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === 1) timer = setTimeout(() => setPhase(2), 600);
    else if (phase === 2) timer = setTimeout(() => setPhase(3), 1200);
    else if (phase === 4) timer = setTimeout(() => setPhase(5), 800);
    else if (phase === 5) timer = setTimeout(() => onComplete(), 1000);

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // This fires once per `animate` transition the expand div runs — which
  // includes the very first 0 -> 280x400 grow-in when phase becomes 2, not
  // just the 280x400 -> 100vw/100vh full-screen expand. We use the
  // functional setState form so we never depend on a possibly-stale
  // closure: only a completion that happens while phase is still 3 (the
  // full-screen expand) is allowed to advance the phase.
  const handleExpandComplete = useCallback(() => {
    setPhase((prev) => (prev === 3 ? 4 : prev));
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden ">
      {/* PHASE 1 & 2: COUNTER & WIPE */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none ">
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
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/50 ">
        {phase >= 2 && (
          <motion.div
            className="relative flex items-center justify-center overflow-hidden bg-[#050505] "
            initial={{
              width: "0px",
              height: "0px",
              opacity: 0,
              borderRadius: "1rem", // rounded-2xl
            }}
            animate={{
              width: phase >= 3 ? "100vw" : "280px",
              height: phase >= 3 ? "100vh" : "400px",
              opacity: 1,
              // Stays rounded-2xl while small; flattens to square exactly
              // as it reaches full-screen, on the same clock as width/height.
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
                scrollRef={scrollRef} // <--- Connected to Scroll Explosion!
              />
            )}
          </motion.div>
        )}
      </div>

      {/* PHASE 4 & 5: PORTFOLIO UI
          Gated on phase >= 4 (not 3) so NOTHING in here — including the
          plain uppercase labels, which have no wipe animation of their own
          — can mount before the expand has fully completed. Since the node
          doesn't exist until phase 4, startReveal={true} on mount is
          correct: conditional rendering is the reset mechanism here, not a
          boolean flip on an already-mounted node. */}
      {phase >= 4 && (
        <div
          style={{ opacity: uiOpacity, transition: "opacity 0.1s ease-out" }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          {/* Left: Name */}
          <div className="absolute md:top-1/2 top-[40%] left-2 md:left-12 lg:left-20 -translate-y-1/2 z-30">
            <p className="mb-3 flex items-center gap-2 text-[8px] md:text-sm uppercase tracking-[0.25em] text-neutral-400 font-medium">
              <span>👋</span>
              <span>HI, MY NAME IS</span>
            </p>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black italic uppercase leading-[0.9] ">
              <span className="block text-primary">
                <AnimatedText
                  text="HUSNAIN"
                  startReveal={true}
                  color="#00FF88" // your accent color
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
          <div className="absolute md:top-1/2  right-2 top-[40%] md:right-12 lg:right-20 -translate-y-1/2 z-30">
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
