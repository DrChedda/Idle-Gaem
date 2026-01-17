window.addEventListener("load", () => {
  const el = {
    buttons: document.querySelectorAll(".top-menu button"),
    pages: document.querySelectorAll(".tab-page"),
    materialDisplay: document.getElementById("material-display"),
    confirmBar: document.getElementById("confirm-bar"),
    feedback: document.getElementById("feedback"),
    btnSave: document.getElementById("save-btn"),
    btnReset: document.getElementById("reset-btn"),
    btnYesChapter: document.getElementById("confirm-yes-chapter"),
    btnYesFull: document.getElementById("confirm-yes-full"),
    btnNo: document.getElementById("confirm-no")
  };

  let lastMaterials = window.state?.materials || 0;
  let materialSamples = [];
  let feedbackData = { lastMessage: null, count: 0, timeout: null };

  function closeConfirmBar(clickedEl) {
    if (clickedEl) popElement(clickedEl);
    if (!el.confirmBar) return;
    el.confirmBar.classList.remove("show");
    setTimeout(() => (el.confirmBar.style.display = "none"), 300);
  }

  function popElement(target) {
    if (!target) return;
    target.classList.add("pop");
    setTimeout(() => target.classList.remove("pop"), 120);
  }

  function showFeedback(msg, duration = 1800) {
    if (typeof window.showFeedback === 'function') return window.showFeedback(msg, duration);
    if (!el.feedback) return;

    feedbackData.count = (msg === feedbackData.lastMessage) ? feedbackData.count + 1 : 1;
    feedbackData.lastMessage = msg;

    if (feedbackData.timeout) clearTimeout(feedbackData.timeout);

    el.feedback.textContent = `${msg}${feedbackData.count > 1 ? ` ${feedbackData.count}x` : ''}`;
    el.feedback.classList.add("show");

    feedbackData.timeout = setTimeout(() => {
      el.feedback.classList.remove("show");
      feedbackData.lastMessage = null;
    }, duration);
  }

  function animateMaterialChange(newVal) {
    if (!el.materialDisplay || !isGameTab()) {
      lastMaterials = newVal;
      return;
    }

    const start = lastMaterials;
    const duration = 80;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = Math.floor(start + (newVal - start) * progress);
      
      el.materialDisplay.textContent = `Materials: ${current}`;

      if (progress < 1) requestAnimationFrame(step);
      else lastMaterials = newVal;
    }
    requestAnimationFrame(step);
  }

  function isGameTab() {
    const gameTab = document.getElementById("tab-game");
    return gameTab && gameTab.style.display !== "none";
  }

  function resetMaterials(mats = 0) {
    window.state.materials = mats;
    lastMaterials = mats;
    materialSamples = [{ t: Date.now(), m: mats }];
    animateMaterialChange(mats);
    if (typeof saveGame === 'function') saveGame();
  }

  function showTab(tabId) {
    el.pages.forEach(p => p.style.display = p.id === `tab-${tabId}` ? "block" : "none");
    el.buttons.forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
    
    if (el.materialDisplay) el.materialDisplay.style.display = tabId === "game" ? "block" : "none";
    localStorage.setItem("lastTab", tabId);
  }

  const menu = document.querySelector(".top-menu");
  if (menu) {
    menu.addEventListener("click", (e) => {
      const tab = e.target.closest("button")?.dataset.tab;
      if (tab) showTab(tab);
    });
  }

  if (el.btnSave) {
    el.btnSave.addEventListener("click", () => {
      if (typeof saveGame === 'function') saveGame();
      showFeedback("Game saved");
    });
  }

  if (el.btnReset) {
    el.btnReset.addEventListener("click", () => {
      el.confirmBar.style.display = "flex";
      el.btnYesChapter.textContent = "Chapter Reset";
      el.btnYesFull.textContent = "Full Reset";
      el.btnNo.textContent = "Cancel";
      setTimeout(() => el.confirmBar.classList.add("show"), 10);
    });
  }

  el.btnYesChapter?.addEventListener("click", () => {
    localStorage.removeItem("rebirthOne");
    window.state = JSON.parse(JSON.stringify(window.DEFAULT_STATE));
    resetMaterials(0);
    closeConfirmBar(el.btnYesChapter);
    window.location.reload();
  });

  el.btnYesFull?.addEventListener("click", () => {
    localStorage.clear();
    closeConfirmBar(el.btnYesFull);
    window.location.href = "../index.html";
  });

  el.btnNo?.addEventListener("click", () => closeConfirmBar(el.btnNo));

  if (el.confirmBar) el.confirmBar.style.display = "none";
  showTab(localStorage.getItem("lastTab") || "game");
  
  setInterval(() => {
    const now = Date.now();
    materialSamples.push({ t: now, m: window.state.materials || 0 });
    const cutoff = now - 10000;
    while (materialSamples.length > 1 && materialSamples[0].t < cutoff) materialSamples.shift();
  }, 1000);
});