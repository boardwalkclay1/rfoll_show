import API from "/app/js/api.js";

const tableBody = document.querySelector("#showsTable tbody");
const detailEl = document.getElementById("showDetail");
const searchInput = document.getElementById("showSearch");
const statusSelect = document.getElementById("showStatus");

let allShows = [];

function renderTable() {
  const q = (searchInput.value || "").toLowerCase();
  const status = statusSelect.value || "";

  const rows = allShows.filter(s => {
    const matchStatus = status ? (s.status || "") === status : true;
    const matchSearch =
      !q ||
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  tableBody.innerHTML = rows
    .map(
      s => `
      <tr data-id="${s.id}">
        <td>${s.title || "—"}</td>
        <td>${s.city || "—"}</td>
        <td>${s.date || s.start_time || "—"}</td>
        <td>${s.status || "—"}</td>
      </tr>
    `
    )
    .join("");
}

function renderDetail(show) {
  if (!show) {
    detailEl.innerHTML =
      "<p>Select a show to view funding, ticket sales, and lineup.</p>";
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-label">Show ID</div>
    <div class="detail-value">${show.id}</div>

    <div class="detail-label">Title</div>
    <div class="detail-value">${show.title || "—"}</div>

    <div class="detail-label">City</div>
    <div class="detail-value">${show.city || "—"}</div>

    <div class="detail-label">Status</div>
    <div class="detail-value">${show.status || "—"}</div>

    <div class="detail-label">Created At</div>
    <div class="detail-value">${show.created_at || "—"}</div>
  `;
}

async function loadShows() {
  const res = await API.get("/api/owner/shows");
  if (!res.success || !res.data) return;

  allShows = res.data.shows || [];
  renderTable();
}

tableBody.addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  const show = allShows.find(s => s.id === id);
  renderDetail(show);
});

searchInput.addEventListener("input", renderTable);
statusSelect.addEventListener("change", renderTable);

loadShows();
