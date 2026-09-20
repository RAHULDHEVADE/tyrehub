function cartItems() {
  return getCart()
    .map((x) => ({ ...x, p: products.find((p) => p.id === x.id) }))
    .filter((x) => x.p);
}
function totals() {
  const items = cartItems();
  const subtotal = items.reduce((n, x) => n + (x.p.price || 0) * x.qty, 0);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 199;
  return { subtotal, shipping, total: subtotal + shipping };
}
function renderCart() {
  const el = $("#cart-content");
  if (!el) return;
  const items = cartItems();
  if (!items.length) {
    el.innerHTML =
      '<div class="empty"><h2>Your cart is empty</h2><p>Browse the catalogue and add a tyre to see the checkout flow.</p><a class="button" href="shop.html">Shop Tyres <b>→</b></a></div>';
    return;
  }
  const t = totals();
  el.innerHTML = `<div class="cart-layout"><section>${items.map((x) => `<article class="cart-item"><div class="cart-thumb"><img src="${x.p.image || "assets/products/ceat-securadrive.png"}" alt="${x.p.name}"></div><div><h3>${x.p.name}</h3><p>${x.p.brand} · ${x.p.size}</p><p>${money(x.p.price)} each</p></div><div class="cart-actions"><button type="button" data-minus="${x.id}" aria-label="Decrease quantity">−</button><strong>${x.qty}</strong><button type="button" data-plus="${x.id}" aria-label="Increase quantity">+</button><button type="button" data-remove="${x.id}" title="Remove" aria-label="Remove item">×</button></div></article>`).join("")}</section><aside class="summary-card"><p class="eyebrow">Order summary</p><div class="summary-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div class="summary-row"><span>Delivery</span><b>${t.shipping ? money(t.shipping) : "Free"}</b></div><div class="summary-row total"><span>Total</span><b>${money(t.total)}</b></div><a class="button" style="width:100%;margin-top:16px" href="checkout.html">Proceed to Checkout <b>→</b></a></aside></div>`;
  $$("[data-minus]", el).forEach((b) =>
    b.addEventListener("click", (e) => {
      if (e.isTrusted === false) return;
      changeQty(Number(b.dataset.minus), -1);
    }),
  );
  $$("[data-plus]", el).forEach((b) =>
    b.addEventListener("click", (e) => {
      if (e.isTrusted === false) return;
      changeQty(Number(b.dataset.plus), 1);
    }),
  );
  $$("[data-remove]", el).forEach((b) =>
    b.addEventListener("click", (e) => {
      if (e.isTrusted === false) return;
      removeItem(Number(b.dataset.remove));
    }),
  );
}
function changeQty(id, d) {
  const c = getCart();
  const x = c.find((i) => i.id === id);
  if (!x) return;
  x.qty += d;
  if (x.qty < 1) c.splice(c.indexOf(x), 1);
  setCart(c);
  renderCart();
}
function removeItem(id) {
  setCart(getCart().filter((x) => x.id !== id));
  renderCart();
}
if (document.body.dataset.page === "cart")
  document.addEventListener("DOMContentLoaded", renderCart, { once: true });
