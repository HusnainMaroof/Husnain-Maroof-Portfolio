"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Project } from "@/src/data/Projects.data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedText — character wipe reveal (Framer Motion)
// ─────────────────────────────────────────────────────────────────────────────

function EntryWipeCharacter({
  char,
  delay,
  startReveal,
  color = "#ffffff",
  onComplete,
}: {
  char: string;
  delay: number;
  startReveal: boolean;
  color?: string;
  onComplete?: () => void;
}) {
  const entryVariants = {
    hidden: {
      color: "rgba(0,0,0,0)",
      backgroundColor: "rgba(0,0,0,0)",
    },
    reveal: {
      color: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", color, color],
      backgroundColor: ["rgba(0,0,0,0)", "#404040", "#404040", "rgba(0,0,0,0)"],
      transition: { duration: 0.35, times: [0, 0.01, 0.99, 1], delay },
    },
  };
  return (
    <motion.span
      variants={entryVariants}
      initial="hidden"
      animate={startReveal ? "reveal" : "hidden"}
      onAnimationComplete={() => {
        if (startReveal) onComplete?.();
      }}
      className="inline-block whitespace-pre"
    >
      {char}
    </motion.span>
  );
}

function ExitWipeCharacter({
  char,
  delay,
  onComplete,
}: {
  char: string;
  delay: number;
  onComplete?: () => void;
}) {
  const exitVariants = {
    hidden: { color: "#ffffff", backgroundColor: "rgba(0,0,0,0)" },
    wiping: {
      color: ["#ffffff", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
      backgroundColor: ["rgba(0,0,0,0)", "#ffffff", "#ffffff", "rgba(0,0,0,0)"],
      transition: { duration: 0.35, times: [0, 0.01, 0.99, 1], delay },
    },
  };
  return (
    <motion.span
      variants={exitVariants}
      initial="hidden"
      animate="wiping"
      onAnimationComplete={() => onComplete?.()}
      className="inline-block"
    >
      {char}
    </motion.span>
  );
}

function AnimatedText({
  text,
  delayOffset = 0,
  startReveal,
  color = "#ffffff",
  onComplete,
}: {
  text: string;
  delayOffset?: number;
  startReveal: boolean;
  color?: string;
  onComplete?: () => void;
}) {
  const chars = text.split("");
  return (
    <span className="inline-flex overflow-hidden">
      {chars.map((char, i) => (
        <EntryWipeCharacter
          key={i}
          char={char === " " ? "\u00A0" : char}
          delay={delayOffset + i * 0.04}
          startReveal={startReveal}
          color={color}
          onComplete={i === chars.length - 1 ? onComplete : undefined}
        />
      ))}
    </span>
  );
}

function ExitText({
  text,
  delayOffset = 0,
  onComplete,
}: {
  text: string;
  delayOffset?: number;
  onComplete?: () => void;
}) {
  const chars = text.split("");
  return (
    <span className="inline-flex overflow-hidden">
      {chars.map((char, i) => (
        <ExitWipeCharacter
          key={i}
          char={char === " " ? "\u00A0" : char}
          delay={delayOffset + i * 0.03}
          onComplete={i === chars.length - 1 ? onComplete : undefined}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ImageSlot {
  id: string;
  w: string;
  h: string;
  x: number;
  y: number;
  s: number;
  r: number;
}

interface Props {
  project: Project;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scatter layout — Scene 1 positions.
// ─────────────────────────────────────────────────────────────────────────────

const SLOTS: ImageSlot[] = [
  { id: "hero", w: "26vw", h: "38vh", x: -25, y: -20, s: 0.9, r: -4 },
  { id: "s1", w: "20vw", h: "28vh", x: 20, y: -25, s: 1.1, r: 5 },
  { id: "s2", w: "24vw", h: "32vh", x: -22, y: 25, s: 0.8, r: -3 },
  { id: "s3", w: "28vw", h: "38vh", x: 25, y: 20, s: 1.0, r: 4 },
  { id: "s4", w: "22vw", h: "30vh", x: 65, y: -10, s: 1.2, r: -6 },
  { id: "s5", w: "30vw", h: "40vh", x: 105, y: 25, s: 0.9, r: 2 },
  { id: "s6", w: "18vw", h: "25vh", x: 140, y: -20, s: 1.1, r: 5 },
  { id: "s7", w: "26vw", h: "35vh", x: 185, y: 15, s: 0.85, r: -4 },
  { id: "s8", w: "22vw", h: "32vh", x: 225, y: -5, s: 1.05, r: 3 },
  { id: "final", w: "32vw", h: "45vh", x: 275, y: 10, s: 1.2, r: -2 },
];

// Deterministic organic stagger values — no Math.random() inside scrubbed timeline
const ORGANIC_STAGGER = [
  0.42, 0.18, 0.61, 0.07, 0.55, 0.33, 0.71, 0.24, 0.48, 0.39,
];

// Deterministic rotation drift for the horizontal parallax journey
const HORIZ_ROT = [4, -5, 3, -6, 5, -4, 6, -3, 5, 0];

// Deterministic rotation drift for Scene 3 stack
const STACK_ROT = [12, -18, 7, -24, 15, -8, 21, -14, 9, 0];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const ProjectDetail: FC<Props> = ({ project }) => {
  const router = useRouter();
  const { name, discipline, tags, year, accentColor, imageUrl, images } =
    project;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [revealEyebrow, setRevealEyebrow] = useState(false);
  const [revealTitle, setRevealTitle] = useState(false);
  const [revealMeta, setRevealMeta] = useState(false);
  const [revealCta, setRevealCta] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerImgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const finalBgRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const rafRef = useRef<number>(0);
  const lightboxBgRef = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Initial state: slot 0 fills the viewport, slots 1–9 hidden at centre ──
      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i === 0) {
          gsap.set(el, {
            width: "100vw",
            height: "100vh",
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 0,
            borderRadius: "0rem",
            zIndex: 10,
          });
        } else {
          gsap.set(el, {
            width: SLOTS[i].w,
            height: SLOTS[i].h,
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
            rotation: 0,
            borderRadius: "1rem",
            zIndex: 5,
          });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=1500%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1.5,
          onUpdate: (self) => {
            if (self.progress >= 0.73) setRevealEyebrow(true);
            if (self.progress >= 0.76) setRevealTitle(true);
            if (self.progress >= 0.8) setRevealMeta(true);
            if (self.progress >= 0.85) setRevealCta(true);
          },
        },
      });
      tlRef.current = tl;

      // ── Scene 1 (t=0–2): hero breaks apart, others fan out organically ───
      tl.to(heroOverlayRef.current, { opacity: 0, duration: 1 }, 0);
      tl.to(heroTextRef.current, { y: -100, opacity: 0, duration: 1 }, 0);

      tl.to(
        wrapperRefs.current[0],
        {
          width: SLOTS[0].w,
          height: SLOTS[0].h,
          borderRadius: "1rem",
          x: `${SLOTS[0].x}vw`,
          y: `${SLOTS[0].y}vh`,
          rotation: SLOTS[0].r,
          duration: 2,
          ease: "power3.inOut",
        },
        0,
      );

      SLOTS.forEach((slot, i) => {
        if (i === 0) return;
        tl.to(
          wrapperRefs.current[i],
          {
            opacity: 1,
            scale: slot.s,
            x: `${slot.x}vw`,
            y: `${slot.y}vh`,
            rotation: slot.r,
            duration: 2,
            ease: "power3.inOut",
          },
          0.2 + ORGANIC_STAGGER[i] * 0.5,
        );
      });

      // ── Scene 2 (t=2.5–7.5): horizontal parallax journey ────────────────
      // Each image travels a different distance based on its scale, creating depth.
      // The final image (slot 9) travels exactly -275vw to land dead-center.
      SLOTS.forEach((_, i) => {
        const travel = i === 9 ? -275 : -275 * (SLOTS[i].s * 0.9);
        tl.to(
          wrapperRefs.current[i],
          {
            x: `+=${travel}vw`,
            rotation: `+=${HORIZ_ROT[i]}`,
            duration: 5,
            ease: "power1.inOut",
          },
          2.5,
        );
      });

      // ── Scene 3 (t=7.5–9.5): stack at centre — slot 9 leads, others pile ─
      tl.set(wrapperRefs.current[9], { zIndex: 50 }, 7.5);

      // Slot 9 comes to centre cleanly — it's the hero
      tl.to(
        wrapperRefs.current[9],
        {
          x: "0vw",
          y: "0vh",
          rotation: 0,
          scale: 1,
          duration: 2,
          ease: "power3.inOut",
        },
        7.5,
      );

      // Others collapse behind it with chaotic rotation — depth effect
      SLOTS.forEach((_, i) => {
        if (i === 9) return;
        tl.to(
          wrapperRefs.current[i],
          {
            x: "0vw",
            y: "0vh",
            rotation: STACK_ROT[i],
            scale: 0.7,
            opacity: 0.3,
            duration: 2,
            ease: "power3.inOut",
          },
          7.5,
        );
      });

      // ── Scene 4 (t=9.5–11.5): others vanish, slot 9 fills the viewport ───
      const others = wrapperRefs.current.filter((_, i) => i !== 9);
      tl.to(
        others,
        {
          opacity: 0,
          scale: 0.4,
          duration: 1.5,
          ease: "power2.inOut",
        },
        9.5,
      );

      tl.to(
        wrapperRefs.current[9],
        {
          width: "100vw",
          height: "100vh",
          scale: 1,
          rotation: 0,
          borderRadius: "0rem",
          duration: 2,
          ease: "power4.inOut",
        },
        9.5,
      );

      // ── Scene 5 (t=11+): overlay + AnimatedText fires via onUpdate above ──
      tl.to(finalBgRef.current, { opacity: 1, duration: 1 }, 11);

      tl.fromTo(
        ctaRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
        11.5,
      );
    }, rootRef);

    // ── Living gallery rAF: proximity brightness on image inner elements ────
    // Effect fully active during Scenes 1–2, fades out entering Scene 3 (progress > 0.50)
    const tick = () => {
      const cx = window.innerWidth / 2;
      const progress = tlRef.current?.progress() ?? 0;

      const gate = progress < 0.5 ? 1 : Math.max(0, 1 - (progress - 0.5) * 10);

      innerImgRefs.current.forEach((img, i) => {
        if (!img) return;
        const el = wrapperRefs.current[i];
        if (!el) return;
        const { left, width } = el.getBoundingClientRect();
        const slotCx = left + width / 2;
        const dist = Math.abs(cx - slotCx);
        const maxDist = window.innerWidth * 0.4;
        const prox = Math.max(0, 1 - dist / maxDist) * gate;
        gsap.set(img, {
          scale: 1 + prox * 0.15,
          filter: `brightness(${0.4 + prox * 0.6})`,
        });
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      ctx.revert();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Lightbox ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (lightboxOpen && lightboxImage) {
      document.body.style.overflow = "hidden";
      gsap.to(lightboxBgRef.current, { opacity: 1, duration: 0.35 });
      gsap.fromTo(
        lightboxImgRef.current,
        { opacity: 0, scale: 0.85, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
      );
    } else {
      document.body.style.overflow = "";
    }
  }, [lightboxOpen, lightboxImage]);

  const closeLightbox = useCallback(() => {
    gsap.to(lightboxBgRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(lightboxImgRef.current, {
      opacity: 0,
      scale: 0.9,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setLightboxOpen(false);
        setLightboxImage(null);
      },
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        ref={rootRef}
        className="bg-[#080808] text-white antialiased selection:bg-white selection:text-black overflow-x-hidden"
      >
        {/* ── CONTINUOUS JOURNEY SECTION (Pinned) ─────────────────────────── */}
        <div
          ref={pinRef}
          className="relative h-screen w-full bg-zinc-950 overflow-hidden"
        >
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 z-[200] flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200 inline-block">
              ←
            </span>
            Back
          </button>

          {/* 10 image slots */}
          {SLOTS.map((slot, i) => (
            <div
              key={slot.id}
              ref={(el) => {
                wrapperRefs.current[i] = el;
              }}
              onClick={() => {
                setLightboxImage(images[i] ?? imageUrl);
                setLightboxOpen(true);
              }}
              className="group absolute left-1/2 top-1/2 overflow-hidden shadow-2xl will-change-transform bg-zinc-800 cursor-pointer"
            >
              <img
                ref={(el) => {
                  innerImgRefs.current[i] = el;
                }}
                src={images[i] ?? imageUrl}
                alt={`${name} · ${i + 1}`}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover scale-[1.05] will-change-transform origin-center select-none"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                <span className="text-white text-[10px] tracking-[0.2em] font-semibold border border-white/30 bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-md scale-95 group-hover:scale-100 transition-transform duration-300">
                  ENLARGE
                </span>
              </div>

              {i === 9 && (
                <div
                  ref={finalBgRef}
                  className="absolute inset-0 opacity-0 pointer-events-none z-30"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%)",
                  }}
                />
              )}
            </div>
          ))}

          {/* Hero overlay */}
          <div
            ref={heroOverlayRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%, rgba(0,0,0,0.25) 100%)",
            }}
          />

          {/* Hero text */}
          <div
            ref={heroTextRef}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-30"
          >
            <span
              className="inline-block text-[9px] font-bold tracking-[0.45em] uppercase px-4 py-1.5 rounded-full mb-5"
              style={{
                backgroundColor: `${accentColor}1A`,
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              {discipline}
            </span>

            <h1
              className="text-[clamp(3.5rem,10vw,9rem)] font-black tracking-[-0.04em] leading-[0.85] text-white"
              style={{ mixBlendMode: "overlay" }}
            >
              {name.toUpperCase()}
            </h1>

            <div className="absolute bottom-8 flex flex-col items-center gap-3">
              <span className="text-[9px] tracking-[0.35em] text-white/40 uppercase">
                Scroll to explore
              </span>
              <div
                className="w-px h-14"
                style={{
                  background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
                }}
              />
            </div>
          </div>

          {/* Scene 5: Final detail overlay */}
          <div className="absolute inset-0 flex items-center px-8 md:px-16 z-50 pointer-events-none">
            <div className="max-w-2xl w-full">
              <div className="flex items-center gap-4 mb-7">
                <span
                  className="block h-px w-10 flex-shrink-0 transition-opacity duration-300"
                  style={{
                    backgroundColor: accentColor,
                    opacity: revealEyebrow ? 1 : 0,
                  }}
                />
                <span
                  className="text-[9px] font-bold tracking-[0.4em] uppercase"
                  style={{ color: accentColor }}
                >
                  <AnimatedText
                    text={discipline}
                    startReveal={revealEyebrow}
                    color={accentColor}
                    delayOffset={0.1}
                  />
                </span>
              </div>

              <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-[-0.03em] leading-[0.9] mb-5">
                <AnimatedText
                  text={name}
                  startReveal={revealTitle}
                  color="#ffffff"
                  delayOffset={0}
                />
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 mb-9">
                {revealMeta && (
                  <>
                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="text-white/40 text-xs font-mono"
                    >
                      {year}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-white/20 text-xs"
                    >
                      ·
                    </motion.span>
                    {tags.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.15 + i * 0.08,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                        style={{
                          border: `1px solid ${accentColor}40`,
                          color: accentColor,
                          backgroundColor: `${accentColor}0D`,
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </>
                )}
              </div>

              <div
                ref={ctaRef}
                className="flex flex-wrap gap-4 items-center pointer-events-auto opacity-0"
              >
                <button
                  className="px-8 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-80 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: accentColor, color: "#000" }}
                >
                  Explore project
                </button>
                <button className="group flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors">
                  View source
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── EXIT SECTION ─────────────────────────────────────────────────── */}
        <section className="relative h-screen w-full bg-zinc-100 text-zinc-950 flex flex-col items-center justify-center px-4 text-center z-10">
          <h3 className="text-sm font-bold tracking-[0.4em] text-zinc-500 mb-8 uppercase">
            End of Sequence
          </h3>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Ready for the next scene?
          </h2>
          <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mb-12 font-light">
            Let's apply this level of motion and interaction design to your
            brand.
          </p>
          <button className="px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-colors transform hover:scale-105 active:scale-95 duration-200 shadow-xl">
            Start a Project
          </button>
        </section>
      </div>

      {/* Lightbox */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center ${
          lightboxOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          ref={lightboxBgRef}
          onClick={closeLightbox}
          className="absolute inset-0 bg-black/90 opacity-0 backdrop-blur-sm cursor-pointer"
        />

        {lightboxOpen && lightboxImage && (
          <div
            ref={lightboxImgRef}
            className="relative z-10 w-full max-w-6xl px-4 md:px-12 flex flex-col items-center opacity-0"
          >
            <button
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="absolute -top-10 right-4 md:right-12 text-white/40 hover:text-white transition-colors"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <img
              src={lightboxImage}
              alt={`${name} — full view`}
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDetail;
