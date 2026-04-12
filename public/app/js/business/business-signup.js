// app/js/business/business-apply.js
import API from "/app/js/api.js";

const form = document.getElementById("business-apply-form");
const messageEl = document.getElementById("business-apply-message");

function showMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.className = "rs-message " + type;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMessage("Submitting application...", "info");

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await API.post("/api/business/signup", payload);

    if (!res.success) {
      showMessage(
        res.error?.message || res.error || "Application failed.",
        "error"
      );
      return;
    }

    showMessage(
      "Application submitted. Your business will be reviewed before access is granted.",
      "success"
    );

    form.reset();

  } catch (err) {
    console.error(err);
    showMessage("Network error. Please try again.", "error");
  }
});
