"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Navbar } from "./ui/NavBar";
import { HeroSection } from "./ui/MainHeroSection";
import { WMDSection } from "./ui/Wmdsection";

// --- GLOBAL CONSTANTS ---
const scrollWords = ["They", "are", "felt."];

export default function HomeScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  // We use a mutable ref for the canvas to read performantly without triggering React renders
  const heroScrollRef = useRef(0);
  const [uiOpacity, setUiOpacity] = useState(1);

  // Highly robust native scroll tracking to prevent dynamic height recalculation bugs
  useEffect(() => {
    if (!isLoaded) {
      heroScrollRef.current = 0;
      setUiOpacity(1);
      return;
    }

    const handleScroll = () => {
      if (!heroContainerRef.current) return;

      const rect = heroContainerRef.current.getBoundingClientRect();
      // Total amount of scrollable pixels for this specific pinned section
      const totalScrollable = rect.height - window.innerHeight;

      // rect.top goes negative as we scroll down.
      const currentScroll = -rect.top;

      // Calculate progress between 0 and 1
      let progress = currentScroll / totalScrollable;
      progress = Math.max(0, Math.min(1, progress));

      // Inject into the canvas instantly
      heroScrollRef.current = progress;

      // Fade out the UI text quickly (between 0% and 15% of the scroll)
      setUiOpacity(Math.max(0, 1 - progress / 0.15));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Fire once initially to sync state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isLoaded]);

  return (
    <main
      className={`relative w-full  font-sans antialiased text-white hide-scrollbar ${
        !isLoaded ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* 1. The Fixed Navigation (Fades in when loaded) */}
      <Navbar isVisible={isLoaded} />

      {/* 2. The Cinematic Hero & Loader */}
      <div
        ref={heroContainerRef}
        className={`relative w-full ${isLoaded ? "h-[300vh]" : "h-screen"}`}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden ">
          <HeroSection
            onComplete={() => setIsLoaded(true)}
            isLoaded={isLoaded}
            scrollRef={heroScrollRef}
            uiOpacity={uiOpacity}
          />
        </div>
      </div>

      <WMDSection />

      {isLoaded && (
        <motion.div
          className="fixed bottom-6 right-10 text-xs text-[#00FF88] font-tech uppercase tracking-widest animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          Scroll Down ↓
        </motion.div>
      )}
    </main>
  );
}
