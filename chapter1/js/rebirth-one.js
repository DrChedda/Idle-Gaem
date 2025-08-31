// rebirth-one.js
let state = window.state || { materials: 0, perClick: 1, measuredRps: 0 };
window.state = state;

function updateMaterialDisplay() {
  const materialDisplay = document.getElementById("material-display"); // query inside function
  if (!materialDisplay) return;
  if (document.getElementById("tab-game").style.display !== "none") {
    materialDisplay.textContent = `Materials: ${state.materials}`;
  }
}

window.addEventListener("load", () => {
    loadGame();

    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
        collectBtn.addEventListener("click", () => {
            state.materials += state.perClick || 1;
            updateMaterialDisplay();
        });
    }

    updateMaterialDisplay();
});
