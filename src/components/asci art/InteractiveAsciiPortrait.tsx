"use client";

/**
 * InteractiveAsciiPortrait — Canvas 2D ASCII portrait with hover interaction.
 *
 * Key design decisions:
 * - object-fit:contain sampling: cells are built over the image's contained
 *   region only, so no stretching regardless of container shape.
 * - Canvas pixel dimensions are always kept in sync with the container's
 *   actual current size via ResizeObserver — no debounce lag causes mismatch.
 * - ctx.font is set once per quantised size bucket per frame (~95% reduction).
 * - Gamma-corrected brightness mapping gives proper contrast (shadows are
 *   dark, highlights are bright, midtones are readable).
 * - Tonal colouring: shadows lean slightly warm, highlights lean cool-white,
 *   giving the portrait depth without colour-grading gimmicks.
 * - RAF is paused via IntersectionObserver when off-screen.
 * - All mutable per-frame state lives in plain refs — no React state in loop.
 */

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AsciiProps {
  image: string;
  resolution?: number;
  charset?: string;
  fontSize?: number;
  shadowColor?: string;
  highlightColor?: string;
  hoverRadius?: number;
  className?: string;
  scrollRef?: React.MutableRefObject<number>;
}

interface Cell {
  readonly rx: number;
  readonly ry: number;
  readonly baseSize: number;
  readonly ta: number;
  readonly char: string;
  readonly expChar: string; // The character it turns into when exploding
  readonly sr: number;
  readonly sg: number;
  readonly sb: number;
  readonly revealAt: number;
  
  // NEW: Pre-calculated explosion vectors so it chunks apart beautifully
  readonly vx: number;
  readonly vy: number;

  cx: number;
  cy: number;
  cs: number;
  ca: number;
  inf: number;
  revealed: boolean;
}

const SCRAMBLE = "@#$%&*01RAPS!?~";
const SCATTER_WORDS = [
  "DESIGN", "BUILD", "DEPLOY", "CODE", 
  "CREATE", "REACT", "NODE", "TYPESCRIPT", 
  "FRONTEND", "BACKEND", "NEXTJS"
];
const FONT_FAMILY = '"Courier New", Courier, monospace';
const ALPHA_LERP = 0.06;
const SIZE_LERP = 0.14;
const POS_LERP = 0.12;
const RESTORE_LERP = 0.09;
const INF_LERP = 0.15;

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function perceivedBrightness(r: number, g: number, b: number): number {
  const luma = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
  return Math.pow(luma, 0.7);
}

export function InteractiveAsciiPortrait({
  image,
  resolution = 7,
  charset = "RAPS#xcsua·. ",
  fontSize = 10,
  shadowColor = "#a0a8b0",
  highlightColor = "#ffffff",
  hoverRadius = 90,
  className = "",
  scrollRef,
}: AsciiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -99999, y: -99999 });
  const cellsRef = useRef<Cell[]>([]);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const startTimeRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const shadowRgbRef = useRef<[number, number, number]>(parseHex(shadowColor));
  const highlightRgbRef = useRef<[number, number, number]>(
    parseHex(highlightColor),
  );
  const warmShadowRef = useRef<[number, number, number]>([90, 85, 80]);

  useEffect(() => {
    shadowRgbRef.current = parseHex(shadowColor);
    highlightRgbRef.current = parseHex(highlightColor);
  }, [shadowColor, highlightColor]);

  const buildCells = useCallback(
    (img: HTMLImageElement, canvasW: number, canvasH: number) => {
      if (canvasW < 10 || canvasH < 10) return;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasW / canvasH;

      let drawW: number, drawH: number, offsetX: number, offsetY: number;
      if (imgAspect > canvasAspect) {
        drawW = canvasW;
        drawH = canvasW / imgAspect;
        offsetX = 0;
        offsetY = (canvasH - drawH) / 2;
      } else {
        drawH = canvasH;
        drawW = canvasH * imgAspect;
        offsetX = (canvasW - drawW) / 2;
        offsetY = 0;
      }

      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, 0, 0);
      const { data: px } = octx.getImageData(
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
      );

      const cells: Cell[] = [];
      const [wsr, wsg, wsb] = warmShadowRef.current;
      const [sr, sg, sb] = shadowRgbRef.current;
      let idx = 0;

      for (let gy = offsetY; gy < offsetY + drawH; gy += resolution) {
        for (let gx = offsetX; gx < offsetX + drawW; gx += resolution) {
          const ix = Math.min(
            img.naturalWidth - 1,
            Math.floor(((gx - offsetX) / drawW) * img.naturalWidth),
          );
          const iy = Math.min(
            img.naturalHeight - 1,
            Math.floor(((gy - offsetY) / drawH) * img.naturalHeight),
          );
          const pi = (iy * img.naturalWidth + ix) * 4;
          const r = px[pi],
            g = px[pi + 1],
            b = px[pi + 2],
            a = px[pi + 3];

          if (a < 20) continue;

          const brightness = perceivedBrightness(r, g, b);
          const contrastB = Math.pow(brightness, 1.4);
          const charIdx = Math.floor((1 - contrastB) * (charset.length - 1));
          const char =
            charset[Math.max(0, Math.min(charset.length - 1, charIdx))];

          const ta =
            brightness < 0.15
              ? 0.95
              : brightness < 0.5
                ? 0.95 - (brightness - 0.15) * 0.4
                : 0.81 - (brightness - 0.5) * 1.2;
          const taClamp = Math.max(0.05, Math.min(1, ta));
          const baseSize = fontSize * (0.7 + (1 - brightness) * 0.55);

          const warmT = Math.max(0, 1 - brightness * 3);
          const cellSr = Math.round(wsr + (sr - wsr) * (1 - warmT));
          const cellSg = Math.round(wsg + (sg - wsg) * (1 - warmT));
          const cellSb = Math.round(wsb + (sb - wsb) * (1 - warmT));

          const rowJitter =
            (Math.floor((gy - offsetY) / resolution) % 3) * 0.05;
          const revealAt = idx * 0.00012 + rowJitter + Math.random() * 0.18;

          const col = Math.floor((gx - offsetX) / resolution);
          const row = Math.floor((gy - offsetY) / resolution);

          // We group cells into geometric "chunks" (8 columns wide, 2 rows tall)
          const chunkX = Math.floor(col / 8);
          const chunkY = Math.floor(row / 2);
          
          // Seed determines chunk word & vector direction
          const seed = Math.abs(chunkX * 13.1 + chunkY * 7.9);
          const wordIndex = Math.floor(seed) % SCATTER_WORDS.length;
          const word = SCATTER_WORDS[wordIndex];
          
          // Spells out the word horizontally within the chunk
          const expChar = word[col % word.length];

          // Calculate pre-baked explosion trajectory per chunk
          const chunkAngle = Math.sin(seed) * Math.PI * 2;
          const chunkSpeed = 1500 + Math.abs(Math.cos(seed)) * 3000;
          
          // Add a slight radial push so it generally expands outward
          const dxCenter = gx - canvasW / 2;
          const dyCenter = gy - canvasH / 2;
          const distFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter) || 1;
          const radialVx = (dxCenter / distFromCenter) * 1200;
          const radialVy = (dyCenter / distFromCenter) * 1200;
          
          // Micro-scatter to make chunks look organic, not perfectly solid rectangles
          const cellScatterX = Math.sin(col * 1.1 + row * 2.3) * 300;
          const cellScatterY = Math.cos(col * 1.5 + row * 1.9) * 300;

          // Combine vectors into immutable precalculated properties
          const vx = Math.cos(chunkAngle) * chunkSpeed + radialVx + cellScatterX;
          const vy = Math.sin(chunkAngle) * chunkSpeed + radialVy + cellScatterY;

          cells.push({
            rx: gx,
            ry: gy,
            cx: gx,
            cy: gy,
            cs: baseSize,
            ca: 0,
            inf: 0,
            ta: taClamp,
            baseSize,
            char,
            expChar,
            sr: cellSr,
            sg: cellSg,
            sb: cellSb,
            revealAt,
            revealed: false,
            vx,
            vy
          });
          idx++;
        }
      }

      cellsRef.current = cells;
      startTimeRef.current = performance.now();
    },
    [resolution, charset, fontSize],
  );

  const loop = useCallback(
    (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (pausedRef.current) return;

      const ctx = ctxRef.current;
      if (!ctx) return;

      const cells = cellsRef.current;
      if (cells.length === 0) return;

      const { width, height } = ctx.canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const elapsed = (now - startTimeRef.current) / 1000;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const radSq = hoverRadius * hoverRadius;
      const [hr, hg, hb] = highlightRgbRef.current;

      const rawScroll = Math.max(0, Math.min(1, scrollRef?.current || 0));
      // Max out the explosion by 85% scroll to leave a clean exit gap
      const scrollProgress = Math.min(1, rawScroll / 0.85);
      const explosionPower = Math.pow(scrollProgress, 2.5);

      const buckets = new Map<number, Cell[]>();

      for (const cell of cells) {
        if (!cell.revealed) {
          if (elapsed >= cell.revealAt) cell.revealed = true;
          else continue;
        }

        if (cell.ca < cell.ta - 0.002)
          cell.ca += (cell.ta - cell.ca) * ALPHA_LERP;
        else cell.ca = cell.ta;

        // CALCULATE TARGET POSITION USING OUR NEW CHUNK VECTORS
        let tx = cell.rx;
        let ty = cell.ry;

        if (explosionPower > 0) {
          // Push cell strictly along its pre-calculated trajectory
          tx += cell.vx * explosionPower;
          ty += cell.vy * explosionPower;
        }

        // MOUSE PHYSICS: Dampen hover interaction during explosion
        let targetInf = 0;
        if (explosionPower < 0.1) {
          const dxMouse = tx - mx;
          const dyMouse = ty - my;
          const distSq = dxMouse * dxMouse + dyMouse * dyMouse;
          targetInf = distSq < radSq ? 1 - Math.sqrt(distSq) / hoverRadius : 0;
        }

        cell.inf += (targetInf - cell.inf) * INF_LERP;

        if (cell.inf > 0.01) {
          const mdx = tx - mx;
          const mdy = ty - my;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy) + 0.001;

          const tSize = cell.baseSize * (1 + cell.inf * 1.6);
          cell.cs += (tSize - cell.cs) * SIZE_LERP;

          const pushX = tx + (mdx / dist) * cell.inf * 15;
          const pushY = ty + (mdy / dist) * cell.inf * 15;
          cell.cx += (pushX - cell.cx) * POS_LERP;
          cell.cy += (pushY - cell.cy) * POS_LERP;
        } else {
          cell.cs += (cell.baseSize - cell.cs) * RESTORE_LERP;
          cell.cx += (tx - cell.cx) * RESTORE_LERP;
          cell.cy += (ty - cell.cy) * RESTORE_LERP;
        }

        let drawSize = cell.cs;
        if (explosionPower > 0) {
          drawSize = cell.cs * (1 + explosionPower * 8); 
        }

        let expAlphaFade = 1;
        if (scrollProgress > 0.05) {
          expAlphaFade = 1 - Math.pow((scrollProgress - 0.05) / 0.95, 1.5);
        }
        expAlphaFade = Math.max(0, expAlphaFade);

        const sizeKey = Math.round(drawSize * 2) / 2;
        let bucket = buckets.get(sizeKey);
        if (!bucket) {
          bucket = [];
          buckets.set(sizeKey, bucket);
        }
        (cell as any)._tempExpAlpha = expAlphaFade;
        bucket.push(cell);
      }

      for (const [size, group] of buckets) {
        ctx.font = `${size}px ${FONT_FAMILY}`;

        for (const cell of group) {
          const inf = cell.inf;
          const expAlphaFade = (cell as any)._tempExpAlpha;

          // Switch to the readable words once scrolling starts!
          let char = cell.char;
          if (scrollProgress > 0.05) {
            char = cell.expChar; 
          } else if (inf > 0.55 && Math.random() < inf * 0.25) {
            char = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
          }

          const t = Math.min(1, inf * 1.4);
          const cr = Math.round(cell.sr + (hr - cell.sr) * t);
          const cg = Math.round(cell.sg + (hg - cell.sg) * t);
          const cb = Math.round(cell.sb + (hb - cell.sb) * t);

          const alpha =
            Math.min(1, cell.ca + inf * (1 - cell.ca)) * expAlphaFade;
          const ca = Math.round(alpha * 100) / 100;

          if (ca > 0.01) {
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${ca})`;
            ctx.fillText(char, cell.cx, cell.cy);
          }
        }
      }
    },
    [hoverRadius, scrollRef],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctxRef.current = ctx;

    const src = image.startsWith("/") ? image : `/${image}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    imgRef.current = img;

    const rebuild = (w: number, h: number) => {
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      buildCells(img, canvas.width, canvas.height);
    };

    const tryFirstBuild = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width < 10 || height < 10) {
        setTimeout(tryFirstBuild, 60);
        return;
      }
      rebuild(width, height);
    };

    img.onload = tryFirstBuild;

    let lastW = 0,
      lastH = 0;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !imgRef.current?.complete) return;
      const { width, height } = entry.contentRect;
      if (Math.abs(width - lastW) < 4 && Math.abs(height - lastH) < 4) return;
      lastW = width;
      lastH = height;
      rebuild(width, height);
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(container);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [image, buildCells, loop]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: -99999, y: -99999 };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "crosshair", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}