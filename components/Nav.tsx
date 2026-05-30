"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";

export function Nav() {
  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold tracking-tight text-lg">
            Strata
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/earn" className="hover:text-zinc-100 transition-colors">
              Earn
            </Link>
            <Link
              href="/calculator"
              className="hover:text-zinc-100 transition-colors"
            >
              Calculator
            </Link>
          </div>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}
