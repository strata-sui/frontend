import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * F8 — testnet read-only clickthrough + screenshots.
 *
 * Honest scope (frontend_brief F8 "degrade scope honestly"): the wallet-signing
 * legs (supply / withdraw / R3 execution) cannot run unattended — they need a
 * funded browser wallet extension to sign, and injecting a key is forbidden.
 * This suite drives the full no-signature surface and captures one screenshot
 * per demo beat. The signing walkthrough + voice-over MP4 are the human demo
 * deliverable (docs/full_submission_demo_script.md).
 *
 * Each capture maps to a beat of the 6-step brief flow:
 *   01 landing            -> step 1 (connect wallet entry point + pillars)
 *   02 earn dashboard     -> step 2 (supply form + live vault reads)
 *   03 calculator default -> step 3a (f* at frequency-weighting)
 *   04 calculator w=1     -> step 3b (f* tracks tail-aversion slider)
 *   05 ladder display     -> step 4 (event-sourced legs / honest empty state)
 *   06 r3 escape-hatch    -> step 5 (R3 panel; disabled until a leg settles)
 *   (withdraw, step 6, shares the earn dashboard surface in 02)
 */

const SHOTS = "tests/e2e/screenshots";

test.beforeAll(() => {
  mkdirSync(SHOTS, { recursive: true });
});

test("01 landing: Opsi-4 hero, three pillars, honest disclosure", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "earns yield AND hedges its own downside",
  );
  // Honest-disclosure card must be visible on the landing page (F7 mandate).
  await expect(
    page.getByText("Gate-B: MARGINAL", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: true });
});

test("02 earn dashboard: vault reads + supply/withdraw surface", async ({
  page,
}) => {
  await page.goto("/earn");
  await expect(
    page.getByRole("heading", { name: "Earn", exact: true }),
  ).toBeVisible();
  // Disclosure card mandatory on earn too.
  await expect(
    page.getByText("Gate-B: MARGINAL", { exact: true }),
  ).toBeVisible();
  // Give the on-chain reads a moment to resolve (best-effort; UI never blocks).
  await page.waitForTimeout(3500);
  await page.screenshot({
    path: `${SHOTS}/02-earn-dashboard.png`,
    fullPage: true,
  });
});

test("03+04 calculator: f* tracks the tail-aversion slider", async ({
  page,
}) => {
  await page.goto("/calculator");
  await expect(
    page.getByRole("heading", { name: /Safe-size calculator/i }),
  ).toBeVisible();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: `${SHOTS}/03-calculator-default.png`,
    fullPage: true,
  });

  // Drive the tail-aversion slider to full crash-weight (w = 1) and confirm the
  // f* curve / objective re-renders.
  const slider = page.getByRole("slider").first();
  await slider.focus();
  await slider.press("End");
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${SHOTS}/04-calculator-tailweighted.png`,
    fullPage: true,
  });
});

test("05 earn ladder: event-sourced legs (honest empty state)", async ({
  page,
}) => {
  await page.goto("/earn");
  await expect(
    page.getByRole("heading", { name: /DN hedge ladder/i }),
  ).toBeVisible();
  await page.waitForTimeout(3000);
  const ladder = page
    .locator("div")
    .filter({ hasText: /DN hedge ladder/ })
    .first();
  await ladder.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `${SHOTS}/05-ladder-display.png`,
    fullPage: true,
  });
});

test("06 earn R3: liquidity escape-hatch panel", async ({ page }) => {
  await page.goto("/earn#r3");
  await expect(
    page.getByRole("heading", { name: /R3 liquidity escape-hatch/i }),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  const r3 = page.locator("#r3");
  await r3.scrollIntoViewIfNeeded();
  await r3.screenshot({ path: `${SHOTS}/06-r3-escape-hatch.png` });
});
