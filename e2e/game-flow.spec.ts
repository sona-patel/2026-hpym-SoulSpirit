import { test, expect } from "@playwright/test";
import {
  startRound,
  answerBoth,
  findRoundWhereFirstOptionIsCorrect,
  findRoundWhereFirstOptionIsWrong,
} from "./helpers";

test("first correct answer scores more than second correct answer", async ({ page }) => {
  await findRoundWhereFirstOptionIsCorrect(page);
  await page.click("#p2-options .opt-btn:nth-child(1)");
  await page.waitForSelector("#reveal.show");

  const p1Score = Number(await page.locator("#p1-score").textContent());
  const p2Score = Number(await page.locator("#p2-score").textContent());
  expect(p1Score).toBeGreaterThan(p2Score);
});

test("wrong answer locks out further clicks and does not add score", async ({ page }) => {
  await findRoundWhereFirstOptionIsWrong(page);

  const p1Options = page.locator("#p1-options .opt-btn");
  await expect(p1Options.first()).toBeDisabled();
  const allDisabled = await p1Options.evaluateAll((els) =>
    els.every((el) => (el as HTMLButtonElement).disabled),
  );
  expect(allDisabled).toBe(true);

  const p1Score = await page.locator("#p1-score").textContent();
  expect(p1Score).toBe("0");
});

test("timeout hides wrong options and reveals only the correct one", async ({ page }) => {
  // Real 36s wait for SECONDS_PER_QUESTION to elapse — one-time, not run
  // per viewport like layout.spec.ts's matrix. Don't "optimize" this away;
  // there's no test hook to fast-forward the app's own timer.
  test.setTimeout(50000);
  await startRound(page);
  await page.waitForSelector("#reveal.show", { timeout: 45000 });

  for (const player of ["p1", "p2"] as const) {
    const visibleOptions = page.locator(`#${player}-options .opt-btn:not(.opt-hidden)`);
    await expect(visibleOptions).toHaveCount(1);
    await expect(visibleOptions.first()).toHaveClass(/reveal-correct/);
    await expect(page.locator(`#${player}-status`)).toHaveText("Time's up");
  }
});

test("completes a full round and shows the results screen", async ({ page }) => {
  await startRound(page);
  for (let q = 0; q < 3; q++) {
    await answerBoth(page, 0, 1);
    await page.click("#next-btn");
  }
  await page.waitForSelector("#screen-results.active");
  await expect(page.locator("#result-p1-score")).toBeVisible();
  await expect(page.locator("#result-p2-score")).toBeVisible();
  await expect(page.locator("#winner-text")).not.toBeEmpty();
});
