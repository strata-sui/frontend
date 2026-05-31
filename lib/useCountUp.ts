"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useCountUp — animates a number from 0 to `target` over `durationMs`.
 * Re-runs whenever `target` changes. Respects prefers-reduced-motion.
 */
export function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(target);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    let startTs: number | null = null;
    const from = 0;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = Math.min(1, (ts - startTs) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs]);

  return value;
}
