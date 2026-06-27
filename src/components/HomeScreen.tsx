"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Navbar } from "./ui/NavBar";
import { HeroSection } from "./ui/MainHeroSection";
import { MyServices } from "./ui/Myservices";
import { ProjectsSection } from "./ui/ProjectsSection";
import { Footer } from "./ui/Footer";
import { useVirtualScroll } from "../lib/useVirtualScroll";
import { useLocalProgress } from "../lib/useLocalProgress";
import MyStack from "./ui/MyStack";

export const RANGES = {
  hero: [0.0, 0.12] as [number, number],
  services: [0.2, 0.45] as [number, number],
  myStack: [0.5, 0.6] as [number, number],
  projects: [0.7, 0.88] as [number, number],
  footer: [0.95, 1.0] as [number, number],
};

export const ENTRY = {
  services: [0.12, 0.2] as [number, number],
  myStack: [0.45, 0.5] as [number, number],
  projects: [0.6, 0.65] as [number, number],
  footer: [0.88, 0.95] as [number, number],
};

const WHEEL_SPEED = 0.0002;

// Threshold at which we consider the panel "fully in" — spring settles to 1.0
// but we fire at 0.92 so the stagger starts just as the panel lands, not after.
const MYSTACK_FULLY_IN_THRESHOLD = 0.92;

export default function HomeScreen() {
  const { globalP, seekTo, scrollLocked, unlockScroll } = useVirtualScroll();

  const heroReady = useRef(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const servicesTrackRef = useRef<HTMLDivElement>(null);

  const [servicesActive, setServicesActive] = useState(false);
  const servicesActiveRef = useRef(false);

  // myStackFullyVisible: true only once the slide-up spring crosses the threshold.
  // Passed to MyStack so it triggers GSAP at the right moment.
  const [myStackFullyVisible, setMyStackFullyVisible] = useState(false);
  const myStackFullyVisibleRef = useRef(false);

  const servicesEntryRaw = useMotionValue(0);
  const myStackEntryRaw = useMotionValue(0);
  const projectsEntryRaw = useMotionValue(0);
  const footerEntryRaw = useMotionValue(0);

  const servicesEntry = useSpring(servicesEntryRaw, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });
  const myStackEntry = useSpring(myStackEntryRaw, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  });
  const projectsEntry = useSpring(projectsEntryRaw, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });
  const footerEntry = useSpring(footerEntryRaw, {
    stiffness: 55,
    damping: 18,
    restDelta: 0.001,
  });

  const servicesY = useTransform(servicesEntry, [0, 1], ["100%", "0%"]);
  const myStackY = useTransform(myStackEntry, [0, 1], ["100%", "0%"]);
  const projectsY = useTransform(projectsEntry, [0, 1], ["100%", "0%"]);
  const footerY = useTransform(footerEntry, [0, 1], ["100%", "0%"]);

  const heroScale = useTransform(servicesEntry, [0, 1], [1, 0.92]);
  const heroPushY = useTransform(servicesEntry, [0, 1], ["0%", "-3%"]);
  const heroFilter = useTransform(
    servicesEntry,
    [0, 1],
    ["brightness(1) saturate(1)", "brightness(0.5) saturate(0.7)"],
  );

  const servicesScale = useTransform(myStackEntry, [0, 1], [1, 0.92]);
  const servicesPushY = useTransform(myStackEntry, [0, 1], ["0%", "-3%"]);
  const servicesFilter = useTransform(
    myStackEntry,
    [0, 1],
    ["brightness(1) saturate(1)", "brightness(0.5) saturate(0.7)"],
  );

  const myStackScale = useTransform(projectsEntry, [0, 1], [1, 0.92]);
  const myStackPushY = useTransform(projectsEntry, [0, 1], ["0%", "-3%"]);
  const myStackFilter = useTransform(
    projectsEntry,
    [0, 1],
    ["brightness(1) saturate(1)", "brightness(0.5) saturate(0.7)"],
  );

  const makeShadow = (mv: ReturnType<typeof useSpring>) =>
    useTransform(
      mv,
      [0, 0.5, 1],
      [
        "0 -8px 30px rgba(0,0,0,0)",
        "0 -20px 60px rgba(0,0,0,0.5)",
        "0 -35px 90px rgba(0,0,0,0.7)",
      ],
    );
  const makeRadius = (mv: ReturnType<typeof useSpring>) =>
    useTransform(mv, [0, 1], ["1.5rem", "0rem"]);

  const servicesShadow = makeShadow(servicesEntry);
  const myStackShadow = makeShadow(myStackEntry);
  const projectsShadow = makeShadow(projectsEntry);
  const footerShadow = makeShadow(footerEntry);

  const servicesRadius = makeRadius(servicesEntry);
  const myStackRadius = makeRadius(myStackEntry);
  const projectsRadius = makeRadius(projectsEntry);
  const footerRadius = makeRadius(footerEntry);

  const heroOpacity = useMotionValue(1);

  const { localP: heroLocalP, motionLocalP: heroMotionP } = useLocalProgress(
    globalP,
    RANGES.hero,
  );
  const heroUiOpacity = useTransform(heroMotionP, [0, 0.2], [1, 0]);

  const { localP: servicesLocalP } = useLocalProgress(globalP, RANGES.services);
  const { localP: projectsLocalP } = useLocalProgress(globalP, RANGES.projects);

  const onHeroLoadComplete = useCallback(() => {
    if (heroReady.current) return;
    heroReady.current = true;
    setHeroLoaded(true);
    unlockScroll();
  }, [unlockScroll]);

  // ── Shared delta handler ──────────────────────────────────────────────────
  const handleScrollDelta = useCallback(
    (deltaY: number) => {
      if (scrollLocked.current) return;
      const p = globalP.current;
      const inServices = p >= ENTRY.services[0] && p <= RANGES.services[1];

      if (inServices && servicesEntryRaw.get() >= 0.98) {
        const el = servicesTrackRef.current;
        if (el) {
          const cardWidth = el.clientWidth;
          const totalCards = el.children.length;
          const atStart = el.scrollLeft <= 2;
          const atEnd = el.scrollLeft >= (totalCards - 1) * cardWidth - 2;

          if (deltaY > 0 && !atEnd) {
            const idx = Math.round(el.scrollLeft / cardWidth);
            el.scrollTo({ left: (idx + 1) * cardWidth, behavior: "smooth" });
            const frac = (RANGES.services[1] - RANGES.services[0]) / totalCards;
            seekTo(Math.min(RANGES.services[1], p + frac));
            return;
          }
          if (deltaY < 0 && !atStart) {
            const idx = Math.round(el.scrollLeft / cardWidth);
            el.scrollTo({ left: (idx - 1) * cardWidth, behavior: "smooth" });
            const frac = (RANGES.services[1] - RANGES.services[0]) / totalCards;
            seekTo(Math.max(RANGES.services[0], p - frac));
            return;
          }
        }
      }

      seekTo(Math.max(0, Math.min(1, p + deltaY * WHEEL_SPEED)));
    },
    [globalP, seekTo, scrollLocked, servicesEntryRaw],
  );

  // ── Wheel ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleScrollDelta(e.deltaY);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [handleScrollDelta]);

  // ── Touch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let axis: "h" | "v" | null = null;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      axis = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (scrollLocked.current) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      }
      if (!axis) return;

      const p = globalP.current;
      const inServices =
        p >= ENTRY.services[0] &&
        p <= RANGES.services[1] &&
        servicesEntryRaw.get() >= 0.98;

      if (axis === "h") return;

      const deltaY = -dy;

      if (inServices) {
        const el = servicesTrackRef.current;
        if (el) {
          const cardWidth = el.clientWidth;
          const totalCards = el.children.length;
          const atStart = el.scrollLeft <= 2;
          const atEnd = el.scrollLeft >= (totalCards - 1) * cardWidth - 2;

          if ((deltaY > 0 && atEnd) || (deltaY < 0 && atStart)) {
            e.preventDefault();
            seekTo(Math.max(0, Math.min(1, p + deltaY * WHEEL_SPEED * 4)));
            startY = e.touches[0].clientY;
          }
          return;
        }
      }

      e.preventDefault();
      seekTo(Math.max(0, Math.min(1, p + deltaY * WHEEL_SPEED * 4)));
      startY = e.touches[0].clientY;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [globalP, seekTo, scrollLocked, servicesEntryRaw]);

  // ── Sync horizontal card scroll → globalP ────────────────────────────────
  useEffect(() => {
    const el = servicesTrackRef.current;
    if (!el) return;
    const onScroll = () => {
      const p = globalP.current;
      const inServices = p >= ENTRY.services[0] && p <= RANGES.services[1];
      if (!inServices) return;
      const cardWidth = el.clientWidth;
      const totalCards = el.children.length;
      const cardIndex = Math.round(el.scrollLeft / cardWidth);
      const frac = (RANGES.services[1] - RANGES.services[0]) / totalCards;
      const target = RANGES.services[0] + cardIndex * frac;
      seekTo(target);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [globalP, seekTo]);

  // ── Master RAF ────────────────────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    function ep(p: number, [s, e]: [number, number]) {
      if (p <= s) return 0;
      if (p >= e) return 1;
      return (p - s) / (e - s);
    }
    const tick = () => {
      const p = globalP.current;

      if (heroReady.current) {
        heroOpacity.set(p <= 0.08 ? 1 : p <= 0.12 ? 1 - (p - 0.08) / 0.04 : 0);
      }

      servicesEntryRaw.set(ep(p, ENTRY.services));
      myStackEntryRaw.set(ep(p, ENTRY.myStack));
      projectsEntryRaw.set(ep(p, ENTRY.projects));
      footerEntryRaw.set(ep(p, ENTRY.footer));

      // Services active
      const nowServices = p >= ENTRY.services[0] && p < ENTRY.myStack[0];
      if (nowServices !== servicesActiveRef.current) {
        servicesActiveRef.current = nowServices;
        setServicesActive(nowServices);
      }

      // MyStack: read the SPRING value (not raw) to know when panel has landed.
      // myStackEntry is the spring — .get() returns its current animated value.
      const springVal = myStackEntry.get();
      const panelInRange = p >= ENTRY.myStack[0] && p < ENTRY.projects[0];

      // Fully visible: panel in range AND spring has crossed threshold
      const fullyVisible =
        panelInRange && springVal >= MYSTACK_FULLY_IN_THRESHOLD;

      if (fullyVisible !== myStackFullyVisibleRef.current) {
        myStackFullyVisibleRef.current = fullyVisible;
        setMyStackFullyVisible(fullyVisible);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // myStackEntry is a stable MotionValue ref — safe to include
  }, [
    globalP,
    heroOpacity,
    servicesEntryRaw,
    myStackEntryRaw,
    projectsEntryRaw,
    footerEntryRaw,
    myStackEntry,
  ]);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        {/* Navbar — slides in after hero load */}
        {heroLoaded && (
          <motion.div
            className="absolute inset-x-0 top-0 z-[100]"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Navbar isVisible={true} />
          </motion.div>
        )}

        {/* Hero — z-10 */}
        <motion.div
          style={{
            opacity: heroOpacity,
            scale: heroScale,
            y: heroPushY,
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

        {/* Services — z-20 */}
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
          <MyServices
            isActive={servicesActive}
            trackRef={servicesTrackRef}
            localP={servicesLocalP}
          />
        </motion.div>

        {/* MyStack — z-25 */}
        <motion.div
          style={{
            y: myStackY,
            scale: myStackScale,
            translateY: myStackPushY,
            filter: myStackFilter,
            boxShadow: myStackShadow,
            borderRadius: myStackRadius,
          }}
          className="absolute inset-0 z-[25] overflow-hidden"
        >
          {/* isVisible = spring has fully landed, not just started sliding */}
          <MyStack isVisible={myStackFullyVisible} />
        </motion.div>

        {/* Projects — z-30 */}
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

        {/* Footer — z-40 */}
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

      {heroLoaded && <ProgressBar globalP={globalP} />}
    </>
  );
}

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
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50">
      <div className="relative h-0.5 w-full overflow-hidden bg-white/5">
        <div
          ref={barRef}
          className="absolute left-0 top-0 h-full bg-[#00FF88] transition-none"
          style={{ width: "0%" }}
        />
      </div>
      <div
        ref={textRef}
        className="absolute bottom-4 right-6 font-mono text-[9px] uppercase tracking-widest text-[#00FF88]"
      >
        0%
      </div>
    </div>
  );
}
