// Canonical on-chain handles — from contracts/data/deploy_receipt.json,
// tag v0.1.0-contracts-testnet. AUTHORITATIVE per frontend_brief.md.
// Testnet ONLY. Never point any of these at mainnet.

export const NETWORK = "testnet" as const;

// --- Package ids (Sui upgrade splits the id) -------------------------------
// A Move TYPE is always identified by its ORIGINAL (defining) package id; that
// id never changes across upgrades. A moveCall TARGET should use the LATEST
// package id so calls run the newest code.
//
// ORIGINAL (v1) — use for type strings + event types.
export const PACKAGE_ID_ORIGINAL =
  "0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999";
// LATEST (v2) — the #41 DN-ladder grid-snap upgrade (upgrade tx EG38Enb8...).
// Use as the moveCall target. v1 and v2 are byte-identical for every function
// the frontend calls (supply / redeem / r3 / getters are unchanged in the
// compatible upgrade); the only v2 addition is the admin-only
// open_hedge_ladder_aligned, which the frontend does not call.
export const PACKAGE_ID_LATEST =
  "0x0256b69cbfa9071eb7eb4aa99263154157835b11ba2a71a7083ec6f22044a8c0";
// Back-compat alias — defaults to ORIGINAL (types/events resolve to original).
export const PACKAGE_ID = PACKAGE_ID_ORIGINAL;

export const VAULT_ID =
  "0x44cc95d2a0a2ed3bff1ff36873a0a5ac859b1ef382eb55d53d77907aaf1053b9";

// Shared DeepBook Predict object (dependency).
export const PREDICT_ID =
  "0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a";

export const CLOCK_ID = "0x6";

// DeepBook Predict dependency package — supplies market_key::down for the
// R3 escape-hatch PTB (MarketKey constructed in-PTB, not stored).
export const PREDICT_PKG_ID =
  "0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138";

// Strata vault share coin. Display symbol = "sSTRATA", 6 decimals.
// Type id → ORIGINAL package (types are invariant across upgrades).
export const VAULT_COIN_TYPE = `${PACKAGE_ID_ORIGINAL}::vault::VAULT`;

// Testnet dUSDC quote asset.
export const DUSDC_TYPE =
  "0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC";

// Event types (event-sourced ladder display — no state vector exists).
// Event struct type ids → ORIGINAL package (invariant across upgrades).
export const EVENT_LADDER_LEG_OPENED = `${PACKAGE_ID_ORIGINAL}::ladder::LadderLegOpened`;
export const EVENT_R3_REALIZED = `${PACKAGE_ID_ORIGINAL}::r3::R3LiquidityRealized`;

// Micro fixed-point divisor for share_price_micro / dUSDC (6 decimals).
export const MICRO = 1_000_000;

// Cross-links surfaced in the UI / README.
export const SIM_TAG_URL =
  "https://github.com/strata-sui/sim/releases/tag/v0.1.0-simulator-closed";
export const CONTRACTS_TAG_URL =
  "https://github.com/strata-sui/contracts/releases/tag/v0.1.0-contracts-testnet";
export const SUISCAN_PACKAGE_URL = `https://suiscan.xyz/testnet/object/${PACKAGE_ID}`;
