
window.addEventListener("load", () => {
  const buttons = document.querySelectorAll(".top-menu button");
  const pages = document.querySelectorAll(".tab-page");
  const materialDisplay = document.getElementById("material-display");
  const saveBtn = document.getElementById("save-btn");
  const loadBtn = document.getElementById("load-btn");
  const resetBtn = document.getElementById("reset-btn");
  const confirmBar = document.getElementById("confirm-bar");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const feedback = document.getElementById("feedback");

  if (confirmBar) confirmBar.style.display = "none";

  let lastMaterials = window.state.materials || 0;
  let materialSamples = [];


  function showFeedback(msg, duration = 1800) {
    if (typeof window.showFeedback === 'function') {
      window.showFeedback(msg, duration);
      return;
    }
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.classList.add("show");
    setTimeout(() => feedback.classList.remove("show"), duration);
  }

  function animateMaterialChange(newVal) {
    const start = lastMaterials;
    const end = newVal;
    const duration = 80;
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      if (materialDisplay && isGameTab()) materialDisplay.textContent = `Materials: ${current}`;
      if (progress < 1) requestAnimationFrame(step);
      else lastMaterials = end;
    }
    requestAnimationFrame(step);
  }

  function pushMaterialSample(mats) {
    const now = Date.now();
    materialSamples.push({ t: now, m: mats });
    const cutoff = now - 10000;
    while (materialSamples.length > 1 && materialSamples[0].t < cutoff) materialSamples.shift();
  }

  function isGameTab() {
    const gameTab = document.getElementById("tab-game");
    return gameTab && gameTab.style.display !== "none";
  }

  function resetMaterials(mats = 0) {
    window.state.materials = mats;
    lastMaterials = mats;
    materialSamples.length = 0;
    pushMaterialSample(mats);
    animateMaterialChange(mats);
    saveGame();
  }

  function popElement(el) {
    if (!el) return;
    el.classList.add("pop");
    setTimeout(() => el.classList.remove("pop"), 120);
  }


  function showTab(tab) {
    pages.forEach(p => p.style.display = "none");
    const current = document.getElementById(`tab-${tab}`);
    if (current) current.style.display = "block";

    buttons.forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.top-menu button[data-tab="${tab}"]`);
    if (btn) btn.classList.add("active");

    if (materialDisplay) materialDisplay.style.display = tab === "game" ? "block" : "none";
    if (feedback) feedback.style.display = "block";

    localStorage.setItem("lastTab", tab);
  }

  buttons.forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));

  showTab("game");


  if (saveBtn) saveBtn.addEventListener("click", () => {
    saveGame();
    showFeedback("Game saved");
  });

  if (loadBtn) loadBtn.addEventListener("click", () => {
    showFeedback("This doesn't do anything yet.");
  });


  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      confirmBar.style.display = "flex";
      if (confirmYes) confirmYes.textContent = "Chapter Reset";
      if (confirmNo) confirmNo.textContent = "Full Reset";
      setTimeout(() => confirmBar.classList.add("show"), 10);
    });
  }

  if (confirmYes) {
    confirmYes.addEventListener("click", () => {

      Object.keys(window.state).forEach(key => delete window.state[key]);

      Object.assign(window.state, {
        materials: 0,
        perClick: 1,
        measuredRps: 0,
        crateCost: 10,
        advancedCrateCost: 100,
        epicCrateCost: 1000,
        cratesOpened: 0,
        items: {}
      });

      resetMaterials(0);
      showFeedback("Chapter data reset!");
      popElement(confirmYes);
      confirmBar.classList.remove("show");
      setTimeout(() => (confirmBar.style.display = "none"), 300);
      window.location.href = "./index.html";
    });
  }


  if (confirmNo) {
    confirmNo.addEventListener("click", () => {

      Object.keys(window.state).forEach(key => delete window.state[key]);

      Object.assign(window.state, {
        materials: 0,
        perClick: 1,
        measuredRps: 0,
        crateCost: 10,
        advancedCrateCost: 100,
        epicCrateCost: 1000,
        cratesOpened: 0,
        items: {}
      });

      resetMaterials(0);
      showFeedback("All data wiped!");
      popElement(confirmNo);
      confirmBar.classList.remove("show");
      setTimeout(() => (confirmBar.style.display = "none"), 300);
      window.location.href = "../index.html";
    });
  }


  pushMaterialSample(window.state.materials || 0);
  setInterval(() => pushMaterialSample(window.state.materials || 0), 1000);
});
