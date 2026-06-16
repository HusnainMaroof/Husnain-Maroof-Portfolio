"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { AnimatedText } from "./TextAnimation"; // your existing component

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Service {
  index: string;
  label: string;
  title: string;
  description: string;
  tags: string[];
  visual: React.ReactNode;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  {
    index: "01",
    label: "Engineering",
    title: "Full-Stack Systems",
    description:
      "End-to-end architecture from database schema to pixel-perfect UI. I own the full delivery — no hand-offs, no gaps.",
    tags: ["Next.js", "Node.js", "PostgreSQL", "TypeScript"],
    visual: <EngineeringVisual />,
  },
  {
    index: "02",
    label: "Interaction",
    title: "Motion & Experience",
    description:
      "Interfaces that feel alive. Cinematic transitions, scroll-driven sequences, and micro-interactions that turn products into experiences.",
    tags: ["Framer Motion", "GSAP", "WebGL", "Canvas"],
    visual: <MotionVisual />,
  },
  {
    index: "03",
    label: "Velocity",
    title: "Ship. Fast. Right.",
    description:
      "No over-engineering. No endless planning. Production-ready code shipped in days, not sprints. Performance and quality are non-negotiable.",
    tags: ["CI/CD", "Vercel", "Edge Functions", "Optimization"],
    visual: <VelocityVisual />,
  },
];

// ─── VISUAL PLACEHOLDERS ──────────────────────────────────────────────────────
function EngineeringVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor:
                i % 3 === 0 ? "#00FF88" : i % 2 === 0 ? "#1a1a1a" : "#262626",
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.06,
              duration: 0.4,
              ease: [0.76, 0, 0.24, 1],
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MotionVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-40 h-40">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-[#00FF88]"
            style={{ scale: 1 + i * 0.25, opacity: 0.15 + i * 0.15 }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 8 + i * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-6 rounded-full bg-[#00FF88]" />
        </motion.div>
      </div>
    </div>
  );
}

function VelocityVisual() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8">
      {["████████████", "██████████░░", "████████░░░░"].map((bar, i) => (
        <div key={i} className="w-full flex items-center gap-3">
          <span className="text-[10px] text-neutral-500 font-mono w-8">
            {["API", "UI", "DB"][i]}
          </span>
          <motion.div
            className="h-1.5 rounded-full bg-[#00FF88]"
            initial={{ width: 0 }}
            whileInView={{ width: `${[100, 83, 66][i]}%` }}
            transition={{
              delay: i * 0.15,
              duration: 0.8,
              ease: [0.76, 0, 0.24, 1],
            }}
          />
        </div>
      ))}
      <motion.p
        className="text-[10px] font-mono text-[#00FF88] mt-2 tracking-widest"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        DEPLOYING...
      </motion.p>
    </div>
  );
}

// ─── TITLE SLIDE ──────────────────────────────────────────────────────────────
function TitleSlide({ progress }: { progress: MotionValue<number> }) {
  // Fade in 0–0.15, hold, fade out 0.2–0.3
  const opacity = useTransform(progress, [0, 0.08, 0.2, 0.3], [0, 1, 1, 0]);
  const y = useTransform(progress, [0, 0.08, 0.2, 0.3], [40, 0, 0, -40]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 20 });

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
    >
      <motion.div style={{ y: smoothY }} className="text-center px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 font-medium mb-6">
          What Sets Me Apart
        </p>

        {/* Line 1 */}
        <div className="text-4xl md:text-6xl lg:text-7xl font-display font-black italic uppercase leading-[0.88] tracking-tighter">
          <span className="block">
            <AnimatedText
              text="NOT JUST CODE."
              startReveal={true}
              delayOffset={0}
              color="#FFFFFF"
            />
          </span>
          <span className="block mt-1">
            <AnimatedText
              text="CRAFT."
              startReveal={true}
              delayOffset={0.35}
              color="#00FF88"
            />
          </span>
        </div>

        {/* Divider */}
        <motion.div
          className="w-16 h-px bg-[#00FF88] mx-auto mt-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        />

        <motion.p
          className="text-neutral-400 text-sm md:text-base font-light mt-6 max-w-sm mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          I build what others only design.
          <br />I ship what others only plan.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ─── SERVICE CARD (RIGHT SIDE) ────────────────────────────────────────────────
function ServiceCard({
  service,
  index,
  totalProgress,
  sectionStart,
  sectionEnd,
}: {
  service: Service;
  index: number;
  totalProgress: MotionValue<number>;
  sectionStart: number;
  sectionEnd: number;
}) {
  const midpoint = (sectionStart + sectionEnd) / 2;

  const opacity = useTransform(
    totalProgress,
    [sectionStart, sectionStart + 0.04, sectionEnd - 0.04, sectionEnd],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    totalProgress,
    [sectionStart, sectionStart + 0.06, sectionEnd - 0.06, sectionEnd],
    [60, 0, 0, -60],
  );
  const smoothY = useSpring(y, { stiffness: 80, damping: 18 });

  return (
    <motion.div
      style={{ opacity, y: smoothY }}
      className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
    >
      {/* Visual Card */}
      <div className="w-full max-w-sm aspect-square border border-white/10 bg-[#0f0f0f] rounded-sm relative overflow-hidden">
        {/* Index watermark */}
        <span className="absolute top-4 left-5 text-[5rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">
          {service.index}
        </span>

        {/* The visual */}
        {service.visual}

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
            {service.label}
          </span>
          <span className="text-[10px] text-[#00FF88] font-mono">
            {service.index} / 03
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── STICKY LEFT PANEL ────────────────────────────────────────────────────────
function LeftPanel({
  progress,
  service,
  isVisible,
}: {
  progress: MotionValue<number>;
  service: Service;
  isVisible: boolean;
}) {
  return (
    <div className="sticky top-0 h-screen flex flex-col justify-center px-8 md:px-12 lg:px-20">
      {/* Vertical label */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-medium whitespace-nowrap">
          What I Offer
        </span>
      </div>

      {/* Service navigation dots */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 pr-4">
        {SERVICES.map((s, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full transition-all duration-500"
            animate={{
              height: s.index === service.index ? 32 : 8,
              backgroundColor:
                s.index === service.index ? "#00FF88" : "#404040",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={service.index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        className="max-w-sm"
      >
        {/* Index + label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-mono text-[#00FF88] tracking-widest">
            {service.index}
          </span>
          <div className="w-8 h-px bg-[#00FF88]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
            {service.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-black italic uppercase leading-[0.9] tracking-tighter mb-6">
          <AnimatedText
            text={service.title}
            startReveal={isVisible}
            delayOffset={0}
            color="#FFFFFF"
          />
        </h3>

        {/* Description */}
        <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed mb-8">
          {service.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono uppercase tracking-widest text-[#00FF88] border border-[#00FF88]/30 px-3 py-1 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── SPLIT SECTION ────────────────────────────────────────────────────────────
function SplitSection({ progress }: { progress: MotionValue<number> }) {
  // Visible from 0.3 to 1.0 of total scroll
  const opacity = useTransform(progress, [0.28, 0.35], [0, 1]);

  // Which service is active based on scroll (mapped across 0.35 → 1.0)
  const mappedProgress = useTransform(progress, [0.35, 1.0], [0, 1]);

  // Derive active service index reactively
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = mappedProgress.on("change", (v) => {
      const idx = Math.min(
        Math.floor(v * SERVICES.length),
        SERVICES.length - 1,
      );
      setActiveIndex(idx);
    });
    return unsubscribe;
  }, [mappedProgress]);

  // Per-service scroll ranges (within 0.35 → 1.0 of total)
  const totalRange = 0.65; // 1.0 - 0.35
  const perService = totalRange / SERVICES.length;

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* LEFT: Sticky detail panel */}
        <div className="relative hidden md:block">
          <LeftPanel
            progress={progress}
            service={SERVICES[activeIndex]}
            isVisible={true}
          />
        </div>

        {/* RIGHT: Scroll-driven visual cards */}
        <div className="relative">
          {/* Mobile: Show left content inline above visual */}
          <div className="md:hidden sticky top-0 z-10 px-6 pt-16 pb-4 bg-gradient-to-b from-gray-950 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-mono text-[#00FF88]">
                {SERVICES[activeIndex].index}
              </span>
              <div className="w-6 h-px bg-[#00FF88]" />
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                {SERVICES[activeIndex].label}
              </span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {SERVICES[activeIndex].title}
            </h3>
          </div>

          {/* Stacked visual cards — each occupies full right panel */}
          <div className="relative h-full">
            {SERVICES.map((service, i) => {
              const sectionStart = 0.35 + i * perService;
              const sectionEnd = sectionStart + perService;
              return (
                <ServiceCard
                  key={service.index}
                  service={service}
                  index={i}
                  totalProgress={progress}
                  sectionStart={sectionStart}
                  sectionEnd={sectionEnd}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-white/5 hidden md:block" />
    </motion.div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function WMDSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pin the section for 500vh of scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the global progress for buttery feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.0005,
  });

  // Controls transition from title → split (cross-fade at 0.3)
  const splitOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);

  return (
    // Tall container — 500vh gives smooth scroll room for all phases
    <div ref={containerRef} className="relative h-[500vh] bg-gray-950">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Phase 1: Title */}
        <TitleSlide progress={smoothProgress} />

        {/* Phase 2: Split Section */}
        <SplitSection progress={smoothProgress} />

        {/* Bottom progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-[#00FF88] origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </div>
  );
}
