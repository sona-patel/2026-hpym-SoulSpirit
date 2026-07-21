export interface Question {
  id: number;
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
}

export type Lang = "en" | "gu";
export type PlayerId = "p1" | "p2";

export interface GameState {
  lang: Lang;
  allQuestions: Question[];
  usedIds: Set<number>;
  roundQuestions: Question[];
  qIndex: number;
  scores: Record<PlayerId, number>;
  names: Record<PlayerId, string>;
  timer: ReturnType<typeof setInterval> | null;
  timeLeft: number;
  answered: Record<PlayerId, boolean>;
  firstCorrectDone: boolean;
}
