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
      <main className="flex flex-1 w-full flex-col items-center relative z-10">
        <section className="w-full max-w-3xl px-5 sm:px-8 pt-28 pb-16">
          <div className="mb-8">
            <h1
              className="text-3xl font-medium tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Vault
            </h1>
            <p className="mt-2 text-sm text-white/55 max-w-xl">
              Supply dUSDC to the Strata vault &mdash; earn PLP-style yield with
              downside-truncated tail risk. The hedge ladder reduces left-tail
              exposure; a quantified residual remains.
            </p>
          </div>

          {/* Honest-disclosure card — mandatory on the vault page. */}
          <HonestDisclosureCard className="mb-6" />

          {/* Live vault state */}
          <VaultStateCard />

          {/* Supply / Withdraw forms */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SupplyForm />
            <WithdrawForm />
          </div>

          {/* DN hedge ladder — event-sourced */}
          <div className="mt-6">
            <LadderDisplay />
          </div>

          {/* R3 liquidity escape-hatch — owns the #r3 anchor */}
          <div className="mt-6">
            <R3Button />
          </div>
        </section>
      </main>
    </>
  );
}
