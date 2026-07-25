import type { GameState } from "./types";
import { STRINGS } from "./i18n";
import { QUESTIONS, FUNNY_QUESTIONS } from "./data";
import {
  pickMixedRoundQuestions,
  namesAreDuplicate,
  resolveFinalName,
  QUESTIONS_PER_ROUND,
} from "./quiz";
import { $, showScreen, applyI18n, renderQuestion, showResults } from "./dom";

const state: GameState = {
  allQuestions: QUESTIONS,
  usedIds: new Set(),
  usedFunnyIds: new Set(),
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
$("#ready-btn").addEventListener("click", () => showScreen("names"));

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

  const p1Final = resolveFinalName(p1Input.value, STRINGS.p1Placeholder);
  const p2Final = resolveFinalName(p2Input.value, STRINGS.p2Placeholder);

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
  const { picked, usedMainIds, usedFunnyIds } = pickMixedRoundQuestions(
    state.allQuestions,
    FUNNY_QUESTIONS,
    state.usedIds,
    state.usedFunnyIds,
  );
  state.roundQuestions = picked;
  state.usedIds = usedMainIds;
  state.usedFunnyIds = usedFunnyIds;
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
$("#stop-btn").addEventListener("click", () => showScreen("welcome"));

/* ---------- init ---------- */
applyI18n();
document.body.classList.add("on-welcome");
