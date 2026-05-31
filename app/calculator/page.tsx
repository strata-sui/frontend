import { Nav } from "@/components/Nav";
import { Calculator } from "@/components/Calculator";

export default function CalculatorPage() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center">
        <section className="w-full max-w-4xl px-6 py-12">
          <h1 className="text-2xl font-semibold tracking-tight">
            Safe-size calculator
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            The optimal-f methodology — Strata&apos;s headline differentiator —
            answers DeepBook&apos;s own gating question: is PLP safe, and
            what&apos;s my safe size? Move the tail-aversion slider to see how
            the risk-adjusted objective shifts, and where f* lands.
          </p>
          <div className="mt-8">
            <Calculator />
          </div>
        </section>
      </main>
    </>
  );
}
