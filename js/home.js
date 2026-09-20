function initHome() {
  const row = $("#brand-row");
  if (row)
    row.innerHTML = TYRE_BRANDS.slice(0, 12)
      .map(
        (b) =>
          `<a class="brand-card" href="shop.html?brand=${encodeURIComponent(b)}"><span class="brand-logo ${slug(b)}"><img src="assets/brands/${slug(b)}.png" alt="${b}" loading="lazy"></span><span>${b}</span></a>`,
      )
      .join("");
  const popular = $("#popular-products");
  const popTabs = $$("[data-popular]");
  const renderPopular = (v) => {
    if (!popular) return;
    popular.innerHTML = products
      .filter((p) => p.vehicle === v || p.type === v)
      .slice(0, 3)
      .map(productCard)
      .join("");
  };
  popTabs.forEach((t) =>
    t.addEventListener("click", (e) => {
      if (e.isTrusted === false) return;
      popTabs.forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      renderPopular(t.dataset.popular);
    }),
  );
  renderPopular("Car");
  const tabs = $$(".finder-tabs button"),
    form = $("#finder-form");
  tabs.forEach((tab) =>
    tab.addEventListener("click", (e) => {
      if (e.isTrusted === false) return;
      tabs.forEach((x) => x.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.finderTab;
      form.dataset.mode = mode;
      $(".vehicle-field").style.display =
        mode === "size" || mode === "brand" || mode === "budget" ? "none" : "";
      $(".brand-field").style.display =
        mode === "vehicle" || mode === "size" || mode === "budget"
          ? ""
          : "none";
      $$(".size-field").forEach(
        (x) => (x.style.display = mode === "size" ? "" : "none"),
      );
      $(".budget-field").style.display = mode === "budget" ? "" : "none";
    }),
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const params = new URLSearchParams();
    if (fd.get("vehicle")) params.set("vehicle", fd.get("vehicle"));
    if (fd.get("brand")) params.set("brand", fd.get("brand"));
    if (fd.get("width")) params.set("width", fd.get("width"));
    if (fd.get("profile")) params.set("profile", fd.get("profile"));
    if (fd.get("rim")) params.set("rim", fd.get("rim"));
    if (fd.get("maxPrice")) params.set("maxPrice", fd.get("maxPrice"));
    location.href = "shop.html?" + params.toString();
  });
  const nf = $("#newsletter-form");
  nf?.addEventListener("submit", (e) => {
    if (e.isTrusted === false) return;
    e.preventDefault();
    const email = $("#newsletter-email").value.trim();
    localStorage.setItem("tyrehub_newsletter", email);
    $("#newsletter-message").textContent =
      "Thanks — your demo subscription is confirmed.";
    toast("Subscription confirmed");
  });
}
if (document.body.dataset.page === "home")
  document.addEventListener("DOMContentLoaded", initHome);
