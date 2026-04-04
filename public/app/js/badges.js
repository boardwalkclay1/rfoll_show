// ===============================
// BADGES.JS — FULL BADGE ENGINE
// ===============================

// -------------------------------
// API WRAPPER
// -------------------------------
async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`/api${path}`, opts);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// -------------------------------
// PAGE INIT
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("badges-page")) initBadgesPage();
});

// -------------------------------
// BADGES PAGE
// -------------------------------
async function initBadgesPage() {
  const badgeGrid = document.getElementById("badge-grid");
  const xpValue = document.getElementById("xp-value");

  // Fetch XP + badges
  const xp = await api("/xp");
  const badges = await api("/badges");

  xpValue.textContent = xp.total;

  badgeGrid.innerHTML = badges
    .map(
      (b) => `
      <div class="badge-card ${b.unlocked ? "" : "locked"}">
        <img src="/assets/badges/${b.icon}" alt="${b.name}" />
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      </div>`
    )
    .join("");
}

// -------------------------------
// XP SYSTEM
// -------------------------------
async function addXP(amount) {
  await api("/xp/add", "POST", { amount });
}

async function unlockBadge(key) {
  await api("/badges/unlock", "POST", { key });
}

// -------------------------------
// AUTO-UNLOCK LOGIC
// -------------------------------
async function checkAutoUnlocks() {
  const xp = await api("/xp");
  const badges = await api("/badges");

  // Example unlocks
  if (xp.total >= 100 && !badges.find((b) => b.key === "xp_100")?.unlocked) {
    await unlockBadge("xp_100");
  }

  if (xp.total >= 500 && !badges.find((b) => b.key === "xp_500")?.unlocked) {
    await unlockBadge("xp_500");
  }
}
