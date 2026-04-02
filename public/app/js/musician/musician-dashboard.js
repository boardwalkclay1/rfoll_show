import { apiGet } from "/app/js/utils.js";

async function loadMusicianDashboard() {
  try {
    const user = await apiGet("/api/auth/me");
    if (!user || user.role !== "musician") {
      window.location.href = "/login.html";
      return;
    }

    document.getElementById("musician-name").textContent = user.name;

    const profile = await apiGet("/api/musician/profile");
    const tracks = await apiGet("/api/musician/tracks");
    const collabs = await apiGet("/api/musician/collabs");
    const messages = await apiGet("/api/musician/messages");

    renderTracks(tracks);
    renderCollabs(collabs);
    renderMessages(messages);

  } catch (err) {
    console.error("Musician Dashboard Error:", err);
  }
}

function renderTracks(list) {
  const ul = document.getElementById("musician-tracks");
  ul.innerHTML = "";

  list.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} — ${t.length}s`;
    ul.appendChild(li);
  });
}

function renderCollabs(list) {
  const ul = document.getElementById("musician-collabs");
  ul.innerHTML = "";

  list.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.with_name} — ${c.status}`;
    ul.appendChild(li);
  });
}

function renderMessages(msgs) {
  const ul = document.getElementById("musician-messages");
  ul.innerHTML = "";

  msgs.forEach(m => {
    const li = document.createElement("li");
    li.textContent = `${m.sender_name}: ${m.content}`;
    ul.appendChild(li);
  });
}

loadMusicianDashboard();
// REMOVE LOADING SCREEN WHEN DASHBOARD IS READY
function hideMusicianLoader() {
  const loader = document.getElementById("musician-loading");
  if (loader) loader.classList.add("rs-hidden");
}

// Run when everything is loaded
window.addEventListener("DOMContentLoaded", () => {
  // Give the UI a moment to render
  setTimeout(hideMusicianLoader, 300);
});
