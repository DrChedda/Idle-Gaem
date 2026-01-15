


function showFeedback(msg) {


  const feedbackEl = document.getElementById('feedback');
  if (!feedbackEl) return;
  feedbackEl.textContent = msg;
  feedbackEl.classList.add('show');
  setTimeout(() => feedbackEl.classList.remove('show'), 1800);
}

window.addEventListener("load", () => {

  const resourceDisplay = document.getElementById("resource-display");
  const collectBtn = document.getElementById("collect-btn");
  const upgradeBtn = document.getElementById("buy-upgrade");
  const autoBtn = document.getElementById("upgrade-auto");
  const doubleBtn = document.getElementById("upgrade-double");
  const tripleBtn = document.getElementById("upgrade-triple");
  const boostBtn = document.getElementById("upgrade-boost");
  const luckyBtn = document.getElementById("upgrade-lucky");
  const newAgeBtn = document.getElementById("upgrade-new-age");
  const saveBtn = document.getElementById("save-btn");
  const loadBtn = document.getElementById("load-btn");
  const resetBtn = document.getElementById("reset-btn");
  const optionsModal = document.getElementById("options-modal");
  const optionsBtn = document.getElementById("options-btn");
  const optionsCloseBtn = document.getElementById("options-close-btn");
  const feedback = document.getElementById("feedback");
  const lineSVG = document.getElementById("svg-lines");
  const confirmBar = document.getElementById("confirm-bar");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");
  const rpsAutoEl = document.getElementById("rps-auto");
  const rpsTotalEl = document.getElementById("rps-total");
  const measuredRpsEl = document.getElementById("rps-display");

  if (confirmBar) { confirmBar.hidden = true; confirmBar.style.display = "none"; }

  let lastResources = state.resources;
  const resourceSamples = [];
  const clickTimestamps = [];



  function luckyMultiplier() {
    const p = 0.12;
    const luckyFactor = 6;
    return state.luckyGain ? (1 + (luckyFactor - 1) * p) : 1;
  }

  function perClickWithModifiers() {
    let v = state.perClick;
    if (state.doubleGain) v *= 2;
    if (state.boost) v *= 3;
    v *= luckyMultiplier();
    return v;
  }

  function animateResourceChange(newVal) {
    const start = lastResources;
    const end = newVal;
    const duration = 80;
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      if (resourceDisplay) resourceDisplay.textContent = `Resources: ${formatNumber(current)}`;
      if (progress < 1) requestAnimationFrame(step);
      else lastResources = end;
    }
    requestAnimationFrame(step);
  }

  function pushResourceSample() {
    const now = Date.now();
    resourceSamples.push({ t: now, r: state.resources });
    const cutoff = now - 10000;
    while (resourceSamples.length > 1 && resourceSamples[0].t < cutoff) resourceSamples.shift();
  }

  function computeMeasuredRPS() {
    if (resourceSamples.length < 2) return 0;
    const first = resourceSamples[0];
    const last = resourceSamples[resourceSamples.length - 1];
    const secs = (last.t - first.t) / 1000;
    if (secs <= 0) return 0;
    const delta = last.r - first.r;
    return delta / secs;
  }

  function pushClickSample(ts) {
    clickTimestamps.push(ts);
    const cutoff = ts - 10000;
    while (clickTimestamps.length > 0 && clickTimestamps[0] < cutoff) clickTimestamps.shift();
  }

  function computeClicksPerSec() {
    const now = Date.now();
    const cutoff = now - 10000;
    while (clickTimestamps.length > 0 && clickTimestamps[0] < cutoff) clickTimestamps.shift();
    if (clickTimestamps.length === 0) return 0;
    const first = clickTimestamps[0];
    const last = clickTimestamps[clickTimestamps.length - 1];
    const secs = Math.max(0.001, (last - first) / 1000);
    return clickTimestamps.length === 1 ? (1 / 10) : (clickTimestamps.length / secs);
  }

  function stateHasUpgrade(id) {
    switch (id) {
      case "buy-upgrade": return state.perClick > 1;
      case "upgrade-auto": return state.autoCollect;
      case "upgrade-double": return state.doubleGain;
      case "upgrade-triple": return state.tripleGain;
      case "upgrade-boost": return state.boost;
      case "upgrade-lucky": return state.luckyGain;
      default: return false;
    }
  }

  function getCostFor(id) {
    switch (id) {
      case "buy-upgrade": return state.upgradeCost;
      case "upgrade-auto": return state.autoCollectCost;
      case "upgrade-double": return state.doubleGainCost;
      case "upgrade-triple": return state.tripleGainCost;
      case "upgrade-boost": return state.boostCost;
      case "upgrade-lucky": return state.luckyGainCost;
      case "upgrade-new-age": return 0;
      default: return Infinity;
    }
  }

  function popButton(btn) {
    if (!btn) return;
    btn.classList.add("pop");
    setTimeout(() => btn.classList.remove("pop"), 120);
  }


  function updateUpgradeButtons() {
    const upgradeDeps = {
      "upgrade-auto": ["buy-upgrade"],
      "upgrade-double": ["buy-upgrade"],
      "upgrade-triple": ["upgrade-double"],
      "upgrade-boost": ["upgrade-auto"],
      "upgrade-lucky": ["upgrade-boost", "upgrade-triple"],
      "upgrade-new-age": ["upgrade-lucky"]
    };

    const buttons = [
      "buy-upgrade",
      "upgrade-auto",
      "upgrade-double",
      "upgrade-triple",
      "upgrade-boost",
      "upgrade-lucky",
      "upgrade-new-age"
    ];

    if (newAgeBtn) {
      const totalUpgrades = [
        state.perClick > 1,
        state.autoCollect,
        state.doubleGain,
        state.tripleGain,
        state.boost,
        state.luckyGain
      ];
      const purchasedCount = totalUpgrades.filter(Boolean).length;
      const minToShow = 2;

      if (purchasedCount < minToShow) {
        newAgeBtn.style.opacity = 0;
        newAgeBtn.style.pointerEvents = "none";
      } else {
        const maxUpgrades = totalUpgrades.length;
        const opacity = (purchasedCount - minToShow) / (maxUpgrades - minToShow);
        newAgeBtn.style.opacity = opacity;
        newAgeBtn.style.pointerEvents = "auto"; // enable clicks once visible
      }
    }

    for (const id of buttons) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      const deps = upgradeDeps[id] || [];
      let unlocked = true;
      for (const dep of deps) if (!stateHasUpgrade(dep)) { unlocked = false; break; }

      const cost = getCostFor(id);
      const canAfford = state.resources >= cost;
      const shouldGrey = !unlocked;

      btn.disabled = !canAfford || shouldGrey;
      btn.style.pointerEvents = shouldGrey ? "none" : "auto";
      btn.style.backgroundColor = shouldGrey ? "#666" : "#222";
      btn.style.color = shouldGrey ? "#999" : "#fff";
    }
  }
  
  function updateSVGLines() {
    if (!lineSVG) return;
    const parentRect = lineSVG.getBoundingClientRect();
    lineSVG.innerHTML = "";
    lineSVG.setAttribute("width", parentRect.width);
    lineSVG.setAttribute("height", parentRect.height);

    const nodes = {
      upgrade: document.getElementById("buy-upgrade"),
      auto: document.getElementById("upgrade-auto"),
      double: document.getElementById("upgrade-double"),
      triple: document.getElementById("upgrade-triple"),
      boost: document.getElementById("upgrade-boost"),
      lucky: document.getElementById("upgrade-lucky"),
      newAge: document.getElementById("upgrade-new-age")
    };

    function centerOf(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - parentRect.left, y: r.top + r.height / 2 - parentRect.top };
    }

    if (settings.theme === "dark") {
      function drawLine(a, b, color = "rgba(255,255,255,0.95)") {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x);
        line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x);
        line.setAttribute("y2", b.y);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        line.style.pointerEvents = "none";
        lineSVG.appendChild(line);
      }
    }

    if (settings.theme === "light") {
      function drawLine(a, b, color = "rgba(0, 0, 0, 0.95)") {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x);
        line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x);
        line.setAttribute("y2", b.y);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        line.style.pointerEvents = "none";
        lineSVG.appendChild(line);
      }
    }
    
    try {
      const upC = centerOf(nodes.upgrade);
      const autoC = centerOf(nodes.auto);
      const doubleC = centerOf(nodes.double);
      const tripleC = centerOf(nodes.triple);
      const boostC = centerOf(nodes.boost);
      const luckyC = centerOf(nodes.lucky);
      const newAgeC = centerOf(nodes.newAge);


      drawLine(upC, autoC);
      drawLine(upC, doubleC);
      drawLine(autoC, boostC);
      drawLine(doubleC, tripleC);
      drawLine(boostC, luckyC);
      drawLine(tripleC, luckyC);


      if (state.tripleGain && state.boost) drawLine(luckyC, newAgeC, "rgba(0,255,255,0.95)");
    } catch (e) {
      console.error("Failed to draw SVG lines", e);
    }
  }

  function formatNumber(n) {
    if (n === null || n === undefined) return "0";
    const abs = Math.abs(n);

    if (abs >= 1e18) return n.toExponential(2); // E notation for extremely large numbers
    if (abs >= 1e15) return n.toExponential(2);
    if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T"; // Trillion
    if (abs >= 1e9)  return (n / 1e9).toFixed(2) + "B";  // Billion
    if (abs >= 1e6)  return (n / 1e6).toFixed(2) + "M";  // Million
    if (abs >= 1e3)  return (n / 1e3).toFixed(2) + "K";  // Thousand
    return n.toString();
  }

  function updateUI() {
    if (state.resources !== lastResources) animateResourceChange(state.resources);
    else if (resourceDisplay) resourceDisplay.textContent = `Resources: ${formatNumber(state.resources)}`;

    if (measuredRpsEl) {
      const measured = computeMeasuredRPS();
      if (resourceSamples.length >= 2) state.measuredRps = measured;
      measuredRpsEl.textContent = `Resources/s: ${formatNumber(Number.isInteger(state.measuredRps) ? state.measuredRps : state.measuredRps.toFixed(2))}`;
    }

    const clicksPerSec = computeClicksPerSec();
    const perClick = perClickWithModifiers();
    const clickRPS = clicksPerSec * perClick;
    const autoRPS = state.autoCollect ? perClick : 0;
    const totalEstimated = autoRPS + clickRPS;

    if (rpsAutoEl) rpsAutoEl.textContent = `Auto/s: ${formatNumber(autoRPS)}`;
    if (rpsTotalEl) rpsTotalEl.textContent = `Total/s: ${formatNumber(totalEstimated)}`;

    if (upgradeBtn) upgradeBtn.textContent = `Upgrade Gain [+1] [${formatNumber(state.upgradeCost)}]`;

    if (autoBtn) autoBtn.textContent = state.autoCollect ? `Auto Collect (Owned)` : `Auto Collect [${formatNumber(state.autoCollectCost)}]`;
    if (doubleBtn) doubleBtn.textContent = state.doubleGain ? `Double Gain (Owned)` : `Double Gain [${formatNumber(state.doubleGainCost)}]`;
    if (tripleBtn) tripleBtn.textContent = state.tripleGain ? `Triple Gain (Owned)` : `Triple Gain [${formatNumber(state.tripleGainCost)}]`;
    if (boostBtn) boostBtn.textContent = state.boost ? `Boost (Owned)` : `Boost [${formatNumber(state.boostCost)}]`;
    if (luckyBtn) luckyBtn.textContent = state.luckyGain ? `Lucky Gain (Owned)` : `Lucky Gain [${formatNumber(state.luckyGainCost)}]`;

    updateUpgradeButtons();
    updateSVGLines();
  }


  function handlePurchase(btn, buyFn, ownedCheck, cost) {
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (ownedCheck()) showFeedback("Already owned");
      else if (state.resources < cost) showFeedback("Not enough resources");
      else { buyFn(); showFeedback("Purchased!"); }
      updateUI();
      popButton(btn);
    });
  }

  if (collectBtn) {
  collectBtn.replaceWith(collectBtn.cloneNode(true));
  const freshBtn = document.getElementById("collect-btn");

  freshBtn.addEventListener("click", () => {
    pushClickSample(Date.now());
    collect();
    updateUI();
    popButton(freshBtn);
    freshBtn.blur();
  });
}


  handlePurchase(upgradeBtn, buyUpgrade, () => false, state.upgradeCost);
  handlePurchase(autoBtn, buyAutoCollect, () => state.autoCollect, state.autoCollectCost);
  handlePurchase(doubleBtn, buyDoubleGain, () => state.doubleGain, state.doubleGainCost);
  handlePurchase(tripleBtn, buyTripleGain, () => state.tripleGain, state.tripleGainCost);
  handlePurchase(boostBtn, buyBoost, () => state.boost, state.boostCost);
  handlePurchase(luckyBtn, buyLuckyGain, () => state.luckyGain, state.luckyGainCost);

  if (newAgeBtn) {
    newAgeBtn.addEventListener("click", () => {
      state.resources = 0;
      state.perClick = 0;
      state.measuredRps = 0;

      if (measuredRpsEl) {
        let glitchCount = 0;
        const glitchInterval = setInterval(() => {
          glitchCount++;
          measuredRpsEl.textContent =
            Math.random().toString(36).substring(2, 8).toUpperCase();

          if (glitchCount > 10) {
            clearInterval(glitchInterval);
            measuredRpsEl.textContent = "Resources/s: 0";
          }
        }, 180);
      }

      if (resourceDisplay) {
        let glitchCount = 0;
        const glitchInterval2 = setInterval(() => {
          glitchCount++;
          resourceDisplay.textContent =
            Math.random().toString(36).substring(2, 10).toUpperCase();
          resourceDisplay.style.color =
            `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

          if (glitchCount > 10) {
            clearInterval(glitchInterval2);
            resourceDisplay.textContent = "Resources: 0";
            resourceDisplay.style.color = "";
          }
        }, 80);
      }

      state.autoCollect = false;
      state.doubleGain = false;
      state.tripleGain = false;
      state.boost = false;
      state.luckyGain = false;

      const feedbackMessages = [
        "Eeotk",
        "And we are almost bankrupt...",
        "So.. time for a cheaper approach...",
        "Allow me to introduce...",
        "The Multiverse!",
      ];

      function showGlitchyMessage(el, text, duration = 2000, interval = 80) {
        let chars = "!@#$%^&*()_+{}[]<>?/|ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let iterations = Math.floor(duration / interval);
        let i = 0;

        let glitch = setInterval(() => {
          let glitched = text
            .split("")
            .map((ch, idx) =>
              Math.random() > 0.5 && i < iterations
                ? chars[Math.floor(Math.random() * chars.length)]
                : ch
            )
            .join("");

          el.textContent = glitched;

          if (i >= iterations) {
            clearInterval(glitch);
            el.textContent = text;
          }

          i++;
        }, interval);
      }

      if (feedback) {
        let i = 0;
        const showNext = () => {
          if (i >= feedbackMessages.length) {
            state.beginningfinished = true;
            saveGame();
            window.location.href = "chapter1/index.html";
            return;
          }

          if (i >= feedbackMessages.length) return;

          feedback.classList.add("show");

          if (i === feedbackMessages.length - 1) {
            showGlitchyMessage(feedback, feedbackMessages[i]);
          } else {
            feedback.textContent = feedbackMessages[i];
          }

          i++;
          setTimeout(() => {
            feedback.classList.remove("show");
            showNext();
          }, 5000);
        };
        showNext();
      }

      popButton(newAgeBtn);
      updateUI();
    });
  }

  if (saveBtn) saveBtn.addEventListener("click", () => { saveGame(); showFeedback("Saved"); popButton(saveBtn); });
  if (loadBtn) loadBtn.addEventListener("click", () => { loadGame(); updateUI(); showFeedback("Does nothing yet ㋡"); popButton(loadBtn); });


  function resetGameState() {
    localStorage.clear();
    state.resources = 0,
    state.perClick = 1,
    state.upgradeCost = 50,
    state.autoCollect = false,
    state.autoCollectCost = 150,
    state.doubleGain = false,
    state.doubleGainCost = 400,
    state.tripleGain = false,
    state.tripleGainCost = 1200,
    state.boost = false,
    state.boostCost = 3000,
    state.luckyGain = false,
    state.luckyGainCost = 10000,
    state.measuredRps = 0,
    state.beginningfinished = false;
    pushResourceSample();
  }

  if (resetBtn && confirmBar) {
    resetBtn.addEventListener("click", () => {
      confirmBar.hidden = false;
      confirmBar.style.display = "flex";
      if (confirmYes) confirmYes.focus();
    });
  }

  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      resetGameState();
      saveGame();
      updateUI();
      showFeedback("Reset complete");
      popButton(confirmYes);
      confirmBar.hidden = true;
      confirmBar.style.display = "none";
      if (resetBtn) resetBtn.focus();
    });
  }

  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      confirmBar.hidden = true;
      confirmBar.style.display = "none";
      popButton(confirmNo);
      if (resetBtn) resetBtn.focus();
    });
  }

  if (optionsBtn) {
    optionsBtn.addEventListener("click", () => {
      optionsModal.classList.add("active");
    });
  } 

  if (optionsCloseBtn) {
    optionsCloseBtn.addEventListener("click", () => {
      optionsModal.classList.remove("active");
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && optionsModal.classList.contains("active")) {
      optionsModal.classList.remove("active");
    }
  });

  (function attachTooltips() {
    const map = {
      "buy-upgrade":"Increase resources per gain by +1.",
      "upgrade-auto":"Automatically collect resources every second.",
      "upgrade-double":"Double your gain output.",
      "upgrade-triple":"Triple your gain output.",
      "upgrade-boost":"Temporarily boost gain output.",
      "upgrade-lucky":"Small chance for a large bonus on gain.",
      "save-btn":"Save your game to local storage.",
      "load-btn":"Load the saved game state.",
      "reset-btn":"Reset progress to default.",
      "options-btn":"Open game options and settings."
    };
    for (const id in map) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (id === "collect-btn") continue;
      el.setAttribute("data-desc", map[id]);
      el.title = map[id];
    }
  })();


  pushResourceSample();
  setInterval(pushResourceSample, 1000);
  setInterval(() => { if (state.autoCollect) { collect(); updateUI(); } }, 1000);


  window.updateUI = updateUI;
  updateUI();
  setTimeout(updateSVGLines, 120);
  window.addEventListener("resize", updateSVGLines);
  window.addEventListener("scroll", updateSVGLines);
});
