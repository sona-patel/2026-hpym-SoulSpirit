import { describe, it, expect } from "vitest";
import { QUESTIONS, FUNNY_QUESTIONS } from "./index";

describe("QUESTIONS (bilingual)", () => {
  it("is non-empty", () => {
    expect(QUESTIONS.length).toBeGreaterThan(0);
  });

  it("every question has 4 options and a valid correct index", () => {
    for (const q of QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect([0, 1, 2, 3]).toContain(q.correct);
    }
  });

  it("every question and option contains both an English and a Gujarati line", () => {
    const gujaratiPattern = /[\u0A80-\u0AFF]/;
    for (const q of QUESTIONS) {
      expect(q.question).toContain("\n");
      expect(gujaratiPattern.test(q.question)).toBe(true);
      for (const opt of q.options) {
        expect(opt).toContain("\n");
        expect(gujaratiPattern.test(opt)).toBe(true);
      }
    }
  });
});

describe("FUNNY_QUESTIONS", () => {
  it("is non-empty and left as single-language (not bilingual-merged)", () => {
    expect(FUNNY_QUESTIONS.length).toBeGreaterThan(0);
    for (const q of FUNNY_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect([0, 1, 2, 3]).toContain(q.correct);
    }
  });
});
