import { Nav } from "@/components/Nav";
import { VaultStateCard } from "@/components/VaultStateCard";
import { SupplyForm } from "@/components/SupplyForm";
import { WithdrawForm } from "@/components/WithdrawForm";
import { LadderDisplay } from "@/components/LadderDisplay";
import { R3Button } from "@/components/R3Button";
import { HonestDisclosureCard } from "@/components/HonestDisclosureCard";

export default function EarnPage() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center">
        <section className="w-full max-w-3xl px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Earn</h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Supply dUSDC to the Strata vault — earn PLP-style yield with
              downside-truncated tail risk. The hedge ladder reduces left-tail
              exposure; a quantified residual remains.
            </p>
          </div>

          {/* Honest-disclosure card — mandatory on earn (frontend_brief F7). */}
          <HonestDisclosureCard className="mb-6" />

          {/* Live vault state */}
          <VaultStateCard />

          {/* Supply / Withdraw forms — side-by-side on desktop, stacked on mobile */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SupplyForm />
            <WithdrawForm />
          </div>

          {/* DN hedge ladder — event-sourced view of open / R3-realized legs */}
          <div className="mt-6">
            <LadderDisplay />
          </div>

          {/* R3 liquidity escape-hatch — owns the #r3 anchor for the limiter callout */}
          <div className="mt-6">
            <R3Button />
          </div>
        </section>
      </main>
    </>
  );
}
