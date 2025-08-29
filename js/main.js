window.addEventListener("load", () => {
  loadGame();
  if (window.updateUI) window.updateUI();
  setInterval(saveGame, 5000);
  setInterval(() => { if (window.updateUI) window.updateUI(); }, 1000 / 20);

  const startModal = document.getElementById("start-modal");
  const startCloseBtn = document.getElementById("start-close-btn");
  const dontShowCheckbox = document.getElementById("dont-show-again");

  if (!startModal || !startCloseBtn) return;

  if (!localStorage.getItem("hideStartModal")) {
    startModal.style.display = "flex";
  }

  startCloseBtn.addEventListener("click", () => {
    if (dontShowCheckbox?.checked) {
      localStorage.setItem("hideStartModal", "true");
    } else {
      localStorage.removeItem("hideStartModal");
    }
    startModal.style.display = "none";
  });
});
