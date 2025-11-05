import { DEFAULT_BANK, QUESTION_SECTIONS } from "./questionBank.js";
import {
  initBaseDefense,
  resetBaseSession,
  handleBaseAnswer,
  handleBaseSkip,
  getBaseSummary,
  teardownBaseDefense
} from "./baseDefense.js";

// ===== Utility =====
const el = id => document.getElementById(id);
const toast = msg => {
  const t = el("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => {
    t.style.display = "none";
  }, 1600);
};

// Secure-ish random helpers
const randInt = max => {
  try {
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      // uniform enough for UI — modulo bias negligible at small max
      return buf[0] % (max + 1);
    }
  } catch (_) {}
  return Math.floor(Math.random() * (max + 1));
};
// Fisher-Yates shuffle (in-place) using randInt
const shuffleArr = arr => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randInt(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
let currentChoiceOrder = [];
let lastCorrectPos = -1;
import { playSound } from "./sound.js";

// ===== State =====
let bank = structuredClone(DEFAULT_BANK);
let queue = [];
let score = 0;
let streak = 0;
let qIndex = 0;
let timerId = null;
let timeLeft = 0;
let mode = null; // 'MCQ', 'SHORT', 'SHOT', 'BASE', 'STUDY'

const SECTION_ORDER = ["coreMotivation", "u3_hr", "u3_ops", "u4_aos1", "u4_aos2"];
const SECTION_LABELS = {
  coreMotivation: "Unit 3 - Motivation Foundations",
  u3_hr: "Unit 3 - Human Resource Strategies",
  u3_ops: "Unit 3 - Operations Management",
  u4_aos1: "Unit 4 - Need for Change (AOS1)",
  u4_aos2: "Unit 4 - Implementing Change (AOS2)"
};

// Shot mode
let made = 0;
let attempts = 0;
let possession = 1;
let maxPossessions = 5;
let playerPts = 0;

// ===== DOM references =====
const viewMap = {
  dashboard: el("view-dashboard"),
  MCQ: el("view-mcq"),
  SHORT: el("view-short"),
  SHOT: el("view-shot"),
  BASE: el("view-base"),
  STUDY: el("view-study")
};

const shellSlots = {
  MCQ: viewMap.MCQ.querySelector('[data-shell-slot="game"]'),
  SHORT: viewMap.SHORT.querySelector('[data-shell-slot="game"]'),
  SHOT: viewMap.SHOT.querySelector('[data-shell-slot="game"]'),
  BASE: viewMap.BASE.querySelector('[data-shell-slot="game"]')
};

const hudSlots = {
  MCQ: viewMap.MCQ.querySelector('[data-slot="hud"]'),
  SHORT: viewMap.SHORT.querySelector('[data-slot="hud"]'),
  SHOT: viewMap.SHOT.querySelector('[data-slot="hud"]'),
  BASE: viewMap.BASE.querySelector('[data-slot="hud"]')
};

const gameShell = el("gameShell");
const hud = el("hud");
const homeBrand = document.querySelector(".brand");

const scoreEl = el("score");
const streakEl = el("streak");
const qnumEl = el("qnum");
const qtotalEl = el("qtotal");
const timeEl = el("time");
const qEl = el("question");
const answersEl = el("answers");
const explainEl = el("explain");
const tagsEl = el("topicTags");
const shortUI = el("shortUI");
const shortInput = el("shortInput");
const shotUI = el("shotUI");
const meterFill = el("meterFill");
const greenPctEl = el("greenPct");
const madeEl = el("made");
const attemptsEl = el("attempts");
const announcerEl = el("announcer");
const ball = el("ball");
const possessionEl = el("possession");
const maxPossEl = el("maxPoss");
const playerPtsEl = el("playerPts");
const nextPossessionBtn = el("nextPossessionBtn");
const finishShotGameBtn = el("finishShotGameBtn");
const baseUI = el("baseUI");
const topicListEl = el("topicList");

const baseElements = {
  baseGridEl: el("baseGrid"),
  projectileLayer: el("projectileLayer"),
  baseAnnouncerEl: el("baseAnnouncer"),
  energyEl: el("energy"),
  heartsEl: el("hearts"),
  waveEl: el("wave"),
  coresEl: el("cores"),
  upgradeBtn: el("upgradeBtn"),
  startWaveBtn: el("startWaveBtn"),
  resetBaseBtn: el("resetBaseBtn"),
  togglePathsBtn: el("togglePaths"),
  unlockTeslaBtn: el("unlockTesla"),
  unlockSplashBtn: el("unlockSplash"),
  unlockSlowBtn: el("unlockSlow"),
  unlockRangeBtn: el("unlockRange"),
  unlockPowerBtn: el("unlockPower"),
  upgradeEnergyBtn: el("upgradeEnergy"),
  hqHealthFill: el("hqHealthFill")
};

// ===== View helpers =====
function showView(name) {
  Object.values(viewMap).forEach(v => v.classList.remove("active"));
  const next = viewMap[name];
  if (next) {
    next.classList.add("active");
  }
}

function mountGameShell(target) {
  if (!shellSlots[target]) return;
  shellSlots[target].appendChild(gameShell);
  gameShell.style.display = "block";
  if (hudSlots[target]) {
    hudSlots[target].appendChild(hud);
    hud.classList.add("active");
  } else {
    hud.classList.remove("active");
  }
}

function showDashboard() {
  showView("dashboard");
  gameShell.style.display = "none";
  hud.classList.remove("active");
  clearTimer();
  teardownBaseDefense();
  updateStats();
}

function renderTopicOptions() {
  if (!topicListEl) return;
  let markup = "";
  let counter = 0;
  const orderedSections = [...SECTION_ORDER];
  Object.keys(QUESTION_SECTIONS).forEach(sectionKey => {
    if (!orderedSections.includes(sectionKey)) orderedSections.push(sectionKey);
  });
  orderedSections.forEach(sectionKey => {
    const questions = QUESTION_SECTIONS[sectionKey] || [];
    if (!questions.length) return;
    const heading =
      SECTION_LABELS[sectionKey] || sectionKey.replace(/_/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
    const topics = [...new Set(questions.map(q => q.topic))];
    markup += `<div class="topic-group"><div class="topic-heading">${heading}</div>`;
    topics.forEach(topic => {
      counter += 1;
      const id = `topic-${counter}`;
      markup += `<label for="${id}"><input type="checkbox" id="${id}" class="topic" value="${topic}" checked> ${topic}</label>`;
    });
    markup += "</div>";
  });
  topicListEl.innerHTML = markup;
}

function buildQueue() {
  const chosen = [...document.querySelectorAll(".topic:checked")].map(cb => cb.value);
  if (chosen.length === 0) {
    queue = [];
    qtotalEl.textContent = 0;
    return;
  }
  let filtered = bank.filter(q => chosen.includes(q.topic));
  if (el("shuffle").checked) filtered = shuffleArr(filtered);
  const n = Math.min(parseInt(el("numQ").value, 10) || 10, filtered.length);
  queue = filtered.slice(0, n);
  qtotalEl.textContent = n;
}

// ===== Mode starters =====
function startGame() {
  mode = "MCQ";
  score = 0;
  streak = 0;
  qIndex = 0;
  updateStats();
  buildQueue();
  if (queue.length === 0) {
    toast("Select at least one topic first.");
    return;
  }
  showView("MCQ");
  mountGameShell("MCQ");
  answersEl.classList.remove("hidden");
  shortUI.classList.add("hidden");
  shotUI.classList.add("hidden");
  baseUI.classList.add("hidden");
  nextQuestion();
}

function startShort() {
  mode = "SHORT";
  score = 0;
  streak = 0;
  qIndex = 0;
  updateStats();
  buildQueue();
  if (queue.length === 0) {
    toast("Select at least one topic first.");
    return;
  }
  showView("SHORT");
  mountGameShell("SHORT");
  answersEl.classList.add("hidden");
  shotUI.classList.add("hidden");
  baseUI.classList.add("hidden");
  shortUI.classList.remove("hidden");
  nextQuestion();
}

function startShot(resetTotals = true) {
  mode = "SHOT";
  if (resetTotals) {
    made = 0;
    attempts = 0;
    possession = 1;
    playerPts = 0;
  }
  score = 0;
  streak = 0;
  updateStats();
  updateShotUI();
  buildQueue();
  if (queue.length === 0) {
    toast("Select at least one topic first.");
    return;
  }
  showView("SHOT");
  mountGameShell("SHOT");
  answersEl.classList.remove("hidden");
  shortUI.classList.add("hidden");
  baseUI.classList.add("hidden");
  shotUI.classList.remove("hidden");
  announcerEl.textContent = "Shot Clock: 10 seconds";
  timeLeft = 10;
  timeEl.textContent = `${timeLeft}s`;
  clearTimer();
  timerId = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearTimer();
      endShot();
    }
  }, 1000);
  nextQuestion();
}

function startBase() {
  mode = "BASE";
  score = 0;
  streak = 0;
  updateStats();
  buildQueue();
  if (queue.length === 0) {
    toast("Select at least one topic first.");
    return;
  }
  showView("BASE");
  mountGameShell("BASE");
  answersEl.classList.remove("hidden");
  shortUI.classList.add("hidden");
  shotUI.classList.add("hidden");
  baseUI.classList.remove("hidden");
  resetBaseSession();
  nextQuestion();
}

function startStudy() {
  buildQueue();
  showView("STUDY");
  hud.classList.remove("active");
  gameShell.style.display = "none";
  renderStudy();
}

// ===== Quiz flow =====
function nextQuestion() {
  if (qIndex >= queue.length) {
    if (mode === "SHOT" || mode === "BASE") {
      qIndex = 0;
    } else {
      finish();
      return;
    }
  }
  const q = queue[qIndex];
  qnumEl.textContent = qIndex + 1;
  tagsEl.innerHTML = `<span class="tag">${q.topic}</span>`;
  qEl.textContent = q.q;
  answersEl.innerHTML = "";
  explainEl.classList.add("hidden");

  if (mode !== "SHORT") {
    // Shuffle choices per-question so correct line changes; avoid repeating same correct position twice
    let attempts = 0;
    do {
      currentChoiceOrder = Array.from({ length: q.choices.length }, (_, i) => i);
      shuffleArr(currentChoiceOrder);
      attempts += 1;
    } while (currentChoiceOrder.indexOf(q.answer) === lastCorrectPos && attempts < 5);
    lastCorrectPos = currentChoiceOrder.indexOf(q.answer);
    currentChoiceOrder.forEach((origIdx, idx) => {
      const btn = document.createElement("button");
      btn.className = "answer";
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${q.choices[origIdx]}`;
      btn.dataset.origIdx = String(origIdx);
      btn.onclick = () => { playSound('click'); selectAnswer(origIdx); };
      answersEl.appendChild(btn);
    });
    answersEl.classList.remove("hidden");
  } else {
    shortInput.value = "";
    shortInput.focus();
  }

  if (mode !== "SHOT") {
    resetQuestionTimerForCurrentMode();
  }
}

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function resetQuestionTimerForCurrentMode() {
  if (mode === "SHOT") return;
  clearTimer();
  const seconds = parseInt(el("timerPerQ").value, 10) || 0;
  if (seconds > 0) {
    timeLeft = seconds;
    timeEl.textContent = `${seconds}s`;
    timerId = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearTimer();
        lockAnswers();
        reveal(false);
      }
    }, 1000);
  } else {
    timeEl.textContent = "--";
  }
}

function lockAnswers() {
  if (answersEl.classList.contains("hidden")) return;
  [...answersEl.children].forEach(btn => {
    btn.disabled = true;
  });
}

function selectAnswer(idx) {
  const q = queue[qIndex];
  const correct = idx === q.answer;

  if (mode === "SHOT") {
    attempts += 1;
    if (correct) {
      made += 1;
      score += 5;
      toast("Green release!");
      playSound('correct');
    } else {
      toast("Missed it.");
      playSound('wrong');
    }
    updateShotUI();
    qIndex = (qIndex + 1) % queue.length;
    nextQuestion();
    return;
  }

  if (mode === "BASE") {
    if (!correct) streak = 0;
    playSound(correct ? 'correct' : 'wrong');
    // Show green/red feedback for 1.5s before moving on
    lockAnswers();
    [...answersEl.children].forEach(btn => {
      const orig = parseInt(btn.dataset.origIdx || "-1", 10);
      if (orig === q.answer) btn.classList.add("correct");
      if (orig === idx && !correct) btn.classList.add("wrong");
    });
    setTimeout(() => {
      handleBaseAnswer(correct, streak);
      qIndex = (qIndex + 1) % queue.length;
      nextQuestion();
    }, 1500);
    return;
  }

  lockAnswers();
  [...answersEl.children].forEach(btn => {
    const orig = parseInt(btn.dataset.origIdx || "-1", 10);
    if (orig === q.answer) btn.classList.add("correct");
    if (orig === idx && !correct) btn.classList.add("wrong");
  });

  if (correct) {
    score += 10;
    streak += 1;
    toast(streak >= 3 ? `Streak x${streak}!` : "Correct!");
    playSound('correct');
  } else {
    streak = 0;
    toast("Not quite.");
    playSound('wrong');
  }
  updateStats();
  if (el("instantReveal").checked) {
    reveal(correct);
  }
  // Keep highlight for 1.5s, then advance (MCQ only)
  setTimeout(() => {
    if (mode === 'MCQ') {
      qIndex += 1;
      nextQuestion();
    } else {
      // If still on the same question, clear only
      [...answersEl.children].forEach(btn => btn.classList.remove('correct', 'wrong'));
    }
  }, 1500);
}

function reveal(correct) {
  const q = queue[qIndex];
  explainEl.innerHTML = `<strong>${correct ? "Nice work!" : "Here's why:"}</strong> ${q.explain || ""}`;
  explainEl.classList.remove("hidden");
}

function checkShort() {
  const q = queue[qIndex];
  const user = (shortInput.value || "").trim().toLowerCase();
  const correctText = (q.choices[q.answer] || "").trim().toLowerCase();
  const ok = user === correctText || (correctText.includes(user) && user.length >= 3);
  if (ok) {
    score += 10;
    streak += 1;
    toast("Correct!");
    nextShort();
  } else {
    streak = 0;
    toast("Not quite. Try again or reveal.");
  }
  updateStats();
}

function revealShort() {
  const q = queue[qIndex];
  explainEl.innerHTML = `<strong>Answer:</strong> ${q.choices[q.answer]}<br>${q.explain || ""}`;
  explainEl.classList.remove("hidden");
}

function nextShort() {
  qIndex += 1;
  if (qIndex >= queue.length) {
    finish();
  } else {
    nextQuestion();
  }
}

function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
}

// ===== Shot helpers =====
function updateShotUI() {
  madeEl.textContent = made;
  attemptsEl.textContent = attempts;
  const pct = attempts === 0 ? 0 : Math.round((made / attempts) * 100);
  greenPctEl.textContent = `${pct}%`;
  const fillPct = Math.min(100, Math.max(0, pct));
  meterFill.style.width = `${fillPct}%`;
  meterFill.style.background = `hsl(${Math.min(120, fillPct)} 80% 45%)`;
  possessionEl.textContent = possession;
  maxPossEl.textContent = maxPossessions;
  playerPtsEl.textContent = playerPts;
}

function shotResultFromGreen(pct) {
  if (pct >= 90) return { make: true, points: 3, label: "Perfect release +3", anim: "swish" };
  if (pct >= 80) return { make: true, points: 2, label: "Green release +2", anim: "swish" };
  if (pct >= 60) return { make: Math.random() < 0.7, points: 2, label: "Good look", anim: "clank" };
  if (pct >= 40) return { make: Math.random() < 0.4, points: 2, label: "Tough shot", anim: "clank" };
  return { make: Math.random() < 0.15, points: 2, label: "Desperation heave", anim: "miss" };
}

function endShot() {
  lockAnswers();
  const pct = attempts === 0 ? 0 : Math.round((made / attempts) * 100);
  const outcome = shotResultFromGreen(pct);
  ball.classList.remove("swish", "clank", "miss");
  void ball.offsetWidth;
  ball.classList.add(outcome.anim);
  if (outcome.make) {
    playerPts += outcome.points;
    announcerEl.textContent = `${outcome.label} (meter ${pct}%)`;
    toast(`Bucket for ${outcome.points}.`);
  } else {
    announcerEl.textContent = `${outcome.label} (meter ${pct}%) - no good`;
    toast("No bucket that time.");
  }
  updateShotUI();
  nextPossessionBtn.classList.remove("hidden");
  finishShotGameBtn.classList.remove("hidden");
}

function nextPossession() {
  made = 0;
  attempts = 0;
  updateShotUI();
  announcerEl.textContent = `New possession ${possession + 1}/${maxPossessions}`;
  ball.classList.remove("swish", "clank", "miss");
  nextPossessionBtn.classList.add("hidden");
  finishShotGameBtn.classList.add("hidden");
  possession += 1;
  if (possession > maxPossessions) {
    finish();
    return;
  }
  timeLeft = 10;
  timeEl.textContent = `${timeLeft}s`;
  clearTimer();
  timerId = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearTimer();
      endShot();
    }
  }, 1000);
  nextQuestion();
}

// ===== Study deck =====
function renderStudy() {
  const deck = queue
    .map(
      (q, i) => `
<div class="panel-card">
  <div class="tag">${q.topic}</div>
  <div style="font-weight:900;margin:6px 0;color:#fff">${i + 1}. ${q.q}</div>
  <details><summary>Show answer</summary>
    <ul>
      ${q.choices
        .map(
          (choice, idx) =>
            `<li${idx === q.answer ? ' style="font-weight:700;color:var(--good)"' : ""}>${String.fromCharCode(
              65 + idx
            )}. ${choice}</li>`
        )
        .join("")}
    </ul>
    <div class="explain">${q.explain || ""}</div>
  </details>
</div>`
    )
    .join("");
  el("studyDeck").innerHTML = deck || '<div class="subtitle">No cards. Select topics and try again.</div>';
}

// ===== Finish =====
function finish() {
  let message = "Game over.";
  if (mode === "SHOT") {
    message = `Final score: ${playerPts} points across ${maxPossessions} possessions.`;
  } else if (mode === "MCQ" || mode === "SHORT") {
    const pct = queue.length ? Math.round((score / (queue.length * 10)) * 100) : 0;
    message = `Game over - ${pct}%`;
  } else if (mode === "BASE") {
    const summary = getBaseSummary();
    // Show in-view game over panel instead of jumping home
    const over = document.getElementById("baseGameOver");
    const msg = document.getElementById("baseOverMsg");
    const replay = document.getElementById("baseReplayBtn");
    const exit = document.getElementById("baseExitBtn");
    if (over && msg && replay && exit) {
      showView("BASE");
      over.classList.remove("hidden");
      msg.textContent = `Base destroyed on level ${summary.wave} wave ${summary.subWave}.`;
      replay.onclick = () => {
        over.classList.add("hidden");
        resetBaseSession();
      };
      exit.onclick = () => {
        over.classList.add("hidden");
        showDashboard();
      };
      return;
    } else {
      message = `Base destroyed on level ${summary.wave} wave ${summary.subWave}.`;
    }
  }
  toast(message);
  clearTimer();
  teardownBaseDefense();
  showDashboard();
}

// ===== Event wiring =====
el("startBtn").onclick = startGame;
el("shortBtn").onclick = startShort;
el("shotBtn").onclick = () => startShot(true);
el("baseBtn").onclick = startBase;
el("studyBtn").onclick = startStudy;
homeBrand?.addEventListener("click", showDashboard);

el("skipBtn").onclick = () => {
  streak = 0;
  if (mode === "SHOT") {
    attempts += 1;
    updateShotUI();
  }
  if (mode === "BASE") {
    handleBaseSkip();
  }
  qIndex += 1;
  nextQuestion();
};

el("nextBtn").onclick = () => {
  qIndex += 1;
  nextQuestion();
};

el("checkShortBtn").onclick = checkShort;
el("revealShortBtn").onclick = revealShort;
nextPossessionBtn.onclick = nextPossession;
finishShotGameBtn.onclick = finish;

// ===== Base Defense bootstrap =====
initBaseDefense({
  elements: baseElements,
  toast,
  onFinish: () => finish()
});

// Base wave events → pause/resume timers
document.addEventListener('base:startWave', () => {
  if (mode === 'BASE') {
    clearTimer();
    timeEl.textContent = '--';
  }
});
document.addEventListener('base:waveClear', () => {
  if (mode === 'BASE') {
    resetQuestionTimerForCurrentMode();
  }
});
document.addEventListener('base:gameOver', () => {
  if (mode === 'BASE') {
    clearTimer();
    timeEl.textContent = '--';
  }
});

// ===== Init =====
(function init() {
  renderTopicOptions();
  buildQueue();
  showDashboard();
})();
