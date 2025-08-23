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
const categoriesContainer = document.getElementById("categories-container");

// 🔹 Afficher scores initiaux
scoreSpan.textContent = score;
livesSpan.textContent = lives;
bestScoreSpan.textContent = "Record : " + bestScore;

// 🔹 Générer catégories dynamiquement
for (let cat in categories) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${cat}"> ${cat}`;
  categoriesContainer.appendChild(label);
}

// 🔹 Fonctions cacher / afficher catégories
function hideCategorySelection() {
  const adventureTitle = accueil.querySelector("h2");
  const categoriesForm = document.getElementById("categories-form");
  const startBtn = document.getElementById("start-quiz");

  if (adventureTitle) adventureTitle.style.display = "none";
  if (categoriesForm) categoriesForm.style.display = "none";
  if (startBtn) startBtn.style.display = "none";
}

function showCategorySelection() {
  const adventureTitle = accueil.querySelector("h2");
  const categoriesForm = document.getElementById("categories-form");
  const startBtn = document.getElementById("start-quiz");

  if (adventureTitle) adventureTitle.style.display = "block";
  if (categoriesForm) categoriesForm.style.display = "block";
  if (startBtn) startBtn.style.display = "inline-block";
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
  resultText.textContent = lastResult;

  // Mettre à jour bestScore
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestScoreSpan.textContent = "Record : " + bestScore;
  }

  // Créer ou afficher le bloc de fin
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
}

// 🔹 Réinitialiser quiz
function rejouerQuiz() {
  score = 0;
  lives = 3;
  currentPerso = null;

  // Reset input et catégories
  answerInput.value = "";
  document.querySelectorAll("#categories-container input[type=checkbox]").forEach(cb => cb.checked = false);

  // Réinitialiser UI
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  resultText.textContent = "";
  imgPerso.src = "";

  // Masquer bloc fin et afficher accueil
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

const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 80; // plus de particules pour plus d'effet

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 6 + 2, // tailles variées
        speedY: Math.random() * 1.2 + 0.2,
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.5 + 0.3,
        offset: Math.random() * 1000, // pour oscillation et scintillement
        shape: Math.random() < 0.8 ? 'circle' : 'square', // 80% ronds, 20% carrés
        depth: Math.random() * 1.5 + 0.5 // pour effet parallax
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        // oscillation horizontale
        p.x += Math.sin(Date.now() * 0.002 + p.offset) * 0.5 * p.depth;
        p.y -= p.speedY * p.depth;

        // scintillement
        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(Date.now() * 0.005 + p.offset));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgba(245,190,72,${alpha})`;

        if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        }

        // remettre en bas si la particule sort en haut
        if (p.y + p.radius < 0) {
            p.y = canvas.height + p.radius;
            p.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// Ajuster le canvas au resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
