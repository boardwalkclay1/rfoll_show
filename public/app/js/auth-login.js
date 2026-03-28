// auth-login.js
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
    const res = await API.post("/api/login", payload);
    const role = res.role;
    const userId = res.id;

    let target = "/";

    if (role === "skater") target = "/pages/skater-dashboard.html";
    else if (role === "musician") target = "/pages/musician-dashboard.html";
    else if (role === "business") target = "/pages/business-dashboard.html";
    else if (role === "buyer") target = "/pages/buyer-dashboard.html";
    else if (role === "owner") target = "/pages/owner-dashboard.html";

    window.location.href = `${target}?user=${encodeURIComponent(userId)}`;
  } catch (err) {
    console.error(err);
    alert("Login failed. Check your email and password.");
  }
});
