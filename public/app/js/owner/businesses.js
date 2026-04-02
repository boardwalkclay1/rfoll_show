import API from "/app/js/api.js";

const tableBody = document.querySelector("#businessesTable tbody");
const detailEl = document.getElementById("businessDetail");
const searchInput = document.getElementById("businessSearch");
const statusSelect = document.getElementById("businessStatus");

let allBusinesses = [];

function renderTable() {
  const q = (searchInput.value || "").toLowerCase();
  const status = statusSelect.value || "";

  const rows = allBusinesses.filter(b => {
    const matchStatus = status ? (b.review_status || "") === status : true;
    const matchSearch =
      !q ||
      (b.company_name && b.company_name.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  tableBody.innerHTML = rows
    .map(
      b => `
      <tr data-id="${b.id}">
        <td>${b.company_name || "—"}</td>
        <td>${b.name || b.owner_name || "—"}</td>
        <td>${b.review_status || "—"}</td>
        <td>${b.verified ? "Yes" : "No"}</td>
      </tr>
    `
    )
    .join("");
}

function renderDetail(biz) {
  if (!biz) {
    detailEl.innerHTML =
      "<p>Select a business to view profile, sponsorship settings, and ad account status.</p>";
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-label">Business ID</div>
    <div class="detail-value">${biz.id}</div>

    <div class="detail-label">Company Name</div>
    <div class="detail-value">${biz.company_name || "—"}</div>

    <div class="detail-label">Owner</div>
    <div class="detail-value">${biz.name || biz.owner_name || "—"} (${biz.email || "—"})</div>

    <div class="detail-label">Website</div>
    <div class="detail-value">${biz.website || "—"}</div>

    <div class="detail-label">Verified</div>
    <div class="detail-value">${biz.verified ? "Yes" : "No"}</div>

    <div class="detail-label">Review Status</div>
    <div class="detail-value">${biz.review_status || "—"}</div>

    <div class="detail-label">Created At</div>
    <div class="detail-value">${biz.created_at || "—"}</div>
  `;
}

async function loadBusinesses() {
  const res = await API.get("/api/owner/businesses");
  if (!res.success || !res.data) return;

  allBusinesses = res.data.businesses || [];
  renderTable();
}

tableBody.addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  const biz = allBusinesses.find(b => b.id === id);
  renderDetail(biz);
});

searchInput.addEventListener("input", renderTable);
statusSelect.addEventListener("change", renderTable);

loadBusinesses();
