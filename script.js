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
const facts = [
  "One Piece est le manga le plus vendu au monde, avec plus de 500 millions d'exemplaires en circulation.",
  "Le mot 'anime' vient de l’abréviation du mot anglais 'animation'.",
  "Dragon Ball a popularisé le concept de transformation avec les Super Saiyans.",
  "Le premier manga jamais publié date de 1814 : il s'agit des 'Hokusai Manga'.",
  "Naruto devait à l’origine être une histoire de magie, pas de ninjas.",
  "Attack on Titan s’inspire des cauchemars de son auteur, Hajime Isayama.",
  "One Punch Man est né d’un webcomic amateur avant d’être adapté en manga et anime.",
  "Sailor Moon a popularisé le genre 'magical girl' dans le monde entier.",
  "Death Note a failli être interdit dans plusieurs pays à cause de carnets de 'Death Note' utilisés par des élèves.",
  "Pokémon est à l’origine basé sur la passion de son créateur pour la chasse aux insectes.",
  "Astro Boy (1963) est considéré comme le premier anime télévisé japonais.",
  "L’attaque 'Kamehameha' de Dragon Ball est inspirée du nom du roi Kamehameha d’Hawaï.",
  "Fullmetal Alchemist est l’un des rares mangas écrits par une femme à avoir eu un immense succès mondial.",
  "Le manga One Piece est publié depuis 1997 sans interruption.",
  "My Hero Academia s’inspire beaucoup des comics américains de super-héros.",
  "En japonais, 'Naruto' signifie tourbillon, comme les tourbillons de ramen.",
  "Neon Genesis Evangelion a révolutionné le genre mecha en le rendant psychologique.",
  "Les génériques d’anime sont souvent chantés par des groupes J-Pop très célèbres.",
  "Akira (1988) a influencé Hollywood et inspiré Matrix et Inception.",
  "Hunter x Hunter est connu pour ses pauses d’auteur très longues.",
  "Le 'x' dans Hunter x Hunter ne se prononce pas.",
  "Le mot 'manga' signifie littéralement 'images dérisoires'.",
  "Tokyo Ghoul a été censuré dans certains pays à cause de sa violence.",
  "Luffy devait au départ avoir une équipe composée uniquement de robots.",
  "Demon Slayer est devenu le manga le plus vendu de l’histoire en une seule année (2019).",
  "Bleach s’appelle ainsi car son auteur aimait le mot et trouvait qu’il sonnait cool.",
  "Le Bankai de Bleach devait initialement être beaucoup plus rare.",
  "Yu-Gi-Oh! au départ était un manga sur différents jeux, pas seulement les cartes.",
  "JoJo’s Bizarre Adventure est célèbre pour ses poses exagérées appelées 'JoJo Poses'.",
  "Le Stand 'Star Platinum' de JoJo est inspiré de Kenshiro dans Hokuto no Ken.",
  "Hokuto no Ken est l’une des premières séries à populariser le héros musclé en manga.",
  "Le studio Ghibli doit son nom à un avion italien de la Seconde Guerre mondiale.",
  "Hayao Miyazaki a juré de ne jamais travailler avec Disney après des censures.",
  "Le film Spirited Away (Le Voyage de Chihiro) a remporté l’Oscar du meilleur film d’animation en 2003.",
  "Le générique de Dragon Ball Z est resté culte dans de nombreux pays, même en version traduite.",
  "Naruto devait finir avec Sakura, mais l’auteur a changé d’avis en cours de route.",
  "Le Sharingan de Naruto est inspiré du tomoe, un symbole japonais ancien.",
  "Attack on Titan a failli être écrit avec des robots à la place des titans.",
  "Le personnage de Levi Ackerman est inspiré d’un acteur allemand.",
  "Le terme 'otaku' était au départ péjoratif au Japon.",
  "En 2013, One Piece est entré dans le Guinness World Record pour le plus grand nombre d’exemplaires publiés par un seul auteur.",
  "Dans Death Note, L s’assoit bizarrement pour améliorer sa concentration.",
  "Chainsaw Man mélange volontairement horreur, comédie et absurdité.",
  "L’opening de Neon Genesis Evangelion est devenu culte dans le monde entier.",
  "Le studio Toei Animation existe depuis 1948.",
  "Les mangas représentent plus de 40% des livres vendus au Japon.",
  "Le mot 'senpai' est utilisé dans la vraie vie, pas seulement dans les anime.",
  "Fairy Tail est inspiré de RPG et de jeux de rôle fantasy.",
  "Le katana de Zoro dans One Piece s’appelle Wado Ichimonji.",
  "Le créateur de Naruto voulait au départ que Sasuke n’existe pas.",
  "Boruto, le fils de Naruto, est né d’une demande des éditeurs, pas de l’auteur.",
  "Dans One Piece, Sanji devait s’appeler 'Naruto' au départ.",
  "Dragon Ball devait se terminer après le combat contre Freezer.",
  "Cell n’était pas prévu dans Dragon Ball, c’était une idée de l’éditeur.",
  "Le fameux 'Dattebayo!' de Naruto ne veut rien dire, c’est un tic inventé.",
  "Dans My Hero Academia, All Might est inspiré de Superman.",
  "Le studio MAPPA a animé Jujutsu Kaisen, Chainsaw Man et Attack on Titan.",
  "La technique 'Rasengan' de Naruto est inspirée d’une tornade.",
  "Doraemon est considéré comme le 'Mickey Mouse' du Japon.",
  "Le manga Berserk a commencé en 1989 et est resté inachevé à la mort de son auteur.",
  "Le héros de Black Clover, Asta, est volontairement sans magie pour être unique.",
  "Shingeki no Kyojin signifie littéralement 'Avancée des géants'.",
  "Le héros de One Piece, Luffy, a été choisi pour représenter la liberté.",
  "La voix de Goku au Japon est faite par une femme, Masako Nozawa.",
  "Le terme 'isekai' signifie 'autre monde'.",
  "Sword Art Online a popularisé le genre isekai moderne.",
  "Re:Zero est connu pour son système de 'mort et retour'.",
  "Dans Tokyo Revengers, l’auteur s’est inspiré de sa jeunesse dans un gang.",
  "L’anime Cowboy Bebop est culte malgré seulement 26 épisodes.",
  "La phrase 'Omae wa mou shindeiru' de Hokuto no Ken est devenue un meme mondial.",
  "Dans Death Note, Light Yagami est né le même jour que son auteur.",
  "La série Pokémon détient le record de la franchise médiatique la plus rentable au monde.",
  "Dans Bleach, Ichigo signifie 'fraise', mais aussi 'celui qui protège'.",
  "Dans Hunter x Hunter, Gon et Killua représentent deux philosophies opposées.",
  "Le manga Slam Dunk a relancé l’intérêt pour le basketball au Japon.",
  "One Piece devait durer 5 ans mais dépasse aujourd’hui les 25 ans.",
  "Demon Slayer a inspiré des hausses de ventes de kimonos au Japon.",
  "Dans Naruto, les ninjas portent des bandeaux pour éviter de dessiner leurs coiffures complexes en détail.",
  "Le personnage de Gojo Satoru dans Jujutsu Kaisen est devenu un phénomène internet.",
  "Dans Dragon Ball, Gohan devait être le héros final à la place de Goku.",
  "Les 'chibi' sont des versions super déformées des personnages pour l’humour.",
  "Le mot 'shonen' signifie 'jeune garçon'.",
  "Le mot 'shojo' signifie 'jeune fille'.",
  "Le mot 'seinen' signifie 'jeune homme'.",
  "Le mot 'josei' signifie 'jeune femme'.",
  "Le manga Detective Conan s’appelle Case Closed en anglais pour éviter des problèmes de droits.",
  "Dans JoJo, le personnage Dio est inspiré de plusieurs stars du rock.",
  "Le nom 'Jotaro' dans JoJo vient du mot japonais 'tarou', un prénom classique.",
  "Dans Bleach, le Zanpakutō est une extension de l’âme du porteur.",
  "Dans Dragon Ball, Mr. Satan s’appelle 'Hercule' dans certaines versions.",
  "Le mot 'kawaii' est devenu un phénomène culturel japonais grâce aux anime.",
  "Naruto est l’un des mangas les plus traduits dans le monde.",
  "Le manga One Piece est traduit en plus de 40 langues.",
  "Les openings d’anime sont souvent plus travaillés que ceux des séries TV occidentales.",
  "Certains seiyuu (doubleurs japonais) sont plus célèbres que des acteurs de cinéma au Japon.",
  "Le cosplay d’anime est devenu une sous-culture mondiale.",
  "Le terme 'tsundere' vient de 'tsun tsun' (froid) et 'dere dere' (amoureux).",
  "Le terme 'yandere' désigne un personnage amoureux mais dangereux.",
  "Dans Demon Slayer, le souffle de Tanjiro est inspiré de techniques de respiration réelles.",
  "Certains anime comme Pokémon ou Yu-Gi-Oh! ont eu plus de succès à l’international qu’au Japon.",
  "Le Japon a un musée entièrement dédié au manga et à l’anime à Kyoto."
];
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

// -- Première demande (anime_requests) --
const animeRequestInput = document.getElementById("anime-request-input");
const animeRequestBtn = document.getElementById("anime-request-btn");
animeRequestInput.value = "";

let lastAnimeRequest = 0; // timestamp du dernier envoi

animeRequestBtn.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastAnimeRequest < 20000) { // 20 secondes = 20000 ms
    return alert("⏳ Attends 20 secondes avant d'envoyer une nouvelle demande !");
  }
  lastAnimeRequest = now;

  const animeName = animeRequestInput.value.trim();
  if (!animeName) return alert("Écris un anime avant d'envoyer !");
  
  push(ref(database, "anime_requests"), {
    anime: animeName,
    date: new Date().toISOString()
  })
  .then(() => {
    animeRequestInput.value = "";
    alert("✅ Anime bien envoyé ! Il sera ajouté prochainement");
  })
  .catch(err => {
    console.error(err);
    alert("❌ Erreur lors de l'envoi");
  });
});

// -- Deuxième demande (bug_reports) --
const animeRequestInput2 = document.getElementById("anime-request-input-2");
const animeRequestBtn2 = document.getElementById("anime-request-btn-2");
animeRequestInput2.value = "";

let lastBugReport = 0; // timestamp du dernier envoi

animeRequestBtn2.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastBugReport < 20000) { // 20 secondes = 20000 ms
    return alert("⏳ Attends 20 secondes avant d'envoyer un nouveau rapport !");
  }
  lastBugReport = now;

  const bugText = animeRequestInput2.value.trim();
  if (!bugText) return alert("Dis moi le soucis avant d'envoyer !");
  
  push(ref(database, "bug_reports"), {
    bug: bugText,
    date: new Date().toISOString()
  })
  .then(() => {
    animeRequestInput2.value = "";
    alert("✅ Problème bien envoyé ! Merci !");
  })
  .catch(err => {
    console.error(err);
    alert("❌ Erreur lors de l'envoi");
  });
});

// -- Effacer champ à la focus
animeRequestInput.addEventListener("focus", () => { animeRequestInput.value = ""; });
animeRequestInput2.addEventListener("focus", () => { animeRequestInput2.value = ""; });


