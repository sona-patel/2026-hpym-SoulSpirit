import type { Question } from "./types";

export const QUESTIONS_PER_ROUND = 3;
// The final question of every round is drawn from the separate "funny" bank.
export const FUNNY_QUESTIONS_PER_ROUND = 1;
export const MAIN_QUESTIONS_PER_ROUND = QUESTIONS_PER_ROUND - FUNNY_QUESTIONS_PER_ROUND;
export const SECONDS_PER_QUESTION = 36;
const BASE_SCORE = 25;
const FIRST_CORRECT_BONUS = 20;

export function calculateScore(secondsLeft: number, isFirstCorrect: boolean): number {
  const clamped = Math.max(secondsLeft, 0);
  return BASE_SCORE + clamped + (isFirstCorrect ? FIRST_CORRECT_BONUS : 0);
}

export function namesAreDuplicate(p1: string, p2: string): boolean {
  return p1.trim().toLowerCase() === p2.trim().toLowerCase();
}

export function resolveFinalName(raw: string, placeholder: string): string {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : placeholder;
}

export interface RoundPick {
  picked: Question[];
  usedIds: Set<number>;
}

export function pickRoundQuestions(
  allQuestions: Question[],
  usedIds: Set<number>,
  count: number = QUESTIONS_PER_ROUND,
): RoundPick {
  let pool = allQuestions.filter((q) => !usedIds.has(q.id));
  let baseUsedIds = usedIds;

  if (pool.length < count) {
    baseUsedIds = new Set<number>();
    pool = [...allQuestions];
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);

  const nextUsedIds = new Set(baseUsedIds);
  picked.forEach((q) => nextUsedIds.add(q.id));

  return { picked, usedIds: nextUsedIds };
}

export interface MixedRoundPick {
  picked: Question[];
  usedMainIds: Set<number>;
  usedFunnyIds: Set<number>;
}

/**
 * Builds one round's questions from two banks: the first `mainCount`
 * questions come from `mainQuestions` (the language-specific bank), and the
 * final `funnyCount` question(s) come from `funnyQuestions` (the shared
 * bonus/funny bank). Each bank tracks its own "already used" ids so the two
 * pools cycle independently.
 */
export function pickMixedRoundQuestions(
  mainQuestions: Question[],
  funnyQuestions: Question[],
  usedMainIds: Set<number>,
  usedFunnyIds: Set<number>,
  mainCount: number = MAIN_QUESTIONS_PER_ROUND,
  funnyCount: number = FUNNY_QUESTIONS_PER_ROUND,
): MixedRoundPick {
  const mainPick = pickRoundQuestions(mainQuestions, usedMainIds, mainCount);
  const funnyPick = pickRoundQuestions(funnyQuestions, usedFunnyIds, funnyCount);

  return {
    picked: [...mainPick.picked, ...funnyPick.picked],
    usedMainIds: mainPick.usedIds,
    usedFunnyIds: funnyPick.usedIds,
  };
}
