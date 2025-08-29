// --- Save/load helpers ---
function saveGame() {
  try {
    const json = JSON.stringify(state);
    // UTF-8 safe base64
    const b64 = btoa(unescape(encodeURIComponent(json)));
    localStorage.setItem("idleGameSave", b64);
  } catch (e) {
    console.warn("Save failed", e);
  }
}

function loadGame() {
  const b64 = localStorage.getItem("idleGameSave");
  if (!b64) return;
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    // merge saved keys onto current state (preserve new defaults)
    for (const k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) state[k] = parsed[k];
    }
    showFeedback("Loaded.");
  } catch (e) {
    console.warn("Load failed", e);
  }
}
