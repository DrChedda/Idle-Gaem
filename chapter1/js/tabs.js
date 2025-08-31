// tabs.js
window.addEventListener("load", () => {
  const buttons = document.querySelectorAll(".top-menu button");
  const pages = document.querySelectorAll(".tab-page");

  function showTab(tab) {
    pages.forEach(p => p.style.display = "none");
    const current = document.getElementById(`tab-${tab}`);
    if (current) current.style.display = "block";

    buttons.forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.top-menu button[data-tab="${tab}"]`);
    if (btn) btn.classList.add("active");

    localStorage.setItem("lastTab", tab);
  }

  buttons.forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));
  const saved = localStorage.getItem("lastTab") || "game";
  showTab(saved);
});
