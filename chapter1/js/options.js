window.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const themeStylesheet = document.getElementById("theme-stylesheet");
  const uiScript = document.getElementById("ui-script");
  const formatToggle = document.getElementById("format-toggle");
  const formatLabel = document.getElementById("format-label");


  window.settings = window.settings || {};


  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
  themeToggle.checked = savedTheme === "light";

  // Number formatting preference (default: enabled)
  const savedFormat = localStorage.getItem('formatNumbers');
  const formatEnabled = savedFormat === null ? true : (savedFormat === 'true');
  if (formatToggle) formatToggle.checked = formatEnabled;
  window.settings.formatNumbers = formatEnabled;

  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  if (formatToggle) {
    formatToggle.addEventListener('change', () => {
      const enabled = !!formatToggle.checked;
      localStorage.setItem('formatNumbers', enabled ? 'true' : 'false');
      window.settings.formatNumbers = enabled;
      if (window.updateMaterialDisplay) window.updateMaterialDisplay();
      if (window.updateCrateButtons) window.updateCrateButtons();
      if (window.updatePickaxeTab) window.updatePickaxeTab();
      if (window.updateResearchVisibility) window.updateResearchVisibility();
    });
  }

  function applyTheme(theme) {
    if (theme === "light") {
      themeStylesheet.href = "theme.light.css";
      themeLabel.textContent = "Light Mode";
    } else {
      themeStylesheet.href = "theme.dark.css";
      themeLabel.textContent = "Dark Mode";
    }


    settings.theme = theme;
    localStorage.setItem("theme", theme);


    if (uiScript) {
      uiScript.remove();
    }
    const newScript = document.createElement("script");
    newScript.src = "js/ui.js";
    newScript.id = "ui-script";
    document.body.appendChild(newScript);
  }
});