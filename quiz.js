import { updateBestScore } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-quiz");
  const accueil = document.getElementById("accueil");
  const quizSection = document.getElementById("quiz");

  startBtn.addEventListener("click", () => {
    accueil.classList.add("hidden");
    quizSection.classList.remove("hidden");
    startQuiz();
  });

  function startQuiz() {
    let score = 0;
    let lives = 3;

    const scoreEl = document.getElementById("score");
    const livesEl = document.getElementById("lives");
    const resultEl = document.getElementById("result");

    scoreEl.textContent = score;
    livesEl.textContent = lives;

    document.getElementById("validate").addEventListener("click", async () => {
      const answer = document.getElementById("answer").value.trim();
      if(answer.toLowerCase() === "naruto") {
        score += 10;
        resultEl.textContent = "✅ Correct !";
      } else {
        lives -= 1;
        resultEl.textContent = "❌ Faux !";
      }

      scoreEl.textContent = score;
      livesEl.textContent = lives;

      if(lives <= 0) {
        alert("Game over ! Score : " + score);
        // update Firestore if connected
        if(window.auth?.currentUser) await updateBestScore(window.auth.currentUser.uid, score);
        location.reload();
      }
    });
  }
});
