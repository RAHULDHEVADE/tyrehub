function initCompare() {
  const ids = JSON.parse(localStorage.getItem("tyrehub_compare") || "[]");
  const ps = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const el = $("#compare-content");
  if (!ps.length) {
    el.innerHTML =
      '<div class="empty"><h2>No tyres to compare</h2><p>Add up to three products from the shop.</p><a class="button" href="shop.html">Browse Tyres</a></div>';
    return;
  }
  el.innerHTML = `<div class="compare-wrap"><table class="compare-table"><thead><tr><th>Specification</th>${ps.map((p) => `<th>${p.brand}<br>${p.name}<button data-remove-compare="${p.id}" style="float:right;border:0;background:none;color:var(--orange)">×</button></th>`).join("")}</tr></thead><tbody>${[
    ["Size", (p) => p.size],
    ["Vehicle", (p) => p.vehicle],
    ["Price", (p) => money(p.price)],
    ["Rating", (p) => (p.rating ? `★ ${p.rating}` : "Not rated")],
    ["Reviews", (p) => p.reviews],
    ["Construction", (p) => (p.tubeless ? "Tubeless" : "Tube")],
    ["Wet grip", (p) => p.wet],
    ["Fuel efficiency", (p) => p.fuel],
  ]
    .map(
      ([k, fn]) =>
        `<tr><th>${k}</th>${ps.map((p) => `<td>${fn(p)}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
  $$("[data-remove-compare]").forEach((b) =>
    b.addEventListener("click", () => {
      localStorage.setItem(
        "tyrehub_compare",
        JSON.stringify(
          ids.filter((x) => x !== Number(b.dataset.removeCompare)),
        ),
      );
      initCompare();
    }),
  );
}
if (document.body.dataset.page === "compare")
  document.addEventListener("DOMContentLoaded", initCompare);
