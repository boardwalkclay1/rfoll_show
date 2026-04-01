import API from "/js/api.js";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

async function loadMusic(filter = "all") {
  const user = getUser();
  const headers = API.withUser(user);

  const res = await API.get(`/api/skater/music?filter=${filter}`, headers);
  if (!res.success) {
    console.error("Failed to load music", res.error);
    return;
  }

  const list = document.getElementById("music-list");
  list.innerHTML = "";

  (res.data || []).forEach(track => {
    const row = document.createElement("div");
    row.className = "track-row";
    row.innerHTML = `
      <div>
        <strong>${track.title}</strong>
        <p>${track.artist || ""}</p>
      </div>
      <button class="btn-outline" data-id="${track.id}">Use</button>
    `;
    list.appendChild(row);
  });
}

function bindFilters() {
  const chips = document.querySelectorAll(".music-filters .chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      loadMusic(filter);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindFilters();
  loadMusic("all");
});
