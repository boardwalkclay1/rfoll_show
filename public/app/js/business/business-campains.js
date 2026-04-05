import API from "/app/js/api.js";

export async function init() {
  const list = document.getElementById("business-campaign-list");
  const campaigns = await api("/business/campaigns/list");

  list.innerHTML = campaigns.map(c => `
    <div class="campaign-card">
      <h3>${c.title}</h3>
      <p>${c.description}</p>
      <p>Budget: $${(c.budget_cents / 100).toFixed(2)}</p>
    </div>
  `).join("");

  document.getElementById("create-campaign-btn").onclick = async () => {
    await api("/business/campaigns/create", { title: "New Campaign" });
    init();
  };
}
