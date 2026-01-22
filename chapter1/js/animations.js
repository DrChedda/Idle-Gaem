window.addEventListener("load", () => {
  setTimeout(() => {
    if (window.state.seenChapterMessage === undefined) {
      window.state.seenChapterMessage = false;
    }

    if (!window.state.seenChapterMessage) {
      const msg1 = document.getElementById("chapterMessage");
      const msg2 = document.getElementById("chapter1Message");

      if (msg1 && msg2) {
        msg1.classList.add("show");
        
        setTimeout(() => msg2.classList.add("show"), 1000);

        setTimeout(() => {
          msg1.classList.remove("show");
          msg2.classList.remove("show");
        }, 4000);
      }

      window.state.seenChapterMessage = true;
      if (typeof saveGame === "function") saveGame();
    }
  }, 100);
});