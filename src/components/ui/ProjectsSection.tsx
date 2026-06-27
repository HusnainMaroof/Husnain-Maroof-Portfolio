"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  globalP: React.MutableRefObject<number>;
  range: [number, number];
  seekTo: (p: number) => void;
}) {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<TextPhase>("idle");

  const hasEnteredRef = useRef(false);
  const [hasEntered, setHasEntered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Physics cursor refs
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const cursorXRef = useRef(0);
  const cursorYRef = useRef(0);
  const rotationRef = useRef(0);
  const cursorRafRef = useRef<number | null>(null);

  // ── RAF: localP → activeIndex ────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const v = localP.current;
      if (!hasEnteredRef.current && v > 0.01) {
        hasEnteredRef.current = true;
        setHasEntered(true);
      }
      const idx = Math.min(
        PROJECTS.length - 1,
        Math.max(0, Math.floor(v * PROJECTS.length)),
      );
      setActiveIndex((prev) => (prev === idx ? prev : idx));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [localP]);

  // ── Text phase machine ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeIndex !== displayIndex && phase === "idle") setPhase("exiting");
  }, [activeIndex, displayIndex, phase]);

  function handleExitComplete() {
    setDisplayIndex(activeIndex);
    setPhase("entering");
  }
  function handleEnterComplete() {
    setPhase("idle");
  }

  // ── Physics cursor ───────────────────────────────────────────────────────
  useEffect(() => {
    const cursor = cursorRef.current;
    const section = sectionRef.current;
    if (!cursor || !section) return;

    mouseXRef.current = window.innerWidth / 2;
    mouseYRef.current = window.innerHeight / 2;
    cursorXRef.current = mouseXRef.current;
    cursorYRef.current = mouseYRef.current;

    const onMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const renderCursor = () => {
      const dx = mouseXRef.current - cursorXRef.current;
      const dy = mouseYRef.current - cursorYRef.current;
      cursorXRef.current += dx * 0.15;
      cursorYRef.current += dy * 0.15;
      const targetRotation = Math.max(-30, Math.min(30, dx * 0.8));
      rotationRef.current += (targetRotation - rotationRef.current) * 0.15;
      cursor.style.transform = `translate(${cursorXRef.current}px, ${cursorYRef.current}px) translate(-50%, -50%) rotate(${rotationRef.current}deg)`;
      cursorRafRef.current = requestAnimationFrame(renderCursor);
    };
    renderCursor();

    const onEnter = () => {
      cursor.style.opacity = "1";
    };
    const onLeave = () => {
      cursor.style.opacity = "0";
    };
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current);
    };
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────
  function openProject() {
    const slug = PROJECTS[activeIndex]?.slug;
    if (!slug) return;
    router.push(`/work/${slug}`);
  }

  // ── seekTo helper ────────────────────────────────────────────────────────
  function scrollToIndex(idx: number) {
    const target = Math.min(PROJECTS.length - 1, Math.max(0, idx));
    const [start, end] = range;
    const localTarget = (target + 0.5) / PROJECTS.length;
    const globalTarget = start + localTarget * (end - start);
    seekTo(globalTarget);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProject();
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  }

  const images = PROJECTS.map((p) => p.imageUrl);
  const displayProject = PROJECTS[displayIndex];

  return (
    <>
      {/* Physics cursor — fixed, never clipped by section overflow:hidden */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-9999 hidden items-center justify-center md:flex bg-[#050505]"
        style={{
          opacity: 0,
          transition: "opacity 0.25s ease",
          padding: "8px 18px",
          borderRadius: "8px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.30)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
          willChange: "transform",
        }}
      >
        <span className="select-none whitespace-nowrap  text-[12px] tracking-wider font-semibold uppercase font-display  text-white ">
          Open Project
        </span>
      </div>

      {/* Main card */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
        <section
          ref={sectionRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-roledescription="carousel"
          aria-label="Projects"
          className="relative font-mono text-white outline-none"
          style={{
            width: "90vw",
            height: "90vh",
            borderRadius: "20px",
            overflow: "hidden",
            cursor: "none",
            isolation: "isolate",
          }}
        >
          {/* Clickable WebGL layer — triggers navigation */}
          <button
            type="button"
            aria-label={`Open ${displayProject.name}`}
            onClick={openProject}
            className="absolute inset-0 z-6 h-full w-full cursor-none border-0 bg-transparent p-0"
          />

          {/* WebGL background */}
          <WebGLImageTransition
            images={images}
            activeIndex={activeIndex}
            className="absolute inset-0 z-0"
          />

          {/* Gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-5"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.08) 100%)",
            }}
          />

          {/* UI layer — above the click target so dots/nav still work */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="flex h-full w-full flex-col justify-between p-5 md:p-10">
              <div />

              {/* Main */}
              <main className="flex w-full flex-col items-start justify-end gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[72vw] overflow-hidden md:max-w-none">
                  <h2 className="text-4xl font-bold leading-[0.95] tracking-tighter md:text-7xl lg:text-8xl">
                    {hasEntered ? (
                      phase === "exiting" ? (
                        <ExitText
                          text={displayProject.name}
                          onComplete={handleExitComplete}
                        />
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

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-white/70 md:text-xs">
                    <span>{displayProject.discipline}</span>
                    <span className="opacity-40">/</span>
                    {displayProject.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                    <span className="opacity-40">/</span>
                    <span>{displayProject.year}</span>
                  </div>
                </div>

                <div className="flex items-end gap-8 md:gap-14">
                  {/* Desktop project list nav */}
                  <nav className="pointer-events-auto hidden flex-col items-end gap-2 text-right text-sm uppercase tracking-[0.2em] md:flex">
                    {PROJECTS.map((project, idx) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => scrollToIndex(idx)}
                        className="transition-opacity duration-300"
                        style={{
                          opacity: idx === activeIndex ? 1 : 0.4,
                          fontWeight: idx === activeIndex ? 700 : 400,
                        }}
                      >
                        {project.name}
                      </button>
                    ))}
                  </nav>

                  {/* Large index number */}
                  <div className="overflow-hidden">
                    <div className="text-4xl font-medium leading-none tracking-tighter md:text-7xl lg:text-8xl">
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
                        <span className="opacity-0">
                          {displayProject.index}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </main>

              {/* Footer */}
              <footer className="flex w-full items-center justify-between">
                {/* Progress dots */}
                <div className="pointer-events-auto flex items-center gap-2">
                  {PROJECTS.map((project, idx) => (
                    <button
                      key={project.id}
                      type="button"
                      aria-label={`Go to ${project.name}`}
                      onClick={() => scrollToIndex(idx)}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: idx === activeIndex ? "28px" : "12px",
                        backgroundColor:
                          idx === activeIndex
                            ? "#ffffff"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                  ))}
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
