import API from "../api.js";

function getUserIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

function buildNav(userId) {
  const base = "/app/pages/skater";
  const links = [
    { href: `${base}/dashboard.html?user=${userId}`, label: "Dashboard" },
    { href: `${base}/profile.html?user=${userId}`, label: "Profile" },
    { href: `${base}/shows.html?user=${userId}`, label: "Shows" },
    { href: `${base}/lessons.html?user=${userId}`, label: "Lessons" },
    { href: `${base}/businesses.html?user=${userId}`, label: "Businesses" },
    { href: `${base}/music.html?user=${userId}`, label: "Music" }
  ];

  const nav = document.getElementById("skater-nav");
  nav.innerHTML = "";

  const currentPath = window.location.pathname;

  links.forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    if (link.href.includes("dashboard.html") && currentPath.includes("dashboard.html")) {
      a.classList.add("rs-dash-nav-active");
    }
    nav.appendChild(a);
  });
}

const userId = getUserIdFromQuery();

async function loadDashboard() {
  const nameEl = document.getElementById("skater-name");
  const earningsEl = document.getElementById("skater-earnings");
  const showsEl = document.getElementById("skater-shows");
  const totalShowsEl = document.getElementById("skater-total-shows");
  const totalTicketsEl = document.getElementById("skater-total-tickets");
  const statusEl = document.getElementById("skater-status");

  if (!userId) {
    statusEl.textContent = "Missing skater ID in URL.";
    return;
  }

  buildNav(userId);

  statusEl.textContent = "Loading…";

  const res = await API.get(`/api/skater/dashboard?user=${encodeURIComponent(userId)}`);

  if (!res.success) {
    statusEl.textContent = res.error?.message || "Failed to load dashboard.";
    return;
  }

  const data = res.data || {};

  nameEl.textContent = data.name || "Skater";
  earningsEl.textContent = `$${((data.earnings_cents || 0) / 100).toFixed(2)}`;

  const shows = Array.isArray(data.shows) ? data.shows : [];
  showsEl.innerHTML = "";
  if (shows.length === 0) {
    showsEl.innerHTML = "<li>No shows yet.</li>";
  } else {
    shows.forEach(show => {
      const li = document.createElement("li");
      li.textContent = `${show.title} — ${show.date}`;
      showsEl.appendChild(li);
    });
  }

  totalShowsEl.textContent = shows.length.toString();
  totalTicketsEl.textContent = (data.total_tickets || 0).toString();

  statusEl.textContent = "";
}

loadDashboard();
