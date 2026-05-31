"use client";

import { useEffect, useState } from "react";

/**
 * useTypewriter — types `text` out one char at a time.
 * @param text       full string to reveal
 * @param speedMs    ms per character
 * @param startDelay ms before typing begins
 * Returns { display, done }. Respects prefers-reduced-motion (instant).
 */
export function useTypewriter(text: string, speedMs = 32, startDelay = 500) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Defer to an async frame so we don't setState synchronously in-effect.
      const id = requestAnimationFrame(() => {
        setDisplay(text);
        setDone(true);
      });
      return () => cancelAnimationFrame(id);
    }

    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setDisplay(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speedMs);
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, speedMs, startDelay]);

  return { display, done };
}
