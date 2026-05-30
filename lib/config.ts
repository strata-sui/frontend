// Canonical on-chain handles — from contracts/data/deploy_receipt.json,
// tag v0.1.0-contracts-testnet. AUTHORITATIVE per frontend_brief.md.
// Testnet ONLY. Never point any of these at mainnet.

export const NETWORK = "testnet" as const;

export const PACKAGE_ID =
  "0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999";

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
export const VAULT_COIN_TYPE = `${PACKAGE_ID}::vault::VAULT`;

// Testnet dUSDC quote asset.
export const DUSDC_TYPE =
  "0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC";

// Event types (event-sourced ladder display — no state vector exists).
export const EVENT_LADDER_LEG_OPENED = `${PACKAGE_ID}::ladder::LadderLegOpened`;
export const EVENT_R3_REALIZED = `${PACKAGE_ID}::r3::R3LiquidityRealized`;

// Micro fixed-point divisor for share_price_micro / dUSDC (6 decimals).
export const MICRO = 1_000_000;

// Cross-links surfaced in the UI / README.
export const SIM_TAG_URL =
  "https://github.com/strata-sui/sim/releases/tag/v0.1.0-simulator-closed";
export const CONTRACTS_TAG_URL =
  "https://github.com/strata-sui/contracts/releases/tag/v0.1.0-contracts-testnet";
export const SUISCAN_PACKAGE_URL = `https://suiscan.xyz/testnet/object/${PACKAGE_ID}`;
