"use client";
        // useMouseField.ts
import { useEffect, useRef } from "react";
import { MouseField } from "../types/ascii";


export function useMouseField(
  radius = 1.5
) {
  const mouse = useRef<MouseField>({
    x: 999,
    y: 999,
    radius,
  });

  useEffect(() => {
    const move = (
      e: PointerEvent
    ) => {
      const x =
        (e.clientX /
          window.innerWidth) *
          2 -
        1;

      const y =
        -(e.clientY /
          window.innerHeight) *
          2 +
        1;

      mouse.current.x = x;
      mouse.current.y = y;
    };

    const leave = () => {
      mouse.current.x = 999;
      mouse.current.y = 999;
    };

    window.addEventListener(
      "pointermove",
      move
    );

    window.addEventListener(
      "pointerleave",
      leave
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerleave",
        leave
      );
    };
  }, []);

  return mouse;
}