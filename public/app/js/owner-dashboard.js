// OWNER DASHBOARD JS
// - Burger toggle
// - Overview stats
// - Run migrations button

document.addEventListener("DOMContentLoaded", () => {
  setupBurger();
  loadOverviewStats();
  wireMigrations();
});

function setupBurger() {
  const burger = document.querySelector(".burger");
  const sidebar = document.querySelector(".sidebar");
  if (!burger || !sidebar) return;

  burger.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

async function loadOverviewStats() {
  const container = document.getElementById("overview-grid");
  if (!container) return;

  container.innerHTML = `<div class="stat-card"><div class="stat-label">Loading</div><div class="stat-value">...</div></div>`;

  try {
    // Adjust endpoint to whatever your Worker exposes
    const res = await fetch("/owner/overview", { method: "GET" });
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();

    const stats = [
      { label: "Total Users", value: data.totalUsers },
      { label: "Skaters", value: data.totalSkaters },
      { label: "Businesses", value: data.totalBusinesses },
      { label: "Musicians", value: data.totalMusicians },
      { label: "Active Shows", value: data.activeShows },
      { label: "Pending Apps", value: data.pendingApplications },
    ].filter(s => s.value !== undefined);

    if (!stats.length) {
      container.innerHTML = `<div class="stat-card"><div class="stat-label">No Data</div><div class="stat-value">—</div></div>`;
      return;
    }

    container.innerHTML = "";
    stats.forEach(stat => {
      const card = document.createElement("div");
      card.className = "stat-card";
      card.innerHTML = `
        <div class="stat-label">${stat.label}</div>
        <div class="stat-value">${stat.value}</div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div class="stat-card"><div class="stat-label">Error</div><div class="stat-value">!</div></div>`;
  }
}

function wireMigrations() {
  const btn = document.getElementById("runMigrationsBtn");
  const output = document.getElementById("migrationResult");
  if (!btn || !output) return;

  btn.addEventListener("click", async () => {
    output.textContent = "Running migrations...";
    btn.disabled = true;

    try {
      // Adjust endpoint to your existing migration route
      const res = await fetch("/owner/run-migrations", {
        method: "POST",
      });

      const text = await res.text();
      output.textContent = text || "Migrations completed.";
    } catch (err) {
      output.textContent = "Error running migrations.";
    } finally {
      btn.disabled = false;
    }
  });
}
