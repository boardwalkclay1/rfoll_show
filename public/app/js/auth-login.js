// /app/js/auth-login.js — NEW FINAL VERSION

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

    // Read form fields safely
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    // Log what is actually being sent
    console.log("LOGIN PAYLOAD (frontend):", { email, password });

    if (!email || !password) {
      showError("Email and password are required.");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    try {
      // Always send JSON — never null, never empty
      const payload = { email, password };

      const res = await API.post("/api/login", payload);

      console.log("LOGIN RESPONSE (frontend):", res);

      if (!res || res.success !== true) {
        const msg =
          res?.data?.message ||
          res?.data?.error ||
          res?.error?.message ||
          "Invalid credentials";
        showError(msg);
        return;
      }

      // Extract user from normalized response
      const user = res.user || res.data?.user || res.data;

      if (!user || !user.role) {
        showError("Invalid server response.");
        return;
      }

      // Store minimal session info for dashboards
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          role: user.role,
          is_owner: user.role === "owner"
        })
      );

      // Redirect based on role
      window.location.assign(roleRedirect(user.role));

    } catch (err) {
      console.error("Login error:", err);
      showError("Network error. Try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  }

  if (form) {
    form.addEventListener("submit", onSubmit);
  } else {
    console.error("auth-login-form not found in DOM");
  }
})();
