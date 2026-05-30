import { Nav } from "@/components/Nav";

export default function EarnPage() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 w-full flex-col items-center">
        <section className="w-full max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">Earn</h1>
          <p className="mt-3 text-zinc-400">
            Vault dashboard, supply and withdraw flows land in F3–F4.
          </p>
        </section>
      </main>
    </>
  );
}
