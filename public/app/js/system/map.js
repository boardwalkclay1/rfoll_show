import API from "/app/js/api.js";

function user() {
  return JSON.parse(localStorage.getItem("user") || "{}");
}

async function loadMap() {
  const headers = API.withUser(user());
  const res = await API.get("/api/map", headers);

  if (!res.success) return console.error(res.error);

  const map = document.getElementById("map-container");
  map.innerHTML = "";

  (res.data || []).forEach(loc => {
    const pin = document.createElement("div");
    pin.className = "map-pin";
    pin.style.left = loc.x + "%";
    pin.style.top = loc.y + "%";
    pin.title = loc.name;
    map.appendChild(pin);
  });
}

document.addEventListener("DOMContentLoaded", loadMap);
