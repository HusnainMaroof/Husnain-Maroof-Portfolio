"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * WebGLImageTransition
 *
 * Renders a stack of images on a <canvas> and cross-dissolves between
 * them using a horizontal-tear / slice-glitch fragment shader whenever
 * `activeIndex` changes. Falls back to a plain crossfaded <img> stack
 * if WebGL2/WebGL isn't available, and skips the slice distortion in
 * favor of a quick opacity fade when prefers-reduced-motion is set.
 */

interface WebGLImageTransitionProps {
  images: string[];
  activeIndex: number;
  className?: string;
  /** Transition length in ms for the slice-glitch tween. */
  duration?: number;
  /** Number of horizontal slices the image is torn into. */
  slices?: number;
  /** Max horizontal displacement of a slice, in UV units (0-1). */
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
uniform float u_time;

vec2 coverUv(vec2 uv, vec2 res, vec2 imgSize) {
  float resAspect = res.x / res.y;
  float imgAspect = imgSize.x / imgSize.y;
  vec2 scale = resAspect > imgAspect
    ? vec2(1.0, resAspect / imgAspect)
    : vec2(imgAspect / resAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
  float intensity = sin(clamp(u_progress, 0.0, 1.0) * 3.14159265);

  float sliceId = floor(v_uv.y * u_slices);
  float rnd = hash(sliceId);
  float shift = (rnd - 0.5) * 2.0 * u_strength * intensity;
  float wave = sin(v_uv.y * 14.0 + u_time * 2.4) * 0.018 * intensity;

  vec2 distorted = v_uv;
  distorted.x += shift + wave;

  vec2 fromUv = coverUv(distorted, u_resolution, u_fromSize);
  vec2 toUv = coverUv(distorted, u_resolution, u_toSize);

  vec3 fromColor = texture2D(u_from, fromUv).rgb;
  vec3 toColor = texture2D(u_to, toUv).rgb;

  vec3 color = mix(fromColor, toColor, smoothstep(0.0, 1.0, u_progress));
  color *= (1.0 - intensity * 0.18);

  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
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
  slices = 24,
  strength = 0.12,
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
  const startTimeRef = useRef(performance.now());

  // --- Init WebGL once ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

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
      u_time: gl.getUniformLocation(program, "u_time"),
    };

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Preload every image up front so first hover is instant.
    images.forEach((url) => getOrCreateTexture(gl, url, () => renderFrame()));

    resizeCanvas();
    renderFrame();

    const ro = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeCanvas();
        renderFrame();
      }, 150);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      texturesRef.current.forEach((entry) => gl.deleteTexture(entry.texture));
      texturesRef.current.clear();
      if (programRef.current) gl.deleteProgram(programRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeTimeoutRef = useRef<number | null>(null);

  function resizeCanvas() {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!gl || !canvas || !container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(container.clientWidth * dpr));
    const height = Math.max(1, Math.floor(container.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function getOrCreateTexture(
    gl: WebGLRenderingContext,
    url: string,
    onLoad: () => void
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
      new Uint8Array([20, 20, 20, 255])
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
        img
      );
      entry.width = img.naturalWidth;
      entry.height = img.naturalHeight;
      entry.loaded = true;
      onLoad();
    };
    img.src = url;

    return entry;
  }

  function renderFrame() {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    const fromUrl = images[prevIndexRef.current];
    const toUrl = images[currentIndexRef.current];
    if (fromUrl === undefined || toUrl === undefined) return;

    const fromEntry = getOrCreateTexture(gl, fromUrl, () => renderFrame());
    const toEntry = getOrCreateTexture(gl, toUrl, () => renderFrame());

    gl.useProgram(program);
    const u = uniformsRef.current;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fromEntry.texture);
    gl.uniform1i(u.u_from, 0);
    gl.uniform2f(u.u_fromSize, fromEntry.width, fromEntry.height);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, toEntry.texture);
    gl.uniform1i(u.u_to, 1);
    gl.uniform2f(u.u_toSize, toEntry.width, toEntry.height);

    gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(u.u_progress, progressRef.current);
    gl.uniform1f(u.u_slices, slices);
    gl.uniform1f(u.u_strength, strength);
    gl.uniform1f(u.u_time, (performance.now() - startTimeRef.current) / 1000);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function tick(now: number) {
    const elapsed = now - animStartRef.current;
    const effectiveDuration = reducedMotionRef.current ? Math.min(duration, 300) : duration;
    const t = Math.min(elapsed / effectiveDuration, 1);
    progressRef.current = reducedMotionRef.current ? t : easeInOutCubic(t);
    renderFrame();
    if (t < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      animatingRef.current = false;
      prevIndexRef.current = currentIndexRef.current;
    }
  }

  // --- React to activeIndex changes ---
  useEffect(() => {
    if (activeIndex === currentIndexRef.current) return;
    prevIndexRef.current = currentIndexRef.current;
    currentIndexRef.current = activeIndex;
    progressRef.current = 0;
    animStartRef.current = performance.now();
    animatingRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  if (!supported) {
    // Graceful fallback: plain crossfaded stack of <img> elements.
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
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
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}



