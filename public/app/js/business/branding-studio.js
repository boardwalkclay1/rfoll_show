import API from "../api.js";
import { getUserIdFromQuery } from "../utils.js";

const form = document.getElementById("branding-form");
const userId = getUserIdFromQuery();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  await API.post("/api/business/branding", {
    user_id: userId,
    bio: fd.get("bio"),
    logo: fd.get("logo") ? fd.get("logo").name : "",
    banner: fd.get("banner") ? fd.get("banner").name : ""
  });

  alert("Branding updated.");
});
