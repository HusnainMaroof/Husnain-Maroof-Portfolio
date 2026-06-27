"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Layers, Database, Terminal, Cpu } from "lucide-react";

interface StarConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulse: boolean;
  duration: number;
}
interface StackItem {
  name: string;
  component: React.FC;
  color: string;
}
interface StackCategory {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  items: StackItem[];
}

// ─── Star Field ───────────────────────────────────────────────────────────────

const StarField: React.FC = () => {
  const [stars, setStars] = useState<StarConfig[]>([]);
  useEffect(() => {
    setStars(
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.35 + 0.08,
        pulse: Math.random() > 0.78,
        duration: Math.random() * 4 + 2,
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
          animate={
            s.pulse ? { opacity: [s.opacity, s.opacity * 0.1, s.opacity] } : {}
          }
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute left-1/4 top-1/3 h-125 w-125 rounded-full bg-[#00FF88]/0.5 blur-[130px]" />
      <div className="absolute bottom-1/4 right-1/3 h-87.5 w-87.5 rounded-full bg-[#00FF88]/0.5 blur-[150px]" />
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icons: Record<string, React.FC> = {
  JavaScript: () => (
    <svg className="h-6 w-6 rounded-sm" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#F7DF1E" />
      <text
        x="3.5"
        y="18.5"
        fontSize="11"
        fontWeight="bold"
        fontFamily="monospace"
        fill="#000"
      >
        JS
      </text>
    </svg>
  ),
  TypeScript: () => (
    <svg className="h-6 w-6 rounded-sm" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#3178C6" />
      <text
        x="3"
        y="18.5"
        fontSize="11"
        fontWeight="bold"
        fontFamily="monospace"
        fill="#fff"
      >
        TS
      </text>
    </svg>
  ),
  React: () => (
    <svg className="h-6 w-6" viewBox="-11.5 -10.23174 23 20.46348">
      <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
      <g stroke="#61dafb" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  NextJs: () => (
    <svg
      className="h-6 w-6 rounded-full border border-white/20 bg-black p-0.5"
      viewBox="0 0 128 128"
    >
      <path
        d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm29.8 95.8L51.3 43.1V95H40V33h11.4l37.8 48.7V33h11.3v62.8h-6.7z"
        fill="#fff"
      />
    </svg>
  ),
  Redux: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M16.5 8.2c.3-2.7-1.8-5.2-4.5-5.2-2.1 0-3.9 1.3-4.6 3.2C5.6 6.6 4 8.4 4 10.5c0 2.5 2 4.5 4.5 4.5h7.5c2.2 0 4-1.8 4-4 0-2-1.5-3.7-3.5-3.8zM11 17l-3-3h2V8h2v6h2l-3 3z"
        fill="#764ABC"
      />
    </svg>
  ),
  TailwindCSS: () => (
    <svg className="h-6 w-6" viewBox="0 0 32 32">
      <path
        d="M9 13.7q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9Q11.1 10.9 9 13.7zm-7 8.4q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9Q4.1 19.3 2 22.1z"
        fill="#06B6D4"
      />
    </svg>
  ),
  GSAP: () => (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0AE448] font-black text-[9px] text-black">
      GSAP
    </div>
  ),
  FramerMotion: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#F43F5E">
      <path d="M0 0h24v12H12L0 0zM0 12h12l12 12H0V12z" />
    </svg>
  ),
  Sass: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#CF649A" opacity="0.2" />
      <text x="5.5" y="16" fontSize="10" fontWeight="bold" fill="#CF649A">
        Sass
      </text>
    </svg>
  ),
  Bootstrap: () => (
    <svg className="h-6 w-6 rounded bg-[#7952B3] p-0.5" viewBox="0 0 24 24">
      <path
        d="M6.5 5H15c2.5 0 4.5 1.5 4.5 4 0 1.5-.8 2.8-2 3.5 1.5.6 2.5 2 2.5 3.5 0 2.8-2.2 4-5 4H6.5V5zm3 5.5h4.5c1 0 1.5-.7 1.5-1.5S15 7.5 14 7.5H9.5V10.5zm0 5.5h5c1.2 0 2-.7 2-1.5S15.7 13 14.5 13H9.5V16z"
        fill="#fff"
      />
    </svg>
  ),
  NodeJs: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M12 2L4 6.5v9L12 20l8-4.5v-9L12 2zm0 2.3l5.5 3.1v6.2L12 16.7l-5.5-3.1V7.4L12 4.3z"
        fill="#339933"
      />
    </svg>
  ),
  NestJS: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M14.1 2c-.5 0-1 .2-1.4.5L7 8c.8-.2 1.6-.1 2.3.3l4-4c.2-.2.5-.3.8-.3.6 0 1 .4 1 1v.2L8.5 12l3 3 5.8-7.8c.1-.2.2-.5.2-.7C17.5 3.1 15.9 2 14.1 2zM9.3 9.1c-.8 0-1.5.4-1.9 1L4 15c-.1.2-.1.5-.1.7 0 1.5 1.3 2.8 2.8 2.8.5 0 1-.2 1.4-.5l5.7-5.5-3-3-.7-.3-.8-.1z"
        fill="#E0234E"
      />
    </svg>
  ),
  ExpressJs: () => (
    <div className="flex h-5 w-7 items-center justify-center rounded border border-white/20 bg-[#2d2d2d] font-mono text-[8px] font-bold text-white">
      EX
    </div>
  ),
  MySQL: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <ellipse cx="12" cy="7" rx="8" ry="3" fill="#00758F" />
      <path
        d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7"
        fill="none"
        stroke="#00758F"
        strokeWidth="1.5"
      />
    </svg>
  ),
  PostgreSQL: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <ellipse cx="12" cy="7" rx="8" ry="3" fill="#336791" />
      <path
        d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7"
        fill="none"
        stroke="#336791"
        strokeWidth="1.5"
      />
      <path
        d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"
        fill="none"
        stroke="#336791"
        strokeWidth="1"
      />
    </svg>
  ),
  MongoDB: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M12 2C8 2 6 6.5 6 10c0 4 2.5 7 6 10 3.5-3 6-6 6-10 0-3.5-2-8-6-8zm0 14l-1-1V9h2v6l-1 1z"
        fill="#47A248"
      />
    </svg>
  ),
  Prisma: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M3 22L12 2l6 14-15 6zm2.5-1.5l10.5-4.2L11.5 6 5.5 20.5z"
        fill="#5A67D8"
      />
    </svg>
  ),
  Git: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        d="M21.7 11.3l-9-9c-.4-.4-1-.4-1.4 0l-2 2 2.5 2.5c.5-.2 1-.1 1.4.3.4.4.5.9.3 1.4L15.8 11c.5-.2 1-.1 1.4.3.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0-.4-.4-.5-1-.3-1.5L12.3 9.4V15c.2.1.4.2.6.4.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.2-.2.4-.3.7-.4V9.3c-.3-.1-.5-.2-.7-.4-.4-.4-.5-1-.3-1.5L8 4.9 2.3 10.6c-.4.4-.4 1 0 1.4l9 9c.4.4 1 .4 1.4 0l9-9c.4-.4.4-1 0-1.4v.1z"
        fill="#F05032"
      />
    </svg>
  ),
  Docker: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <rect x="2" y="10" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="6" y="10" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="10" y="10" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="6" y="7" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="10" y="7" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <path
        d="M21 12.5c-.5-1.5-2-2-3-1.5-.5-2-2-2.5-3-2H3c0 3 1.5 6 5 6h8c2 0 4-1 5-2.5z"
        fill="#2496ED"
        opacity=".7"
      />
    </svg>
  ),
};

const STACK_DATA: StackCategory[] = [
  {
    id: "frontend",
    title: "FRONTEND",
    icon: Layers,
    items: [
      { name: "JavaScript", component: Icons.JavaScript, color: "#F7DF1E" },
      { name: "TypeScript", component: Icons.TypeScript, color: "#3178C6" },
      { name: "React", component: Icons.React, color: "#61DAFB" },
      { name: "Next.Js", component: Icons.NextJs, color: "#FFFFFF" },
      { name: "Redux", component: Icons.Redux, color: "#764ABC" },
      { name: "Tailwind CSS", component: Icons.TailwindCSS, color: "#06B6D4" },
      { name: "GSAP", component: Icons.GSAP, color: "#0AE448" },
      {
        name: "Framer Motion",
        component: Icons.FramerMotion,
        color: "#F43F5E",
      },
      { name: "Sass", component: Icons.Sass, color: "#CF649A" },
      { name: "Bootstrap", component: Icons.Bootstrap, color: "#7952B3" },
    ],
  },
  {
    id: "backend",
    title: "BACKEND",
    icon: Cpu,
    items: [
      { name: "Node.Js", component: Icons.NodeJs, color: "#339933" },
      { name: "NestJS", component: Icons.NestJS, color: "#E0234E" },
      { name: "Express.Js", component: Icons.ExpressJs, color: "#FFFFFF" },
    ],
  },
  {
    id: "database",
    title: "DATABASE",
    icon: Database,
    items: [
      { name: "MySQL", component: Icons.MySQL, color: "#00758F" },
      { name: "PostgreSQL", component: Icons.PostgreSQL, color: "#336791" },
      { name: "MongoDB", component: Icons.MongoDB, color: "#47A248" },
      { name: "Prisma", component: Icons.Prisma, color: "#5A67D8" },
    ],
  },
  {
    id: "tools",
    title: "TOOLS",
    icon: Terminal,
    items: [
      { name: "Git", component: Icons.Git, color: "#F05032" },
      { name: "Docker", component: Icons.Docker, color: "#2496ED" },
    ],
  },
];

// ─── Tech Pill ────────────────────────────────────────────────────────────────

const TechPill: React.FC<{ item: StackItem; pillClass: string }> = ({
  item,
  pillClass,
}) => {
  const [hovered, setHovered] = useState(false);
  const IconComp = item.component;
  return (
    <div
      className={`${pillClass} inline-flex opacity-0`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          boxShadow: hovered ? `0 0 20px 2px ${item.color}40` : "none",
          borderColor: hovered ? `${item.color}50` : "rgba(255,255,255,0.07)",
          backgroundColor: hovered
            ? `${item.color}0d`
            : "rgba(255,255,255,0.025)",
        }}
        transition={{ duration: 0.18 }}
        className="flex cursor-default select-none items-center gap-2.5 rounded-xl border px-3.5 py-2"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          <IconComp />
        </span>
        <motion.span
          animate={{ color: hovered ? item.color : "#94a3b8" }}
          transition={{ duration: 0.15 }}
          className="whitespace-nowrap font-mono text-[13px] font-medium"
        >
          {item.name}
        </motion.span>
      </motion.div>
    </div>
  );
};

// ─── Category Block ───────────────────────────────────────────────────────────

const CategoryBlock: React.FC<{
  category: StackCategory;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
}> = ({ category, scrollRoot, isVisible }) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const Icon = category.icon;
  const pillClass = `pill-${category.id}`;

  function animateIn() {
    if (firedRef.current) return;
    firedRef.current = true;

    // Kill any running exit timeline
    tlRef.current?.kill();

    const pills = pillsRef.current?.querySelectorAll(`.${pillClass}`);

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.fromTo(
      headerRef.current,
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" },
    );

    if (pills?.length) {
      tl.fromTo(
        pills,
        { opacity: 0, y: 22, scale: 0.84, filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.42,
          stagger: { each: 0.055, ease: "power2.out" },
          ease: "back.out(1.5)",
        },
        "-=0.25",
      );
    }
  }

  function animateOut(instant = false) {
    if (!firedRef.current) return;
    firedRef.current = false;

    // Kill any running enter timeline
    tlRef.current?.kill();

    const pills = pillsRef.current?.querySelectorAll(`.${pillClass}`);

    if (instant) {
      gsap.set(headerRef.current, { opacity: 0, x: -24 });
      if (pills?.length)
        gsap.set(pills, {
          opacity: 0,
          y: 22,
          scale: 0.84,
          filter: "blur(5px)",
        });
      return;
    }

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Reverse stagger: last pill exits first
    if (pills?.length) {
      tl.to(pills, {
        opacity: 0,
        y: 22,
        scale: 0.84,
        filter: "blur(5px)",
        duration: 0.3,
        stagger: { each: 0.04, from: "end", ease: "power2.in" },
        ease: "power2.in",
      });
    }

    tl.to(
      headerRef.current,
      { opacity: 0, x: -24, duration: 0.25, ease: "power3.in" },
      "-=0.1",
    );
  }

  // When panel leaves, play reverse stagger exit
  useEffect(() => {
    if (!isVisible) {
      animateOut(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Inner scroll observer — only meaningful when panel is visible
  useEffect(() => {
    const block = blockRef.current;
    const scroll = scrollRoot.current;
    if (!block || !scroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isVisible) {
          animateIn();
        } else if (!entry.isIntersecting && firedRef.current) {
          animateOut(false);
        }
      },
      { root: scroll, threshold: 0.15 },
    );
    observer.observe(block);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRoot, pillClass, isVisible]);

  return (
    <div ref={blockRef} className="mb-10 last:mb-0">
      <div ref={headerRef} className="mb-4 flex items-center gap-3 opacity-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00FF88]/20 bg-[#00FF88]/10">
          <Icon className="h-3.5 w-3.5 text-[#00FF88]" />
        </div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00FF88]">
          {category.title}
        </span>
        <div className="h-px flex-1 bg-[#00FF88]/10" />
        <span className="font-mono text-[10px] text-neutral-600">
          {String(category.items.length).padStart(2, "0")}
        </span>
      </div>
      <div ref={pillsRef} className="flex flex-wrap gap-2">
        {category.items.map((item) => (
          <TechPill key={item.name} item={item} pillClass={pillClass} />
        ))}
      </div>
    </div>
  );
};

// ─── Scroll Track ─────────────────────────────────────────────────────────────

const ScrollTrack: React.FC<{
  scrollRef: React.RefObject<HTMLDivElement | null>;
}> = ({ scrollRef }) => {
  const thumbRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight);
      const thumbH = Math.max(
        30,
        (el.clientHeight / el.scrollHeight) * el.clientHeight,
      );
      const travel = el.clientHeight - thumbH;
      if (thumbRef.current) {
        thumbRef.current.style.height = `${thumbH}px`;
        thumbRef.current.style.transform = `translateY(${ratio * travel}px)`;
      }
    };
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => el.removeEventListener("scroll", update);
  }, [scrollRef]);

  return (
    <div className="pointer-events-none absolute bottom-0 right-3 top-0 z-30 w-px bg-white/4">
      <div
        ref={thumbRef}
        className="w-full rounded-full bg-[#00FF88]/30 transition-none"
        style={{ height: 30 }}
      />
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const MyStack: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleFiredRef = useRef(false);
  const titleTlRef = useRef<gsap.core.Timeline | null>(null);
  const totalTech = STACK_DATA.reduce((acc, c) => acc + c.items.length, 0);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const chars = title.querySelectorAll(".t-char");

    if (isVisible && !titleFiredRef.current) {
      titleFiredRef.current = true;
      titleTlRef.current?.kill();

      const tl = gsap.timeline();
      titleTlRef.current = tl;
      tl.fromTo(
        chars,
        { opacity: 0, y: 30, rotateX: -55, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.55,
          stagger: 0.04,
          ease: "back.out(1.6)",
          delay: 0.1,
        },
      );
    }

    if (!isVisible && titleFiredRef.current) {
      titleFiredRef.current = false;
      titleTlRef.current?.kill();

      // Reverse stagger exit for title chars
      const tl = gsap.timeline();
      titleTlRef.current = tl;
      tl.to(chars, {
        opacity: 0,
        y: 30,
        rotateX: -55,
        filter: "blur(4px)",
        duration: 0.35,
        stagger: { each: 0.03, from: "end", ease: "power2.in" },
        ease: "power2.in",
      });
    }
  }, [isVisible]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#050505]">
      <StarField />

      {/* Header */}
      <div className="relative z-10 shrink-0 border-b border-white/0.5 px-8 pb-6 pt-10 md:px-14">
        <div className="flex items-end justify-between">
          <div>
            <div
              ref={titleRef}
              className="flex items-baseline"
              style={{ perspective: "700px" }}
            >
              {"MY STACK".split("").map((ch, i) => (
                <span
                  key={i}
                  className="t-char inline-block font-display font-black italic uppercase text-white opacity-0"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    width: ch === " " ? "0.55em" : undefined,
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inner scroll */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="relative z-10 h-full overflow-y-auto px-8 pb-16 pt-8 md:px-14"
          style={{ scrollbarWidth: "none" }}
        >
          {STACK_DATA.map((cat) => (
            <CategoryBlock
              key={cat.id}
              category={cat}
              scrollRoot={scrollRef}
              isVisible={isVisible}
            />
          ))}
        </div>
        <ScrollTrack scrollRef={scrollRef} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-linear-to-t from-[#050505] to-transparent" />
      </div>
    </div>
  );
};

export default MyStack;
