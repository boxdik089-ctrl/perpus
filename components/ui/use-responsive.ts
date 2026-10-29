"use client";

import { useEffect, useState } from "react";

export interface ResponsiveProp<T> {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export function useResponsive<T>(val: T | ResponsiveProp<T> | undefined, fallback: T = 196 as unknown as T): T {
  // If val is a primitive (number, string, etc.), return it directly
  if (val === undefined || val === null) {
    return fallback;
  }

  if (typeof val !== "object" || !("sm" in val || "md" in val || "lg" in val || "xl" in val)) {
    return val as T;
  }

  const responsive = val as ResponsiveProp<T>;

  // Initial SSR / safe value
  const [current, setCurrent] = useState<T>(() => {
    return responsive.xl ?? responsive.lg ?? responsive.md ?? responsive.sm ?? fallback;
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280 && responsive.xl !== undefined) setCurrent(responsive.xl);
      else if (w >= 1024 && responsive.lg !== undefined) setCurrent(responsive.lg);
      else if (w >= 768 && responsive.md !== undefined) setCurrent(responsive.md);
      else if (w >= 640 && responsive.sm !== undefined) setCurrent(responsive.sm);
      else setCurrent(responsive.sm ?? responsive.md ?? responsive.lg ?? responsive.xl ?? fallback);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [responsive, fallback]);

  return current;
}
