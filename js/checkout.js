const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
const NET_BANKS = [
  "SBI",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Bank of Baroda",
  "Punjab National Bank",
  "Other Banks",
];
const WALLETS = ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"];
function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function genOrderId(existingIds) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  let id;
  do {
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    id = `TH-${y}${m}${day}-${rand}`;
  } while (existingIds.has(id));
  return id;
}
function initCheckout() {
  const items = cartItems();
  const el = $("#checkout-content");
  if (!items.length) {
    el.innerHTML =
      '<div class="empty"><h2>Your cart is empty</h2><p>Add a tyre to your cart before checking out.</p><a class="button" href="shop.html">Continue Shopping <b>→</b></a></div>';
    return;
  }
  const t = totals();
  let step = 1;
  let submitting = false;
  let form = {
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
  };
  let deliveryErrors = {};
  let payment = "UPI";
  let paymentData = {};
  let paymentError = "";

  function validateDelivery(f) {
    const errors = {};
    if (!f.name.trim()) errors.name = "Please enter your full name.";
    const phone = f.phone.replace(/\s+/g, "");
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone))
      errors.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
      errors.email = "Enter a valid email address.";
    if (!f.line1.trim()) errors.line1 = "Address line 1 is required.";
    if (!f.city.trim()) errors.city = "City is required.";
    if (!f.state) errors.state = "Please select a state.";
    if (!/^[0-9]{6}$/.test(f.pin.trim()))
      errors.pin = "PIN code must be 6 digits.";
    return errors;
  }
  function field(name, label, value, error, opts = {}) {
    const tag = opts.tag || "input";
    const cls = opts.full ? " full" : "";
    let control;
    if (tag === "textarea") {
      control = `<textarea name="${name}" ${opts.attrs || ""}>${esc(value)}</textarea>`;
    } else if (tag === "select") {
      control = `<select name="${name}" ${opts.attrs || ""}><option value="">${esc(opts.placeholder || "Select")}</option>${(opts.options || []).map((o) => `<option value="${esc(o)}" ${o === value ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    } else {
      control = `<input name="${name}" type="${opts.type || "text"}" value="${esc(value)}" ${opts.attrs || ""}>`;
    }
    return `<label class="${cls}${error ? " invalid" : ""}">${label}${control}${error ? `<span class="field-error">${esc(error)}</span>` : ""}</label>`;
  }
  function summaryAside() {
    return `<aside class="summary-card checkout-summary"><div class="summary-head"><p class="eyebrow">Your order</p><span>${items.reduce((n, x) => n + x.qty, 0)} items</span></div>${items.map((x) => `<div class="checkout-product"><div class="checkout-product-image"><img src="${x.p.image || "assets/products/ceat-securadrive.png"}" alt="${esc(x.p.name)}"></div><div><b>${esc(x.p.name)}</b><small>${esc(x.p.brand)} · ${esc(x.p.size)}</small><span>${x.qty} × ${money(x.p.price)}</span></div></div>`).join("")}<div class="summary-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div class="summary-row"><span>Delivery</span><b>${t.shipping ? money(t.shipping) : "Free"}</b></div><div class="summary-row total"><span>Total</span><b>${money(t.total)}</b></div><div class="secure-note">🔒 Secure Checkout — your information is protected</div></aside>`;
  }
  function render() {
    const progress = `<div class="checkout-progress"><div class="checkout-step ${step >= 1 ? "done" : ""} ${step === 1 ? "current" : ""}"><span>1</span><b>Delivery</b></div><i></i><div class="checkout-step ${step >= 2 ? "done" : ""} ${step === 2 ? "current" : ""}"><span>2</span><b>Payment</b></div><i></i><div class="checkout-step ${step >= 3 ? "done" : ""} ${step === 3 ? "current" : ""}"><span>3</span><b>Review</b></div></div>`;
    let main = "";
    if (step === 1)
      main = `<form id="delivery-form" class="checkout-form" novalidate>
      <div class="checkout-section-head"><div class="checkout-number">1</div><div><p class="eyebrow">Delivery details</p><h2>Where should we deliver?</h2><p>Enter your delivery address to continue.</p></div></div>
      <div class="checkout-fields">
        ${field("name", "Full name", form.name, deliveryErrors.name, { attrs: 'placeholder="Your name"' })}
        ${field("phone", "Mobile number", form.phone, deliveryErrors.phone, { attrs: 'placeholder="98765 43210" inputmode="tel"' })}
        ${field("email", "Email address", form.email, deliveryErrors.email, { full: true, type: "email", attrs: 'placeholder="you@example.com"' })}
        ${field("line1", "Address line 1", form.line1, deliveryErrors.line1, { full: true, attrs: 'placeholder="House / building, street"' })}
        ${field("line2", "Address line 2 (optional)", form.line2, null, { full: true, attrs: 'placeholder="Landmark, area"' })}
        ${field("city", "City", form.city, deliveryErrors.city, { attrs: 'placeholder="Mumbai"' })}
        ${field("state", "State", form.state, deliveryErrors.state, { tag: "select", options: INDIA_STATES, placeholder: "Select state" })}
        ${field("pin", "PIN code", form.pin, deliveryErrors.pin, { attrs: 'placeholder="400001" inputmode="numeric" maxlength="6"' })}
      </div>
      <button class="button checkout-next" type="submit">Continue to Payment <b>→</b></button>
    </form>`;
    if (step === 2)
      main = `<section class="checkout-form">
      <div class="checkout-section-head"><div class="checkout-number">2</div><div><p class="eyebrow">Payment method</p><h2>Choose how you want to pay</h2><p>Select a method to continue.</p></div></div>
      <div class="payment-method-list">
        ${[
          ["UPI", "Instant UPI payment"],
          ["Card", "Credit or debit card"],
          ["Net Banking", "Pay through your bank"],
          ["Wallet", "Digital wallet"],
          ["COD", "Cash on Delivery"],
        ]
          .map(
            (x) =>
              `<button type="button" class="payment-method ${payment === x[0] ? "selected" : ""}" data-payment="${x[0]}"><span class="payment-method-icon">${x[0] === "UPI" ? "⌁" : x[0] === "Card" ? "▣" : x[0] === "Net Banking" ? "▤" : x[0] === "Wallet" ? "◉" : "₹"}</span><span><b>${x[0] === "COD" ? "Cash on Delivery" : x[0]}</b><small>${x[1]}</small></span><span class="payment-radio"></span></button>`,
          )
          .join("")}
      </div><div id="payment-details" class="payment-details">${paymentFields()}${paymentError ? `<p class="form-message error">${esc(paymentError)}</p>` : ""}</div>
      <div class="checkout-actions"><button class="button button--ghost checkout-back" type="button">← Back</button><button class="button checkout-next" id="payment-continue" type="button">Continue to Review <b>→</b></button></div>
    </section>`;
    if (step === 3)
      main = `<section class="checkout-form">
      <div class="checkout-section-head"><div class="checkout-number">3</div><div><p class="eyebrow">Final review</p><h2>Review your order</h2><p>Check your delivery and payment details before placing the order.</p></div></div>
      <div class="review-panels">
        <div class="review-panel"><div><b>Delivery address</b><button type="button" class="link-button" id="edit-delivery">Edit Address</button></div><p>${esc(form.name)}<br>${esc(form.phone)} · ${esc(form.email)}<br>${esc(form.line1)}${form.line2 ? ", " + esc(form.line2) : ""}<br>${esc(form.city)}, ${esc(form.state)} — ${esc(form.pin)}</p></div>
        <div class="review-panel"><div><b>Payment method</b><button type="button" class="link-button" id="edit-payment">Change Payment Method</button></div><p>${payment === "COD" ? "Cash on Delivery" : payment}<br>${paymentSummary()}</p></div>
      </div>
      <div class="final-notice"><span>✓</span><div><b>Ready to place your order</b><p>Your order will appear in My Orders once confirmed.</p></div></div>
      <div class="checkout-actions"><button class="button button--ghost checkout-back" type="button">← Back</button><button class="button checkout-next" id="place-order" type="button">${payment === "COD" ? "Place Order" : "Pay " + money(t.total)} <b>→</b></button></div>
    </section>`;
    el.innerHTML = `<div class="checkout-shell"><div class="checkout-main">${progress}<div class="checkout-card">${main}</div></div>${summaryAside()}</div>`;
    bind();
  }
  function paymentFields() {
    if (payment === "UPI")
      return `<label>UPI ID<input id="upi-id" value="${esc(paymentData.upi || "")}" placeholder="name@upi" autocomplete="off"></label>`;
    if (payment === "Card")
      return `<div class="checkout-fields"><label class="full">Card number<input id="card-number" inputmode="numeric" value="${esc(paymentData.card || "")}" placeholder="1234 5678 9012 3456" maxlength="23"></label><label>Cardholder name<input id="card-name" value="${esc(paymentData.cardName || "")}" placeholder="YOUR NAME"></label><label>Expiry<input id="card-expiry" placeholder="MM/YY" value="${esc(paymentData.expiry || "")}" maxlength="5"></label><label>CVV<input id="card-cvv" inputmode="numeric" placeholder="123" value="${esc(paymentData.cvv || "")}" maxlength="4"></label></div>`;
    if (payment === "Net Banking")
      return `<label>Select your bank<select id="bank"><option value="">Select a bank</option>${NET_BANKS.map((b) => `<option ${paymentData.bank === b ? "selected" : ""}>${b}</option>`).join("")}</select></label>`;
    if (payment === "Wallet")
      return `<label>Select your wallet<select id="wallet"><option value="">Select a wallet</option>${WALLETS.map((w) => `<option ${paymentData.wallet === w ? "selected" : ""}>${w}</option>`).join("")}</select></label>`;
    return `<div class="cod-box"><span>₹</span><div><b>Cash on Delivery</b><p>You will pay ${money(t.total)} at the time of delivery.</p></div></div>`;
  }
  function paymentSummary() {
    if (payment === "UPI") return esc(paymentData.upi || "UPI");
    if (payment === "Card")
      return paymentData.card
        ? `Card ending ${paymentData.card.replace(/\D/g, "").slice(-4)}`
        : "Card";
    if (payment === "Net Banking") return esc(paymentData.bank || "");
    if (payment === "Wallet") return esc(paymentData.wallet || "");
    return "Pay when your order is delivered.";
  }
  function savePayment() {
    if (payment === "UPI") {
      const v = $("#upi-id")?.value.trim();
      if (!v || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(v))
        return "Please enter a valid UPI ID.";
      paymentData = { upi: v };
    }
    if (payment === "Card") {
      const raw = $("#card-number")?.value || "";
      const n = raw.replace(/\D/g, "");
      const name = $("#card-name")?.value.trim();
      const ex = $("#card-expiry")?.value.trim();
      const cvv = $("#card-cvv")?.value.trim();
      if (n.length < 13 || n.length > 19)
        return "Please enter a valid card number.";
      if (!name) return "Please enter the cardholder name.";
      const m = /^([0-9]{2})\/([0-9]{2})$/.exec(ex || "");
      if (!m) return "Please enter a valid expiry date (MM/YY).";
      const month = Number(m[1]),
        year = 2000 + Number(m[2]);
      if (month < 1 || month > 12)
        return "Please enter a valid expiry date (MM/YY).";
      const now = new Date();
      const expiryEnd = new Date(year, month, 0, 23, 59, 59);
      if (expiryEnd < now) return "This card has expired.";
      if (!/^[0-9]{3,4}$/.test(cvv || "")) return "Please enter a valid CVV.";
      paymentData = { card: n, cardName: name, expiry: ex, cvv: cvv };
    }
    if (payment === "Net Banking") {
      const v = $("#bank")?.value;
      if (!v) return "Please select a bank to continue.";
      paymentData = { bank: v };
    }
    if (payment === "Wallet") {
      const v = $("#wallet")?.value;
      if (!v) return "Please select a wallet to continue.";
      paymentData = { wallet: v };
    }
    if (payment === "COD") paymentData = {};
    return "";
  }
  function bind() {
    const df = $("#delivery-form");
    if (df)
      df.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!e.isTrusted) return;
        const fd = new FormData(df);
        form = { ...form, ...Object.fromEntries(fd.entries()) };
        const errs = validateDelivery(form);
        deliveryErrors = errs;
        if (Object.keys(errs).length) {
          render();
          return;
        }
        step = 2;
        render();
      });
    $$(".payment-method").forEach((b) =>
      b.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        payment = b.dataset.payment;
        paymentError = "";
        render();
      }),
    );
    const back = $(".checkout-back");
    if (back)
      back.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        step = Math.max(1, step - 1);
        render();
      });
    const pc = $("#payment-continue");
    if (pc)
      pc.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        const msg = savePayment();
        if (msg) {
          paymentError = msg;
          render();
          return;
        }
        paymentError = "";
        step = 3;
        render();
      });
    const ed = $("#edit-delivery");
    if (ed)
      ed.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        step = 1;
        render();
      });
    const ep = $("#edit-payment");
    if (ep)
      ep.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        step = 2;
        render();
      });
    const po = $("#place-order");
    if (po)
      po.addEventListener("click", (e) => {
        if (!e.isTrusted) return;
        placeOrder();
      });
  }
  function renderProcessing(title, sub, success) {
    el.innerHTML = `<div class="checkout-shell"><div class="checkout-main"><div class="checkout-card"><div class="payment-processing">${success ? '<div class="success-icon">✓</div>' : '<div class="spinner"></div>'}<h2 class="${success ? "payment-success" : ""}">${esc(title)}</h2><p>${esc(sub)}</p></div></div></div>${summaryAside()}</div>`;
  }
  function placeOrder() {
    if (submitting) return;
    submitting = true;
    if (payment === "COD") {
      renderProcessing(
        "Confirming your COD order…",
        "Please wait while we save your order.",
      );
      setTimeout(
        () => completeOrder("Cash on Delivery", "Pay on delivery"),
        700,
      );
    } else {
      const processingTitle =
        payment === "Net Banking"
          ? `Redirecting securely to ${paymentData.bank}…`
          : "Processing Payment";
      renderProcessing(
        processingTitle,
        "Please wait while we securely process your payment.",
      );
      setTimeout(() => {
        renderProcessing(
          "Payment Successful",
          "Redirecting to your order confirmation…",
          true,
        );
        setTimeout(() => completeOrder(payment, "Paid"), 700);
      }, 1400);
    }
  }
  function completeOrder(method, status) {
    const existingIds = new Set(getOrders().map((o) => o.id));
    const order = {
      id: genOrderId(existingIds),
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      items: items.map((x) => ({
        id: x.id,
        name: x.p.name,
        brand: x.p.brand,
        size: x.p.size,
        image: x.p.image,
        price: x.p.price,
        qty: x.qty,
      })),
      subtotal: t.subtotal,
      delivery: t.shipping,
      total: t.total,
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      address: {
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        city: form.city.trim(),
        state: form.state,
        pin: form.pin.trim(),
      },
      paymentMethod: method,
      paymentDetails: paymentSummary(),
      paymentStatus: status,
      status: "Order Placed",
    };
    localStorage.setItem("tyrehub_last_order", JSON.stringify(order));
    localStorage.setItem(
      "tyrehub_orders",
      JSON.stringify([order, ...getOrders()]),
    );
    setCart([]);
    location.href = `order-success.html?id=${encodeURIComponent(order.id)}`;
  }
  render();
}
if (document.body.dataset.page === "checkout")
  document.addEventListener("DOMContentLoaded", initCheckout, { once: true });
