function orderPaymentMethod(o) {
  return o.paymentMethod || o.payment || "—";
}
function orderPaymentStatus(o) {
  return (
    o.paymentStatus ||
    (orderPaymentMethod(o) === "Cash on Delivery" ? "Pay on delivery" : "Paid")
  );
}
function orderSubtotal(o) {
  return o.subtotal != null ? o.subtotal : o.total;
}
function orderDelivery(o) {
  return o.delivery != null ? o.delivery : o.shipping != null ? o.shipping : 0;
}
function orderItems(o) {
  return (o.items || []).map((x) => {
    if (x && x.name) return x;
    const p = products.find((y) => y.id === x.id);
    return p
      ? {
          id: x.id,
          name: p.name,
          brand: p.brand,
          size: p.size,
          image: p.image,
          price: p.price,
          qty: x.qty,
        }
      : {
          id: x.id,
          name: "Item",
          brand: "",
          size: "",
          image: "",
          price: 0,
          qty: x.qty,
        };
  });
}
function orderAddressHtml(o) {
  if (o.address)
    return `${o.address.line1 || ""}${o.address.line2 ? ", " + o.address.line2 : ""}<br>${o.address.city || ""}${o.address.state ? ", " + o.address.state : ""} — ${o.address.pin || ""}`;
  if (o.customer && o.customer.address)
    return `${o.customer.address}<br>${o.customer.city || ""} — ${o.customer.pin || ""}`;
  return "—";
}
function orderCustomer(o) {
  return o.customer || {};
}
function renderOrders() {
  const orders = getOrders();
  const list = $("#orders-list");
  if (!list) return;
  if (!orders.length) {
    list.innerHTML =
      '<div class="empty"><h2>No orders yet</h2><p>Complete checkout to see your orders appear here.</p><a class="button" href="shop.html">Start Shopping</a></div>';
    return;
  }
  list.className = "orders-grid";
  list.innerHTML = orders
    .map((o) => {
      const items = orderItems(o);
      const method = orderPaymentMethod(o);
      const status = orderPaymentStatus(o);
      const itemLines = items.map((x) => `${x.qty} × ${x.name}`).join(", ");
      return `<article class="order-card"><div><span class="status">${o.status || "Order Placed"}</span><h3 style="margin-top:10px">${o.id}</h3><p>${o.date}</p><p>${itemLines}</p><p>${money(o.total)} · ${method} · ${status}</p></div><a class="text-link" href="order-success.html?id=${encodeURIComponent(o.id)}">View details →</a></article>`;
    })
    .join("");
}
function renderSuccess() {
  const el = $("#order-success");
  if (!el) return;
  const last = JSON.parse(localStorage.getItem("tyrehub_last_order") || "null");
  const id = new URLSearchParams(location.search).get("id");
  const order = (id ? getOrders().find((o) => o.id === id) : null) || last;
  if (!order) {
    el.innerHTML =
      '<div class="empty"><h2>No order selected</h2><a class="button" href="shop.html">Shop Tyres</a></div>';
    return;
  }
  const items = orderItems(order);
  const customer = orderCustomer(order);
  const method = orderPaymentMethod(order);
  const status = orderPaymentStatus(order);
  const subtotal = orderSubtotal(order);
  const delivery = orderDelivery(order);
  el.innerHTML = `<div class="success-box success-box--pro">
    <div class="success-icon">✓</div>
    <p class="eyebrow" style="text-align:center">Order Confirmed</p>
    <h1>Order Placed Successfully!</h1>
    <p class="success-lead">Thank you for shopping with TyreHub.</p>
    <div class="success-order-meta">
      <div><small>Order ID</small><b>${order.id}</b></div>
      <div><small>Payment Method</small><b>${method}</b></div>
      <div><small>Order Date</small><b>${order.date}</b></div>
    </div>
    <div class="success-section success-address">
      <div class="success-section-head"><b>Delivery Address</b></div>
      <p>${customer.name || ""}<br>${[customer.phone, customer.email].filter(Boolean).join(" · ")}<br>${orderAddressHtml(order)}</p>
    </div>
    <div class="success-section">
      <div class="success-section-head"><b>Order Items</b><span>${items.reduce((n, x) => n + x.qty, 0)} item(s)</span></div>
      ${items.map((x) => `<div class="success-item"><img src="${x.image || "assets/products/ceat-securadrive.png"}" alt="${x.name}"><div><b>${x.name}</b><small>${x.brand || ""}${x.size ? " · " + x.size : ""} · ${x.qty} × ${money(x.price)}</small></div><strong>${money((x.price || 0) * x.qty)}</strong></div>`).join("")}
      <div class="summary-row" style="margin-top:11px"><span>Subtotal</span><b>${money(subtotal)}</b></div>
      <div class="summary-row"><span>Delivery</span><b>${delivery ? money(delivery) : "Free"}</b></div>
      <div class="summary-row total"><span>Total</span><b>${money(order.total)}</b></div>
    </div>
    <div class="success-delivery"><span>✓</span><div><b>Payment status: ${status}</b><small>${status === "Paid" ? "Your payment was received successfully." : "Please keep the exact amount ready for delivery."}</small></div></div>
    <div class="success-actions"><a class="button" href="orders.html">View My Orders</a><a class="button success-shop" href="shop.html">Continue Shopping</a></div>
  </div>`;
}
if (document.body.dataset.page === "orders")
  document.addEventListener("DOMContentLoaded", renderOrders);
if (document.body.dataset.page === "success")
  document.addEventListener("DOMContentLoaded", renderSuccess);
