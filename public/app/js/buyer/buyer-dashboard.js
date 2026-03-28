// /app/js/buyer-dashboard.js
import API from "./api.js";
import { getUserIdFromQuery } from "./utils.js";

const userId = getUserIdFromQuery();

async function loadDashboard() {
  try {
    const data = await API.get(`/api/buyer/dashboard?user=${userId}`);

    document.getElementById("buyer-name").textContent = data.name;

    const tickets = document.getElementById("buyer-tickets");
    tickets.innerHTML = "";
    data.tickets.forEach(ticket => {
      const li = document.createElement("li");
      li.textContent = `${ticket.show_title} — $${(ticket.price_cents / 100).toFixed(2)}`;
      tickets.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
}

loadDashboard();
