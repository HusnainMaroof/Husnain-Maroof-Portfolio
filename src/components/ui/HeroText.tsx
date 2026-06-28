"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { AnimatedText } from "./TextAnimation";

// ─────────────────────────────────────────────
// WORD REVEAL
// One-shot stagger that fires when `revealed` flips true.
// Resets instantly when `revealed` flips false so re-entry replays cleanly.
// No GSAP, no ScrollTrigger, no scroll container ref needed.
// ─────────────────────────────────────────────

interface WordRevealProps {
  children: string;
  revealed: boolean;
  className?: string;
  /** Base delay before the first word starts (seconds) */
  startDelay?: number;
  /** Stagger between each word (seconds) */
  stagger?: number;
}

function WordReveal({
  children,
  revealed,
  className = "",
  startDelay = 0,
  stagger = 0.04,
}: WordRevealProps) {
  const words = useMemo(
    () => children.split(/(\s+)/).filter((w) => w.trim().length > 0),
    [children],
  );

  return (
    <p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.28em]"
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={
            revealed
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 10, filter: "blur(6px)" }
          }
          transition={
            revealed
              ? {
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: startDelay + i * stagger,
                }
              : { duration: 0 } // instant reset so re-entry replays
          }
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

// ─────────────────────────────────────────────
// BIO TEXT
// Purely presentational. Parent (HeroSection) owns all scroll logic
// and passes a single `revealed` boolean — flipped once on entry,
// once on exit. Zero scroll logic lives here.
// ─────────────────────────────────────────────

interface BioTextProps {
  revealed: boolean;
}

export default function BioText({ revealed }: BioTextProps) {
  // Name AnimatedText fires on mount — keep it always revealed
  // so the left panel name wipe plays when bio first appears.
  const [nameReveal, setNameReveal] = React.useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (revealed && !firedRef.current) {
      firedRef.current = true;
      setNameReveal(true);
    }
    // Reset when hidden so re-entry replays
    if (!revealed) {
      firedRef.current = false;
      setNameReveal(false);
    }
  }, [revealed]);

  return (
    <div className="w-full h-full text-white font-sans">
      <div className="max-w-275 mx-auto px-6 md:px-10 h-full flex items-center">
        {/*
          Mobile:  single column, centred
          Desktop: two-column — left sticky name panel, right bio paragraphs
        */}
        <div
          className="
            w-full
            flex flex-col gap-10
            md:grid md:grid-cols-[1fr_1.15fr] md:gap-x-28
            items-center md:items-start
          "
        >
          {/* ── LEFT: name panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={
              revealed
                ? { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }
                : { duration: 0 }
            }
          >
            <p className="text-[0.55rem] tracking-[0.42em] uppercase text-[#444] font-mono mb-5 md:mb-6">
              This is me.
            </p>

            <h2 className="font-black italic uppercase leading-[0.88] tracking-[-0.03em]">
              <span className="block text-xl md:text-2xl font-light not-italic tracking-wide text-[#555] mb-2 md:mb-3">
                <AnimatedText
                  text="Hi, I'm"
                  startReveal={nameReveal}
                  color="#555"
                  delayOffset={0}
                />
              </span>
              <span className="block text-[clamp(2.6rem,10vw,5.2rem)]">
                <AnimatedText
                  text="Husnain"
                  startReveal={nameReveal}
                  color="#ffffff"
                  delayOffset={0.3}
                />
                <AnimatedText
                  text="."
                  startReveal={nameReveal}
                  color="#00FF88"
                  delayOffset={0.3 + "Husnain".length * 0.04}
                />
              </span>
            </h2>

            <motion.span
              className="inline-block mt-5 md:mt-6 text-[0.5rem] tracking-[0.38em] uppercase text-[#00FF88] font-mono border border-[#00FF8830] px-3 py-1 w-fit"
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : { opacity: 0 }}
              transition={
                revealed ? { duration: 0.5, delay: 0.9 } : { duration: 0 }
              }
            >
              Frontend Dev
            </motion.span>
          </motion.div>

          {/* ── RIGHT: bio paragraphs ── */}
          <div className="flex flex-col gap-6">
            <motion.div
              className="w-8 h-px bg-[#00FF88] opacity-40"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                revealed
                  ? { scaleX: 1, opacity: 0.4 }
                  : { scaleX: 0, opacity: 0 }
              }
              style={{ transformOrigin: "left" }}
              transition={
                revealed ? { duration: 0.5, delay: 0.2 } : { duration: 0 }
              }
            />

            {/* Primary paragraph — starts immediately */}
            <WordReveal
              revealed={revealed}
              startDelay={0.3}
              stagger={0.045}
              className="text-[clamp(1.15rem,2.8vw,1.85rem)] font-semibold leading-[1.6] text-white"
            >
              I&apos;m a frontend developer dedicated to turning ideas into
              creative solutions. I specialize in creating seamless and
              intuitive user experiences.
            </WordReveal>

            {/* Secondary paragraph — starts after primary is mostly done */}
            <WordReveal
              revealed={revealed}
              startDelay={1.4}
              stagger={0.03}
              className="text-[clamp(0.95rem,1.8vw,1.25rem)] font-light leading-[1.9] text-[#777]"
            >
              My approach focuses on creating scalable, high-performing
              solutions tailored to both user needs and business objectives. By
              prioritizing performance, accessibility, and responsiveness, I
              strive to deliver experiences that not only engage users but also
              drive tangible results.
            </WordReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
