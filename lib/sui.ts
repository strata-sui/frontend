// lib/sui.ts
// Read helpers (vault getter batching + decode) and PTB builders for the
// three Strata vault write paths.
// Testnet only. Never reference mainnet.

import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import {
  sharePriceMicro,
  availableForWithdraw,
  withinMaxExposure,
  fBps,
  maxExposureBps,
  plpValue,
  dusdcHeldValue,
  dusdcInManager,
  recommendedLadderSize,
  ladderBandLoBps,
  ladderBandHiBps,
  supply,
  redeem,
} from "@/lib/codegen/strata_vault/vault";
import { redeemPermissionless } from "@/lib/codegen/strata_vault/r3";
import {
  VAULT_ID,
  PREDICT_ID,
  PREDICT_PKG_ID,
  DUSDC_TYPE,
} from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// Read helpers — vault getter batching + decode (framework-agnostic).
// ─────────────────────────────────────────────────────────────────────────────

/** Stable ordered list of getter keys — index must match moveCall order below. */
export const VAULT_GETTER_KEYS = [
  "sharePriceMicro",
  "availableForWithdraw",
  "withinMaxExposure",
  "fBps",
  "maxExposureBps",
  "plpValue",
  "dusdcHeldValue",
  "dusdcInManager",
  "recommendedLadderSize",
  "ladderBandLoBps",
  "ladderBandHiBps",
] as const;

export type VaultGetterKey = (typeof VAULT_GETTER_KEYS)[number];

export interface DecodedVaultGetters {
  sharePriceMicro: bigint;
  availableForWithdraw: bigint;
  withinMaxExposure: boolean;
  fBps: bigint;
  maxExposureBps: bigint;
  plpValue: bigint;
  dusdcHeldValue: bigint;
  dusdcInManager: bigint;
  recommendedLadderSize: bigint;
  ladderBandLoBps: bigint;
  ladderBandHiBps: bigint;
}

/**
 * Build a single PTB that batches all vault getter moveCalls.
 * Pass the returned tx to `client.devInspectTransactionBlock`.
 * Uses VAULT_ID as the sender (a valid address, no signing needed for inspect).
 */
export function buildVaultGettersTx(): Transaction {
  const tx = new Transaction();
  tx.add(sharePriceMicro({ arguments: [VAULT_ID] }));       // index 0
  tx.add(availableForWithdraw({ arguments: [VAULT_ID] }));  // index 1
  tx.add(withinMaxExposure({ arguments: [VAULT_ID] }));     // index 2
  tx.add(fBps({ arguments: [VAULT_ID] }));                  // index 3
  tx.add(maxExposureBps({ arguments: [VAULT_ID] }));        // index 4
  tx.add(plpValue({ arguments: [VAULT_ID] }));              // index 5
  tx.add(dusdcHeldValue({ arguments: [VAULT_ID] }));        // index 6
  tx.add(dusdcInManager({ arguments: [VAULT_ID] }));        // index 7
  tx.add(recommendedLadderSize({ arguments: [VAULT_ID] })); // index 8
  tx.add(ladderBandLoBps({ arguments: [VAULT_ID] }));       // index 9
  tx.add(ladderBandHiBps({ arguments: [VAULT_ID] }));       // index 10
  return tx;
}

/**
 * Decode the `results` array returned by `devInspectTransactionBlock`.
 * Each result's returnValues[0] is [bytes: number[], type: string].
 */
export function decodeVaultGetters(
  results: Array<{ returnValues?: Array<[number[], string]> }>,
): DecodedVaultGetters {
  function u64At(idx: number): bigint {
    const rv = results[idx]?.returnValues?.[0];
    if (!rv) return 0n;
    return BigInt(bcs.u64().parse(Uint8Array.from(rv[0])));
  }
  function boolAt(idx: number): boolean {
    const rv = results[idx]?.returnValues?.[0];
    if (!rv) return true;
    return bcs.bool().parse(Uint8Array.from(rv[0]));
  }
  return {
    sharePriceMicro: u64At(0),
    availableForWithdraw: u64At(1),
    withinMaxExposure: boolAt(2),
    fBps: u64At(3),
    maxExposureBps: u64At(4),
    plpValue: u64At(5),
    dusdcHeldValue: u64At(6),
    dusdcInManager: u64At(7),
    recommendedLadderSize: u64At(8),
    ladderBandLoBps: u64At(9),
    ladderBandHiBps: u64At(10),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PTB builders for the three Strata vault write paths.
// Signatures verified against lib/codegen/strata_vault/* (codegen @ package
// 0xb2986cb6…5999) and the AUTHORITATIVE Integration section of
// frontend_brief.md. Testnet only.
//
// Key facts the builders encode (see brief "PTB construction notes"):
//   1. supply + redeem BOTH take `predict: &mut Predict` (shared object).
//   2. supply RETURNS Coin<VAULT>; redeem RETURNS Coin<DUSDC> — the returned
//      coin MUST be transferred to the sender or the tx aborts (unused value).
//   3. supply consumes a Coin<DUSDC> of the EXACT deposit — splitCoins first.
//   4. R3's MarketKey is built in-PTB via market_key::down(oracle_id, expiry,
//      strike) on the deepbook_predict package — our ladder legs are all DOWN.
//   5. Clock (0x6) is auto-appended by the codegen normalizeMoveArguments.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supply dUSDC → mint Coin<VAULT> ("sSTRATA") to the sender.
 *
 * @param amountMicro deposit size in micro-dUSDC (6 decimals; 1 dUSDC = 1e6).
 * @param dusdcCoinId a Coin<DUSDC> object owned by the sender, large enough to
 *                    cover amountMicro. Split to the exact amount in-PTB.
 */
export function buildSupplyTx(params: {
  sender: string;
  amountMicro: bigint;
  dusdcCoinId: string;
}): Transaction {
  const tx = new Transaction();
  const [deposit] = tx.splitCoins(tx.object(params.dusdcCoinId), [
    tx.pure.u64(params.amountMicro),
  ]);
  const shares = tx.add(
    supply({
      arguments: [VAULT_ID, PREDICT_ID, deposit],
      typeArguments: [DUSDC_TYPE],
    }),
  );
  tx.transferObjects([shares], params.sender);
  return tx;
}

/**
 * Redeem Coin<VAULT> shares → receive Coin<DUSDC> back to the sender.
 *
 * The entry consumes the WHOLE share coin passed in. To redeem only part of a
 * holding, pass `sharesMicro` and the builder splits the share coin first.
 *
 * NOTE: redeem flows through Predict's withdraw limiter. When
 * `available_for_withdraw` is below the requested amount the call aborts with
 * Predict's EWithdrawExceedsAvailable — surface that and link the R3 path.
 */
export function buildRedeemTx(params: {
  sender: string;
  shareCoinId: string;
  sharesMicro?: bigint;
}): Transaction {
  const tx = new Transaction();
  const shareInput =
    params.sharesMicro === undefined
      ? tx.object(params.shareCoinId)
      : tx.splitCoins(tx.object(params.shareCoinId), [
          tx.pure.u64(params.sharesMicro),
        ])[0];
  const dusdc = tx.add(
    redeem({
      arguments: [VAULT_ID, PREDICT_ID, shareInput],
      typeArguments: [DUSDC_TYPE],
    }),
  );
  tx.transferObjects([dusdc], params.sender);
  return tx;
}

/**
 * R3 escape-hatch: permissionlessly realize liquidity from a settled DOWN
 * ladder leg. Bypasses the withdraw limiter — the liquid exit in a crash.
 *
 * The MarketKey is reconstructed in-PTB from the leg's (oracle_id, expiry,
 * strike) — feed the SAME strike the open ladder used (event-sourced from
 * ladder::LadderLegOpened.strike).
 *
 * @param managerId  PredictManager id (read from vault::predict_manager_id).
 * @param oracleSviId the OracleSVI shared object for this market.
 * @param oracleId    the oracle ID embedded in the MarketKey.
 */
export function buildR3Tx(params: {
  managerId: string;
  oracleSviId: string;
  oracleId: string;
  expiry: bigint;
  strike: bigint;
  quantity: bigint;
}): Transaction {
  const tx = new Transaction();
  const key = tx.moveCall({
    target: `${PREDICT_PKG_ID}::market_key::down`,
    arguments: [
      tx.pure.id(params.oracleId),
      tx.pure.u64(params.expiry),
      tx.pure.u64(params.strike),
    ],
  });
  tx.add(
    redeemPermissionless({
      arguments: [
        VAULT_ID,
        PREDICT_ID,
        params.managerId,
        params.oracleSviId,
        key,
        params.quantity,
      ],
      typeArguments: [DUSDC_TYPE],
    }),
  );
  return tx;
}
