import API from "../api.js";

function getUserIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function buildNav(userId) {
  const base = "/app/pages/business";
  const links = [
    { href: `${base}/dashboard.html?user=${userId}`, label: "Dashboard" },
    { href: `${base}/profile.html?user=${userId}`, label: "Profile" },
    { href: `${base}/offers.html?user=${userId}`, label: "Offers" },
    { href: `${base}/contracts.html?user=${userId}`, label: "Contracts" },
    { href: `${base}/ads.html?user=${userId}`, label: "Ads" },
    { href: `${base}/events.html?user=${userId}`, label: "Events" }
  ];

  const nav = document.getElementById("business-nav");
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
  const nameEl = document.getElementById("business-name");
  const revenueEl = document.getElementById("business-revenue");
  const offersEl = document.getElementById("business-offers");
  const contractsEl = document.getElementById("business-contracts");
  const statusEl = document.getElementById("business-status");

  if (!userId) {
    statusEl.textContent = "Missing business ID in URL.";
    return;
  }

  buildNav(userId);
  statusEl.textContent = "Loading…";

  const res = await API.get(`/api/business/dashboard?user=${encodeURIComponent(userId)}`);
  if (!res.success) {
    statusEl.textContent = res.error?.message || "Failed to load dashboard.";
    return;
  }

  const data = res.data || {};
  nameEl.textContent = data.name || "Business";
  revenueEl.textContent = `$${((data.revenue_cents || 0) / 100).toFixed(2)}`;

  const offers = Array.isArray(data.offers) ? data.offers : [];
  offersEl.innerHTML = "";
  if (!offers.length) {
    offersEl.innerHTML = "<li>No active offers.</li>";
  } else {
    offers.forEach(o => {
      const li = document.createElement("li");
      li.textContent = `${o.title} — $${(o.price_cents / 100).toFixed(2)}`;
      offersEl.appendChild(li);
    });
  }

  const contracts = Array.isArray(data.contracts) ? data.contracts : [];
  contractsEl.innerHTML = "";
  if (!contracts.length) {
    contractsEl.innerHTML = "<li>No contracts yet.</li>";
  } else {
    contracts.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.skater_name} — ${c.status}`;
      contractsEl.appendChild(li);
    });
  }

  statusEl.textContent = "";
}

loadDashboard();
