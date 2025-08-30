    window.addEventListener("load", () => {
      const msg1 = document.getElementById("chapterMessage");
      const msg2 = document.getElementById("restartMessage");

      setTimeout(() => msg1.classList.add("show"), 500);
      setTimeout(() => msg2.classList.add("show"), 1500);
      setTimeout(() => { msg1.classList.remove("show"); msg2.classList.remove("show"); }, 4500);
    });