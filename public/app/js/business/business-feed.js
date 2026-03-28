import API from "../api.js";

const list = document.getElementById("skater-feed");

async function loadFeed() {
  const data = await API.get("/api/feed/skaters");

  list.innerHTML = "";
  data.skaters.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.discipline}`;
    list.appendChild(li);
  });
}

loadFeed();
