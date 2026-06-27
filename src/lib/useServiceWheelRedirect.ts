"use client";
import { useEffect, useRef } from "react";

interface Options {
  isActive:     boolean;
  trackRef:     React.RefObject<HTMLDivElement | null>;
  // Called with +1 / -1 when at the end/start — hand scroll back to global
  onExitRight:  () => void;
  onExitLeft:   () => void;
}

export function useServiceWheelRedirect({
  isActive,
  trackRef,
  onExitRight,
  onExitLeft,
}: Options): void {
  const isAnimating = useRef(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isActive) return;

      const el = trackRef.current;
      if (!el) return;

      const cardWidth    = el.clientWidth;
      const currentIndex = Math.round(el.scrollLeft / cardWidth);
      const totalCards   = el.children.length;
      const atStart      = currentIndex === 0;
      const atEnd        = currentIndex === totalCards - 1;

      // Edge exits — release back to global virtual scroll
      if (atStart && e.deltaY < 0) { onExitLeft();  return; }
      if (atEnd   && e.deltaY > 0) { onExitRight(); return; }

      // Mid-track — fully consume the event
      e.preventDefault();
      e.stopImmediatePropagation();

      if (isAnimating.current) return;

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(totalCards - 1, currentIndex + direction));

      if (nextIndex === currentIndex) return;

      isAnimating.current = true;
      el.scrollTo({ left: nextIndex * cardWidth, behavior: "smooth" });

      setTimeout(() => { isAnimating.current = false; }, 700);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isActive, trackRef, onExitLeft, onExitRight]);
}