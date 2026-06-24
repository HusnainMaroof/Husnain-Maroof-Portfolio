"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatedText, ExitText } from "./TextAnimation";
import { PROJECTS } from "@/src/data/Projects.data";
import { WebGLImageTransition } from "@/src/types/Webglimagetransition";

type TextPhase = "idle" | "exiting" | "entering";

export function ProjectsSection({
  localP,
  range,
  seekTo,
}: {
  localP: React.MutableRefObject<number>;
  globalP: React.MutableRefObject<number>; // kept in signature for forward compat
  range: [number, number];
  seekTo: (p: number) => void;
}) {
  const [activeIndex,  setActiveIndex]  = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<TextPhase>("idle");

  // hasEntered: true once localP crosses 0 for the first time
  const hasEnteredRef = useRef(false);
  const [hasEntered, setHasEntered] = useState(false);

  // ── RAF: read localP, derive activeIndex ─────────────────────────────────
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const v = localP.current;

      // hasEntered gate
      if (!hasEnteredRef.current && v > 0.01) {
        hasEnteredRef.current = true;
        setHasEntered(true);
      }

      const idx = Math.min(
        PROJECTS.length - 1,
        Math.max(0, Math.floor(v * PROJECTS.length))
      );
      setActiveIndex((prev) => (prev === idx ? prev : idx));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [localP]);

  // ── Text phase: exit → swap displayIndex → enter ─────────────────────────
  useEffect(() => {
    if (activeIndex !== displayIndex && phase === "idle") {
      setPhase("exiting");
    }
  }, [activeIndex, displayIndex, phase]);

  function handleExitComplete() {
    setDisplayIndex(activeIndex);
    setPhase("entering");
  }

  function handleEnterComplete() {
    setPhase("idle");
  }

  // ── seekTo helper: map slide index → global progress → window.scrollTo ───
  function scrollToIndex(idx: number) {
    const target = Math.min(PROJECTS.length - 1, Math.max(0, idx));
    const [start, end] = range;
    const localTarget  = (target + 0.5) / PROJECTS.length;
    const globalTarget = start + localTarget * (end - start);
    seekTo(globalTarget);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  }

  const images         = PROJECTS.map((p) => p.imageUrl);
  const displayProject = PROJECTS[displayIndex];

  return (
    <section
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-roledescription="carousel"
      aria-label="Selected work"
      className="absolute inset-0 overflow-hidden bg-black font-mono text-white outline-none"
    >
      <WebGLImageTransition
        images={images}
        activeIndex={activeIndex}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none absolute inset-0 z-10 mix-blend-difference">
        <div className="flex h-full w-full flex-col justify-between p-6 md:p-12">
          {/* Header */}
          <header className="flex w-full items-start justify-between text-xs uppercase tracking-[0.25em]">
            <div>
              {hasEntered ? (
                <AnimatedText text="Selected Work" startReveal={true} color="#ffffff" />
              ) : (
                <span className="opacity-0">Selected Work</span>
              )}
            </div>
            <div className="tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(PROJECTS.length).padStart(2, "0")}
            </div>
          </header>

          {/* Main */}
          <main className="flex w-full flex-col items-start justify-end gap-10 md:flex-row md:items-end md:justify-between">
            <div className="overflow-hidden">
              <h2 className="text-5xl font-bold leading-[0.95] tracking-tighter md:text-8xl">
                {hasEntered ? (
                  phase === "exiting" ? (
                    <ExitText text={displayProject.name} onComplete={handleExitComplete} />
                  ) : (
                    <AnimatedText
                      key={displayProject.id}
                      text={displayProject.name}
                      startReveal={true}
                      color="#ffffff"
                      onComplete={handleEnterComplete}
                    />
                  )
                ) : (
                  <span className="opacity-0">{displayProject.name}</span>
                )}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.2em] text-white/70">
                <span>{displayProject.discipline}</span>
                <span className="opacity-50">/</span>
                {displayProject.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                <span className="opacity-50">/</span>
                <span>{displayProject.year}</span>
              </div>
            </div>

            <div className="flex items-end gap-8 md:gap-16">
              <nav className="pointer-events-auto hidden flex-col items-end gap-2 text-right text-sm uppercase tracking-[0.2em] md:flex">
                {PROJECTS.map((project, idx) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => scrollToIndex(idx)}
                    className="transition-opacity duration-300"
                    style={{
                      opacity:    idx === activeIndex ? 1 : 0.4,
                      fontWeight: idx === activeIndex ? 700 : 400,
                    }}
                  >
                    {project.name}
                  </button>
                ))}
              </nav>

              <div className="overflow-hidden">
                <div className="text-5xl font-medium leading-none tracking-tighter md:text-8xl">
                  {hasEntered ? (
                    phase === "exiting" ? (
                      <ExitText text={displayProject.index} />
                    ) : (
                      <AnimatedText
                        key={`${displayProject.id}-num`}
                        text={displayProject.index}
                        startReveal={true}
                        color="#ffffff"
                      />
                    )
                  ) : (
                    <span className="opacity-0">{displayProject.index}</span>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="pointer-events-auto flex items-center gap-2">
              {PROJECTS.map((project, idx) => (
                <button
                  key={project.id}
                  type="button"
                  aria-label={`Go to ${project.name}`}
                  onClick={() => scrollToIndex(idx)}
                  className="h-1 transition-all duration-300"
                  style={{
                    width:           idx === activeIndex ? "32px" : "14px",
                    backgroundColor: idx === activeIndex ? "#ffffff" : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="animate-pulse text-xs uppercase tracking-[0.25em] text-white/60 md:hidden">
                Swipe to explore
              </span>
              <span className="hidden animate-pulse text-xs uppercase tracking-[0.25em] text-white/60 md:inline">
                Scroll to explore
              </span>
              <div className="pointer-events-auto flex gap-4">
                <button
                  type="button"
                  aria-label="Previous project"
                  disabled={activeIndex === 0}
                  onClick={() => scrollToIndex(activeIndex - 1)}
                  className="text-sm transition-opacity duration-300 disabled:opacity-20"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next project"
                  disabled={activeIndex === PROJECTS.length - 1}
                  onClick={() => scrollToIndex(activeIndex + 1)}
                  className="text-sm transition-opacity duration-300 disabled:opacity-20"
                >
                  →
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}