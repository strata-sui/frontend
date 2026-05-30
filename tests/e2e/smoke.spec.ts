import { test, expect } from "@playwright/test";

// F1 base smoke: the landing page renders the Opsi-4 hero + nav.
test("landing renders the Opsi-4 hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "earns yield AND hedges its own downside",
  );
  await expect(
    page.getByText(/gating serious LP\s+participation/i),
  ).toBeVisible();
});

test("nav links to earn + calculator resolve", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Earn", exact: true }).click();
  await expect(page).toHaveURL(/\/earn$/);
  await page.goto("/calculator");
  await expect(
    page.getByRole("heading", { name: /Safe-size calculator/i }),
  ).toBeVisible();
});
