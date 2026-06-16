
// AsciiInstances.tsx
"use client";

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { AsciiPoint } from "../../types/ascii";

interface Props {
  points: AsciiPoint[];
  mouse: React.MutableRefObject<{
    x: number;
    y: number;
    radius: number;
  }>;
}

export default function AsciiInstances({ points, mouse }: Props) {
  const refs = useRef<any[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const p = points[i];

      if (!p) return;

      const px = p.originalX * 0.01 - 3;
      const py = -p.originalY * 0.01 + 4;

      const dx = px - mouse.current.x;
      const dy = py - mouse.current.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      const influence = Math.max(0, 1 - dist / mouse.current.radius);

      const ripple = Math.sin(dist * 10 - t * 4) * influence;

      const targetX = px + dx * influence * 0.12;

      const targetY = py + dy * influence * 0.12;

      const targetZ = ripple * 0.35;

      mesh.position.x += (targetX - mesh.position.x) * 0.12;

      mesh.position.y += (targetY - mesh.position.y) * 0.12;

      mesh.position.z += (targetZ - mesh.position.z) * 0.12;

      const targetScale = p.scale * (1 + influence * 1.8);

      mesh.scale.x += (targetScale - mesh.scale.x) * 0.15;

      mesh.scale.y += (targetScale - mesh.scale.y) * 0.15;

      mesh.scale.z += (targetScale - mesh.scale.z) * 0.15;

      if (mesh.material && mesh.material.color) {
        mesh.material.color.set(influence > 0.5 ? "#ffffff" : "#d4d4d4");
      }
    });
  });

  return (
    <>
      {points.map((point, i) => (
        <Text
          key={point.id}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[
            point.originalX * 0.01 - 3,
            -point.originalY * 0.01 + 4,
            0,
          ]}
          fontSize={0.045}
          color="#d4d4d4"
          anchorX="center"
          anchorY="middle"
        >
          {point.char}
        </Text>
      ))}
    </>
  );
}
