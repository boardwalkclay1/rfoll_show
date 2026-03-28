// musician-signup.js
import API from "./api.js";
import { initAgreementModal } from "./agreement-modal.js";
import RightsEngine from "./rights-engine.js";

const form = document.getElementById("musician-signup-form");
const modal = initAgreementModal("agreement-modal");
const AGREEMENT_VERSION = "artist_v1";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const payload = {
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
    extra: {}
  };

  try {
    const html = await API.getText("/legal/artist-agreement.html");

    modal.open({
      title: "Artist Agreement",
      html,
      onAgreeCallback: async (agreementHtml) => {
        try {
          const user = await RightsEngine.handleSignupWithAgreement({
            role: "musician",
            signupPath: "/api/signup",
            rightsPath: "/api/rights/artist-signup",
            agreementType: "artist",
            agreementVersion: AGREEMENT_VERSION,
            agreementHtml,
            formData: payload
          });

          window.location.href = `/pages/musician-dashboard.html?user=${encodeURIComponent(
            user.id
          )}`;
        } catch (err) {
          console.error(err);
          alert("There was an issue creating your artist account.");
        }
      }
    });
  } catch (err) {
    console.error(err);
    alert("Unable to load artist agreement.");
  }
});
