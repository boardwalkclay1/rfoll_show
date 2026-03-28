import API from "../api.js";
import { initAgreementModal } from "../agreement-modal.js";
import RightsEngine from "../rights-engine.js";

const form = document.getElementById("business-signup-form");
const modal = initAgreementModal("agreement-modal");
const AGREEMENT_VERSION = "business_v1";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  const payload = {
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
    extra: {
      company_name: fd.get("company_name")
    }
  };

  const html = await API.getText("/legal/pages/business-agreement.html");

  modal.open({
    title: "Business Agreement",
    html,
    onAgreeCallback: async (agreementHtml) => {
      const user = await RightsEngine.signupWithAgreement({
        role: "business",
        signupPath: "/api/signup",
        rightsPath: "/api/rights/business-signup",
        agreementType: "business",
        agreementVersion: AGREEMENT_VERSION,
        agreementHtml,
        formData: payload
      });

      window.location.href = `/pages/business/business-dashboard.html?user=${user.id}`;
    }
  });
});
