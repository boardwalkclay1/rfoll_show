import API from "/js/api.js";

function user() {
  return JSON.parse(localStorage.getItem("user") || "{}");
}

async function loadOwnerAnalytics() {
  const headers = API.withUser(user());
  const res = await API.get("/api/owner/analytics", headers);

  if (!res.success) return console.error(res.error);

  const traffic = document.getElementById("analytics-traffic");
  const engagement = document.getElementById("analytics-engagement");

  traffic.innerHTML = JSON.stringify(res.data.traffic || {}, null, 2);
  engagement.innerHTML = JSON.stringify(res.data.engagement || {}, null, 2);
}

document.addEventListener("DOMContentLoaded", loadOwnerAnalytics);
