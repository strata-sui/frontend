# End-to-end clickthrough (F8)

Playwright drives the Strata frontend against testnet RPC and captures one
screenshot per demo beat.

```bash
npm run build         # produce the .next output the e2e server serves
npx playwright install chromium
npm run test:e2e      # runs smoke.spec.ts + clickthrough.spec.ts
```

Screenshots land in `tests/e2e/screenshots/`:

| File | Demo beat |
|---|---|
| `01-landing.png` | Opsi-4 hero, three pillars, honest-disclosure card |
| `02-earn-dashboard.png` | Live vault reads + supply/withdraw surface |
| `03-calculator-default.png` | f* at frequency-weighting |
| `04-calculator-tailweighted.png` | f* tracks the tail-aversion slider (w = 1) |
| `05-ladder-display.png` | Event-sourced ladder (honest empty state) |
| `06-r3-escape-hatch.png` | R3 liquidity escape-hatch panel |

## Scope (honest degrade)

The wallet-signing legs — supply, withdraw, and R3 execution — are **not**
automated here. They require a funded browser wallet extension to sign, and
injecting a private key into CI is forbidden (no Strata admin key, no mainnet
wallet in any automated path). The suite therefore covers the full
no-signature surface: every route renders, the calculator f* re-derives as the
tail-aversion slider moves, and the earn page shows live vault reads plus the
honest empty/disabled states for the ladder + R3 (both gated on the #41 Move
package upgrade).

The signed walkthrough and the voice-over MP4 are the human demo deliverable —
the shot list and verbatim narration are in
`docs/full_submission_demo_script.md` (local prep notes). Record at
1920x1080 / 30fps; the voice-over opens with the Opsi-4 lead, then walks the
six beats above.
