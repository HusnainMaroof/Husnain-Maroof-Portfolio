// imageToAscii.ts

import { AsciiPoint, ImageSample } from "../types/ascii";
import {
  getCharacterFromBrightness,
  getScaleFromBrightness,
} from "./asciiCharacters";

export async function imageToAscii(
  src: string,
  resolution = 3,
): Promise<AsciiPoint[]> {
  const image = await loadImage(src);

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d")!;

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0, image.width, image.height);

  const pixels = ctx.getImageData(0, 0, image.width, image.height);

  const points: AsciiPoint[] = [];

  let id = 0;

  for (let y = 0; y < image.height; y += resolution) {
    for (let x = 0; x < image.width; x += resolution) {
      const sample = getPixelSample(pixels.data, image.width, x, y);

      if (sample.a < 10) continue;

      const char = getCharacterFromBrightness(sample.brightness);

      points.push({
        id: id++,

        x,
        y,
        z: 0,

        originalX: x,
        originalY: y,
        originalZ: 0,

        brightness: sample.brightness,

        char,

        r: sample.r,
        g: sample.g,
        b: sample.b,
        a: sample.a,

        scale: getScaleFromBrightness(sample.brightness),
      });
    }
  }

  return points;
}

function getPixelSample(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
): ImageSample {
  const index = (y * width + x) * 4;

  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];

  const brightness = (r + g + b) / 3;

  return {
    brightness,
    r,
    g,
    b,
    a,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.src = src;

    image.onload = () => resolve(image);

    image.onerror = reject;
  });
}
