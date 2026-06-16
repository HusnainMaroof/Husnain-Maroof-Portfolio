export const ASCII_CHARS =
  "RAPSxcsuadw";
// acsiiCharacters.ts
export function getCharacterFromBrightness(
  brightness: number,
  charset: string = ASCII_CHARS
): string {
  const normalized =
    Math.max(
      0,
      Math.min(255, brightness)
    );

  const index =
    Math.floor(
      (normalized / 255) *
        (charset.length - 1)
    );

  return charset[
    charset.length - 1 - index
  ];
}

export function getCharacterWeight(
  brightness: number
): number {
  return 1 - brightness / 255;
}

export function getOpacityFromBrightness(
  brightness: number
): number {
  return (
    0.25 +
    (1 - brightness / 255) *
      0.75
  );
}

export function getScaleFromBrightness(
  brightness: number
): number {
  return (
    0.6 +
    (1 - brightness / 255) *
      1.2
  );
}

export const SCRAMBLE_SET =
  "@#$%&*RAPS01XYZ";