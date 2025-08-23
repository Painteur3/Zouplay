// 🔹 Variables globales
const categories = { 
  "Akame ga Kill": [
    { nom: "Run", img: "images/Akame ga Kill/Run.jpg" },
    { nom: "Liver", img: "images/Akame ga Kill/Liver.jpg" }
  ],
  "Black Clover": [
    { nom: "Baro", img: "images/Black Clover/Baro.jpg" },
    { nom: "Acier", img: "images/Black Clover/Acier.jpg" }
  ]
};

let personnages = [];
let currentPerso = null;
let score = 0;
let lives = 3;
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
let confettiAnimation;

// DOM
const accueil = document.getElementById("accueil");
const quiz = document.getElementById("quiz");
const startBtn = document.getElementById("start-quiz");
const imgPerso = document.getElementById("personnage-image");
const answerInput = document.getElementById("answer");
const resultText = document.getElementById("result");
const validateBtn = document.getElementById("validate");
const scoreSpan = document.getElementById("score");
const livesSpan = document.getElementById("lives");
const bestScoreSpan = document.getElementById("best-score");
const leaderboardContainer = document.getElementById("leaderboard-container");

// Afficher scores initiaux
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// Générer catégories dynamiquement
const categoriesContainer = document.getElementById("categories-container");
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// 🔹 Fonctions pour cacher / afficher sélection
function hideCategorySelection() {
  const categoriesForm = document.getElementById("categories-form");
  const startBtn = document.getElementById("start-quiz");
  if (categoriesForm) categoriesForm.classList.add("hidden");
  if (startBtn) startBtn.classList.add("hidden");
}

function showCategorySelection() {
  const categoriesForm = document.getElementById("categories-form");
  const startBtn = document.getElementById("start-quiz");
  if (categoriesForm) categoriesForm.classList.remove("hidden");
  if (startBtn) startBtn.classList.remove("hidden");
}

// 🔹 Afficher personnage
function afficherPerso() {
  if (personnages.length === 0) return;
  currentPerso = personnages[Math.floor(Math.random() * personnages.length)];
  imgPerso.src = currentPerso.img;
  answerInput.value = "";
}

// 🔹 Vérifier réponse
function verifierReponse() {
  if (!currentPerso) return;
  const reponse = answerInput.value.trim().toLowerCase();
  let lastResult = "";

  if (reponse === currentPerso.nom.toLowerCase()) {
    score++;
    lastResult = "✅ Bonne réponse !";
  } else {
    lives--;
    lastResult = `❌ Mauvaise réponse. C'était ${currentPerso.nom}`;
  }

  scoreSpan.textContent = score;
  livesSpan.textContent = lives;

  personnages = personnages.filter(p => p !== currentPerso);

  if (lives <= 0 || personnages.length === 0) {
    terminerQuiz(lastResult);
  } else {
    resultText.textContent = lastResult;
  }
}

// 🔹 Terminer quiz
function terminerQuiz(lastResult = "") {
  showCategorySelection();

  const newBest = score > bestScore;
  if (newBest) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    lancerConfettis();
  }

  quiz.innerHTML = `
    <div class="quiz-end-card">
      <h2>Fin d'aventure</h2>
      ${lastResult ? `<p class="result-text">${lastResult}</p>` : ""}
      <p class="score-text">🎯 Score : <span>${score}</span></p>
      <p class="best-text">🏆 Record : <span>${bestScore}</span></p>
      <button id="rejouer" class="btn-rejouer">🔄 Rejouer</button>
    </div>
  `;

  document.getElementById("rejouer").addEventListener("click", () => location.reload());

  if (window.currentUser) updateLeaderboard(score);
}

// 🔹 Démarrer quiz
startBtn.addEventListener("click", () => {
  score = 0;
  lives = 3;
  currentPerso = null;

  hideCategorySelection();

  const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked"))
    .map(cb => cb.value);

  personnages = selected.flatMap(cat => categories[cat]);
  if (personnages.length === 0) {
    personnages = Object.values(categories).flat();
  }

  accueil.classList.add("hidden");
  quiz.classList.remove("hidden");

  imgPerso.src = "";
  answerInput.value = "";
  resultText.textContent = "";
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  bestScoreSpan.textContent = "Meilleur score : " + bestScore;

  afficherPerso();
  answerInput.focus();
});

// 🔹 Bouton valider
validateBtn.addEventListener("click", () => {
  verifierReponse();
  if (personnages.length > 0 && lives > 0) afficherPerso();
});

// 🔹 Entrée clavier Enter
answerInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    validateBtn.classList.add('click-effect');
    setTimeout(() => validateBtn.classList.remove('click-effect'), 150);
    validateBtn.click();
  }
});

// 🔹 Leaderboard
function updateLeaderboard(score){
  const div = leaderboardContainer;
  if(!div) return;

  let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.push({user: window.currentUser?.displayName || "Invité", score, date: Date.now()});
  scores.sort((a,b)=> b.score - a.score);
  scores = scores.slice(0,25);
  localStorage.setItem("leaderboard", JSON.stringify(scores));

  const tbody = div.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = "";
  scores.forEach((s,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${s.user}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}
