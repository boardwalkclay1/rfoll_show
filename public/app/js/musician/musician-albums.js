import API from "/js/api.js";

function user() {
  return JSON.parse(localStorage.getItem("user") || "{}");
}

async function loadAlbums() {
  const headers = API.withUser(user());
  const res = await API.get("/api/musician/albums", headers);

  if (!res.success) return console.error(res.error);

  const list = document.getElementById("albums-list");
  list.innerHTML = "";

  (res.data || []).forEach(album => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${album.title}</h3>
      <p>${album.description || ""}</p>
      <p>${album.tracks_count || 0} tracks</p>
    `;
    list.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadAlbums);
