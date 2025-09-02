// --- Save Game ---
function saveGame() {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem("idleGameSave", json);
    // Optional feedback
    // showFeedback("Game saved");
  } catch (e) {
    console.warn("Save failed", e);
  }
}

// --- Load Game ---
function loadGame() {
  const json = localStorage.getItem("idleGameSave");
  if (!json) return; // nothing saved

  try {
    const parsed = JSON.parse(json);
    for (const k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) {
        rebirthOne[k] = parsed[k];
      }
    }
    // Optional feedback
    // showFeedback("Game loaded");
  } catch (e) {
    console.warn("Load failed", e);
    // Remove corrupt save so it doesn't break next time
    localStorage.removeItem("idleGameSave");
  }
}

// Example: auto-save every 5 seconds
setInterval(saveGame, 5000);
