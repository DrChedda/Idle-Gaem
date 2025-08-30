// animations.js
window.addEventListener("load", () => {
  setTimeout(() => {
    if (typeof state.seenChapterMessage === "undefined") {
      state.seenChapterMessage = false;
    }

    if (state.seenChapterMessage === false) {
      const msg1 = document.getElementById("chapterMessage");
      const msg2 = document.getElementById("restartMessage");

      setTimeout(() => msg1.classList.add("show"), 500);
      setTimeout(() => msg2.classList.add("show"), 1500);
      setTimeout(() => {
        msg1.classList.remove("show");
        msg2.classList.remove("show");
      }, 4500);

      state.seenChapterMessage = true;
      saveGame();
    }
  }, 50); // 50ms delay to ensure state is loaded
});
