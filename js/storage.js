// --- Save Game ---
function saveGame() {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem("idleGameSave", json);
  } catch (e) {
    console.warn("Save failed", e);
  }
}

function loadGame() {
  const json = localStorage.getItem("idleGameSave");
  if (!json) return;
  try {
    const parsed = JSON.parse(json);
    for (const k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) state[k] = parsed[k];
    }
  } catch (e) {
    console.warn("Load failed", e);
    localStorage.removeItem("idleGameSave");
  }
}

setInterval(saveGame, 5000);