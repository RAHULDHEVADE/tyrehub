(function () {
  function initIntro() {
    const overlay = document.getElementById("tyrehub-intro");
    const video = document.getElementById("tyrehub-intro-video");
    const hotspot = document.getElementById("tyrehub-intro-tyre");
    const status = document.getElementById("tyrehub-intro-status");
    if (!overlay || !video || !hotspot) return;

    let finished = false;
    let entering = false;

    const showFinishedState = () => {
      if (finished) return;
      finished = true;
      overlay.classList.add("is-finished");
      hotspot.disabled = false;
      if (status) {
        status.textContent = "Click the tyre to enter TyreHub";
        status.setAttribute("aria-hidden", "false");
      }
      try {
        video.pause();
      } catch (_) {
        /* keep the final frame visible */
      }
    };

    video.addEventListener("ended", showFinishedState, { once: true });
    video.addEventListener(
      "error",
      () => {
        if (status)
          status.textContent =
            "Intro unavailable — click the tyre to enter TyreHub";
        showFinishedState();
      },
      { once: true },
    );

    hotspot.disabled = true;
    hotspot.addEventListener("click", (event) => {
      if (!event.isTrusted || !finished || entering) return;
      entering = true;
      overlay.classList.add("is-entering");
      window.setTimeout(() => {
        overlay.setAttribute("aria-hidden", "true");
        overlay.remove();
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 650);
    });

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        if (status) status.textContent = "Click the tyre to enter TyreHub";
        showFinishedState();
      });
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initIntro, { once: true });
  else initIntro();
})();
