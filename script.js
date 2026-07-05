/* ============================================================
   ANTAR — two-player spiritual quiz
   All question content lives in questions_en.json / questions_gu.json
   Edit those files to add, remove, or change questions.
   ============================================================ */

const QUESTIONS_PER_ROUND = 5;
const SECONDS_PER_QUESTION = 36;
const TIMER_CIRCUMFERENCE = 175.9; // 2 * PI * r(28)

const FILES = { en: "questions_en.json", gu: "questions_gu.json" };

const I18N = {
  en: {
    namesTitle: "Who's playing?",
    namesSubtitle: "Name each seeker. First to answer right, scores higher.",
    p1Placeholder: "Player One",
    p2Placeholder: "Player Two",
    beginBtn: "Begin Round →",
    changeLang: "← change language",
    changeLang2: "Change Language",
    correctIs: "Correct answer:",
    nextBtn: "Next Question →",
    roundDone: "Round complete",
    playAgain: "Play Again ↺",
    stopBtn: "Stop for now",
    stopTitle: "Return to stillness",
    stopSubtitle: "The break is over whenever you're ready. Come back anytime.",
    restartBtn: "Start Over",
    winnerTie: "It's a tie — well matched minds.",
    winnerIs: (name) => `${name} takes this round.`,
    timeUp: "Time's up",
    youAnswered: "Locked in",
    correctFirst: "Correct! First to answer +bonus",
    correctSecond: "Correct!",
    wrongAns: "Not quite",
  },
  gu: {
    namesTitle: "કોણ રમે છે?",
    namesSubtitle: "દરેક સાધકનું નામ આપો. જે પહેલા સાચો જવાબ આપશે, તેને વધુ ગુણ મળશે.",
    p1Placeholder: "ખેલાડી ૧",
    p2Placeholder: "ખેલાડી ૨",
    beginBtn: "રાઉન્ડ શરૂ કરો →",
    changeLang: "← ભાષા બદલો",
    changeLang2: "ભાષા બદલો",
    correctIs: "સાચો જવાબ:",
    nextBtn: "આગળનો પ્રશ્ન →",
    roundDone: "રાઉન્ડ પૂર્ણ",
    playAgain: "ફરી રમો ↺",
    stopBtn: "હમણાં માટે બંધ કરો",
    stopTitle: "શાંતિ તરફ પાછા ફરો",
    stopSubtitle: "જ્યારે તૈયાર હો ત્યારે વિરામ પૂરો થાય છે. ગમે ત્યારે પાછા આવો.",
    restartBtn: "ફરીથી શરૂ કરો",
    winnerTie: "બરાબરી — બંને મન સરસ રીતે મેળ ખાય છે.",
    winnerIs: (name) => `${name} આ રાઉન્ડ જીતે છે.`,
    timeUp: "સમય પૂરો",
    youAnswered: "નોંધાયું",
    correctFirst: "સાચું! પ્રથમ જવાબ +બોનસ",
    correctSecond: "સાચું!",
    wrongAns: "ફરી પ્રયત્ન કરો",
  },
};

let state = {
  lang: "en",
  allQuestions: [],
  usedIds: new Set(),
  roundQuestions: [],
  qIndex: 0,
  scores: { p1: 0, p2: 0 },
  names: { p1: "Player One", p2: "Player Two" },
  timer: null,
  timeLeft: SECONDS_PER_QUESTION,
  answered: { p1: false, p2: false },
  firstCorrectDone: false,
};

const $ = (sel) => document.querySelector(sel);
const screens = {
  lang: $("#screen-lang"),
  names: $("#screen-names"),
  quiz: $("#screen-quiz"),
  results: $("#screen-results"),
  stop: $("#screen-stop"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function applyI18n() {
  const dict = I18N[state.lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (typeof dict[key] === "string") el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (typeof dict[key] === "string") el.placeholder = dict[key];
  });
  document.documentElement.lang = state.lang;
}

/* ---------- Language selection ---------- */
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    state.lang = btn.dataset.lang;
    applyI18n();
    await loadQuestions(state.lang);
    showScreen("names");
  });
});

$("#back-to-lang").addEventListener("click", () => showScreen("lang"));

async function loadQuestions(lang) {
  const res = await fetch(FILES[lang]);
  state.allQuestions = await res.json();
  state.usedIds = new Set();
}

/* ---------- Names ---------- */
$("#names-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const p1 = $("#p1-name").value.trim();
  const p2 = $("#p2-name").value.trim();
  state.names.p1 = p1 || I18N[state.lang].p1Placeholder;
  state.names.p2 = p2 || I18N[state.lang].p2Placeholder;
  $("#p1-tag").textContent = state.names.p1;
  $("#p2-tag").textContent = state.names.p2;
  $("#result-p1-tag").textContent = state.names.p1;
  $("#result-p2-tag").textContent = state.names.p2;
  startRound();
});

/* ---------- Round setup ---------- */
function pickRoundQuestions() {
  let pool = state.allQuestions.filter((q) => !state.usedIds.has(q.id));
  if (pool.length < QUESTIONS_PER_ROUND) {
    state.usedIds = new Set();
    pool = [...state.allQuestions];
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, QUESTIONS_PER_ROUND);
  picked.forEach((q) => state.usedIds.add(q.id));
  return picked;
}

function startRound() {
  state.roundQuestions = pickRoundQuestions();
  state.qIndex = 0;
  state.scores = { p1: 0, p2: 0 };
  $("#p1-score").textContent = "0";
  $("#p2-score").textContent = "0";
  $("#q-total").textContent = QUESTIONS_PER_ROUND;
  showScreen("quiz");
  renderQuestion();
}

/* ---------- Question rendering ---------- */
function renderQuestion() {
  clearInterval(state.timer);
  state.answered = { p1: false, p2: false };
  state.firstCorrectDone = false;
  state.timeLeft = SECONDS_PER_QUESTION;

  const q = state.roundQuestions[state.qIndex];
  $("#q-index").textContent = state.qIndex + 1;
  $("#progress-fill").style.width = `${((state.qIndex) / QUESTIONS_PER_ROUND) * 100}%`;
  $("#question-text").textContent = q.question;
  $("#reveal").classList.remove("show");
  $("#timer-num").textContent = state.timeLeft;

  const ring = $("#timer-ring-fg");
  ring.style.stroke = "";
  ring.style.strokeDashoffset = 0;

  buildOptions("p1", q);
  buildOptions("p2", q);
  $("#p1-status").innerHTML = "&nbsp;";
  $("#p2-status").innerHTML = "&nbsp;";

  state.timer = setInterval(tick, 1000);
}

function buildOptions(player, q) {
  const container = $(`#${player}-options`);
  container.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswer(player, idx, q));
    container.appendChild(btn);
  });
}

function tick() {
  state.timeLeft -= 1;
  $("#timer-num").textContent = Math.max(state.timeLeft, 0);
  const ratio = Math.max(state.timeLeft, 0) / SECONDS_PER_QUESTION;
  $("#timer-ring-fg").style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - ratio);
  if (state.timeLeft <= 15) $("#timer-ring-fg").style.stroke = "var(--coral)";

  if (state.timeLeft <= 0) {
    finishQuestion(true);
  }
}

function handleAnswer(player, idx, q) {
  if (state.answered[player] || state.timeLeft <= 0) return;
  state.answered[player] = true;

  const container = $(`#${player}-options`);
  const buttons = container.querySelectorAll(".opt-btn");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === idx) b.classList.add(idx === q.correct ? "chosen-correct" : "chosen-wrong");
  });

  const dict = I18N[state.lang];
  const statusEl = $(`#${player}-status`);
  const isCorrect = idx === q.correct;

  if (isCorrect) {
    let points = 25 + Math.max(state.timeLeft, 0);
    if (!state.firstCorrectDone) {
      points += 20;
      state.firstCorrectDone = true;
      statusEl.textContent = `${dict.correctFirst} (+${points})`;
    } else {
      statusEl.textContent = `${dict.correctSecond} (+${points})`;
    }
    state.scores[player] += points;
    $(`#${player}-score`).textContent = state.scores[player];
  } else {
    statusEl.textContent = dict.wrongAns;
  }

  if (state.answered.p1 && state.answered.p2) finishQuestion(false);
}

function finishQuestion(timedOut) {
  clearInterval(state.timer);
  const q = state.roundQuestions[state.qIndex];
  const dict = I18N[state.lang];

  ["p1", "p2"].forEach((player) => {
    const container = $(`#${player}-options`);
    const buttons = container.querySelectorAll(".opt-btn");
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.classList.add("reveal-correct");
    });
    if (!state.answered[player]) {
      $(`#${player}-status`).textContent = dict.timeUp;
    }
  });

  $("#reveal-answer-text").textContent = q.options[q.correct];
  $("#reveal-explain").textContent = q.explanation || "";
  $("#reveal").classList.add("show");
  $("#progress-fill").style.width = `${((state.qIndex + 1) / QUESTIONS_PER_ROUND) * 100}%`;
}

$("#next-btn").addEventListener("click", () => {
  state.qIndex += 1;
  if (state.qIndex >= QUESTIONS_PER_ROUND) {
    showResults();
  } else {
    renderQuestion();
  }
});

/* ---------- Results ---------- */
function showResults() {
  clearInterval(state.timer);
  $("#result-p1-score").textContent = state.scores.p1;
  $("#result-p2-score").textContent = state.scores.p2;

  const dict = I18N[state.lang];
  let line;
  if (state.scores.p1 === state.scores.p2) {
    line = dict.winnerTie;
  } else {
    const winnerName = state.scores.p1 > state.scores.p2 ? state.names.p1 : state.names.p2;
    line = dict.winnerIs(winnerName);
  }
  $("#winner-line").textContent = line;
  showScreen("results");
}

$("#play-again-btn").addEventListener("click", () => startRound());
$("#change-lang-btn").addEventListener("click", () => showScreen("lang"));
$("#stop-btn").addEventListener("click", () => showScreen("stop"));
$("#restart-btn").addEventListener("click", () => showScreen("lang"));

/* ---------- init ---------- */
applyI18n();
