import API from "/app/js/api.js";

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
    if (currentPath.endsWith("contracts.html") && link.href.includes("contracts.html")) {
      a.classList.add("rs-dash-nav-active");
    }
    nav.appendChild(a);
  });
}

const userId = getUserIdFromQuery();

async function loadContracts() {
  const listEl = document.getElementById("business-contracts-full");
  const statusEl = document.getElementById("business-status");

  if (!userId) {
    statusEl.textContent = "Missing business ID in URL.";
    return;
  }

  buildNav(userId);
  statusEl.textContent = "Loading contracts…";

  const res = await API.get(`/api/contracts?user=${encodeURIComponent(userId)}`);
  if (!res.success) {
    statusEl.textContent = res.error?.message || "Failed to load contracts.";
    return;
  }

  const data = res.data || {};
  const contracts = Array.isArray(data.contracts) ? data.contracts : [];

  listEl.innerHTML = "";
  if (!contracts.length) {
    listEl.innerHTML = "<li>No contracts yet.</li>";
  } else {
    contracts.forEach(c => {
      const li = document.createElement("li");
      li.textContent = `${c.skater_name} — ${c.status}`;
      listEl.appendChild(li);
    });
  }

  statusEl.textContent = "";
}

loadContracts();
