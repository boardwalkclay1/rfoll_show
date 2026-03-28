import API from "../api.js";
import { getUserIdFromQuery } from "../utils.js";

const form = document.getElementById("create-offer-form");
const userId = getUserIdFromQuery();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  await API.post("/api/business/create-offer", {
    user_id: userId,
    skater_id: fd.get("skater_id"),
    title: fd.get("title"),
    details: fd.get("details")
  });

  alert("Offer sent.");
  form.reset();
});
