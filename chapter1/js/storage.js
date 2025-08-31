// storage.js
window.saveGame = function() {
  try {
    const json = JSON.stringify(state);
    const b64 = btoa(encodeURIComponent(json));
    localStorage.setItem("idleGameSave", b64);
    if (typeof showFeedback === "function") showFeedback("Game saved.");
  } catch (e) {
    console.warn("Save failed", e);
  }
};

window.loadGame = function() {
  const b64 = localStorage.getItem("idleGameSave");
  if (!b64) return;
  try {
    const json = decodeURIComponent(atob(b64));
    const parsed = JSON.parse(json);
    Object.keys(parsed).forEach(k => {
      if (parsed.hasOwnProperty(k)) state[k] = parsed[k];
    });
    if (typeof showFeedback === "function") showFeedback("Game loaded.");
  } catch (e) {
    console.warn("Load failed", e);
  }
};
