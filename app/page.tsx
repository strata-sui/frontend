import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { FlowDiagram } from "@/components/FlowDiagram";
import { HonestDisclosureCard } from "@/components/HonestDisclosureCard";
import { glass } from "@/lib/ui";
import { CONTRACTS_TAG_URL, SIM_TAG_URL } from "@/lib/config";

const PILLARS = [
  {
    label: "Tail truncation",
    sub: "DN ladder cuts the crash left tail",
    icon: (
      <path d="M3 17l5-5 4 4 7-9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "R3 escape-hatch",
    sub: "Liquid exit when the limiter freezes",
    icon: (
      <>
        <path d="M14 3h7v7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3l-9 9" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    label: "Optimal-f",
    sub: "Your safe size, quantified",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: "Honest by design",
    sub: "MARGINAL verdict, stated plainly",
    icon: (
      <path
        d="M12 3l8 4v5c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V7l8-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center">
        {/* Hero */}
        <section className="w-full min-h-screen flex flex-col justify-center px-5 sm:px-8 md:px-10 max-w-5xl mx-auto relative z-10">
          <Hero />

          {/* Four pillars as icon cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
            {PILLARS.map((p) => (
              <div key={p.label} className={`${glass} p-4`}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.6"
                  className="mb-3"
                  aria-hidden
                >
                  {p.icon}
                </svg>
                <p className="text-[14px] font-medium text-white">{p.label}</p>
                <p className="text-[12px] text-white/50 mt-0.5 leading-snug">
                  {p.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Capital-flow diagram */}
          <div className={`${glass} mt-6 px-6 py-5`}>
            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
              How capital moves
            </p>
            <FlowDiagram className="w-full max-w-lg h-auto" />
          </div>
        </section>

        {/* Honest-disclosure card — mandatory on landing. */}
        <section className="w-full max-w-5xl px-5 sm:px-8 md:px-10 pb-24 relative z-10">
          <HonestDisclosureCard />
        </section>

        <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-white/40 relative z-10">
          <p className="flex justify-center gap-4 flex-wrap px-4">
            <a href={SIM_TAG_URL} className="hover:text-white/70 underline">
              sim @ v0.1.0-simulator-closed
            </a>
            <a href={CONTRACTS_TAG_URL} className="hover:text-white/70 underline">
              contracts @ v0.1.0-contracts-testnet
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
