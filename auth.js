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

  document.getElementById("open-login").addEventListener("click", e => {
    e.preventDefault();
    loginModal.style.display = "block";
    setTimeout(() => loginModal.classList.add("show"), 10);
});

  document.getElementById("open-signup").addEventListener("click", e => {
    e.preventDefault();
    signupModal.style.display = "block";
    setTimeout(() => signupModal.classList.add("show"), 10);
});


  document.getElementById("close-login").addEventListener("click", () => {
    loginModal.classList.remove("show");
    setTimeout(() => loginModal.style.display = "none", 300);
});

document.getElementById("close-signup").addEventListener("click", () => {
    signupModal.classList.remove("show");
    setTimeout(() => signupModal.style.display = "none", 300);
});


  // --- Inscription ---
  document.getElementById("signup").addEventListener("click", () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        alert("Compte créé : " + userCredential.user.email);
        signupModal.style.display = "none";
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
        loginModal.style.display = "none";
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


