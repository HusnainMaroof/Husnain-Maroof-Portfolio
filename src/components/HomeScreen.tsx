// HomeScreen.tsx
"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Navbar } from "./ui/NavBar";
import { HeroSection } from "./ui/MainHeroSection";
import { MyServices } from "./ui/Myservices";
import { ProjectsSection } from "./ui/ProjectsSection";
import { Footer } from "./ui/Footer";
import { useGlobalScroll } from "../lib/useGlobalScroll";
import { useLocalProgress } from "../lib/useLocalProgress";

// ─── Timeline ranges (global progress 0 → 1) ─────────────────────────────────
const RANGES = {
  hero: [0.0, 0.3] as [number, number],
  services: [0.3, 0.62] as [number, number],
  projects: [0.62, 0.88] as [number, number],
  footer: [0.88, 1.0] as [number, number],
};

const TOTAL_VH = 600;

// ─── Entry ranges (where each section slides up) ─────────────────────────────
const ENTRY = {
  services: [0.27, 0.34] as [number, number],
  projects: [0.59, 0.65] as [number, number],
  footer: [0.86, 0.91] as [number, number],
};

export default function HomeScreen() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { globalP, seekTo, scrollLocked, unlockScroll } =
    useGlobalScroll(scrollContainerRef);
  const heroReady = useRef(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // ── Raw entry progress (0 = hidden below, 1 = fully covering) ────────────
  const servicesEntryRaw = useMotionValue(0);
  const projectsEntryRaw = useMotionValue(0);
  const footerEntryRaw = useMotionValue(0);

  // ── Spring-smooth entry progress (weighty, organic feel) ─────────────────
  const servicesEntry = useSpring(servicesEntryRaw, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.001,
  });
  const projectsEntry = useSpring(projectsEntryRaw, {
    stiffness: 65,
    damping: 22,
    restDelta: 0.001,
  });
  const footerEntry = useSpring(footerEntryRaw, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.001,
  });

  // ── Stack translateY: slides up from 100% to 0% ────────────────────────────
  const servicesY = useTransform(servicesEntry, [0, 1], ["100%", "0%"]);
  const projectsY = useTransform(projectsEntry, [0, 1], ["100%", "0%"]);
  const footerY = useTransform(footerEntry, [0, 1], ["100%", "0%"]);

  // ── Hero push-back (recedes as services enters) ──────────────────────────
  const heroScale = useTransform(servicesEntry, [0, 1], [1, 0.92]);
  const heroY = useTransform(servicesEntry, [0, 1], ["0%", "-3%"]);
  const heroFilter = useTransform(
    servicesEntry,
    [0, 1],
    ["brightness(1) saturate(1)", "brightness(0.55) saturate(0.8)"],
  );

  // ── Section shadows (grow as they rise, creating depth) ──────────────────
  const servicesShadow = useTransform(
    servicesEntry,
    [0, 0.4, 1],
    [
      "0 -10px 40px rgba(0,0,0,0)",
      "0 -25px 70px rgba(0,0,0,0.5)",
      "0 -40px 100px rgba(0,0,0,0.7)",
    ],
  );
  const projectsShadow = useTransform(
    projectsEntry,
    [0, 0.4, 1],
    [
      "0 -10px 40px rgba(0,0,0,0)",
      "0 -25px 70px rgba(0,0,0,0.5)",
      "0 -40px 100px rgba(0,0,0,0.7)",
    ],
  );
  const footerShadow = useTransform(
    footerEntry,
    [0, 0.4, 1],
    [
      "0 -10px 40px rgba(0,0,0,0)",
      "0 -25px 70px rgba(0,0,0,0.5)",
      "0 -40px 100px rgba(0,0,0,0.7)",
    ],
  );

  // ── Border radius (card-like when entering, flat when settled) ───────────
  const servicesRadius = useTransform(
    servicesEntry,
    [0, 1],
    ["1.5rem", "0rem"],
  );
  const projectsRadius = useTransform(
    projectsEntry,
    [0, 1],
    ["1.5rem", "0rem"],
  );
  const footerRadius = useTransform(footerEntry, [0, 1], ["1.5rem", "0rem"]);

  // ── Hero opacity (scroll-driven fade after load animation) ───────────────
  const heroOpacity = useMotionValue(1);

  // ── Hero local progress ───────────────────────────────────────────────────
  const { localP: heroLocalP, motionLocalP: heroMotionP } = useLocalProgress(
    globalP,
    RANGES.hero,
  );
  const heroUiOpacity = useTransform(heroMotionP, [0, 0.15], [1, 0]);

  // ── Services local progress ───────────────────────────────────────────────
  const { motionLocalP: servicesMotionP } = useLocalProgress(
    globalP,
    RANGES.services,
  );
  const smoothServicesP = useSpring(servicesMotionP, {
    stiffness: 50,
    damping: 25,
    restDelta: 0.001,
  });

  // ── Projects local progress ───────────────────────────────────────────────
  const { localP: projectsLocalP } = useLocalProgress(globalP, RANGES.projects);

  // ── Unlock scroll once hero load animation finishes ─────────────────────
  const onHeroLoadComplete = useCallback(() => {
    if (heroReady.current) return;
    heroReady.current = true;
    setHeroLoaded(true);
    unlockScroll();
  }, [unlockScroll]);

  // ── RAF: drive entry progress + hero opacity ──────────────────────────────
  useEffect(() => {
    let raf: number;

    function entryProgress(p: number, [start, end]: [number, number]): number {
      if (p <= start) return 0;
      if (p >= end) return 1;
      return (p - start) / (end - start);
    }

    const tick = () => {
      const p = globalP.current;

      // Hero opacity: fully visible during load, then fade 0.25→0.32
      if (heroReady.current) {
        heroOpacity.set(p <= 0.25 ? 1 : p <= 0.32 ? 1 - (p - 0.25) / 0.07 : 0);
      } else {
        heroOpacity.set(1);
      }

      // Section entry progress
      servicesEntryRaw.set(entryProgress(p, ENTRY.services));
      projectsEntryRaw.set(entryProgress(p, ENTRY.projects));
      footerEntryRaw.set(entryProgress(p, ENTRY.footer));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    globalP,
    heroOpacity,
    servicesEntryRaw,
    projectsEntryRaw,
    footerEntryRaw,
  ]);

  return (
    <>
      {/* ── Artificial scroll height ── */}
      <div
        ref={scrollContainerRef}
        style={{ height: `${TOTAL_VH}vh` }}
        className="relative"
        aria-hidden="true"
      />

      {/* ── Extra breathing room at the bottom ── */}
      <div style={{ height: "50vh" }} className="relative" aria-hidden="true" />

      {/* ── Fixed viewport ── */}
      <div className="fixed inset-0 overflow-hidden">
        <Navbar isVisible={true} />

        {/* Hero — base layer with depth push-back */}
        <motion.div
          style={{
            opacity: heroOpacity,
            scale: heroScale,
            y: heroY,
            filter: heroFilter,
          }}
          className="absolute inset-0 z-10 overflow-hidden"
        >
          <HeroSection
            localP={heroLocalP}
            uiOpacityMV={heroUiOpacity}
            onLoadComplete={onHeroLoadComplete}
          />
        </motion.div>

        {/* Services — slides up like a card, casts shadow, radius flattens */}
        <motion.div
          style={{
            y: servicesY,
            boxShadow: servicesShadow,
            borderRadius: servicesRadius,
          }}
          className="absolute inset-0 z-20 overflow-hidden"
        >
          <MyServices progress={smoothServicesP} />
        </motion.div>

        {/* Projects — slides up over services */}
        <motion.div
          style={{
            y: projectsY,
            boxShadow: projectsShadow,
            borderRadius: projectsRadius,
          }}
          className="absolute inset-0 z-30 overflow-hidden"
        >
          <ProjectsSection
            localP={projectsLocalP}
            globalP={globalP}
            range={RANGES.projects}
            seekTo={seekTo}
          />
        </motion.div>

        {/* Footer — slides up over projects, stays, no fade-out */}
        <motion.div
          style={{
            y: footerY,
            boxShadow: footerShadow,
            borderRadius: footerRadius,
          }}
          className="absolute inset-0 z-40 overflow-hidden"
        >
          <Footer />
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      {heroLoaded && !scrollLocked.current && (
        <ScrollIndicator globalP={globalP} />
      )}

      {/* ── Progress bar ── */}
      <ProgressBar globalP={globalP} />
    </>
  );
}

// ─── Scroll Indicator ───────────────────────────────────────────────────────
function ScrollIndicator({
  globalP,
}: {
  globalP: React.MutableRefObject<number>;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const p = globalP.current;
      const atBottom = p > 0.95;
      if (textRef.current)
        textRef.current.textContent = atBottom ? "Scroll Up" : "Scroll Down";
      if (arrowRef.current)
        arrowRef.current.textContent = atBottom ? "↑" : "↓";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [globalP]);

  const handleClick = () => {
    const p = globalP.current;
    if (p > 0.95) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="fixed bottom-8 right-6 z-50 flex flex-col items-center gap-1 cursor-pointer select-none group"
      onClick={handleClick}
    >
      <span
        ref={textRef}
        className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF88]/70 group-hover:text-[#00FF88] transition-colors duration-300"
      >
        Scroll Down
      </span>
      <span
        ref={arrowRef}
        className="text-[#00FF88]/70 group-hover:text-[#00FF88] transition-colors duration-300 animate-bounce text-sm"
      >
        ↓
      </span>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ globalP }: { globalP: React.MutableRefObject<number> }) {
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const p = globalP.current;
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (textRef.current)
        textRef.current.textContent = `${Math.round(p * 100)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [globalP]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full h-0.5 bg-white/5 relative overflow-hidden">
        <div
          ref={barRef}
          className="absolute top-0 left-0 h-full bg-[#00FF88] transition-none"
          style={{ width: "0%" }}
        />
      </div>
      <div
        ref={textRef}
        className="absolute bottom-4 right-6 text-[9px] font-mono uppercase tracking-widest text-[#00FF88]"
      >
        0%
      </div>
    </div>
  );
}