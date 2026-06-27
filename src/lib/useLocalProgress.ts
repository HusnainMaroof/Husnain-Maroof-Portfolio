"use client";
import { useEffect, useRef } from "react";
import { useMotionValue, MotionValue } from "framer-motion";

export interface LocalProgress {
  localP:       React.MutableRefObject<number>;
  motionLocalP: MotionValue<number>;
}

export function useLocalProgress(
  globalP: React.MutableRefObject<number>,
  range:   [number, number]
): LocalProgress {
  const [start, end] = range;
  const localP       = useRef(0);
  const motionLocalP = useMotionValue(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const clamped = Math.min(1, Math.max(0, (globalP.current - start) / (end - start)));
      localP.current = clamped;
      motionLocalP.set(clamped);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [globalP, start, end, motionLocalP]);

  return { localP, motionLocalP };
}