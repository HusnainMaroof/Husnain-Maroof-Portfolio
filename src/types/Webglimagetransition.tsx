"use client";

import React, { useEffect, useRef, useState } from "react";

interface WebGLImageTransitionProps {
  images: string[];
  activeIndex: number;
  className?: string;
  duration?: number;
  slices?: number;
  strength?: number;
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// FIX 1: coverUv scale axes were swapped.
// "cover" means: whichever axis would show letterboxing, scale it UP so it
// fills. When the canvas is wider than the image (resAspect > imgAspect) we
// must scale the X axis up (multiply x by resAspect/imgAspect), not Y.
const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform vec2 u_fromSize;
uniform vec2 u_toSize;
uniform vec2 u_resolution;
uniform float u_progress;
uniform float u_slices;
uniform float u_strength;

vec2 coverUv(vec2 uv, vec2 res, vec2 imgSize) {
  float resAspect = res.x / res.y;
  float imgAspect = imgSize.x / imgSize.y;
  vec2 scale = resAspect > imgAspect
    ? vec2(resAspect / imgAspect, 1.0)
    : vec2(1.0, imgAspect / resAspect);
  return (uv - 0.5) * scale + 0.5;
}

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
  float intensity = sin(clamp(u_progress, 0.0, 1.0) * 3.14159265);

  float sliceId = floor(v_uv.y * u_slices);
  float rnd     = hash(sliceId);
  float shift   = (rnd - 0.5) * 2.0 * u_strength * intensity;

  vec2 distorted = v_uv;
  distorted.x   += shift;
  distorted.x    = clamp(distorted.x, 0.0, 1.0);

  vec2 fromUv = coverUv(distorted, u_resolution, u_fromSize);
  vec2 toUv   = coverUv(distorted, u_resolution, u_toSize);

  vec3 fromColor = texture2D(u_from, fromUv).rgb;
  vec3 toColor   = texture2D(u_to, toUv).rgb;

  vec3 color = mix(fromColor, toColor, smoothstep(0.0, 1.0, u_progress));
  color *= (1.0 - intensity * 0.12);

  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface TextureEntry {
  texture: WebGLTexture;
  width: number;
  height: number;
  loaded: boolean;
}

export function WebGLImageTransition({
  images,
  activeIndex,
  className = "",
  duration = 1100,
  slices = 20,
  strength = 0.1,
}: WebGLImageTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(true);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<Map<string, TextureEntry>>(new Map());
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  const currentIndexRef = useRef(activeIndex);
  const prevIndexRef = useRef(activeIndex);
  const progressRef = useRef(1);
  const animStartRef = useRef(0);
  const animatingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const renderRef = useRef<() => void>(() => {});
  const tickRef = useRef<(now: number) => void>(() => {});

  // ── helpers ─────────────────────────────────────────────────────────────

  function resizeCanvas() {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!gl || !canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return; // guard: layout not ready yet

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(w * dpr);
    const height = Math.floor(h * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function getOrLoadTexture(
    gl: WebGLRenderingContext,
    url: string,
  ): TextureEntry {
    const existing = texturesRef.current.get(url);
    if (existing) return existing;

    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([20, 20, 20, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const entry: TextureEntry = { texture, width: 1, height: 1, loaded: false };
    texturesRef.current.set(url, entry);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const currentGl = glRef.current;
      if (!currentGl) return;
      currentGl.bindTexture(currentGl.TEXTURE_2D, texture);
      currentGl.texImage2D(
        currentGl.TEXTURE_2D,
        0,
        currentGl.RGBA,
        currentGl.RGBA,
        currentGl.UNSIGNED_BYTE,
        img,
      );
      entry.width = img.naturalWidth;
      entry.height = img.naturalHeight;
      entry.loaded = true;
      renderRef.current();
    };
    img.onerror = () =>
      console.warn("WebGLImageTransition: failed to load", url);
    img.src = url;

    return entry;
  }

  // ── Init WebGL once ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = (canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
    }) ||
      canvas.getContext("experimental-webgl", {
        antialias: false,
        alpha: false,
      })) as WebGLRenderingContext | null;

    if (!gl) {
      setSupported(false);
      return;
    }
    glRef.current = gl;

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) {
      setSupported(false);
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      u_from: gl.getUniformLocation(program, "u_from"),
      u_to: gl.getUniformLocation(program, "u_to"),
      u_fromSize: gl.getUniformLocation(program, "u_fromSize"),
      u_toSize: gl.getUniformLocation(program, "u_toSize"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_progress: gl.getUniformLocation(program, "u_progress"),
      u_slices: gl.getUniformLocation(program, "u_slices"),
      u_strength: gl.getUniformLocation(program, "u_strength"),
    };

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    renderRef.current = () => {
      const _gl = glRef.current;
      const _program = programRef.current;
      const _canvas = canvasRef.current;
      if (!_gl || !_program || !_canvas) return;

      const fromUrl = images[prevIndexRef.current];
      const toUrl = images[currentIndexRef.current];
      if (!fromUrl || !toUrl) return;

      const fromEntry = getOrLoadTexture(_gl, fromUrl);
      const toEntry = getOrLoadTexture(_gl, toUrl);

      _gl.useProgram(_program);
      const u = uniformsRef.current;

      _gl.activeTexture(_gl.TEXTURE0);
      _gl.bindTexture(_gl.TEXTURE_2D, fromEntry.texture);
      _gl.uniform1i(u.u_from, 0);
      _gl.uniform2f(u.u_fromSize, fromEntry.width, fromEntry.height);

      _gl.activeTexture(_gl.TEXTURE1);
      _gl.bindTexture(_gl.TEXTURE_2D, toEntry.texture);
      _gl.uniform1i(u.u_to, 1);
      _gl.uniform2f(u.u_toSize, toEntry.width, toEntry.height);

      _gl.uniform2f(u.u_resolution, _canvas.width, _canvas.height);
      _gl.uniform1f(u.u_progress, progressRef.current);
      _gl.uniform1f(u.u_slices, slices);
      _gl.uniform1f(u.u_strength, strength);

      _gl.drawArrays(_gl.TRIANGLES, 0, 6);
    };

    tickRef.current = (now: number) => {
      const effectiveDuration = reducedMotionRef.current
        ? Math.min(duration, 250)
        : duration;
      const elapsed = now - animStartRef.current;
      const t = Math.min(elapsed / effectiveDuration, 1);
      progressRef.current = reducedMotionRef.current ? t : easeInOutCubic(t);
      renderRef.current();
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tickRef.current);
      } else {
        animatingRef.current = false;
        prevIndexRef.current = currentIndexRef.current;
      }
    };

    images.forEach((url) => getOrLoadTexture(gl, url));

    // FIX 2: defer first resize+render to rAF so the container has layout
    // dimensions before we read clientWidth / clientHeight.
    rafRef.current = requestAnimationFrame(() => {
      resizeCanvas();
      renderRef.current();
    });

    const ro = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        resizeCanvas();
        renderRef.current();
      }, 100);
    });
    ro.observe(container, { box: "content-box" });

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      texturesRef.current.forEach((e) => gl.deleteTexture(e.texture));
      texturesRef.current.clear();
      if (programRef.current) gl.deleteProgram(programRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to activeIndex changes ─────────────────────────────────────────
  useEffect(() => {
    if (activeIndex === currentIndexRef.current) return;
    prevIndexRef.current = currentIndexRef.current;
    currentIndexRef.current = activeIndex;
    progressRef.current = 0;
    animStartRef.current = performance.now();
    animatingRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // ── Fallback ─────────────────────────────────────────────────────────────
  if (!supported) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          />
        ))}
      </div>
    );
  }

  return (
    // FIX 3: ensure the wrapper always fills its parent and the canvas
    // fills the wrapper. The canvas element is "replaced content" — CSS
    // width/height alone don't set the drawing-buffer size, but they DO
    // control the layout box that the container measures via clientWidth.
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        // FIX 3 cont: inline styles beat Tailwind specificity for replaced elements
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
