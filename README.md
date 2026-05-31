# Strata — frontend

> A liquidity vault on DeepBook Predict that earns yield AND hedges its own
> downside.
> Plus: a built-in calculator that quantifies your safe deposit size — the
> question DeepBook itself flags as gating serious LP participation.

The Next.js dApp for Strata: an optimal-f, tail-aware PLP allocator on DeepBook
Predict (Sui Overflow 2026, DeepBook track). Connect a Sui wallet, supply
dUSDC, read live vault state, and use the safe-size calculator to find the
LP-share fraction `f` at which the hedge is genuine protection rather than a
self-referential wash.

## What's here

- **Landing** (`/`) — the value proposition and three honestly-scored pillars.
- **Earn** (`/earn`) — live vault reads, supply/withdraw, the event-sourced DN
  hedge ladder, and the R3 liquidity escape-hatch.
- **Calculator** (`/calculator`) — the §3 self-reference visualizer: move the
  tail-aversion weight and watch `f*` track, anchored to the frozen simulator
  (no live recompute).

Every page carries an honest-disclosure card: the backtested Gate-B verdict is
**MARGINAL**. Two of three pillars hold under disjunctive synthesis (tail
truncation, R3 escape-hatch); the third (interior `f*`) collapses to the
conservative boundary. We report it as found.

## Testnet deployment

This frontend talks to the Strata Move package on **Sui testnet only**. Never
point it at mainnet.

| Handle | Object ID |
|---|---|
| Package | `0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999` |
| Vault (shared) | `0x44cc95d2a0a2ed3bff1ff36873a0a5ac859b1ef382eb55d53d77907aaf1053b9` |
| Share coin type | `<package>::vault::VAULT` (display `sSTRATA`, 6 decimals) |
| Quote asset | testnet dUSDC |

A public Vercel preview is the intended live URL; until then, run locally with
the three commands below — the app connects to testnet RPC on start.

## Run it (3 commands)

```bash
npm install
npm run dev          # http://localhost:3000 (testnet RPC)
npm run build        # production build + static prerender
```

End-to-end clickthrough + screenshots:

```bash
npx playwright install chromium
npm run test:e2e     # see tests/e2e/README.md for scope
```

Diction guard (CLAUDE.md rule B) runs on every commit via `githooks/pre-commit`;
run it manually with `npm run diction-audit`.

## Cross-links

- Simulator (frozen): **`sim @ v0.1.0-simulator-closed`** —
  https://github.com/strata-sui/sim/releases/tag/v0.1.0-simulator-closed
- Move contracts (testnet): **`contracts @ v0.1.0-contracts-testnet`** —
  https://github.com/strata-sui/contracts/releases/tag/v0.1.0-contracts-testnet
- Full methodology + limitations:
  https://github.com/strata-sui/sim/blob/v0.1.0-simulator-closed/SUBMISSION.md

## Stack

Next.js 16 (App Router, Turbopack) · Tailwind v4 · `@mysten/dapp-kit` ·
`@mysten/sui` · `@mysten/codegen` (committed bindings) · recharts · zustand ·
Vitest + Playwright.

## License

MIT — see [LICENSE](./LICENSE).
