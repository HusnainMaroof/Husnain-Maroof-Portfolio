"use client";
import React, { useEffect, useRef } from "react";
import { ProjectsSection } from "@/src/components/ui/ProjectsSection";
import { useVirtualScroll } from "@/src/lib/useVirtualScroll";
import { useLocalProgress } from "@/src/lib/useLocalProgress";
import { PROJECTS } from "@/src/data/Projects.data";

// On the /work page, ProjectsSection owns the entire scroll range 0→1.
// We don't need entry corridors or panel stacking — just drive globalP
// from 0 to 1 across the full projects range.
const PROJECTS_RANGE: [number, number] = [0, 1];

// How much globalP moves per wheel tick. Tune this to feel right.
// With PROJECTS.length items across 0→1, each "step" is 1/N.
// A speed of 0.0004 at deltaY ~100 = 0.04 per notch ≈ a quarter step on 4 projects.
const WHEEL_SPEED = 0.004;

export default function page() {
  const { globalP, seekTo, scrollLocked, unlockScroll } = useVirtualScroll();
  const { localP: projectsLocalP } = useLocalProgress(globalP, PROJECTS_RANGE);

  // ── Wheel ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    unlockScroll();
  }, [unlockScroll]);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLocked.current) return;
      const next = Math.max(
        0,
        Math.min(1, globalP.current + e.deltaY * WHEEL_SPEED),
      );
      seekTo(next);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [globalP, seekTo, scrollLocked]);

  // ── Touch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (scrollLocked.current) return;
      const dy = startY - e.touches[0].clientY; // positive = scroll down
      const next = Math.max(
        0,
        Math.min(1, globalP.current + dy * WHEEL_SPEED * 4),
      );
      seekTo(next);
      startY = e.touches[0].clientY;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [globalP, seekTo, scrollLocked]);

  // ── seekTo wrapper that maps project index → globalP ─────────────────────
  // ProjectsSection calls seekTo(globalP_value). On HomeScreen, globalP is
  // the full 0→1 space and the projects range is 0.76→0.91.
  // Here, globalP IS the projects range (0→1), so seekTo is a pass-through.
  // No translation needed — ProjectsSection's scrollToIndex math already
  // accounts for RANGES.projects via the `range` prop.
  // We pass PROJECTS_RANGE [0,1] as range so that seekTo targets are correct.

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505]">
      <ProjectsSection
        localP={projectsLocalP}
        globalP={globalP}
        range={PROJECTS_RANGE}
        seekTo={seekTo}
        immediateReveal={true}
      />
    </div>
  );
}
