import type { GameState, PlayerId, Question, Lang } from "./types";
import { I18N } from "./i18n";
import { calculateScore, SECONDS_PER_QUESTION, QUESTIONS_PER_ROUND } from "./quiz";

export const TIMER_CIRCUMFERENCE = 175.9; // 2 * PI * r(28)

export type ScreenName = "welcome" | "lang" | "names" | "quiz" | "results";

export function $<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el as T;
}

const screens: Record<ScreenName, HTMLElement> = {
  welcome: $("#screen-welcome"),
  lang: $("#screen-lang"),
  names: $("#screen-names"),
  quiz: $("#screen-quiz"),
  results: $("#screen-results"),
};

export function showScreen(name: ScreenName): void {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  document.body.classList.toggle("on-welcome", name === "welcome");
}

export function applyI18n(lang: Lang): void {
  const dict = I18N[lang];
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n") as keyof typeof dict | null;
    if (key && typeof dict[key] === "string") el.textContent = dict[key] as string;
  });
  document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder") as keyof typeof dict | null;
    if (key && typeof dict[key] === "string") el.placeholder = dict[key] as string;
  });
  document.documentElement.lang = lang;
}

export function syncLangButtons(lang: Lang): void {
  document.querySelectorAll<HTMLElement>(".lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  document.querySelectorAll<HTMLElement>(".mini-lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
}

function buildOptions(state: GameState, player: PlayerId, q: Question): void {
  const container = $(`#${player}-options`);
  container.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswer(state, player, idx, q));
    container.appendChild(btn);
  });
}

export function renderQuestion(state: GameState): void {
  if (state.timer !== null) clearInterval(state.timer);
  state.answered = { p1: false, p2: false };
  state.firstCorrectDone = false;
  state.timeLeft = SECONDS_PER_QUESTION;

  const q = state.roundQuestions[state.qIndex];
  $("#q-index").textContent = String(state.qIndex + 1);
  $("#progress-fill").style.width = `${(state.qIndex / QUESTIONS_PER_ROUND) * 100}%`;
  $("#question-text").textContent = q.question;
  $("#reveal").classList.remove("show");
  $("#timer-num").textContent = String(state.timeLeft);

  const ring = $<SVGCircleElement>("#timer-ring-fg");
  ring.style.stroke = "";
  ring.style.strokeDashoffset = "0";

  buildOptions(state, "p1", q);
  buildOptions(state, "p2", q);
  $("#p1-status").innerHTML = "&nbsp;";
  $("#p2-status").innerHTML = "&nbsp;";

  state.timer = setInterval(() => tick(state), 1000);
}

function tick(state: GameState): void {
  state.timeLeft -= 1;
  $("#timer-num").textContent = String(Math.max(state.timeLeft, 0));
  const ratio = Math.max(state.timeLeft, 0) / SECONDS_PER_QUESTION;
  $<SVGCircleElement>("#timer-ring-fg").style.strokeDashoffset = String(
    TIMER_CIRCUMFERENCE * (1 - ratio),
  );
  if (state.timeLeft <= Math.ceil(SECONDS_PER_QUESTION / 4)) {
    $<SVGCircleElement>("#timer-ring-fg").style.stroke = "var(--coral)";
  }

  if (state.timeLeft <= 0) {
    finishQuestion(state);
  }
}

function handleAnswer(state: GameState, player: PlayerId, idx: number, q: Question): void {
  if (state.answered[player] || state.timeLeft <= 0) return;
  state.answered[player] = true;

  const container = $(`#${player}-options`);
  const buttons = container.querySelectorAll<HTMLButtonElement>(".opt-btn");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === idx) b.classList.add(idx === q.correct ? "chosen-correct" : "chosen-wrong");
  });

  const dict = I18N[state.lang];
  const statusEl = $(`#${player}-status`);
  const isCorrect = idx === q.correct;

  if (isCorrect) {
    const isFirstCorrect = !state.firstCorrectDone;
    const points = calculateScore(state.timeLeft, isFirstCorrect);
    if (isFirstCorrect) {
      state.firstCorrectDone = true;
      statusEl.textContent = `${dict.correctFirst} (+${points})`;
    } else {
      statusEl.textContent = `${dict.correctSecond} (+${points})`;
    }
    state.scores[player] += points;
    $(`#${player}-score`).textContent = String(state.scores[player]);
  } else {
    statusEl.textContent = dict.wrongAns;
  }

  if (state.answered.p1 && state.answered.p2) finishQuestion(state);
}

function finishQuestion(state: GameState): void {
  if (state.timer !== null) clearInterval(state.timer);
  const q = state.roundQuestions[state.qIndex];
  const dict = I18N[state.lang];

  (["p1", "p2"] as PlayerId[]).forEach((player) => {
    const container = $(`#${player}-options`);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".opt-btn");
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add("reveal-correct");
    });
    if (!state.answered[player]) {
      $(`#${player}-status`).textContent = dict.timeUp;
    }
  });

  $("#reveal-answer-text").textContent = q.options[q.correct];
  $("#reveal-explain").textContent = q.explanation ?? "";
  $("#reveal").classList.add("show");
  $("#progress-fill").style.width = `${((state.qIndex + 1) / QUESTIONS_PER_ROUND) * 100}%`;
}

export function showResults(state: GameState): void {
  if (state.timer !== null) clearInterval(state.timer);
  $("#result-p1-score").textContent = String(state.scores.p1);
  $("#result-p2-score").textContent = String(state.scores.p2);

  const dict = I18N[state.lang];
  let line: string;
  if (state.scores.p1 === state.scores.p2) {
    line = dict.winnerTie;
  } else {
    const winnerName = state.scores.p1 > state.scores.p2 ? state.names.p1 : state.names.p2;
    line = dict.winnerIs(winnerName);
  }
  $("#winner-text").textContent = line;
  showScreen("results");
}
