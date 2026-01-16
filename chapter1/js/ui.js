
window.addEventListener("load", () => {
  const buttons = document.querySelectorAll(".top-menu button");
  const pages = document.querySelectorAll(".tab-page");
  const materialDisplay = document.getElementById("material-display");
  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const confirmBar = document.getElementById("confirm-bar");
  const confirmYesFull = document.getElementById("confirm-yes-full");
  const confirmYesChapter = document.getElementById("confirm-yes-chaper");
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



  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      confirmBar.style.display = "flex";
      if (confirmYes) confirmYes.textContent = "Chapter Reset";
      if (confirmNo) confirmNo.textContent = "Full Reset";
      setTimeout(() => confirmBar.classList.add("show"), 10);
    });
  }

  if (confirmYesChapter) {
    confirmYesChapter.addEventListener("click", () => {
      localStorage.removeItem("chapter1Save");

      resetMaterials(0);
      showFeedback("Chapter data reset!");
      popElement(confirmYesChapter);
      confirmBar.classList.remove("show");
      setTimeout(() => (confirmBar.style.display = "none"), 300);
      window.location.href = "./index.html";
    });
  }


  if (confirmYesFull) {
    confirmYesFull.addEventListener("click", () => {
      localStorage.removeItem("chapter1Save");
      localStorage.removeItem("mainSave");

      resetMaterials(0);
      showFeedback("All data wiped!");
      popElement(confirmYesFull);
      confirmBar.classList.remove("show");
      setTimeout(() => (confirmBar.style.display = "none"), 300);
      window.location.href = "../index.html";
    });
  }

  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      popElement(confirmNo);
      confirmBar.classList.remove("show");
      setTimeout(() => (confirmBar.style.display = "none"), 300);
    });
  }


  pushMaterialSample(window.state.materials || 0);
  setInterval(() => pushMaterialSample(window.state.materials || 0), 1000);
});
