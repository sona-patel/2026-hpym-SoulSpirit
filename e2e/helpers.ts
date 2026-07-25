import type { Page } from "@playwright/test";

export async function startRound(page: Page): Promise<void> {
  await page.goto("/");
  await page.click("#ready-btn");
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

export async function findRoundWhereFirstOptionIsCorrect(
  page: Page,
  maxAttempts = 20,
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await startRound(page);
    await page.click("#p1-options .opt-btn:nth-child(1)");
    const isCorrect = await page
      .locator("#p1-options .opt-btn:nth-child(1)")
      .evaluate((el) => el.classList.contains("chosen-correct"));
    if (isCorrect) return;
  }
  throw new Error(
    `Could not find a round where the first option is correct after ${maxAttempts} attempts`,
  );
}

export async function findRoundWhereFirstOptionIsWrong(
  page: Page,
  maxAttempts = 20,
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await startRound(page);
    await page.click("#p1-options .opt-btn:nth-child(1)");
    const isWrong = await page
      .locator("#p1-options .opt-btn:nth-child(1)")
      .evaluate((el) => el.classList.contains("chosen-wrong"));
    if (isWrong) return;
  }
  throw new Error(
    `Could not find a round where the first option is wrong after ${maxAttempts} attempts`,
  );
}
