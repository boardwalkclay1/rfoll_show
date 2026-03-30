// auth-login.js — CLEAN REBUILD
import API from "./api.js";

const form = document.getElementById("auth-login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const payload = {
    email: fd.get("email"),
    password: fd.get("password")
  };

  try {
    // POST to Worker backend
    const res = await API.post("/api/login", payload);

    if (!res.success || !res.user) {
      alert("Login failed. Check your email and password.");
      return;
    }

    const user = res.user;

    // Save user session
    localStorage.setItem("rollshow_user", JSON.stringify(user));

    // Role-based redirect
    let target = "/";

    if (user.is_owner) {
      target = "/pages/owner-dashboard.html";
    } else {
      switch (user.role) {
        case "skater":
          target = "/pages/skater-dashboard.html";
          break;
        case "musician":
          target = "/pages/musician-dashboard.html";
          break;
        case "business":
          target = "/pages/business-dashboard.html";
          break;
        case "buyer":
          target = "/pages/buyer-dashboard.html";
          break;
      }
    }

    window.location.href = target;

  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed. Check your email and password.");
  }
});
