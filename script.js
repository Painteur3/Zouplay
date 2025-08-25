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

    // 🔹 Restaurer les dernières catégories sélectionnées
  const lastCategories = JSON.parse(localStorage.getItem("lastCategories") || "[]");
  document.querySelectorAll("#categories-container input[type=checkbox]").forEach(cb => {
    cb.checked = lastCategories.includes(cb.value);
  });
}

// 🔹 Événements
startBtn.addEventListener("click", () => {
  score=0; lives=3; currentPerso=null; hideCategorySelection();
  const selected = Array.from(document.querySelectorAll("#categories-container input[type=checkbox]:checked")).map(cb=>cb.value);
  
  // 🔹 Sauvegarde dans localStorage
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
const facts=[  
  "Le manga One Piece détient le record du manga le plus vendu avec plus de 500 millions d'exemplaires.",
  "Sazae-san détient le record du plus grand nombre d'épisodes animés, plus de 7 500 depuis 1969.",
  "Spirited Away a remporté l'Oscar du meilleur film d'animation en 2003.",
  "Le créateur de Dragon Ball, Akira Toriyama, a aussi travaillé sur le design des personnages de Dragon Quest.",
  "Le personnage de Naruto a été inspiré par le ninja et les contes populaires japonais.",
  "Le studio Ghibli a presque fermé après la sortie de 'Nausicaä de la vallée du vent'.",
  "L’anime 'Death Note' a été diffusé pour la première fois en 2006.",
  "Pikachu a été choisi comme mascotte Pokémon parce que son nom est mignon et facile à prononcer.",
  "Le terme 'anime' au Japon désigne tous les dessins animés, pas seulement japonais.",
  "Les épisodes de One Piece durent en moyenne 22 minutes.",
  "Le personnage d’Edward Elric dans Fullmetal Alchemist mesure en réalité seulement 1m49.",
  "Attack on Titan est inspiré par les idées de l'auteur Hajime Isayama sur la peur et la liberté.",
  "Sailor Moon a popularisé les magical girls dans les années 90.",
  "Le manga My Hero Academia a été publié pour la première fois en 2014.",
  "Les yeux des personnages d'anime sont souvent exagérément grands pour exprimer les émotions.",
  "Le premier anime diffusé à la télévision japonaise date de 1963 : Astro Boy.",
  "Akira a révolutionné l’animation avec ses techniques de rendu et d’animation fluides.",
  "Le personnage de Totoro est devenu un symbole du Studio Ghibli.",
  "Le mot 'manga' signifie littéralement 'dessin dérisoire' en japonais.",
  "One Punch Man a commencé comme webcomic avant de devenir manga et anime.",
  "L’anime Cowboy Bebop est connu pour sa bande-son jazz emblématique.",
  "Les japonais célèbrent le 'Día de l’anime' chaque 15 avril.",
  "Naruto devait initialement mourir à la fin de la série.",
  "Le studio Kyoto Animation est reconnu pour la qualité exceptionnelle de son animation.",
  "Les opening d’anime sont souvent produits par des groupes célèbres de J-pop.",
  "Les voix japonaises originales des personnages sont appelées 'seiyuus'.",
  "Le manga Berserk est célèbre pour ses dessins très détaillés et sombres.",
  "Pokémon est l’une des franchises les plus rentables du monde.",
  "Les mangakas travaillent souvent plus de 12 heures par jour pour publier leurs chapitres.",
  "Les personnages d’anime ont parfois des tailles de cheveux impossibles dans la réalité.",
  "L’anime Neon Genesis Evangelion a révolutionné le genre mecha.",
  "Dragon Ball Z est l’un des anime les plus diffusés dans le monde.",
  "Les chats maneki-neko sont souvent vus dans les anime japonais comme porte-bonheur.",
  "Les anime de sport sont très populaires au Japon, comme Haikyuu ou Kuroko no Basket.",
  "Le personnage de Goku est inspiré du Roi Singe de la mythologie chinoise.",
  "Les studios d’animation utilisent souvent des storyboards détaillés pour chaque scène.",
  "Les mechas géants sont un élément central dans des anime comme Gundam.",
  "Le manga JoJo’s Bizarre Adventure est célèbre pour ses poses extravagantes.",
  "Les animes slice-of-life montrent souvent la vie quotidienne de manière réaliste.",
  "Les shōnen sont destinés à un public adolescent masculin, tandis que les shōjo ciblent les adolescentes.",
  "Le manga Tokyo Ghoul explore des thèmes de l’horreur et de la survie.",
  "Les animes fantasy comme Fairy Tail utilisent souvent des pouvoirs magiques variés.",
  "L’anime Your Name a été un énorme succès international en 2016.",
  "Les seiyuus populaires ont souvent de grandes bases de fans au Japon.",
  "Les génériques d’anime peuvent devenir très célèbres indépendamment de la série.",
  "Certaines scènes de Dragon Ball ont été censurées pour le public occidental.",
  "Les épisodes spéciaux ou OVA permettent d’explorer des histoires parallèles.",
  "L’anime One Piece a dépassé les 1 000 épisodes.",
  "Le manga Attack on Titan a été inspiré par des films et des livres de science-fiction.",
  "Les films Studio Ghibli sont souvent doublés dans plusieurs langues avec des voix célèbres.",
  "Les personnages d’anime ont parfois des yeux colorés de manière irréaliste.",
  "Les animes comiques comme Gintama utilisent beaucoup de parodies et références culturelles.",
  "Les doublages anglais peuvent modifier légèrement les noms ou dialogues des personnages.",
  "Les animes historiques recréent parfois fidèlement des événements ou époques japonais.",
  "Le manga One Piece a été commencé par Eiichiro Oda en 1997.",
  "Les anime sont souvent adaptés en jeux vidéo populaires.",
  "Les festivals d’anime comme Comiket sont énormes au Japon.",
  "Les personnages de manga sont souvent dessinés avec des traits simplifiés pour gagner du temps.",
  "Les opening et ending changent souvent à chaque arc dans les shōnen longs.",
  "Le manga Dragon Ball a été publié dans le magazine Weekly Shōnen Jump.",
  "Les studios d’anime utilisent parfois des images 3D pour faciliter l’animation.",
  "Les personnages d’anime ont parfois des animaux compagnons très populaires.",
  "Les anime de romance montrent souvent des malentendus et quiproquos.",
  "Les light novels inspirent de nombreux animes récents.",
  "Les studios Ghibli ont refusé de collaborer avec Pixar pour garder leur style unique.",
  "Certaines séries d’anime durent plus de 20 ans, comme Detective Conan.",
  "Les anime d’horreur jouent beaucoup sur l’ambiance et les ombres.",
  "Les animes de musique montrent souvent des concerts et la création musicale.",
  "Le personnage de Luffy a été inspiré par les pirates classiques et le manga Dragon Ball.",
  "Les seiyuus peuvent chanter les chansons de leurs personnages.",
  "Le manga Naruto a popularisé le concept des techniques ninja surnaturelles.",
  "Les anime culinaires montrent souvent des plats extrêmement détaillés et appétissants.",
  "Les anime futuristes explorent souvent la technologie et l’intelligence artificielle.",
  "Le manga Detective Conan est publié depuis 1994 et continue encore aujourd’hui.",
  "Certaines scènes d’anime sont inspirées de lieux réels au Japon.",
  "Les anime de mecha combinent souvent action et drame humain.",
  "Les opening d’anime ont parfois des chorégraphies célèbres.",
  "Les animes de type isekai transportent les personnages dans des mondes parallèles.",
  "Les mangakas utilisent parfois des assistants pour dessiner certains éléments."
            ];
let index=0;
function showFact(){ factText.style.opacity=0; setTimeout(()=>{ factText.textContent=facts[index]; factText.style.opacity=1; index=(index+1)%facts.length; },1200); }
showFact(); setInterval(showFact,11000);
