// ----- VARIABLES GLOBALES -----
const categories = {
  "Animaux": ["Chat", "Chien", "Lion", "Tigre"],
  "Fruits": ["Pomme", "Banane", "Orange", "Mangue"],
  "Pays": ["France", "Italie", "Japon", "Brésil"]
};

let personnages = [];
let currentPerso = null;
let score = 0;
let lives = 3;

// ----- ELEMENTS HTML -----
const accueil = document.getElementById("accueil");
const quiz = document.getElementById("quiz");
const categoriesContainer = document.getElementById("categories-container");
const startBtn = document.getElementById("start-btn");
const persoName = document.getElementById("perso-name");
const answerInput = document.getElementById("answer");
const submitBtn = document.getElementById("submit-btn");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

// ----- INITIALISATION DES CATEGORIES -----
function initCategories() {
  categoriesContainer.innerHTML = ""; // on nettoie juste le conteneur
  for (let cat in categories) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cat;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(cat));
    categoriesContainer.appendChild(label);
    categoriesContainer.appendChild(document.createElement("br"));
  }
}
initCategories();

// ----- FONCTION POUR AFFICHER UN PERSONNAGE -----
function afficherPerso() {
  if (personnages.length === 0) {
    alert("Quiz terminé !");
    accueil.classList.remove("hidden");
    quiz.classList.add("hidden");
    return;
  }
  const index = Math.floor(Math.random() * personnages.length);
  currentPerso = personnages[index];
  persoName.textContent = currentPerso;
}

// ----- GESTION DU BOUTON START -----
startBtn.addEventListener("click", () => {
  score = 0;
  lives = 3;
  currentPerso = null;

  // Récupérer les catégories cochées
  const selected = Array.from(categoriesContainer.querySelectorAll("input[type=checkbox]:checked"))
    .map(cb => cb.value);

  // Si aucune sélection, prendre toutes les catégories
  if (selected.length === 0) {
    personnages = Object.values(categories).flat();
  } else {
    personnages = selected.flatMap(cat => categories[cat]);
  }

  // Ne pas toucher aux checkbox, seulement cacher accueil et montrer quiz
  accueil.classList.add("hidden");
  quiz.classList.remove("hidden");

  afficherPerso();
  answerInput.value = "";
  answerInput.focus();
  scoreEl.textContent = score;
  livesEl.textContent = lives;
});

// ----- GESTION DU BOUTON SUBMIT -----
submitBtn.addEventListener("click", () => {
  const answer = answerInput.value.trim();
  if (answer.toLowerCase() === currentPerso.toLowerCase()) {
    score++;
  } else {
    lives--;
  }

  scoreEl.textContent = score;
  livesEl.textContent = lives;

  if (lives <= 0) {
    alert("Game Over !");
    accueil.classList.remove("hidden");
    quiz.classList.add("hidden");
    return;
  }

  // Retirer le personnage courant pour ne pas le répéter
  personnages = personnages.filter(p => p !== currentPerso);

  answerInput.value = "";
  afficherPerso();
  answerInput.focus();
});
