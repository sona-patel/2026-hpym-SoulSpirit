/* ============================================================
   SOUL SPIRIT — two-player spiritual quiz
   All question content lives in questions_en.json / questions_gu.json
   Edit those files to add, remove, or change questions.
   ============================================================ */

const QUESTIONS_PER_ROUND = 3;
const SECONDS_PER_QUESTION = 36;
const TIMER_CIRCUMFERENCE = 175.9; // 2 * PI * r(28)

const FILES = { en: "questions_en.json", gu: "questions_gu.json" };

const I18N = {
  en: {
    namesTitle: "Who's playing?",
    namesSubtitle: "Name each seeker. First to answer right, scores higher.",
    p1Placeholder: "Bhoolku 1",
    p2Placeholder: "Bhoolku 2",
    dupNameError: "Bhoolku 1 and Bhoolku 2 need different names.",
    beginBtn: "Begin Round →",
    changeLang2: "Change Language",
    correctIs: "Correct answer:",
    nextBtn: "Next Question →",
    roundDone: "Round complete",
    playAgain: "Play Again ↺",
    stopBtn: "Stop for now",
    winnerTie: "Two souls, perfectly in tune",
    winnerIs: (name) => `${name}'s soul is glowing brightest!`,
    timeUp: "Time's up",
    youAnswered: "Locked in",
    correctFirst: "Correct! First to answer +bonus",
    correctSecond: "Correct!",
    wrongAns: "Not quite",
  },
  gu: {
    namesTitle: "કોણ રમે છે?",
    namesSubtitle: "દરેક સાધકનું નામ આપો. જે પહેલા સાચો જવાબ આપશે, તેને વધુ ગુણ મળશે.",
    p1Placeholder: "ભૂલકું ૧",
    p2Placeholder: "ભૂલકું ૨",
    dupNameError: "ભૂલકું ૧ અને ભૂલકું ૨ માટે અલગ અલગ નામ આપો.",
    beginBtn: "રાઉન્ડ શરૂ કરો →",
    changeLang2: "ભાષા બદલો",
    correctIs: "સાચો જવાબ:",
    nextBtn: "આગળનો પ્રશ્ન →",
    roundDone: "રાઉન્ડ પૂર્ણ",
    playAgain: "ફરી રમો ↺",
    stopBtn: "હમણાં માટે બંધ કરો",
    winnerTie: "બે આત્માઓ, સંપૂર્ણ તાલમાં",
    winnerIs: (name) => `${name}નો આત્મા સૌથી વધુ ચમકી રહ્યો છે!`,
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
  names: { p1: "Bhoolku 1", p2: "Bhoolku 2" },
  timer: null,
  timeLeft: SECONDS_PER_QUESTION,
  answered: { p1: false, p2: false },
  firstCorrectDone: false,
};

const $ = (sel) => document.querySelector(sel);
const screens = {
  welcome: $("#screen-welcome"),
  lang: $("#screen-lang"),
  names: $("#screen-names"),
  quiz: $("#screen-quiz"),
  results: $("#screen-results"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  document.body.classList.toggle("on-welcome", name === "welcome");
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

/* ---------- Welcome ---------- */
$("#ready-btn").addEventListener("click", () => showScreen("lang"));
$("#back-to-welcome").addEventListener("click", () => showScreen("welcome"));

/* ---------- Language selection ---------- */
async function selectLanguage(lang) {
  state.lang = lang;
  applyI18n();
  syncLangButtons();
  await loadQuestions(lang);
}

function syncLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === state.lang);
  });
  document.querySelectorAll(".mini-lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === state.lang);
  });
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    await selectLanguage(btn.dataset.lang);
    showScreen("names");
  });
});

document.querySelectorAll(".mini-lang-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (btn.dataset.lang === state.lang) return;
    await selectLanguage(btn.dataset.lang);
  });
});

async function loadQuestions(lang) {
  const res = await fetch(FILES[lang]);
  state.allQuestions = await res.json();
  state.usedIds = new Set();
}

/* ---------- Names ---------- */
function clearNameError() {
  $("#name-error").classList.remove("show");
  $("#p1-name").closest("label").classList.remove("field-error");
  $("#p2-name").closest("label").classList.remove("field-error");
}
$("#p1-name").addEventListener("input", clearNameError);
$("#p2-name").addEventListener("input", clearNameError);

$("#names-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const p1Raw = $("#p1-name").value.trim();
  const p2Raw = $("#p2-name").value.trim();
  const p1Final = p1Raw || I18N[state.lang].p1Placeholder;
  const p2Final = p2Raw || I18N[state.lang].p2Placeholder;

  if (p1Final.toLowerCase() === p2Final.toLowerCase()) {
    $("#name-error").classList.add("show");
    $("#p1-name").closest("label").classList.add("field-error");
    $("#p2-name").closest("label").classList.add("field-error");
    $("#p2-name").focus();
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
  if (state.timeLeft <= Math.ceil(SECONDS_PER_QUESTION / 4)) $("#timer-ring-fg").style.stroke = "var(--coral)";

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
  $("#winner-text").textContent = line;
  showScreen("results");
}

$("#play-again-btn").addEventListener("click", () => showScreen("welcome"));
$("#change-lang-btn").addEventListener("click", () => showScreen("lang"));
$("#stop-btn").addEventListener("click", () => showScreen("welcome"));

/* ---------- init ---------- */
applyI18n();
syncLangButtons();
document.body.classList.add("on-welcome");
