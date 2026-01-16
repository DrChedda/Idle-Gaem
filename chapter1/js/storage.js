function saveGame() {
  try {
    const saveData = JSON.stringify(window.state);
    localStorage.setItem("rebirthOne", saveData);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error("Save failed: LocalStorage is full!");
    } else {
      console.warn("Save failed", e);
    }
  }
}

setInterval(saveGame, 30000);