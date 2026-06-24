"use client";
/**
 * AboutMe.tsx
 *
 * Top-level orchestrator. Three phases:
 *   0 → PhaseLoader (counter 0→100)
 *   1 → AboutHero   (hold → explode → reshape → scroll content)
 *   2 → NextSection (scroll up reverses back to fresh AboutHero)
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import PhaseLoader from "../Loader";
import AboutHero from "./AboutHero";

function NextSection({ onReverse }: { onReverse: () => void }) {
  const dead = useRef(false);

  useEffect(() => {
    dead.current = false;
    const onWheel = (e: WheelEvent) => {
      if (dead.current) return;
      if (e.deltaY < 0) {
        e.preventDefault();
        onReverse();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      dead.current = true;
      window.removeEventListener("wheel", onWheel);
    };
  }, [onReverse]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#050505]">
      <p className="text-[10px] tracking-[0.4em] uppercase text-white/[0.18] font-mono">
        — next section —
      </p>
    </div>
  );
}

export default function AboutMe() {
  const [phase, setPhase] = useState(0);
  const [counter, setCounter] = useState(0);
  const [heroKey, setHeroKey] = useState(0);
  const transitioning = useRef(false);

  const go = useCallback((next: number) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setPhase(next);
    setTimeout(() => {
      transitioning.current = false;
    }, 400);
  }, []);

  useEffect(() => {
    if (phase !== 0) return;
    if (counter >= 100) {
      const t = setTimeout(() => go(1), 300);
      return () => clearTimeout(t);
    }
    const inc = counter > 80 ? 1 : counter > 50 ? 2 : 3;
    const t = setTimeout(() => setCounter((c) => Math.min(100, c + inc)), 20);
    return () => clearTimeout(t);
  }, [phase, counter, go]);

  const handleHeroComplete = useCallback(() => go(2), [go]);
  const handleNextSectionBack = useCallback(() => {
    setHeroKey((k) => k + 1);
    go(1);
  }, [go]);

  return (
    <div className="w-full bg-[#050505]">
      <PhaseLoader counter={counter} visible={phase === 0} />

      {phase === 1 && (
        <AboutHero key={heroKey} onComplete={handleHeroComplete} />
      )}

      {phase === 2 && <NextSection onReverse={handleNextSectionBack} />}
    </div>
  );
}
