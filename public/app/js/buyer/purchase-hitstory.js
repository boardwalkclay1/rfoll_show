import API from "/app/js/api.js";
import { getUserIdFromQuery } from "../utils.js";

const userId = getUserIdFromQuery();
const list = document.getElementById("history-list");

async function loadHistory() {
  const data = await API.get(`/api/buyer/history?user=${userId}`);

  list.innerHTML = "";
  data.history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.show_title} — $${(h.price_cents / 100).toFixed(2)} — ${h.date}`;
    list.appendChild(li);
  });
}

loadHistory();
