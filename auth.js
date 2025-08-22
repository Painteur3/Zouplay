import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

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

  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");
  const overlay = document.querySelector(".modal-overlay");

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

  // --- Auth / Firestore ---
  async function updateBestScore(userId, score) {
    const userDoc = doc(db, "users", userId);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists() || score > (docSnap.data().bestScore || 0)) {
      await setDoc(userDoc, { bestScore: score }, { merge: true });
      if(userInfo.style.display !== "none") bestScoreEl.textContent = "Record : " + score;
    }
  }

  document.getElementById("signup").addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const pseudo = document.getElementById("signup-pseudo").value;
    const msg = document.getElementById("signup-message");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: pseudo });
      await setDoc(doc(db, "users", userCred.user.uid), { bestScore: 0, pseudo });
      msg.textContent = "Compte créé !";
      setTimeout(() => closeModal(signupModal), 1000);
    } catch(e) { msg.textContent = e.message; }
  });

  document.getElementById("login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const msg = document.getElementById("login-message");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "Connecté !";
      setTimeout(() => closeModal(loginModal), 500);
    } catch(e) { msg.textContent = e.message; }
  });

  logoutBtn.addEventListener("click", () => signOut(auth));

  onAuthStateChanged(auth, async user => {
    if(user) {
      userInfo.style.display = "block";
      userPseudo.textContent = user.displayName || user.email;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      bestScoreEl.textContent = "Record : " + ((docSnap.data()?.bestScore) || 0);
    } else {
      userInfo.style.display = "none";
      bestScoreEl.textContent = "Record : 0";
    }
  });

  window.updateBestScore = updateBestScore; // exposé pour quiz.js
});
