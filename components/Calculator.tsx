"use client";

/**
 * Calculator — the §3 self-reference visualizer (Strata's differentiator).
 *
 * DeepBook flags "what's my safe deposit size?" as the question gating serious
 * LP participation. Strata answers it from the strike-local (u(k) - f) framework:
 * Strata's LP-share fraction `f` is the single most important free parameter.
 *
 * The chart plots the tail-aversion-weighted objective
 *     J(f; w) = (1 - w)·Sortino_benign(f) + w·Sortino_crash(f)
 * across the simulated f-grid, from STATIC sim data frozen at
 * v0.1.0-simulator-closed (no live recompute). The argmax is f*(w).
 *
 * The honest discovery (10k benign + 5,900 historical crash windows, under the
 * bounded-loss accounting fix): f*(w) sits at the LOW boundary f = 0.05 for
 * EVERY tail-aversion weight w. The conservative LP-share IS the optimal-f
 * recommendation — not a tail-aversion knob.
 *
 * The live read (f_bps + gross pool value via devInspect) maps f* onto an
 * on-chain deposit ceiling: f = D / (D + pool) <= f* => D <= f* / (1 - f*) * pool.
 */

import { useMemo, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import { VAULT_ID, MICRO } from "@/lib/config";
import {
  buildVaultGettersTx,
  decodeVaultGetters,
  type DecodedVaultGetters,
} from "@/lib/sui";
import { glassStatic } from "@/lib/ui";
import { useCountUp } from "@/lib/useCountUp";

// ── static sim data shape (public/sim-data/s5_gate_b.json) ────────────────────

interface SimData {
  n_paths_benign: number;
  n_paths_crash: number;
  f_grid: number[];
  sortino_benign_strata: number[];
  sortino_crash_strata: number[];
  p01_reduction: number[];
  f_star_summary: { f_star_low_weight: number; f_star_high_weight: number };
  verdict: {
    gate_b: string;
    f_star: number;
    best_p01_reduction: number;
    r3_liquid_cash_delta_usd: number;
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(micro: bigint): string {
  const divisor = BigInt(MICRO);
  const whole = micro / divisor;
  return whole.toLocaleString();
}

/** Objective J(f;w) = (1-w)·benign + w·crash, evaluated per f-grid point. */
function objective(sim: SimData, w: number) {
  return sim.f_grid.map((f, i) => ({
    f,
    fLabel: `${(f * 100).toFixed(0)}%`,
    J: (1 - w) * sim.sortino_benign_strata[i] + w * sim.sortino_crash_strata[i],
    benign: sim.sortino_benign_strata[i],
    crash: sim.sortino_crash_strata[i],
  }));
}

// ── sub-components ────────────────────────────────────────────────────────────

function Slider({
  label,
  sub,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-zinc-300">{label}</label>
        <span className="font-mono text-sm text-emerald-400">
          {format(value)}
        </span>
      </div>
      {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-emerald-500"
      />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function Calculator() {
  const client = useSuiClient();

  // Static sim data — fetched once, then all slider math is pure-client (<1ms).
  const { data: sim, isLoading: simLoading } = useQuery<SimData>({
    queryKey: ["simData", "s5_gate_b"],
    queryFn: async () => {
      const res = await fetch("/sim-data/s5_gate_b.json");
      if (!res.ok) throw new Error("could not load sim data");
      return res.json();
    },
    staleTime: Infinity,
  });

  // Live on-chain read: current f (f_bps) + gross pool value via devInspect.
  const { data: chain } = useQuery({
    queryKey: ["calcGetters", VAULT_ID],
    queryFn: async (): Promise<DecodedVaultGetters> => {
      const tx = buildVaultGettersTx();
      const result = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: VAULT_ID,
      });
      if (!result.results) throw new Error("devInspect returned no results");
      return decodeVaultGetters(
        result.results as Array<{ returnValues?: Array<[number[], string]> }>,
      );
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // Tail-aversion weight. Default 0.001 = crash at ~natural frequency.
  const [w, setW] = useState(0.001);

  const curve = useMemo(() => (sim ? objective(sim, w) : []), [sim, w]);

  // f*(w) = argmax J. Per the honest discovery this lands at 0.05 for all w.
  const fStarPoint = useMemo(() => {
    if (curve.length === 0) return null;
    return curve.reduce((best, p) => (p.J > best.J ? p : best), curve[0]);
  }, [curve]);

  // Gross pool value (micro-dUSDC) = plp + dUSDC held + dUSDC in manager.
  const grossPoolMicro = chain
    ? chain.plpValue + chain.dusdcHeldValue + chain.dusdcInManager
    : 0n;

  // On-chain f read (f_bps → fraction). Falls back to f* if not yet loaded.
  const currentF = chain ? Number(chain.fBps) / 10_000 : null;

  const fStar = fStarPoint?.f ?? sim?.verdict.f_star ?? 0.05;
  const fStarPct = useCountUp(fStar * 100, 700);

  // Deposit ceiling that keeps Strata a minority LP at f*:
  //   f = D / (D + pool) <= f*  =>  D <= f*/(1 - f*) · pool
  const safeDepositCeilingMicro =
    grossPoolMicro > 0n && fStar < 1
      ? (grossPoolMicro * BigInt(Math.round((fStar / (1 - fStar)) * 1e6))) /
        1_000_000n
      : 0n;

  if (simLoading || !sim) {
    return (
      <div className={`${glassStatic} p-8 text-sm text-white/50`}>
        Loading simulator data…
      </div>
    );
  }

  return (
    <div className={`${glassStatic} shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <h2
          className="text-base font-semibold tracking-tight text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          What&apos;s my safe deposit size?
        </h2>
        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
          DeepBook flags this as the question gating serious LP participation.
          Strata answers it from the §3 strike-local{" "}
          <span className="font-mono text-zinc-400">(u(k) - f)</span> framework —
          your LP-share fraction <span className="font-mono text-zinc-400">f</span>{" "}
          is the single most important free parameter.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {/* Controls */}
        <div className="px-6 py-5 space-y-6 border-b md:border-b-0 md:border-r border-white/10">
          <Slider
            label="Tail-aversion weight (w)"
            sub={
              w >= 0.24 && w <= 0.26
                ? "w = 0.25 ≈ weighting a crash 250× its natural frequency"
                : "0 = benign only · 1 = crash only · ~0.001 = natural frequency"
            }
            value={w}
            min={0}
            max={1}
            step={0.001}
            onChange={setW}
            format={(v) => v.toFixed(3)}
          />

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-400">
                f* at this tail-aversion
              </span>
              <span className="font-mono text-lg text-emerald-400 strata-glow">
                {fStarPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-400">
                Live vault f (f_bps on-chain)
              </span>
              <span className="font-mono text-sm text-zinc-200">
                {currentF === null ? "—" : `${(currentF * 100).toFixed(2)}%`}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-4 py-3">
            <p className="text-xs text-emerald-300/90 leading-relaxed">
              Recommended safe deposit ceiling at this f*:
            </p>
            <p className="font-mono text-xl text-emerald-300 mt-1">
              {grossPoolMicro > 0n
                ? `${fmtUsd(safeDepositCeilingMicro)} dUSDC`
                : "—"}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
              Keeps you a minority LP: f = D / (D + pool) stays at or below f*.
              Derived from the
              live gross pool value{" "}
              {grossPoolMicro > 0n ? `($${fmtUsd(grossPoolMicro)})` : ""} read
              on-chain.
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="px-4 py-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-2 px-2">
            J(f; w) = (1-w)·Sortino_benign + w·Sortino_crash
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={curve}
              margin={{ top: 8, right: 16, bottom: 8, left: -8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="fLabel"
                tick={{ fill: "#71717a", fontSize: 11 }}
                stroke="#3f3f46"
                label={{
                  value: "LP-share f",
                  position: "insideBottom",
                  offset: -4,
                  fill: "#52525b",
                  fontSize: 10,
                }}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                stroke="#3f3f46"
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(v) => [Number(v).toFixed(3), "J(f;w)"]}
              />
              <Line
                type="monotone"
                dataKey="J"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: "#10b981" }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={900}
              />
              {fStarPoint && (
                <ReferenceDot
                  x={fStarPoint.fLabel}
                  y={fStarPoint.J}
                  r={6}
                  fill="#fbbf24"
                  stroke="#18181b"
                  strokeWidth={2}
                  label={{
                    value: "f*",
                    position: "top",
                    fill: "#fbbf24",
                    fontSize: 12,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honest discovery footer */}
      <div className="px-6 py-4 border-t border-white/10 bg-black/20">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-amber-400 font-medium">Honest discovery:</span>{" "}
          f*(w) at the {sim.n_paths_benign.toLocaleString()}-benign +{" "}
          {sim.n_paths_crash.toLocaleString()}-crash sample sits at the low
          boundary <span className="font-mono">f = 5%</span> for{" "}
          <em>all</em> tail-aversion weights w. The conservative LP-share IS the
          optimal-f recommendation — not a tail-aversion choice. The crash tail
          is truncated (best left-tail p01 reduction ={" "}
          <span className="font-mono">
            +{(sim.verdict.best_p01_reduction * 100).toFixed(2)}pp
          </span>
          , a quantified residual — not a complete hedge), and the R3
          escape-hatch realized a{" "}
          <span className="font-mono">
            ${sim.verdict.r3_liquid_cash_delta_usd.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>{" "}
          liquid-cash delta at sim closure. Gate-B verdict:{" "}
          <span className="font-mono text-amber-400">{sim.verdict.gate_b}</span>.
        </p>
        <p className="text-[11px] text-zinc-600 mt-2">
          Anchored to static sim data frozen at{" "}
          <span className="font-mono">v0.1.0-simulator-closed</span> (no live
          recompute). Full §3 self-reference derivation in the{" "}
          <a
            href="https://github.com/strata-sui/sim/blob/v0.1.0-simulator-closed/SUBMISSION.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
          >
            submission writeup
          </a>
          .
        </p>
      </div>
    </div>
  );
}
