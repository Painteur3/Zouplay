import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

// 🔹 Config Firebase (récupérée depuis ta console)
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

  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");
  document.body.appendChild(overlay);

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
      modal.querySelector(".modal-message").textContent = ""; // clear message
    }, 300);
  }

  // Ouverture/fermeture modales
  document.getElementById("open-login").addEventListener("click", e => { e.preventDefault(); openModal(loginModal); });
  document.getElementById("open-signup").addEventListener("click", e => { e.preventDefault(); openModal(signupModal); });
  document.getElementById("close-login").addEventListener("click", () => closeModal(loginModal));
  document.getElementById("close-signup").addEventListener("click", () => closeModal(signupModal));
  overlay.addEventListener("click", () => { closeModal(loginModal); closeModal(signupModal); });

// --- Inscription ---
document.getElementById("signup").addEventListener("click", () => {
  const pseudo = document.getElementById("signup-pseudo").value; // nouveau
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const messageEl = document.getElementById("signup-message");

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Mettre à jour le displayName
      return updateProfile(userCredential.user, { displayName: pseudo })
        .then(() => {
          messageEl.textContent = `Compte créé : ${pseudo} (${userCredential.user.email})`;
          messageEl.style.color = "green";
          setTimeout(() => closeModal(signupModal), 1500);
        });
    })
    .catch(error => {
      messageEl.textContent = error.message;
      messageEl.style.color = "red";
    });
});

  // --- Connexion ---
  document.getElementById("login").addEventListener("click", () => {
    const pseudo = document.getElementById("signup-pseudo").value;
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const messageEl = document.getElementById("login-message");

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        messageEl.textContent = `Connecté : ${userCredential.user.email}`;
        messageEl.style.color = "green";
        setTimeout(() => closeModal(loginModal), 1500);
      })
      .catch(error => {
        messageEl.textContent = error.message;
        messageEl.style.color = "red";
      });
  });

  // --- Déconnexion ---
  document.getElementById("logout").addEventListener("click", () => {
    signOut(auth);
  });

  // --- Suivi utilisateur ---
  onAuthStateChanged(auth, user => {
    document.getElementById("logout").style.display = user ? "inline-block" : "none";
  });

});



