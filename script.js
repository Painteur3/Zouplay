import { getFirestore, collection, addDoc, query, orderBy, limit, where, getDocs, Timestamp } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore(); // Assurez-vous d’utiliser la même instance Firebase que auth.js

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
let lives = 3; // nombre de vies
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

// Fonction confettis améliorée
function lancerConfettis() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const confettis = [];
  const colors = ["#f94144","#f3722c","#f9c74f","#90be6d","#43aa8b","#577590","#bdb2ff","#ff6d00"];
  const gravity = 0.3;
  const windMax = 1; // intensité max du vent

  for (let i = 0; i < 300; i++) {
    confettis.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 4 + 2,
      d: Math.random() * 10 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.07 + 0.05,
      speedY: Math.random() * 2 + 2,
      speedX: (Math.random() * windMax * 2) - windMax,
      alpha: 1,
      fadeSpeed: 0.02,
      bounce: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 5 + 2,
      landed: false
    });
  }

  let startTime = Date.now();

  function draw() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettis.forEach(c => {
      if (c.alpha <= 0) return;

      ctx.save();
      ctx.translate(c.x + c.tilt, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.lineWidth = c.r / 2;
      ctx.strokeStyle = `rgba(${hexToRgb(c.color)},${c.alpha})`;
      ctx.moveTo(-c.r / 2, 0);
      ctx.lineTo(c.r / 2, c.d);
      ctx.stroke();
      ctx.restore();

      // Tilt oscillation
      c.tiltAngle += c.tiltSpeed;
      c.tilt = Math.sin(c.tiltAngle) * 10;
      c.rotation += c.rotationSpeed;

      // Mouvement
      if (!c.landed) {
        c.speedY += gravity;
        c.x += c.speedX;
        c.y += c.speedY;

        // Rebond sur le sol
        if (c.y + c.d > canvas.height) {
          c.y = canvas.height - c.d;
          c.speedY *= -c.bounce;
          c.speedX *= 0.8; // perte d'énergie horizontale
          if (Math.abs(c.speedY) < 0.5) {
            c.landed = true;
          }
        }

        // Rebond sur les côtés
        if (c.x < 0 || c.x > canvas.width) {
          c.speedX *= -1;
        }
      }

      // Disparition progressive après 5 sec
      if (elapsed > 5000 || c.landed) {
        c.alpha -= c.fadeSpeed;
      }
    });

    if (confettis.some(c => c.alpha > 0)) {
      confettiAnimation = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}

// Convertit hex en rgb pour le rgba
function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}


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
});

// Bouton valider
validateBtn.addEventListener("click", () => {
  verifierReponse();
  if (personnages.length > 0 && lives > 0) {
    afficherPerso();
  }
});

startBtn.addEventListener("click", function() {
  // Masquer la section accueil
  accueil.style.display = "none";

  // Afficher la section quiz
  quiz.classList.remove("hidden");

  // Optionnel : sélectionner automatiquement le champ réponse
  answerInput.focus();
});

document.addEventListener('DOMContentLoaded', () => {
    const answerInput = document.getElementById('answer');
    const validateButton = document.getElementById('validate');

    if (answerInput && validateButton) {
        answerInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 

                // Ajouter un effet visuel
                validateButton.classList.add('click-effect');

                // Retirer l'effet après 150ms
                setTimeout(() => {
                    validateButton.classList.remove('click-effect');
                }, 150);

                // Simuler le clic
                validateButton.click();
            }
        });
    }
});

const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 60; // nombre de bulles/particules

// Création des particules
for(let i=0; i<particleCount; i++){
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 2,
        speedY: Math.random() * 1 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.3
    });
}

// Animation
function animateParticles(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,190,72,${p.alpha})`; // couleur dorée
        ctx.fill();
        
        p.y -= p.speedY; // monte doucement
        p.x += p.speedX; // léger mouvement horizontal

        // Si la particule sort de l'écran, on la replace en bas
        if(p.y + p.radius < 0) {
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

