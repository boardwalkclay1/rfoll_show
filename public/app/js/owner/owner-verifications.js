import API from "/app/js/api.js";

const tableBody = document.querySelector("#verificationsTable tbody");
const detailEl = document.getElementById("verificationDetail");
const typeSelect = document.getElementById("verificationType");
const statusSelect = document.getElementById("verificationStatus");
const searchInput = document.getElementById("verificationSearch");
const notesEl = document.getElementById("verificationNotes");
const resultEl = document.getElementById("verificationResult");

const btnApprove = document.getElementById("verifyApprove");
const btnReject = document.getElementById("verifyReject");
const btnNeedsInfo = document.getElementById("verifyNeedsInfo");

let allVerifications = [];
let selected = null;

function renderTable() {
  const type = typeSelect.value || "";
  const status = statusSelect.value || "";
  const q = (searchInput.value || "").toLowerCase();

  const rows = allVerifications.filter(v => {
    const matchType = type ? (v.subject_type || "") === type : true;
    const matchStatus = status ? (v.status || "") === status : true;
    const matchSearch =
      !q ||
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q));
    return matchType && matchStatus && matchSearch;
  });

  tableBody.innerHTML = rows
    .map(
      v => `
      <tr data-id="${v.id}">
        <td>${v.subject_type || "—"}</td>
        <td>${v.name || "—"}</td>
        <td>${v.email || "—"}</td>
        <td>${v.status || "—"}</td>
        <td>${v.created_at || "—"}</td>
      </tr>
    `
    )
    .join("");
}

function renderDetail(v) {
  if (!v) {
    detailEl.innerHTML =
      "<p>Select a verification request to review documents and history.</p>";
    return;
  }

  const docs = v.documents_json ? JSON.parse(v.documents_json) : [];

  detailEl.innerHTML = `
    <div class="detail-label">Request ID</div>
    <div class="detail-value">${v.id}</div>

    <div class="detail-label">Type</div>
    <div class="detail-value">${v.subject_type || "—"}</div>

    <div class="detail-label">Name</div>
    <div class="detail-value">${v.name || "—"}</div>

    <div class="detail-label">Email</div>
    <div class="detail-value">${v.email || "—"}</div>

    <div class="detail-label">Status</div>
    <div class="detail-value">${v.status || "—"}</div>

    <div class="detail-label">Notes</div>
    <div class="detail-value">${v.review_notes || "—"}</div>

    <div class="detail-label">Documents</div>
    <div class="detail-value">
      ${
        docs.length
          ? docs
              .map(
                d =>
                  `<div><span class="badge">${d.type || "doc"}</span> ${d.label ||
                    ""}</div>`
              )
              .join("")
          : "—"
      }
    </div>

    <div class="detail-label">Created At</div>
    <div class="detail-value">${v.created_at || "—"}</div>
  `;
}

async function loadVerifications() {
  const res = await API.get("/api/owner/verifications");
  if (!res.success || !res.data) return;

  allVerifications = res.data.verifications || [];
  selected = null;
  notesEl.value = "";
  resultEl.textContent = "";
  renderTable();
  renderDetail(null);
}

tableBody.addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  selected = allVerifications.find(v => v.id === id);
  renderDetail(selected);
  resultEl.textContent = "";
});

typeSelect.addEventListener("change", renderTable);
statusSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

async function sendDecision(action) {
  if (!selected) {
    resultEl.textContent = "Select a request first.";
    return;
  }

  resultEl.textContent = "Submitting decision...";

  const res = await API.post("/api/owner/update-verification-status", {
    verificationId: selected.id,
    action,
    notes: notesEl.value || ""
  });

  if (!res.success) {
    resultEl.textContent = res.error?.message || "Failed to update status.";
    return;
  }

  resultEl.textContent = `Updated: ${res.data.status}`;
  await loadVerifications();
}

btnApprove.addEventListener("click", () => sendDecision("approve"));
btnReject.addEventListener("click", () => sendDecision("reject"));
btnNeedsInfo.addEventListener("click", () => sendDecision("needs_info"));

loadVerifications();
