"use client";
import React, { useRef } from "react";
import { motion, useInView, Transition } from "framer-motion";

const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];
const springConfig: Transition = { type: "spring", stiffness: 200, damping: 20, mass: 1 };

export interface Service {
  index: string;
  label: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  visual: (visible: boolean) => React.ReactNode;
}

function SvgRoot({
  children,
  viewBox,
}: {
  children: React.ReactNode;
  viewBox: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full block overflow-visible drop-shadow-2xl"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur1" />
          <feGaussianBlur stdDeviation="4" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="db-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00FF88" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#006633" stopOpacity="0" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

function MonoLabel({
  x,
  y,
  children,
  anchor = "middle",
  size = "8px",
  fill = "#333",
  ...rest
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "middle" | "start" | "end";
  size?: string;
  fill?: string;
} & React.SVGProps<SVGTextElement>) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily="monospace"
      fontSize={size}
      fill={fill}
      className="select-none tracking-wider"
      {...rest}
    >
      {children}
    </text>
  );
}

function IsoPlane({
  yOffset,
  size = 140,
  color,
  visible,
  delay,
  children,
}: {
  yOffset: number;
  size?: number;
  color: string;
  visible: boolean;
  delay: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? yOffset : 0 }}
      transition={{ delay: visible ? delay : 0, ...springConfig }}
    >
      <g transform={`scale(1, 0.5) rotate(-45)`}>
        <rect
          x={-size / 2}
          y={-size / 2}
          width={size}
          height={size}
          rx={8}
          fill="#020804"
          fillOpacity={0.9}
          stroke={color}
          strokeWidth={1.5}
        />
        <rect
          x={-size / 2 + 4}
          y={-size / 2 + 4}
          width={size - 8}
          height={size - 8}
          rx={6}
          fill={color}
          fillOpacity={0.05}
          stroke={color}
          strokeWidth={0.5}
          strokeDasharray="4 4"
        />
        {children}
      </g>
    </motion.g>
  );
}

// ─── VISUALS ──────────────────────────────────────────────────────────────────

export function FullStackIsometricVisual({ visible }: { visible: boolean }) {
  const cx = 180;
  const cy = 110;

  const LAYERS = {
    UI:  { y: -55, color: "#00FF88", label: "NEXT.JS CLIENT" },
    API: { y:   0, color: "#00CC70", label: "NODE.JS CORE"  },
    DB:  { y:  55, color: "#008844", label: "POSTGRES DB"   },
  };

  const isoSize = 130;
  const edgeOffset = isoSize * 0.35;

  return (
    <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.08)_0%,transparent_70%)] pointer-events-none"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <SvgRoot viewBox="0 0 360 220">
        <g transform={`translate(${cx}, ${cy})`}>

          {/* DB Layer */}
          <IsoPlane yOffset={LAYERS.DB.y} color={LAYERS.DB.color} visible={visible} delay={0.2} size={isoSize}>
            <circle cx="0" cy="0" r="30" fill="none" stroke={LAYERS.DB.color} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="20" fill="none" stroke={LAYERS.DB.color} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="8"  fill={LAYERS.DB.color} />
            <line x1="-30" y1="0" x2="30" y2="0" stroke={LAYERS.DB.color} strokeWidth="0.5" opacity="0.5" />
            <line x1="0" y1="-30" x2="0" y2="30" stroke={LAYERS.DB.color} strokeWidth="0.5" opacity="0.5" />
          </IsoPlane>

          {/* Pillars DB → API */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ delay: visible ? 0.6 : 0, duration: 1 }}
          >
            {[-edgeOffset, edgeOffset].map((x, i) => (
              <line key={`pillar-db-${i}`} x1={x} y1={LAYERS.DB.y} x2={x} y2={LAYERS.API.y}
                stroke={LAYERS.DB.color} strokeWidth="1.5" strokeDasharray="2 4" opacity="0.6" />
            ))}
            <motion.circle
              cx={edgeOffset} r={2.5} fill={LAYERS.API.color} filter="url(#neon-glow)"
              animate={{ cy: [LAYERS.DB.y, LAYERS.API.y, LAYERS.API.y, LAYERS.DB.y] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.9] }}
            />
          </motion.g>

          {/* API Layer */}
          <IsoPlane yOffset={LAYERS.API.y} color={LAYERS.API.color} visible={visible} delay={0.4} size={isoSize}>
            <rect x="-20" y="-20" width="40" height="40" rx="4" fill="none" stroke={LAYERS.API.color} strokeWidth="1.5" />
            <circle cx="-20" cy="-20" r="3" fill={LAYERS.API.color} />
            <circle cx="20"  cy="20"  r="3" fill={LAYERS.API.color} />
            <circle cx="20"  cy="-20" r="3" fill={LAYERS.API.color} />
            <circle cx="-20" cy="20"  r="3" fill={LAYERS.API.color} />
            <motion.circle
              cx="0" cy="0" r="6" fill={LAYERS.API.color} filter="url(#neon-glow)"
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <path d="M-40 0 L-20 0 M20 0 L40 0 M0 -40 L0 -20 M0 20 L0 40"
              stroke={LAYERS.API.color} strokeWidth="1" strokeDasharray="2 2" />
          </IsoPlane>

          {/* Pillars API → UI */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ delay: visible ? 0.8 : 0, duration: 1 }}
          >
            {[-edgeOffset, edgeOffset].map((x, i) => (
              <line key={`pillar-api-${i}`} x1={x} y1={LAYERS.API.y} x2={x} y2={LAYERS.UI.y}
                stroke={LAYERS.API.color} strokeWidth="1.5" strokeDasharray="2 4" opacity="0.6" />
            ))}
            <motion.circle
              cx={-edgeOffset} r={2.5} fill={LAYERS.UI.color} filter="url(#neon-glow)"
              animate={{ cy: [LAYERS.UI.y, LAYERS.API.y, LAYERS.API.y, LAYERS.UI.y] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1, times: [0, 0.4, 0.5, 0.9] }}
            />
          </motion.g>

          {/* UI Layer */}
          <IsoPlane yOffset={LAYERS.UI.y} color={LAYERS.UI.color} visible={visible} delay={0.6} size={isoSize}>
            <rect x="-40" y="-40" width="80" height="12" rx="2" fill={LAYERS.UI.color} fillOpacity="0.2" stroke={LAYERS.UI.color} strokeWidth="1" />
            <circle cx="-30" cy="-34" r="2" fill={LAYERS.UI.color} />
            <circle cx="-22" cy="-34" r="2" fill={LAYERS.UI.color} />
            <rect x="-40" y="-20" width="20" height="60" rx="2" fill="none" stroke={LAYERS.UI.color} strokeWidth="1" />
            <line x1="-34" y1="-10" x2="-26" y2="-10" stroke={LAYERS.UI.color} strokeWidth="1.5" />
            <line x1="-34" y1="0"   x2="-26" y2="0"   stroke={LAYERS.UI.color} strokeWidth="1.5" />
            <line x1="-34" y1="10"  x2="-26" y2="10"  stroke={LAYERS.UI.color} strokeWidth="1.5" />
            <rect x="-12" y="-20" width="52" height="26" rx="2" fill="none" stroke={LAYERS.UI.color} strokeWidth="1" />
            <rect x="-12" y="14"  width="22" height="26" rx="2" fill="none" stroke={LAYERS.UI.color} strokeWidth="1" />
            <rect x="18"  y="14"  width="22" height="26" rx="2" fill={LAYERS.UI.color} fillOpacity="0.1" stroke={LAYERS.UI.color} strokeWidth="1" />
          </IsoPlane>

          {/* Labels */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ delay: visible ? 1.2 : 0, duration: 1 }}
          >
            <line x1="-65" y1={LAYERS.UI.y}  x2="-100" y2={LAYERS.UI.y}  stroke={LAYERS.UI.color}  strokeWidth="0.5" strokeDasharray="2 2" />
            <MonoLabel x={-105} y={LAYERS.UI.y  + 3} anchor="end"   size="6.5px" fill={LAYERS.UI.color}  fontWeight="bold">{LAYERS.UI.label}</MonoLabel>
            <line x1="65"  y1={LAYERS.API.y} x2="100"  y2={LAYERS.API.y} stroke={LAYERS.API.color} strokeWidth="0.5" strokeDasharray="2 2" />
            <MonoLabel x={105}  y={LAYERS.API.y + 3} anchor="start" size="6.5px" fill={LAYERS.API.color} fontWeight="bold">{LAYERS.API.label}</MonoLabel>
            <line x1="-65" y1={LAYERS.DB.y}  x2="-100" y2={LAYERS.DB.y}  stroke={LAYERS.DB.color}  strokeWidth="0.5" strokeDasharray="2 2" />
            <MonoLabel x={105} y={LAYERS.DB.y  + 3} anchor="end"   size="6.5px" fill={LAYERS.DB.color}  fontWeight="bold">{LAYERS.DB.label}</MonoLabel>
          </motion.g>

          {visible && (
            <motion.g>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`pulse-${i}`}
                  cx={0} cy={0} r={1.5} fill="#00FF88" filter="url(#neon-glow)"
                  animate={{ y: [LAYERS.UI.y + 10, LAYERS.DB.y - 10], opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                  transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, ease: "linear" }}
                />
              ))}
            </motion.g>
          )}
        </g>
      </SvgRoot>
    </div>
  );
}

export function ResponsiveUIVisual({ visible }: { visible: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <SvgRoot viewBox="0 0 400 240">

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: visible ? 0.6 : 0 }}
        >
          <path d="M 200 90 L 85 135"  fill="none" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <path d="M 200 90 L 315 150" fill="none" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </motion.g>

        {/* Desktop */}
        <motion.g
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30, scale: visible ? 1 : 0.9 }}
          transition={{ duration: 0.8, delay: visible ? 0.1 : 0, ...springConfig }}
        >
          <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <rect x={90} y={15} width={220} height={140} rx={6} fill="#020804" fillOpacity={0.95} stroke="#00FF88" strokeWidth={1} strokeOpacity={0.6} />
            <path d="M 90 21 Q 90 15 96 15 L 304 15 Q 310 15 310 21 L 310 35 L 90 35 Z" fill="#00FF88" fillOpacity={0.1} />
            <circle cx={102} cy={25} r={3} fill="#ff5f56" opacity={0.8} />
            <circle cx={112} cy={25} r={3} fill="#ffbd2e" opacity={0.8} />
            <circle cx={122} cy={25} r={3} fill="#27c93f" opacity={0.8} />
            <line x1={140} y1={25} x2={290} y2={25} stroke="#00FF88" strokeWidth={4} strokeOpacity={0.2} strokeLinecap="round" />
            <motion.rect x={100} y={45} width={200} height={12} rx={3} fill="#00FF88" fillOpacity={0.3}
              initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
              transition={{ delay: visible ? 0.5 : 0, ...springConfig }} style={{ transformOrigin: "100px 45px" }} />
            <motion.rect x={100} y={65} width={200} height={35} rx={4} fill="#00FF88" fillOpacity={0.15}
              initial={{ scale: 0 }} animate={{ scale: visible ? 1 : 0 }}
              transition={{ delay: visible ? 0.6 : 0, ...springConfig }} style={{ transformOrigin: "200px 82px" }} />
            {[0, 1, 2].map((i) => (
              <motion.rect key={`desk-col-${i}`} x={100 + i * 70} y={110} width={60} height={35} rx={4} fill="#00FF88" fillOpacity={0.2}
                initial={{ scale: 0 }} animate={{ scale: visible ? 1 : 0 }}
                transition={{ delay: visible ? 0.7 + i * 0.1 : 0, ...springConfig }} style={{ transformOrigin: `${130 + i * 70}px 127px` }} />
            ))}
            <rect x={240} y={0} width={65} height={14} rx={2} fill="#010603" stroke="#00FF88" strokeWidth={0.5} />
            <MonoLabel x={272} y={10} size="6px" fill="#00FF88">lg:flex-row</MonoLabel>
          </motion.g>
        </motion.g>

        {/* Tablet */}
        <motion.g
          initial={{ opacity: 0, x: 80, scale: 0.8 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 80, scale: visible ? 1 : 0.8 }}
          transition={{ duration: 0.8, delay: visible ? 0.25 : 0, ...springConfig }}
        >
          <motion.g animate={{ y: [0, 5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <rect x={25} y={60} width={120} height={150} rx={8} fill="#020804" fillOpacity={0.95} stroke="#00FF88" strokeWidth={1} strokeOpacity={0.8} />
            <rect x={29} y={64} width={112} height={142} rx={6} fill="#00FF88" fillOpacity={0.03} />
            <circle cx={85} cy={70} r={2} fill="#00FF88" opacity={0.5} />
            <motion.rect x={35} y={80} width={100} height={10} rx={2} fill="#00FF88" fillOpacity={0.3}
              initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
              transition={{ delay: visible ? 0.8 : 0, ...springConfig }} style={{ transformOrigin: "35px 80px" }} />
            <motion.rect x={35} y={100} width={100} height={35} rx={4} fill="#00FF88" fillOpacity={0.15}
              initial={{ scale: 0 }} animate={{ scale: visible ? 1 : 0 }}
              transition={{ delay: visible ? 0.9 : 0, ...springConfig }} style={{ transformOrigin: "85px 117px" }} />
            {[0, 1].map((i) => (
              <motion.rect key={`tab-col-${i}`} x={35 + i * 55} y={145} width={45} height={50} rx={4} fill="#00FF88" fillOpacity={0.2}
                initial={{ scale: 0 }} animate={{ scale: visible ? 1 : 0 }}
                transition={{ delay: visible ? 1.0 + i * 0.1 : 0, ...springConfig }} style={{ transformOrigin: `${57 + i * 55}px 170px` }} />
            ))}
            <rect x={15} y={45} width={75} height={14} rx={2} fill="#010603" stroke="#00FF88" strokeWidth={0.5} />
            <MonoLabel x={52} y={55} size="6px" fill="#00FF88">md:grid-cols-2</MonoLabel>
          </motion.g>
        </motion.g>

        {/* Mobile */}
        <motion.g
          initial={{ opacity: 0, x: -80, scale: 0.8 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -80, scale: visible ? 1 : 0.8 }}
          transition={{ duration: 0.8, delay: visible ? 0.4 : 0, ...springConfig }}
        >
          <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
            <rect x={275} y={80} width={75} height={140} rx={12} fill="#020804" fillOpacity={0.98} stroke="#00FF88" strokeWidth={1} />
            <rect x={279} y={84} width={67} height={132} rx={10} fill="#00FF88" fillOpacity={0.05} />
            <path d="M 302 84 L 322 84 Q 326 84 326 88 L 326 90 Q 326 94 322 94 L 302 94 Q 298 94 298 90 L 298 88 Q 298 84 302 84 Z" fill="#00FF88" fillOpacity={0.2} />
            <motion.rect x={285} y={105} width={55} height={8} rx={2} fill="#00FF88" fillOpacity={0.3}
              initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
              transition={{ delay: visible ? 1.1 : 0, ...springConfig }} style={{ transformOrigin: "285px 105px" }} />
            <motion.rect x={285} y={120} width={55} height={30} rx={4} fill="#00FF88" fillOpacity={0.15}
              initial={{ scale: 0 }} animate={{ scale: visible ? 1 : 0 }}
              transition={{ delay: visible ? 1.2 : 0, ...springConfig }} style={{ transformOrigin: "312px 135px" }} />
            {[0, 1, 2].map((i) => (
              <motion.rect key={`mob-row-${i}`} x={285} y={158 + i * 16} width={55} height={10} rx={3} fill="#00FF88" fillOpacity={0.2}
                initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
                transition={{ delay: visible ? 1.3 + i * 0.1 : 0, ...springConfig }} style={{ transformOrigin: "285px 0px" }} />
            ))}
            <rect x={315} y={65} width={50} height={14} rx={2} fill="#010603" stroke="#00FF88" strokeWidth={0.5} />
            <MonoLabel x={340} y={75} size="6px" fill="#00FF88">flex-col</MonoLabel>
            {visible && (
              <motion.circle cx={312} cy={162} r={3} fill="#00FF88" filter="url(#neon-glow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.5, 2, 0.5], opacity: [0, 0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2.5 }} />
            )}
          </motion.g>
        </motion.g>

      </SvgRoot>
    </div>
  );
}

export function CreativeAnimationVisual({ visible }: { visible: boolean }) {
  const times: number[] = [0, 0.15, 0.2, 0.35, 0.55, 0.65, 0.7, 0.85, 1];
  const t: Transition = { duration: 6, repeat: Infinity, ease: "easeInOut", times };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <SvgRoot viewBox="0 0 400 240">
        <motion.g
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.95 }}
          transition={{ duration: 0.8, ease: cinematicEase }}
        >
          {/* Easing graph */}
          <MonoLabel x={25} y={65} anchor="start" size="6.5px" fill="#00FF88">ease: [0.76, 0, 0.24, 1]</MonoLabel>
          <path d="M 25 80 L 25 150 L 95 150" fill="none" stroke="#1a3a2a" strokeWidth={1} />
          <motion.path d="M 25 150 C 40 80, 50 80, 95 80" fill="none" stroke="#00FF88" strokeWidth={1.5}
            animate={{ pathLength: [0, 0, 0, 1, 1, 1, 1, 0, 0] }} transition={t} />
          <line x1={25} y1={115} x2={95} y2={115} stroke="#0d1a11" strokeWidth={1} strokeDasharray="2 2" />
          <line x1={60} y1={80}  x2={60} y2={150} stroke="#0d1a11" strokeWidth={1} strokeDasharray="2 2" />

          {/* Timeline scrubber */}
          <MonoLabel x={285} y={65} anchor="start" size="6.5px" fill="#00FF88">timeline.play()</MonoLabel>
          <g stroke="#1a3a2a" strokeWidth={1}>
            <line x1={285} y1={90}  x2={365} y2={90}  />
            <line x1={285} y1={110} x2={365} y2={110} />
            <line x1={285} y1={130} x2={365} y2={130} />
          </g>
          <g fill="#00CC70">
            <rect x={285} y={88}  width={4} height={4} transform="rotate(45 287 90)"  />
            <rect x={345} y={88}  width={4} height={4} transform="rotate(45 347 90)"  />
            <rect x={295} y={108} width={4} height={4} transform="rotate(45 297 110)" />
            <rect x={355} y={108} width={4} height={4} transform="rotate(45 357 110)" />
            <rect x={305} y={128} width={4} height={4} transform="rotate(45 307 130)" />
            <rect x={365} y={128} width={4} height={4} transform="rotate(45 367 130)" />
          </g>
          <motion.line y1={75} y2={145} stroke="#00FF88" strokeWidth={1}
            animate={{ x: [285, 285, 285, 365, 365, 365, 365, 285, 285] }} transition={t} />
          <motion.polygon points="0,0 6,0 3,4" fill="#00FF88"
            animate={{ x: [282, 282, 282, 362, 362, 362, 362, 282, 282], y: [72, 72, 72, 72, 72, 72, 72, 72, 72] }}
            transition={t} />

          {/* Mobile micro-interaction */}
          <g>
            <rect x={140} y={35} width={120} height={170} rx={12} fill="#010402" stroke="#1a3a2a" strokeWidth={1} />
            <rect x={185} y={35} width={30}  height={6}   rx={3}  fill="#1a3a2a" />
            <g style={{ clipPath: "url(#screen-clip)" }}>
              <clipPath id="screen-clip">
                <rect x={141} y={36} width={118} height={168} rx={11} />
              </clipPath>
              <motion.g animate={{ y: [65, 65, 65, -40, -40, -40, -40, 65, 65], opacity: [1, 1, 1, 0, 0, 0, 0, 1, 1] }} transition={t}>
                <rect x={150} y={0} width={100} height={32} rx={6} fill="#020804" stroke="#00FF88" strokeWidth={0.5} strokeOpacity={0.4} />
                <rect x={156} y={6} width={20}  height={20} rx={4} fill="#00FF88" fillOpacity={0.2} />
                <rect x={184} y={10} width={50} height={4}  rx={2} fill="#00FF88" fillOpacity={0.5} />
                <rect x={184} y={18} width={30} height={3}  rx={1.5} fill="#00FF88" fillOpacity={0.3} />
              </motion.g>
              <motion.g animate={{ y: [145, 145, 145, 230, 230, 230, 230, 145, 145], opacity: [1, 1, 1, 0, 0, 0, 0, 1, 1] }} transition={t}>
                <rect x={150} y={0} width={100} height={32} rx={6} fill="#020804" stroke="#00FF88" strokeWidth={0.5} strokeOpacity={0.4} />
                <rect x={156} y={6} width={20}  height={20} rx={4} fill="#00FF88" fillOpacity={0.2} />
                <rect x={184} y={10} width={50} height={4}  rx={2} fill="#00FF88" fillOpacity={0.5} />
                <rect x={184} y={18} width={30} height={3}  rx={1.5} fill="#00FF88" fillOpacity={0.3} />
              </motion.g>
              <motion.g animate={{ y: [105, 105, 105, 50, 50, 50, 50, 105, 105] }} transition={t}>
                <motion.rect x={150} y={0} width={100} rx={6} fill="#020804" stroke="#00FF88" strokeWidth={0.5} strokeOpacity={0.8}
                  animate={{ height: [32, 32, 32, 140, 140, 140, 140, 32, 32] }} transition={t} />
                <motion.g animate={{ opacity: [1, 1, 1, 0, 0, 0, 0, 1, 1] }} transition={t}>
                  <rect x={156} y={6}  width={20} height={20} rx={4}   fill="#00FF88" fillOpacity={0.4} />
                  <rect x={184} y={10} width={50} height={4}  rx={2}   fill="#00FF88" fillOpacity={0.8} />
                  <rect x={184} y={18} width={30} height={3}  rx={1.5} fill="#00FF88" fillOpacity={0.5} />
                </motion.g>
                <motion.g animate={{ opacity: [0, 0, 0, 1, 1, 1, 1, 0, 0] }} transition={t}>
                  <rect x={156} y={6}   width={88} height={70} rx={4}   fill="#00FF88" fillOpacity={0.15} />
                  <polygon points="195,35 208,41 195,47" fill="#00FF88" opacity={0.6} />
                  <rect x={156} y={84}  width={70} height={5}  rx={2.5} fill="#00FF88" fillOpacity={0.8} />
                  <rect x={156} y={95}  width={88} height={3}  rx={1.5} fill="#00FF88" fillOpacity={0.4} />
                  <rect x={156} y={103} width={88} height={3}  rx={1.5} fill="#00FF88" fillOpacity={0.4} />
                  <rect x={156} y={111} width={60} height={3}  rx={1.5} fill="#00FF88" fillOpacity={0.4} />
                  <circle cx={164} cy={14} r={6} fill="#010603" stroke="#00FF88" strokeWidth={0.5} />
                  <path d="M 165 11 L 162 14 L 165 17" fill="none" stroke="#00FF88" strokeWidth={1} strokeLinecap="round" />
                </motion.g>
              </motion.g>
            </g>
            <motion.g
              animate={{ x: [240, 200, 200, 200, 200, 164, 164, 240, 240], y: [220, 120, 120, 120, 120, 64, 64, 220, 220] }}
              transition={t}
            >
              <motion.circle r={10} fill="#00FF88"
                animate={{ scale: [1, 1, 2.5, 1, 1, 1, 2.5, 1, 1], opacity: [0, 0, 0.5, 0, 0, 0, 0.5, 0, 0] }} transition={t} />
              <motion.path d="M 0 0 L 10 10 L 4 11 L 0 16 Z" fill="#00FF88" stroke="#010402" strokeWidth={1}
                animate={{ scale: [1, 1, 0.8, 1, 1, 1, 0.8, 1, 1] }} transition={t} />
            </motion.g>
          </g>

          <rect x={145} y={18}  width={45} height={12} rx={2} fill="#010402" stroke="#00FF88" strokeWidth={0.5} />
          <MonoLabel x={167} y={26} size="5px" fill="#00FF88">layoutId</MonoLabel>
          <rect x={215} y={215} width={40} height={12} rx={2} fill="#010402" stroke="#00FF88" strokeWidth={0.5} />
          <MonoLabel x={235} y={223} size="5px" fill="#00FF88">onClick</MonoLabel>
        </motion.g>
      </SvgRoot>
    </div>
  );
}

export function PaymentIntegrationVisual({ visible }: { visible: boolean }) {
  const t: Transition = { duration: 4, repeat: Infinity, ease: "easeInOut" };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <SvgRoot viewBox="0 0 400 240">

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ delay: visible ? 0.3 : 0, duration: 1 }}>
          <line x1="80" y1="120" x2="320" y2="120" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </motion.g>

        {visible && (
          <motion.g>
            <motion.rect width="16" height="8" rx="4" fill="#00FF88" filter="url(#neon-glow)" y="116"
              animate={{ x: [80, 184, 184, 184], opacity: [0, 1, 0, 0], scale: [0.8, 1, 0.5, 0.5] }}
              transition={{ ...t, times: [0, 0.15, 0.3, 1] }} />
            <motion.circle r="4" fill="#00FF88" filter="url(#neon-glow)" cy="120"
              animate={{ cx: [216, 216, 280, 280], opacity: [0, 0, 1, 0], scale: [0, 0, 1, 0] }}
              transition={{ ...t, times: [0, 0.5, 0.65, 1] }} />
          </motion.g>
        )}

        {/* Client */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
          transition={{ delay: visible ? 0.1 : 0, ...springConfig }}>
          <rect x="40" y="70" width="80" height="100" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="44" y="74" width="72" height="92"  rx="6" fill="#00FF88" fillOpacity="0.05" />
          <rect x="50" y="85" width="60" height="36"  rx="4" fill="#00FF88" fillOpacity="0.15" stroke="#00FF88" strokeWidth="0.5" />
          <rect x="50" y="95" width="60" height="6"        fill="#020804" opacity="0.8" />
          <rect x="55" y="107" width="12" height="8" rx="2" fill="#00FF88" fillOpacity="0.5" />
          <motion.rect x="50" y="135" width="60" height="16" rx="4" fill="#00FF88" fillOpacity="0.8"
            animate={{ scale: [1, 0.95, 1, 1, 1], fillOpacity: [0.8, 1, 0.8, 0.8, 0.8] }}
            transition={{ ...t, times: [0, 0.1, 0.2, 0.8, 1] }} style={{ transformOrigin: "80px 143px" }} />
          <MonoLabel x={80} y={145} size="6px" fill="#010603" fontWeight="bold">PAY NOW</MonoLabel>
          <rect x="55" y="160" width="50" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={80} y={168} size="5px" fill="#00FF88">Checkout</MonoLabel>
        </motion.g>

        {/* Gateway */}
        <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
          transition={{ delay: visible ? 0.3 : 0, ...springConfig }}>
          <motion.circle cx="200" cy="120" r="35" fill="none" stroke="#00FF88" strokeWidth="1" strokeDasharray="10 5" opacity="0.4"
            animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 120px" }} />
          <motion.circle cx="200" cy="120" r="42" fill="none" stroke="#00FF88" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.6"
            animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 120px" }} />
          <polygon points="200,85 225,95 225,125 200,145 175,125 175,95" fill="#020804" stroke="#00FF88" strokeWidth="1.5" />
          <path d="M 193 115 L 193 110 Q 193 100 200 100 Q 207 100 207 110 L 207 115" fill="none" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" />
          <motion.rect x="190" y="115" width="20" height="14" rx="2" fill="#00FF88" fillOpacity="0.3" stroke="#00FF88" strokeWidth="1"
            animate={{ fillOpacity: [0.3, 0.3, 0.8, 0.3, 0.3] }} transition={{ ...t, times: [0, 0.2, 0.4, 0.6, 1] }} />
          <circle cx="200" cy="122" r="2" fill="#010603" />
          <rect x="175" y="152" width="50" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={200} y={160} size="5px" fill="#00FF88">GATEWAY</MonoLabel>
          <motion.circle cx="200" cy="120" r="30" fill="none" stroke="#00FF88" strokeWidth="2" filter="url(#neon-glow)"
            animate={{ scale: [1, 1, 1.5, 1, 1], opacity: [0, 0, 0.6, 0, 0] }} transition={{ ...t, times: [0, 0.3, 0.5, 0.6, 1] }} />
        </motion.g>

        {/* Server */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
          transition={{ delay: visible ? 0.5 : 0, ...springConfig }}>
          <rect x="280" y="70" width="80" height="100" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="284" y="74" width="72" height="92"  rx="6" fill="#00FF88" fillOpacity="0.05" />
          <ellipse cx="320" cy="90"  rx="24" ry="8" fill="none"       stroke="#00FF88" strokeWidth="1" />
          <ellipse cx="320" cy="100" rx="24" ry="8" fill="none"       stroke="#00FF88" strokeWidth="1" />
          <ellipse cx="320" cy="110" rx="24" ry="8" fill="#00FF88" fillOpacity="0.1" stroke="#00FF88" strokeWidth="1" />
          <motion.g animate={{ opacity: [0, 0, 0, 1, 1, 0] }} transition={{ ...t, times: [0, 0.6, 0.61, 0.8, 0.95, 1] }}>
            <circle cx="320" cy="135" r="14" fill="#00FF88" fillOpacity="0.2" stroke="#00FF88" strokeWidth="1" />
            <motion.path d="M 313 135 L 318 140 L 327 130" fill="none" stroke="#00FF88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              animate={{ pathLength: [0, 0, 0, 1, 1, 0] }} transition={{ ...t, times: [0, 0.6, 0.61, 0.8, 0.95, 1] }} />
          </motion.g>
          <rect x="295" y="160" width="50" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={320} y={168} size="5px" fill="#00FF88">Webhook</MonoLabel>
        </motion.g>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ delay: visible ? 0.7 : 0, duration: 1 }}>
          <MonoLabel x={140} y={105} size="5px" fill="#00FF88">TLS / AES-256</MonoLabel>
          <MonoLabel x={260} y={105} size="5px" fill="#00FF88">200 OK</MonoLabel>
        </motion.g>

      </SvgRoot>
    </div>
  );
}

export function AuthenticationVisual({ visible }: { visible: boolean }) {
  const t: Transition = { duration: 6, repeat: Infinity, ease: "easeInOut" };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <SvgRoot viewBox="0 0 400 240">

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ delay: visible ? 0.6 : 0, duration: 1 }}>
          <line x1="120" y1="50" x2="280" y2="50" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <line x1="280" y1="70" x2="120" y2="70" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <path d="M 100 95 L 160 145" fill="none" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </motion.g>

        {visible && (
          <motion.g>
            <motion.rect width="12" height="6" rx="3" fill="#00FF88" filter="url(#neon-glow)"
              animate={{ x: [120, 268, 268, 268], y: [47, 47, 47, 47], opacity: [0, 1, 0, 0], scale: [0.5, 1, 0.5, 0.5] }}
              transition={{ ...t, times: [0, 0.15, 0.25, 1] }} />
            <motion.g animate={{ opacity: [0, 0, 1, 0, 0] }} transition={{ ...t, times: [0, 0.2, 0.25, 0.35, 1] }}>
              <circle cx="320" cy="50" r="20" fill="none" stroke="#00FF88" strokeWidth="2" filter="url(#neon-glow)" />
            </motion.g>
            <motion.g
              animate={{
                x: [280, 280, 120, 120, 100, 100, 160, 160],
                y: [70,  70,  70,  70,  95,  95,  145, 145],
                opacity: [0, 1, 1, 0, 0, 1, 1, 0],
                scale:   [0.5, 1, 1, 0.5, 0.5, 1, 1, 0.5],
              }}
              transition={{ ...t, times: [0, 0.25, 0.3, 0.45, 0.5, 0.6, 0.75, 0.8] }}
            >
              <rect x="-10" y="-8" width="20" height="4" rx="1" fill="#00FF88" filter="url(#neon-glow)" />
              <rect x="-10" y="-2" width="20" height="4" rx="1" fill="#00CC70" />
              <rect x="-10" y="4"  width="20" height="4" rx="1" fill="#008844" />
            </motion.g>
          </motion.g>
        )}

        {/* Client */}
        <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
          transition={{ delay: visible ? 0.1 : 0, ...springConfig }}>
          <rect x="40" y="20" width="80" height="80" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="44" y="24" width="72" height="72" rx="6" fill="#00FF88" fillOpacity="0.05" />
          <circle cx="80" cy="45" r="10" fill="none" stroke="#00FF88" strokeWidth="1.5" />
          <path d="M 60 70 Q 80 45 100 70" fill="none" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="55" y="85" width="50" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={80} y={93} size="5px" fill="#00FF88">Frontend</MonoLabel>
        </motion.g>

        {/* Auth Server */}
        <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
          transition={{ delay: visible ? 0.3 : 0, ...springConfig }}>
          <rect x="280" y="20" width="80" height="80" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="284" y="24" width="72" height="72" rx="6" fill="#00FF88" fillOpacity="0.05" />
          <path d="M 320 35 L 335 42 L 335 55 Q 320 70 320 70 Q 320 70 305 55 L 305 42 Z" fill="none" stroke="#00FF88" strokeWidth="1.5" />
          <circle cx="320" cy="48" r="4" fill="#00FF88" opacity="0.8" />
          <line x1="320" y1="52" x2="320" y2="60" stroke="#00FF88" strokeWidth="1.5" />
          <rect x="285" y="85" width="70" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={320} y={93} size="5px" fill="#00FF88">Auth Provider</MonoLabel>
        </motion.g>

        {/* Protected Resource */}
        <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
          transition={{ delay: visible ? 0.5 : 0, ...springConfig }}>
          <rect x="140" y="130" width="120" height="80" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="144" y="134" width="112" height="72" rx="6" fill="#00FF88" fillOpacity="0.05" />
          <motion.path d="M 190 160 v -10 a 10 10 0 0 1 20 0 v 10" fill="none" strokeWidth="2.5" strokeLinecap="round"
            animate={{
              y: [0, 0, 0, -8, -8, 0],
              stroke: ["#ff5f56", "#ff5f56", "#ff5f56", "#00FF88", "#00FF88", "#ff5f56"],
            }}
            transition={{ ...t, times: [0, 0.75, 0.79, 0.85, 0.95, 1] }} />
          <motion.rect x="185" y="160" width="30" height="20" rx="4" fill="#020804" strokeWidth="2"
            animate={{ stroke: ["#ff5f56", "#ff5f56", "#ff5f56", "#00FF88", "#00FF88", "#ff5f56"] }}
            transition={{ ...t, times: [0, 0.75, 0.79, 0.85, 0.95, 1] }} />
          <motion.circle cx="200" cy="170" r="3"
            animate={{ fill: ["#ff5f56", "#ff5f56", "#ff5f56", "#00FF88", "#00FF88", "#ff5f56"] }}
            transition={{ ...t, times: [0, 0.75, 0.79, 0.85, 0.95, 1] }} />
          <motion.g animate={{ opacity: [1, 1, 1, 0, 0, 1] }} transition={{ ...t, times: [0, 0.75, 0.79, 0.85, 0.95, 1] }}>
            <MonoLabel x={200} y={195} size="6px" fill="#ff5f56" fontWeight="bold">LOCKED</MonoLabel>
          </motion.g>
          <motion.g animate={{ opacity: [0, 0, 0, 1, 1, 0] }} transition={{ ...t, times: [0, 0.75, 0.79, 0.85, 0.95, 1] }}>
            <MonoLabel x={200} y={195} size="6px" fill="#00FF88" fontWeight="bold" filter="url(#neon-glow)">ACCESS GRANTED</MonoLabel>
          </motion.g>
          <rect x="155" y="200" width="90" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={200} y={208} size="5px" fill="#00FF88">Protected Resource</MonoLabel>
        </motion.g>

      </SvgRoot>
    </div>
  );
}


export function PerformanceDeploymentVisual({ visible }: { visible: boolean }) {
  const t: Transition = { duration: 4, repeat: Infinity, ease: "easeInOut" };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <SvgRoot viewBox="0 0 400 240">

        {/* Pipeline connections */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ delay: visible ? 0.6 : 0, duration: 1 }}
        >
          <line x1="120" y1="120" x2="150" y2="120" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <line x1="250" y1="120" x2="280" y2="120" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </motion.g>

        {/* Flow particles */}
        {visible && (
          <motion.g>
            <motion.circle
              r="3" fill="#00FF88" filter="url(#neon-glow)" cy="120"
              animate={{ cx: [120, 150], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
            />
            <motion.circle
              r="3" fill="#00FF88" filter="url(#neon-glow)" cy="120"
              animate={{ cx: [250, 280], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1, times: [0, 0.5, 1] }}
            />
          </motion.g>
        )}

        {/* ─── BUILD: Docker Container ─── */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -30 }}
          transition={{ delay: visible ? 0.1 : 0, ...springConfig }}
        >
          <rect x="40" y="70" width="80" height="100" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="44" y="74" width="72" height="92" rx="6" fill="#00FF88" fillOpacity="0.05" />
          {/* Container layers stacking in */}
          <motion.rect
            x="48" y="82" width="64" height="16" rx="3" fill="#00FF88" fillOpacity="0.25" stroke="#00FF88" strokeWidth="0.5"
            initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
            transition={{ delay: visible ? 0.4 : 0, ...springConfig }} style={{ transformOrigin: "48px 90px" }}
          />
          <motion.rect
            x="48" y="104" width="64" height="16" rx="3" fill="#00FF88" fillOpacity="0.18" stroke="#00FF88" strokeWidth="0.5"
            initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
            transition={{ delay: visible ? 0.5 : 0, ...springConfig }} style={{ transformOrigin: "48px 112px" }}
          />
          <motion.rect
            x="48" y="126" width="64" height="16" rx="3" fill="#00FF88" fillOpacity="0.12" stroke="#00FF88" strokeWidth="0.5"
            initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }}
            transition={{ delay: visible ? 0.6 : 0, ...springConfig }} style={{ transformOrigin: "48px 134px" }}
          />
          <rect x="55" y="160" width="50" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={80} y={168} size="5px" fill="#00FF88">Docker</MonoLabel>
        </motion.g>

        {/* ─── OPTIMIZE: Performance Gauge ─── */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
          transition={{ delay: visible ? 0.3 : 0, ...springConfig }}
        >
          {/* Decorative rings */}
          <motion.circle
            cx="200" cy="120" r="58" fill="none" stroke="#00FF88" strokeWidth="1" strokeDasharray="10 5" opacity="0.3"
            animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 120px" }}
          />
          <circle cx="200" cy="120" r="50" fill="none" stroke="#00FF88" strokeWidth="1" opacity="0.4" />
          <circle cx="200" cy="120" r="44" fill="none" stroke="#00FF88" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />

          {/* Gauge arc background */}
          <path d="M 166 154 A 48 48 0 1 1 234 154" fill="none" stroke="#1a3a2a" strokeWidth="5" strokeLinecap="round" />
          {/* Gauge arc fill */}
          <motion.path
            d="M 166 154 A 48 48 0 1 1 234 154" fill="none" stroke="#00FF88" strokeWidth="5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: visible ? 0.98 : 0 }}
            transition={{ delay: visible ? 0.6 : 0, duration: 1.5, ease: "easeOut" }}
          />

          {/* Center glow */}
          <circle cx="200" cy="120" r="6" fill="#00FF88" filter="url(#neon-glow)" />
          <circle cx="200" cy="120" r="2" fill="#010603" />

          {/* Score */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ delay: visible ? 1.0 : 0 }}>
            <MonoLabel x={200} y={116} size="14px" fill="#00FF88" fontWeight="bold">98</MonoLabel>
            <MonoLabel x={200} y={132} size="6px" fill="#00CC70">PERFORMANCE</MonoLabel>
          </motion.g>

          {/* Metric badges */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ delay: visible ? 1.2 : 0 }}>
            <rect x="152" y="55" width="32" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
            <MonoLabel x={168} y={63} size="5px" fill="#00FF88">LCP</MonoLabel>
            <rect x="216" y="55" width="32" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
            <MonoLabel x={232} y={63} size="5px" fill="#00FF88">CLS</MonoLabel>
            <rect x="184" y="175" width="32" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
            <MonoLabel x={200} y={183} size="5px" fill="#00FF88">TTFB</MonoLabel>
          </motion.g>
        </motion.g>

        {/* ─── DEPLOY: Edge Network ─── */}
        <motion.g
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 30 }}
          transition={{ delay: visible ? 0.5 : 0, ...springConfig }}
        >
          <rect x="280" y="70" width="80" height="100" rx="8" fill="#020804" fillOpacity="0.95" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="284" y="74" width="72" height="92" rx="6" fill="#00FF88" fillOpacity="0.05" />

          {/* Globe */}
          <circle cx="320" cy="105" r="22" fill="none" stroke="#00FF88" strokeWidth="1" />
          <line x1="298" y1="105" x2="342" y2="105" stroke="#00FF88" strokeWidth="0.5" />
          <line x1="320" y1="83" x2="320" y2="127" stroke="#00FF88" strokeWidth="0.5" />
          <ellipse cx="320" cy="105" rx="22" ry="9" fill="none" stroke="#00FF88" strokeWidth="0.5" />

          {/* Deploy play icon */}
          <polygon points="315,98 315,112 328,105" fill="#00FF88" fillOpacity="0.3" stroke="#00FF88" strokeWidth="1" />

          {/* Checkmark */}
          <motion.path
            d="M 308 118 L 316 126 L 332 110" fill="none" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: visible ? 1 : 0 }}
            transition={{ delay: visible ? 1.0 : 0, duration: 0.6 }}
          />

          {/* Signal waves */}
          <motion.circle
            cx="320" cy="105" r="28" fill="none" stroke="#00FF88" strokeWidth="1" filter="url(#neon-glow)"
            animate={{ r: [28, 45], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.circle
            cx="320" cy="105" r="28" fill="none" stroke="#00FF88" strokeWidth="1" filter="url(#neon-glow)"
            animate={{ r: [28, 45], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
          />

          <rect x="295" y="160" width="50" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={320} y={168} size="5px" fill="#00FF88">Edge</MonoLabel>
        </motion.g>

        {/* ─── SEO: Search & Trend ─── */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
          transition={{ delay: visible ? 0.7 : 0, ...springConfig }}
        >
          <rect x="140" y="20" width="120" height="22" rx="3" fill="#010603" stroke="#00FF88" strokeWidth="0.5" strokeOpacity="0.6" />
          <circle cx="156" cy="31" r="5" fill="none" stroke="#00FF88" strokeWidth="1" />
          <line x1="160" y1="35" x2="165" y2="40" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="172" y1="31" x2="245" y2="31" stroke="#00FF88" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.3" />

          {/* Trending arrow */}
          <motion.g animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <polyline points="252,38 258,28 264,33 270,22" fill="none" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points="270,22 267,26 272,26" fill="#00FF88" />
          </motion.g>

          <rect x="165" y="5" width="70" height="12" rx="2" fill="#010603" stroke="#00FF88" strokeWidth="0.5" />
          <MonoLabel x={200} y={13} size="5px" fill="#00FF88">SEO Optimized</MonoLabel>
        </motion.g>

        {/* Bottom annotations */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ delay: visible ? 1.4 : 0, duration: 1 }}>
          <MonoLabel x={130} y={210} size="5px" fill="#00FF88">Core Web Vitals</MonoLabel>
          <MonoLabel x={270} y={210} size="5px" fill="#00FF88">Global Edge</MonoLabel>
        </motion.g>

      </SvgRoot>
    </div>
  );
}

// ─── SERVICES DATA ────────────────────────────────────────────────────────────
export const SERVICES: Service[] = [
  {
    index: "01",
    label: "Development",
    category: "Full Stack",
    title: "Full-Stack Web Development",
    subtitle: "Building complete digital products from idea to deployment.",
    description:
      "Developing scalable web applications with modern frontend, backend, authentication, APIs, and databases for businesses and startups. I design systems that scale vertically and horizontally.",
    tags: ["React", "Next.js", "Node.js", "PostgreSQL"],
    visual: (v) => <FullStackIsometricVisual visible={v} />,
  },
  {
    index: "02",
    label: "UI/UX",
    category: "Responsive",
    title: "Responsive UI Development",
    subtitle: "Beautiful, accessible interfaces for every screen size.",
    description:
      "Creating pixel-perfect, mobile-first user experiences with clean layouts, intuitive interactions, and exceptional usability.",
    tags: ["Tailwind CSS", "Responsive", "Accessibility"],
    visual: (v) => <ResponsiveUIVisual visible={v} />,
  },
  {
    index: "03",
    label: "Animation",
    category: "Creative",
    title: "Creative Animations",
    subtitle: "Interfaces that move with purpose and delight users.",
    description:
      "Crafting smooth scroll animations, page transitions, and engaging micro-interactions to make products feel modern and alive.",
    tags: ["GSAP", "Framer Motion", "Motion"],
    visual: (v) => <CreativeAnimationVisual visible={v} />,
  },
  {
    index: "04",
    label: "Payments",
    category: "Secure",
    title: "Payment Integration",
    subtitle: "Seamless, secure payment experiences for modern applications.",
    description:
      "Integrating trusted payment gateways with secure checkout flows, subscription billing, and transaction management.",
    tags: ["Easypaisa", "LemonSqueezy", "Subscriptions", "Checkout"],
    visual: (v) => <PaymentIntegrationVisual visible={v} />,
  },
  {
    index: "05",
    label: "Security",
    category: "Authentication",
    title: "Authentication & Authorization",
    subtitle: "Protecting your application with secure access control.",
    description:
      "Implementing secure authentication, role-based authorization, JWT, OAuth, session management, and protected routes.",
    tags: ["JWT", "OAuth", "RBAC", "Security"],
    visual: (v) => <AuthenticationVisual visible={v} />,
  },
  {
  index: "06",
  label: "Optimization",
  category: "Performance",
  title: "Performance & Deployment",
  subtitle: "Fast, SEO-friendly applications ready for production.",
  description:
    "Optimizing Core Web Vitals, improving SEO, enhancing loading performance, and deploying reliable production-ready applications.",
  tags: ["SEO", "Performance", "Vercel", "Docker"],
  visual: (v) => <PerformanceDeploymentVisual visible={v} />,
},
];