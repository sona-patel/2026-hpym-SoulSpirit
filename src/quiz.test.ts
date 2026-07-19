import { describe, it, expect } from "vitest";
import { calculateScore, namesAreDuplicate, resolveFinalName, pickRoundQuestions } from "./quiz";
import type { Question } from "./types";

describe("calculateScore", () => {
  it("awards base score plus remaining seconds", () => {
    expect(calculateScore(10, false)).toBe(35); // 25 + 10
  });

  it("adds the first-correct bonus", () => {
    expect(calculateScore(10, true)).toBe(55); // 25 + 10 + 20
  });

  it("clamps negative time to zero", () => {
    expect(calculateScore(-5, false)).toBe(25);
  });
});

describe("namesAreDuplicate", () => {
  it("is case-insensitive", () => {
    expect(namesAreDuplicate("Amit", "amit")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(namesAreDuplicate(" Amit ", "Amit")).toBe(true);
  });

  it("returns false for different names", () => {
    expect(namesAreDuplicate("Amit", "Priya")).toBe(false);
  });
});

describe("resolveFinalName", () => {
  it("returns the trimmed raw name when non-empty", () => {
    expect(resolveFinalName("  Priya  ", "Bhoolku 1")).toBe("Priya");
  });

  it("falls back to the placeholder when raw is empty or whitespace", () => {
    expect(resolveFinalName("   ", "Bhoolku 1")).toBe("Bhoolku 1");
    expect(resolveFinalName("", "Bhoolku 1")).toBe("Bhoolku 1");
  });
});

function makeQuestions(ids: number[]): Question[] {
  return ids.map((id) => ({
    id,
    question: `Q${id}`,
    options: ["a", "b", "c", "d"],
    correct: 0,
  }));
}

describe("pickRoundQuestions", () => {
  it("picks the requested count with unique ids", () => {
    const bank = makeQuestions([1, 2, 3, 4, 5]);
    const { picked } = pickRoundQuestions(bank, new Set(), 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((q) => q.id)).size).toBe(3);
  });

  it("does not repeat ids already in usedIds while enough unused remain", () => {
    const bank = makeQuestions([1, 2, 3, 4, 5]);
    const usedIds = new Set([1, 2]);
    const { picked } = pickRoundQuestions(bank, usedIds, 3);
    expect(picked.every((q) => !usedIds.has(q.id))).toBe(true);
  });

  it("accumulates picked ids into the returned usedIds", () => {
    const bank = makeQuestions([1, 2, 3, 4, 5]);
    const { picked, usedIds } = pickRoundQuestions(bank, new Set(), 3);
    for (const q of picked) {
      expect(usedIds.has(q.id)).toBe(true);
    }
  });

  it("reshuffles from the full bank once too few unused questions remain", () => {
    const bank = makeQuestions([1, 2, 3, 4]);
    const usedIds = new Set([1, 2, 3]); // only 1 unused, count is 3
    const { picked, usedIds: nextUsedIds } = pickRoundQuestions(bank, usedIds, 3);
    expect(picked).toHaveLength(3);
    // reshuffle resets usedIds to just this round's picks, not the full bank
    expect(nextUsedIds.size).toBe(3);
  });

  it("does not mutate the usedIds set passed in", () => {
    const bank = makeQuestions([1, 2, 3, 4, 5]);
    const usedIds = new Set([1]);
    pickRoundQuestions(bank, usedIds, 3);
    expect(usedIds).toEqual(new Set([1]));
  });
});
