import API from "/app/js/api.js";

const tableBody = document.querySelector("#contractsTable tbody");
const detailEl = document.getElementById("contractDetail");
const searchInput = document.getElementById("contractSearch");
const statusSelect = document.getElementById("contractStatus");

let allContracts = [];

function renderTable() {
  const q = (searchInput.value || "").toLowerCase();
  const status = statusSelect.value || "";

  const rows = allContracts.filter(c => {
    const matchStatus = status ? (c.status || "") === status : true;
    const matchSearch =
      !q ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  tableBody.innerHTML = rows
    .map(
      c => `
      <tr data-id="${c.id}">
        <td>${c.title || "—"}</td>
        <td>${c.type || "—"}</td>
        <td>${c.status || "—"}</td>
        <td>${c.created_at || "—"}</td>
      </tr>
    `
    )
    .join("");
}

function renderDetail(contract) {
  if (!contract) {
    detailEl.innerHTML =
      "<p>Select a contract to view participants, splits, and signatures.</p>";
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-label">Contract ID</div>
    <div class="detail-value">${contract.id}</div>

    <div class="detail-label">Title</div>
    <div class="detail-value">${contract.title || "—"}</div>

    <div class="detail-label">Type</div>
    <div class="detail-value">${contract.type || "—"}</div>

    <div class="detail-label">Status</div>
    <div class="detail-value">${contract.status || "—"}</div>

    <div class="detail-label">Created At</div>
    <div class="detail-value">${contract.created_at || "—"}</div>
  `;
}

async function loadContracts() {
  const res = await API.get("/api/owner/contracts");
  if (!res.success || !res.data) return;

  allContracts = res.data.contracts || [];
  renderTable();
}

tableBody.addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  const contract = allContracts.find(c => c.id === id);
  renderDetail(contract);
});

searchInput.addEventListener("input", renderTable);
statusSelect.addEventListener("change", renderTable);

loadContracts();
