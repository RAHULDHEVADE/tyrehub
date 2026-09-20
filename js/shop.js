let shopState = {
  q: "",
  vehicle: "",
  vehicleBrand: "",
  brand: "",
  model: "",
  segment: "",
  width: "",
  profile: "",
  rim: "",
  maxPrice: "",
  sort: "relevance",
};
function readShopParams() {
  const p = new URLSearchParams(location.search);
  shopState.q = p.get("q") || "";
  shopState.vehicle = p.get("vehicle") || "";
  shopState.vehicleBrand = p.get("vehicleBrand") || "";
  shopState.brand = p.get("brand") || "";
  shopState.model = p.get("model") || "";
  shopState.segment = p.get("segment") || "";
  shopState.width = p.get("width") || "";
  shopState.profile = p.get("profile") || "";
  shopState.rim = p.get("rim") || "";
  shopState.maxPrice = p.get("maxPrice") || "";
  if ($("#shop-search-input")) $("#shop-search-input").value = shopState.q;
}
function modelsForVehicle() {
  return shopState.vehicle && VEHICLE_MODELS[shopState.vehicle]
    ? Object.keys(VEHICLE_MODELS[shopState.vehicle])
    : [];
}
function modelOptions() {
  const brands = modelsForVehicle();
  return brands
    .flatMap((b) => VEHICLE_MODELS[shopState.vehicle][b] || [])
    .filter((v, i, a) => a.indexOf(v) === i);
}
function filterProducts() {
  let arr = products.filter((p) => {
    const text =
      `${p.name} ${p.brand} ${p.size} ${p.vehicle} ${p.type} ${p.model || ""} ${p.vehicleBrand || ""} ${p.segment || ""}`.toLowerCase();
    const size = String(p.size).toLowerCase();
    return (
      (!shopState.q || text.includes(shopState.q.toLowerCase())) &&
      (!shopState.vehicle ||
        p.vehicle === shopState.vehicle ||
        p.type === shopState.vehicle) &&
      (!shopState.vehicleBrand || p.vehicleBrand === shopState.vehicleBrand) &&
      (!shopState.brand || p.brand === shopState.brand) &&
      (!shopState.model || p.model === shopState.model) &&
      (!shopState.segment || p.segment === shopState.segment) &&
      (!shopState.width ||
        size.includes(String(shopState.width).toLowerCase())) &&
      (!shopState.profile ||
        size.includes(String(shopState.profile).toLowerCase())) &&
      (!shopState.rim || size.includes(String(shopState.rim).toLowerCase())) &&
      (!shopState.maxPrice ||
        p.price == null ||
        p.price <= Number(shopState.maxPrice))
    );
  });
  if (shopState.sort === "low")
    arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (shopState.sort === "high")
    arr.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  if (shopState.sort === "rating") arr.sort((a, b) => b.rating - a.rating);
  if (shopState.sort === "newest") arr.sort((a, b) => b.id - a.id);
  return arr;
}
function renderFilters() {
  const box = $("#filter-controls");
  if (!box) return;
  const vehicleBrands = shopState.vehicle
    ? VEHICLE_BRANDS[shopState.vehicle] || []
    : [];
  const modelBrand =
    shopState.vehicle &&
    shopState.vehicleBrand &&
    VEHICLE_MODELS[shopState.vehicle]?.[shopState.vehicleBrand]
      ? VEHICLE_MODELS[shopState.vehicle][shopState.vehicleBrand]
      : modelOptions();
  box.innerHTML = `
    <div class="filter-group filter-group--vehicle"><h3>Vehicle</h3><div class="vehicle-filter-grid">${["Car", "Bike", "SUV", "Commercial"].map((v) => `<button type="button" class="vehicle-filter ${shopState.vehicle === v ? "active" : ""}" data-vehicle="${v}">${v === "Commercial" ? "Truck" : v}</button>`).join("")}</div></div>
    ${
      shopState.vehicle
        ? `<div class="filter-group"><h3>${shopState.vehicle === "Commercial" ? "Truck" : "Vehicle"} Brand</h3><select id="filter-vehicle-brand" class="filter-select"><option value="">All vehicle brands</option>${vehicleBrands.map((v) => `<option value="${v}" ${shopState.vehicleBrand === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="filter-group"><h3>Vehicle Model</h3><select id="filter-model" class="filter-select"><option value="">All models</option>${modelBrand.map((v) => `<option value="${v}" ${shopState.model === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="filter-group"><h3>Tyre Category</h3><div class="segment-list">${(VEHICLE_SEGMENTS[shopState.vehicle] || []).map((v) => `<button type="button" class="segment-chip ${shopState.segment === v ? "active" : ""}" data-segment="${v}">${v}</button>`).join("")}</div></div>`
        : ""
    }
    <div class="filter-group"><h3>Tyre Brand</h3><select id="filter-tyre-brand" class="filter-select"><option value="">All tyre brands</option>${TYRE_BRANDS.map((v) => `<option value="${v}" ${shopState.brand === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="filter-group filter-group--compact"><h3>Tyre Size</h3><div class="size-filter-grid"><input id="filter-width" inputmode="numeric" value="${shopState.width}" placeholder="Width"><input id="filter-profile" inputmode="numeric" value="${shopState.profile}" placeholder="Profile"><input id="filter-rim" inputmode="numeric" value="${shopState.rim}" placeholder="Rim"></div><small>Example: 205 / 55 / 16</small></div>
    <div class="filter-group filter-group--compact"><h3>Maximum Budget</h3><input id="filter-budget" type="range" min="1000" max="60000" step="500" value="${shopState.maxPrice || 60000}"><div class="range-labels"><span>₹1,000</span><span id="budget-value">${shopState.maxPrice ? money(Number(shopState.maxPrice)) : "Any price"}</span></div></div>`;
}
function renderCategoryPicker() {
  const el = $("#category-picker");
  if (!el) return;
  if (!shopState.vehicle) {
    el.innerHTML = "";
    return;
  }
  const segs = VEHICLE_SEGMENTS[shopState.vehicle] || [];
  el.innerHTML = `<div class="category-picker__inner"><div><p class="eyebrow">${shopState.vehicle === "Commercial" ? "Truck" : "Tyre"} collection</p><h2>Shop ${shopState.vehicle === "Commercial" ? "Truck" : shopState.vehicle} Tyres</h2><p>Choose a vehicle category, then narrow it down by brand and model.</p></div><div class="category-picker__options"><button type="button" class="category-option ${!shopState.segment ? "active" : ""}" data-segment="">All</button>${segs.map((v) => `<button type="button" class="category-option ${shopState.segment === v ? "active" : ""}" data-segment="${v}">${v}</button>`).join("")}</div></div>`;
}
function renderShop() {
  const arr = filterProducts();
  $("#results-count").textContent = `${arr.length} tyres`;
  $("#products-grid").innerHTML = arr.length
    ? arr.map(productCard).join("")
    : `<div class="empty" style="grid-column:1/-1"><h3>No tyres found</h3><p>Try another vehicle, model, size or budget.</p><button type="button" class="button" id="empty-clear">Clear filters</button></div>`;
  const chips = [];
  if (shopState.q) chips.push(`Search: ${shopState.q}`);
  if (shopState.vehicle)
    chips.push(
      shopState.vehicle === "Commercial" ? "Truck" : shopState.vehicle,
    );
  if (shopState.vehicleBrand) chips.push(shopState.vehicleBrand);
  if (shopState.brand) chips.push(shopState.brand);
  if (shopState.model) chips.push(shopState.model);
  if (shopState.segment) chips.push(shopState.segment);
  if (shopState.width || shopState.profile || shopState.rim)
    chips.push(
      `Size ${shopState.width || "—"}/${shopState.profile || "—"} R${shopState.rim || "—"}`,
    );
  if (shopState.maxPrice) chips.push(`≤ ${money(Number(shopState.maxPrice))}`);
  $("#active-filters").innerHTML = chips
    .map((x) => `<span class="filter-chip">${x}</span>`)
    .join("");
  const clear = $("#empty-clear");
  if (clear)
    clear.addEventListener("click", (e) => {
      if (e.isTrusted) resetShop();
    });
  renderCategoryPicker();
}
function resetShop() {
  shopState = {
    q: "",
    vehicle: "",
    vehicleBrand: "",
    brand: "",
    model: "",
    segment: "",
    width: "",
    profile: "",
    rim: "",
    maxPrice: "",
    sort: "relevance",
  };
  $("#shop-search-input").value = "";
  $("#sort-products").value = "relevance";
  renderFilters();
  renderShop();
}
function initShop() {
  readShopParams();
  renderFilters();
  renderShop();
  $("#filter-controls").addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    const vehicle = e.target.closest("[data-vehicle]");
    if (vehicle) {
      shopState.vehicle = vehicle.dataset.vehicle;
      shopState.vehicleBrand = "";
      shopState.brand = "";
      shopState.model = "";
      shopState.segment = "";
      renderFilters();
      renderShop();
      return;
    }
    const segment = e.target.closest("[data-segment]");
    if (segment) {
      shopState.segment = segment.dataset.segment;
      renderFilters();
      renderShop();
    }
  });
  $("#filter-controls").addEventListener("change", (e) => {
    if (!e.isTrusted) return;
    if (e.target.id === "filter-vehicle-brand") {
      shopState.vehicleBrand = e.target.value;
      shopState.model = "";
      renderFilters();
      renderShop();
    }
    if (e.target.id === "filter-tyre-brand") {
      shopState.brand = e.target.value;
      renderShop();
    }
    if (e.target.id === "filter-model") {
      shopState.model = e.target.value;
      renderShop();
    }
  });
  $("#filter-controls").addEventListener("input", (e) => {
    if (!e.isTrusted) return;
    if (e.target.id === "filter-budget") {
      shopState.maxPrice = e.target.value;
      $("#budget-value").textContent = money(Number(e.target.value));
      renderShop();
    }
    if (
      ["filter-width", "filter-profile", "filter-rim"].includes(e.target.id)
    ) {
      shopState.width = $("#filter-width").value.trim();
      shopState.profile = $("#filter-profile").value.trim();
      shopState.rim = $("#filter-rim").value.trim();
      renderShop();
    }
  });
  $("#category-picker").addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    const b = e.target.closest("[data-segment]");
    if (!b) return;
    shopState.segment = b.dataset.segment;
    renderFilters();
    renderShop();
  });
  $("#sort-products").addEventListener("change", (e) => {
    if (!e.isTrusted) return;
    shopState.sort = e.target.value;
    renderShop();
  });
  $("#shop-search").addEventListener("submit", (e) => {
    if (!e.isTrusted) return;
    e.preventDefault();
    shopState.q = $("#shop-search-input").value.trim();
    renderShop();
  });
  $("#clear-filters").addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    resetShop();
  });
  $("#open-filters").addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    $("#filters").classList.add("open");
  });
  $("#close-filters").addEventListener("click", (e) => {
    if (!e.isTrusted) return;
    $("#filters").classList.remove("open");
  });
}
if (document.body.dataset.page === "shop")
  document.addEventListener("DOMContentLoaded", initShop, { once: true });
