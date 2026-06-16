export interface AsciiPoint {
  id: number;

  x: number;
  y: number;
  z: number;

  brightness: number;

  char: string;

  r: number;
  g: number;
  b: number;
  a: number;

  scale: number;

  originalX: number;
  originalY: number;
  originalZ: number;
}

export interface MouseField {
  x: number;
  y: number;
  radius: number;
}

export type AsciiPreset =
  | "idle"
  | "ripple"
  | "scramble"
  | "reveal"
  | "explode";

export interface AsciiConfig {
  image: string;

  resolution: number;

  charset: string;

  pointSize: number;

  color: string;

  hoverRadius: number;

  preset: AsciiPreset;

  revealSpeed: number;
}

export interface ImageSample {
  brightness: number;

  r: number;
  g: number;
  b: number;
  a: number;
}