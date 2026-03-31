import API from "../api.js";

// INLINE REPLACEMENT FOR utils.js
function getUserIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

const userId = getUserIdFromQuery();

async function loadDashboard() {
  if (!userId) {
    console.error("No user ID in URL");
    document.getElementById("business-name").textContent = "Unknown Business";
    document.getElementById("business-revenue").textContent = "$0.00";
    document.getElementById("business-offers").innerHTML =
      "<li>Missing user ID in URL.</li>";
    return;
  }

  try {
    const data = await API.get(`/api/business/dashboard?user=${encodeURIComponent(userId)}`);

    document.getElementById("business-name").textContent = data.name;
    document.getElementById("business-revenue").textContent =
      `$${((data.revenue_cents || 0) / 100).toFixed(2)}`;

    const offers = document.getElementById("business-offers");
    offers.innerHTML = "";

    if (Array.isArray(data.offers) && data.offers.length > 0) {
      data.offers.forEach(offer => {
        const li = document.createElement("li");
        li.textContent = `${offer.title} — $${(offer.price_cents / 100).toFixed(2)}`;
        offers.appendChild(li);
      });
    } else {
      offers.innerHTML = "<li>No offers yet.</li>";
    }

  } catch (err) {
    console.error("Dashboard error:", err);

    if (err.message?.includes("<!DOCTYPE")) {
      document.getElementById("business-offers").innerHTML =
        "<li>Worker returned HTML instead of JSON — routing issue.</li>";
      return;
    }

    document.getElementById("business-offers").innerHTML =
      "<li>Failed to load dashboard.</li>";
  }
}

loadDashboard();
