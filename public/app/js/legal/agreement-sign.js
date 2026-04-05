// /app/js/legal/agreement-sign.js
import API from "/app/js/api.js";
import { getUserIdFromQuery } from "../utils.js";

const block = document.querySelector(".sign-block");
if (block) {
  const userId = getUserIdFromQuery();
  const type = block.dataset.agreementType;
  const version = block.dataset.agreementVersion;
  const contentSelector = block.dataset.contentSelector || "#agreement-body";
  const contentEl = document.querySelector(contentSelector);

  const checkbox = document.getElementById("sign-agree-checkbox");
  const button = document.getElementById("sign-agreement-btn");
  const status = document.getElementById("sign-status");

  if (checkbox && button && contentEl) {
    checkbox.addEventListener("change", () => {
      button.disabled = !checkbox.checked;
    });

    button.addEventListener("click", async () => {
      if (!userId) {
        alert("Missing user id in URL (?user=ID).");
        return;
      }

      button.disabled = true;
      status.textContent = "Saving signature...";

      const html = contentEl.innerHTML;

      try {
        await API.post("/api/agreements/sign", {
          user_id: userId,
          agreement_type: type,
          agreement_version: version,
          agreement_html: html
        });

        status.textContent = "Signed and saved.";
      } catch (err) {
        console.error(err);
        status.textContent = "Error saving signature.";
        button.disabled = false;
      }
    });
  }
}
