"use client";
import { useEffect, useRef } from "react";

interface UseServiceWheelRedirectOptions {
  isActive: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onExitRight: () => void;
  onExitLeft: () => void;
}

export function useServiceWheelRedirect({
  isActive,
  trackRef,
  onExitRight,
  onExitLeft,
}: UseServiceWheelRedirectOptions): void {
  // Accumulate wheel delta between snaps to avoid hair-trigger advances
  const accumulated = useRef(0);
  // Debounce ref — we only act after the user pauses briefly
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard: prevent firing multiple snaps from one gesture
  const isAnimating = useRef(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isActive) return;

      const el = trackRef.current;
      if (!el) return;

      const cardWidth = el.clientWidth;
      const currentIndex = Math.round(el.scrollLeft / cardWidth);
      const totalCards = el.children.length;

      const atStart = currentIndex === 0;
      const atEnd = currentIndex === totalCards - 1;

      // At edges — let global scroll handle section transition
      if (atStart && e.deltaY < 0) {
        onExitLeft();
        return;
      }
      if (atEnd && e.deltaY > 0) {
        onExitRight();
        return;
      }

      // Consume this event — stop page from scrolling
      e.preventDefault();
      e.stopImmediatePropagation();

      if (isAnimating.current) return;

      // Accumulate delta
      accumulated.current += e.deltaY;

      // Clear previous debounce
      if (debounce.current) clearTimeout(debounce.current);

      // After user pauses 80ms, decide whether to advance
      debounce.current = setTimeout(() => {
        if (isAnimating.current) return;

        const threshold = 60; // minimum delta to trigger a card advance

        if (Math.abs(accumulated.current) < threshold) {
          // Not enough — snap back to current card
          el.scrollTo({ left: currentIndex * cardWidth, behavior: "smooth" });
          accumulated.current = 0;
          return;
        }

        const direction = accumulated.current > 0 ? 1 : -1;
        const nextIndex = Math.max(
          0,
          Math.min(totalCards - 1, currentIndex + direction),
        );

        accumulated.current = 0;
        isAnimating.current = true;

        el.scrollTo({ left: nextIndex * cardWidth, behavior: "smooth" });

        // Release lock after smooth scroll completes (~600ms)
        setTimeout(() => {
          isAnimating.current = false;
        }, 650);
      }, 80);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [isActive, trackRef, onExitLeft, onExitRight]);
}