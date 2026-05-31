"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";

export function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-20 px-5 sm:px-8 py-4 flex justify-between items-center backdrop-blur-md bg-[#0a0b0d]/60 border-b border-white/5">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-heading text-[22px] tracking-tight text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-emerald-400">✳︎</span>
          Strata
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-[15px] text-white/70">
          <Link href="/earn" className="hover:text-white transition-colors">
            Vault
          </Link>
          <Link href="/calculator" className="hover:text-white transition-colors">
            Calculator
          </Link>
        </div>
      </div>
      <ConnectButton />
    </nav>
  );
}
