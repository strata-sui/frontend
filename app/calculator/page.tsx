import { Nav } from "@/components/Nav";

export default function CalculatorPage() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center">
        <section className="w-full max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">
            Safe-size calculator
          </h1>
          <p className="mt-3 text-zinc-400">
            The §3 self-reference visualizer lands in F5.
          </p>
        </section>
      </main>
    </>
  );
}
