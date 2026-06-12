"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function MakeItMatter() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const leftTextRef = useRef<HTMLDivElement>(null)
  const rightTextRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imgTagRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.set(leftTextRef.current, { x: "0vw" })
      gsap.set(rightTextRef.current, { x: "0vw" })
      gsap.set(overlayRef.current, { opacity: 1 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          scrub: 1.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      })

      // Slide left text off to the left
      tl.to(leftTextRef.current, {
        x: "-60vw",
        ease: "none",
      }, 0)

      // Slide right text off to the right
      tl.to(rightTextRef.current, {
        x: "60vw",
        ease: "none",
      }, 0)

      // Overlay fades revealing image beneath
      tl.to(overlayRef.current, {
        opacity: 0,
        ease: "none",
      }, 0)

      // Image subtle scale
      tl.fromTo(
        imgTagRef.current,
        { scale: 1.15 },
        { scale: 1.0, ease: "none" },
        0
      )

      // Fade inner char spans — left side reverse order
      const leftChars = Array.from(
        leftTextRef.current?.querySelectorAll(".block-revealer .char-inner") ?? []
      )
      const rightChars = Array.from(
        rightTextRef.current?.querySelectorAll(".block-revealer .char-inner") ?? []
      )

      // Left fades from right to left (trailing chars first)
      tl.to(
        leftChars.reverse(),
        {
          opacity: 0,
          stagger: 0.06,
          ease: "none",
        },
        0
      )

      // Right fades from left to right (leading chars first)
      tl.to(
        rightChars,
        {
          opacity: 0,
          stagger: 0.06,
          ease: "none",
        },
        0
      )

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitChars = (text: string) =>
    text.split("").map((char, i) => (
      <span
        key={i}
        className="block-revealer"
        style={{
          backgroundColor: "transparent",
          display: "inline-block",
          position: "relative",
          paddingLeft: i === 0 ? "0.088em" : "0px",
          marginLeft: i === 0 ? "-0.084em" : "0px",
          paddingRight: "0px",
          marginRight: "0px",
          opacity: 1,
          whiteSpace: char === " " ? "pre" : "normal",
        }}
      >
        <span
          className="char-inner"
          style={{
            opacity: 1,
            display: "inline-block",
          }}
        >
          {char}
        </span>
      </span>
    ))

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "200vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center">

        {/* Image layer — always behind */}
        <div
          ref={imageRef}
          className="absolute inset-0 w-full h-full"
        >
          <img
            ref={imgTagRef}
            src="/about-hero.webp"
            alt=""
            className="w-full h-full object-cover"
            style={{
              objectPosition: "center 55%",
              transform: "scale(1.15)",
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* Overlay — fades on scroll */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10 bg-black"
        />

        {/* Text layer */}
        <div className="relative z-20 flex w-full items-center justify-center pointer-events-none select-none px-8">

          {/* LEFT */}
          <div ref={leftTextRef} className="flex-1 flex justify-end pr-3">
            <p
              className="text-white font-bold leading-none"
              style={{
                fontSize: "clamp(2.5rem, 10vw, 5rem)",
                letterSpacing: "-0.04em",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
              }}
            >
              {splitChars("Make it")}
            </p>
          </div>

          {/* RIGHT */}
          <div ref={rightTextRef} className="flex-1 flex justify-start pl-3">
            <p
              className="text-white font-bold leading-none"
              style={{
                fontSize: "clamp(2.5rem, 10vw, 5rem)",
                letterSpacing: "-0.04em",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
              }}
            >
              {splitChars("Matter.")}
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}