"use client";
import { useEffect, useRef, useCallback } from "react";

export interface VirtualScroll {
  globalP:      React.MutableRefObject<number>;
  seekTo:       (target: number, instant?: boolean) => void;
  scrollLocked: React.MutableRefObject<boolean>;
  unlockScroll: () => void;
}

// How much vP advances per 100px of wheel deltaY
const SPEED = 0.0008;

if (typeof window !== "undefined") {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
}

export function useVirtualScroll(): VirtualScroll {
  const globalP      = useRef(0);          // virtual progress 0→1
  const targetP      = useRef(0);          // where we're easing toward
  const scrollLocked = useRef(true);       // locked until hero fires onLoadComplete

  // Smoothly ease globalP → targetP each frame
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const diff = targetP.current - globalP.current;
      // Exponential ease: 8% of remaining distance per frame
      if (Math.abs(diff) > 0.0001) {
        globalP.current += diff * 0.08;
      } else {
        globalP.current = targetP.current;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seekTo = useCallback((target: number, instant = false) => {
    const clamped = Math.max(0, Math.min(1, target));
    targetP.current = clamped;
    if (instant) globalP.current = clamped;
  }, []);

  const unlockScroll = useCallback(() => {
    scrollLocked.current = false;
  }, []);

  return { globalP, seekTo, scrollLocked, unlockScroll };
}