import { Nav } from "@/components/Nav";
import { Calculator } from "@/components/Calculator";

export default function CalculatorPage() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center relative z-10">
        <section className="w-full max-w-4xl px-5 sm:px-8 pt-28 pb-16">
          <h1
            className="text-3xl font-medium tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Safe-size calculator
          </h1>
          <p className="mt-2 text-sm text-white/55 max-w-2xl">
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
