"use client";
import React, { useEffect, useRef, useMemo, ReactNode, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedText } from "./TextAnimation";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────
interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.25,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom center",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef?.current ? scrollContainerRef.current : window;

    // Use gsap.matchMedia so triggers are built with the correct
    // start points for the active breakpoint — and rebuilt on resize.
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 767px)",
        isDesktop: "(min-width: 768px)",
      },
      (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };

        const opacityStart  = isMobile ? "top 85%" : "top 50%";
        const blurStart     = isMobile ? "top 85%" : "top 65%";
        const opacityEnd    = isMobile ? "bottom 15%" : wordAnimationEnd;
        const blurEnd       = isMobile ? "bottom 15%" : wordAnimationEnd;

        gsap.fromTo(
          el,
          { transformOrigin: "0% 50%", rotate: baseRotation },
          {
            ease: "none",
            rotate: 0,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top bottom",
              end: rotationEnd,
              scrub: true,
            },
          }
        );

        const wordElements = el.querySelectorAll<HTMLElement>(".word");

        gsap.fromTo(
          wordElements,
          { opacity: baseOpacity, willChange: "opacity" },
          {
            ease: "none",
            opacity: 1,
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: opacityStart,
              end: opacityEnd,
              scrub: true,
            },
          }
        );

        if (enableBlur) {
          gsap.fromTo(
            wordElements,
            { filter: `blur(${blurStrength}px)` },
            {
              ease: "none",
              filter: "blur(0px)",
              stagger: 0.05,
              scrollTrigger: {
                trigger: el,
                scroller,
                start: blurStart,
                end: blurEnd,
                scrub: true,
              },
            }
          );
        }
      }
    );

    return () => mm.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p className={textClassName}>{splitText}</p>
    </h2>
  );
}

// ─────────────────────────────────────────────
// BIO SECTION
// ─────────────────────────────────────────────
export default function BioText() {
  const [startReveal, setStartReveal] = React.useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStartReveal(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        /* left col: sticky on desktop, static on mobile */
        .bio-left {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 0;
        }

        /* right col: large padding on desktop for scroll effect */
        .bio-right {
          padding-top: 45vh;
          padding-bottom: 45vh;
        }

        @media (max-width: 767px) {
          /* single column */
          .bio-grid {
            display: flex !important;
            flex-direction: column;
            gap: 2.5rem;
            padding-top: 5rem;
            padding-bottom: 5rem;
          }

          /* name block: normal flow */
          .bio-left {
            position: static;
            height: auto;
            padding: 0;
          }

          /* bio text: no giant vh padding on mobile */
          .bio-right {
            padding-top: 0;
            padding-bottom: 2rem;
          }
        }
      `}</style>

      <div
        className="bg-[#080808] text-white min-h-screen"
        style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
      >
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">

          {/* single grid — CSS handles mobile vs desktop layout */}
          <div className="bio-grid grid grid-cols-[1fr_1.15fr] gap-x-28 items-start">

            {/* ── LEFT: name ── */}
            <div className="bio-left">
              <p className="text-[0.55rem] tracking-[0.42em] uppercase text-[#444] font-mono mb-5 md:mb-6">
                This is me.
              </p>

              <h2 className="font-black italic uppercase leading-[0.88] tracking-[-0.03em]">
                <span className="block text-xl md:text-2xl font-light not-italic tracking-wide text-[#555] mb-2 md:mb-3">
                  <AnimatedText
                    text="Hi, I'm"
                    startReveal={startReveal}
                    color="#555"
                    delayOffset={0}
                  />
                </span>
                <span className="block text-[clamp(2.6rem,10vw,5.2rem)]">
                  <AnimatedText
                    text="Husnain"
                    startReveal={startReveal}
                    color="#ffffff"
                    delayOffset={0.3}
                  />
                  <AnimatedText
                    text="."
                    startReveal={startReveal}
                    color="#00FF88"
                    delayOffset={0.3 + "Husnain".length * 0.04}
                  />
                </span>
              </h2>

              <span className="inline-block mt-5 md:mt-6 text-[0.5rem] tracking-[0.38em] uppercase text-[#00FF88] font-mono border border-[#00FF8830] px-3 py-1 w-fit">
                Frontend Dev
              </span>
            </div>

            {/* ── RIGHT: bio ── */}
            <div className="bio-right flex flex-col gap-4">
              <div className="w-8 h-px bg-[#00FF88] opacity-40 mb-4" />

              <ScrollReveal
                baseOpacity={0.25}
                enableBlur={true}
                baseRotation={2}
                blurStrength={8}
                wordAnimationEnd="bottom center"
                rotationEnd="bottom center"
                textClassName="text-[clamp(1.15rem,2.8vw,1.85rem)] font-semibold leading-[1.6] text-white"
              >
                I'm a frontend developer dedicated to turning ideas into creative
                solutions. I specialize in creating seamless and intuitive user
                experiences.
              </ScrollReveal>

              <ScrollReveal
                baseOpacity={0.25}
                enableBlur={true}
                baseRotation={1.5}
                blurStrength={6}
                wordAnimationEnd="bottom center"
                rotationEnd="bottom center"
                textClassName="text-[clamp(0.95rem,1.8vw,1.25rem)] font-light leading-[1.9] text-[#777]"
              >
                My approach focuses on creating scalable, high-performing solutions
                tailored to both user needs and business objectives. By prioritizing
                performance, accessibility, and responsiveness, I strive to deliver
                experiences that not only engage users but also drive tangible
                results.
              </ScrollReveal>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}