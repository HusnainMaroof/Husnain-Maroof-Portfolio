"use client";
import React, { useState, useEffect, useRef } from "react";
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
    if (phase === 0) {
      let current = 1; // Start the count at 1
      const interval = setInterval(() => {
        current += 1; // Increment directly by 1

        if (current >= 100) {
          current = 100;
          clearInterval(interval);
          setCount(current);
          // Transition to the next phase of your UI sequence
          setTimeout(() => setPhase(1), 300);
        } else {
          setCount(current);
        }
      }, 15); // Runs every 15ms

      return () => clearInterval(interval);
    }
  }, [phase]);

  // 2. Cinematic Sequence Timings
  useEffect(() => {
    if (phase === 1) setTimeout(() => setPhase(2), 600);
    else if (phase === 2) setTimeout(() => setPhase(3), 1200);
    else if (phase === 3) setTimeout(() => setPhase(4), 1000);
    else if (phase === 4) setTimeout(() => setPhase(5), 800);
    else if (phase === 5) setTimeout(() => onComplete(), 1000);
  }, [phase, onComplete]);

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
            className="relative flex items-center justify-center overflow-hidden bg-gray-900 "
            initial={{ width: "0px", height: "0px", opacity: 0 }}
            animate={{
              width: phase >= 3 ? "100vw" : "280px",
              height: phase >= 3 ? "100vh" : "400px",
              opacity: 1,
            }}
            transition={{
              opacity: { duration: 0.4 },
              width: { duration: 1.0, ease: cinematicEase },
              height: { duration: 1.0, ease: cinematicEase },
              borderRadius: { duration: 1.0, ease: cinematicEase },
            }}
          >
            <InteractiveAsciiPortrait
              image="/images/main_hero_image1.png"
              resolution={4}
              fontSize={8}
              hoverRadius={120}
              scrollRef={scrollRef} // <--- Connected to Scroll Explosion!
            />
          </motion.div>
        )}
      </div>

      {/* PHASE 4 & 5: PORTFOLIO UI */}
      {phase >= 3 && (
        <div
          style={{ opacity: uiOpacity, transition: "opacity 0.1s ease-out" }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          {/* Left: Name */}
          <div className="absolute md:top-1/2 top-[15%] left-2 md:left-12 lg:left-20 -translate-y-1/2 z-30">
            <p className="mb-3 flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.25em] text-neutral-400 font-medium">
              <span>👋</span>
              <span>HI, MY NAME IS</span>
            </p>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black italic uppercase leading-[0.9] ">
              <span className="block text-primary">
                <AnimatedText
                  text="HUSNAIN"
                  startReveal={phase >= 4}
                  color="#00FF88" // your accent color
                />
              </span>

              <span className="block">
                <AnimatedText
                  text="MAROOF"
                  startReveal={phase >= 4}
                  delayOffset={0.2}
                  color="#FFFFFF"
                />
              </span>
            </h2>
          </div>

          {/* Right: Title */}
          <div className="absolute md:top-1/2  right-2 top-[15%] md:right-12 lg:right-20 -translate-y-1/2 z-30">
            <p className="mb-3 text-xs md:text-sm uppercase tracking-[0.25em] text-neutral-400 font-medium text-left">
              I AM A
            </p>

            <h2 className="text-xl md:text-5xl lg:text-6xl font-display font-black italic uppercase leading-[0.9] text-right">
              <span className="block text-primary">
                <AnimatedText
                  text="FULL STACK"
                  startReveal={phase >= 4}
                  delayOffset={0.4}
                  color="#00FF88"
                />
              </span>

              <span className="block">
                <AnimatedText
                  text="DEVELOPER"
                  startReveal={phase >= 4}
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
