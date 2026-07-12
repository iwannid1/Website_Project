// script.js
// All app behavior lives here: rendering the current card, flipping it,
// grading words as "known" / "still learning", saving that progress to
// localStorage so it survives page reloads, and switching between
// "All Words" and "Practice Still Learning" modes.

const STORAGE_KEY = "flashespanol-progress";

// progress = { [wordId]: "known" | "learning" }
let progress = loadProgress();

// Which subset of WORD_DECK we're currently cycling through.
let activeDeck = [...WORD_DECK];
let currentIndex = 0;
let isFlipped = false;
let mode = "all"; // "all" | "practice"

// --- DOM references ---
const cardEl = document.getElementById("flash-card");
const spanishWordEl = document.getElementById("spanish-word");
const englishWordEl = document.getElementById("english-word");
const cardCounterEl = document.getElementById("card-counter");
const emptyStateEl = document.getElementById("empty-state");
const cardSceneEl = document.getElementById("card-scene");

const knowItBtn = document.getElementById("know-it-btn");
const stillLearningBtn = document.getElementById("still-learning-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const resetBtn = document.getElementById("reset-btn");

const modeAllBtn = document.getElementById("mode-all-btn");
const modePracticeBtn = document.getElementById("mode-practice-btn");

const knownCountEl = document.getElementById("known-count");
const learningCountEl = document.getElementById("learning-count");
const totalCountEl = document.getElementById("total-count");
const progressBarFillEl = document.getElementById("progress-bar-fill");

// --- Persistence helpers ---
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Could not read saved progress, starting fresh.", err);
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// --- Deck helpers ---
function buildActiveDeck() {
  if (mode === "practice") {
    activeDeck = WORD_DECK.filter((w) => progress[w.id] !== "known");
  } else {
    activeDeck = [...WORD_DECK];
  }
  currentIndex = 0;
}

function shuffleActiveDeck() {
  for (let i = activeDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeDeck[i], activeDeck[j]] = [activeDeck[j], activeDeck[i]];
  }
  currentIndex = 0;
  renderCard();
}

// --- Rendering ---
function renderCard() {
  isFlipped = false;
  cardEl.classList.remove("flipped");

  if (activeDeck.length === 0) {
    cardSceneEl.hidden = true;
    emptyStateEl.hidden = false;
    cardCounterEl.textContent = "";
    document.querySelector(".grade-buttons").style.visibility = "hidden";
    return;
  }

  cardSceneEl.hidden = false;
  emptyStateEl.hidden = true;
  document.querySelector(".grade-buttons").style.visibility = "visible";

  const word = activeDeck[currentIndex];
  spanishWordEl.textContent = word.spanish;
  englishWordEl.textContent = word.english;
  cardCounterEl.textContent = `Card ${currentIndex + 1} of ${activeDeck.length}`;
}

function renderStats() {
  const total = WORD_DECK.length;
  const known = Object.values(progress).filter((v) => v === "known").length;
  const learning = Object.values(progress).filter((v) => v === "learning").length;

  knownCountEl.textContent = known;
  learningCountEl.textContent = learning;
  totalCountEl.textContent = total;

  const pct = total === 0 ? 0 : Math.round((known / total) * 100);
  progressBarFillEl.style.width = `${pct}%`;
}

function renderModeButtons() {
  modeAllBtn.classList.toggle("active", mode === "all");
  modePracticeBtn.classList.toggle("active", mode === "practice");
}

function renderAll() {
  buildActiveDeck();
  renderCard();
  renderStats();
  renderModeButtons();
}

// --- Navigation ---
function goToNextCard() {
  if (activeDeck.length === 0) return;
  currentIndex = (currentIndex + 1) % activeDeck.length;
  renderCard();
}

function goToPrevCard() {
  if (activeDeck.length === 0) return;
  currentIndex = (currentIndex - 1 + activeDeck.length) % activeDeck.length;
  renderCard();
}

// --- Grading ---
function gradeCurrentWord(status) {
  if (activeDeck.length === 0) return;
  const word = activeDeck[currentIndex];
  progress[word.id] = status;
  saveProgress();
  renderStats();

  // In practice mode, marking a word "known" removes it from the deck.
  if (mode === "practice" && status === "known") {
    activeDeck.splice(currentIndex, 1);
    if (currentIndex >= activeDeck.length) currentIndex = 0;
    renderCard();
  } else {
    goToNextCard();
  }
}

// --- Event listeners ---
cardEl.addEventListener("click", () => {
  if (activeDeck.length === 0) return;
  isFlipped = !isFlipped;
  cardEl.classList.toggle("flipped", isFlipped);
});

knowItBtn.addEventListener("click", () => gradeCurrentWord("known"));
stillLearningBtn.addEventListener("click", () => gradeCurrentWord("learning"));

nextBtn.addEventListener("click", goToNextCard);
prevBtn.addEventListener("click", goToPrevCard);
shuffleBtn.addEventListener("click", shuffleActiveDeck);

modeAllBtn.addEventListener("click", () => {
  mode = "all";
  renderAll();
});

modePracticeBtn.addEventListener("click", () => {
  mode = "practice";
  renderAll();
});

resetBtn.addEventListener("click", () => {
  if (confirm("Reset all progress? This can't be undone.")) {
    progress = {};
    saveProgress();
    renderAll();
  }
});

// --- Init ---
renderAll();
