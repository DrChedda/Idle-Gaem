const debugMenu = document.createElement("div");
Object.assign(debugMenu.style, {
  position: "fixed", top: "10px", left: "10px",
  background: "rgba(30,30,30,0.85)", color: "#ccc",
  font: "16px monospace", padding: "10px 14px",
  border: "1px solid #555", borderRadius: "5px",
  lineHeight: "1.6em",
  display: "none", zIndex: "1000",
  pointerEvents: "none"
});
if (document.body) {
  document.body.appendChild(debugMenu);
} else {
  window.addEventListener('DOMContentLoaded', () => document.body.appendChild(debugMenu));
}

let debugEnabled = false;
let savedMaterials = null;

function toggleDebugger() {
  debugEnabled = !debugEnabled;
  debugMenu.style.display = debugEnabled ? "block" : "none";

  if (debugEnabled) {
    savedMaterials = (window.state && typeof window.state.materials === 'number') ? window.state.materials : null;
    if (!window.state) window.state = {};
    window.state.materials = (window.state.materials || 0) + 100000;

    if (typeof animateMaterialChange === 'function') animateMaterialChange(window.state.materials);
    if (typeof updateAllUI === 'function') updateAllUI();
    updateDebugMenu();
    if (typeof showFeedback === 'function') showFeedback("Debug Menu Opened");
  } else {
    if (savedMaterials !== null && window.state) {
      window.state.materials = savedMaterials;
      savedMaterials = null;
    }

    if (typeof animateMaterialChange === 'function') animateMaterialChange(window.state ? window.state.materials : 0);
    if (typeof updateAllUI === 'function') updateAllUI();
    if (typeof showFeedback === 'function') showFeedback("Debug Menu Closed");
  }
}

function updateDebugMenu() {
  if (!debugEnabled) return;

  const memory = performance && performance.memory ? performance.memory : null;
  let memoryInfo = "Memory info not available";
  if (memory) {
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
    memoryInfo = `Memory Used: ${usedMB} MB / ${totalMB} MB (Limit: ${limitMB} MB)`;
  }

  const pickaxeCounts = Object.entries(state.items || {})
    .filter(([key]) => key.includes("Pickaxe"))
    .map(([key, count]) => `${key}: ${count}`)
    .join(", ") || "None";

  debugMenu.innerHTML = `
    <strong>DEBUG MENU - CHAPTER 1</strong><br>
    Materials: ${state.materials}<br>
    Per Click: ${state.perClick}<br>
    Measured RPS: ${state.measuredRps.toFixed(2)}<br>
    Crate Costs: Basic ${state.crateCost}, Adv ${state.advancedCrateCost}, Epic ${state.epicCrateCost}<br>
    Crates Opened: Basic ${state.cratesOpened?.basic || 0}, Adv ${state.cratesOpened?.advanced || 0}, Epic ${state.cratesOpened?.epic || 0}<br>
    Pickaxes: ${pickaxeCounts}<br>
    <strong>MEMORY</strong><br>
    ${memoryInfo}<br>
  `;
  requestAnimationFrame(updateDebugMenu);
}

window.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "[") {
    e.preventDefault();
    toggleDebugger();
  }
});