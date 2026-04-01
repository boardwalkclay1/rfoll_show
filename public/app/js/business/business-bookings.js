import { api } from "/js/core/api.js";

export async function init() {
  const container = document.getElementById("business-bookings-container");
  const bookings = await api("/business/bookings/list");

  container.innerHTML = bookings.map(b => `
    <div class="booking-card">
      <h3>${b.skater_name}</h3>
      <p>${b.scheduled_start_time}</p>
      <p>Status: ${b.status}</p>
    </div>
  `).join("");
}
