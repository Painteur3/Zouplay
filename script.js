// Variables globales
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

// Afficher scores initiaux
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// Générer les catégories dynamiquement
const categoriesContainer = document.getElementById("categories-container");
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// Fonction confettis (ton code original)
function lancerConfettis() { /* ... */ }
function hexToRgb(hex) { /* ... */ }

// Afficher personnage
function afficherPerso() {
  if (personnages.length === 0) return;
  currentPerso = personnages[Math.floor(Math.random() * personnages.length)];
  imgPerso.src = currentPerso.img;
  answerInput.value = "";
}

// Vérifier réponse
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

// Terminer quiz
function terminerQuiz(lastResult = "") {
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
}

// Démarrer quiz
startBtn.addEventListener("click", () => {
  score = 0;
  lives = 3;
  currentPerso = null;

  // Récupérer catégories cochées, sinon prendre toutes
  const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked"))
    .map(cb => cb.value);

  personnages = selected.length
    ? selected.flatMap(cat => categories[cat])
    : Object.values(categories).flat();

  // Masquer accueil, afficher quiz
  accueil.classList.add("hidden");
  quiz.classList.remove("hidden");

  // Reset affichage
  imgPerso.src = "";
  answerInput.value = "";
  resultText.textContent = "";
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  bestScoreSpan.textContent = "Meilleur score : " + bestScore;

  afficherPerso();
});

// Bouton valider
validateBtn.addEventListener("click", () => {
  verifierReponse();
  if (personnages.length > 0 && lives > 0) {
    afficherPerso();
  }
});

// Entrée clavier Enter
document.addEventListener('DOMContentLoaded', () => {
  const answerInput = document.getElementById('answer');
  const validateButton = document.getElementById('validate');
  if (answerInput && validateButton) {
    answerInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        validateButton.classList.add('click-effect');
        setTimeout(() => validateButton.classList.remove('click-effect'), 150);
        validateButton.click();
      }
    });
  }
});

// Canvas particules confettis/bulles
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];
const particleCount = 60;

for(let i=0;i<particleCount;i++){
  particles.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    radius: Math.random()*4+2,
    speedY: Math.random()*1+0.3,
    speedX: (Math.random()-0.5)*0.5,
    alpha: Math.random()*0.5+0.3
  });
}

function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
    ctx.fillStyle = `rgba(245,190,72,${p.alpha})`;
    ctx.fill();
    p.y -= p.speedY;
    p.x += p.speedX;
    if(p.y+p.radius<0){ p.y=canvas.height+p.radius; p.x=Math.random()*canvas.width; }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
