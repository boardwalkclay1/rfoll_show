import API from "/js/api.js";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

async function loadAssets() {
  const user = getUser();
  const headers = API.withUser(user);

  const res = await API.get("/api/skater/branding-assets", headers);
  if (!res.success) {
    console.error("Failed to load branding assets", res.error);
    return;
  }

  const list = document.getElementById("branding-assets");
  list.innerHTML = "";

  (res.data || []).forEach(asset => {
    const div = document.createElement("div");
    div.className = "asset-item";
    div.innerHTML = `
      <div class="asset-thumb" style="background-image:url('${asset.asset_url}')"></div>
      <p>${asset.asset_type}</p>
    `;
    list.appendChild(div);
  });
}

function initCanvas() {
  const canvas = document.getElementById("branding-canvas");
  if (!canvas) return;
  canvas.innerHTML = `<div class="branding-placeholder">Branding canvas ready</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  initCanvas();
  loadAssets();
});
