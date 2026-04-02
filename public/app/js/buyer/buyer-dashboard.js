import { apiGet } from "/app/js/utils.js";

async function loadBuyerDashboard() {
  try {
    const user = await apiGet("/api/auth/me");
    if (!user || user.role !== "buyer") {
      window.location.href = "/login.html";
      return;
    }

    document.getElementById("buyer-name").textContent = user.name || "Buyer";

    const profile = await apiGet("/api/buyer/profile");
    const tickets = await apiGet("/api/buyer/tickets");
    const recs = await apiGet("/api/buyer/recommended-skaters");

    renderTickets(tickets);
    renderRecommended(recs);

  } catch (err) {
    console.error("Buyer Dashboard Error:", err);
  }
}

function renderTickets(tickets) {
  const ul = document.getElementById("buyer-tickets");
  ul.innerHTML = "";

  tickets.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.show_name} — ${t.status}`;
    ul.appendChild(li);
  });
}

function renderRecommended(list) {
  const ul = document.getElementById("recommended-skaters");
  ul.innerHTML = "";

  list.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s.display_name;
    ul.appendChild(li);
  });
}

loadBuyerDashboard();
