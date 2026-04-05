import API from "/app/js/api.js";

function user() {
  return JSON.parse(localStorage.getItem("user") || "{}");
}

async function loadAnalytics(range = 7) {
  const headers = API.withUser(user());
  const res = await API.get(`/api/musician/analytics?range=${range}`, headers);

  if (!res.success) return console.error(res.error);

  const overview = document.getElementById("analytics-overview");
  const topTracks = document.getElementById("analytics-top-tracks");

  overview.innerHTML = "";
  topTracks.innerHTML = "";

  Object.entries(res.data.overview || {}).forEach(([k, v]) => {
    const div = document.createElement("div");
    div.className = "stat-item";
    div.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
    overview.appendChild(div);
  });

  (res.data.top_tracks || []).forEach(t => {
    const div = document.createElement("div");
    div.className = "mini-item";
    div.innerHTML = `<strong>${t.title}</strong> — ${t.plays} plays`;
    topTracks.appendChild(div);
  });
}

function bindRange() {
  document.querySelectorAll(".analytics-filters .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      loadAnalytics(chip.dataset.range);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindRange();
  loadAnalytics(7);
});
