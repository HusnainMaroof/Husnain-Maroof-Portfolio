"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Navbar } from "./ui/NavBar";
import { HeroSection } from "./ui/MainHeroSection";
import { MyServices } from "./ui/Myservices";
import { ProjectsSection } from "./ui/ProjectsSection";
import { Footer } from "./ui/Footer";
import { useGlobalScroll } from "../lib/useGlobalScroll";
import { useLocalProgress } from "../lib/useLocalProgress";
import MyStack from "./ui/MyStack";

// ─── More total scroll height to accommodate the new section ──────────────────
const TOTAL_VH = 1400;

const RANGES = {
  hero:     [0.0,  0.14] as [number, number],
  services: [0.20, 0.42] as [number, number],
  myStack:  [0.50, 0.65] as [number, number],
  projects: [0.72, 0.85] as [number, number],
  footer:   [0.94, 1.0 ] as [number, number],
};

export const ENTRY = {
  services: [0.14, 0.20] as [number, number],
  myStack:  [0.42, 0.50] as [number, number],
  projects: [0.65, 0.72] as [number, number],
  footer:   [0.88, 0.94] as [number, number],
};

// snap zones = the ENTRY gaps (dead zones between sections)
// useGlobalScroll already reads SECTION_SNAPS — you'll need to update that
// array in useGlobalScroll.ts too (see note below)

export default function HomeScreen() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
const { globalP, rawP, seekTo, scrollLocked, unlockScroll } =
  useGlobalScroll(scrollContainerRef);
  const heroReady = useRef(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // ── Active states ─────────────────────────────────────────────────────────
  const [servicesActive, setServicesActive] = useState(false);
  const servicesActiveRef = useRef(false);

  // ── Raw entry MotionValues ────────────────────────────────────────────────
  const servicesEntryRaw  = useMotionValue(0);
  const myStackEntryRaw   = useMotionValue(0);
  const projectsEntryRaw  = useMotionValue(0);
  const footerEntryRaw    = useMotionValue(0);

  // ── Springs ───────────────────────────────────────────────────────────────
  const servicesEntry = useSpring(servicesEntryRaw,  { stiffness: 55, damping: 18, restDelta: 0.001 });
  const myStackEntry  = useSpring(myStackEntryRaw,   { stiffness: 55, damping: 18, restDelta: 0.001 });
  const projectsEntry = useSpring(projectsEntryRaw,  { stiffness: 65, damping: 22, restDelta: 0.001 });
  const footerEntry   = useSpring(footerEntryRaw,    { stiffness: 50, damping: 15, restDelta: 0.001 });

  // ── Y transforms ──────────────────────────────────────────────────────────
  const servicesY = useTransform(servicesEntry, [0, 1], ["100%", "0%"]);
  const myStackY  = useTransform(myStackEntry,  [0, 1], ["100%", "0%"]);
  const projectsY = useTransform(projectsEntry, [0, 1], ["100%", "0%"]);
  const footerY   = useTransform(footerEntry,   [0, 1], ["100%", "0%"]);

  // ── Hero push-back (driven by services entry, same as before) ─────────────
  const heroScale  = useTransform(servicesEntry, [0, 1], [1, 0.92]);
  const heroY      = useTransform(servicesEntry, [0, 1], ["0%", "-3%"]);
  const heroFilter = useTransform(
    servicesEntry,
    [0, 1],
    ["brightness(1) saturate(1)", "brightness(0.55) saturate(0.8)"]
  );

  // ── Services push-back (driven by myStack entry) ───────────────────────── 
  const servicesScale  = useTransform(myStackEntry, [0, 1], [1, 0.92]);
  const servicesPushY  = useTransform(myStackEntry, [0, 1], ["0%", "-3%"]);
  const servicesFilter = useTransform(
    myStackEntry,
    [0, 1],
    ["brightness(1) saturate(1)", "brightness(0.55) saturate(0.8)"]
  );

  // ── Shadows ───────────────────────────────────────────────────────────────
  const makeShadow = (mv: ReturnType<typeof useSpring>) =>
    useTransform(mv, [0, 0.4, 1], [
      "0 -10px 40px rgba(0,0,0,0)",
      "0 -25px 70px rgba(0,0,0,0.5)",
      "0 -40px 100px rgba(0,0,0,0.7)",
    ]);

  const servicesShadow = makeShadow(servicesEntry);
  const myStackShadow  = makeShadow(myStackEntry);
  const projectsShadow = makeShadow(projectsEntry);
  const footerShadow   = makeShadow(footerEntry);

  // ── Border radii ──────────────────────────────────────────────────────────
  const makeRadius = (mv: ReturnType<typeof useSpring>) =>
    useTransform(mv, [0, 1], ["1.5rem", "0rem"]);

  const servicesRadius = makeRadius(servicesEntry);
  const myStackRadius  = makeRadius(myStackEntry);
  const projectsRadius = makeRadius(projectsEntry);
  const footerRadius   = makeRadius(footerEntry);

  // ── Hero opacity ──────────────────────────────────────────────────────────
  const heroOpacity = useMotionValue(1);

  // ── Local progress slices ─────────────────────────────────────────────────
  const { localP: heroLocalP, motionLocalP: heroMotionP } = useLocalProgress(globalP, RANGES.hero);
  const heroUiOpacity = useTransform(heroMotionP, [0, 0.15], [1, 0]);

  const { localP: projectsLocalP } = useLocalProgress(globalP, RANGES.projects);

  // ── Hero load callback ────────────────────────────────────────────────────
  const onHeroLoadComplete = useCallback(() => {
    if (heroReady.current) return;
    heroReady.current = true;
    setHeroLoaded(true);
    unlockScroll();
  }, [unlockScroll]);

  // ── Master RAF loop ───────────────────────────────────────────────────────
  useEffect(() => {
    let raf: number;

    function entryProgress(p: number, [start, end]: [number, number]): number {
      if (p <= start) return 0;
      if (p >= end)   return 1;
      return (p - start) / (end - start);
    }

    const tick = () => {
      const p = globalP.current;

      // Hero opacity: hold at 1 until p=0.10, fade out by p=0.14
      if (heroReady.current) {
        heroOpacity.set(
          p <= 0.10 ? 1
          : p <= 0.14 ? 1 - (p - 0.10) / 0.04
          : 0
        );
      } else {
        heroOpacity.set(1);
      }

      // Entry raws
      servicesEntryRaw.set(entryProgress(p, ENTRY.services));
      myStackEntryRaw.set(entryProgress(p, ENTRY.myStack));
      projectsEntryRaw.set(entryProgress(p, ENTRY.projects));
      footerEntryRaw.set(entryProgress(p, ENTRY.footer));

      // Services active window: services RANGE start → myStack ENTRY start
      const nowActive = p >= 0.20 && p <= 0.42;
      if (nowActive !== servicesActiveRef.current) {
        servicesActiveRef.current = nowActive;
        setServicesActive(nowActive);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    globalP,
    heroOpacity,
    servicesEntryRaw,
    myStackEntryRaw,
    projectsEntryRaw,
    footerEntryRaw,
  ]);

  return (
    <>
      <div
        ref={scrollContainerRef}
        style={{ height: `${TOTAL_VH}vh` }}
        className="relative"
        aria-hidden="true"
      />
      <div style={{ height: "50vh" }} className="relative" aria-hidden="true" />

      <div className="fixed inset-0 overflow-hidden">
        <Navbar isVisible={true} />

        {/* ── Hero — z-10 ─────────────────────────────────────────────── */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY, filter: heroFilter }}
          className="absolute inset-0 z-10 overflow-hidden"
        >
          <HeroSection
            localP={heroLocalP}
            uiOpacityMV={heroUiOpacity}
            onLoadComplete={onHeroLoadComplete}
          />
        </motion.div>

        {/* ── Services — z-20, pushes back when MyStack arrives ────────── */}
        <motion.div
          style={{
            y: servicesY,
            scale: servicesScale,
            translateY: servicesPushY,
            filter: servicesFilter,
            boxShadow: servicesShadow,
            borderRadius: servicesRadius,
          }}
          className="absolute inset-0 z-20 overflow-hidden"
        >
          <MyServices isActive={servicesActive} seekTo={seekTo} />
        </motion.div>

        {/* ── MyStack — z-25 ───────────────────────────────────────────── */}
        <motion.div
          style={{
            y: myStackY,
            boxShadow: myStackShadow,
            borderRadius: myStackRadius,
          }}
          className="absolute inset-0 z-25 overflow-hidden"
        >
          <MyStack />
        </motion.div>

        {/* ── Projects — z-30 ──────────────────────────────────────────── */}
        <motion.div
          style={{ y: projectsY, boxShadow: projectsShadow, borderRadius: projectsRadius }}
          className="absolute inset-0 z-30 overflow-hidden"
        >
          <ProjectsSection
            localP={projectsLocalP}
            globalP={globalP}
            range={RANGES.projects}
            seekTo={seekTo}
          />
        </motion.div>

        {/* ── Footer — z-40 ────────────────────────────────────────────── */}
        <motion.div
          style={{ y: footerY, boxShadow: footerShadow, borderRadius: footerRadius }}
          className="absolute inset-0 z-40 overflow-hidden"
        >
          <Footer />
        </motion.div>
      </div>

    {heroLoaded && !scrollLocked.current && (
  <ScrollIndicator globalP={globalP} rawP={rawP} />
)}
      <ProgressBar globalP={globalP} />
    </>
  );
}

// ─── Scroll Indicator ─────────────────────────────────────────────────────────
function ScrollIndicator({
  globalP,
  rawP,
}: {
  globalP: React.MutableRefObject<number>;
  rawP: React.MutableRefObject<number>;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      // Use rawP for "at bottom" — physical scroll position
      const atBottom = rawP.current > 0.97;
      if (textRef.current)  textRef.current.textContent  = atBottom ? "Scroll Up"   : "Scroll Down";
      if (arrowRef.current) arrowRef.current.textContent = atBottom ? "↑" : "↓";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rawP]);

  const handleClick = () => {
    if (rawP.current > 0.97) window.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <div
      className="fixed bottom-8 right-6 z-50 flex flex-col items-center gap-1 cursor-pointer select-none group"
      onClick={handleClick}
    >
      <span ref={textRef} className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FF88]/70 group-hover:text-[#00FF88] transition-colors duration-300">
        Scroll Down
      </span>
      <span ref={arrowRef} className="text-[#00FF88]/70 group-hover:text-[#00FF88] transition-colors duration-300 animate-bounce text-sm">
        ↓
      </span>
    </div>
  );
}

function ProgressBar({ globalP }: { globalP: React.MutableRefObject<number> }) {
  const barRef  = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      // globalP is already the visual progress — matches RANGES/ENTRY exactly
      const p = globalP.current;
      if (barRef.current)  barRef.current.style.width  = `${p * 100}%`;
      if (textRef.current) textRef.current.textContent = `${Math.round(p * 100)}%`;
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