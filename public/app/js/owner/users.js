import API from "/app/js/api.js";

const tableBody = document.querySelector("#usersTable tbody");
const detailEl = document.getElementById("userDetail");
const searchInput = document.getElementById("filterSearch");
const roleSelect = document.getElementById("filterRole");

let allUsers = [];

function renderTable() {
  const q = (searchInput.value || "").toLowerCase();
  const role = roleSelect.value || "";

  const rows = allUsers.filter(u => {
    const matchRole = role ? u.role === role : true;
    const matchSearch =
      !q ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q));
    return matchRole && matchSearch;
  });

  tableBody.innerHTML = rows
    .map(
      u => `
      <tr data-id="${u.id}">
        <td>${u.email || ""}</td>
        <td>${u.role || ""}</td>
        <td>${u.created_at || ""}</td>
      </tr>
    `
    )
    .join("");
}

function renderDetail(user) {
  if (!user) {
    detailEl.innerHTML = "<p>Select a user from the table to see details.</p>";
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-label">User ID</div>
    <div class="detail-value">${user.id}</div>

    <div class="detail-label">Name</div>
    <div class="detail-value">${user.name || "—"}</div>

    <div class="detail-label">Email</div>
    <div class="detail-value">${user.email || "—"}</div>

    <div class="detail-label">Role</div>
    <div class="detail-value">${user.role || "—"}</div>

    <div class="detail-label">Created At</div>
    <div class="detail-value">${user.created_at || "—"}</div>
  `;
}

async function loadUsers() {
  const res = await API.get("/api/owner/users");
  if (!res.success || !res.data) return;

  allUsers = res.data.users || [];
  renderTable();
}

tableBody.addEventListener("click", e => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  const user = allUsers.find(u => u.id === id);
  renderDetail(user);
});

searchInput.addEventListener("input", renderTable);
roleSelect.addEventListener("change", renderTable);

loadUsers();
