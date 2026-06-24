"use client";
import { useEffect, useRef, useCallback } from "react";

export interface GlobalScroll {
  globalP: React.MutableRefObject<number>;
  seekTo: (progress: number) => void;
  scrollLocked: React.MutableRefObject<boolean>;
  unlockScroll: () => void;
}

export function useGlobalScroll(
  _containerRef: React.RefObject<HTMLDivElement | null>
): GlobalScroll {
  const globalP = useRef(0);
  const scrollLocked = useRef(true);

  const getMaxScroll = useCallback(() => {
    return Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }, []);

  // Lock body scroll on mount while hero plays its load animation
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (scrollLocked.current) {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
        globalP.current = 0;
        return;
      }
      globalP.current = Math.min(
        1,
        Math.max(0, window.scrollY / getMaxScroll())
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [getMaxScroll]);

  const unlockScroll = useCallback(() => {
    if (!scrollLocked.current) return;
    scrollLocked.current = false;
    document.body.style.overflow = "";
    globalP.current = Math.min(
      1,
      Math.max(0, window.scrollY / getMaxScroll())
    );
  }, [getMaxScroll]);

  const seekTo = useCallback(
    (p: number) => {
      if (scrollLocked.current) return;
      window.scrollTo({
        top: Math.max(0, Math.min(1, p)) * getMaxScroll(),
        behavior: "smooth",
      });
    },
    [getMaxScroll]
  );

  return { globalP, seekTo, scrollLocked, unlockScroll };
}