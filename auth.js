// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  // ⚡ Config Firebase
  const firebaseConfig = {
    apiKey: "TA_CLE_API",
    authDomain: "ton-projet.firebaseapp.com",
    projectId: "ton-projet",
    storageBucket: "ton-projet.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcd1234"
  };

  // Init Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // --- Modales ---
  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");

  // --- Overlay ---
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.classList.add("modal-overlay");
  document.body.appendChild(overlay);

  // Fonction pour ouvrir modale
  function openModal(modal) {
    overlay.style.display = "block";
    setTimeout(() => overlay.classList.add("show"), 10);

    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);
  }

  // Fonction pour fermer modale
  function closeModal(modal) {
    modal.classList.remove("show");
    overlay.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      overlay.style.display = "none";
    }, 300);
  }

  // Ouvrir modales
  document.getElementById("open-login").addEventListener("click", e => {
    e.preventDefault();
    openModal(loginModal);
  });

  document.getElementById("open-signup").addEventListener("click", e => {
    e.preventDefault();
    openModal(signupModal);
  });

  // Fermer modales
  document.getElementById("close-login").addEventListener("click", () => closeModal(loginModal));
  document.getElementById("close-signup").addEventListener("click", () => closeModal(signupModal));

  // --- Inscription ---
  document.getElementById("signup").addEventListener("click", () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        alert("Compte créé : " + userCredential.user.email);
        closeModal(signupModal);
      })
      .catch(error => alert("Erreur : " + error.message));
  });

  // --- Connexion ---
  document.getElementById("login").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        alert("Connecté : " + userCredential.user.email);
        closeModal(loginModal);
      })
      .catch(error => alert("Erreur : " + error.message));
  });

  // --- Déconnexion ---
  document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => alert("Déconnecté !"));
  });

  // --- Suivi utilisateur ---
  onAuthStateChanged(auth, user => {
    if (user) {
      document.getElementById("logout").style.display = "inline-block";
    } else {
      document.getElementById("logout").style.display = "none";
    }
  });

});
