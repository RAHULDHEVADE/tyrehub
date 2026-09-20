function initProduct() {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const p = products.find((x) => x.id === id);
  const el = $("#product-detail");
  if (!p) {
    el.innerHTML =
      '<div class="empty"><h2>Product not found</h2><a class="button" href="shop.html">Back to shop</a></div>';
    return;
  }
  el.innerHTML = `<div class="detail-visual"><img class="detail-product-image" src="${p.image || "assets/products/ceat-securadrive.png"}" alt="${p.brand} ${p.name}"></div><div class="detail-content"><p class="eyebrow">${p.brand} · ${p.vehicle}</p><h1>${p.name}</h1><div class="size">${p.size}</div><div class="rating">${p.rating ? "★ " + p.rating : "0 ☆"} <span>${p.reviews} customer reviews</span></div><div class="price">${money(p.price)}</div><p>Demo product details designed to mirror a modern tyre-commerce experience. Product, price and stock data are illustrative.</p><ul class="detail-bullets"><li>✓ ${p.tubeless ? "Tubeless" : "Tube-type"} construction</li><li>✓ Designed for ${p.type.toLowerCase()} applications</li><li>✓ Strong everyday grip and stability</li><li>✓ Demo catalogue item — no real inventory</li></ul><div class="quantity"><button type="button" id="qty-minus">−</button><input id="qty" type="number" min="1" max="9" value="1"><button type="button" id="qty-plus">+</button></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="button" id="detail-add" ${p.price == null ? "disabled" : ""}>${p.price == null ? "Price Coming Soon" : "Add to Cart"} <b>→</b></button><button type="button" class="button button--ghost" style="color:var(--navy);border:1px solid var(--line);background:#fff;box-shadow:none" id="detail-compare">Compare</button></div></div>`;
  const q = $("#qty");
  $("#qty-minus").addEventListener(
    "click",
    () => (q.value = Math.max(1, Number(q.value) - 1)),
  );
  $("#qty-plus").addEventListener(
    "click",
    () => (q.value = Math.min(9, Number(q.value) + 1)),
  );
  $("#detail-add").addEventListener("click", (e) => {
    if (e.isTrusted === false) return;
    if (addToCart(p.id, Number(q.value))) location.href = "cart.html";
  });
  $("#detail-compare").addEventListener("click", (e) => {
    if (e.isTrusted === false) return;
    addCompare(p.id);
  });
}
if (document.body.dataset.page === "product")
  document.addEventListener("DOMContentLoaded", initProduct);
