// /app/js/skater-dashboard.js
import API from "./api.js";
import { getUserIdFromQuery } from "./utils.js";

const userId = getUserIdFromQuery();

async function loadDashboard() {
  try {
    const data = await API.get(`/api/skater/dashboard?user=${userId}`);

    document.getElementById("skater-name").textContent = data.name;
    document.getElementById("skater-earnings").textContent =
      `$${(data.earnings_cents / 100).toFixed(2)}`;

    const shows = document.getElementById("skater-shows");
    shows.innerHTML = "";
    data.shows.forEach(show => {
      const li = document.createElement("li");
      li.textContent = `${show.title} — $${(show.price_cents / 100).toFixed(2)}`;
      shows.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
}

loadDashboard();
