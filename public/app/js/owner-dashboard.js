// /app/js/owner-dashboard.js
import API from "/app/js/api.js";

const analyticsEl = document.getElementById("analytics");
const runBtn = document.getElementById("runMigrationsBtn");
const resultEl = document.getElementById("migrationResult");

async function loadAnalytics() {
  const res = await API.get("/api/owner/overview");

  if (!res.success || !res.data) {
    analyticsEl.innerHTML = `<p>Error loading analytics</p>`;
    return;
  }

  const stats = res.data;

  const cards = [
    { label: "Total Users", value: stats.total_users },
    { label: "Skaters", value: stats.total_skaters },
    { label: "Businesses", value: stats.total_businesses },
    { label: "Musicians", value: stats.total_musicians },
    { label: "Tickets Sold", value: stats.tickets_sold },
    { label: "Revenue", value: `$${stats.revenue}` },
    { label: "Active Shows", value: stats.active_shows },
    { label: "Pending Verifications", value: stats.pending_verifications }
  ];

  analyticsEl.innerHTML = cards.map(c => `
    <div class="card">
      <h3>${c.label}</h3>
      <div class="value">${c.value}</div>
    </div>
  `).join("");
}

async function runMigrations() {
  resultEl.textContent = "Running migrations...";

  const res = await API.post("/api/owner/run-migrations");

  if (res.success) {
    resultEl.textContent = res.data.output || "Migrations complete.";
  } else {
    resultEl.textContent = res.error?.message || "Migration failed.";
  }
}

runBtn.addEventListener("click", runMigrations);

loadAnalytics();
