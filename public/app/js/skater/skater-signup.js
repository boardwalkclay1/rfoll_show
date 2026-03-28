import API from "../api.js";
import { initAgreementModal } from "../agreement-modal.js";
import RightsEngine from "../rights-engine.js";

const form = document.getElementById("skater-signup-form");
const modal = initAgreementModal("agreement-modal");
const AGREEMENT_VERSION = "skater_v1";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  const payload = {
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
    extra: {
      recorder_name: fd.get("recorder_name") || "",
      recorder_email: fd.get("recorder_email") || "",
      recorder_percent: fd.get("recorder_percent") || ""
    }
  };

  const html = await API.getText("/legal/pages/skater-agreement.html");

  modal.open({
    title: "Skater Agreement",
    html,
    onAgreeCallback: async (agreementHtml) => {
      const user = await RightsEngine.signupWithAgreement({
        role: "skater",
        signupPath: "/api/signup",
        rightsPath: "/api/rights/skater-signup",
        agreementType: "skater",
        agreementVersion: AGREEMENT_VERSION,
        agreementHtml,
        formData: payload
      });

      window.location.href = `/pages/skater/skater-dashboard.html?user=${user.id}`;
    }
  });
});
