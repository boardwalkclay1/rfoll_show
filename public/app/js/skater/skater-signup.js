// /app/js/skater/skater-signup.js
// Client-side signup logic: password verify, discipline/subclass UI, basic validation, POST to API.

const form = document.getElementById("skater-signup-form");
const disciplineSelect = document.getElementById("discipline");
const subclassSelect = document.getElementById("subclass");
const errorEl = document.getElementById("skater-signup-error");
const submitBtn = document.getElementById("skater-signup-submit");

const subclassMap = {
  "longboarder": ["cruiser", "downhill", "dancer"],
  "skate boarder": ["street", "vert"],
  "roller skater": ["rink", "outdoor", "skatepark"],
  "inline skater": ["vert", "street", "rink"]
};

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.style.display = "block";
}

function clearError() {
  errorEl.textContent = "";
  errorEl.style.display = "none";
}

function populateSubclassOptions(discipline) {
  const subs = subclassMap[discipline] || [];
  if (!subs.length) {
    subclassSelect.innerHTML = `<option value="">Select subclass (optional)</option>`;
    subclassSelect.disabled = true;
    return;
  }
  subclassSelect.innerHTML = `<option value="">Select subclass (optional)</option>` +
    subs.map(s => `<option value="${s}">${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join("");
  subclassSelect.disabled = false;
}

// When discipline changes, populate subclass dropdown
disciplineSelect.addEventListener("change", () => {
  const val = disciplineSelect.value;
  populateSubclassOptions(val);
  clearError();
});

// Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const fd = new FormData(form);
  const name = (fd.get("name") || "").trim();
  const email = (fd.get("email") || "").trim();
  const password = fd.get("password") || "";
  const passwordVerify = fd.get("password_verify") || "";
  const stage_name = (fd.get("stage_name") || "").trim();
  const discipline = (fd.get("discipline") || "").trim();
  const subclass = (fd.get("subclass") || "").trim();
  const role = fd.get("role") || "skater";

  // Basic client-side validation
  if (!email) return showError("Please enter an email.");
  if (!password) return showError("Please enter a password.");
  if (password !== passwordVerify) return showError("Passwords do not match.");
  if (!stage_name) return showError("Please enter a stage name.");
  if (!discipline) return showError("Please select a discipline.");

  // Validate subclass matches discipline if provided
  if (subclass) {
    const allowed = subclassMap[discipline] || [];
    if (!allowed.includes(subclass)) {
      return showError("Invalid subclass for selected discipline.");
    }
  }

  // Disable submit while request is in-flight
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating…";

  try {
    // Normalize discipline and subclass to canonical lowercase values
    const payload = {
      name,
      email,
      password,
      password_verify: passwordVerify,
      role,
      stage_name,
      discipline: discipline || null,
      subclass: subclass || null
    };

    const res = await fetch("/api/signup/skater", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      showError((data && data.message) || "Signup failed. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
      return;
    }

    if (data.success) {
      window.location.href = data.redirect || "/pages/onboarding-skater.html";
      return;
    } else {
      showError(data.message || data.profile_error || "Signup failed. Please check your input.");
    }
  } catch (err) {
    showError("Network error. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// Initialize subclass state on load if discipline preselected
document.addEventListener("DOMContentLoaded", () => {
  if (disciplineSelect.value) populateSubclassOptions(disciplineSelect.value);
});
