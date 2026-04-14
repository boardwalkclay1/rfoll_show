// /app/js/business/business-signup.js
// Client-side business signup: password verify, basic validation, POST to API.

const form = document.getElementById("business-apply-form");
const errorEl = document.getElementById("business-signup-error");
const submitBtn = document.getElementById("business-signup-submit");

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.style.display = "block";
}

function clearError() {
  errorEl.textContent = "";
  errorEl.style.display = "none";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const fd = new FormData(form);
  const company_name = (fd.get("company_name") || "").trim();
  const country = (fd.get("country") || "").trim();
  const name = (fd.get("name") || "").trim();
  const email = (fd.get("email") || "").trim();
  const password = fd.get("password") || "";
  const passwordVerify = fd.get("password_verify") || "";
  const role = fd.get("role") || "business";

  if (!company_name) return showError("Please enter your company name.");
  if (!country) return showError("Please select your country.");
  if (!name) return showError("Please enter your full name.");
  if (!email) return showError("Please enter an email.");
  if (!password) return showError("Please enter a password.");
  if (password !== passwordVerify) return showError("Passwords do not match.");

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  try {
    const payload = {
      company_name,
      country,
      name,
      email,
      password,
      password_verify: passwordVerify,
      role
    };

    const res = await fetch("/api/signup/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      showError((data && data.message) || "Signup failed. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Application";
      return;
    }

    if (data.success) {
      window.location.href = data.redirect || "/pages/onboarding-business.html";
      return;
    } else {
      showError(data.message || "Signup failed. Please check your input.");
    }
  } catch (err) {
    showError("Network error. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Application";
  }
});
