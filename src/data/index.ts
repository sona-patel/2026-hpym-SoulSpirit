import type { Question } from "../types";
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

// Two parallel, single-language banks (kept as separate source files so each
// stays easy to translate/edit on its own; they must share the same ids).
const enBank = loadBank(enRaw as unknown[], "questions_en.json");
const guBank = loadBank(guRaw as unknown[], "questions_gu.json");

/**
 * Merged here, by id, into one bilingual bank: every question and option
 * shows the English line above the Gujarati line. This is what supplies the
 * main round questions, so no language selection screen is needed.
 */
function mergeBilingual(en: Question[], gu: Question[]): Question[] {
  const guById = new Map(gu.map((q) => [q.id, q]));
  return en.map((enQ) => {
    const guQ = guById.get(enQ.id);
    if (!guQ) {
      throw new Error(`questions_gu.json: missing translation for id ${enQ.id}`);
    }
    const explanation =
      enQ.explanation || guQ.explanation
        ? [enQ.explanation, guQ.explanation].filter(Boolean).join("\n")
        : undefined;
    return {
      id: enQ.id,
      question: `${enQ.question}\n${guQ.question}`,
      options: enQ.options.map((opt, i) => `${opt}\n${guQ.options[i]}`) as [
        string,
        string,
        string,
        string,
      ],
      correct: enQ.correct,
      explanation,
    };
  });
}

export const QUESTIONS: Question[] = mergeBilingual(enBank, guBank);

// A single bonus/funny bank, used to supply the last question of every
// round. It's intentionally left in one language, unchanged (no bilingual
// merge needed for it).
export const FUNNY_QUESTIONS: Question[] = loadBank(
  funnyRaw as unknown[],
  "questions_funny.json",
);
