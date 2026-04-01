import API from "/js/api.js";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

async function loadOfferings() {
  const user = getUser();
  const headers = API.withUser(user);

  const res = await API.get("/api/skater/offerings", headers);
  if (!res.success) {
    console.error("Failed to load offerings", res.error);
    return;
  }

  const list = document.getElementById("offerings-list");
  list.innerHTML = "";

  (res.data || []).forEach(offering => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${offering.title}</h3>
      <p>${offering.description || ""}</p>
      <p>${offering.price_cents ? `$${(offering.price_cents / 100).toFixed(2)}` : ""}</p>
    `;
    list.appendChild(card);
  });
}

function bindCreate() {
  const btn = document.getElementById("add-offering-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const title = prompt("Offering title");
    if (!title) return;

    const user = getUser();
    const headers = API.withUser(user);

    const res = await API.post("/api/skater/offerings", { title }, headers);
    if (!res.success) {
      alert("Failed to create offering");
      return;
    }
    loadOfferings();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadOfferings();
  bindCreate();
});
