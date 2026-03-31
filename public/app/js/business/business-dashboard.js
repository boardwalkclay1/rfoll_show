import API from "../api.js";

function getUserIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function buildNav(userId) {
  const base = "/app/pages/business";
  const links = [
    { href: `${base}/business-dashboard.html?user=${userId}`, label: "Dashboard" },
    { href: `${base}/offers.html?user=${userId}`, label: "Offers" },
    { href: `${base}/contracts.html?user=${userId}`, label: "Contracts" },
    { href: `${base}/create-offer.html?user=${userId}`, label: "Create Offer" },
    { href: `${base}/offers-inbox.html?user=${userId}`, label: "Inbox" },
    { href: `${base}/branding-studio.html?user=${userId}`, label: "Branding" },
    { href: `${base}/business-feed.html?user=${userId}`, label: "Feed" },
    { href: `${base}/apply.html?user=${userId}`, label: "Application" }
  ];

  const nav = document.getElementById("business-nav");
  nav.innerHTML = "";
  const current = window.location.pathname;

  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    if (current.includes(link.href.split("/").pop().split("?")[0])) {
      a.classList.add("rs-dash-nav-active");
    }
    nav.appendChild(a);
  });
}

function wirePageLinks(userId) {
  const base = "/app/pages/business";

  document.getElementById("offers-link").href =
    `${base}/offers.html?user=${userId}`;

  document.getElementById("create-offer-link").href =
    `${base}/create-offer.html?user=${userId}`;

  document.getElementById("offers-inbox-link").href =
    `${base}/offers-inbox.html?user=${userId}`;

  document.getElementById("contracts-link").href =
    `${base}/contracts.html?user=${userId}`;

  document.getElementById("branding-link").href =
    `${base}/branding-studio.html?user=${userId}`;

  document.getElementById("feed-link").href =
    `${base}/business-feed.html?user=${userId}`;

  document.getElementById("ads-link").href =
    `${base}/ads.html?user=${userId}`;

  document.getElementById("apply-link").href =
    `${base}/apply.html?user=${userId}`;
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
  wirePageLinks(userId);

  statusEl.textContent = "Loading…";

  const res = await API.get(`/api/business/dashboard?user=${encodeURIComponent(userId)}`);
  if (!res.success) {
    statusEl.textContent = res.error?.message || "Failed to load dashboard.";
    return;
  }

  const data = res.data || {};

  nameEl.textContent = data.business?.company_name || "Business";
  revenueEl.textContent = `$${((data.revenue_cents || 0) / 100).toFixed(2)}`;

  /* OFFERS */
  const offers = Array.isArray(data.offers) ? data.offers : [];
  offersEl.innerHTML = "";
  if (!offers.length) {
    offersEl.innerHTML = "<li>No active offers.</li>";
  } else {
    offers.slice(0, 5).forEach(o => {
      const li = document.createElement("li");
      li.textContent = `${o.type} — ${o.skater_name}`;
      offersEl.appendChild(li);
    });
  }

  /* CONTRACTS */
  const contracts = Array.isArray(data.contracts) ? data.contracts : [];
  contractsEl.innerHTML = "";
  if (!contracts.length) {
    contractsEl.innerHTML = "<li>No contracts yet.</li>";
  } else {
    contracts.slice(0, 5).forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.type} — ${c.status}`;
      contractsEl.appendChild(li);
    });
  }

  statusEl.textContent = "";
}

loadDashboard();
