import API from "/app/js/api.js";

function user() {
  return JSON.parse(localStorage.getItem("user") || "{}");
}

async function loadQR() {
  const headers = API.withUser(user());
  const res = await API.get("/api/qr", headers);

  if (!res.success) return console.error(res.error);

  const el = document.getElementById("qr-display");
  el.innerHTML = `<img src="${res.data.url}" class="qr-img" />`;
}

document.addEventListener("DOMContentLoaded", loadQR);
