"use client";

/**
 * VaultStateCard — live on-chain read view for the Strata vault.
 *
 * Data sources:
 *  1. getObject (stored fields): f_bps, max_exposure_bps, total_max_payout,
 *     total_mtm, dusdc_held_value, dusdc_in_manager, predict_manager_id,
 *     plp_held.
 *  2. devInspectTransactionBlock (computed getters): share_price_micro,
 *     available_for_withdraw, within_max_exposure, plp_value, and others.
 *  3. getTotalSupply (sSTRATA total supply).
 *
 * F4 (supply/withdraw) and F6 (R3 escape-hatch) wire into this card later.
 */

import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { VAULT_ID, VAULT_COIN_TYPE, MICRO, SUISCAN_PACKAGE_URL } from "@/lib/config";
import { buildVaultGettersTx, decodeVaultGetters, type DecodedVaultGetters } from "@/lib/sui";
import { glassStatic } from "@/lib/ui";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt6(micro: bigint, decimals = 6): string {
  const divisor = BigInt(MICRO);
  const whole = micro / divisor;
  const frac = micro % divisor;
  const fracStr = frac.toString().padStart(6, "0").slice(0, decimals);
  return `${whole.toLocaleString()}.${fracStr}`;
}

function bpsToPercent(bps: bigint): string {
  return (Number(bps) / 100).toFixed(2) + "%";
}

// ── sub-components ────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded bg-white/10 animate-pulse ${className}`}
    />
  );
}

function StatRow({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value?: React.ReactNode;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-[12px] text-white/50 leading-snug">{label}</p>
        {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
      </div>
      <div className="text-right font-mono text-[18px] text-white tabular-nums shrink-0">
        {loading ? <Skeleton className="w-24 h-5" /> : value}
      </div>
    </div>
  );
}

function HealthPill({ healthy }: { healthy: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        healthy
          ? "bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800"
          : "bg-amber-950 text-amber-400 ring-1 ring-amber-800"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          healthy ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />
      {healthy ? "Within exposure" : "Exposure elevated"}
    </span>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400/70 mb-1 mt-5 first:mt-0">
      {children}
    </p>
  );
}

// ── stored-fields shape (from getObject content.fields) ───────────────────────

interface VaultFields {
  f_bps: string;
  max_exposure_bps: string;
  total_max_payout: string;
  total_mtm: string;
  dusdc_held_value: string;
  dusdc_in_manager: string;
  predict_manager_id: null | { fields: Record<string, string> } | string;
  plp_held: string | { fields: { value: string } };
  recommended_ladder_size: string;
  ladder_band_lo_bps: string;
  ladder_band_hi_bps: string;
}

function extractFields(content: unknown): VaultFields | null {
  if (
    content &&
    typeof content === "object" &&
    "dataType" in content &&
    (content as { dataType: string }).dataType === "moveObject"
  ) {
    return (content as unknown as { fields: VaultFields }).fields ?? null;
  }
  return null;
}

function extractManagerId(
  raw: VaultFields["predict_manager_id"],
): string | null {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null) {
    const f = (raw as { fields: Record<string, string> }).fields;
    const keys = Object.keys(f);
    if (keys.length > 0) return f[keys[0]];
  }
  return null;
}

// ── main component ────────────────────────────────────────────────────────────

export function VaultStateCard() {
  const client = useSuiClient();

  // 1. Stored fields via getObject
  const {
    data: objData,
    isLoading: objLoading,
    error: objError,
    dataUpdatedAt: objUpdated,
  } = useSuiClientQuery("getObject", {
    id: VAULT_ID,
    options: { showContent: true },
  });

  // 2. Computed getters via devInspect
  const {
    data: gettersData,
    isLoading: gettersLoading,
    error: gettersError,
  } = useQuery({
    queryKey: ["vaultGetters", VAULT_ID],
    queryFn: async (): Promise<DecodedVaultGetters> => {
      const tx = buildVaultGettersTx();
      const result = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: VAULT_ID,
      });
      if (!result.results) throw new Error("devInspect returned no results");
      return decodeVaultGetters(result.results as Array<{ returnValues?: Array<[number[], string]> }>);
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // 3. Total supply of sSTRATA
  const {
    data: supplyData,
    isLoading: supplyLoading,
  } = useSuiClientQuery("getTotalSupply", { coinType: VAULT_COIN_TYPE });

  const loading = objLoading || gettersLoading || supplyLoading;
  const hasError = objError || gettersError;

  const fields = extractFields(objData?.data?.content);
  const g = gettersData;

  // Gross value = plp_value + dusdc_held_value + dusdc_in_manager (all getters)
  const grossValue =
    g ? g.plpValue + g.dusdcHeldValue + g.dusdcInManager : 0n;

  const totalSupplyMicro = supplyData?.value
    ? BigInt(supplyData.value)
    : 0n;

  const managerId = fields ? extractManagerId(fields.predict_manager_id) : null;

  const lastRefreshed = objUpdated
    ? new Date(objUpdated).toLocaleTimeString()
    : "—";

  return (
    <div className={`${glassStatic} shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-base font-semibold tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Vault State
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Live on-chain · testnet ·{" "}
            <a
              href={SUISCAN_PACKAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
            >
              explorer
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {g && !loading && (
            <HealthPill healthy={g.withinMaxExposure} />
          )}
          {loading && <Skeleton className="w-28 h-5 rounded-full" />}
        </div>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="mx-5 mt-4 rounded-lg bg-red-950/50 border border-red-900 px-4 py-3 text-xs text-red-400">
          Could not load vault state. RPC may be unavailable — data shown may be
          stale or missing.
        </div>
      )}

      {/* Body */}
      <div className="px-5 pb-5">
        {/* Valuation */}
        <SectionHeader>Valuation</SectionHeader>
        <StatRow
          label="Gross vault value"
          sub="PLP value + dUSDC held + dUSDC in manager"
          value={g ? `$${fmt6(grossValue)}` : undefined}
          loading={!g && loading}
        />
        <StatRow
          label="Share price (sSTRATA)"
          sub="share_price_micro ÷ 1e6"
          value={g ? fmt6(g.sharePriceMicro) : undefined}
          loading={!g && loading}
        />
        <StatRow
          label="Total sSTRATA supply"
          value={!supplyLoading ? fmt6(totalSupplyMicro) : undefined}
          loading={supplyLoading}
        />

        {/* Liquidity */}
        <SectionHeader>Liquidity</SectionHeader>
        <StatRow
          label="Withdrawable now (limiter-bound)"
          sub="available_for_withdraw — limiter-bound exit; R3 escape-hatch bypasses this"
          value={g ? `$${fmt6(g.availableForWithdraw)}` : undefined}
          loading={!g && loading}
        />
        <StatRow
          label="Total mark-to-market (hedge)"
          sub="total_mtm — unrealised hedge MTM"
          value={
            fields
              ? `$${fmt6(BigInt(fields.total_mtm ?? "0"))}`
              : undefined
          }
          loading={!fields && loading}
        />
        <StatRow
          label="Total max payout (hedge)"
          sub="total_max_payout — worst-case hedge obligation"
          value={
            fields
              ? `$${fmt6(BigInt(fields.total_max_payout ?? "0"))}`
              : undefined
          }
          loading={!fields && loading}
        />

        {/* Policy */}
        <SectionHeader>Policy</SectionHeader>
        <StatRow
          label="LP-share fraction (f)"
          sub="f_bps ÷ 100 — Strata's share of the PLP pool"
          value={g ? bpsToPercent(g.fBps) : undefined}
          loading={!g && loading}
        />
        <StatRow
          label="Max-exposure cap"
          sub="max_exposure_bps ÷ 100 — hedge sleeve ceiling"
          value={g ? bpsToPercent(g.maxExposureBps) : undefined}
          loading={!g && loading}
        />

        {/* DN Ladder */}
        <SectionHeader>DN Ladder (tail truncation)</SectionHeader>
        <StatRow
          label="Ladder band"
          sub="loss-onset moneyness band [lo, hi] for hedge strikes"
          value={
            g
              ? `${bpsToPercent(g.ladderBandLoBps)} – ${bpsToPercent(g.ladderBandHiBps)}`
              : undefined
          }
          loading={!g && loading}
        />
        <StatRow
          label="Recommended ladder size"
          sub="number of DN legs across the band"
          value={g ? g.recommendedLadderSize.toString() : undefined}
          loading={!g && loading}
        />

        {/* Predict integration */}
        <SectionHeader>DeepBook Predict</SectionHeader>
        <StatRow
          label="PredictManager linked"
          value={
            loading ? undefined : (
              managerId ? (
                <span className="text-emerald-400">Yes</span>
              ) : (
                <span className="text-zinc-500">No</span>
              )
            )
          }
          loading={loading}
        />
        {managerId && (
          <StatRow
            label="Manager ID"
            value={
              <span className="text-zinc-300 break-all text-[11px]">
                {managerId.slice(0, 10)}…{managerId.slice(-6)}
              </span>
            }
          />
        )}
        <StatRow
          label="dUSDC in manager"
          sub="hedge sleeve balance deployed to Predict"
          value={g ? `$${fmt6(g.dusdcInManager)}` : undefined}
          loading={!g && loading}
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
        <p className="text-[10px] text-white/35">
          Data refreshes every 30 s. Tail truncation leaves a quantified
          residual — not a complete hedge.
        </p>
        <p className="text-[10px] text-white/35 shrink-0 ml-4">
          Updated {lastRefreshed}
        </p>
      </div>
    </div>
  );
}
