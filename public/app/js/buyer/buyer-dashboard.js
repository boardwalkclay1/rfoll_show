import API from "../api.js";

function getUserIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function buildNav(userId) {
  const base = "/app/pages/buyer";
  const links = [
    { href: `${base}/dashboard.html?user=${userId}`, label: "Dashboard" },
    { href: `${base}/profile.html?user=${userId}`, label: "Profile" },
    { href: `${base}/tickets.html?user=${userId}`, label: "Tickets" },
    { href: `${base}/purchases.html?user=${userId}`, label: "Purchases" },
    { href: `${base}/recommended.html?user=${userId}`, label: "Recommended" }
  ];

  const nav = document.getElementById("buyer-nav");
  nav.innerHTML = "";
  const currentPath = window.location.pathname;

  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    if (currentPath.endsWith("dashboard.html") && link.href.includes("dashboard.html")) {
      a.classList.add("rs-dash-nav-active");
    }
    nav.appendChild(a);
  });
}

const userId = getUserIdFromQuery();

async function loadDashboard() {
  const nameEl = document.getElementById("buyer-name");
  const ticketsEl = document.getElementById("buyer-tickets");
  const purchasesEl = document.getElementById("buyer-purchases");
  const statusEl = document.getElementById("buyer-status");

  if (!userId) {
    statusEl.textContent = "Missing buyer ID in URL.";
    return;
  }

  buildNav(userId);
  statusEl.textContent = "Loading…";

  // You can set buyer name from login or another endpoint; placeholder for now
  nameEl.textContent = "Buyer";

  const [ticketsRes, purchasesRes] = await Promise.all([
    API.get(`/api/buyer/tickets?user=${encodeURIComponent(userId)}`),
    API.get(`/api/buyer/purchases?user=${encodeURIComponent(userId)}`)
  ]);

  ticketsEl.innerHTML = "";
  if (!ticketsRes.success) {
    ticketsEl.innerHTML = "<li>Failed to load tickets.</li>";
  } else {
    const tData = ticketsRes.data || {};
    const tickets = Array.isArray(tData.tickets) ? tData.tickets : [];
    if (!tickets.length) {
      ticketsEl.innerHTML = "<li>No tickets yet.</li>";
    } else {
      tickets.slice(0, 5).forEach(t => {
        const li = document.createElement("li");
        li.textContent = `${t.show_title} — ${t.date}`;
        ticketsEl.appendChild(li);
      });
    }
  }

  purchasesEl.innerHTML = "";
  if (!purchasesRes.success) {
    purchasesEl.innerHTML = "<li>Failed to load purchases.</li>";
  } else {
    const pData = purchasesRes.data || {};
    const purchases = Array.isArray(pData.purchases) ? pData.purchases : [];
    if (!purchases.length) {
      purchasesEl.innerHTML = "<li>No purchases yet.</li>";
    } else {
      purchases.slice(0, 5).forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.show_title} — $${(p.amount_cents / 100).toFixed(2)}`;
        purchasesEl.appendChild(li);
      });
    }
  }

  statusEl.textContent = "";
}

loadDashboard();
