// 🔹 Variables globales
const categories = { 
  "Akame ga Kill": [
    { nom: "Run", img: "images/Akame ga Kill/Run.jpg" },
    { nom: "Liver", img: "images/Akame ga Kill/Liver.jpg" }
  ],
  "Dragon Ball": [
    { nom: "Pagos", img: "images/Dragon Ball/Pagos.jpg" },
    { nom: "Krillin", img: "images/Dragon Ball/Kuririn.jpg" },
    { nom: "Suppaman", img: "images/Dragon Ball/Suppaman.jpg" },
    { nom: "Yajirobe", img: "images/Dragon Ball/Yajirobe.jpg" },
    { nom: "Baba", img: "images/Dragon Ball/Baba.jpg" },
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
let bestScore = 0;

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

// 🔹 Firebase Firestore
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp, query, collection, orderBy, limit, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore();

// 🔹 Afficher scores initiaux
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// 🔹 Générer catégories dynamiquement
function renderCategories() {
  categoriesContainer.innerHTML = "";
  for (let cat in categories) {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
    categoriesContainer.appendChild(label);
  }
}

// 🔹 Cacher / afficher catégories
function hideCategorySelection() {
  accueil.querySelector("h2")?.style.display = "none";
  document.getElementById("categories-form")?.style.display = "none";
  startBtn.style.display = "none";
  leaderboardContainer.style.display = "none";
}

function showCategorySelection() {
  accueil.querySelector("h2")?.style.display = "block";
  document.getElementById("categories-form")?.style.display = "block";
  startBtn.style.display = "inline-block";
  leaderboardContainer.style.display = "block";
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
async function terminerQuiz(lastResult = "") {
  resultText.textContent = lastResult;

  // Mettre à jour bestScore si connecté
  if (window.currentUser) {
    const userRef = doc(db, "Scores", window.currentUser.uid);
    const userSnap = await getDoc(userRef);

    let userData = { pseudo: window.currentUser.displayName, bestscore: score, lastPlayed: serverTimestamp(), scoresHistory: [{score, date: serverTimestamp()}] };

    if (userSnap.exists()) {
      const data = userSnap.data();
      const newBest = Math.max(data.bestscore || 0, score);
      userData.bestscore = newBest;
      userData.scoresHistory = arrayUnion({score, date: serverTimestamp()});
      await updateDoc(userRef, {
        bestscore: newBest,
        lastPlayed: serverTimestamp(),
        scoresHistory: arrayUnion({score, date: serverTimestamp()})
      });
    } else {
      await setDoc(userRef, userData);
    }

    bestScore = Math.max(bestScore, score);
    bestScoreSpan.textContent = "Record : " + bestScore;
    updateLeaderboard(); // Mise à jour du leaderboard
  }

  // Bloc fin quiz
  let finQuiz = document.getElementById("fin-quiz");
  if (!finQuiz) {
    finQuiz = document.createElement("div");
    finQuiz.id = "fin-quiz";
    finQuiz.classList.add("quiz-end-card");
    finQuiz.innerHTML = `
      <h2>Fin d'aventure</h2>
      <p class="result-text">${lastResult}</p>
      <p class="score-text">🎯 Score : <span>${score}</span></p>
      <p class="best-text">🏆 Record : <span>${bestScore}</span></p>
      <button id="rejouer" class="btn-rejouer">🔄 Rejouer</button>
    `;
    quiz.parentNode.appendChild(finQuiz);
  } else {
    finQuiz.querySelector(".result-text").textContent = lastResult;
    finQuiz.querySelector(".score-text span").textContent = score;
    finQuiz.querySelector(".best-text span").textContent = bestScore;
  }

  finQuiz.classList.remove("hidden");
  quiz.classList.add("hidden");

  document.getElementById("rejouer").addEventListener("click", rejouerQuiz);
}

// 🔹 Réinitialiser quiz
function rejouerQuiz() {
  score = 0;
  lives = 3;
  currentPerso = null;

  answerInput.value = "";
  document.querySelectorAll("#categories-container input[type=checkbox]").forEach(cb => cb.checked = false);

  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  resultText.textContent = "";
  imgPerso.src = "";

  document.getElementById("fin-quiz")?.classList.add("hidden");

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
  accueil.classList.add("hidden");

  imgPerso.src = "";
  answerInput.value = "";
  resultText.textContent = "";
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  bestScoreSpan.textContent = "Record : " + bestScore;

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
async function updateLeaderboard() {
  if (!leaderboardContainer) return;

  const scoresQuery = query(collection(db, "Scores"), orderBy("bestscore", "desc"), limit(25));
  const querySnapshot = await getDocs(scoresQuery);

  const tbody = leaderboardContainer.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = "";

  let rank = 1;
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${rank}</td><td>${data.pseudo}</td><td>${data.bestscore}</td>`;
    tbody.appendChild(tr);
    rank++;
  });
}

// 🔹 Initialisation
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  showCategorySelection();
});
