window.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const themeStylesheet = document.getElementById("theme-stylesheet");
  const uiScript = document.getElementById("ui-script");

  // global settings object
  window.settings = window.settings || {};

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
  themeToggle.checked = savedTheme === "light";

  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  function applyTheme(theme) {
    if (theme === "light") {
      themeStylesheet.href = "theme.light.css";
      themeLabel.textContent = "Light Mode.";
    } else {
      themeStylesheet.href = "theme.dark.css";
      themeLabel.textContent = "Dark Mode.";
    }

    // update global settings
    settings.theme = theme;
    localStorage.setItem("theme", theme);

    // reload ui.js
    if (uiScript) {
      uiScript.remove();
    }
    const newScript = document.createElement("script");
    newScript.src = "js/ui.js";
    newScript.id = "ui-script";
    document.body.appendChild(newScript);
  }
});