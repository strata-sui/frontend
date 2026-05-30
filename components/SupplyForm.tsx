"use client";

/**
 * SupplyForm — deposit dUSDC into the Strata vault, receive sSTRATA shares.
 *
 * Coin-selection strategy:
 *   We fetch all the user's dUSDC coin objects and find the one with the
 *   largest balance to use as the input coin.  The buildSupplyTx PTB splits
 *   the exact amountMicro from that coin before calling vault::supply, so the
 *   user never needs to pre-merge.  If the requested amount exceeds the largest
 *   single coin's balance we surface a friendly message rather than failing
 *   silently — full multi-coin merging in a wrapper tx is an F-later nicety.
 *
 *   Diction rule B: avoid forbidden terms (see scripts/diction-audit.mjs).
 *   Approved: "tail truncation", "quantified residual", "downside-truncated".
 */

import { useState, useCallback } from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { DUSDC_TYPE, MICRO, VAULT_ID } from "@/lib/config";
import { buildSupplyTx } from "@/lib/sui";

// ── helpers ────────────────────────────────────────────────────────────────

function fmt6(micro: bigint, decimals = 4): string {
  const whole = micro / BigInt(MICRO);
  const frac = micro % BigInt(MICRO);
  return `${whole.toLocaleString()}.${frac.toString().padStart(6, "0").slice(0, decimals)}`;
}

function parseInputToMicro(raw: string): bigint | null {
  const n = parseFloat(raw);
  if (!isFinite(n) || n <= 0) return null;
  return BigInt(Math.round(n * MICRO));
}

interface CoinObj {
  coinObjectId: string;
  balance: string;
}

function largestCoin(coins: CoinObj[]): CoinObj | null {
  if (coins.length === 0) return null;
  return coins.reduce((a, b) =>
    BigInt(b.balance) > BigInt(a.balance) ? b : a,
  );
}

// ── component ─────────────────────────────────────────────────────────────

export function SupplyForm() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const [amountInput, setAmountInput] = useState("");
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "pending" }
    | { type: "success"; digest: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  // Fetch the user's dUSDC coins on demand (not reactive — triggered on submit)
  const handleSupply = useCallback(async () => {
    if (!account) return;

    const amountMicro = parseInputToMicro(amountInput);
    if (amountMicro === null) {
      setStatus({ type: "error", message: "Enter a valid positive amount." });
      return;
    }

    setStatus({ type: "pending" });
    try {
      // Fetch all dUSDC coin objects
      const coinsRes = await client.getCoins({
        owner: account.address,
        coinType: DUSDC_TYPE,
      });
      const largest = largestCoin(coinsRes.data);

      if (!largest) {
        setStatus({ type: "error", message: "No dUSDC coins found in this wallet." });
        return;
      }

      if (amountMicro > BigInt(largest.balance)) {
        // If the user has multiple coins summing to enough, ask them to
        // consolidate — merging across many objects is an F-later nicety.
        setStatus({
          type: "error",
          message: `Amount exceeds your largest dUSDC coin (${fmt6(BigInt(largest.balance))} dUSDC). Consolidate your dUSDC coins first or enter a smaller amount.`,
        });
        return;
      }

      const tx = buildSupplyTx({
        sender: account.address,
        amountMicro,
        dusdcCoinId: largest.coinObjectId,
      });

      const result = await signAndExecute({ transaction: tx });
      const digest = result.digest;

      setStatus({ type: "success", digest });
      setAmountInput("");

      // Invalidate vault state + user coin queries so VaultStateCard refreshes
      queryClient.invalidateQueries({ queryKey: ["vaultGetters", VAULT_ID] });
      queryClient.invalidateQueries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message: msg });
    }
  }, [account, amountInput, client, signAndExecute, queryClient]);

  // ── not connected ──────────────────────────────────────────────────────
  if (!account) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold mb-3 tracking-tight">Supply dUSDC</h3>
        <p className="text-xs text-zinc-500">
          Connect your wallet to supply dUSDC to the vault.
        </p>
      </div>
    );
  }

  const isPending = status.type === "pending";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Supply dUSDC</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Deposit dUSDC → receive sSTRATA shares. Yield earned with
          downside-truncated tail exposure; quantified residual remains.
        </p>
      </div>

      {/* Amount input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400 font-medium" htmlFor="supply-amount">
          Amount (dUSDC)
        </label>
        <div className="relative">
          <input
            id="supply-amount"
            type="number"
            min="0"
            step="any"
            placeholder="0.000000"
            value={amountInput}
            onChange={(e) => {
              setAmountInput(e.target.value);
              if (status.type === "error") setStatus({ type: "idle" });
            }}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">
            dUSDC
          </span>
        </div>
      </div>

      {/* Status messages */}
      {status.type === "error" && (
        <div className="rounded-lg bg-red-950/50 border border-red-900 px-3 py-2.5 text-xs text-red-400">
          {status.message}
        </div>
      )}

      {status.type === "success" && (
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-900 px-3 py-2.5 text-xs text-emerald-400">
          Supply confirmed.{" "}
          <a
            href={`https://suiscan.xyz/testnet/tx/${status.digest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-emerald-300 transition-colors break-all"
          >
            {status.digest.slice(0, 10)}…{status.digest.slice(-6)}
          </a>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSupply}
        disabled={isPending || !amountInput}
        className="w-full rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold py-2.5 px-4 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-zinc-900 animate-spin" />
            Waiting for signature…
          </span>
        ) : (
          "Supply"
        )}
      </button>

      <p className="text-[10px] text-zinc-600">
        Testnet only. Tail truncation leaves a quantified residual — not a complete hedge.
      </p>
    </div>
  );
}
