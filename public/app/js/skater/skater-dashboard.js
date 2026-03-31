import API from "../api.js";

function getUserIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
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

  try {
    statusEl.textContent = "Loading…";

    const res = await API.get(`/api/skater/dashboard?user=${encodeURIComponent(userId)}`);
    if (!res.success) {
      statusEl.textContent = res.error?.message || "Failed to load dashboard.";
      return;
    }

    const data = res.data || {};

    nameEl.textContent = data.name || "Skater";
    earningsEl.textContent = `$${((data.earnings_cents || 0) / 100).toFixed(2)}`;

    showsEl.innerHTML = "";
    const shows = Array.isArray(data.shows) ? data.shows : [];
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

  } catch (err) {
    console.error("Skater dashboard error:", err);
    statusEl.textContent = "Server error loading dashboard.";
  }
}

loadDashboard();
