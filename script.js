import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp, query, collection, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxGh9xsAFoqNhtNwPuqsE8oi9hdcbo9Zk",
  authDomain: "quiz-anime-3c4e7.firebaseapp.com",
  projectId: "quiz-anime-3c4e7",
  storageBucket: "quiz-anime-3c4e7.appspot.com",
  messagingSenderId: "469629091409",
  appId: "1:469629091409:web:790357c7bed5cfac6dc270"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    { nom: "Baba", img: "images/Dragon Ball/Baba.jpg" }
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

// 🔹 Générer catégories dynamiquement
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}
showCategorySelection();

// 🔹 Afficher / cacher catégories
function hideCategorySelection() {
  accueil.querySelector("h2")?.style.setProperty("display","none");
  document.getElementById("categories-form")?.style.setProperty("display","none");
  startBtn.style.setProperty("display","none");
  if(leaderboardContainer) leaderboardContainer.style.display = "none";
}
function showCategorySelection() {
  accueil.querySelector("h2")?.style.setProperty("display","block");
  document.getElementById("categories-form")?.style.setProperty("display","block");
  startBtn.style.setProperty("display","inline-block");
  if(leaderboardContainer) leaderboardContainer.style.display = "block";
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

  // Mettre à jour Firestore si utilisateur connecté
  if (window.currentUser) {
    const userRef = doc(db, "Scores", window.currentUser.uid);
    const userSnap = await getDoc(userRef);

    let data = {
      pseudo: window.currentUser.displayName || window.currentUser.email,
      bestscore: score,
      lastPlayed: Timestamp.now(),
      scoresHistory: [{ score, date: Timestamp.now() }]
    };

    if (userSnap.exists()) {
      const oldData = userSnap.data();
      data.bestscore = Math.max(oldData.bestscore || 0, score);
      data.scoresHistory = [...(oldData.scoresHistory || []), { score, date: Timestamp.now() }];
      data.lastPlayed = Timestamp.now();
      await setDoc(userRef, data);
    } else {
      await setDoc(userRef, data);
    }

    bestScore = data.bestscore;
  }

  bestScoreSpan.textContent = "Record : " + bestScore;

  // Bloc fin de quiz
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

  const rejouerBtn = document.getElementById("rejouer");
  rejouerBtn.addEventListener("click", rejouerQuiz);

  if (window.currentUser) updateLeaderboard("total");
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
  const finQuiz = document.getElementById("fin-quiz");
  if (finQuiz) finQuiz.classList.add("hidden");
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
  if (personnages.length === 0) personnages = Object.values(categories).flat();

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

// 🔹 Leaderboard Firestore
async function updateLeaderboard(period="total") {
  if(!leaderboardContainer) return;
  const tbody = leaderboardContainer.querySelector('tbody');
  if(!tbody) return;

  const scoresCol = collection(db, "Scores");
  const q = query(scoresCol, orderBy("bestscore","desc"), limit(25));
  const querySnap = await getDocs(q);

  tbody.innerHTML = "";
  let i=0;
  querySnap.forEach(docSnap => {
    const data = docSnap.data();
    tbody.innerHTML += `<tr><td>${i+1}</td><td>${data.pseudo}</td><td>${data.bestscore}</td></tr>`;
    i++;
  });
}

// 🔹 Affiche leaderboard dès le chargement
document.addEventListener("DOMContentLoaded", () => {
  leaderboardContainer.style.display = "block";
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  bestScoreSpan.textContent = "Record : " + bestScore;
});
