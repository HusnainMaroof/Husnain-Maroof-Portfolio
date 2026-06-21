"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Navbar } from "./ui/NavBar";
import { HeroSection } from "./ui/MainHeroSection";
import { MyServices } from "./ui/Myservices";
import { Footer } from "./ui/Footer";
import { ProjectsSection } from "./ui/ProjectsSection";

export default function HomeScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Hero scroll tracking
  const heroScrollRef = useRef(0);
  const [uiOpacity, setUiOpacity] = useState(1);

  // Hero scroll tracking
  useEffect(() => {
    if (!isLoaded) {
      heroScrollRef.current = 0;
      setUiOpacity(1);
      return;
    }

    const handleScroll = () => {
      if (!heroContainerRef.current) return;
      const rect = heroContainerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      const currentScroll = -rect.top;
      let progress = currentScroll / totalScrollable;
      progress = Math.max(0, Math.min(1, progress));
      heroScrollRef.current = progress;
      setUiOpacity(Math.max(0, 1 - progress / 0.15));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isLoaded]);

  return (
    <main
      ref={mainRef}
      className={`relative w-full font-sans antialiased text-white hide-scrollbar  ${
        !isLoaded ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* 1. Navigation */}
      <Navbar isVisible={isLoaded} />

      {/* 2. Hero Section */}
      <div
        ref={heroContainerRef}
        className={`relative w-full ${isLoaded ? "h-[400vh] " : "h-screen"} `}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <HeroSection
            onComplete={() => setIsLoaded(true)}
            isLoaded={isLoaded}
            scrollRef={heroScrollRef}
            uiOpacity={uiOpacity}
          />
        </div>
      </div>

      {/* 3. My Services Section */}
      <MyServices />
      <ProjectsSection />

      {/* 4. Footer */}
      <Footer />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GLOBAL PROGRESS BAR — Only mounts after isLoaded           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isLoaded && <ProgressBarContainer key="progress-bar" />}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SCROLL DOWN INDICATOR — Animates out when scrolled         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isLoaded && (
        <motion.div
          className="fixed bottom-10 right-10 text-xs text-[#00FF88] font-mono uppercase tracking-widest z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mr-1"
          >
            ↓
          </motion.span>
          Scroll Down
        </motion.div>
      )}
    </main>
  );
}

// Separate component — mounts only when isLoaded is true
// This ensures useScroll reads correct document height
function ProgressBarContainer() {
  const { scrollYProgress } = useScroll();

  const barWidth = useTransform<number, string>(
    scrollYProgress,
    [0, 1],
    ["0%", "100%"],
  );

  const percentageOpacity = useTransform<number, number>(
    scrollYProgress,
    [0, 0.99, 1],
    [1, 1, 0],
  );

  const percentageText = useTransform<number, string>(
    scrollYProgress,
    (v) => `${Math.round(v * 100)}%`,
  );

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Progress track */}
      <div className="w-full h-0.5 bg-white/5 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#00FF88]"
          style={{ width: barWidth }}
        />
      </div>

      {/* Percentage */}
      <motion.div
        className="absolute bottom-4 right-6 text-[9px] font-mono uppercase tracking-widest text-[#00FF88]"
        style={{ opacity: percentageOpacity }}
      >
        {percentageText}
      </motion.div>
    </motion.div>
  );
}
