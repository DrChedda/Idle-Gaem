// Merged utilities: storage.js, formatNumbers.js, tabs.js, options.js

// --- storage.js (merged) ---
function saveGame() {
  try {
    const saveData = JSON.stringify(window.state);
    localStorage.setItem("rebirthOne", saveData);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error("Save failed: LocalStorage is full!");
    } else {
      console.warn("Save failed", e);
    }
  }
}

setInterval(saveGame, 30000);

// --- formatNumbers.js (merged) ---
function formatNumber(num) {
    const pref = localStorage.getItem('formatNumbers');
    const useFormatting = pref === null ? true : (pref === 'true');
    if (!useFormatting) {
        return Number(num.toFixed(1));
    }

    if (num < 1000) {
        return num.toFixed(1);
    }
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'];
    let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    if (tier >= suffixes.length) {
        tier = suffixes.length - 1;
    }
    const scaled = num / Math.pow(10, tier * 3);
    return scaled.toFixed(2) + suffixes[tier];
}

// --- tabs.js (merged) ---
window.addEventListener("load", () => {
  const menu = document.querySelector(".top-menu");
  const pages = document.querySelectorAll(".tab-page");
  const buttons = document.querySelectorAll(".top-menu button");

  function showTab(tabId) {
    const targetPage = document.getElementById(`tab-${tabId}`);
    if (!targetPage) return;

    pages.forEach(p => p.style.display = "none");
    targetPage.style.display = "block";

    buttons.forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));

    localStorage.setItem("lastTab", tabId);
  }

  menu?.addEventListener("click", (e) => {
    const tab = e.target.closest("button")?.dataset.tab;
    if (tab) showTab(tab);
  });

  showTab(localStorage.getItem("lastTab") || "game");
});

// --- options.js (merged) ---
window.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const themeStylesheet = document.getElementById("theme-stylesheet");
  const formatToggle = document.getElementById("format-toggle");

  window.settings = window.settings || {};

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme, false);
  if (themeToggle) themeToggle.checked = (savedTheme === "light");

  const savedFormat = localStorage.getItem('formatNumbers');
  const formatEnabled = savedFormat === null ? true : (savedFormat === 'true');
  if (formatToggle) formatToggle.checked = formatEnabled;
  window.settings.formatNumbers = formatEnabled;

  themeToggle?.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark", true);
  });

  formatToggle?.addEventListener('change', () => {
    const enabled = !!formatToggle.checked;
    localStorage.setItem('formatNumbers', enabled);
    window.settings.formatNumbers = enabled;
    
    refreshGameUI();
  });

  function applyTheme(theme, isUserToggle) {
    if (themeStylesheet) {
      themeStylesheet.href = theme === "light" ? "theme.light.css" : "theme.dark.css";
    }

    window.settings.theme = theme;
    localStorage.setItem("theme", theme);

    if (isUserToggle) {
      refreshGameUI();
    }
  }

  function refreshGameUI() {
    if (window.updateMaterialDisplay) window.updateMaterialDisplay();
    if (window.updateCrateButtons) window.updateCrateButtons();
    if (window.updatePickaxeTab) window.updatePickaxeTab();
    if (window.updateResearchVisibility) window.updateResearchVisibility();
  }
});


