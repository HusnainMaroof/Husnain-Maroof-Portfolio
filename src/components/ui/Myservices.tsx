"use client";
import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { SERVICES } from "@/src/data/MyserviceData";
import { AnimatedText } from "./TextAnimation";
import { useServiceWheelRedirect } from "@/src/lib/useServiceWheelRedirect";

const TOTAL = SERVICES.length;
const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface ServiceCardProps {
  cardIndex: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
}

interface MyServicesProps {
  isActive: boolean;
  seekTo: (progress: number) => void;
}

// ─── SERVICE CARD ─────────────────────────────────────────────────────────────
function ServiceCard({ cardIndex, trackRef }: ServiceCardProps) {
  const service = SERVICES[cardIndex];
  const ref = useRef<HTMLDivElement>(null);

  const visible = useInView(ref, {
    root: trackRef,
    amount: 0.5,
    once: false,
  });

  return (
    <div
      ref={ref}
      className="relative flex-shrink-0 w-screen h-full grid grid-cols-2"
    >
      {/* LEFT: text panel */}
      <div className="flex flex-col justify-center px-10 lg:px-16 xl:px-20 relative">
        <div className="flex items-center gap-3 mb-7">
          <span className="text-[10px] font-mono text-[#00FF88] tracking-widest">
            {service.index}
          </span>
          <div className="w-6 h-px bg-[#00FF88]/60" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
            {service.category} · {service.label}
          </span>
        </div>

        <h3 className="text-3xl md:text-4xl lg:text-[2.75rem] font-display font-black italic uppercase leading-[0.88] mb-3">
          <AnimatedText
            text={service.title}
            startReveal={visible}
            delayOffset={0}
            color="#FFFFFF"
          />
        </h3>

        <motion.p
          className="text-[11px] uppercase tracking-[0.2em] text-[#00FF88] font-medium mb-6"
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
          transition={{ delay: 0.15, duration: 0.45, ease: cinematicEase }}
        >
          {service.subtitle}
        </motion.p>

        <motion.p
          className="text-neutral-400 text-sm font-light leading-[1.75] mb-8 max-w-xs"
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
          transition={{ delay: 0.22, duration: 0.5, ease: cinematicEase }}
        >
          {service.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-2"
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
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
      </div>

      {/* RIGHT: visual panel */}
      <div className="relative flex items-center justify-center p-6 md:p-10">
        <div className="w-full h-full max-h-[85vh] rounded-2xl border border-white/10 bg-[#0a0a0a] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />

          <div className="relative flex-1 w-full flex items-center justify-center z-10 overflow-hidden min-h-0">
            {service.visual(visible)}
          </div>

          <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between backdrop-blur-md bg-black/20 z-10 shrink-0 gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {service.tags.map((tag) => (
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
                {service.index} / 0{TOTAL}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-white/[0.04] pointer-events-none" />
    </div>
  );
}

// ─── DOT NAVIGATOR ────────────────────────────────────────────────────────────
function DotNavigator({
  trackRef,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [active, setActive] = React.useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      setActive(Math.round(el.scrollLeft / el.clientWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [trackRef]);

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-10">
      {SERVICES.map((_, i) => (
        <motion.button
          key={i}
          className="w-0.5 rounded-full"
          animate={{
            height: i === active ? 28 : 6,
            backgroundColor: i === active ? "#00FF88" : "#2a2a2a",
          }}
          transition={{ duration: 0.35, ease: cinematicEase }}
          onClick={() => {
            const el = trackRef.current;
            if (!el) return;
            el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
          }}
        />
      ))}
    </div>
  );
}

// ─── SCROLL HINT ──────────────────────────────────────────────────────────────
function ScrollHint({
  trackRef,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowLeft(el.scrollLeft > 20);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 20);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [trackRef]);

  return (
    <>
      <motion.button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-[#00FF88]/50 hover:text-[#00FF88] transition-colors duration-300 text-xl"
        animate={{
          opacity: showLeft ? 1 : 0,
          pointerEvents: showLeft ? "auto" : "none",
        }}
        onClick={() => {
          const el = trackRef.current;
          if (!el) return;
          const currentIndex = Math.round(el.scrollLeft / el.clientWidth);
          el.scrollTo({
            left: Math.max(0, currentIndex - 1) * el.clientWidth,
            behavior: "smooth",
          });
        }}
      >
        ←
      </motion.button>

      <motion.button
        className="absolute right-14 top-1/2 -translate-y-1/2 z-20 text-[#00FF88]/50 hover:text-[#00FF88] transition-colors duration-300 text-xl"
        animate={{
          opacity: showRight ? 1 : 0,
          pointerEvents: showRight ? "auto" : "none",
        }}
        onClick={() => {
          const el = trackRef.current;
          if (!el) return;
          const currentIndex = Math.round(el.scrollLeft / el.clientWidth);
          el.scrollTo({
            left:
              Math.min(TOTAL - 1, currentIndex + 1) * el.clientWidth,
            behavior: "smooth",
          });
        }}
      >
        →
      </motion.button>
    </>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function HorizontalProgressBar({
  trackRef,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      if (barRef.current)
        barRef.current.style.width = `${progress * 100}%`;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [trackRef]);

  return (
    <div className="absolute bottom-0 left-0 w-full h-px bg-white/5 z-10">
      <div
        ref={barRef}
        className="h-full bg-[#00FF88] transition-none"
        style={{ width: "0%" }}
      />
    </div>
  );
}

// ─── SERVICES SECTION ─────────────────────────────────────────────────────────
export function MyServices({ isActive, seekTo }: MyServicesProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useServiceWheelRedirect({
    isActive,
    trackRef,
    onExitRight: () => seekTo(0.58),
    onExitLeft: () => seekTo(0.16),
  });

  return (
    <div className="absolute inset-0 bg-[#050505] overflow-hidden">
      {/* Horizontal scroll track — no CSS snap, we own snapping in the hook */}
      <div
        ref={trackRef}
        className="flex h-full overflow-x-scroll overflow-y-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SERVICES.map((_, i) => (
          <div key={i} className="shrink-0 w-screen h-full">
            <ServiceCard cardIndex={i} trackRef={trackRef} />
          </div>
        ))}
      </div>

      {/* "What I Offer" eyebrow — fixed inside panel */}
      <div className="absolute top-[10%] left-10 pointer-events-none z-10">
        <span className="text-[13px] uppercase font-mono tracking-[0.3em] text-[#00FF88] font-medium">
          What I Offer
        </span>
      </div>

      <DotNavigator trackRef={trackRef} />
      <ScrollHint trackRef={trackRef} />
      <HorizontalProgressBar trackRef={trackRef} />
    </div>
  );
}