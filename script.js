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
const categoriesContainer = document.getElementById("categories-container");
const leaderboardContainer = document.getElementById("leaderboard-container");

// Afficher catégories dynamiquement
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// 🔹 Fonctions d'affichage
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
  document.getElementById("personnage-image").src = currentPerso.img;
  document.getElementById("answer").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
  document.getElementById("best-score").textContent = "Record : " + bestScore;
}

// 🔹 Vérifier réponse
function verifierReponse() {
  if (!currentPerso) return;
  const answerInput = document.getElementById("answer");
  const reponse = answerInput.value.trim().toLowerCase();
  let lastResult = "";

  if (reponse === currentPerso.nom.toLowerCase()) {
    score++;
    lastResult = "✅ Bonne réponse !";
  } else {
    lives--;
    lastResult = `❌ Mauvaise réponse. C'était ${currentPerso.nom}`;
  }

  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;

  personnages = personnages.filter(p => p !== currentPerso);

  if (lives <= 0 || personnages.length === 0) {
    terminerQuiz(lastResult);
  } else {
    document.getElementById("result").textContent = lastResult;
    afficherPerso();
  }
}

// 🔹 Terminer quiz
function terminerQuiz(lastResult = "") {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    // lancerConfettis(); // si tu as la fonction confettis
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

  document.getElementById("rejouer").addEventListener("click", rejouerQuiz);

  if (window.currentUser) updateLeaderboard(score);
}

// 🔹 Fonction Rejouer
function rejouerQuiz() {
  // Reset variables
  score = 0;
  lives = 3;
  currentPerso = null;
  personnages = [];
  
  // Reset input et décocher catégories
  const checkboxes = document.querySelectorAll("#categories-container input[type='checkbox']");
  checkboxes.forEach(cb => cb.checked = false);

  // Réafficher accueil
  accueil.classList.remove("hidden");
  quiz.classList.add("hidden");

  // Restaurer contenu initial du quiz
  quiz.innerHTML = `
    <div id="score-container">
      <span id="best-score">Record : ${bestScore}</span>
      <div id="score-lives">Score: <span id="score">0</span> | Life: <span id="lives">3</span></div>
    </div>
    <div class="personnage-container">
      <img id="personnage-image" src="" alt="Personnage">
    </div>
    <div class="answer-container">
      <input type="text" id="answer" placeholder="Tape le nom...">
      <button id="validate" class="btn btn-validate">Valider</button>
    </div>
    <p id="result"></p>
  `;
}

// 🔹 Démarrer quiz
startBtn.addEventListener("click", () => {
  score = 0;
  lives = 3;
  currentPerso = null;

  hideCategorySelection();

  const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked"))
    .map(cb => cb.value);

  personnages = selected.flatMap(cat => categories[cat] || []);
  if (personnages.length === 0) personnages = Object.values(categories).flat();

  quiz.classList.remove("hidden");
  accueil.classList.add("hidden");

  afficherPerso();

  // Réattacher listeners
  const validateBtn = document.getElementById("validate");
  const answerInput = document.getElementById("answer");

  validateBtn.addEventListener("click", verifierReponse);

  answerInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      validateBtn.click();
    }
  });
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

// Charger leaderboard au départ
document.addEventListener("DOMContentLoaded", () => {
  if (leaderboardContainer) {
    leaderboardContainer.style.display = "block";
    updateLeaderboard(0);
  }
});
