"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import MakeItMatter from "../components/ui/TextAnimation";

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return (
    <main className="bg-black">
      <section className="h-screen flex items-center justify-center">
        <p className="text-white/20 text-xs tracking-[0.4em] font-mono uppercase">
          Scroll Down
        </p>
      </section>

      <MakeItMatter />

      <section className="h-screen bg-black flex items-center justify-center">
        <p className="text-white/20 text-xs tracking-[0.4em] font-mono uppercase">
          Next Section
        </p>
      </section>
    </main>
  );
}
