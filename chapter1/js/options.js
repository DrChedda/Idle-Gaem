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
    if (themeLabel) {
      themeLabel.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
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