import API from "/js/api.js";

function user() {
  return JSON.parse(localStorage.getItem("user") || "{}");
}

async function loadPayouts() {
  const headers = API.withUser(user());
  const res = await API.get("/api/owner/payouts", headers);

  if (!res.success) return console.error(res.error);

  const list = document.getElementById("payouts-list");
  list.innerHTML = "";

  (res.data || []).forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${p.user_name}</h3>
      <p>Amount: $${(p.amount_cents / 100).toFixed(2)}</p>
      <p>${p.created_at}</p>
    `;
    list.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadPayouts);
