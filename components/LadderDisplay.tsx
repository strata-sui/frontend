"use client";

/**
 * LadderDisplay — event-sourced view of the DN hedge ladder.
 *
 * There is NO ladder vector stored on the Vault. Each leg is reconstructed
 * from `ladder::LadderLegOpened` events; legs already realized via the R3
 * escape-hatch are cross-flagged from `r3::R3LiquidityRealized` (matched on
 * oracle_id + strike).
 *
 * IMPORTANT on-chain reality: `ladder::open_hedge_ladder` is currently blocked
 * on testnet by a strike-grid alignment fix (tracked as #41, a Move-side
 * package upgrade). Until that ships there will be NO live LadderLegOpened
 * events — this component renders a calm, explanatory empty state, never a
 * crash. The wiring is complete and lights up the moment legs exist.
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

interface Leg extends LegEvent {
  redeemed: boolean;
  liquidCashDelta?: string;
}

function fmtUsd6(raw: string): string {
  const v = BigInt(raw || "0");
  const whole = v / BigInt(MICRO);
  const frac = v % BigInt(MICRO);
  return `${whole.toLocaleString()}.${frac.toString().padStart(6, "0").slice(0, 2)}`;
}

async function fetchLegs(
  client: ReturnType<typeof useSuiClient>,
): Promise<Leg[]> {
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

  return legRes.data
    .map((e) => e.parsedJson as LegEvent)
    .filter((j) => j.vault_id === VAULT_ID)
    .map((j) => {
      const hit = r3Index.get(`${j.oracle_id}:${j.strike}`);
      return {
        ...j,
        redeemed: hit !== undefined,
        liquidCashDelta: hit?.liquid_cash_delta,
      };
    });
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm shadow-xl overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-zinc-800">
        <h2 className="text-base font-semibold tracking-tight">
          DN hedge ladder
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Event-sourced from <span className="font-mono">LadderLegOpened</span>.
          All legs are DOWN binaries shaped to the PLP loss-onset band — the tail
          truncation, a quantified residual rather than a complete hedge.
        </p>
      </div>

      <div className="px-5 py-4">
        {isLoading && (
          <p className="text-sm text-zinc-500 py-6 text-center">
            Loading ladder events…
          </p>
        )}

        {!isLoading && (!legs || legs.length === 0) && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-5 text-center">
            <p className="text-sm text-zinc-400">No ladder legs open yet.</p>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed max-w-md mx-auto">
              The admin-only <span className="font-mono">open_hedge_ladder</span>{" "}
              entry is pending a strike-grid alignment upgrade on testnet. Once a
              ladder is opened, its DOWN legs appear here and the R3 escape-hatch
              activates per settled leg.
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
                  .sort((a, b) => Number(a.leg_index) - Number(b.leg_index))
                  .map((leg) => (
                    <tr
                      key={`${leg.oracle_id}:${leg.strike}:${leg.leg_index}`}
                      className="border-t border-zinc-800/60"
                    >
                      <td className="py-2.5 pr-4">#{leg.leg_index}</td>
                      <td className="py-2.5 pr-4">
                        {BigInt(leg.strike).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400">DOWN</td>
                      <td className="py-2.5 pr-4">${fmtUsd6(leg.quantity)}</td>
                      <td className="py-2.5 pr-4">
                        {leg.redeemed ? (
                          <span className="text-emerald-400">
                            R3 realized
                            {leg.liquidCashDelta
                              ? ` (+$${fmtUsd6(leg.liquidCashDelta)})`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-zinc-500">Open</span>
                        )}
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
