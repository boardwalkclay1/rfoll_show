// /app/js/auth-login.js
// Clean, role-agnostic, owner-compatible login handler

(function () {
  const form = document.getElementById("auth-login-form");
  const errEl = document.getElementById("auth-error");

  function showError(msg) {
    errEl.textContent = msg || "Login failed";
    errEl.hidden = false;
  }

  function clearError() {
    errEl.textContent = "";
    errEl.hidden = true;
  }

  function roleRedirect(role) {
    const map = {
      owner: "/pages/owner/owner-dashboard.html",
      business: "/pages/business/business-dashboard.html",
      buyer: "/pages/buyer/buyer-dashboard.html",
      skater: "/pages/skater/skater-dashboard.html",
      musician: "/pages/musician/musician-dashboard.html",
      user: "/"
    };
    return map[role] || "/";
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearError();

    const email = (document.getElementById("email").value || "").trim();
    const password = (document.getElementById("password").value || "");

    if (!email || !password) {
      showError("Email and password are required.");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    try {
      // Only send email + password
      const res = await API.post("/api/login", { email, password });

      if (!res || res.success !== true) {
        const msg =
          (res && res.data && (res.data.message || res.data.error)) ||
          (res && res.error && res.error.message) ||
          "Invalid credentials";
        showError(msg);
        return;
      }

      // Server returns user in res.user OR res.data.user
      const user = res.user || (res.data && res.data.user) || res.data;

      if (!user || !user.role) {
        showError("Invalid server response.");
        return;
      }

      // Store session for dashboards
      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        role: user.role,
        is_owner: user.role === "owner"
      }));

      // Redirect based on REAL role from DB
      const redirect = roleRedirect(user.role);
      window.location.assign(redirect);

    } catch (err) {
      showError("Network error. Try again.");
      console.error("Login error:", err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  }

  form.addEventListener("submit", onSubmit);
})();
