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
const categoriesContainer = document.getElementById("categories-container");

// Afficher scores initiaux
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// Générer catégories dynamiquement
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// 🔹 Fonctions cacher / afficher accueil
function hideCategorySelection() {
  accueil.querySelector("h2").style.display = "none";
  document.getElementById("categories-form").style.display = "none";
  startBtn.style.display = "none";
  leaderboardContainer.style.display = "none";
}

function showCategorySelection() {
  accueil.querySelector("h2").style.display = "block";
  document.getElementById("categories-form").style.display = "block";
  startBtn.style.display = "inline-block";
  leaderboardContainer.style.display = "block";
}

// 🔹 Afficher personnage
function afficherPerso() {
  if (personnages.length === 0) return;
  currentPerso = personnages[Math.floor(Math.random() * personnages.length)];
  imgPerso.src = currentPerso.img;
  answerInput.value = "";
  answerInput.focus();
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
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    // lancerConfettis(); // si tu as une fonction confetti
  }

  resultText.textContent = lastResult;
  document.getElementById("score").textContent = score;
  document.getElementById("best-score").textContent = "Record : " + bestScore;

  // Masquer quiz et accueil
  quiz.classList.add("hidden");
  accueil.classList.remove("hidden");
  showCategorySelection();

  // Mettre à jour leaderboard si connecté
  if (window.currentUser) updateLeaderboard(score);
}

// 🔹 Réinitialiser quiz (bouton Rejouer)
function rejouerQuiz() {
  // Reset variables
  score = 0;
  lives = 3;
  currentPerso = null;
  personnages = [];

  // Réinitialiser UI
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  bestScoreSpan.textContent = "Record : " + bestScore;
  resultText.textContent = "";
  imgPerso.src = "";

  // Décocher toutes les catégories
  document.querySelectorAll("#categories-container input[type='checkbox']").forEach(cb => cb.checked = false);

  // Afficher accueil, masquer quiz
  accueil.classList.remove("hidden");
  quiz.classList.add("hidden");
  showCategorySelection();
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

  quiz.classList.remove("hidden");
  imgPerso.src = "";
  answerInput.value = "";
  resultText.textContent = "";
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  bestScoreSpan.textContent = "Record : " + bestScore;

  afficherPerso();
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
  if(!leaderboardContainer) return;

  let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.push({user: window.currentUser?.displayName || "Invité", score, date: Date.now()});
  scores.sort((a,b)=> b.score - a.score);
  scores = scores.slice(0,25);
  localStorage.setItem("leaderboard", JSON.stringify(scores));

  const tbody = leaderboardContainer.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = "";
  scores.forEach((s,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${s.user}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}

// 🔹 Initialisation
document.addEventListener("DOMContentLoaded", () => {
  if (leaderboardContainer) {
    leaderboardContainer.style.display = "block";
    updateLeaderboard(0);
  }

  // Bouton Rejouer
  document.body.addEventListener("click", e => {
    if(e.target && e.target.id === "rejouer") {
      rejouerQuiz();
    }
  });
});
