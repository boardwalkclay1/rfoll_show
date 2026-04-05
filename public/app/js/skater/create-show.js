import API from "/app/js/api.js";
import { getUserIdFromQuery } from "../utils.js";

const form = document.getElementById("create-show-form");
const userId = getUserIdFromQuery();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  await API.post("/api/skater/create-show", {
    user_id: userId,
    title: fd.get("title"),
    description: fd.get("description"),
    price_cents: Number(fd.get("price_cents")),
    thumbnail: fd.get("thumbnail")
  });

  alert("Show created.");
  window.location.href = `/pages/skater/skater-dashboard.html?user=${userId}`;
});
