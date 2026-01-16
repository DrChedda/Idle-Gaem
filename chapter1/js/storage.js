
function saveGame() {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem("chapter1Save", json);
  } catch (e) {
    console.warn("Save failed", e);
  }
}

function loadGame() {
  const json = localStorage.getItem("chapter1Save");
  if (!json) return;

  try {
    const parsed = JSON.parse(json);
    for (const k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) {
        rebirthOne[k] = parsed[k];
      }
    }
  } catch (e) {
    console.warn("Load failed", e);
    localStorage.removeItem("idleGameSave");
  }
}

setInterval(saveGame, 5000);
