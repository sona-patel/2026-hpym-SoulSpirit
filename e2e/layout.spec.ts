import { test, expect } from "@playwright/test";
import { startRound, answerBoth } from "./helpers";

const viewports = [
  { label: "1366x768", width: 1366, height: 768 },
  { label: "1280x650-short", width: 1280, height: 650 },
];

for (const viewport of viewports) {
  test(`no overflow or overlap on the quiz screen — ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await startRound(page);

    const freshScreenSize = await page.evaluate(() => {
      const el = document.querySelector("#screen-quiz");
      if (!el) throw new Error("#screen-quiz not found");
      return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
    });
    expect(freshScreenSize.scrollHeight).toBeLessThanOrEqual(freshScreenSize.clientHeight);

    await answerBoth(page, 0, 1);
    // .reveal's max-height/opacity transition is 0.3s — wait for it to
    // settle before measuring, or boundingBox() can catch it mid-animation.
    await page.waitForTimeout(400);

    const boardBox = await page.locator(".board").boundingBox();
    const revealBox = await page.locator("#reveal").boundingBox();
    if (!boardBox || !revealBox) throw new Error("board or reveal box not found");
    expect(revealBox.y).toBeGreaterThanOrEqual(boardBox.y + boardBox.height - 1);

    for (const player of ["p1", "p2"] as const) {
      const lastOptionBox = await page
        .locator(`#${player}-options .opt-btn`)
        .last()
        .boundingBox();
      const statusBox = await page.locator(`#${player}-status`).boundingBox();
      if (!lastOptionBox || !statusBox) throw new Error(`${player} option/status box not found`);
      expect(statusBox.y).toBeGreaterThanOrEqual(lastOptionBox.y + lastOptionBox.height - 1);
    }
  });
}
