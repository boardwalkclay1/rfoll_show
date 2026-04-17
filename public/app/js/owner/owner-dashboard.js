// ============================================================
// OWNER DASHBOARD JS — ZERO DEPENDENCIES, ZERO API, ZERO AUTH
// ============================================================

// No requireUser, no getUser, no API, no authedGet.
// Nothing runs except UI activation.

window.addEventListener("DOMContentLoaded", () => {
  console.log("Owner dashboard loaded (safe mode)");
  initOwnerDashboard();
});

// ============================================================
// SECTION SWITCHING
// ============================================================
const navButtons = document.querySelectorAll(".owner-nav button");
const sections = document.querySelectorAll(".owner-section");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;

    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach(sec => {
      sec.classList.toggle("active", sec.id === `section-${target}`);
    });
  });
});

// ============================================================
// DISABLED LOADERS (NO API CALLS AT ALL)
// ============================================================
async function initOwnerDashboard() {
  console.log("Safe mode: no API calls, no auth, no backend.");
}
