import API from "/app/js/api.js";

const summaryEl = document.getElementById("payoutSummary");
const tableBody = document.querySelector("#payoutsTable tbody");
const detailEl = document.getElementById("payoutDetail");
const statusSelect = document.getElementById("payoutStatus");
const typeSelect = document.getElementById("payoutType");
const searchInput = document.getElementById("payoutSearch");

let allPayouts = [];
let summary = {};
let selected = null;

function formatMoney(cents) {
  const n = Number(cents || 0) / 100;
  return `$${n.toFixed(2)}`;
}

function renderSummary() {
  const s = summary || {};
  summaryEl.innerHTML = `
    <div class="summary-card">
      <div class="summary-label">Total Revenue</div>
      <div class="summary-value">${formatMoney(s.total_revenue_cents)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Owed</div>
      <div class="summary-value">${formatMoney(s.total_owed_cents)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Pending Payouts</div>
      <div class="summary-value">${formatMoney(s.pending_payouts_cents)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Paid Out</div>
      <div class="summary-value">${formatMoney(s.paid_out_cents)}</div>
    </div>
  `;
}

function renderTable() {
  const status = statusSelect.value || "";
  const type = typeSelect.value || "";
  const q = (searchInput.value || "").toLowerCase();

  const rows = allPayouts.filter(p => {
    const matchStatus = status ? (p.status || "") === status : true;
    const matchType = type ? (p.recipient_type || "") === type : true;
    const matchSearch =
      !q ||
      (p.recipient_name && p.recipient_name.toLowerCase().includes(q)) ||
      (p.recipient_email && p.recipient_email.toLowerCase().includes(q));
    return matchStatus && matchType && matchSearch;
  });

  tableBody.innerHTML = rows
    .map(
      p => `
      <tr data-id="${p.id}">
        <td>${p.recipient_name || "—"}</td>
        <td>${p.recipient_type || "—"}</td>
        <td>${formatMoney(p.amount_cents)}</td>
        <td>${p.status || "—"}</td>
        <td>${p.created_at || "—"}</td>
      </tr>
    `
    )
    .join("");
}

function renderDetail(p) {
  if (!p) {
    detailEl.innerHTML =
      "<p>Select a payout to view breakdown and history.</p>";
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-label">Payout ID</div>
    <div class="detail-value">${p.id}</div>

    <div class="detail-label">Recipient</div>
    <div class="detail-value">${p.recipient_name || "—"} (${p.recipient_email ||
    "—"})</div>

    <div class="detail-label">Type</div>
    <div class="detail-value">${p.recipient_type || "—"}</div>

    <div class="detail-label">Amount</div>
    <div class="detail-value">${formatMoney(p.amount_cents)}</div>

    <div class="detail-label">Status</div>
    <div class="detail-value">${p.status || "—"}</div>

    <div class="detail-label">Created At</div>
    <div class="detail-value">${p.created_at || "—"}</div>

    <div class="detail-label">Meta</div>
    <div class="detail-value">${p.meta_json || "—"}</div>
  `;
}

async function loadPayouts() {
  const res = await API.get("/api/owner/payouts");
  if (!res.success || !res.data) return;

  summary = res.data.summary || {};
  allPayouts = res.data.payouts || [];
  selected = null;

  renderSummary();
  renderTable();
  renderDetail(null);
}

tableBody.addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  selected = allPayouts.find(p => p.id === id);
  renderDetail(selected);
});

statusSelect.addEventListener("change", renderTable);
typeSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

loadPayouts();
