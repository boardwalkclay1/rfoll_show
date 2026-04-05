import API from "/app/js/api.js";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

async function loadProfile() {
  const user = getUser();
  const headers = API.withUser(user);

  const res = await API.get("/api/skater/dashboard", headers);
  if (!res.success || !res.data) {
    console.error("Failed to load skater profile", res.error);
    return;
  }

  const { skater, shows, cards, music, feed } = res.data;

  document.getElementById("skater-name").textContent = skater.name;
  document.getElementById("skater-discipline").textContent =
    `${skater.discipline || ""} • ${skater.subclass || ""}`;
  document.getElementById("skater-location").textContent =
    skater.city && skater.state ? `${skater.city}, ${skater.state}` : "";

  document.getElementById("skater-bio").textContent = skater.bio || "";

  const avatar = document.getElementById("skater-avatar");
  avatar.style.backgroundImage = skater.avatar_url
    ? `url(${skater.avatar_url})`
    : "url(/assets/icons/default-avatar.png)";

  renderMiniList("profile-shows", shows, item => item.title);
  renderMiniList("profile-cards", cards, item => item.title);
  renderMiniList("profile-music", music, item => item.title || item.name);
  renderFeed("profile-feed", feed || []);
}

function renderMiniList(id, items, labelFn) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  (items || []).forEach(item => {
    const div = document.createElement("div");
    div.className = "mini-item";
    div.textContent = labelFn(item);
    el.appendChild(div);
  });
}

function renderFeed(id, items) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  (items || []).forEach(post => {
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      <div class="feed-header">
        <span>${post.author_name || "Skater"}</span>
        <span class="feed-time">${post.created_at || ""}</span>
      </div>
      <p>${post.content || ""}</p>
    `;
    el.appendChild(div);
  });
}

function bindActions() {
  const editBtn = document.getElementById("edit-profile-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.href = "/public/pages/skater/skater-intent.html";
    });
  }

  const bookBtn = document.getElementById("book-skater-btn");
  if (bookBtn) {
    bookBtn.addEventListener("click", () => {
      // could open booking modal or route to offerings
      window.location.href = "/public/pages/skater/skater-offerings.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  bindActions();
});
