import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // --- Config Firebase ---
  const firebaseConfig = {
    apiKey: "AIzaSyCxGh9xsAFoqNhtNwPuqsE8oi9hdcbo9Zk",
    authDomain: "quiz-anime-3c4e7.firebaseapp.com",
    projectId: "quiz-anime-3c4e7",
    storageBucket: "quiz-anime-3c4e7.appspot.com",
    messagingSenderId: "469629091409",
    appId: "1:469629091409:web:790357c7bed5cfac6dc270"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // --- Modales ---
  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");
  document.body.appendChild(overlay);

  const loginLink = document.getElementById("open-login");
  const signupLink = document.getElementById("open-signup");
  const userInfo = document.getElementById("user-info");
  const userPseudo = document.getElementById("user-pseudo");
  const logoutBtn = document.getElementById("logout");
  const bestScoreEl = document.getElementById("best-score");

  function openModal(modal) {
    overlay.style.display = "block";
    modal.style.display = "block";
    requestAnimationFrame(() => {
      overlay.classList.add("show");
      modal.classList.add("show");
    });
  }

  function closeModal(modal) {
    modal.classList.remove("show");
    overlay.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      overlay.style.display = "none";
      const msg = modal.querySelector(".modal-message");
      if(msg) msg.textContent = "";
    }, 300);
  }

  loginLink.addEventListener("click", e => { e.preventDefault(); openModal(loginModal); });
  signupLink.addEventListener("click", e => { e.preventDefault(); openModal(signupModal); });
  document.getElementById("close-login").addEventListener("click", () => closeModal(loginModal));
  document.getElementById("close-signup").addEventListener("click", () => closeModal(signupModal));
  overlay.addEventListener("click", () => { closeModal(loginModal); closeModal(signupModal); });

  // --- Firestore: fonctions meilleur score ---
  async function updateBestScore(userId, score) {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);

    if (!docSnap.exists() || score > (docSnap.data().bestScore || 0)) {
      await setDoc(userDoc, { bestScore: score }, { merge: true });
      if(userInfo.style.display !== "none") bestScoreEl.textContent = `Record : ${score}`;
    }
  }

  async function getBestScore(userId) {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    return docSnap.exists() ? docSnap.data().bestScore || 0 : 0;
  }

  // --- Inscription ---
  document.getElementById("signup").addEventListener("click", async () => {
    const pseudo = document.getElementById("signup-pseudo").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const messageEl = document.getElementById("signup-message");

    if(!pseudo || !email || !password){
      messageEl.textContent = "Tous les champs sont obligatoires.";
      messageEl.style.color = "red";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: pseudo });
      await setDoc(doc(db, "users", userCredential.user.uid), { bestScore: 0 });
      messageEl.textContent = `Compte créé : ${pseudo}`;
      messageEl.style.color = "green";
      setTimeout(() => closeModal(signupModal), 1500);
    } catch(error) {
      messageEl.textContent = error.message;
      messageEl.style.color = "red";
    }
  });

  // --- Connexion ---
  document.getElementById("login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const messageEl = document.getElementById("login-message");

    if(!email || !password){
      messageEl.textContent = "Email et mot de passe requis.";
      messageEl.style.color = "red";
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const pseudo = userCredential.user.displayName || userCredential.user.email;
      messageEl.textContent = `Connecté : ${pseudo}`;
      messageEl.style.color = "green";

      const bestScore = await getBestScore(userCredential.user.uid);
      bestScoreEl.textContent = `Record : ${bestScore}`;

      setTimeout(() => closeModal(loginModal), 1500);
    } catch(error) {
      messageEl.textContent = error.message;
      messageEl.style.color = "red";
    }
  });

  // --- Déconnexion ---
  logoutBtn.addEventListener("click", () => signOut(auth));

  // --- État utilisateur ---
  onAuthStateChanged(auth, async user => {
    if(user){
      loginLink.style.display = "none";
      signupLink.style.display = "none";
      userInfo.style.display = "inline-flex";
      userPseudo.textContent = user.displayName || user.email;

      const bestScore = await getBestScore(user.uid);
      bestScoreEl.textContent = `Record : ${bestScore}`;
    } else {
      loginLink.style.display = "inline-block";
      signupLink.style.display = "inline-block";
      userInfo.style.display = "none";
      userPseudo.textContent = "";
      bestScoreEl.textContent = "Record : 0";
    }
  });

// --- Quiz ---
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const quizSection = document.getElementById("quiz");
const accueilSection = document.getElementById("accueil");

// Récupérer le top 25 depuis Firestore
async function getLeaderboard(top = 25) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("bestScore", "desc"), limit(top));
  const querySnapshot = await getDocs(q);

  const leaderboard = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    leaderboard.push({
      pseudo: data.displayName || "Anonyme",
      score: data.bestScore || 0
    });
  });

  return leaderboard;
}

// Afficher le classement dans le DOM
async function displayLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  if(!leaderboardList) return;
  leaderboardList.innerHTML = "";

  const leaderboard = await getLeaderboard(25);
  leaderboard.forEach((user, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${user.pseudo} - ${user.score} pts`;
    leaderboardList.appendChild(li);
  });
}

// Fonction à appeler à la fin d’une partie
async function finishQuiz() {
  const score = parseInt(scoreEl.textContent);
  const user = auth.currentUser;

  if(user){
    await updateBestScore(user.uid, score);
    const bestScore = await getBestScore(user.uid);
    bestScoreEl.textContent = `Record : ${bestScore}`;
    showMessage(`Quiz terminé ! Votre score : ${score}. Record actuel : ${bestScore} 🎉`);
  } else {
    showMessage(`Quiz terminé ! Votre score : ${score}. Connecte-toi pour sauvegarder ton record.`);
  }

  // Réinitialiser le quiz
  scoreEl.textContent = "0";
  livesEl.textContent = "3";
  quizSection.classList.add("hidden");
  accueilSection.classList.remove("hidden");

  // Actualiser le classement
  await displayLeaderboard();
}

// Afficher le leaderboard au chargement
displayLeaderboard();

// Vérifier la fin de partie
function checkGameOver() {
  if(parseInt(livesEl.textContent) <= 0){
    finishQuiz();
  }
}

document.getElementById("validate").addEventListener("click", () => {
  // ici ton code de validation
  checkGameOver();
});



