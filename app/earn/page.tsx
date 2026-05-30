import { Nav } from "@/components/Nav";
import { VaultStateCard } from "@/components/VaultStateCard";
import { SupplyForm } from "@/components/SupplyForm";
import { WithdrawForm } from "@/components/WithdrawForm";

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

          {/* Live vault state */}
          <VaultStateCard />

          {/* Supply / Withdraw forms — side-by-side on desktop, stacked on mobile */}
          <div id="r3" className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SupplyForm />
            <WithdrawForm />
          </div>
        </section>
      </main>
    </>
  );
}
