#!/usr/bin/env node
// Diction rule B (CLAUDE.md §8): the hedge TRUNCATES the tail and leaves a
// QUANTIFIED RESIDUAL. Absolute loss claims contradict the f-Curve and kill
// the honest-disclosure signature. Banned everywhere user-facing.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib", "public", "README.md"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".css", ".json"]);
const BANNED = /capped downside|capped|loss[- ]proof|can'?t lose|risk[- ]free|guaranteed (?:returns?|profit|yield)/i;

const hits = [];

function walk(p) {
  let st;
  try {
    st = statSync(p);
  } catch {
    return;
  }
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) {
      if (e === "node_modules" || e === ".next" || e === "codegen") continue;
      walk(join(p, e));
    }
    return;
  }
  if (!EXT.has(extname(p))) return;
  const lines = readFileSync(p, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(BANNED);
    if (m) hits.push(`${p}:${i + 1}: "${m[0]}"  ->  ${line.trim()}`);
  });
}

for (const r of ROOTS) walk(r);

if (hits.length) {
  console.error("DICTION RULE B VIOLATION(S):\n" + hits.join("\n"));
  process.exit(1);
}
console.log("diction-audit: clean (rule B)");
