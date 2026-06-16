"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const scrollWords = ["They", "are", "felt."];
const menuItems = ["Works", "About", "Reach out"];
const socialItems = [
  { name: "LinkedIn", url: "https://www.linkedin.com/in/husnain-maroof/" },
  { name: "GitHub", url: "https://github.com/husnainmaroof" },
];
const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

// --- REUSABLE NAVBAR COMPONENT ---
export function Navbar({ isVisible }: { isVisible: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Fixed Header: We tie opacity to the isVisible prop so it fades in after the hero animation */}
      <header
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center p-8 mix-blend-difference text-white transition-opacity duration-1000 delay-500`}
      >
        <h1
          className={`text-lg font-semibold tracking-tight ${isVisible ? "translate-y-0" : "-translate-y-20 "} transition-transform duration-500`}
        >
          Husnain Maroof
        </h1>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`text-md font-semibold hover:opacity-70 transition-opacity cursor-pointer ${isVisible ? "translate-y-0" : "-translate-y-20 "} transition-transform duration-500`}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{
              y: "0%",
              transition: { duration: 0.8, ease: cinematicEase },
            }}
            exit={{
              y: "-100%",
              transition: { delay: 1.1, duration: 0.8, ease: cinematicEase },
            }}
            className="fixed inset-0 bg-[#0f0f0f] z-40 flex flex-col justify-center px-10 md:px-32 lg:px-48"
          >
            {/* Main Menu Links */}
            <div className="flex flex-col items-start gap-2">
              {menuItems.map((word, wIndex) => (
                <div
                  key={word}
                  className="text-[5rem] md:text-[7rem] lg:text-[9rem] font-semibold tracking-tighter leading-[0.9] text-white flex overflow-hidden cursor-pointer hover:opacity-70 transition-opacity group"
                >
                  {word.split("").map((char, cIndex) => (
                    <MenuCharacter
                      key={cIndex}
                      char={char}
                      delay={cIndex * 0.04 + wIndex * 0.15}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Menu Footer (Socials) */}
            <div className="absolute bottom-10 left-10 md:left-32 lg:left-48">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 1.4, duration: 0.5 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="text-gray-500 text-xs font-medium mb-3"
              >
                Socials
              </motion.p>
              <div className="flex gap-6 text-white text-sm font-medium">
                {socialItems.map((social, sIndex) => (
                  <a
                    href={social.url}
                    key={social.name}
                    className="flex overflow-hidden group"
                  >
                    {social.name.split("").map((char, cIndex) => (
                      <MenuCharacter
                        key={cIndex}
                        char={char}
                        delay={0.5 + cIndex * 0.02 + sIndex * 0.1}
                      />
                    ))}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- MAIN APP COMPONENT (DEMO) ---
function MenuCharacter({ char, delay }: { char: string; delay: number }) {
  const wipeVariants = {
    initial: { color: "rgba(0,0,0,0)", backgroundColor: "rgba(0,0,0,0)" },
    animate: {
      color: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "#ffffff", "#ffffff"],
      backgroundColor: ["rgba(0,0,0,0)", "#262626", "#262626", "rgba(0,0,0,0)"],
      transition: {
        duration: 0.4,
        times: [0, 0.01, 0.99, 1],
        delay: delay + 0.6,
      },
    },
    exit: {
      color: ["#ffffff", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
      backgroundColor: ["rgba(0,0,0,0)", "#262626", "#262626", "rgba(0,0,0,0)"],
      transition: { duration: 0.4, times: [0, 0.01, 0.99, 1], delay: delay },
    },
  };
  return (
    <motion.span
      variants={wipeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="inline-block whitespace-pre"
    >
      {char}
    </motion.span>
  );
}
