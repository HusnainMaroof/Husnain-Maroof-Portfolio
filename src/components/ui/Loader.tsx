"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhaseLoaderProps {
  counter: number;
  visible: boolean;
}

export default function PhaseLoader({ counter, visible }: PhaseLoaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-8xl md:text-9xl font-bold tracking-tighter text-black">
            {counter}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}