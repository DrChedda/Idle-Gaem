// debugger.js
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
document.body.appendChild(debugMenu);

let debugEnabled = false;
let savedResources = null;

function toggleDebugger() {
  debugEnabled = !debugEnabled;
  debugMenu.style.display = debugEnabled ? "block" : "none";

  if (debugEnabled) {
    // Save resources and give a debug boost
    savedResources = state.resources;
    state.resources += 100000;
    updateDebugMenu();
    showFeedback("Debug Menu Opened");
  } else {
    // Restore original resources
    if (savedResources !== null) {
      state.resources = savedResources;
      savedResources = null;
    }
    showFeedback("Debug Menu Closed");
  }
}

function updateDebugMenu() {
  if (!debugEnabled) return;

  // Gather memory stats
  const memory = performance && performance.memory ? performance.memory : null;
  let memoryInfo = "Memory info not available";
  if (memory) {
    const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
    const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
    memoryInfo = `Memory Used: ${usedMB} MB / ${totalMB} MB (Limit: ${limitMB} MB)`;
  }

  debugMenu.innerHTML = `
    <strong>DEBUG MENU</strong><br>
    Resources: ${state.resources}<br>
    Per Click: ${state.perClick}<br>
    Upgrade Cost: ${state.upgradeCost}<br>
    Auto Collect: ${state.autoCollect}<br>
    Auto Collect Cost: ${state.autoCollectCost}<br>
    Double Gain: ${state.doubleGain}<br>
    Double Gain Cost: ${state.doubleGainCost}<br>
    Triple Gain: ${state.tripleGain}<br>
    Triple Gain Cost: ${state.tripleGainCost}<br>
    Boost: ${state.boost}<br>
    Boost Cost: ${state.boostCost}<br>
    Lucky Gain: ${state.luckyGain}<br>
    Lucky Gain Cost: ${state.luckyGainCost}<br>
    Measured RPS: ${state.measuredRps.toFixed(2)}<br>
    <strong>MEMORY</strong><br>
    ${memoryInfo}<br>
  `;
  requestAnimationFrame(updateDebugMenu);
}

// Toggle with Ctrl+[
window.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "[") {
    e.preventDefault();
    toggleDebugger();
  }
});
