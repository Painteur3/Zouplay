// ----------------------
// IMPORTS
// ----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ----------------------
// INITIALISATION FIREBASE
// ----------------------
const firebaseConfig = {
  apiKey: "AIzaSyCxGh9xsAFoqNhtNwPuqsE8oi9hdcbo9Zk",
  authDomain: "quiz-anime-3c4e7.firebaseapp.com",
  projectId: "quiz-anime-3c4e7",
  storageBucket: "quiz-anime-3c4e7.appspot.com",
  messagingSenderId: "469629091409",
  appId: "1:469629091409:web:790357c7bed5cfac6dc270"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ----------------------
// DOM & MODALS
// ----------------------
document.addEventListener("DOMContentLoaded", () => {

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
      modal.querySelector(".modal-message").textContent = "";
    }, 300);
  }

  loginLink.addEventListener("click", e => { e.preventDefault(); openModal(loginModal); });
  signupLink.addEventListener("click", e => { e.preventDefault(); openModal(signupModal); });
  document.getElementById("close-login").addEventListener("click", () => closeModal(loginModal));
  document.getElementById("close-signup").addEventListener("click", () => closeModal(signupModal));
  overlay.addEventListener("click", () => { closeModal(loginModal); closeModal(signupModal); });

  // ----------------------
  // SIGNUP
  // ----------------------
  document.getElementById("signup").addEventListener("click", () => {
    const pseudo = document.getElementById("signup-pseudo").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const messageEl = document.getElementById("signup-message");

    if(!pseudo || !email || !password){
      messageEl.textContent = "Tous les champs sont obligatoires.";
      messageEl.style.color = "red";
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => updateProfile(userCredential.user, { displayName: pseudo }))
      .then(() => {
        messageEl.textContent = `Compte créé : ${pseudo}`;
        messageEl.style.color = "green";
        setTimeout(() => closeModal(signupModal), 1500);
      })
      .catch(error => {
        messageEl.textContent = error.message;
        messageEl.style.color = "red";
      });
  });

  // ----------------------
  // LOGIN
  // ----------------------
  document.getElementById("login").addEventListener("click", () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const messageEl = document.getElementById("login-message");

    if(!email || !password){
      messageEl.textContent = "Email et mot de passe requis.";
      messageEl.style.color = "red";
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const pseudo = userCredential.user.displayName || userCredential.user.email;
        messageEl.textContent = `Connecté : ${pseudo}`;
        messageEl.style.color = "green";
        setTimeout(() => closeModal(loginModal), 1500);
      })
      .catch(error => {
        messageEl.textContent = error.message;
        messageEl.style.color = "red";
      });
  });

  // ----------------------
  // LOGOUT
  // ----------------------
  logoutBtn.addEventListener("click", () => signOut(auth));

  // ----------------------
  // État de connexion
  // ----------------------
  onAuthStateChanged(auth, user => {
    if(user){
      loginLink.style.display = "none";
      signupLink.style.display = "none";
      userInfo.style.display = "inline-flex";
      userPseudo.textContent = user.displayName || user.email;
    } else {
      loginLink.style.display = "inline-block";
      signupLink.style.display = "inline-block";
      userInfo.style.display = "none";
      userPseudo.textContent = "";
    }
  });

});
