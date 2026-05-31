import type { SuiCodegenConfig } from "@mysten/codegen/config";

// Generates typed TS bindings from the DEPLOYED Strata package on testnet.
// Output committed (not gitignored) per frontend_brief.md for PR reviewability.
//
// ⚠️ WINDOWS REGEN NOTE: sui-ts-codegen emits import paths with backslashes
// and a wrong base on Windows (e.g. `'./lib\codegen\utils\index.js'` and
// `'~root\deps\…'`). After any regen, re-fix the imports in
// lib/codegen/strata_vault/* to POSIX relative paths:
//   strata_vault/*.ts      -> '../utils/index'
//   strata_vault/vault.ts  -> './deps/0x…02/{balance,coin}'
//   deps/0x…02/*.ts        -> '../../../utils/index'
// ALSO strip the trailing `.js` extensions from every generated relative
// import — Turbopack's browser bundler can't resolve `.js` onto the `.ts`
// source (Next moduleResolution=bundler maps extensionless imports fine).
const config: SuiCodegenConfig = {
  output: "./lib/codegen",
  packages: [
    {
      package:
        "0xb2986cb60834b8333f1d52edef5627042eff42588cafb2540292157f936b5999",
      packageName: "strata_vault",
      network: "testnet",
    },
  ],
};

export default config;
