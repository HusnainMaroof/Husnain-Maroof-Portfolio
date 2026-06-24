"use client";

import React from "react";

const BIO_LINES = [
  "Based in Dublin, focused on",
  "Art Direction and Branding.",
  "As the former Lead Designer for Triadlight,",
  "I drove the visual strategy that earned",
  "us a spot in the New Frontier programme.",
  "Currently, as an Independent Designer,",
  "I partner with founders and startups,",
  "bridging the gap between idea and reality.",
];

interface Props {
  readProgress: number;
}

export default function AboutBioOverlay({ readProgress }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(5,5,5,0.25) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-[600px] w-full px-6 text-center">
        {/* Section label */}
        <div
          className="text-[9px] tracking-[0.5em] uppercase font-mono font-semibold mb-5 text-[#00FF88]"
          style={{ textShadow: "0 0 10px rgba(0,255,136,0.5)" }}
        >
          Who am I.
        </div>

        {/* Bio lines — read effect stays white, only opacity shifts */}
        <div className="flex flex-col gap-[2px]">
          {BIO_LINES.map((line, i) => {
            const lineProgress = i / (BIO_LINES.length - 1);
            const range = 1 / (BIO_LINES.length - 1);
            const dist = Math.abs(readProgress - lineProgress);

            const lineOpacity =
              dist < range * 0.6
                ? 1
                : dist < range * 1.5
                ? Math.max(0.08, 1 - (dist - range * 0.6) / (range * 0.9))
                : 0.08;

            const isActive = dist < range * 0.6;

            return (
              <span
                key={i}
                className="block font-bold leading-[1.35] tracking-[-0.02em] transition-colors duration-100"
                style={{
                  fontSize: "clamp(18px, 2.4vw, 30px)",
                  opacity: lineOpacity,
                  color: "#ffffff",
                  textShadow: isActive
                    ? "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.3)"
                    : "none",
                }}
              >
                {line}
              </span>
            );
          })}
        </div>

        <div className="mx-auto mt-6 h-px w-8 opacity-50 bg-[#00FF88]" />
      </div>
    </div>
  );
}