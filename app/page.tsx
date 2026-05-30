import Link from "next/link";
import { Nav } from "@/components/Nav";
import { CONTRACTS_TAG_URL, SIM_TAG_URL } from "@/lib/config";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center">
        {/* Hero — Opsi-4 description verbatim (sim/README.md). */}
        <section className="w-full max-w-3xl px-6 py-24 sm:py-32">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400 mb-6">
            Sui Overflow 2026 · DeepBook track
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight tracking-tight text-zinc-50">
            A liquidity vault on DeepBook Predict that earns yield AND hedges
            its own downside.
          </h1>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-zinc-400">
            Plus: a built-in calculator that quantifies your safe deposit size —
            the question DeepBook itself flags as gating serious LP
            participation.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/earn"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Open the Earn dashboard
            </Link>
            <Link
              href="/calculator"
              className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 hover:border-zinc-500 transition-colors"
            >
              Try the safe-size calculator
            </Link>
          </div>
        </section>

        {/* Three pillars — honest framing (two hold, one collapses). */}
        <section className="w-full max-w-3xl px-6 pb-24 grid gap-6 sm:grid-cols-3">
          <Pillar
            title="Tail truncation"
            body="The SVI-shaped DN ladder truncates the crash left tail. p01 reduction is positive and grows with the LP-share f — a quantified residual tail, not an absolute claim."
          />
          <Pillar
            title="Liquidity escape-hatch (R3)"
            body="Post-crash the PLP withdraw limiter can freeze your capital. Strata's hedge leg redeems permissionlessly, bypassing the limiter — the only liquid exit in a crash."
          />
          <Pillar
            title="f* methodology"
            body="The calculator answers DeepBook's own gating question — what is my safe deposit size — from the §3 strike-local (u(k) − f) framework, anchored to the frozen simulator."
          />
        </section>

        <footer className="w-full border-t border-zinc-800 py-8 text-center text-xs text-zinc-500">
          <p>
            Backtested Gate-B verdict: MARGINAL (honest). Two-of-three pillars
            hold under disjunctive synthesis.
          </p>
          <p className="mt-2 flex justify-center gap-4">
            <a href={SIM_TAG_URL} className="hover:text-zinc-300 underline">
              sim @ v0.1.0-simulator-closed
            </a>
            <a
              href={CONTRACTS_TAG_URL}
              className="hover:text-zinc-300 underline"
            >
              contracts @ v0.1.0-contracts-testnet
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
    </div>
  );
}
