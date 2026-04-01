import { api } from "/js/core/api.js";

export async function init() {
  const container = document.getElementById("business-analytics-container");
  const data = await api("/business/analytics/get");

  container.innerHTML = `
    <div class="analytics-block">
      <h3>Total Campaign Spend</h3>
      <p>$${(data.total_spend / 100).toFixed(2)}</p>
    </div>

    <div class="analytics-block">
      <h3>Active Campaigns</h3>
      <p>${data.active_campaigns}</p>
    </div>

    <div class="analytics-block">
      <h3>Sponsorships</h3>
      <p>${data.sponsorship_count}</p>
    </div>
  `;
}
