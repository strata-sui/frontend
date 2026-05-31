"use client";

/**
 * R3Button — the liquidity escape-hatch.
 *
 * Post-crash, `available_for_withdraw = balance − total_max_payout → 0` and
 * the PLP withdraw limiter freezes normal exits. The manager-side R3 path
 * (`r3::redeem_permissionless`) BYPASSES the limiter by realizing liquidity
 * directly from a settled DOWN ladder leg — the only liquid exit in a crash.
 * It is permissionless by Predict design: anyone can call it.
 *
 * Verified at sim closure: the R3 path produced a $383,063 liquid-cash delta
 * versus a limiter-bound exit (see SUBMISSION.md, v0.1.0-simulator-closed).
 *
 * Execution requires a SETTLED leg's full coordinates — including the OracleSVI
 * shared-object id, which is NOT carried in the LadderLegOpened event. Until a
 * ladder is opened on testnet (blocked by the strike-grid fix, #41) there are
 * no settled legs to act on, so this renders an explanatory, disabled affordance.
 * The PTB wiring (buildR3Tx) is complete and lights up once a leg is passed in.
 */

import { useState, useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { VAULT_ID } from "@/lib/config";
import { buildR3Tx } from "@/lib/sui";

/** Full coordinates needed to realize a settled DOWN ladder leg via R3. */
export interface SettledLeg {
  managerId: string;
  oracleSviId: string;
  oracleId: string;
  expiry: bigint;
  strike: bigint;
  quantity: bigint;
}

export function R3Button({ leg }: { leg?: SettledLeg }) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "pending" }
    | { type: "success"; digest: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const handleR3 = useCallback(async () => {
    if (!leg) return;
    setStatus({ type: "pending" });
    try {
      const tx = buildR3Tx(leg);
      const result = await signAndExecute({ transaction: tx });
      setStatus({ type: "success", digest: result.digest });
      queryClient.invalidateQueries({ queryKey: ["vaultGetters", VAULT_ID] });
      queryClient.invalidateQueries({ queryKey: ["ladderLegs", VAULT_ID] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message: msg });
    }
  }, [leg, signAndExecute, queryClient]);

  const isPending = status.type === "pending";
  const enabled = leg !== undefined && account !== null && !isPending;

  return (
    <div
      id="r3"
      className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 flex flex-col gap-3"
    >
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-amber-200">
          R3 liquidity escape-hatch
        </h3>
        <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
          Realizes liquidity directly from a settled DOWN ladder leg, bypassing
          the vault withdraw limiter — the liquid exit when normal redemptions
          freeze in a crash. Permissionless: anyone can call it.
        </p>
      </div>

      <div className="rounded-lg border border-amber-900/40 bg-amber-950/30 px-3 py-2">
        <p className="text-[11px] text-amber-300/80">
          Verified at sim closure: a{" "}
          <span className="font-mono text-amber-200">$383,063</span> liquid-cash
          delta versus a limiter-bound exit.{" "}
          <a
            href="https://github.com/strata-sui/sim/blob/v0.1.0-simulator-closed/SUBMISSION.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-amber-100"
          >
            See SUBMISSION.md
          </a>
          .
        </p>
      </div>

      {!leg && (
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          No settled ladder leg available to realize. The admin-only ladder open
          is pending a testnet strike-grid upgrade; once a leg settles, its R3
          trigger activates here.
        </p>
      )}

      {status.type === "error" && (
        <div className="rounded-lg bg-red-950/50 border border-red-900 px-3 py-2.5 text-xs text-red-400 break-words">
          {status.message}
        </div>
      )}

      {status.type === "success" && (
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-900 px-3 py-2.5 text-xs text-emerald-400">
          R3 liquidity realized.{" "}
          <a
            href={`https://suiscan.xyz/testnet/tx/${status.digest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-emerald-300 break-all"
          >
            {status.digest.slice(0, 10)}…{status.digest.slice(-6)}
          </a>
        </div>
      )}

      <button
        onClick={handleR3}
        disabled={!enabled}
        title="Liquidity escape-hatch (R3). Anyone can call. $383k delta verified at sim closure — see SUBMISSION.md."
        className="w-full rounded-lg bg-amber-400 text-amber-950 text-sm font-semibold py-2.5 px-4 hover:bg-amber-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-700 border-t-amber-950 animate-spin" />
            Waiting for signature…
          </span>
        ) : (
          "Realize R3 liquidity"
        )}
      </button>
    </div>
  );
}
