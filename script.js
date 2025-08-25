// 🔹 Catégories et personnages
const categories = { 
  "Akame ga Kill": [
    { "nom": "Chouri", "img": "images/Akame ga Kill/Chouri.jpg" }
  ],
  "Black Clover": [
    { "nom": "Baro", "img": "images/Black Clover/Baro.jpg" },
    { "nom": "Yagos", "img": "images/Black Clover/Yagos.jpg" },
    { "nom": "Orsi", "img": "images/Black Clover/Orsi.jpg" },
    { "nom": "Mereoleona", "img": "images/Black Clover/Mereoleona.jpg" }
  ]
};

let personnages = [], currentPerso = null, score = 0, lives = 3;
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;

// 🔹 DOM elements
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
const factText = document.getElementById("fun-fact-text");

// 🔹 Effets sonores
const victorySound = new Audio("sounds/victory.mp3");

// 🔹 Canvas confetti
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particleCount = 60, particles = [], recordAnimationActive = false;

// 🔹 Affichage scores initiaux
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// 🔹 Générer dynamiquement les catégories
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// 🔹 Restaurer les dernières catégories sélectionnées
const lastCategories = JSON.parse(localStorage.getItem("lastCategories") || "[]");
document.querySelectorAll("#categories-container input[type=checkbox]").forEach(cb => {
  if (lastCategories.includes(cb.value)) cb.checked = true;
});

// 🔹 Affichage / catégories
function hideCategorySelection() {
  const adventureTitle = accueil.querySelector("h2");
  const categoriesForm = document.getElementById("categories-form");
  const leaderboard = document.getElementById("leaderboard-container");
  if (adventureTitle) adventureTitle.style.display = "none";
  if (categoriesForm) categoriesForm.style.display = "none";
  if (startBtn) startBtn.style.display = "none";
  if (leaderboard) leaderboard.style.display = "none";
}
function showCategorySelection() {
  const adventureTitle = accueil.querySelector("h2");
  const categoriesForm = document.getElementById("categories-form");
  const leaderboard = document.getElementById("leaderboard-container");
  if (adventureTitle) adventureTitle.style.display = "block";
  if (categoriesForm) categoriesForm.style.display = "block";
  if (startBtn) startBtn.style.display = "inline-block";
  if (leaderboard) leaderboard.style.display = "block";
}

// Assure que le champ de réponse est vide au départ
answerInput.value = "";
// 🔹 Quiz
function afficherPerso() {
  if (!personnages.length) return;
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

// 🔹 Fin / Réinitialisation quiz
function terminerQuiz(lastResult = "") {
  resultText.textContent = lastResult;
  let beatRecord = false;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestScoreSpan.textContent = "Record : " + bestScore;
    beatRecord = true;
  }
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
  if (beatRecord) { victorySound.currentTime=0; victorySound.play(); startRecordAnimation(); }
}
function rejouerQuiz() {
  score=0; lives=3; currentPerso=null;
  answerInput.value=""; 
  document.querySelectorAll("#categories-container input[type=checkbox]").forEach(cb=>cb.checked=false);
  scoreSpan.textContent=score; livesSpan.textContent=lives; resultText.textContent=""; imgPerso.src="";
  const finQuiz = document.getElementById("fin-quiz"); if(finQuiz) finQuiz.classList.add("hidden");
  accueil.classList.remove("hidden"); quiz.classList.add("hidden");
  showCategorySelection();

  const lastCategories = JSON.parse(localStorage.getItem("lastCategories") || "[]");
  document.querySelectorAll("#categories-container input[type=checkbox]").forEach(cb => {
    cb.checked = lastCategories.includes(cb.value);
  });
}

// 🔹 Événements quiz
startBtn.addEventListener("click", () => {
  score=0; lives=3; currentPerso=null; hideCategorySelection();
  const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked")).map(cb=>cb.value);
  localStorage.setItem("lastCategories", JSON.stringify(selected));
  personnages = selected.length ? selected.flatMap(cat=>categories[cat]) : Object.values(categories).flat();
  quiz.classList.remove("hidden"); accueil.classList.add("hidden");
  imgPerso.src=""; answerInput.value=""; resultText.textContent="";
  scoreSpan.textContent=score; livesSpan.textContent=lives; bestScoreSpan.textContent="Record : "+bestScore;
  afficherPerso(); answerInput.focus();
});
validateBtn.addEventListener("click", ()=>{ verifierReponse(); if(personnages.length>0 && lives>0) afficherPerso(); });
answerInput.addEventListener('keydown', event => { if(event.key==='Enter'){ event.preventDefault(); validateBtn.classList.add('click-effect'); setTimeout(()=>validateBtn.classList.remove('click-effect'),150); validateBtn.click(); } });

// 🔹 Particules / Confetti
function initParticles() {
  particles=[]; for(let i=0;i<particleCount;i++){ particles.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, radius:Math.random()*4+2, baseRadius:Math.random()*4+2, speedY:Math.random()*1+0.3, speedX:(Math.random()-0.5)*0.5, alpha:Math.random()*0.5+0.3, color:`rgba(245,190,72,${Math.random()*0.5+0.3})` }); }
}
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{ const scale=recordAnimationActive?(0.9+Math.random()*0.2):1; const r=p.baseRadius*scale;
    ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=p.color; ctx.fill();
    p.y-=p.speedY; p.x+=p.speedX;
    if(p.y+r<0){ p.y=canvas.height+r; p.x=Math.random()*canvas.width; }
  });
  requestAnimationFrame(animateParticles);
}
initParticles(); animateParticles();
window.addEventListener('resize',()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; if(!recordAnimationActive) initParticles(); });
function startRecordAnimation(){
  recordAnimationActive=true; initParticles();
  const victoryColors=["rgba(245,190,72,0.8)","rgba(255,80,80,0.8)","rgba(80,180,255,0.8)","rgba(80,255,120,0.8)","rgba(180,80,255,0.8)"];
  let colorIndex=0;
  const colorInterval=setInterval(()=>{ if(!recordAnimationActive) return; particles.forEach(p=>p.color=victoryColors[colorIndex]); colorIndex=(colorIndex+1)%victoryColors.length; },200);
  setTimeout(()=>{ recordAnimationActive=false; clearInterval(colorInterval); initParticles(); },5000);
}

// 🔹 Faits amusants
const facts=[ /* ton tableau facts ici */ ];
let index=0;
function showFact(){ factText.style.opacity=0; setTimeout(()=>{ factText.textContent=facts[index]; factText.style.opacity=1; index=(index+1)%facts.length; },1200); }
showFact(); setInterval(showFact,11000);

// 🔹 Firebase : Demande d'anime
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://quiz-anime-3c4e7-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// -- Première demande (request1) --
const animeRequestInput = document.getElementById("anime-request-input");
const animeRequestBtn = document.getElementById("anime-request-btn");

// S'assure que la valeur initiale est vide
animeRequestInput.value = "";

animeRequestBtn.addEventListener("click", () => {
  const animeName = animeRequestInput.value.trim();
  if (!animeName) return alert("Écris un anime avant d'envoyer !");
  push(ref(database, "requests"), { anime: animeName, date: new Date().toISOString() })
    .then(() => {
      animeRequestInput.value = ""; // reset
      alert("✅ Anime envoyé !");
    })
    .catch(err => { console.error(err); alert("❌ Erreur lors de l'envoi."); });
});

// -- Deuxième demande (request2) --
const animeRequestInput2 = document.getElementById("anime-request-input-2");
const animeRequestBtn2 = document.getElementById("anime-request-btn-2");

animeRequestInput2.value = "";

animeRequestBtn2.addEventListener("click", () => {
  const animeName2 = animeRequestInput2.value.trim();
  if (!animeName2) return alert("Écris un anime avant d'envoyer !");
  push(ref(database, "requests2"), { anime: animeName2, date: new Date().toISOString() })
    .then(() => {
      animeRequestInput2.value = ""; // reset
      alert("✅ Anime envoyé à request2 !");
    })
    .catch(err => { console.error(err); alert("❌ Erreur lors de l'envoi à request2."); });
});

animeRequestInput2.addEventListener("focus", () => {
  animeRequestInput2.value = "";
});

