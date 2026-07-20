import { test, expect } from "@playwright/test";

test("app loads and shows the welcome screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#ready-btn")).toBeVisible();
});
