const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (n) =>
  n == null
    ? "Price Coming Soon"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
const getCart = () =>
  readJSON("tyrehub_cart", [])
    .filter((x) => x && Number.isFinite(Number(x.id)) && Number(x.qty) > 0)
    .map((x) => ({ id: Number(x.id), qty: Number(x.qty) }));
const setCart = (c) => {
  try {
    localStorage.setItem("tyrehub_cart", JSON.stringify(c));
  } catch {}
  updateHeader();
};
const getOrders = () => readJSON("tyrehub_orders", []);
const iconMap = {
  shield: "✓",
  truck: "↗",
  headphones: "◉",
  leaf: "✦",
  target: "◎",
  spark: "✦",
  route: "⌁",
  gauge: "◌",
  badge: "★",
  car: "🚗",
  bike: "🏍",
  suv: "▰",
  filter: "☷",
  clock: "◷",
};
function renderIcons() {
  $$("[data-icon]").forEach((el) => {
    el.textContent = iconMap[el.dataset.icon] || "•";
  });
}
function cartCount() {
  return getCart().reduce((n, x) => n + x.qty, 0);
}
function header() {
  return `<header class="site-header"><div class="container nav"><button class="icon-btn mobile-menu" id="mobile-nav" type="button" aria-label="Open menu">☰</button><a class="logo" href="index.html" aria-label="TyreHub home"><img src="assets/logo.png" alt="TyreHub"></a><nav class="nav-links" aria-label="Primary"><a data-nav="home" href="index.html">Home</a><a data-nav="shop" href="shop.html">Shop Tyres</a><a data-nav="compare" href="compare.html">Compare</a><a data-nav="about" href="about.html">About</a><a data-nav="contact" href="contact.html">Contact</a></nav><form class="header-search" id="header-search" role="search"><input id="header-search-input" type="search" placeholder="Search tyres, brands, or sizes..." aria-label="Search tyres"><button type="submit" aria-label="Search">⌕</button></form><div class="nav-actions"><a class="icon-btn" href="login.html" aria-label="Account">♙</a><a class="icon-btn cart-link" href="cart.html" aria-label="Cart">🛒<span class="count-badge" id="cart-count">0</span></a></div></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><div class="footer-brand">TyreHub</div><p>Smart tyre shopping for a polished portfolio experience. Every product and order is demo content.</p></div><div><h3>Shop</h3><a href="shop.html">All tyres</a><a href="shop.html?vehicle=Car">Car tyres</a><a href="shop.html?vehicle=Bike">Bike tyres</a><a href="shop.html?vehicle=Commercial">Truck tyres</a></div><div><h3>Account</h3><a href="login.html">Login</a><a href="register.html">Register</a><a href="orders.html">My orders</a><a href="compare.html">Compare</a></div><div><h3>Company</h3><a href="about.html">About TyreHub</a><a href="contact.html">Contact</a><a href="index.html#review-heading">Reviews</a></div></div><div class="footer-bottom"><span>© 2026 TyreHub — portfolio demo</span><span>Secure checkout · Multiple payment options</span></div></div></footer>`;
}
function updateHeader() {
  const n = $("#cart-count");
  if (n) n.textContent = cartCount();
}
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
function addToCart(id, qty = 1) {
  id = Number(id);
  qty = Math.max(1, Number(qty) || 1);
  const product = products.find((p) => p.id === id);
  if (!product || product.price == null) {
    toast("This item is not currently available");
    return false;
  }
  const c = getCart();
  const item = c.find((x) => x.id === id);
  if (item) item.qty += qty;
  else c.push({ id, qty });
  setCart(c);
  toast(`${product.name} added to cart`);
  return true;
}
function addCompare(id) {
  let c = readJSON("tyrehub_compare", []);
  id = Number(id);
  if (c.includes(id)) {
    toast("Already in comparison");
    return;
  }
  if (c.length >= 3) {
    toast("Compare up to 3 tyres");
    return;
  }
  c.push(id);
  localStorage.setItem("tyrehub_compare", JSON.stringify(c));
  toast("Added to comparison");
}
function productImage(p) {
  return p.image || "assets/products/ceat-securadrive.png";
}
function productCard(p) {
  return `<article class="product-card"><div class="product-card__top"><span class="product-brand ${slug(p.brand)}">${p.brand}</span>${p.new ? '<span class="status">New</span>' : ""}</div><a href="product.html?id=${p.id}" class="product-visual" aria-label="View ${p.name}"><img class="product-image" src="${productImage(p)}" alt="${p.brand} ${p.name}" loading="lazy"></a><div class="product-info"><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="size">${p.size}</div><div class="rating">${p.rating ? `★ ${p.rating}` : "0 ☆"} <span>${p.reviews} Reviews</span></div><div class="${p.price == null ? "coming" : "price"}">${money(p.price)}</div><div class="spec-row"><div class="spec"><div class="spec-icon">${p.type === "Truck" ? "▦" : p.type === "Scooter" ? "◉" : "◍"}</div>${p.type}<br>Tyre</div><div class="spec"><div class="spec-icon">${p.tubeless ? "◉" : "○"}</div>${p.tubeless ? "Tubeless" : "Tube"}</div><div class="spec"><div class="spec-icon">⌁</div>Fuel<br>Efficient</div><div class="spec"><div class="spec-icon">☁</div>Wet<br>Grip</div></div><div class="product-actions"><button class="button" type="button" data-add="${p.id}" ${p.price == null ? "disabled" : ""}>${p.price == null ? "Price Coming Soon" : "Add to Cart"} <b>→</b></button><button class="small-icon" type="button" data-compare="${p.id}" aria-label="Compare ${p.name}">⇄</button></div></div></article>`;
}
function bindGlobal() {
  updateHeader();
  renderIcons();
  document.addEventListener("click", (e) => {
    if (e.isTrusted === false) return;
    const add = e.target.closest("[data-add]");
    if (add && !add.disabled) {
      e.preventDefault();
      e.stopPropagation();
      addToCart(add.dataset.add);
      return;
    }
    const cmp = e.target.closest("[data-compare]");
    if (cmp) {
      e.preventDefault();
      e.stopPropagation();
      addCompare(cmp.dataset.compare);
      return;
    }
    const demo = e.target.closest("[data-demo-toast]");
    if (demo) {
      e.preventDefault();
      toast(demo.dataset.demoToast);
      return;
    }
    const mob = e.target.closest("#mobile-nav");
    if (mob) {
      const nav = $(".nav-links");
      if (nav) nav.classList.toggle("mobile-open");
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.isTrusted === false) return;
    const f = e.target.closest("#header-search");
    if (f) {
      e.preventDefault();
      const q = $("#header-search-input").value.trim();
      location.href = q ? `shop.html?q=${encodeURIComponent(q)}` : "shop.html";
    }
  });
  window.addEventListener("storage", updateHeader);
}
function init() {
  const h = $("#site-header");
  if (h) h.innerHTML = header();
  const f = $("#site-footer");
  if (f) f.innerHTML = footer();
  const page = document.body.dataset.page;
  $$("[data-nav]").forEach((a) =>
    a.classList.toggle("active", a.dataset.nav === page),
  );
  bindGlobal();
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
