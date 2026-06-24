"use client";
/**
 * AboutHero.tsx
 *
 * Flow:
 *   1. HOLD button appears (1.5s delay)
 *   2. User holds → particles explode
 *   3. Scroll any amount → triggerReshape() → sphere forms
 *   4. 1200ms breathing pause → "● SCROLL TO EXPLORE" fades in
 *   5. User scrolls (progress > 0.08) → hint fades, Bio fades in
 *   6. Progress 0.50→0.65 → Bio crossfades out, Experience fades in
 *   7. Progress 0.85 → white flash → onComplete() at 1550ms
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { AboutParticleSystem } from "@/src/lib/AboutParticleSystem";
import AboutBioOverlay from "./Aboutbio";
import AboutExperienceOverlay from "./AboutExperience";

interface Props {
  onComplete: () => void;
}

const HOLD_UNLOCK_DELAY = 1500;

export default function AboutHero({ onComplete }: Props) {
  const mountRef      = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // DOM refs — written imperatively to avoid 60fps re-renders
  const infoRef       = useRef<HTMLDivElement>(null);
  const centerUIRef   = useRef<HTMLDivElement>(null);
  const shakeRef      = useRef<HTMLDivElement>(null);
  const chargeFillRef = useRef<HTMLDivElement>(null);

  // React state — only what actually drives conditional renders
  const [holdReady,    setHoldReady]    = useState(false);
  const [exploded,     setExploded]     = useState(false);
  const [reshaped,     setReshaped]     = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [flashing,     setFlashing]     = useState(false);

  // Imperative refs — values that live inside RAF/event closures
  const reshapedRef       = useRef(false);
  const readProgressRef   = useRef(0);
  const bioReadyRef       = useRef(false);   // set after breathing pause, read in onWheel
  const completedRef      = useRef(false);
  const scrollHintHidden  = useRef(false);
  const flashTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Pre-HOLD delay ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setHoldReady(true), HOLD_UNLOCK_DELAY);
    return () => clearTimeout(t);
  }, []);

  // ── Breathing pause after reshape → unlock scroll-driven content ────────
  useEffect(() => {
    if (!reshaped) return;

    const t = setTimeout(() => {
      bioReadyRef.current = true; // unlocks scroll-driven content in onWheel
      if (infoRef.current) {
        infoRef.current.innerText = "● SCROLL TO EXPLORE";
        infoRef.current.style.opacity = "1";
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [reshaped]);

  // ── Cleanup flash timer on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  // ── Three.js scene ──────────────────────────────────────────────────────
  const initScene = useCallback(() => {
    const container = mountRef.current;
    if (!container) return;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const sys = new AboutParticleSystem({
      onExploded() {
        // Hide HOLD button immediately
        if (centerUIRef.current) centerUIRef.current.style.opacity = "0";
        if (infoRef.current) {
          infoRef.current.innerText = "● SCROLL TO RESHAPE";
          infoRef.current.style.opacity = "1";
        }
        setExploded(true);
      },
      onReshaping() {},
    });

    const raycaster = new THREE.Raycaster();
    const ndcMouse  = new THREE.Vector2();
    const plane     = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const worldPt   = new THREE.Vector3();

    let reshapeReady = false;
    let touchStartY  = 0;

    // ── Pointer tracking ──────────────────────────────────────────────────
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      ndcMouse.x =  (clientX / window.innerWidth)  * 2 - 1;
      ndcMouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndcMouse, camera);
      raycaster.ray.intersectPlane(plane, worldPt);
      sys.setMouse(worldPt.x, worldPt.y, ndcMouse.x, ndcMouse.y);
    };

    const onPointerLeave = () => sys.clearMouse();
    const onMouseDown    = () => sys.startHold();
    const onMouseUp      = () => sys.stopHold();
    const onTouchStart   = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      sys.startHold();
    };
    const onTouchEnd = () => { sys.stopHold(); sys.clearMouse(); };

    // ── Reshape trigger — gated by explosion settle time ──────────────────
    const triggerReshape = () => {
      if (!reshapeReady || reshapedRef.current) return;
      reshapedRef.current = true;
      sys.triggerReshape();
      if (infoRef.current) infoRef.current.style.opacity = "0";
      setReshaped(true);
    };

    // ── Scroll handler — two responsibilities ─────────────────────────────
    // 1. Before reshape: any scroll fires triggerReshape()
    // 2. After reshape + breathing pause: drives Bio/Experience progress
    const SCROLL_SENSITIVITY = 0.0009;

    const onWheel = (e: WheelEvent) => {
      // Phase 1: trigger reshape on any scroll
      if (Math.abs(e.deltaY) > 10) triggerReshape();

      // Phase 2: scroll-driven content — only active after breathing pause
      if (!reshapedRef.current || !bioReadyRef.current) return;

      const next = Math.min(1, Math.max(0, readProgressRef.current + e.deltaY * SCROLL_SENSITIVITY));
      readProgressRef.current = next;
      setReadProgress(next);

      // Hide scroll hint on first real scroll
      if (next > 0.08 && !scrollHintHidden.current) {
        scrollHintHidden.current = true;
        if (infoRef.current) infoRef.current.style.opacity = "0";
      }

      // Trigger white-flash at 85% — guard against double-fire
      if (next >= 0.85 && !completedRef.current) {
        completedRef.current = true;
        setFlashing(true);
        // Store ref so unmount cleanup can cancel it
        flashTimerRef.current = setTimeout(() => {
          onCompleteRef.current();
        }, 850); // onComplete fires mid-flash (flash duration is 600ms in CSS)
      }
    };

    const onTouchMoveScroll = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      onPointerMove(e);
      if (Math.abs(touchStartY - e.touches[0].clientY) > 30) triggerReshape();
    };

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    // ── Event listeners ───────────────────────────────────────────────────
    window.addEventListener("mousemove",  onPointerMove as EventListener);
    window.addEventListener("touchmove",  onTouchMoveScroll as EventListener, { passive: false });
    window.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mouseup",    onMouseUp);
    window.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    window.addEventListener("touchend",   onTouchEnd);
    window.addEventListener("wheel",      onWheel);
    window.addEventListener("resize",     onResize);

    // ── RAF loop ──────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;
    let explosionTime = -1;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      sys.tick(time);

      // Charge fill bar — direct DOM, zero re-renders
      if (chargeFillRef.current) {
        chargeFillRef.current.style.width = `${sys.chargeNorm * 100}%`;
      }

      // Shake on HOLD
      if (shakeRef.current) {
        if (sys.chargeNorm > 0) {
          const base  = sys.chargeNorm * 14;
          const extra = sys.chargeNorm > 0.7
            ? ((sys.chargeNorm - 0.7) / 0.3) * 6
            : 0;
          const mag = base + extra;
          const rot = (Math.random() - 0.5) * sys.chargeNorm * 6;
          shakeRef.current.style.transform = `translate(${
            (Math.random() - 0.5) * mag
          }px, ${(Math.random() - 0.5) * mag}px) rotate(${rot}deg)`;
        } else {
          shakeRef.current.style.transform = "translate(0px,0px) rotate(0deg)";
        }
      }

      // Gate reshape until explosion has had 1.8s to settle visually
      if (sys.hasExploded && explosionTime < 0) explosionTime = time;
      if (explosionTime > 0 && time - explosionTime >= 1.8) reshapeReady = true;

      renderer.render(sys.scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove",  onPointerMove as EventListener);
      window.removeEventListener("touchmove",  onTouchMoveScroll as EventListener);
      window.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("mousedown",  onMouseDown);
      window.removeEventListener("mouseup",    onMouseUp);
      window.removeEventListener("touchstart", onTouchStart as EventListener);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("resize",     onResize);
      sys.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup ?? undefined;
  }, [initScene]);

  // ── Derived opacity values (render-time, from readProgress state) ────────
  // Bio: fades in from 0.08, fades out 0.50→0.65
  const bioOpacity = readProgress <= 0.08
    ? 0
    : readProgress < 0.50
    ? Math.min(1, (readProgress - 0.08) / 0.12)
    : Math.max(0, 1 - (readProgress - 0.50) / 0.15);

  // Experience: fades in 0.50→0.65, holds to 1.0
  const expOpacity  = Math.min(1, Math.max(0, (readProgress - 0.50) / 0.15));
  const expProgress = Math.min(1, Math.max(0, (readProgress - 0.50) / 0.50));

  // Bio internal progress — normalized to its own visible window [0.08, 0.50]
  const bioProgress = Math.min(1, Math.max(0, (readProgress - 0.08) / 0.42));

  return (
    <div
      ref={mountRef}
      className="relative w-full h-screen overflow-hidden bg-[#050505] cursor-crosshair"
    >
      {/* ── Status hint ── */}
      <div
        ref={infoRef}
        className="absolute top-5 w-full text-center pointer-events-none select-none
                   text-[10px] tracking-[0.4em] uppercase text-white/50 font-mono
                   transition-opacity duration-1000 opacity-0"
      />

      {/* ── HOLD button — wrapper fades in after delay, hides on explode ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   pointer-events-none transition-opacity duration-[1200ms]"
        style={{ opacity: holdReady && !exploded ? 1 : 0 }}
      >
        <div
          ref={centerUIRef}
          className="pointer-events-auto select-none"
        >
          <div ref={shakeRef} className="flex flex-col items-center gap-[15px] text-white">
            <button
              className="relative overflow-hidden outline-none px-[60px] py-[18px]
                         border-2 border-white/80 rounded-[50px] bg-black/50
                         backdrop-blur-sm text-white text-2xl font-bold
                         tracking-[8px] cursor-pointer select-none"
              style={{
                boxShadow:
                  "0 0 15px rgba(255,255,255,0.2), inset 0 0 10px rgba(255,255,255,0.1)",
              }}
            >
              <div
                ref={chargeFillRef}
                className="absolute top-0 left-0 bottom-0 z-10"
                style={{
                  width: "0%",
                  background: "rgba(255,255,255,0.8)",
                  boxShadow: "0 0 20px #fff",
                }}
              />
              <span
                className="relative z-20"
                style={{
                  marginRight: "-8px",
                  textShadow: "0 0 10px rgba(255,255,255,0.8)",
                }}
              >
                HOLD
              </span>
            </button>
            <div className="text-sm tracking-[3px] uppercase text-white/70 animate-pulse">
              Press and hold to explode
            </div>
          </div>
        </div>
      </div>

      {/* ── Content overlays — mounted only after explosion ── */}
      {exploded && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Bio — visible 0.08→0.65 */}
          <div style={{ opacity: bioOpacity, transition: " 0.8s ease" }}>
            <AboutBioOverlay readProgress={bioProgress} />
          </div>

          {/* Experience — visible 0.50→1.0 */}
          <div style={{ opacity: expOpacity, transition: "opacity 0.8s ease" }}>
            <AboutExperienceOverlay readProgress={expProgress} />
          </div>
        </div>
      )}

      {/* ── White-flash transition ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "#ffffff",
          opacity: flashing ? 1 : 0,
          transition: flashing
            ? "opacity 0.6s cubic-bezier(0.4, 0, 1, 1)"
            : "opacity 0s",
          zIndex: 50,
        }}
      />
    </div>
  );
}