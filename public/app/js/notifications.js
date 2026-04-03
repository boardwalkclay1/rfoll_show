import API from "/app/js/api.js";

const user = JSON.parse(localStorage.getItem("user") || "{}");

const listEl = document.getElementById("notifications-list");
const typeFilterEl = document.getElementById("notifications-type-filter");
const statusFilterEl = document.getElementById("notifications-status-filter");

async function loadNotifications() {
  const params = new URLSearchParams();
  if (typeFilterEl.value) params.set("type", typeFilterEl.value);
  if (statusFilterEl.value) params.set("status", statusFilterEl.value);

  const res = await API.get(`/api/notifications/list?${params.toString()}`, API.withUser(user));
  if (!res.success) {
    listEl.innerHTML = `<p class="empty">Error loading notifications.</p>`;
    return;
  }

  const items = res.data.notifications || [];
  if (!items.length) {
    listEl.innerHTML = `<p class="empty">No notifications.</p>`;
    return;
  }

  listEl.innerHTML = items.map(n => `
    <div class="notification-row ${n.read_at ? "read" : "unread"}" data-id="${n.id}" data-link="${n.link || ""}">
      <div class="notification-main">
        <div class="notification-title">${n.title}</div>
        <div class="notification-body">${n.body}</div>
      </div>
      <div class="notification-meta">
        <span class="notification-type">${n.type}</span>
        <span class="notification-time">${new Date(n.created_at).toLocaleString()}</span>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".notification-row").forEach(row => {
    row.addEventListener("click", async () => {
      const id = row.getAttribute("data-id");
      const link = row.getAttribute("data-link");

      await API.post("/api/notifications/mark-read", { id }, API.withUser(user));

      if (link) {
        window.location.href = link;
      } else {
        row.classList.remove("unread");
        row.classList.add("read");
      }
    });
  });
}

typeFilterEl.addEventListener("change", loadNotifications);
statusFilterEl.addEventListener("change", loadNotifications);

loadNotifications();
