"use client";
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { AnimatedText } from "./TextAnimation"; // Adjust path as needed

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-10%" });

  // Track when text should start revealing
  const [revealed, setRevealed] = useState(false);

  // Trigger reveal when footer comes into view
  React.useEffect(() => {
    if (isInView && !revealed) {
      setRevealed(true);
    }
  }, [isInView, revealed]);

  return (
    <footer
      ref={footerRef}
      className="relative w-full min-h-screen bg-[#050505] flex flex-col justify-between px-6 md:px-12 lg:px-20 py-20 overflow-hidden"
    >
      {/* ── Top: Availability Badge ── */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF88]" />
        </span>
        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#00FF88] font-medium font-mono">
          Available for new projects
        </span>
      </motion.div>

      {/* ── Center: Left + Right split ── */}
      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-16">
        {/* LEFT: Big CTA with AnimatedText wipe */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
          transition={{ duration: 0.8, delay: 0.3, ease: cinematicEase }}
        >
          <a
            href="mailto:husnain.maroof@example.com"
            className="group block cursor-alias "
          >
            <h2 className="text-[clamp(4rem,15vw,12rem)] font-display font-black uppercase leading-[0.85] tracking-tighter text-white transition-colors duration-500 group-hover:text-[#00FF88]">
              <span className="block">
                <AnimatedText
                  text="LET'S"
                  startReveal={revealed}
                  delayOffset={0.3}
                  color="#FFFFFF"
                />
              </span>
              <span className="block">
                <AnimatedText
                  text="TALK"
                  startReveal={revealed}
                  delayOffset={0.5}
                  color="#00FF88"
                />
              </span>
            </h2>
          </a>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="hidden md:block w-px h-40 bg-[#00FF88]/30"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={
            isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }
          }
          transition={{ duration: 0.6, delay: 0.5, ease: cinematicEase }}
          style={{ transformOrigin: "bottom" }}
        />

        {/* RIGHT: Animated Text + Description with AnimatedText wipe */}
        <motion.div
          className="flex-1 max-w-md md:text-right"
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
          transition={{ duration: 0.8, delay: 0.4, ease: cinematicEase }}
        >
          {/* Animated text - right aligned */}
          <motion.p
            className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Ready When You Are
          </motion.p>

          <div className="text-3xl sm:text-4xl md:text-5xl font-display font-black italic uppercase leading-[0.88] tracking-wide md:text-right">
            <span className="block text-white">
              <AnimatedText
                text="LET'S BUILD"
                startReveal={revealed}
                delayOffset={0.7}
                color="#FFFFFF"
              />
            </span>
            <span className="block mt-1 text-white">
              <AnimatedText
                text="SOMETHING"
                startReveal={revealed}
                delayOffset={0.9}
                color="#FFFFFF"
              />
            </span>
            <span className="block mt-1 text-[#00FF88]">
              <AnimatedText
                text="AWESOME."
                startReveal={revealed}
                delayOffset={1.1}
                color="#00FF88"
              />
            </span>
          </div>

          <motion.div
            className="w-12 h-px bg-[#00FF88] md:ml-auto mt-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={
              isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
            }
            transition={{ delay: 1.8, duration: 0.5, ease: cinematicEase }}
            style={{ transformOrigin: "right" }}
          />

          <motion.p
            className="text-white/60 text-sm font-light mt-6 leading-[1.75] tracking-wide"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.0, duration: 0.6 }}
          >
            Have a project in mind? Let's turn your vision into reality.
          </motion.p>
        </motion.div>
      </div>

      {/* ── Bottom: Info Row ── */}
      <motion.div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 pt-6 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-mono">
          Husnain Maroof © 2026
        </span>
        <div className="flex items-center  gap-6 md:gap-10">
          <a
            href="https://github.com/husnainmaroof"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-mono hover:text-[#00FF88] transition-colors duration-300"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/husnainmaroof"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-mono hover:text-[#00FF88] transition-colors duration-300"
          >
            LinkedIn
          </a>

          <a
            href="https://linkedin.com/in/husnainmaroof"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-mono hover:text-[#00FF88] transition-colors duration-300"
          >
            Resume
          </a>
        </div>
        {/* <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-[#00FF88] font-mono hover:text-white transition-colors duration-300 group"
        >
          <motion.span
            className="inline-block"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            ↑
          </motion.span>
          Back to top
        </button> */}
      </motion.div>
    </footer>
  );
}
