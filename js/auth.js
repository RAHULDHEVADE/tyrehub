function getAccount() {
  try {
    return JSON.parse(localStorage.getItem("tyrehub_account") || "null");
  } catch {
    return null;
  }
}
function initAuth() {
  const page = document.body.dataset.page;
  if (page === "register") {
    const f = $("#register-form");
    f.addEventListener("submit", (e) => {
      if (e.isTrusted === false) return;
      e.preventDefault();
      const fd = new FormData(f);
      if (fd.get("password") !== fd.get("confirm")) {
        $("#auth-message").textContent = "Passwords do not match.";
        return;
      }
      localStorage.setItem(
        "tyrehub_account",
        JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          password: fd.get("password"),
        }),
      );
      $("#auth-message").innerHTML =
        'Demo account created successfully. <a href="login.html">Continue to Login →</a>';
      f.reset();
    });
  }
  if (page === "login") {
    const f = $("#login-form");
    f.addEventListener("submit", (e) => {
      if (e.isTrusted === false) return;
      e.preventDefault();
      const fd = new FormData(f),
        a = getAccount();
      if (
        !a ||
        a.email !== fd.get("email") ||
        a.password !== fd.get("password")
      ) {
        $("#auth-message").textContent =
          "Invalid demo credentials. Create an account first.";
        return;
      }
      localStorage.setItem("tyrehub_logged_in", "1");
      $("#auth-message").innerHTML =
        'Login successful. <a href="orders.html">Open My Orders →</a>';
      f.reset();
    });
  }
  if (page === "contact") {
    const f = $("#contact-form");
    f.addEventListener("submit", (e) => {
      if (e.isTrusted === false) return;
      e.preventDefault();
      $("#contact-message").textContent =
        "Message saved as a demo confirmation. Nothing was sent.";
      f.reset();
    });
  }
}
if (["login", "register", "contact"].includes(document.body.dataset.page))
  document.addEventListener("DOMContentLoaded", initAuth, { once: true });
