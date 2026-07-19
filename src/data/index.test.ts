import { describe, it, expect } from "vitest";
import { QUESTION_BANKS } from "./index";

describe("QUESTION_BANKS", () => {
  it("has non-empty en and gu banks", () => {
    expect(QUESTION_BANKS.en.length).toBeGreaterThan(0);
    expect(QUESTION_BANKS.gu.length).toBeGreaterThan(0);
  });

  it("every question has 4 options and a valid correct index", () => {
    for (const bank of [QUESTION_BANKS.en, QUESTION_BANKS.gu]) {
      for (const q of bank) {
        expect(q.options).toHaveLength(4);
        expect([0, 1, 2, 3]).toContain(q.correct);
      }
    }
  });

  it("en and gu banks have matching id sets", () => {
    const enIds = new Set(QUESTION_BANKS.en.map((q) => q.id));
    const guIds = new Set(QUESTION_BANKS.gu.map((q) => q.id));
    expect(enIds).toEqual(guIds);
  });
});
