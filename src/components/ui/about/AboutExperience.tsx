"use client";

import React from "react";

const EXPERIENCES = [
  {
    role: "Lead Designer",
    company: "Triadlight",
    period: "2022 — 2024",
    tags: ["Visual Strategy", "New Frontier", "Brand Direction"],
    description:
      "Drove the visual identity that landed Triadlight in Enterprise Ireland's New Frontier programme.",
  },
  {
    role: "Independent Designer",
    company: "Self-directed",
    period: "2024 — Present",
    tags: ["Startups", "Founders", "End-to-end"],
    description:
      "Partnering with founders to bridge the gap between raw idea and refined visual reality.",
  },
];

interface Props {
  readProgress: number;
}

export default function AboutExperienceOverlay({ readProgress }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 68% 58% at 50% 50%, rgba(5,5,5,0.15) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[780px] px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-[22px] h-px bg-[#00FF88]" />
          <span className="text-[9px] tracking-[0.4em] uppercase text-[#00FF88] font-mono font-semibold">
            Experience
          </span>
        </div>

        {/* Experience entries */}
        <div className="flex flex-col gap-7">
          {EXPERIENCES.map((exp, i) => {
            const entryProgress = Math.min(
              1,
              Math.max(0, (readProgress - 0.2 - i * 0.3) * 2.5),
            );

            return (
              <div
                key={i}
                className="flex flex-row items-start gap-6 pb-6"
                style={{
                  opacity: entryProgress,
                  transform: `translateY(${(1 - entryProgress) * 16}px)`,
                  borderBottom:
                    i < EXPERIENCES.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                }}
              >
                {/* Period */}
                <div className="flex-shrink-0 w-[90px] text-[9px] tracking-[0.22em] uppercase text-white/30 font-mono pt-1">
                  {exp.period}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-[10px] mb-1.5 flex-wrap">
                    <span
                      className="font-extrabold text-white leading-none tracking-[-0.03em]"
                      style={{ fontSize: "clamp(22px, 3vw, 36px)" }}
                    >
                      {exp.role}
                    </span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#00FF88] font-mono">
                      @ {exp.company}
                    </span>
                  </div>

                  <p className="text-[13px] text-white/40 leading-[1.7] font-light mb-3 max-w-[460px]">
                    {exp.description}
                  </p>

                  <div className="flex gap-[7px] flex-wrap">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] tracking-[0.28em] uppercase text-[#00FF88]/55 font-mono border border-[#00FF88]/15 px-[9px] py-[3px] rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}