window.addEventListener("load", () => {
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("idleGameSave");
      window.location.href = "../index.html";
    });
  }
});
