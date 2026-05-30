"use client";

/**
 * WithdrawForm — redeem sSTRATA shares → receive dUSDC back from the vault.
 *
 * Coin-selection strategy:
 *   We fetch all the user's Coin<VAULT> objects and pick the one with the
 *   largest balance as the input coin for buildRedeemTx.  If sharesMicro
 *   equals the full balance of that coin we omit sharesMicro (redeem whole
 *   coin without a split).  Partial amounts split inside the PTB builder.
 *
 * Limiter error handling:
 *   vault::redeem flows through Predict's withdraw limiter.  When the vault's
 *   available_for_withdraw is below the requested amount the tx aborts with
 *   EWithdrawExceedsAvailable.  We catch that and render a prominent callout
 *   pointing to the R3 escape-hatch which bypasses the limiter.
 *
 *   Diction rule B: avoid forbidden terms (see scripts/diction-audit.mjs).
 */

import { useState, useCallback } from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { VAULT_COIN_TYPE, MICRO, VAULT_ID } from "@/lib/config";
import { buildRedeemTx } from "@/lib/sui";

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

/** Returns true when an error string suggests the withdraw-limiter fired. */
function isLimiterError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("ewithdrawexceedsavailable") ||
    lower.includes("withdraw exceeds available") ||
    lower.includes("available_for_withdraw") ||
    // Move abort codes surface as hex in some RPC responses
    lower.includes("abort") && lower.includes("3")
  );
}

// ── component ─────────────────────────────────────────────────────────────

export function WithdrawForm() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  const [sharesInput, setSharesInput] = useState("");
  const [maxBalance, setMaxBalance] = useState<bigint | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "pending" }
    | { type: "success"; digest: string }
    | { type: "error"; message: string; isLimiter: boolean }
  >({ type: "idle" });

  // Fetch share balance when the user focuses the input (lazy load)
  const fetchBalance = useCallback(async () => {
    if (!account || maxBalance !== null) return;
    setLoadingBalance(true);
    try {
      const res = await client.getCoins({
        owner: account.address,
        coinType: VAULT_COIN_TYPE,
      });
      const best = largestCoin(res.data);
      if (best) {
        setMaxBalance(BigInt(best.balance));
      } else {
        setMaxBalance(0n);
      }
    } catch {
      // non-fatal — balance display stays empty
    } finally {
      setLoadingBalance(false);
    }
  }, [account, client, maxBalance]);

  const handleMax = useCallback(async () => {
    if (!account) return;
    setLoadingBalance(true);
    try {
      const res = await client.getCoins({
        owner: account.address,
        coinType: VAULT_COIN_TYPE,
      });
      const best = largestCoin(res.data);
      if (best) {
        const bal = BigInt(best.balance);
        setMaxBalance(bal);
        // Display full balance as human decimal
        const whole = bal / BigInt(MICRO);
        const frac = bal % BigInt(MICRO);
        setSharesInput(`${whole}.${frac.toString().padStart(6, "0")}`);
      }
    } catch {
      // ignore
    } finally {
      setLoadingBalance(false);
    }
  }, [account, client]);

  const handleWithdraw = useCallback(async () => {
    if (!account) return;

    const sharesMicro = parseInputToMicro(sharesInput);
    if (sharesMicro === null) {
      setStatus({ type: "error", message: "Enter a valid positive share amount.", isLimiter: false });
      return;
    }

    setStatus({ type: "pending" });
    try {
      // Fetch share coins fresh on submit (may have changed since focus-load)
      const res = await client.getCoins({
        owner: account.address,
        coinType: VAULT_COIN_TYPE,
      });
      const best = largestCoin(res.data);

      if (!best) {
        setStatus({ type: "error", message: "No sSTRATA coins found in this wallet.", isLimiter: false });
        return;
      }

      const bestBalance = BigInt(best.balance);
      setMaxBalance(bestBalance);

      if (sharesMicro > bestBalance) {
        setStatus({
          type: "error",
          message: `Amount exceeds your largest sSTRATA coin (${fmt6(bestBalance)} sSTRATA). Enter a smaller amount or press Max.`,
          isLimiter: false,
        });
        return;
      }

      // If redeeming the exact full balance, omit sharesMicro so the builder
      // skips the split and passes the whole coin object directly.
      const tx = buildRedeemTx({
        sender: account.address,
        shareCoinId: best.coinObjectId,
        sharesMicro: sharesMicro === bestBalance ? undefined : sharesMicro,
      });

      const result = await signAndExecute({ transaction: tx });
      setStatus({ type: "success", digest: result.digest });
      setSharesInput("");
      setMaxBalance(null); // reset so next focus re-fetches

      // Refresh vault state card + coin balances
      queryClient.invalidateQueries({ queryKey: ["vaultGetters", VAULT_ID] });
      queryClient.invalidateQueries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message: msg, isLimiter: isLimiterError(msg) });
    }
  }, [account, sharesInput, client, signAndExecute, queryClient]);

  // ── not connected ──────────────────────────────────────────────────────
  if (!account) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-semibold mb-3 tracking-tight">Withdraw sSTRATA</h3>
        <p className="text-xs text-zinc-500">
          Connect your wallet to withdraw from the vault.
        </p>
      </div>
    );
  }

  const isPending = status.type === "pending";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Withdraw sSTRATA</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Redeem sSTRATA shares → receive dUSDC. Subject to the vault
          withdraw limiter; the R3 escape-hatch bypasses it in a crash.
        </p>
      </div>

      {/* Share balance display */}
      {maxBalance !== null && (
        <p className="text-xs text-zinc-500">
          Balance:{" "}
          <span className="font-mono text-zinc-300">{fmt6(maxBalance)} sSTRATA</span>
        </p>
      )}
      {loadingBalance && (
        <p className="text-xs text-zinc-600 animate-pulse">Loading balance…</p>
      )}

      {/* Shares input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400 font-medium" htmlFor="withdraw-shares">
          Shares (sSTRATA)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="withdraw-shares"
              type="number"
              min="0"
              step="any"
              placeholder="0.000000"
              value={sharesInput}
              onFocus={fetchBalance}
              onChange={(e) => {
                setSharesInput(e.target.value);
                if (status.type === "error") setStatus({ type: "idle" });
              }}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">
              sSTRATA
            </span>
          </div>
          <button
            type="button"
            onClick={handleMax}
            disabled={isPending}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Max
          </button>
        </div>
      </div>

      {/* Status messages */}
      {status.type === "error" && !status.isLimiter && (
        <div className="rounded-lg bg-red-950/50 border border-red-900 px-3 py-2.5 text-xs text-red-400">
          {status.message}
        </div>
      )}

      {/* Limiter-specific error — prominent callout pointing to R3 */}
      {status.type === "error" && status.isLimiter && (
        <div className="rounded-lg bg-amber-950/50 border border-amber-800 px-3 py-3 text-xs text-amber-300 space-y-1.5">
          <p className="font-semibold">Withdraw limiter active</p>
          <p className="text-amber-400/80">
            The vault&apos;s limiter-bound exit is constrained — not enough
            dUSDC is available to cover your redemption right now. This is
            expected during high utilisation or after a large market move.
          </p>
          <p className="text-amber-400/80">
            The{" "}
            <a
              href="/earn#r3"
              className="underline underline-offset-2 hover:text-amber-200 transition-colors"
            >
              R3 escape-hatch
            </a>{" "}
            bypasses this limiter by realising liquidity directly from settled
            DN ladder legs — it is the liquid exit path during a crash.
          </p>
        </div>
      )}

      {status.type === "success" && (
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-900 px-3 py-2.5 text-xs text-emerald-400">
          Withdrawal confirmed.{" "}
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
        onClick={handleWithdraw}
        disabled={isPending || !sharesInput}
        className="w-full rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold py-2.5 px-4 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-zinc-900 animate-spin" />
            Waiting for signature…
          </span>
        ) : (
          "Withdraw"
        )}
      </button>

      <p className="text-[10px] text-zinc-600">
        Testnet only. Redemption flows through the vault withdraw limiter.
        Tail truncation leaves a quantified residual — not a complete hedge.
      </p>
    </div>
  );
}
