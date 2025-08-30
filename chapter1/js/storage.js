window.saveGame = function() {
  try {
    const json = JSON.stringify(state);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    localStorage.setItem("idleGameSave", b64);
  } catch (e) {
    console.warn("Save failed", e);
  }
};

window.loadGame = function() {
  const b64 = localStorage.getItem("idleGameSave");
  if (!b64) return;
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    // merge saved keys onto current state (preserve new defaults)
    for (const k in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) state[k] = parsed[k];
    }
    if (typeof showFeedback === "function") showFeedback("Loaded.");
  } catch (e) {
    console.warn("Load failed", e);
  }
};

// Reset button
window.addEventListener("load", () => {
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("idleGameSave");
      window.location.href = "../index.html";
    });
  }
});
