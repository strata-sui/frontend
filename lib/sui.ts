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

import { Transaction } from "@mysten/sui/transactions";
import { supply, redeem } from "@/lib/codegen/strata_vault/vault";
import { redeemPermissionless } from "@/lib/codegen/strata_vault/r3";
import {
  VAULT_ID,
  PREDICT_ID,
  PREDICT_PKG_ID,
  DUSDC_TYPE,
} from "@/lib/config";

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
