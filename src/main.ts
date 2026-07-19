import type { GameState } from "./types";
import { I18N } from "./i18n";
import { QUESTION_BANKS } from "./data";
import {
  pickRoundQuestions,
  namesAreDuplicate,
  resolveFinalName,
  QUESTIONS_PER_ROUND,
} from "./quiz";
import { $, showScreen, applyI18n, syncLangButtons, renderQuestion, showResults } from "./dom";

const state: GameState = {
  lang: "en",
  allQuestions: QUESTION_BANKS.en,
  usedIds: new Set(),
  roundQuestions: [],
  qIndex: 0,
  scores: { p1: 0, p2: 0 },
  names: { p1: "Bhoolku 1", p2: "Bhoolku 2" },
  timer: null,
  timeLeft: 0,
  answered: { p1: false, p2: false },
  firstCorrectDone: false,
};

/* ---------- Welcome ---------- */
$("#ready-btn").addEventListener("click", () => showScreen("lang"));
$("#back-to-welcome").addEventListener("click", () => showScreen("welcome"));

/* ---------- Language selection ---------- */
function selectLanguage(lang: "en" | "gu"): void {
  state.lang = lang;
  state.allQuestions = QUESTION_BANKS[lang];
  state.usedIds = new Set();
  applyI18n(state.lang);
  syncLangButtons(state.lang);
}

document.querySelectorAll<HTMLElement>(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang as "en" | "gu";
    selectLanguage(lang);
    showScreen("names");
  });
});

document.querySelectorAll<HTMLElement>(".mini-lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang as "en" | "gu";
    if (lang === state.lang) return;
    selectLanguage(lang);
  });
});

/* ---------- Names ---------- */
function clearNameError(): void {
  $("#name-error").classList.remove("show");
  $("#p1-name").closest("label")?.classList.remove("field-error");
  $("#p2-name").closest("label")?.classList.remove("field-error");
}
$("#p1-name").addEventListener("input", clearNameError);
$("#p2-name").addEventListener("input", clearNameError);

$<HTMLFormElement>("#names-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const p1Input = $<HTMLInputElement>("#p1-name");
  const p2Input = $<HTMLInputElement>("#p2-name");
  const dict = I18N[state.lang];

  const p1Final = resolveFinalName(p1Input.value, dict.p1Placeholder);
  const p2Final = resolveFinalName(p2Input.value, dict.p2Placeholder);

  if (namesAreDuplicate(p1Final, p2Final)) {
    $("#name-error").classList.add("show");
    $("#p1-name").closest("label")?.classList.add("field-error");
    $("#p2-name").closest("label")?.classList.add("field-error");
    p2Input.focus();
    return;
  }
  clearNameError();

  state.names.p1 = p1Final;
  state.names.p2 = p2Final;
  $("#p1-tag").textContent = state.names.p1;
  $("#p2-tag").textContent = state.names.p2;
  $("#result-p1-tag").textContent = state.names.p1;
  $("#result-p2-tag").textContent = state.names.p2;
  startRound();
});

/* ---------- Round setup ---------- */
function startRound(): void {
  const { picked, usedIds } = pickRoundQuestions(
    state.allQuestions,
    state.usedIds,
    QUESTIONS_PER_ROUND,
  );
  state.roundQuestions = picked;
  state.usedIds = usedIds;
  state.qIndex = 0;
  state.scores = { p1: 0, p2: 0 };
  $("#p1-score").textContent = "0";
  $("#p2-score").textContent = "0";
  $("#q-total").textContent = String(QUESTIONS_PER_ROUND);
  showScreen("quiz");
  renderQuestion(state);
}

$("#next-btn").addEventListener("click", () => {
  state.qIndex += 1;
  if (state.qIndex >= QUESTIONS_PER_ROUND) {
    showResults(state);
  } else {
    renderQuestion(state);
  }
});

/* ---------- Results ---------- */
$("#play-again-btn").addEventListener("click", () => showScreen("welcome"));
$("#change-lang-btn").addEventListener("click", () => showScreen("lang"));
$("#stop-btn").addEventListener("click", () => showScreen("welcome"));

/* ---------- init ---------- */
applyI18n(state.lang);
syncLangButtons(state.lang);
document.body.classList.add("on-welcome");
