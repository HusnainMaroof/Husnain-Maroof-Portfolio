"use client";
import { useLocalProgress } from "@/src/lib/useLocalProgress";
import { useVirtualScroll } from "@/src/lib/useVirtualScroll";
import React from "react";
import { ProjectsSection } from "./ui/ProjectsSection";
export const RANGES = {
  hero: [0.0, 0.30] as [number, number],
  services: [0.33, 0.58] as [number, number],
  myStack: [0.61, 0.73] as [number, number],
  projects: [0.76, 0.91] as [number, number],
  footer: [0.95, 1.0] as [number, number],
};

export const ENTRY = {
  services: [0.30, 0.3] as [number, number],
  myStack: [0.58, 0.61] as [number, number],
  projects: [0.73, 0.76] as [number, number],
  footer: [0.91, 0.95] as [number, number],
};
const Work = () => {
  const { globalP, seekTo, scrollLocked, unlockScroll } = useVirtualScroll();
  const { localP: heroLocalP, motionLocalP: heroMotionP } = useLocalProgress(
    globalP,
    RANGES.hero,
  );
  const { localP: projectsLocalP } = useLocalProgress(globalP, RANGES.projects);

  return (
    <div>
      {" "}
      <ProjectsSection
        localP={projectsLocalP}
        globalP={globalP}
        range={RANGES.projects}
        seekTo={seekTo}
      />
    </div>
  );
};

export default Work;
