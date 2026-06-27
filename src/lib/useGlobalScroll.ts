"use client";
import { useEffect, useRef, useCallback } from "react";

export interface GlobalScroll {
  globalP: React.MutableRefObject<number>;
  rawP: React.MutableRefObject<number>;
  seekTo: (progress: number) => void;
  scrollLocked: React.MutableRefObject<boolean>;
  unlockScroll: () => void;
}

const TRANSITION_ZONES: [number, number][] = [
  [0.14, 0.2],
  [0.42, 0.5],
  [0.65, 0.72],
  [0.88, 0.94],
];

const ZONE_RESISTANCE = 0.18;

// raw scroll (0→1) → visual progress (0→1)
// Zones are compressed; sections outside zones run at normal speed but offset
// downward by the accumulated "eaten" space from prior zones.
function rawToVisual(raw: number): number {
  let visual = raw;
  let eaten = 0; // total space eaten by zones we've fully passed

  for (const [start, end] of TRANSITION_ZONES) {
    const zoneLen = end - start;
    const compressed = zoneLen * ZONE_RESISTANCE;
    const bite = zoneLen - compressed; // how much this zone "eats"

    if (raw <= start - eaten) {
      // Haven't reached this zone yet (in raw space)
      break;
    }

    if (raw >= end - eaten) {
      // Fully past this zone — apply its full bite and continue
      eaten += bite;
    } else {
      // Inside this zone
      const into = raw - (start - eaten);
      visual = start - eaten + into * ZONE_RESISTANCE - eaten;
      // Simpler: map raw→visual accounting for all prior eaten
      visual = start - eaten + into * ZONE_RESISTANCE;
      return Math.min(1, Math.max(0, visual));
    }
  }

  return Math.min(1, Math.max(0, raw - eaten));
}

// visual progress (0→1) → raw scroll (0→1)  [inverse of rawToVisual]
// Needed so seekTo(visualP) scrolls to the right physical position.
function visualToRaw(visual: number): number {
  let eaten = 0;

  for (const [start, end] of TRANSITION_ZONES) {
    const zoneLen = end - start;
    const compressed = zoneLen * ZONE_RESISTANCE;
    const bite = zoneLen - compressed;

    const visualStart = start - eaten;
    const visualEnd = visualStart + compressed; // compressed zone end in visual space

    if (visual <= visualStart) break;

    if (visual >= visualEnd) {
      eaten += bite;
    } else {
      // Inside compressed zone
      const intoVisual = visual - visualStart;
      const intoRaw = intoVisual / ZONE_RESISTANCE;
      return Math.min(1, Math.max(0, start + intoRaw - eaten));
    }
  }

  return Math.min(1, Math.max(0, visual + eaten));
}

export function useGlobalScroll(
  _containerRef: React.RefObject<HTMLDivElement | null>,
): GlobalScroll {
  const rawP = useRef(0);
  const globalP = useRef(0);
  const scrollLocked = useRef(true);

  const getMaxScroll = useCallback(() => {
    return Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // seekTo accepts a VISUAL progress value (matches your RANGES/ENTRY constants)
  const seekTo = useCallback(
    (visualTarget: number) => {
      if (scrollLocked.current) return;
      const raw = visualToRaw(Math.max(0, Math.min(1, visualTarget)));
      window.scrollTo({
        top: raw * getMaxScroll(),
        behavior: "smooth",
      });
    },
    [getMaxScroll],
  );

  useEffect(() => {
    const onScroll = () => {
      if (scrollLocked.current) {
        if (window.scrollY > 0) window.scrollTo(0, 0);
        rawP.current = 0;
        globalP.current = 0;
        return;
      }
      rawP.current = Math.min(1, Math.max(0, window.scrollY / getMaxScroll()));
      globalP.current = rawToVisual(rawP.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [getMaxScroll]);

  const unlockScroll = useCallback(() => {
    if (!scrollLocked.current) return;
    scrollLocked.current = false;
    document.body.style.overflow = "";
    rawP.current = Math.min(1, Math.max(0, window.scrollY / getMaxScroll()));
    globalP.current = rawToVisual(rawP.current);
  }, [getMaxScroll]);

  return { globalP, rawP, seekTo, scrollLocked, unlockScroll };
}
