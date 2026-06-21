"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { Service, SERVICES } from "@/src/data/MyserviceData";
import { AnimatedText } from "./TextAnimation";
import { cinematicEase, TIMELINE } from "@/src/types/ServicesType";

// ─── Derived constants ────────────────────────────────────────────────────────
const TOTAL_SERVICES = SERVICES.length;
const PER_SERVICE =
  (TIMELINE.split.holdEnd - TIMELINE.split.enterEnd) / TOTAL_SERVICES;

// ─── HOOK: Active service index ───────────────────────────────────────────────
function useActiveIndex(progress: MotionValue<number>): number {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const unsubscribe = progress.on("change", (v) => {
      if (v < TIMELINE.split.enterEnd) {
        setIdx(0);
        return;
      }
      if (v > TIMELINE.split.holdEnd) {
        setIdx(TOTAL_SERVICES - 1);
        return;
      }
      const mapped =
        (v - TIMELINE.split.enterEnd) /
        (TIMELINE.split.holdEnd - TIMELINE.split.enterEnd);
      const next = Math.min(
        Math.floor(mapped * TOTAL_SERVICES),
        TOTAL_SERVICES - 1,
      );
      setIdx(Math.max(0, next));
    });
    return unsubscribe;
  }, [progress]);

  return idx;
}

// ─── SERVICE VISUAL CARD ──────────────────────────────────────────────────────
interface ServiceVisualCardProps {
  service: Service;
  progress: MotionValue<number>;
  sectionStart: number;
  sectionEnd: number;
  totalServices: number;
}

function ServiceVisualCard({
  service,
  progress,
  sectionStart,
  sectionEnd,
  totalServices,
}: ServiceVisualCardProps) {
  const fadeWindow = PER_SERVICE * 0.1;
  const holdStart = sectionStart + fadeWindow;
  const holdEnd = sectionEnd - fadeWindow;

  const opacity = useTransform(
    progress,
    [sectionStart, holdStart, holdEnd, sectionEnd],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [sectionStart, holdStart, holdEnd, sectionEnd],
    [60, 0, 0, -60],
  );
  const scale = useTransform(
    progress,
    [sectionStart, holdStart, holdEnd, sectionEnd],
    [0.88, 1, 1, 0.88],
  );
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      style={{ opacity, y: smoothY, scale: smoothScale }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-10"
    >
      <div className="w-full h-full max-h-[600px] rounded-2xl border border-white/10 bg-[#0a0a0a] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />

        <div className="p-6 md:p-8 relative z-10 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono text-neutral-500 tracking-widest">
              {service.index}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
              {service.category}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {service.title}
          </h3>
          <p className="text-sm text-neutral-400 mt-2">{service.subtitle}</p>
        </div>

        <div className="relative flex-1 w-full flex items-center justify-center z-10 overflow-hidden min-h-0">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-white select-none pointer-events-none leading-none z-0 text-[14rem] text-white/[0.015]">
            {service.index}
          </span>
          <div className="relative z-10 w-full h-full">{service.visual}</div>
        </div>

        <div className="border-t border-white/10 px-6 md:px-8 py-3 md:py-4 flex items-center justify-between backdrop-blur-md bg-black/20 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {service.tags?.map((tag) => (
              <span
                key={tag}
                className="border border-white/10 rounded px-2 py-1 text-[9px] uppercase tracking-widest text-neutral-400 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#00FF88]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span className="text-[10px] text-[#00FF88] font-mono tracking-widest">
              {service.index} /{" "}
              {totalServices < 10 ? `0${totalServices}` : totalServices}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── LEFT PANEL ───────────────────────────────────────────────────────────────
function LeftPanel({
  progress,
  activeIndex,
}: {
  progress: MotionValue<number>;
  activeIndex: number;
}) {
  const service = SERVICES[activeIndex];
  const [revealed, setRevealed] = useState(true);
  const prevIndex = useRef(activeIndex);

  useEffect(() => {
    if (prevIndex.current !== activeIndex) {
      setRevealed(false);
      const t = setTimeout(() => setRevealed(true), 60);
      prevIndex.current = activeIndex;
      return () => clearTimeout(t);
    }
  }, [activeIndex]);

  return (
    <div className="relative h-full">
      <div className="absolute top-[15%] left-10">
        <span className="text-[18px] uppercase font-display tracking-widest text-[#00FF88] font-medium whitespace-nowrap">
          What I Offer
        </span>
      </div>
      <div className="sticky top-0 h-screen flex flex-col justify-center px-10 lg:px-16 xl:px-20">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              animate={{
                height: i === activeIndex ? 28 : 6,
                backgroundColor: i === activeIndex ? "#00FF88" : "#2a2a2a",
              }}
              transition={{ duration: 0.35, ease: cinematicEase }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={service.index}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.45, ease: cinematicEase }}
            className="max-w-sm"
          >
            <div className="flex items-center gap-3 mb-7">
              <span className="text-[10px] font-mono text-[#00FF88] tracking-widest">
                {service.index}
              </span>
              <div className="w-6 h-px bg-[#00FF88]/60" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
                {service.category} {service.label}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl lg:text-[2.75rem] font-display font-black italic uppercase leading-[0.88] mb-2">
              <AnimatedText
                text={service.title}
                startReveal={revealed}
                delayOffset={0}
                color="#FFFFFF"
              />
            </h3>

            <motion.p
              className="text-[11px] uppercase tracking-[0.2em] text-[#00FF88] font-medium mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {service.subtitle}
            </motion.p>

            <motion.p
              className="text-neutral-400 text-sm font-light leading-[1.75] mb-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 8 }}
              transition={{ delay: 0.25, duration: 0.5, ease: cinematicEase }}
            >
              {service.description}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-mono uppercase tracking-widest text-[#00FF88]/80 border border-[#00FF88]/20 px-2.5 py-1"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── SPLIT SECTION ────────────────────────────────────────────────────────────
function SplitSection({ progress }: { progress: MotionValue<number> }) {
  const activeIndex = useActiveIndex(progress);

  const opacity = useTransform(
    progress,
    [
      TIMELINE.split.start - 0.03,
      TIMELINE.split.start + 0.03,
      TIMELINE.split.end - 0.03,
      TIMELINE.split.end + 0.03,
    ],
    [0, 1, 1, 0],
  );

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <div className="hidden md:grid md:grid-cols-2 h-full">
        <div className="relative">
          <LeftPanel progress={progress} activeIndex={activeIndex} />
        </div>
        <div className="relative">
          {SERVICES.map((service, i) => {
            const sectionStart = TIMELINE.split.enterEnd + i * PER_SERVICE;
            const sectionEnd = sectionStart + PER_SERVICE;
            return (
              <ServiceVisualCard
                key={service.index}
                service={service}
                progress={progress}
                sectionStart={sectionStart}
                sectionEnd={sectionEnd}
                totalServices={TOTAL_SERVICES}
              />
            );
          })}
        </div>
      </div>

      <div className="md:hidden h-full flex flex-col">
        <div className="sticky top-0 z-10 px-5 pt-20 pb-4 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono text-[#00FF88]">
              {SERVICES[activeIndex].index}
            </span>
            <div className="w-5 h-px bg-[#00FF88]/50" />
            <span className="text-[9px] uppercase tracking-widest text-neutral-500">
              {SERVICES[activeIndex].category}
            </span>
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
            {SERVICES[activeIndex].title}
          </h3>
          <p className="text-[10px] text-[#00FF88] uppercase tracking-widest mt-1">
            {SERVICES[activeIndex].subtitle}
          </p>
        </div>
        <div className="relative flex-1">
          {SERVICES.map((service, i) => {
            const sectionStart = TIMELINE.split.enterEnd + i * PER_SERVICE;
            const sectionEnd = sectionStart + PER_SERVICE;
            return (
              <ServiceVisualCard
                key={service.index}
                service={service}
                progress={progress}
                sectionStart={sectionStart}
                sectionEnd={sectionEnd}
                totalServices={TOTAL_SERVICES}
              />
            );
          })}
        </div>
      </div>

      <div className="absolute top-0 left-1/2 w-px h-full bg-white/4 hidden md:block" />
    </motion.div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function MyServices() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal timeline progress — drives SplitSection's per-card choreography
  // while the section is pinned (start start → end end, i.e. only while sticky).
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    restDelta: 0.001,
  });

  // Section-level entrance/exit fade — tracks the container's position
  // relative to the *viewport* (not the pinned-scroll range), so the whole
  // section fades in as it scrolls into view and fades out as it scrolls
  // past, independent of and in addition to SplitSection's internal fade.
  const { scrollYProgress: viewportProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const sectionOpacity = useTransform(
    viewportProgress,
    [0, 0.08, 0.92, 1],
    [0, 1, 1, 0],
  );
  const smoothSectionOpacity = useSpring(sectionOpacity, {
    stiffness: 100,
    damping: 20,
  });

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-[#050505]">
      <motion.div
        style={{ opacity: smoothSectionOpacity }}
        className="sticky top-0 h-screen overflow-hidden"
      >
        <SplitSection progress={smoothProgress} />
      </motion.div>
    </div>
  );
}
