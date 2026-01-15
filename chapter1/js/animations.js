
window.addEventListener("load", () => {
  setTimeout(() => {
    if (typeof state.seenChapterMessage === "undefined") state.seenChapterMessage = false;

    if (!state.seenChapterMessage) {
      const msg1 = document.getElementById("chapterMessage");
      const msg2 = document.getElementById("restartMessage");

      msg1.classList.add("show");
      setTimeout(() => msg2.classList.add("show"), 1000);
      setTimeout(() => {
        msg1.classList.remove("show");
        msg2.classList.remove("show");
      }, 4000);

      state.seenChapterMessage = true;
      saveGame();
    }
  }, 50);
});
