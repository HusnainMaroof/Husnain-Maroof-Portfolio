"use client";
// useAsciiImage.ts
import { useEffect, useState } from "react";
import { AsciiPoint } from "../types/ascii";
import { imageToAscii } from "../lib/imageToAscii";

interface UseAsciiImageOptions {
  image: string;
  resolution?: number;
}

export function useAsciiImage({ image, resolution = 3 }: UseAsciiImageOptions) {
  const [points, setPoints] = useState<AsciiPoint[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const asciiPoints = await imageToAscii(image, resolution);

        if (!mounted) return;

        setPoints(asciiPoints);
      } catch (err) {
        if (!mounted) return;

        setError(err instanceof Error ? err.message : "Failed to load image");
      } finally {
        if (!mounted) return;

        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [image, resolution]);

  return {
    points,
    loading,
    error,
  };
}
