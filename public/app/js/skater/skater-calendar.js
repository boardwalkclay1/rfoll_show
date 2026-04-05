import API from "/app/js/api.js";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

async function loadCalendar(filter = "all") {
  const user = getUser();
  const headers = API.withUser(user);

  const res = await API.get(`/api/skater/calendar?filter=${filter}`, headers);
  if (!res.success) {
    console.error("Failed to load calendar", res.error);
    return;
  }

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  (res.data || []).forEach(item => {
    const div = document.createElement("div");
    div.className = "calendar-item";
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.date || ""}</p>
      <p>${item.type || ""}</p>
    `;
    grid.appendChild(div);
  });
}

function bindFilters() {
  const chips = document.querySelectorAll(".calendar-filters .chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      loadCalendar(filter);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindFilters();
  loadCalendar("all");
});
