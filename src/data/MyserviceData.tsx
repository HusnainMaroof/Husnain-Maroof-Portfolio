"use client";
import React from "react";
import { motion } from "framer-motion";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export interface Service {
  index: string;
  label: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  visual: React.ReactNode;
}

export const SERVICES: Service[] = [
  {
    index: "01",
    label: "Performance",
    category: "Real-Time",
    title: "Data Streams",
    subtitle: "Live systems that never sleep.",
    description:
      "WebSocket pipelines, server-sent events, and optimistic UI patterns. I build real-time dashboards and data feeds that stay sub-20ms under load — because users feel lag before they name it.",
    tags: ["WebSockets", "SSE", "Redis Pub/Sub", "Edge"],
    visual: <PerformanceVisual />,
  },
  {
    index: "02",
    label: "Craft",
    category: "Premium",
    title: "Brand 3D",
    subtitle: "Elevating brands through interactive WebGL.",
    description:
      "Three.js environments, React Three Fiber scenes, and shader-driven visuals that transform a brand's digital presence from static to spatial. This is where engineering meets art direction.",
    tags: ["Three.js", "R3F", "GLSL", "WebGL"],
    visual: <CraftVisual />,
  },
  {
    index: "03",
    label: "Fintech",
    category: "Secure",
    title: "Payment Vault",
    subtitle: "Robust encrypted checkout for global gateways.",
    description:
      "PCI-DSS compliant architectures, multi-gateway routing, and idempotent transaction flows. I've built checkout systems that handle millions in volume without a single point of failure.",
    tags: ["Stripe", "PCI-DSS", "AES-256", "Idempotency"],
    visual: <FintechVisual />,
  },
  {
    index: "04",
    label: "Design",
    category: "Responsive",
    title: "Every Screen.",
    subtitle: "Pixel-perfect from 320px to 4K.",
    description:
      "Not just 'mobile-friendly' — genuinely adaptive layouts with container queries, fluid typography, and touch-first interactions. Every breakpoint is a first-class citizen.",
    tags: ["Container Queries", "Fluid Type", "CSS Grid", "A11y"],
    visual: <ResponsiveVisual />,
  },
  {
    index: "05",
    label: "Architecture",
    category: "Animation",
    title: "Backend + Motion",
    subtitle: "The full stack, animated.",
    description:
      "Microservice topologies paired with cinematic UI. I design backend event flows that feed directly into motion systems — so your UI doesn't just look alive, it IS alive, driven by real data.",
    tags: ["Event-Driven", "Framer Motion", "GSAP", "BFF Pattern"],
    visual: <ArchitectureVisual />,
  },
];

// ─── REUSABLE SVG PRIMITIVES ─────────────────────────────────────────────────

function SvgContainer({
  children,
  viewBox,
  className = "",
}: {
  children: React.ReactNode;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={`w-full h-full block overflow-visible ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

function GlowFilter({
  id,
  stdDeviation = 2,
}: {
  id: string;
  stdDeviation?: number;
}) {
  return (
    <filter id={id}>
      <feGaussianBlur stdDeviation={stdDeviation} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

function MonoText({
  x,
  y,
  children,
  className = "",
  ...props
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
} & React.SVGProps<SVGTextElement>) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="monospace"
      className={`select-none ${className}`}
      {...props}
    >
      {children}
    </text>
  );
}

function GridLine({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className="stroke-white/3"
      strokeWidth={0.5}
    />
  );
}

function NeonLine({
  d,
  className = "",
  animate = true,
  delay = 0,
}: {
  d: string;
  className?: string;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`stroke-[#00FF88] ${className}`}
      initial={animate ? { pathLength: 0 } : undefined}
      animate={animate ? { pathLength: 1 } : undefined}
      transition={
        animate ? { duration: 1.5, delay, ease: cinematicEase } : undefined
      }
    />
  );
}

function PulseDot({
  cx,
  cy,
  delay = 0,
}: {
  cx: number;
  cy: number;
  delay?: number;
}) {
  return (
    <>
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        className="fill-[#00FF88]"
        filter="url(#glow)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.4 + delay, type: "spring" }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={8}
        className="fill-none stroke-[#00FF88]"
        strokeWidth={0.5}
        opacity={0.3}
        animate={{ r: [8, 18], opacity: [0.3, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
      />
    </>
  );
}

function LiveBadge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={0}
        y={0}
        width={44}
        height={14}
        rx={3}
        className="fill-[#001a0d]"
      />
      <motion.circle
        cx={8}
        cy={7}
        r={3}
        className="fill-[#00FF88]"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <MonoText x={16} y={11} className="fill-[#00FF88] text-[7px] font-bold">
        LIVE
      </MonoText>
    </g>
  );
}

function ShimmerRect({
  x,
  y,
  width,
  height,
  rx = 0,
  className = "",
  delay = 0,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      className={`${className}`}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 2, delay, repeat: Infinity }}
    />
  );
}

// ─── 01: PERFORMANCE VISUAL ───────────────────────────────────────────────────
export function PerformanceVisual() {
  const points = [40, 55, 45, 80, 65, 90, 82, 95, 88, 98, 105];
  const w = 320,
    h = 120,
    step = w / (points.length - 1);
  const toY = (v: number) => h - (v / 120) * h;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${toY(p)}`)
    .join(" ");
  const baselineD = [100, 92, 98, 88, 90, 82, 86, 80, 84, 76, 70]
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${toY(p)}`)
    .join(" ");

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 gap-4 relative">
      <div className="w-full relative">
        <motion.div
          className="absolute -top-5 right-0 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00FF88]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] font-mono font-bold text-[#00FF88] tracking-widest">
            LIVE
          </span>
        </motion.div>

        <SvgContainer viewBox={`0 0 ${w} ${h + 60}`}>
          <defs>
            <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF88" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
            </linearGradient>
            <GlowFilter id="glow" />
          </defs>

          {[25, 50, 75, 100].map((v) => (
            <GridLine key={v} x1={16} y1={toY(v)} x2={w - 16} y2={toY(v)} />
          ))}

          {[100, 75, 50, 25].map((v) => (
            <MonoText
              key={v}
              x={10}
              y={toY(v) + 3}
              className="fill-[#2a2a2a] text-[8px]"
              textAnchor="end"
            >
              {v}
            </MonoText>
          ))}

          <motion.path
            d={baselineD}
            fill="none"
            className="stroke-[#1a3a2a]"
            strokeWidth={1}
            strokeDasharray="3 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.5, ease: cinematicEase }}
          />

          <motion.path
            d={`${d} L ${w - 16} ${h} L 16 ${h} Z`}
            fill="url(#chartArea)"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.5, ease: cinematicEase }}
          />

          <NeonLine d={d} className="stroke-2" />
          <PulseDot cx={w - 16} cy={toY(points[points.length - 1])} />

          <motion.line
            x1={16}
            y1={toY(105)}
            x2={16}
            y2={h}
            className="stroke-[#00FF88]"
            strokeWidth={0.5}
            opacity={0.15}
            strokeDasharray="2 4"
            animate={{ x1: [16, w - 16], x2: [16, w - 16] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          <motion.g
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <MonoText
              x={60}
              y={h + 35}
              className="fill-[#00FF88] text-[9px] font-bold"
              textAnchor="middle"
            >
              &lt;12ms
            </MonoText>
            <MonoText
              x={60}
              y={h + 48}
              className="fill-[#333] text-[7px]"
              textAnchor="middle"
            >
              LATENCY
            </MonoText>
            <MonoText
              x={160}
              y={h + 35}
              className="fill-[#00FF88] text-[9px] font-bold"
              textAnchor="middle"
            >
              99.98%
            </MonoText>
            <MonoText
              x={160}
              y={h + 48}
              className="fill-[#333] text-[7px]"
              textAnchor="middle"
            >
              UPTIME
            </MonoText>
            <MonoText
              x={260}
              y={h + 35}
              className="fill-[#00FF88] text-[9px] font-bold"
              textAnchor="middle"
            >
              42k RPS
            </MonoText>
            <MonoText
              x={260}
              y={h + 48}
              className="fill-[#333] text-[7px]"
              textAnchor="middle"
            >
              THROUGHPUT
            </MonoText>
          </motion.g>

          <LiveBadge x={252} y={8} />
        </SvgContainer>
      </div>
    </div>
  );
}

// ─── 02: CRAFT VISUAL ─────────────────────────────────────────────────────────
export function CraftVisual() {
  const ticks = [
    { x1: 160, y1: 18, x2: 160, y2: 26 },
    { x1: 232, y1: 90, x2: 224, y2: 90 },
    { x1: 160, y1: 162, x2: 160, y2: 154 },
    { x1: 88, y1: 90, x2: 96, y2: 90 },
  ];
  const minorTicks = [
    { x1: 232, y1: 54, x2: 226, y2: 57 },
    { x1: 232, y1: 126, x2: 226, y2: 123 },
    { x1: 88, y1: 54, x2: 94, y2: 57 },
    { x1: 88, y1: 126, x2: 94, y2: 123 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      <SvgContainer viewBox="0 0 320 180">
        <defs>
          <filter id="soft">
            <feGaussianBlur stdDeviation={1.5} />
          </filter>
        </defs>

        <g opacity={0.08}>
          {[80, 120, 160, 200, 240].flatMap((x) =>
            [45, 90, 135].map((y) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={1}
                className="fill-white"
              />
            )),
          )}
        </g>

        <circle
          cx={160}
          cy={90}
          r={76}
          className="fill-none stroke-[#00FF88]"
          strokeWidth={20}
          opacity={0.025}
        />

        <motion.g
          style={{ transformOrigin: "160px 90px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx={160}
            cy={90}
            r={72}
            className="fill-none stroke-[#0f1f14]"
            strokeWidth={2}
          />
          <circle
            cx={160}
            cy={90}
            r={72}
            className="fill-none stroke-[#00FF88]"
            strokeWidth={1.5}
            strokeDasharray="48 402"
            strokeLinecap="round"
            opacity={0.9}
          />
          {ticks.map((t, i) => (
            <line
              key={i}
              {...t}
              className="stroke-[#00FF88]"
              strokeWidth={1}
              opacity={0.7}
            />
          ))}
          {minorTicks.map((t, i) => (
            <line
              key={`m-${i}`}
              {...t}
              className="stroke-[#333]"
              strokeWidth={0.5}
            />
          ))}
        </motion.g>

        <motion.g
          style={{ transformOrigin: "160px 90px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx={160}
            cy={90}
            r={54}
            className="fill-none stroke-[#1a1a1a]"
            strokeWidth={1.5}
          />
          <circle
            cx={160}
            cy={90}
            r={54}
            className="fill-none stroke-white"
            strokeWidth={0.5}
            strokeDasharray="3 6"
            opacity={0.15}
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "160px 90px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx={160}
            cy={90}
            r={38}
            className="fill-none stroke-[#141414]"
            strokeWidth={1}
          />
          <circle
            cx={160}
            cy={90}
            r={38}
            className="fill-none stroke-[#00FF88]"
            strokeWidth={0.5}
            strokeDasharray="12 62"
            opacity={0.4}
          />
        </motion.g>

        <circle
          cx={160}
          cy={90}
          r={22}
          className="fill-[#0d0d0d] stroke-[#1e1e1e]"
          strokeWidth={1}
        />
        <line
          x1={148}
          y1={90}
          x2={172}
          y2={90}
          className="stroke-[#1c1c1c]"
          strokeWidth={0.5}
        />
        <line
          x1={160}
          y1={78}
          x2={160}
          y2={102}
          className="stroke-[#1c1c1c]"
          strokeWidth={0.5}
        />

        <motion.circle
          cx={160}
          cy={90}
          r={5}
          className="fill-[#00FF88]"
          opacity={0.9}
          animate={{ scale: [1, 1.4, 1], opacity: [0.9, 0.5, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "160px 90px" }}
        />
        <motion.circle
          cx={160}
          cy={90}
          r={9}
          className="fill-none stroke-[#00FF88]"
          strokeWidth={0.5}
          opacity={0.3}
          animate={{ r: [9, 18], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />

        <motion.text
          fontFamily="monospace"
          fontSize={8}
          x={160}
          y={172}
          textAnchor="middle"
          letterSpacing={0.15}
          className="fill-[#2a2a2a] select-none"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          WEBGL · THREE.JS · R3F
        </motion.text>

        <MonoText x={260} y={168} className="fill-[#1c3d25] text-[9px]">
          360°
        </MonoText>
      </SvgContainer>
    </div>
  );
}

// ─── 03: FINTECH VISUAL ───────────────────────────────────────────────────────
export function FintechVisual() {
  const steps = ["AUTH", "ENCRYPT", "ROUTE", "SETTLE"];

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      <SvgContainer viewBox="0 0 320 180">
        <defs>
          <GlowFilter id="lockglow" stdDeviation={3} />
        </defs>

        <circle
          cx={100}
          cy={90}
          r={60}
          className="fill-none stroke-[#151515]"
          strokeWidth={10}
        />
        <circle
          cx={100}
          cy={90}
          r={50}
          className="fill-none stroke-[#121212]"
          strokeWidth={8}
        />
        <line
          x1={100}
          y1={40}
          x2={100}
          y2={140}
          className="stroke-[#151515]"
          strokeWidth={1.5}
        />
        <line
          x1={50}
          y1={90}
          x2={150}
          y2={90}
          className="stroke-[#151515]"
          strokeWidth={1.5}
        />
        <line
          x1={65}
          y1={55}
          x2={135}
          y2={125}
          className="stroke-[#151515]"
          strokeWidth={1.5}
        />
        <line
          x1={135}
          y1={55}
          x2={65}
          y2={125}
          className="stroke-[#151515]"
          strokeWidth={1.5}
        />
        <circle
          cx={100}
          cy={90}
          r={60}
          className="fill-none stroke-[#1a1a1a]"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />

        <motion.rect
          x={78}
          y={84}
          width={44}
          height={32}
          rx={4}
          className="fill-[#0d0d0d] stroke-[#00FF88]"
          strokeWidth={1}
          filter="url(#lockglow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: cinematicEase }}
        />
        <motion.path
          d="M86 84V76a14 14 0 0 1 28 0v6"
          fill="none"
          className="stroke-[#00FF88]"
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: cinematicEase }}
        />

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          <circle
            cx={100}
            cy={97}
            r={4}
            className="fill-[#00FF88]"
            opacity={0.9}
          />
          <rect
            x={98.5}
            y={97}
            width={3}
            height={8}
            rx={1.5}
            className="fill-[#00FF88]"
            opacity={0.9}
          />
        </motion.g>

        <motion.path
          d="M122 90 L158 62"
          fill="none"
          className="stroke-[#1a3a1f]"
          strokeWidth={0.5}
          strokeDasharray="3 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        />

        {steps.map((step, i) => {
          const x = 168 + (i % 2) * 56;
          const y = 52 + Math.floor(i / 2) * 30;
          const w = step === "ENCRYPT" ? 56 : step === "SETTLE" ? 52 : 44;
          return (
            <React.Fragment key={step}>
              {i > 0 && (
                <motion.line
                  x1={
                    i % 2 === 0
                      ? 168 + 44
                      : 168 +
                        ((i - 1) % 2) * 56 +
                        (steps[i - 1] === "ENCRYPT"
                          ? 56
                          : steps[i - 1] === "SETTLE"
                            ? 52
                            : 44) /
                          2
                  }
                  y1={
                    i % 2 === 0
                      ? 52 + Math.floor((i - 1) / 2) * 30 + 10
                      : 52 + Math.floor((i - 1) / 2) * 30 + 10
                  }
                  x2={i % 2 === 0 ? 168 : x}
                  y2={i % 2 === 0 ? y + 10 : y + 10}
                  className="stroke-[#1a3a1f]"
                  strokeWidth={0.5}
                  strokeDasharray="2 2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 + i * 0.15, duration: 0.3 }}
                />
              )}
              <motion.g
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.15, duration: 0.35 }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={20}
                  rx={10}
                  className="fill-[#0d1a11] stroke-[#1a3a1f]"
                  strokeWidth={0.5}
                />
                <MonoText
                  x={x + w / 2}
                  y={y + 14}
                  className="fill-[#00FF88] text-[8px]"
                  textAnchor="middle"
                >
                  {step}
                </MonoText>
              </motion.g>
            </React.Fragment>
          );
        })}

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <MonoText
            x={168}
            y={125}
            className="fill-[#252525] text-[7px]"
            letterSpacing={0.08}
          >
            AES-256
          </MonoText>
          <MonoText
            x={168}
            y={137}
            className="fill-[#252525] text-[7px]"
            letterSpacing={0.08}
          >
            PCI-DSS
          </MonoText>
          <MonoText
            x={168}
            y={149}
            className="fill-[#252525] text-[7px]"
            letterSpacing={0.08}
          >
            TLS 1.3
          </MonoText>
          <line
            x1={164}
            y1={121}
            x2={164}
            y2={151}
            className="stroke-[#1a3a1f]"
            strokeWidth={0.5}
          />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.5 }}
        >
          <path
            d="M290 20 L310 20 L310 38 Q300 44 290 38 Z"
            className="fill-[#0d1a11] stroke-[#1a3a1f]"
            strokeWidth={0.5}
          />
          <MonoText
            x={300}
            y={33}
            className="fill-[#00FF88] text-[7px]"
            textAnchor="middle"
          >
            ✓
          </MonoText>
        </motion.g>
      </SvgContainer>
    </div>
  );
}

// ─── 04: RESPONSIVE VISUAL ────────────────────────────────────────────────────
export function ResponsiveVisual() {
  const devices = [
    {
      w: 90,
      h: 64,
      label: "Desktop",
      delay: 0,
      x: 30,
      bp: "1440px",
      y: 55,
      screenY: 58,
      navH: 10,
      contentY: 73,
      rowH: 8,
      heroY: 104,
      heroH: 14,
    },
    {
      w: 56,
      h: 78,
      label: "Tablet",
      delay: 0.2,
      x: 148,
      bp: "768px",
      y: 68,
      screenY: 72,
      navH: 8,
      contentY: 84,
      rowH: 7,
      heroY: 110,
      heroH: 10,
    },
    {
      w: 32,
      h: 64,
      label: "Mobile",
      delay: 0.4,
      x: 222,
      bp: "390px",
      y: 75,
      screenY: 79,
      navH: 8,
      contentY: 90,
      rowH: 6,
      heroY: 114,
      heroH: 10,
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      <SvgContainer viewBox="0 0 320 180">
        <line
          x1={20}
          y1={155}
          x2={300}
          y2={155}
          className="stroke-[#1a1a1a]"
          strokeWidth={0.5}
        />
        <line
          x1={20}
          y1={155}
          x2={300}
          y2={155}
          className="stroke-[#00FF88]"
          strokeWidth={0.5}
          opacity={0.2}
        />

        {devices.map((d) => (
          <motion.g
            key={d.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d.delay, duration: 0.5, ease: cinematicEase }}
          >
            <rect
              x={d.x}
              y={d.y}
              width={d.w}
              height={d.h}
              rx={d.label === "Mobile" ? 5 : d.label === "Tablet" ? 4 : 3}
              className="fill-[#111] stroke-[#222]"
              strokeWidth={0.75}
            />
            <rect
              x={d.x + 3}
              y={d.screenY}
              width={d.w - 6}
              height={d.h - (d.label === "Mobile" ? 10 : 6)}
              rx={d.label === "Mobile" ? 3 : 2}
              className="fill-[#0d0d0d]"
            />

            {d.label === "Mobile" && (
              <rect
                x={d.x + 10}
                y={79}
                width={12}
                height={4}
                rx={2}
                className="fill-[#0d0d0d] stroke-[#141414]"
                strokeWidth={0.5}
              />
            )}

            <rect
              x={d.x + 3}
              y={d.screenY}
              width={d.w - 6}
              height={d.navH}
              className="fill-[#141414]"
            />
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={d.x + 9 + i * 7}
                cy={d.label === "Desktop" ? 63 : 76}
                r={2}
                className="fill-[#1f1f1f]"
              />
            ))}

            {[0, 1, 2, 3].map((i) => (
              <ShimmerRect
                key={i}
                x={d.x + 7}
                y={d.contentY + i * d.rowH}
                width={d.w - 14 - (i % 2) * 15}
                height={d.label === "Desktop" ? 4 : 3}
                rx={1}
                className="fill-[#1c1c1c]"
                delay={d.delay + i * 0.3}
              />
            ))}

            <rect
              x={d.x + 7}
              y={d.heroY}
              width={d.w - 14}
              height={d.heroH}
              rx={2}
              className="fill-[#121f16] stroke-[#1a3a1f]"
              strokeWidth={0.5}
            />
            <rect
              x={d.x + 7}
              y={d.heroY}
              width={(d.w - 14) * 0.3}
              height={d.heroH}
              rx={2}
              className="fill-[#00FF88]"
              opacity={0.12}
            />

            {d.label === "Desktop" && (
              <>
                <rect
                  x={d.x + d.w / 2 - 6}
                  y={d.y + d.h + 55}
                  width={12}
                  height={8}
                  className="fill-[#111]"
                />
                <rect
                  x={d.x + d.w / 2 - 20}
                  y={d.y + d.h + 63}
                  width={40}
                  height={2}
                  rx={1}
                  className="fill-[#1a1a1a]"
                />
              </>
            )}
            {d.label === "Mobile" && (
              <rect
                x={d.x + d.w / 2 - 5}
                y={d.y + d.h + 71}
                width={10}
                height={2}
                rx={1}
                className="fill-[#1a1a1a]"
              />
            )}
            {d.label === "Tablet" && (
              <circle
                cx={d.x + d.w / 2}
                cy={d.y + d.h + 72}
                r={3}
                className="fill-[#141414] stroke-[#1a1a1a]"
                strokeWidth={0.5}
              />
            )}

            <MonoText
              x={d.x + d.w / 2}
              y={151}
              className="fill-[#252525] text-[7px]"
              textAnchor="middle"
            >
              {d.bp}
            </MonoText>
            <line
              x1={d.x + d.w / 2}
              y1={153}
              x2={d.x + d.w / 2}
              y2={157}
              className="stroke-[#1c3a25]"
              strokeWidth={1}
            />
          </motion.g>
        ))}

        <motion.rect
          x={37}
          y={104}
          width={86}
          height={14}
          rx={2}
          className="fill-[#00FF88]"
          opacity={0.04}
          animate={{ opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </SvgContainer>
    </div>
  );
}

// ─── 05: ARCHITECTURE VISUAL ─────────────────────────────────────────────────
export function ArchitectureVisual() {
  const nodes = [
    {
      x: 128,
      y: 34,
      label: "CDN",
      sub: "EDGE",
      color: "#00FF88",
      type: "circle" as const,
      accent: true,
    },
    {
      x: 128,
      y: 124,
      label: "API",
      sub: "REST",
      color: "#888",
      type: "circle" as const,
      accent: false,
    },
    {
      x: 268,
      y: 124,
      label: "WS",
      sub: "REALTIME",
      color: "#888",
      type: "circle" as const,
      accent: false,
    },
    {
      x: 128,
      y: 174,
      label: "POSTGRES",
      sub: "",
      color: "#666",
      type: "rect" as const,
      accent: false,
      w: 64,
      h: 24,
    },
    {
      x: 268,
      y: 174,
      label: "MSG QUEUE",
      sub: "",
      color: "#666",
      type: "rect" as const,
      accent: false,
      w: 64,
      h: 24,
    },
    {
      x: 390,
      y: 129,
      label: "CACHE",
      sub: "REDIS",
      color: "#00FF88",
      type: "rect" as const,
      accent: true,
      w: 64,
      h: 38,
    },
  ];

  const edges = [
    { from: 0, to: 1, dashed: true, marker: true, color: "#1e3a25" },
    {
      from: 0,
      to: 2,
      dashed: true,
      marker: true,
      color: "#1e3a25",
      curved: true,
    },
    { from: 1, to: 3, dashed: true, marker: false, color: "#222" },
    { from: 2, to: 4, dashed: true, marker: false, color: "#222" },
    { from: 3, to: 5, dashed: true, marker: true, color: "#222", curved: true },
    { from: 4, to: 5, dashed: true, marker: true, color: "#222", curved: true },
    {
      from: 5,
      to: 0,
      dashed: true,
      marker: false,
      color: "#1a3a25",
      curved: true,
      feedback: true,
    },
  ];

  const motionNodes = [
    { x: 500, y: 93, label: "FRAMER MOTION" },
    { x: 500, y: 125, label: "GSAP TIMELINE" },
    { x: 500, y: 157, label: "EVENT-DRIVEN" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      <SvgContainer viewBox="0 0 640 190">
        <defs>
          <marker
            id="arrw"
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerWidth={5}
            markerHeight={5}
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="context-stroke"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
          <GlowFilter id="ng" stdDeviation={2.5} />
        </defs>

        {edges.map((e, i) => {
          const a = nodes[e.from],
            b = nodes[e.to];
          let d = "";
          if (e.curved) {
            const mx = (a.x + b.x) / 2 + (e.feedback ? -40 : 40);
            const my = (a.y + b.y) / 2 + (e.feedback ? -30 : 20);
            d = `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
          } else {
            d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
          }
          return (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke={e.color}
              strokeWidth={e.feedback ? 0.5 : 1}
              strokeDasharray={e.dashed ? "4 4" : "0"}
              markerEnd={e.marker ? "url(#arrw)" : undefined}
              opacity={e.feedback ? 0.5 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: e.feedback ? 0.5 : 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            />
          );
        })}

        {edges.slice(0, 3).map((e, i) => {
          const a = nodes[e.from],
            b = nodes[e.to];
          return (
            <motion.circle
              key={`pulse-${i}`}
              r={2 + i * 0.5}
              className="fill-[#00FF88]"
              opacity={0.7}
              filter="url(#ng)"
              animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 0.8, 0] }}
              transition={{
                duration: 1.4 + i * 0.4,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}

        {nodes.map((n, i) => (
          <motion.g
            key={n.label}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1 + i * 0.1,
              duration: 0.35,
              ease: cinematicEase,
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            {n.type === "circle" ? (
              <>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.accent ? 22 : 20}
                  fill={n.accent ? "#060f0a" : "#0d0d0d"}
                  stroke={n.color}
                  strokeWidth={n.accent ? 1 : 0.75}
                />
                {n.accent && (
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={22}
                    className="fill-none stroke-[#00FF88]"
                    strokeWidth={1}
                    opacity={0.3}
                    animate={{ r: [22, 30], opacity: [0.3, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
              </>
            ) : (
              <rect
                x={n.x - n.w! / 2}
                y={n.y - n.h! / 2}
                width={n.w}
                height={n.h}
                rx={n.accent ? 6 : 4}
                fill={n.accent ? "#060f0a" : "#0d0d0d"}
                stroke={n.accent ? "#00FF88" : "#252525"}
                strokeWidth={0.75}
                opacity={n.accent ? 0.8 : 1}
              />
            )}
            <MonoText
              x={n.x}
              y={n.y - (n.sub ? 2 : 1)}
              className={`text-[8px] ${n.accent ? "font-bold" : "font-normal"}`}
              fill={n.color}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {n.label}
            </MonoText>
            {n.sub && (
              <MonoText
                x={n.x}
                y={n.y + 10}
                className="text-[6px]"
                fill={n.accent ? "#1c5c30" : "#2a2a2a"}
                textAnchor="middle"
              >
                {n.sub}
              </MonoText>
            )}
          </motion.g>
        ))}

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <line
            x1={422}
            y1={129}
            x2={460}
            y2={129}
            className="stroke-[#1a3a25]"
            strokeWidth={0.5}
            strokeDasharray="2 3"
          />
          {motionNodes.map((mn, i) => (
            <React.Fragment key={mn.label}>
              <rect
                x={460}
                y={mn.y - 12}
                width={80}
                height={24}
                rx={4}
                className="fill-[#0d0d0d] stroke-[#1c1c1c]"
                strokeWidth={0.5}
              />
              <MonoText
                x={500}
                y={mn.y + 1}
                className="fill-[#444] text-[7px]"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {mn.label}
              </MonoText>
              {i < 2 && (
                <line
                  x1={500}
                  y1={mn.y + 12}
                  x2={500}
                  y2={motionNodes[i + 1].y - 12}
                  className="stroke-[#1c1c1c]"
                  strokeWidth={0.5}
                  strokeDasharray="2 3"
                />
              )}
            </React.Fragment>
          ))}
          <line
            x1={460}
            y1={93}
            x2={422}
            y2={115}
            className="stroke-[#1c1c1c]"
            strokeWidth={0.5}
            strokeDasharray="2 3"
          />
          <line
            x1={460}
            y1={157}
            x2={422}
            y2={143}
            className="stroke-[#1c1c1c]"
            strokeWidth={0.5}
            strokeDasharray="2 3"
          />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <rect
            x={554}
            y={104}
            width={70}
            height={50}
            rx={6}
            className="fill-[#060f0a] stroke-[#1a3a1f]"
            strokeWidth={0.5}
          />
          <MonoText
            x={589}
            y={120}
            className="fill-[#1c5c30] text-[7px]"
            textAnchor="middle"
          >
            BFF
          </MonoText>
          <MonoText
            x={589}
            y={134}
            className="fill-[#1a3a1f] text-[6px]"
            textAnchor="middle"
          >
            PATTERN
          </MonoText>
          <motion.circle
            cx={589}
            cy={148}
            r={4}
            className="fill-[#00FF88]"
            opacity={0.2}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "589px 148px" }}
          />
        </motion.g>

        <motion.text
          fontFamily="monospace"
          fontSize={7}
          x={460}
          y={24}
          className="fill-[#1c1c1c] select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          EVENT-DRIVEN · MICROSERVICES · BFF · MOTION
        </motion.text>
      </SvgContainer>
    </div>
  );
}
