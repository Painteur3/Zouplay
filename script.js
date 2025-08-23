document.addEventListener("DOMContentLoaded", () => {
  // ----------------------
  // Variables globales
  // ----------------------
  const categories = {
    "Akame ga Kill": [
      { nom: "Run", img: "images/Akame ga Kill/Run.jpg" }
    ],
    "Tokyo Revengers": [
  { nom: "Keisuke", img: "images/Tokyo Revengers/Keisuke.jpg" },
  { nom: "Ryouhei", img: "images/Tokyo Revengers/Ryouhei.jpg" },
  { nom: "Souya", img: "images/Tokyo Revengers/Souya.jpg" },
  { nom: "Masataka", img: "images/Tokyo Revengers/Masataka.jpg" },
  { nom: "Naoto", img: "images/Tokyo Revengers/Naoto.jpg" },
  { nom: "Manjirou", img: "images/Tokyo Revengers/Manjirou.jpg" },
  { nom: "Masaru", img: "images/Tokyo Revengers/Masaru.jpg" },
  { nom: "Takuya", img: "images/Tokyo Revengers/Takuya.jpg" },
  { nom: "Shuuji", img: "images/Tokyo Revengers/Shuuji.jpg" },
  { nom: "Kazushi", img: "images/Tokyo Revengers/Kazushi.jpg" },
  { nom: "Hakkai", img: "images/Tokyo Revengers/Hakkai.jpg" },
  { nom: "Hajime", img: "images/Tokyo Revengers/Hajime.jpg" },
  { nom: "Ken", img: "images/Tokyo Revengers/Ken.jpg" },
  { nom: "Gariman", img: "images/Tokyo Revengers/Gariman.jpg" },
  { nom: "Atsushi", img: "images/Tokyo Revengers/Atsushi.jpg" },
  { nom: "Emma", img: "images/Tokyo Revengers/Emma.jpg" },
  { nom: "Ryouko", img: "images/Tokyo Revengers/Ryouko.jpg" },
  { nom: "Remi", img: "images/Tokyo Revengers/Remi.jpg" },
  { nom: "Chifuyu", img: "images/Tokyo Revengers/Chifuyu.jpg" },
  { nom: "Makoto", img: "images/Tokyo Revengers/Makoto.jpg" },
  { nom: "TV", img: "images/Tokyo Revengers/TV.jpg" },
  { nom: "Choji", img: "images/Tokyo Revengers/Choji.jpg" },
  { nom: "Takashi", img: "images/Tokyo Revengers/Takashi.jpg" },
  { nom: "Nahoya", img: "images/Tokyo Revengers/Nahoya.jpg" },
  { nom: "Rindou", img: "images/Tokyo Revengers/Rindou.jpg" },
  { nom: "Kazutora", img: "images/Tokyo Revengers/Kazutora.jpg" },
  { nom: "Shinichirou", img: "images/Tokyo Revengers/Shinichirou.jpg" },
  { nom: "Hansen", img: "images/Tokyo Revengers/Hansen.jpg" },
  { nom: "Hinata", img: "images/Tokyo Revengers/Hinata.jpg" },
  { nom: "Haruchiyo", img: "images/Tokyo Revengers/Haruchiyo.jpg" },
  { nom: "Chonbo", img: "images/Tokyo Revengers/Chonbo.jpg" },
  { nom: "Ran", img: "images/Tokyo Revengers/Ran.jpg" },
  { nom: "Jin", img: "images/Tokyo Revengers/Jin.jpg" },
  { nom: "Eki", img: "images/Tokyo Revengers/Eki.jpg" },
  { nom: "Seishuu", img: "images/Tokyo Revengers/Seishuu.jpg" },
  { nom: "Nobutaka", img: "images/Tokyo Revengers/Nobutaka.jpg" },
  { nom: "Takemichi", img: "images/Tokyo Revengers/Takemichi.jpg" },
  { nom: "Haruki", img: "images/Tokyo Revengers/Haruki.jpg" },
  { nom: "Chome", img: "images/Tokyo Revengers/Chome.jpg" },
  { nom: "Kojima", img: "images/Tokyo Revengers/Kojima.jpg" },
  { nom: "Tetta", img: "images/Tokyo Revengers/Tetta.jpg" },
  { nom: "Yasuhiro", img: "images/Tokyo Revengers/Yasuhiro.jpg" }
],
    "Vinland Saga": [
      { nom: "Haldor", img: "images/Vinland Saga/Haldor.jpg" },
      { nom: "Canute", img: "images/Vinland Saga/Canute.jpg" }
    ]
  };

  let personnages = [];
  let currentPerso = null;
  let score = 0;
  let lives = 3;
  let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
  let confettiAnimation;

  // ----------------------
  // DOM
  // ----------------------
  const accueil = document.getElementById("accueil");
  const quiz = document.getElementById("quiz");
  const startBtn = document.getElementById("start-quiz");

  const imgPerso = document.getElementById("personnage-image");
  const answerInput = document.getElementById("answer");
  const validateBtn = document.getElementById("validate");
  const resultText = document.getElementById("result");
  const scoreSpan = document.getElementById("score");
  const livesSpan = document.getElementById("lives");
  const bestScoreSpan = document.getElementById("best-score");

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

  // Gestion de la classe 'selected' au clic
  categoriesContainer.addEventListener('change', (e) => {
    if (e.target && e.target.type === "checkbox") {
      e.target.parentElement.classList.toggle('selected', e.target.checked);
    }
  });

  // ----------------------
  // Quiz
  // ----------------------
  function afficherPerso() {
    if (personnages.length === 0) return;
    currentPerso = personnages[Math.floor(Math.random() * personnages.length)];
    imgPerso.src = currentPerso.img;
    answerInput.value = "";
    resultText.textContent = "";
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

  function terminerQuiz(lastResult = "") {
    const newBest = score > bestScore;
    if (newBest) {
      bestScore = score;
      localStorage.setItem("bestScore", bestScore);

      if (window.auth) {
        window.auth.onAuthStateChanged(user => { if (user) saveScore(user, score); });
      }

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

    document.getElementById("rejouer").addEventListener("click", startQuiz);
  }

  function startQuiz() {
    score = 0;
    lives = 3;
    currentPerso = null;

    const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked"))
      .map(cb => cb.value);

    personnages = selected.flatMap(cat => categories[cat]);
    if (personnages.length === 0) personnages = Object.values(categories).flat();

    accueil.classList.add("hidden");
    quiz.classList.remove("hidden");

    imgPerso.src = "";
    answerInput.value = "";
    resultText.textContent = "";
    scoreSpan.textContent = score;
    livesSpan.textContent = lives;
    bestScoreSpan.textContent = "Meilleur score : " + bestScore;

    afficherPerso();
  }

  startBtn.addEventListener("click", startQuiz);
  validateBtn.addEventListener("click", () => { verifierReponse(); afficherPerso(); });

  answerInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateBtn.click();
    }
  });

  // ----------------------
  // Confettis
  // ----------------------
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function lancerConfettis() {
    const confettis = [];
    const colors = ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#43aa8b", "#577590", "#bdb2ff", "#ff6d00"];
    const gravity = 0.3, windMax = 1;

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

    const startTime = Date.now();

    function draw() {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettis.forEach(c => {
        if (c.alpha <= 0) return;
        ctx.save();
        ctx.translate(c.x + c.tilt, c.y);
        ctx.rotate(c.rotation * Math.PI / 180);
        ctx.beginPath();
        ctx.lineWidth = c.r / 2;
        ctx.strokeStyle = `rgba(${hexToRgb(c.color)},${c.alpha})`;
        ctx.moveTo(-c.r / 2, 0);
        ctx.lineTo(c.r / 2, c.d);
        ctx.stroke();
        ctx.restore();

        c.tiltAngle += c.tiltSpeed;
        c.tilt = Math.sin(c.tiltAngle) * 10;
        c.rotation += c.rotationSpeed;

        if (!c.landed) {
          c.speedY += gravity;
          c.x += c.speedX;
          c.y += c.speedY;
          if (c.y + c.d > canvas.height) {
            c.y = canvas.height - c.d;
            c.speedY *= -c.bounce;
            c.speedX *= 0.8;
            if (Math.abs(c.speedY) < 0.5) c.landed = true;
          }
          if (c.x < 0 || c.x > canvas.width) c.speedX *= -1;
        }

        if (elapsed > 5000 || c.landed) c.alpha -= c.fadeSpeed;
      });

      if (confettis.some(c => c.alpha > 0)) confettiAnimation = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    draw();
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return `${r},${g},${b}`;
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});
