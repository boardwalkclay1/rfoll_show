import API from "../api.js";
import { getUserIdFromQuery } from "../utils.js";

const userId = getUserIdFromQuery();

async function loadDashboard() {
  const data = await API.get(`/api/buyer/dashboard?user=${userId}`);

  document.getElementById("buyer-name").textContent = data.name;

  const tickets = document.getElementById("buyer-tickets");
  tickets.innerHTML = "";
  data.tickets.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.show_title} — ${t.date}`;
    tickets.appendChild(li);
  });

  const rec = document.getElementById("recommended-skaters");
  rec.innerHTML = "";
  data.recommended.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.discipline}`;
    rec.appendChild(li);
  });
}

loadDashboard();
