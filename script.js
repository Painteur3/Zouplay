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

// 🔹 Quiz
function afficherPerso() {
  if (!personnages.length) return;
  currentPerso = personnages[Math.floor(Math.random() * personnages.length)];
  imgPerso.src = currentPerso.img;
  answerInput.value = "";
}

function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,    // suppression
                    matrix[i][j - 1] + 1,    // insertion
                    matrix[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }
    return matrix[a.length][b.length];
}

function verifierReponse() {
  if (!currentPerso) return;
  const reponse = answerInput.value.trim().toLowerCase();
  const correct = currentPerso.nom.toLowerCase();
  let lastResult = "";

  // ✅ Accepte jusqu'à 2 fautes de frappe
  if (reponse === correct || levenshtein(reponse, correct) <= 2) {
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
}

// 🔹 Événements
startBtn.addEventListener("click", () => {
  score=0; lives=3; currentPerso=null; hideCategorySelection();
  const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked")).map(cb=>cb.value);
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
const facts=[
  "Dans Akame ga Kill, plusieurs personnages ont été inspirés par des figures historiques de meurtriers célèbres,",
"Black Clover a été conçu pour mélanger magie classique et shonen moderne afin de séduire un large public,",
"Bleach a failli s’appeler ‘Soul Protectors’ avant que le nom final ne soit choisi,",
"Blue Exorcist s’inspire de l’iconographie chrétienne et de la culture japonaise des esprits,",
"Chainsaw Man a été pensé comme une critique satirique des mangas shonen classiques,",
"Chainsaw Man contient des personnages dont les pouvoirs étaient initialement beaucoup plus extrêmes,",
"Code Geass a failli avoir une fin alternative beaucoup plus sombre et controversée,",
"Demon Slayer a été récompensé pour sa fidélité aux détails historiques de l’ère Taisho,",
"Death Note a été interdit dans plusieurs écoles à cause de son thème de meurtre et de manipulation,",
"Dragon Ball a été initialement inspiré du classique chinois ‘Le Voyage en Occident’,",
"Dragon Quest a influencé de nombreux mangakas et game designers à travers le monde,",
"Evangelion contient des références religieuses et mythologiques très subtiles,",
"Fairy Tail a été conçu pour que chaque personnage ait un thème musical et visuel reconnaissable,",
"Fire Force explore des concepts scientifiques mélangés à des pouvoirs surnaturels,",
"Fullmetal Alchemist a un manga plus sombre que son adaptation animée originale,",
"Gachiakuta est connu pour ses dialogues absurdes et répétitifs qui font rire le lecteur,",
"Haikyuu est basé sur les expériences sportives réelles de l’auteur à l’école,",
"Hunter x Hunter a des arcs extrêmement longs avec des pauses fréquentes de l’auteur,",
"JoJo's Bizarre Adventure a inspiré des artistes de mode et de design à travers le monde,",
"Jujutsu Kaisen contient des malédictions basées sur des légendes urbaines japonaises,",
"Kaiju no 8 mélange humour, action et drame dans un cadre post-apocalyptique,",
"Mashle a été conçu pour que chaque combat devienne une scène comique et absurde,",
"My Hero Academia a popularisé des pouvoirs uniques et visuellement créatifs,",
"One Piece détient des records pour sa longévité et sa popularité mondiale,",
"One Punch Man est une satire des shonen classiques et de la recherche de défi,",
"ReZero explore les conséquences psychologiques de revivre les mêmes événements,",
"Seven Deadly Sins a des personnages dont les pouvoirs sont inspirés des légendes médiévales,",
"Shingeki no Kyojin a popularisé le combat tridimensionnel spectaculaire dans l’animation,",
"Slam Dunk a inspiré de nombreux joueurs à commencer le basket dès leur jeunesse,",
"Spy x Family combine humour, action et drame familial de manière équilibrée,",
"Sword Art Online a inspiré de nombreux mangas et animés sur les réalités virtuelles,",
"Tokyo Ghoul a popularisé les thèmes sombres et psychologiques dans les mangas récents,",
"Tokyo Revengers montre que changer le passé peut avoir des conséquences inattendues,",
"Vinland Saga a été inspiré par des chroniques historiques sur les Vikings et leurs batailles,",
"Akame ga Kill contient des scènes censurées qui sont devenues cultes chez les fans,",
"Black Clover a des références cachées à d’anciens classiques de la fantasy japonaise,",
"Bleach a inspiré de nombreux mangas avec des héros capables de voir les esprits,",
"Chainsaw Man a popularisé un style graphique très brut et dynamique,",
"Code Geass utilise des stratégies et intrigues qui font réfléchir les spectateurs,",
"Demon Slayer est connu pour ses illustrations de combat extrêmement détaillées,",
"Dragon Quest a influencé les personnages et monstres de nombreux RPG modernes,",
"Evangelion a des designs de méchas influents et emblématiques,",
"Fullmetal Alchemist montre que la science et la magie peuvent coexister de manière réaliste,",
"Gachiakuta surprend par ses gags totalement imprévisibles et absurdes,",
"Hunter x Hunter contient des arcs où la stratégie prime sur la force brute,",
"JoJo's Bizarre Adventure utilise des Stands aux pouvoirs incroyablement créatifs,",
"Kaiju no 8 fait réfléchir sur l’identité humaine et la monstruosité,",
"Mashle transforme chaque combat en un moment comique et spectaculaire,",
"One Punch Man joue sur le contraste entre ennuis quotidiens et pouvoirs absurdes,",
"ReZero mélange voyage dans le temps, drame et horreur psychologique,",
"Tokyo Revengers explore l’amitié et la rédemption à travers le temps,",
"Vinland Saga montre la brutalité et la stratégie des batailles vikings,",
"Akame ga Kill montre que même les héros peuvent avoir des faiblesses mortelles,",
"Evangelion mélange méchas, psychologie et philosophie avec intensité,",
"Chainsaw Man utilise humour noir et horreur pour créer un récit unique et surprenant,",
"Demon Slayer utilise un style graphique unique pour ses combats élégants,",
"Death Note explore comment le pouvoir peut changer profondément une personne,",
"Dragon Ball a popularisé les techniques de combat et transformations iconiques,",
"Haikyuu montre que le travail d’équipe peut surpasser le talent individuel,",
"Mashle combine force brute et humour pour parodier les shonen classiques,",
"My Hero Academia montre que le courage peut surpasser les limitations physiques,",
"One Piece crée un univers cohérent avec des histoires et personnages riches,",
"Tokyo Ghoul mélange horreur, action et drame psychologique,",
"Vinland Saga raconte des histoires de batailles et stratégies vikings détaillées,",
"Akame ga Kill montre que la loyauté et le courage sont parfois plus puissants que la force brute,",
"Chainsaw Man a révolutionné le style gore et humour noir dans les shonen,",
"Code Geass présente des retournements de situation inattendus et stratégiques,",
"Demon Slayer a été adapté en films qui ont battu des records au box-office,",
"Death Note explore la psychologie des protagonistes de manière profonde,",
"Dragon Ball a des rivalités iconiques entre personnages qui durent des années,",
"Dragon Quest mélange aventure, humour et combats classiques de RPG,",
"Evangelion a inspiré des analyses psychologiques complexes chez les fans,",
"Fairy Tail mélange aventure et amitié avec des combats toujours surprenants,",
"Fire Force utilise des flammes et pouvoirs uniques pour chaque personnage principal,",
"Fullmetal Alchemist explore la valeur de la vie et les conséquences des choix,",
"Gachiakuta utilise un humour totalement absurde et inattendu,",
"Haikyuu montre que la persévérance et le travail d’équipe sont essentiels,",
"Hunter x Hunter propose des combats stratégiques et intelligents,",
"JoJo's Bizarre Adventure est connu pour son style artistique extravagant et unique,",
"Kaiju no 8 questionne la frontière entre humanité et monstres dans ses combats,",
"Mashle combine force brute et humour pour parodier les clichés shonen,",
"My Hero Academia montre la détermination et le courage face aux obstacles,",
"Naruto explore les rêves, la solitude et le pouvoir de l’amitié,",
"One Piece raconte un monde vaste avec des personnages riches et attachants,",
"One Punch Man joue sur la satire des héros et le pouvoir absolu,",
"ReZero mélange horreur, drame et voyage dans le temps de façon originale,",
"Seven Deadly Sins combine humour, magie et combats épiques de manière captivante,",
"Shingeki no Kyojin choque les lecteurs avec ses révélations et scènes spectaculaires,",
"Slam Dunk rend le basket vivant et palpitant pour les lecteurs de tous âges,",
"Spy x Family combine espionnage, action et tendresse familiale de façon inédite,",
"Sword Art Online montre les dangers et les promesses des mondes virtuels immersifs,",
"Tokyo Revengers montre que les choix et les erreurs peuvent façonner le destin,",
"Vinland Saga raconte les aventures et batailles épiques des Vikings dans le détail,",
"Chainsaw Man utilise humour noir et horreur pour créer un récit unique et surprenant,",
"Demon Slayer impressionne par son style graphique et ses combats spectaculaires,",
"JoJo's Bizarre Adventure utilise des Stands aux pouvoirs incroyablement créatifs,",
"Kaiju no 8 fait réfléchir sur l’identité humaine et la monstruosité,",
"Mashle transforme chaque combat en un moment comique et spectaculaire,",
"One Punch Man joue sur le contraste entre ennuis quotidiens et pouvoirs absurdes,",
"ReZero explore la douleur et les sacrifices nécessaires pour sauver les proches,",
"Tokyo Ghoul montre la dualité entre l’humain et le monstre,",
"Vinland Saga raconte la brutalité et la stratégie des batailles vikings,"
];
let index=0;
function showFact(){ factText.style.opacity=0; setTimeout(()=>{ factText.textContent=facts[index]; factText.style.opacity=1; index=(index+1)%facts.length; },1200); }
showFact(); setInterval(showFact,11000);
