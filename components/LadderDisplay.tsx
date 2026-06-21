"use client";

/**
 * LadderDisplay — event-sourced view of the DN hedge ladder.
 *
 * There is NO ladder vector stored on the Vault. Each leg is reconstructed
 * from `ladder::LadderLegOpened` events; legs realized via the R3
 * escape-hatch are cross-flagged from `r3::R3LiquidityRealized` (matched on
 * oracle_id + strike).
 *
 * Settlement status is derived from ON-CHAIN STATE, not event pagination:
 * for each leg's oracle we read `settlement_price`; for settled oracles we
 * read the manager's remaining position quantity for the leg's MarketKey
 * (dynamic field on the PredictManager.positions table). qty > 0 means the
 * leg is settled and crankable via R3; qty == 0 means it was already
 * realized — by our wrapper (R3 event present) or externally via the
 * underlying permissionless entry (anyone can crank; proceeds route to the
 * position's manager either way). ITM/OTM is exact: a DOWN leg pays iff
 * settlement < strike.
 */

import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import {
  EVENT_LADDER_LEG_OPENED,
  EVENT_R3_REALIZED,
  VAULT_ID,
  MICRO,
} from "@/lib/config";

interface LegEvent {
  vault_id: string;
  manager_id: string;
  oracle_id: string;
  expiry: string;
  strike: string;
  leg_index: string;
  quantity: string;
}

interface R3Event {
  vault_id: string;
  oracle_id: string;
  strike: string;
  quantity_redeemed: string;
  liquid_cash_delta: string;
}

type LegStatus =
  | { kind: "open" }
  | { kind: "settled-crankable" }
  | { kind: "realized-itm"; payout: string; viaR3: boolean }
  | { kind: "expired-otm" }
  | { kind: "r3"; delta: string };

interface Leg extends LegEvent {
  status: LegStatus;
}

function fmtUsd6(raw: string): string {
  const v = BigInt(raw || "0");
  const whole = v / BigInt(MICRO);
  const frac = v % BigInt(MICRO);
  return `${whole.toLocaleString()}.${frac.toString().padStart(6, "0").slice(0, 2)}`;
}

type Client = ReturnType<typeof useSuiClient>;

/** Read a settled oracle's settlement price (null while live). */
async function settlementPrice(client: Client, oracleId: string): Promise<bigint | null> {
  try {
    const o = await client.getObject({ id: oracleId, options: { showContent: true } });
    const content = o.data?.content;
    if (content && content.dataType === "moveObject") {
      const f = (content as unknown as { fields: { settlement_price?: string | null } }).fields;
      if (f.settlement_price !== null && f.settlement_price !== undefined) {
        return BigInt(f.settlement_price);
      }
    }
  } catch {
    // RPC hiccup — treat as live
  }
  return null;
}

async function fetchLegs(client: Client): Promise<Leg[]> {
  const [legRes, r3Res] = await Promise.all([
    client.queryEvents({
      query: { MoveEventType: EVENT_LADDER_LEG_OPENED },
      limit: 50,
      order: "descending",
    }),
    client.queryEvents({
      query: { MoveEventType: EVENT_R3_REALIZED },
      limit: 50,
      order: "descending",
    }),
  ]);

  const r3Index = new Map<string, R3Event>();
  for (const e of r3Res.data) {
    const j = e.parsedJson as R3Event;
    if (j.vault_id === VAULT_ID) r3Index.set(`${j.oracle_id}:${j.strike}`, j);
  }

  const legs = legRes.data
    .map((e) => e.parsedJson as LegEvent)
    .filter((j) => j.vault_id === VAULT_ID);

  // Resolve per-oracle settlement + the manager positions table (once each).
  const oracleIds = [...new Set(legs.map((l) => l.oracle_id))];
  const settlements = new Map<string, bigint | null>();
  await Promise.all(
    oracleIds.map(async (oid) => settlements.set(oid, await settlementPrice(client, oid))),
  );
  return Promise.all(
    legs.map(async (j): Promise<Leg> => {
      const r3Hit = r3Index.get(`${j.oracle_id}:${j.strike}`);
      if (r3Hit) {
        return { ...j, status: { kind: "r3", delta: r3Hit.liquid_cash_delta } };
      }
      const settle = settlements.get(j.oracle_id) ?? null;
      if (settle === null) return { ...j, status: { kind: "open" } };

      // Oracle settled — a DOWN leg pays iff settlement < strike.
      const itm = settle < BigInt(j.strike);
      if (!itm) {
        // Settled at/above strike → worthless, nothing to crank.
        return { ...j, status: { kind: "expired-otm" } };
      }
      // ITM, and no R3 event matched above. We deliberately do NOT infer
      // "realized" from the manager's position quantity — a settled position can
      // read 0 as a settlement artifact, so labelling it "realized" without a
      // real R3 event would overstate. ITM + no R3 event ⇒ crankable; only the
      // r3Hit branch above ever asserts realization.
      return { ...j, status: { kind: "settled-crankable" } };
    }),
  );
}

function StatusCell({ status }: { status: LegStatus }) {
  switch (status.kind) {
    case "open":
      return <span className="text-white/40">Open</span>;
    case "settled-crankable":
      return <span className="text-amber-300">ITM — settled · R3-crankable</span>;
    case "r3":
      return (
        <span className="text-emerald-400">
          R3 realized (+${fmtUsd6(status.delta)})
        </span>
      );
    case "realized-itm":
      return (
        <span className="text-emerald-400">
          ITM — realized (+${fmtUsd6(status.payout)})
        </span>
      );
    case "expired-otm":
      return <span className="text-white/35">Expired worthless (OTM)</span>;
  }
}

export function LadderDisplay() {
  const client = useSuiClient();

  const { data: legs, isLoading } = useQuery({
    queryKey: ["ladderLegs", VAULT_ID],
    queryFn: () => fetchLegs(client),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <h2
          className="text-base font-semibold tracking-tight text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          DN hedge ladder
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Event-sourced from <span className="font-mono">LadderLegOpened</span>;
          settlement status read from on-chain state. All legs are DOWN binaries
          shaped to the PLP loss-onset band — the tail truncation, a quantified
          residual rather than a complete hedge. Settlement realization is
          permissionless: anyone can crank, proceeds route to the vault&apos;s
          manager.
        </p>
      </div>

      <div className="px-5 py-4">
        {isLoading && (
          <p className="text-sm text-zinc-500 py-6 text-center">
            Loading ladder events…
          </p>
        )}

        {!isLoading && (!legs || legs.length === 0) && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5 text-center">
            <p className="text-sm text-zinc-400">No ladder legs open yet.</p>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed max-w-md mx-auto">
              The admin-only{" "}
              <span className="font-mono">open_hedge_ladder_aligned</span> entry
              opens DOWN legs across the pinned loss-onset band. Once a ladder is
              opened, its legs appear here and the R3 escape-hatch activates per
              settled leg.
            </p>
          </div>
        )}

        {!isLoading && legs && legs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="py-2 pr-4 font-medium">Leg</th>
                  <th className="py-2 pr-4 font-medium">Strike</th>
                  <th className="py-2 pr-4 font-medium">Dir</th>
                  <th className="py-2 pr-4 font-medium">Quantity</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-200">
                {legs
                  .sort((a, b) =>
                    a.oracle_id === b.oracle_id
                      ? Number(a.leg_index) - Number(b.leg_index)
                      : a.oracle_id.localeCompare(b.oracle_id),
                  )
                  .map((leg) => (
                    <tr
                      key={`${leg.oracle_id}:${leg.strike}:${leg.leg_index}`}
                      className="border-t border-white/5"
                    >
                      <td className="py-2.5 pr-4">#{leg.leg_index}</td>
                      <td className="py-2.5 pr-4">
                        {BigInt(leg.strike).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400">DOWN</td>
                      <td className="py-2.5 pr-4">${fmtUsd6(leg.quantity)}</td>
                      <td className="py-2.5 pr-4">
                        <StatusCell status={leg.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
