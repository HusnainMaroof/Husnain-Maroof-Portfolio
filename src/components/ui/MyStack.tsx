"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { Layers, Database, Terminal, Cpu } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() > 0.7,
        duration: Math.random() * 4 + 2,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#080a0d]">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }}
          animate={s.pulse ? { opacity: [s.opacity, s.opacity * 0.15, s.opacity], scale: [1, 1.4, 1] } : {}}
          transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/4 rounded-full blur-[140px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-violet-500/4 rounded-full blur-[160px]" />
    </div>
  );
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const Icons: Record<string, React.FC> = {
  JavaScript: () => (
    <svg className="w-6 h-6 rounded-sm" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#F7DF1E" />
      <text x="3.5" y="18.5" fontSize="11" fontWeight="bold" fontFamily="monospace" fill="#000">JS</text>
    </svg>
  ),
  TypeScript: () => (
    <svg className="w-6 h-6 rounded-sm" viewBox="0 0 24 24">
      <rect width="24" height="24" fill="#3178C6" />
      <text x="3" y="18.5" fontSize="11" fontWeight="bold" fontFamily="monospace" fill="#fff">TS</text>
    </svg>
  ),
  React: () => (
    <svg className="w-6 h-6" viewBox="-11.5 -10.23174 23 20.46348">
      <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
      <g stroke="#61dafb" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  NextJs: () => (
    <svg className="w-6 h-6 rounded-full bg-black border border-white/20 p-0.5" viewBox="0 0 128 128">
      <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm29.8 95.8L51.3 43.1V95H40V33h11.4l37.8 48.7V33h11.3v62.8h-6.7z" fill="#fff" />
    </svg>
  ),
  Redux: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path d="M16.5 8.2c.3-2.7-1.8-5.2-4.5-5.2-2.1 0-3.9 1.3-4.6 3.2C5.6 6.6 4 8.4 4 10.5c0 2.5 2 4.5 4.5 4.5h7.5c2.2 0 4-1.8 4-4 0-2-1.5-3.7-3.5-3.8zM11 17l-3-3h2V8h2v6h2l-3 3z" fill="#764ABC" />
    </svg>
  ),
  TailwindCSS: () => (
    <svg className="w-6 h-6" viewBox="0 0 32 32">
      <path d="M9 13.7q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9Q11.1 10.9 9 13.7zm-7 8.4q1.4-5.6 7-5.6c5.6 0 6.3 4.2 9.1 4.9q2.8.7 4.9-2.1-1.4 5.6-7 5.6c-5.6 0-6.3-4.2-9.1-4.9Q4.1 19.3 2 22.1z" fill="#06B6D4" />
    </svg>
  ),
  GSAP: () => (
    <div className="w-6 h-6 rounded-full bg-[#0AE448] flex items-center justify-center font-black text-[9px] text-black">
      GSAP
    </div>
  ),
  FramerMotion: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#F43F5E">
      <path d="M0 0h24v12H12L0 0zM0 12h12l12 12H0V12z" />
    </svg>
  ),
  Sass: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#CF649A" opacity="0.2" />
      <text x="5.5" y="16" fontSize="10" fontWeight="bold" fill="#CF649A">Sass</text>
    </svg>
  ),
  Bootstrap: () => (
    <svg className="w-6 h-6 rounded bg-[#7952B3] p-0.5" viewBox="0 0 24 24">
      <path d="M6.5 5H15c2.5 0 4.5 1.5 4.5 4 0 1.5-.8 2.8-2 3.5 1.5.6 2.5 2 2.5 3.5 0 2.8-2.2 4-5 4H6.5V5zm3 5.5h4.5c1 0 1.5-.7 1.5-1.5S15 7.5 14 7.5H9.5V10.5zm0 5.5h5c1.2 0 2-.7 2-1.5S15.7 13 14.5 13H9.5V16z" fill="#fff" />
    </svg>
  ),
  NodeJs: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path d="M12 2L4 6.5v9L12 20l8-4.5v-9L12 2zm0 2.3l5.5 3.1v6.2L12 16.7l-5.5-3.1V7.4L12 4.3z" fill="#339933" />
    </svg>
  ),
  NestJS: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path d="M14.1 2c-.5 0-1 .2-1.4.5L7 8c.8-.2 1.6-.1 2.3.3l4-4c.2-.2.5-.3.8-.3.6 0 1 .4 1 1v.2L8.5 12l3 3 5.8-7.8c.1-.2.2-.5.2-.7C17.5 3.1 15.9 2 14.1 2zM9.3 9.1c-.8 0-1.5.4-1.9 1L4 15c-.1.2-.1.5-.1.7 0 1.5 1.3 2.8 2.8 2.8.5 0 1-.2 1.4-.5l5.7-5.5-3-3-.7-.3-.8-.1z" fill="#E0234E" />
    </svg>
  ),
  ExpressJs: () => (
    <div className="w-7 h-5 rounded bg-[#2d2d2d] border border-white/20 flex items-center justify-center font-mono font-bold text-[8px] text-white">
      EX
    </div>
  ),
  MySQL: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <ellipse cx="12" cy="7" rx="8" ry="3" fill="#00758F" />
      <path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" fill="none" stroke="#00758F" strokeWidth="1.5" />
    </svg>
  ),
  PostgreSQL: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <ellipse cx="12" cy="7" rx="8" ry="3" fill="#336791" />
      <path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" fill="none" stroke="#336791" strokeWidth="1.5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" fill="none" stroke="#336791" strokeWidth="1" />
    </svg>
  ),
  MongoDB: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path d="M12 2C8 2 6 6.5 6 10c0 4 2.5 7 6 10 3.5-3 6-6 6-10 0-3.5-2-8-6-8zm0 14l-1-1V9h2v6l-1 1z" fill="#47A248" />
    </svg>
  ),
  Prisma: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path d="M3 22L12 2l6 14-15 6zm2.5-1.5l10.5-4.2L11.5 6 5.5 20.5z" fill="#5A67D8" />
    </svg>
  ),
  Git: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path d="M21.7 11.3l-9-9c-.4-.4-1-.4-1.4 0l-2 2 2.5 2.5c.5-.2 1-.1 1.4.3.4.4.5.9.3 1.4L15.8 11c.5-.2 1-.1 1.4.3.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0-.4-.4-.5-1-.3-1.5L12.3 9.4V15c.2.1.4.2.6.4.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.2-.2.4-.3.7-.4V9.3c-.3-.1-.5-.2-.7-.4-.4-.4-.5-1-.3-1.5L8 4.9 2.3 10.6c-.4.4-.4 1 0 1.4l9 9c.4.4 1 .4 1.4 0l9-9c.4-.4.4-1 0-1.4v.1z" fill="#F05032" />
    </svg>
  ),
  Docker: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <rect x="2" y="10" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="6" y="10" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="10" y="10" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="6" y="7" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <rect x="10" y="7" width="3" height="2.5" rx=".3" fill="#2496ED" />
      <path d="M21 12.5c-.5-1.5-2-2-3-1.5-.5-2-2-2.5-3-2H3c0 3 1.5 6 5 6h8c2 0 4-1 5-2.5z" fill="#2496ED" opacity=".7" />
    </svg>
  ),
};

// ─── Stack Data ───────────────────────────────────────────────────────────────

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
      { name: "Framer Motion", component: Icons.FramerMotion, color: "#F43F5E" },
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

// ─── Pill Item ────────────────────────────────────────────────────────────────

interface PillProps {
  item: StackItem;
  index: number;
  categoryId: string;
}

const TechPill: React.FC<PillProps> = ({ item, index, categoryId }) => {
  const [hovered, setHovered] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const IconComp = item.component;

  return (
    <div
      ref={pillRef}
      // GSAP targets by class: gsap-pill-{categoryId}
      className={`gsap-pill gsap-pill-${categoryId} opacity-0`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "inline-flex" }}
    >
      <motion.div
        animate={{
          boxShadow: hovered ? `0 0 16px 2px ${item.color}55` : "0 0 0px 0px transparent",
          borderColor: hovered ? `${item.color}66` : "rgba(255,255,255,0.08)",
          backgroundColor: hovered ? `${item.color}10` : "rgba(255,255,255,0.03)",
        }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border cursor-default select-none"
      >
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          <IconComp />
        </span>
        <motion.span
          animate={{ color: hovered ? item.color : "#cbd5e1" }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium whitespace-nowrap font-mono"
        >
          {item.name}
        </motion.span>
        {hovered && (
          <motion.div
            layoutId={`dot-${categoryId}-${index}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: item.color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}
      </motion.div>
    </div>
  );
};

// ─── Category Section ─────────────────────────────────────────────────────────

interface CategoryProps {
  category: StackCategory;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategorySection: React.FC<CategoryProps> = ({ category, isExpanded, onToggle }) => {
  const pillsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const Icon = category.icon;
  const tl = useRef<gsap.core.Timeline | null>(null);

  // GSAP stagger on expand
  useEffect(() => {
    if (!pillsRef.current) return;

    const pills = pillsRef.current.querySelectorAll(`.gsap-pill-${category.id}`);

    if (isExpanded) {
      // Kill any running timeline
      tl.current?.kill();
      tl.current = gsap.timeline();

      // Reset first
      gsap.set(pills, { opacity: 0, y: 18, scale: 0.88, filter: "blur(4px)" });

      tl.current.to(pills, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.4,
        stagger: {
          each: 0.055,
          ease: "power2.out",
        },
        ease: "back.out(1.4)",
      });
    } else {
      tl.current?.kill();
      tl.current = gsap.timeline();
      // Reverse stagger on collapse
      const reversed = Array.from(pills).reverse();
      tl.current.to(reversed, {
        opacity: 0,
        y: -10,
        scale: 0.9,
        filter: "blur(3px)",
        duration: 0.22,
        stagger: 0.03,
        ease: "power2.in",
      });
    }
  }, [isExpanded, category.id]);

  // GSAP header entrance on mount
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  return (
    <div className="border border-white/6 rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm">
      {/* Header / toggle */}
      <div
        ref={headerRef}
        onClick={onToggle}
        className="flex items-center justify-between px-5 py-4 cursor-pointer group hover:bg-white/[0.03] transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/8 group-hover:border-white/15 transition-colors duration-200">
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors duration-200" />
          </div>
          <span className="text-xs font-semibold tracking-[0.18em] text-slate-400 group-hover:text-slate-200 transition-colors duration-200 font-mono">
            {category.title}
          </span>
          <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-500 transition-colors duration-200">
            {String(category.items.length).padStart(2, "0")}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center"
        >
          <span className="text-slate-500 text-sm leading-none select-none">+</span>
        </motion.div>
      </div>

      {/* Pills container — always mounted so GSAP can target DOM nodes */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div ref={pillsRef} className="px-5 pb-5 pt-1">
              <div className="flex flex-wrap gap-2">
                {category.items.map((item, i) => (
                  <TechPill key={item.name} item={item} index={i} categoryId={category.id} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MyStack: React.FC = () => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["frontend"]));
  const titleRef = useRef<HTMLDivElement>(null);

  // GSAP title entrance
  useEffect(() => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll(".title-char");
    gsap.fromTo(
      chars,
      { opacity: 0, y: 30, rotateX: -60 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "back.out(1.7)",
        delay: 0.2,
      }
    );
  }, []);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => setExpanded(new Set(STACK_DATA.map((c) => c.id)));
  const collapseAll = () => setExpanded(new Set());

  const titleText = "MY STACK";

  return (
    <div className="relative min-h-screen bg-[#080a0d] overflow-hidden flex flex-col items-center justify-start py-16 px-4">
      <StarField />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Title */}
        <div ref={titleRef} className="flex justify-center mb-2" style={{ perspective: "600px" }}>
          {titleText.split("").map((ch, i) => (
            <span
              key={i}
              className="title-char inline-block text-4xl font-black tracking-[0.2em] text-white font-mono opacity-0"
              style={{ display: ch === " " ? "inline-block" : undefined, width: ch === " " ? "1rem" : undefined }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center text-xs text-slate-500 font-mono tracking-widest mb-10"
        >
          tools i build with
        </motion.p>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-2 justify-end mb-4"
        >
          <button
            onClick={expandAll}
            className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 transition-colors duration-200 border border-white/6 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg"
          >
            expand all
          </button>
          <button
            onClick={collapseAll}
            className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors duration-200 border border-white/6 hover:border-rose-500/30 px-3 py-1.5 rounded-lg"
          >
            collapse all
          </button>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          {STACK_DATA.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <CategorySection
                category={cat}
                isExpanded={expanded.has(cat.id)}
                onToggle={() => toggle(cat.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Count footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-[10px] font-mono text-slate-600"
        >
          {STACK_DATA.reduce((acc, c) => acc + c.items.length, 0)} technologies across{" "}
          {STACK_DATA.length} categories
        </motion.div>
      </div>
    </div>
  );
};

export default MyStack;