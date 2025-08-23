// ===============================
// VARIABLES GLOBALES
// ===============================
let categories = {
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
const categoriesContainer = document.getElementById("categories-container");

// ===============================
// AFFICHAGE DES SCORES INITIAUX
// ===============================
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// ===============================
// GENERATION DES CATEGORIES
// ===============================
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// ===============================
// FIRESTORE INITIALISATION
// ===============================
import { getFirestore, collection, addDoc, query, orderBy, limit, where, getDocs, Timestamp } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

// ===============================
// QUIZ FUNCTIONS
// ===============================
function afficherPerso() {
  if (personnages.length === 0) return;
  currentPerso = personnages[Math.floor(Math.random() * personnages.length)];
  imgPerso.src = currentPerso.img;
  answerInput.value = "";
}

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

async function terminerQuiz(lastResult = "") {
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

  document.getElementById("rejouer").addEventListener("click", () => {
    location.reload();
  });

  // Mettre à jour Firestore si utilisateur connecté
  onAuthStateChanged(auth, async user => {
    if (user) {
      try {
        await addDoc(collection(db, "Scores"), {
          Pseudo: user.displayName || user.email,
          bestscore: score,
          lastPlayed: Timestamp.fromDate(new Date())
        });
        afficherLeaderboard();
      } catch (error) {
        console.error("Erreur ajout score:", error);
      }
    }
  });
}

// ===============================
// START QUIZ
// ===============================
startBtn.addEventListener("click", () => {
  score = 0;
  lives = 3;
  currentPerso = null;

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

// VALIDER REPONSE
validateBtn.addEventListener("click", () => {
  verifierReponse();
  if (personnages.length > 0 && lives > 0) {
    afficherPerso();
  }
});

// ENTER key pour valider
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    validateBtn.classList.add("click-effect");
    setTimeout(() => validateBtn.classList.remove("click-effect"), 150);
    validateBtn.click();
  }
});

// ===============================
// LEADERBOARD
// ===============================
async function getTopScores(period) {
  const now = new Date();
  let startDate;

  switch(period) {
    case "jour":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "semaine":
      const firstDay = now.getDate() - now.getDay(); // dimanche
      startDate = new Date(now.getFullYear(), now.getMonth(), firstDay);
      break;
    case "mois":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "total":
      startDate = null;
      break;
  }

  let q;
  if(startDate){
    q = query(collection(db, "Scores"),
      where("lastPlayed", ">=", Timestamp.fromDate(startDate)),
      orderBy("lastPlayed", "desc"),
      orderBy("bestscore", "desc"),
      limit(25));
  } else {
    q = query(collection(db, "Scores"),
      orderBy("bestscore", "desc"),
      limit(25));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

async function afficherLeaderboard() {
  const user = auth.currentUser;
  if(!user) return; // seulement pour utilisateurs connectés

  const periods = ["jour", "semaine", "mois", "total"];
  let html = `<div class="leaderboard-container" style="display:flex;justify-content:center;gap:15px;margin-top:20px;">`;

  for(const period of periods){
    const topScores = await getTopScores(period);
    html += `<div class="leaderboard" style="background:#fff;padding:10px 15px;border-radius:12px;box-shadow:0 3px 6px rgba(0,0,0,0.1);flex:1;">
      <h3 style="text-align:center;color:#f5be48;text-shadow:0 0 3px #ff6600;">${period.toUpperCase()}</h3>
      <ol style="padding-left:20px;margin-top:5px;">`;
    topScores.forEach(s => {
      html += `<li>${s.Pseudo} : ${s.bestscore}</li>`;
    });
    html += `</ol></div>`;
  }
  html += `</div>`;
  
  // Insérer sous le bouton COMMENCER LE QUIZ
  startBtn.insertAdjacentHTML('afterend', html);
}

// ===============================
// CONFETTIS ET PARTICULES
// ===============================
function lancerConfettis() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const confettis = [];
  const colors = ["#f94144","#f3722c","#f9c74f","#90be6d
