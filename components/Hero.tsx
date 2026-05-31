"use client";

import Link from "next/link";
import { useTypewriter } from "@/lib/useTypewriter";
import { headingFont } from "@/lib/ui";

export function Hero() {
  const { display, done } = useTypewriter(
    "A tail-truncated DeepBook Predict vault — and the calculator that tells you your safe size.",
    24,
    450,
  );

  return (
    <div className="relative z-10">
      <h1
        className="text-balance text-[clamp(34px,6vw,64px)] font-medium leading-[1.05] text-white"
        style={headingFont}
      >
        Earn PLP yield. Hedge your own crash.
      </h1>

      <p className="text-white/60 text-[clamp(15px,2.2vw,20px)] mt-4 max-w-xl min-h-[3.5em] sm:min-h-[2.5em]">
        {display}
        {!done && (
          <span className="text-emerald-400 animate-pulse" aria-hidden>
            |
          </span>
        )}
      </p>

      <div
        className="strata-fade-up flex flex-wrap gap-2 mt-10"
        style={{ animationDelay: "400ms" }}
      >
        <Link
          href="/earn"
          className="rounded-full bg-emerald-400 text-black text-[14px] px-5 py-2 hover:bg-emerald-300 transition-colors"
        >
          Open the vault &rarr;
        </Link>
        <Link
          href="/calculator"
          className="rounded-full border border-white/20 text-white text-[14px] px-5 py-2 hover:bg-white hover:text-black transition-colors"
        >
          Try the calculator &rarr;
        </Link>
      </div>
    </div>
  );
}
