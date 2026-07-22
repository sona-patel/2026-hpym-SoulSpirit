import type { Lang, Question } from "../types";
import enRaw from "./questions_en.json";
import guRaw from "./questions_gu.json";
import funnyRaw from "./questions_funny.json";

function isQuestion(value: unknown): value is Question {
  if (typeof value !== "object" || value === null) return false;
  const q = value as Record<string, unknown>;
  return (
    typeof q.id === "number" &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === "string") &&
    (q.correct === 0 || q.correct === 1 || q.correct === 2 || q.correct === 3)
  );
}

function loadBank(raw: unknown[], label: string): Question[] {
  const valid = raw.filter(isQuestion);
  if (valid.length !== raw.length) {
    throw new Error(`${label}: ${raw.length - valid.length} malformed question(s)`);
  }
  return valid;
}

export const QUESTION_BANKS: Record<Lang, Question[]> = {
  en: loadBank(enRaw as unknown[], "questions_en.json"),
  gu: loadBank(guRaw as unknown[], "questions_gu.json"),
};

// A single bonus/funny bank shared across languages, used to supply the
// last question of every round regardless of which language is selected.
export const FUNNY_QUESTIONS: Question[] = loadBank(
  funnyRaw as unknown[],
  "questions_funny.json",
);
