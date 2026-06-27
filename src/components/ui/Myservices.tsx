"use client";
import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { SERVICES } from "@/src/data/MyserviceData";
import { AnimatedText } from "./TextAnimation";

const TOTAL = SERVICES.length;
const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface MyServicesProps {
  isActive: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  localP:   React.MutableRefObject<number>;
}

function ServiceCard({
  cardIndex,
  trackRef,
}: {
  cardIndex: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  const service = SERVICES[cardIndex];
  const ref     = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { root: trackRef, amount: 0.4, once: false });

  return (
    // Mobile: single column stacked. md+: two column split
    <div ref={ref} className="relative shrink-0 w-[95vw] h-full flex flex-col md:grid md:grid-cols-2">

      {/* ── Text panel ── */}
      <div className="flex flex-col justify-center px-6 pt-14 pb-3 md:px-10 lg:px-16 xl:px-20 md:pt-0 md:pb-0 relative text-wrap">
        <div className="flex items-center gap-3 mb-4 md:mb-7">
          <span className="text-[10px] font-mono text-[#00FF88] tracking-widest">
            {service.index}
          </span>
          <div className="w-6 h-px bg-[#00FF88]/60" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
            {service.category} · {service.label}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-display font-black italic uppercase  mb-2 md:mb-3 text-wrap">
          <AnimatedText text={service.title} startReveal={visible} delayOffset={0} color="#FFFFFF" />
        </h3>

     

        {/* Description: hidden on small screens to save vertical space */}
        <motion.p
          className="hidden sm:block text-neutral-400 text-sm font-light leading-[1.75] mb-5 md:mb-8 max-w-xs"
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
          transition={{ delay: 0.22, duration: 0.5, ease: cinematicEase }}
        >
          {service.description}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-1.5 md:gap-2"
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-[#00FF88]/80 border border-[#00FF88]/20 px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Visual panel ── */}
      <div className="relative flex items-center justify-center p-3 md:p-6 lg:p-10 flex-1 min-h-0">
        <div className="w-full h-full rounded-xl md:rounded-2xl border border-white/10 bg-[#0a0a0a] relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col group">
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />
          <div className="relative flex-1 w-full flex items-center justify-center z-10 overflow-hidden min-h-0">
            {service.visual(visible)}
          </div>
          <div className="border-t border-white/10 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between backdrop-blur-md bg-black/20 z-10 shrink-0 gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/10 rounded px-1.5 md:px-2 py-0.5 md:py-1 text-[8px] md:text-[9px] uppercase tracking-widest text-neutral-400 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
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

    </div>
  );
}

function DotNavigator({ trackRef }: { trackRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive] = React.useState(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const fn = () => setActive(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, [trackRef]);

  return (
    <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
      {SERVICES.map((_, i) => (
        <motion.button
          key={i}
          className="w-0.5 rounded-full"
          animate={{
            height: i === active ? 24 : 5,
            backgroundColor: i === active ? "#00FF88" : "#2a2a2a",
          }}
          transition={{ duration: 0.35, ease: cinematicEase }}
          onClick={() =>
            trackRef.current?.scrollTo({
              left: i * trackRef.current.clientWidth,
              behavior: "smooth",
            })
          }
        />
      ))}
    </div>
  );
}



export function MyServices({ isActive, trackRef, localP }: MyServicesProps) {
  return (
    <div className="absolute inset-0 bg-[#050505] overflow-hidden">
      {/*
        overflow-x-scroll handles native touch horizontal swipe.
        touch-pan-x tells the browser this element wants horizontal panning
        so it doesn't fight with our vertical touch listener.
      */}
      <div
        ref={trackRef}
        className="flex h-full overflow-x-scroll overflow-y-hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          touchAction: "pan-x", // ← key: browser handles horizontal, our listener handles vertical
        }}
      >
        {SERVICES.map((_, i) => (
          <div key={i} className="shrink-0 w-screen h-full">
            <ServiceCard cardIndex={i} trackRef={trackRef} />
          </div>
        ))}
      </div>

      <div className="absolute top-[5%] md:top-[10%] left-6 md:left-10 pointer-events-none z-10">
        <span className="text-[11px] md:text-[13px] uppercase font-mono tracking-[0.3em] text-[#00FF88] font-medium">
          What I Offer
        </span>
      </div>

      <DotNavigator trackRef={trackRef} />
    </div>
  );
}