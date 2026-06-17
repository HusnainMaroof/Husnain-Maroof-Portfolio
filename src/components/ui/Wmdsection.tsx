"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { Service, SERVICES } from "@/src/data/MyserviceData";
import { AnimatedText } from "./TextAnimation";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

const TOTAL_SERVICES = SERVICES.length;
const SPLIT_START = 0.3;
const SPLIT_END = 0.7;
const SPLIT_RANGE = SPLIT_END - SPLIT_START;
const PER_SERVICE = SPLIT_RANGE / TOTAL_SERVICES;
const BEHIND_START = 0.78;
const BEHIND_END = 0.95;

// ─── HOOK: derive active index from a MotionValue ─────────────────────────────
function useActiveIndex(progress: MotionValue<number>): number {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    return progress.on("change", (v) => {
      const mapped = (v - SPLIT_START) / SPLIT_RANGE;
      const next = Math.min(
        Math.floor(mapped * TOTAL_SERVICES),
        TOTAL_SERVICES - 1,
      );
      setIdx(Math.max(0, next));
    });
  }, [progress]);
  return idx;
}

// ─── TITLE SLIDE ──────────────────────────────────────────────────────────────
function TitleSlide({ progress }: { progress: MotionValue<number> }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    return progress.on("change", (v) => {
      if (v > 0.01 && v < 0.3 && !revealed) setRevealed(true);
      if (v <= 0.01 || v >= 0.3) setRevealed(false);
    });
  }, [progress, revealed]);

  const opacity = useTransform(progress, [0, 0.06, 0.18, 0.28], [0, 1, 1, 0]);
  const y = useTransform(progress, [0, 0.06, 0.18, 0.28], [40, 0, 0, -40]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
    >
      <motion.div style={{ y: smoothY }} className="text-center px-6">
        <motion.p
          className="text-[10px] uppercase tracking-[0.4em] text-neutral-200 font-medium mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          What Sets Me Apart
        </motion.p>

        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black italic uppercase leading-[0.88] tracking-wide">
          <span className="block">
            <AnimatedText
              text="I DON'T JUST CODE."
              startReveal={revealed}
              delayOffset={0.1}
              color="#FFFFFF"
            />
          </span>
          <span className="block mt-2">
            <AnimatedText
              text="BUT"
              startReveal={revealed}
              delayOffset={0.1}
              color="#FFFFFF"
            />
            <AnimatedText
              text="CRAFT."
              startReveal={revealed}
              delayOffset={0.55}
              color="#00FF88"
            />
          </span>
        </div>

        <motion.div
          className="w-12 h-px bg-[#00FF88] mx-auto mt-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: revealed ? 1 : 0, opacity: revealed ? 1 : 0 }}
          transition={{ delay: 1.0, duration: 0.5, ease: cinematicEase }}
        />

        <motion.p
          className="text-neutral-200 text-sm font-light mt-6 max-w-xs mx-auto leading-relaxed tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          I build what others only design.
          <br />I ship what others only plan.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ─── WHO'S BEHIND SLIDE ───────────────────────────────────────────────────────
function BehindSlide({ progress }: { progress: MotionValue<number> }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    return progress.on("change", (v) => {
      if (v > BEHIND_START + 0.02 && v < BEHIND_END && !revealed)
        setRevealed(true);
      if (v <= BEHIND_START + 0.02 || v >= BEHIND_END) setRevealed(false);
    });
  }, [progress, revealed]);

  const opacity = useTransform(
    progress,
    [BEHIND_START, BEHIND_START + 0.06, BEHIND_END - 0.08, BEHIND_END],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [BEHIND_START, BEHIND_START + 0.06, BEHIND_END - 0.08, BEHIND_END],
    [40, 0, 0, -40],
  );
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
    >
      <motion.div style={{ y: smoothY }} className="text-center px-6">
        <motion.p
          className="text-[10px] uppercase tracking-[0.4em] text-neutral-200 font-medium mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Meet the Mind
        </motion.p>

        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black italic uppercase leading-[0.88] tracking-wide">
          <span className="block">
            <AnimatedText
              text="WHO'S BEHIND"
              startReveal={revealed}
              delayOffset={0.1}
              color="#FFFFFF"
            />
          </span>
          <span className="block mt-2">
            <AnimatedText
              text="THE"
              startReveal={revealed}
              delayOffset={0.35}
              color="#FFFFFF"
            />
            <AnimatedText
              text="WORK."
              startReveal={revealed}
              delayOffset={0.55}
              color="#00FF88"
            />
          </span>
        </div>

        <motion.div
          className="w-12 h-px bg-[#00FF88] mx-auto mt-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: revealed ? 1 : 0, opacity: revealed ? 1 : 0 }}
          transition={{ delay: 1.0, duration: 0.5, ease: cinematicEase }}
        />

        <motion.p
          className="text-neutral-200 text-sm font-light mt-6 max-w-xs mx-auto leading-relaxed tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Scroll down to discover the architect.
          <br />
          Engineer by logic. Designer by instinct.
        </motion.p>
      </motion.div>
    </motion.div>
  );
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
  const fadeWindow = 0.05;
  const opacity = useTransform(
    progress,
    [
      sectionStart,
      sectionStart + fadeWindow,
      sectionEnd - fadeWindow,
      sectionEnd,
    ],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [
      sectionStart,
      sectionStart + fadeWindow,
      sectionEnd - fadeWindow,
      sectionEnd,
    ],
    [40, 0, 0, -40],
  );
  const scale = useTransform(
    progress,
    [
      sectionStart,
      sectionStart + fadeWindow,
      sectionEnd - fadeWindow,
      sectionEnd,
    ],
    [0.92, 1, 1, 0.92],
  );
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      style={{ opacity, y: smoothY, scale: smoothScale }}
      className="absolute inset-0 flex items-center justify-center p-6 md:p-10"
    >
      <div className="w-full h-full max-h-150 rounded-2xl border border-white/10 bg-[#0a0a0a] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col group">
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />

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
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-white select-none pointer-events-none leading-none z-0 text-[14rem] opacity-10 whitespace-nowrap">
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
              className="w-0.75 rounded-full"
              animate={{
                height: i === activeIndex ? 28 : 6,
                backgroundColor: i === activeIndex ? "#00FF88" : "#2a2a2a",
              }}
              transition={{ duration: 0.35, ease: cinematicEase }}
            />
          ))}
        </div>

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
      SPLIT_START - 0.05,
      SPLIT_START + 0.05,
      SPLIT_END - 0.05,
      SPLIT_END + 0.05,
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
            const sectionStart = SPLIT_START + i * PER_SERVICE;
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
        <div className="sticky top-0 z-10 px-5 pt-20 pb-4 bg-linear-to-b from-[#050505] via-[#050505]/90 to-transparent">
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
            const sectionStart = SPLIT_START + i * PER_SERVICE;
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
export function WMDSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    restDelta: 0.0003,
  });

  return (
    <div ref={containerRef} className="relative h-[800vh] bg-[#050505]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <TitleSlide progress={smoothProgress} />
        <SplitSection progress={smoothProgress} />
        <BehindSlide progress={smoothProgress} />
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-[#00FF88]/60 origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </div>
  );
}
