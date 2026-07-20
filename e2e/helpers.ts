import type { Page } from "@playwright/test";

export type Lang = "en" | "gu";

export async function startRound(page: Page, lang: Lang): Promise<void> {
  await page.goto("/");
  await page.click("#ready-btn");
  await page.click(`.lang-btn[data-lang="${lang}"]`);
  await page.fill("#p1-name", "Player One");
  await page.fill("#p2-name", "Player Two");
  await page.click('#names-form button[type="submit"]');
  await page.waitForSelector("#screen-quiz.active");
}

export async function answerBoth(
  page: Page,
  p1OptionIndex: number,
  p2OptionIndex: number,
): Promise<void> {
  await page.click(`#p1-options .opt-btn:nth-child(${p1OptionIndex + 1})`);
  await page.click(`#p2-options .opt-btn:nth-child(${p2OptionIndex + 1})`);
  await page.waitForSelector("#reveal.show");
}
