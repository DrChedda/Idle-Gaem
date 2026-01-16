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