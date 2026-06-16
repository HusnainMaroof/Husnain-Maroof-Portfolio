// AsciiScene.tsx

"use client";

import { Canvas } from "@react-three/fiber";

import AsciiInstances from "./AsciiInstances";

import { AsciiPoint } from "../../types/ascii";

interface Props {
  points: AsciiPoint[];

  mouse: React.MutableRefObject<{
    x: number;
    y: number;
    radius: number;
  }>;
}

export default function AsciiScene({ points, mouse }: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{
        position: [0, 0, 6],
        fov: 40,
      }}
    >
      <ambientLight intensity={2} />

      <AsciiInstances points={points} mouse={mouse} />
    </Canvas>
  );
}
